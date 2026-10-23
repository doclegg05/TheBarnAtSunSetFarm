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

For the page, the master got a light colour grade (ffmpeg `curves`,
`colorbalance`, saturation 0.94; no grain, which would bloat the frames). The
exact filter was not kept; `scripts/fitGrade.mjs` measured it against the
published frames on 2026-10-23 as a per-channel fit (gain 1.082, 1.088,
1.015; offset -10.3, -8.8, -8.3).

On 2026-10-23 the master was upscaled to 3840×2156 with Topaz Video Upscale,
model Proteus, 2x (node `EqTlrUE0lbUfmDZmDVO5`, generation
`MM9Q7KHkLIrIeDoi4wzg`). Rebuild the page frames from that 4K version with
`node scripts/filmFrames.mjs path/to/inside-4k.mp4 inside 12 --grade '{"gain":[1.082,1.088,1.015],"offset":[-10.3,-8.8,-8.3]}'`:
121 frames in five sets (sm 640, md 1024, lg 1920, xl 2560, and pt, an
upright 1080×1920 slice for screens held upright).

## Known differences from the real barn (Britt chose to keep this version)

- It opens close on the doors, with a cedar awning over them the real barn
  does not have, and the doors look hinged rather than sliding.
- The glass French doors at the end came out as solid white double doors,
  so the last caption says "To the porch" rather than naming them.
- The raw tour clips, restyled, remain the way to a fully faithful interior.
