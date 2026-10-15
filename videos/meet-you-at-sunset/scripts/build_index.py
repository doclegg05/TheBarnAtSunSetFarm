"""Write the root index.html for the 16:9 master or the 9:16 social cut.

Both cuts share one scene and audio plan. The 9:16 cut lives in a sibling
project (../meet-you-at-sunset-vertical) whose compositions/ and assets/ are
symlinks to this project's, because a project may hold only one root.

    python3 scripts/build_index.py            # index.html, 1920x1080
    python3 scripts/build_index.py vertical   # ../meet-you-at-sunset-vertical/index.html, 1080x1920
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERTICAL = ROOT.parent / "meet-you-at-sunset-vertical"
DURATION = 47.0

# (id, file, start, duration, z-index)
SCENES = [
    ("f01", "01-afternoon", 0.0, 7.0, 1),
    ("f02", "02-getting-ready", 7.0, 4.8, 2),
    ("f03", "03-i-do", 11.8, 6.2, 3),
    ("f04", "04-cedar-doors", 18.0, 3.4, 5),
    ("f05", "05-dinner", 20.6, 5.0, 4),
    ("f06", "06-golden-hour", 25.6, 6.0, 6),
    ("f07", "07-stay-the-night", 31.6, 8.4, 7),
    ("f08", "08-close", 39.5, 7.5, 8),
]

# (id, file, start, duration, volume)
AUDIO = [
    ("music", "music-bed", 0.0, DURATION, 0.55),
    ("vo1", "vo-01", 0.8, 5.76, 1.0),
    ("vo2", "vo-02", 7.3, 4.23, 1.0),
    ("vo3", "vo-03", 12.1, 4.6, 1.0),
    ("vo4", "vo-04", 18.3, 2.23, 1.0),
    ("vo5", "vo-05", 20.6, 4.09, 1.0),
    ("vo6", "vo-06", 26.6, 3.39, 1.0),
    ("vo7", "vo-07", 32.4, 7.15, 1.0),
    ("vo8", "vo-08", 42.2, 3.2, 1.0),
    ("sfx-birds", "sfx-birds", 0.0, 6.0, 0.35),
    ("sfx-cheer", "sfx-cheer", 15.85, 3.48, 0.55),
    ("sfx-doors", "sfx-doors", 20.3, 2.48, 0.6),
    ("sfx-clink", "sfx-clink", 23.8, 3.0, 0.5),
    ("sfx-lights", "sfx-lights", 31.6, 2.0, 0.65),
    ("sfx-crickets", "sfx-crickets", 33.0, 8.0, 0.3),
]
TICKS = [6.95, 11.75, 17.95, 20.55, 25.55, 31.55]
SHUTTERS = [(7.15, 0.35), (7.55, 0.35), (7.95, 0.35), (9.75, 0.4), (14.4, 0.3), (14.75, 0.3)]


def audio_rows() -> list[tuple]:
    ticks = [(f"sfx-tick-{i + 1}", "sfx-tick", t, 1.0, 0.5) for i, t in enumerate(TICKS)]
    shutters = [(f"sfx-shutter-{i + 1}", "sfx-shutter", t, 1.2, v) for i, (t, v) in enumerate(SHUTTERS)]
    return AUDIO + ticks + shutters


def audio_group(audio_id: str) -> str:
    """One group per role, so the carve can name the voiceover group, not clip ids."""
    if audio_id == "music":
        return "music"
    return "voiceover" if audio_id.startswith("vo") else "sfx"


def build(width: int, height: int) -> str:
    scenes = "\n".join(
        f'      <div id="{sid}" class="scene" style="z-index: {z}" data-composition-id="{sid}" '
        f'data-composition-src="compositions/frames/{name}.html" data-start="{start}" data-duration="{dur}" '
        f'data-track-index="{i + 1}" data-width="{width}" data-height="{height}"></div>'
        for i, (sid, name, start, dur, z) in enumerate(SCENES)
    )
    audio = "\n".join(
        f'      <audio id="{aid}" src="assets/audio/{name}.mp3" data-start="{start}" data-duration="{dur}" '
        f'data-track-index="{20 + i}" data-volume="{vol}" data-audio-group="{audio_group(aid)}"></audio>'
        for i, (aid, name, start, dur, vol) in enumerate(audio_rows())
    )
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={width}, height={height}" />
    <title>Meet You at Sunset · The Barn at Sunset Farm</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/brand.css" />
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: {width}px; height: {height}px; overflow: hidden; background: #2b2b2d; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; }}
      #bg {{ position: absolute; inset: 0; background: #2b2b2d; }}
      .scene {{ position: absolute; inset: 0; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="{width}" data-height="{height}" data-duration="{DURATION}">
      <div id="bg"></div>
{scenes}
      <div id="overlay" class="scene" style="z-index: 50" data-composition-id="overlay" data-composition-src="compositions/overlay.html" data-start="0" data-duration="40" data-track-index="10" data-width="{width}" data-height="{height}"></div>
{audio}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
"""


def main(argv: list[str]) -> None:
    vertical = bool(argv) and argv[0] == "vertical"
    if vertical:
        out = VERTICAL / "index.html"
        out.write_text(build(1080, 1920))
    else:
        out = ROOT / "index.html"
        out.write_text(build(1920, 1080))
    print(f"wrote {out.relative_to(ROOT.parent)}")


if __name__ == "__main__":
    main(sys.argv[1:])
