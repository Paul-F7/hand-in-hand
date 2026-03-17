import cv2
import mediapipe as mp
import json
import re
import tempfile
import os


def _dump_json(data) -> str:
    """Indent JSON but keep [x, y] numeric pairs on a single line."""
    raw = json.dumps(data, indent=2)
    return re.sub(r'\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]', r'[\1, \2]', raw)
import subprocess

mp_face_mesh = mp.solutions.face_mesh
mp_hands = mp.solutions.hands

NOSE_TIP_IDX = 1  # MediaPipe face mesh index for nose tip


def _transcode_to_mp4(video_bytes: bytes, input_suffix: str) -> bytes:
    """Use ffmpeg to convert any video format to mp4 so OpenCV can decode it."""
    inp_path = None
    out_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=input_suffix) as inp:
            inp.write(video_bytes)
            inp_path = inp.name
        out_path = inp_path.replace(input_suffix, '_converted.mp4')
        result = subprocess.run(
            [
                'ffmpeg', '-y', '-i', inp_path,
                '-c:v', 'libx264', '-preset', 'ultrafast',
                '-an',          # drop audio — not needed for landmark extraction
                out_path
            ],
            capture_output=True,
            timeout=60,
        )
        if result.returncode != 0:
            raise ValueError(f"ffmpeg transcoding failed: {result.stderr.decode(errors='replace')}")
        with open(out_path, 'rb') as f:
            return f.read()
    finally:
        for p in (inp_path, out_path):
            if p and os.path.exists(p):
                os.remove(p)


def convert_video_to_json(word: str, video: bytes, suffix: str = '.mp4') -> str:
    """
    Convert video to JSON landmark string.

    Args:
        word: The ASL word being signed
        video: Video file content as bytes
        suffix: File extension to use for the temp file (e.g. '.mp4' or '.webm')

    Returns:
        JSON string containing landmark data
    """
    # Transcode non-mp4 formats (e.g. webm from browser) to mp4 so OpenCV can decode them
    if suffix != '.mp4':
        video = _transcode_to_mp4(video, suffix)
        suffix = '.mp4'

    # Write video bytes to a temporary file with the correct extension
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(video)
        temp_path = temp_file.name

    try:
        landmarks_json = _extract_landmarks(temp_path, word, frame_sample_rate=3)
        return landmarks_json
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def _extract_landmarks(video_path: str, word: str, frame_sample_rate: int = 3) -> str:
    """
    Extract hand landmarks + nose tip, sampled every frame_sample_rate frames.
    Each frame: hand pts as [x, y] arrays (2 dp) + single nose [x, y].
    """
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file")

    fps = cap.get(cv2.CAP_PROP_FPS)
    landmarks_data = []
    frame_count = 0
    frames_with_hands = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_sample_rate != 0:
            frame_count += 1
            continue

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results_hands = hands.process(rgb)
        results_face = face_mesh.process(rgb)

        if results_hands.multi_hand_landmarks:
            frame_data = {'hands': []}
            for hand_idx, hand_landmarks in enumerate(results_hands.multi_hand_landmarks):
                handedness = results_hands.multi_handedness[hand_idx].classification[0].label
                frame_data['hands'].append({
                    'side': handedness[0],
                    'pts': [[round(lm.x, 2), round(lm.y, 2)] for lm in hand_landmarks.landmark]
                })

            if results_face.multi_face_landmarks:
                lm = results_face.multi_face_landmarks[0].landmark[NOSE_TIP_IDX]
                frame_data['nose'] = [round(lm.x, 2), round(lm.y, 2)]

            landmarks_data.append(frame_data)
            frames_with_hands += 1

        frame_count += 1

    cap.release()
    hands.close()
    face_mesh.close()

    if frames_with_hands == 0:
        raise ValueError("No hands detected in video")

    output_data = {
        'word': word,
        'fps': round(fps, 2),
        'frame_sample_rate': frame_sample_rate,
        'frames': landmarks_data
    }

    return _dump_json(output_data)