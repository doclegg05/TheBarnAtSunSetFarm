# Pilot: the cedar doors open (approach B)

A 10-second test of approach B from `../SHOTLIST.md`: a simple 3D model of
the barn sets the camera path and layout, and Runway Aleph paints realism on
top. Generated in the ElevenLabs Flow `cVL5HnqV4TQcJdQQJW1K`.

| Piece                                | How                                  | ID                           |
| ------------------------------------ | ------------------------------------ | ---------------------------- |
| Guide render (10 s, 24 fps)          | `barn_doors.py`, Blender 5.2, Cycles | asset `c9GkFI6AjjZILjbrrkMv` |
| Realistic first frame                | gpt-image-2.5-sunburst over frame 1  | `LU5m5pJhlxnNParBwFqc`       |
| **Realism pass (1920×1080, 24 fps)** | runway-aleph2, about 16,900 credits  | `UYuivkcFlFMJR3rtaiN7`       |

## Rebuilding the guide render

```sh
pip install bpy==5.2.2          # in a venv; Python 3.13
python barn_doors.py CYCLES 1 241 "$PWD/render/f_" 75 -2.5 10 2
ffmpeg -framerate 12 -pattern_type glob -i 'render/f_*.png' \
  -vf "minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=1280:720,format=yuv420p" \
  -c:v libx264 -crf 16 guide.mp4
```

That renders every second frame at 960×540 (about 12 s a frame on a cloud
CPU, 25 minutes in all) and motion-interpolates back to 24 fps.

## What the pilot showed

- The camera path, door timing and building layout came through exactly as
  modelled, with no angle drift and no cuts (the two problems in the
  descent). No flicker spikes frame to frame.
- The exterior matches the real barn closely.
- The interior is the model's guess, not the real floor plan: Aleph made the
  far wall's French doors into black doors and the pine darker than the
  real space. Both are fixed by modelling the real interior from the tour
  footage and naming them in the prompt.

## Round 2: the real reception hall

Britt confirmed (2026-10-19) that the cedar doors open straight into the main
reception hall. The hall in `barn_doors.py` is now modelled on the winter
walkthrough (`public/videos/TheBarnAtSunsetFarm_Walkthrough_Winter.mp4`,
about 1:06–1:26): pale unstained knotty pine walls and ceiling, a flat
ceiling that slopes down to the side walls, two rows of square pine posts
under beams, grey concrete floor, three wagon-wheel chandeliers with black
ceiling fans between them, white side doors, and white-framed glass French
doors with a window each side on the far wall. The far-wall openings are now
real openings with daylight behind them; in round 1 the glass rendered dark,
which is why Aleph painted black doors there.

Result: runway-aleph2 generation `5Vf41qTpyp6MBSVjkqaR` (about 16,900
credits; Aleph prompts must stay under 1,000 characters, and a first attempt
over the limit failed without generating). The pale knotty pine, glowing
French doors and windows and wagon-wheel chandeliers now match the real
hall, with no flicker spikes. Still off: the concrete floor came out dark
charcoal instead of light grey, and the slope where the ceiling meets the
walls was read as diagonal braces. Next fixes: a lighter floor in the model
and a ceiling edge that cannot be mistaken for a brace.

## Round 3: the hall from Britt's floor plan

The hall in `barn_doors.py` now follows the confirmed ground-floor plan
(`../ground-floor.png`): about 9 m deep, a plain back wall to the house with
a white door at the porch end, white French doors with a window each side
opening to the porch at the front left, and a cased opening on the right
into the restroom hallway. The camera now ends turning left toward the
French doors and the porch, which leads into the porch and lawn chapter.
Photos of the back porch from outside are in `../reference/`.

Result: runway-aleph2 generation `biDbyU1RqvVTvUHSW8EJ` (about 17,000
credits). The hall now matches the floor plan's shape: a shallower room, the
white door on the back wall, and the turn ending on white French doors and
windows with the porch and lawn beyond. The floor is a mid grey rather than
charcoal. No flicker: the larger frame-to-frame changes at 8.9–9.0 s follow
the fast turn in the guide. Still off: Aleph again adds timber rafters and
diagonal braces at the ceiling edges, makes the pine walls horizontal boards,
and shows daylight through the restroom-hallway opening on the right.
