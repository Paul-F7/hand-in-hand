import cv2
import mediapipe as mp
import json
import re
from pathlib import Path


def _dump_json(data) -> str:
    """Indent JSON but keep [x, y] numeric pairs on a single line."""
    raw = json.dumps(data, indent=2)
    return re.sub(r'\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]', r'[\1, \2]', raw)

SCRIPT_DIR = Path(__file__).parent
REFERENCE_VIDEOS_DIR = SCRIPT_DIR / 'reference_videos'
REFERENCE_LANDMARKS_DIR = SCRIPT_DIR / 'reference_landmarks'

mp_face_mesh = mp.solutions.face_mesh
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

NOSE_TIP_IDX = 1  # MediaPipe face mesh index for nose tip


def extract_landmarks_from_video(video_path, word, show_preview=True, frame_sample_rate=3, **_kwargs):
    """
    Extract hand landmarks + nose tip, sampled every frame_sample_rate frames.
    Each frame stores hand pts as [x, y] arrays (2 dp) and a single nose [x, y].
    """
    print(f"\n{'='*60}")
    print(f"Extracting: {word}  (sample every {frame_sample_rate} frames)")
    print(f"{'='*60}\n")

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

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"Error: Could not open {video_path}")
        return None

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"FPS: {fps:.2f}, Total frames: {total_frames}")

    landmarks_data = []
    frame_count = 0
    frames_saved = 0

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

        if not results_hands.multi_hand_landmarks:
            frame_count += 1
            continue

        frame_data = {'hands': []}

        for hand_idx, hand_landmarks in enumerate(results_hands.multi_hand_landmarks):
            handedness = results_hands.multi_handedness[hand_idx].classification[0].label
            frame_data['hands'].append({
                'side': handedness[0],
                'pts': [[round(lm.x, 2), round(lm.y, 2)] for lm in hand_landmarks.landmark]
            })
            if show_preview:
                mp_drawing.draw_landmarks(
                    frame, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style()
                )

        # Single nose tip for face-relative position reference
        if results_face.multi_face_landmarks:
            lm = results_face.multi_face_landmarks[0].landmark[NOSE_TIP_IDX]
            frame_data['nose'] = [round(lm.x, 2), round(lm.y, 2)]

        landmarks_data.append(frame_data)
        frames_saved += 1
        frame_count += 1

        if show_preview:
            cv2.putText(frame, f"Frame {frame_count}/{total_frames}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.imshow("Processing (Q to skip)", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                show_preview = False
                cv2.destroyAllWindows()

    cap.release()
    hands.close()
    face_mesh.close()
    if show_preview:
        cv2.destroyAllWindows()

    print(f"\nDone. Frames saved: {frames_saved}")

    if frames_saved == 0:
        print("WARNING: No hands detected!")
        return None

    output_data = {
        'word': word,
        'fps': round(fps, 2),
        'frame_sample_rate': frame_sample_rate,
        'frames': landmarks_data
    }

    REFERENCE_LANDMARKS_DIR.mkdir(exist_ok=True)
    output_path = REFERENCE_LANDMARKS_DIR / f'{word}.json'
    with open(output_path, 'w') as f:
        f.write(_dump_json(output_data))

    print(f"Saved: {output_path}  ({output_path.stat().st_size / 1024:.1f} KB)")
    return str(output_path)


def extract_multiple_videos(video_folder=None, frame_sample_rate=3):
    if video_folder is None:
        video_folder = REFERENCE_VIDEOS_DIR
    else:
        video_folder = Path(video_folder)

    if not video_folder.exists():
        print(f"Folder not found: {video_folder}")
        return

    video_files = (
        list(video_folder.glob('*.mp4')) +
        list(video_folder.glob('*.avi')) +
        list(video_folder.glob('*.mov'))
    )
    if not video_files:
        print(f"No video files found in {video_folder}")
        return

    print(f"\nFound {len(video_files)} video(s)")
    for video_path in video_files:
        extract_landmarks_from_video(str(video_path), video_path.stem,
                                     show_preview=False, frame_sample_rate=frame_sample_rate)

    print("\nAll videos processed.")


if __name__ == "__main__":
    extract_multiple_videos(frame_sample_rate=3)
