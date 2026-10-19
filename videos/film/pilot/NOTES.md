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
