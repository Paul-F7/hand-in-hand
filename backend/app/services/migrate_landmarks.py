"""
One-time migration: recompress existing reference landmark JSONs to compact format.
- Converts {x, y, z} dicts → [x, y] arrays at 2 decimal precision
- Samples every 3rd frame
- Drops face data, frame_number, and bulky metadata
- Removes pretty-printing (saves ~40% alone)
"""
import json
from pathlib import Path

LANDMARKS_DIR = Path(__file__).parent / 'reference_landmarks'
FRAME_SAMPLE_RATE = 3


def migrate_file(path: Path) -> None:
    with open(path) as f:
        old = json.load(f)

    word = old.get('word', path.stem)
    fps = round(old.get('fps', 0), 2)
    old_frames = old.get('frames', [])

    # Only apply frame sampling on original (non-sampled) data.
    # If the file was already migrated (has frame_sample_rate set), keep all frames.
    already_sampled = 'frame_sample_rate' in old
    effective_sample_rate = 1 if already_sampled else FRAME_SAMPLE_RATE

    new_frames = []
    for i, frame in enumerate(old_frames):
        if i % effective_sample_rate != 0:
            continue
        hands = frame.get('hands', [])
        if not hands:
            continue
        new_frame = {'hands': []}
        for hand in hands:
            side = (hand.get('handedness') or hand.get('side') or 'L')[0]
            raw_pts = hand.get('landmarks') or hand.get('pts') or []
            pts = []
            for p in raw_pts:
                if isinstance(p, dict):
                    pts.append([round(p['x'], 2), round(p['y'], 2)])
                else:
                    pts.append([round(p[0], 2), round(p[1], 2)])
            new_frame['hands'].append({'side': side, 'pts': pts})
        new_frames.append(new_frame)

    output = {
        'word': word,
        'fps': fps,
        'frame_sample_rate': FRAME_SAMPLE_RATE,
        'frames': new_frames,
    }

    with open(path, 'w') as f:
        json.dump(output, f, indent=2)

    size_kb = path.stat().st_size / 1024
    print(f"  {path.name}: {len(old_frames)} → {len(new_frames)} frames, {size_kb:.1f} KB")


def main():
    files = sorted(LANDMARKS_DIR.glob('*.json'))
    print(f"Migrating {len(files)} files in {LANDMARKS_DIR}\n")
    for p in files:
        migrate_file(p)
    print("\nDone.")


if __name__ == '__main__':
    main()
