"""
Gemini API integration for ASL sign language evaluation.
No caching - sends full prompt on each request.
"""
import json
import os
from pathlib import Path
from typing import Optional, Any, Dict

from dotenv import load_dotenv
from google import genai

from ..schemas.evaluation import EvaluationResponse


load_dotenv(Path(__file__).parents[2] / ".env", override=True)
API_KEY = os.getenv("GEMINI_API_KEY", "")

client = genai.Client(api_key=API_KEY)

CONTEXT_PATH = Path(__file__).parent / "context" / "prompt.json"
with open(CONTEXT_PATH, "r") as f:
    GLOBAL_CONTEXT = json.load(f)


def _strip_code_fences(text: str) -> str:
    t = (text or "").strip()
    if t.startswith("```"):
        t = t.replace("```json", "").replace("```", "").strip()
    return t


def _extract_largest_json_object(text: str) -> Optional[str]:
    t = _strip_code_fences(text)
    start = t.find("{")
    end = t.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    candidate = t[start : end + 1]
    # Remove control characters that break JSON parsing (except \n \r \t)
    import re
    candidate = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', candidate)
    return candidate


def _ensure_points(obj: Any) -> Dict[str, list]:
    """
    pros/cons can come back as:
    - {"points": ["..."]}
    - ["..."]
    - "..."
    Normalize to {"points": [..]}.
    """
    if isinstance(obj, dict) and isinstance(obj.get("points"), list):
        return {"points": [str(x) for x in obj["points"]][:3]}

    if isinstance(obj, list):
        return {"points": [str(x) for x in obj][:3]}

    if isinstance(obj, str) and obj.strip():
        return {"points": [obj.strip()[:120]]}

    return {"points": []}


def _normalize_eval_payload(json_data: dict, *, word_hint: str, raw: str) -> dict:
    """
    Normalize Gemini JSON to match EvaluationResponse expected fields.
    Handles both:
      { overall_score_0_to_4, summary, pros, cons }
    and:
      { evaluation: { ... } }
    """
    data = dict(json_data)

    # If Gemini wrapped it as {"evaluation": {...}}, flatten it.
    if isinstance(data.get("evaluation"), dict):
        inner = data.pop("evaluation")
        for k, v in inner.items():
            if k not in data:
                data[k] = v

    # Ensure required top-level fields exist
    data.setdefault("word", word_hint or "unknown")
    data.setdefault("video_path", data.get("videoPath", "") or "")

    # Coerce score
    score = data.get("overall_score_0_to_4", 0)
    try:
        score = int(score)
    except Exception:
        score = 0
    if score < 0:
        score = 0
    if score > 4:
        score = 4
    data["overall_score_0_to_4"] = score

    # Summary
    summary = data.get("summary", "")
    if not isinstance(summary, str) or not summary.strip():
        summary = "We couldn’t score this attempt reliably. Please try again."
    data["summary"] = summary.strip()[:400]

    # Pros/cons normalize
    data["pros"] = _ensure_points(data.get("pros"))
    data["cons"] = _ensure_points(data.get("cons"))

    # Raw model output for debugging UI/logs
    data["raw_model_output"] = (data.get("raw_model_output") or raw or "")[:1500]

    return data


def _fallback_response(*, word: str, video_path: str = "", reason: str, raw: str) -> EvaluationResponse:
    payload = {
        "word": word or "unknown",
        "video_path": video_path or "",
        "overall_score_0_to_4": 0,
        "summary": "We couldn’t score this attempt reliably. Please try again.",
        "pros": {"points": ["Recording received."]},
        "cons": {"points": [reason[:120]]},
        "raw_model_output": (raw or "")[:1500],
    }
    return EvaluationResponse(**payload)


def parse_gemini_json_response(response_text: str, *, word_hint: str = "", video_path: str = "") -> EvaluationResponse:
    raw = response_text or ""
    candidate = _extract_largest_json_object(raw)

    if candidate is None:
        return _fallback_response(
            word=word_hint,
            video_path=video_path,
            reason="Gemini response contained no JSON object.",
            raw=raw,
        )

    try:
        json_data = json.loads(candidate)
    except Exception:
        # Second attempt: strip all newlines/tabs inside string values
        import re as _re
        cleaned = _re.sub(r'[\r\n\t]+', ' ', candidate)
        try:
            json_data = json.loads(cleaned)
        except Exception as e:
            return _fallback_response(
                word=word_hint,
                video_path=video_path,
                reason=f"Failed to parse Gemini JSON: {e}",
                raw=raw,
            )

    if not isinstance(json_data, dict):
        return _fallback_response(
            word=word_hint,
            video_path=video_path,
            reason="Gemini returned JSON that was not an object.",
            raw=raw,
        )

    try:
        normalized = _normalize_eval_payload(json_data, word_hint=word_hint, raw=raw)
        # keep the video path if caller provides it
        if video_path:
            normalized["video_path"] = video_path
        return EvaluationResponse(**normalized)
    except Exception as e:
        return _fallback_response(
            word=word_hint,
            video_path=video_path,
            reason=f"Response validation failed: {e}",
            raw=raw,
        )


def get_gemini_response(demonstrator_json: str, user_attempt_json: str) -> EvaluationResponse:
    # Always define word_hint first so it's available everywhere
    word_hint = ""
    try:
        attempt_obj = json.loads(user_attempt_json)
        if isinstance(attempt_obj, dict):
            word_hint = str(attempt_obj.get("word", "")).strip()
    except Exception:
        pass

    system_instruction = f"""
{GLOBAL_CONTEXT.get('task','')}

CONTEXT:
- Domain: {GLOBAL_CONTEXT['context']['domain']}
- Description: {GLOBAL_CONTEXT['context']['description']}
- Data Type: {GLOBAL_CONTEXT['context']['data_type']}

INPUT CONTRACT:
- Demonstrator Key: {GLOBAL_CONTEXT['input_contract']['demonstrator_key']}
- User Attempt Key: {GLOBAL_CONTEXT['input_contract']['user_attempt_key']}
- Alignment: {GLOBAL_CONTEXT['input_contract']['alignment']}

JUDGING RULES:
- Primary Principle: {GLOBAL_CONTEXT['judging_rules']['primary_principle']}
- Limitations: {', '.join(GLOBAL_CONTEXT['judging_rules']['limitations'])}

JUDGING RUBRIC:
{json.dumps(GLOBAL_CONTEXT['judging_rubric'], indent=2)}

OUTPUT REQUIREMENTS:
{json.dumps(GLOBAL_CONTEXT['output_format'], indent=2)}
"""

    prompt = f"""
{system_instruction}

DATA TO EVALUATE:

Demonstrator (correct execution):
{demonstrator_json}

User Attempt (to be evaluated):
{user_attempt_json}

Return ONLY a single JSON object. No markdown. No extra text.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        text = getattr(response, "text", None)
        if not text:
            text = str(response)

        return parse_gemini_json_response(text or "", word_hint=word_hint)

    except Exception as e:
        return _fallback_response(
            word=word_hint,
            reason=f"Gemini API call failed: {e}",
            raw="",
        )