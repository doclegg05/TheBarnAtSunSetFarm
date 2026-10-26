# The walk into the barn (/experience)

The scroll film just before the Barn chapter: the cedar doors slide open and
the camera walks into the reception hall, ending on the doors to the porch.
It is an **AI-generated artistic rendering**, labelled that way on the page.

## Where it comes from

All in the ElevenLabs Flow `cVL5HnqV4TQcJdQQJW1K`.

| Step                                                    | How                             | ID                           |
| ------------------------------------------------------- | ------------------------------- | ---------------------------- |
| 3D guide of the doors and hall, from Britt's floor plan | `pilot/barn_doors.py` (Blender) | asset `pwC7pOYRcFtepN1rz9Kt` |
| Realism pass over the guide                             | runway-aleph2                   | `biDbyU1RqvVTvUHSW8EJ`       |
| **Master: second pass matched to real photos (1080p)**  | bytedance-seedance-v2.5-edit-us | `4agbwPzzJfO3pojAqHpi`       |

The Seedance pass used three real reference photos: the wide hall and the
French doors from the winter walkthrough
(`public/videos/TheBarnAtSunsetFarm_Walkthrough_Winter.mp4` at 1:10 and
1:22), and the white door to the house (0:28).

For the page, the master gets a light colour grade (ffmpeg `curves`,
`colorbalance`, saturation 0.94; no grain, which would bloat the frames) and
is cut into frames with
`node scripts/filmFrames.mjs path/to/master.mp4 inside 12`: 121 frames,
1.4 MB at 1024 px and 0.8 MB at 640 px.

## Known differences from the real barn (Britt chose to keep this version)

- It opens close on the doors, with a cedar awning over them the real barn
  does not have, and the doors look hinged rather than sliding.
- The glass French doors at the end came out as solid white double doors,
  so the last caption says "To the porch" rather than naming them.
- The raw tour clips, restyled, remain the way to a fully faithful interior.
