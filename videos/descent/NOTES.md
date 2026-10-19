# Opening descent (/experience)

The scroll-driven drone descent at the top of `/experience`. It is an
**AI-generated artistic rendering**, not real drone footage, and the page
labels it that way.

## Where it comes from

Everything was generated in one ElevenLabs Flow, "Barn at Sunset Farm – space
dive test" (`cVL5HnqV4TQcJdQQJW1K`), from the real venue photos.

| Piece                                        | Model                  | Generation             |
| -------------------------------------------- | ---------------------- | ---------------------- |
| Start frame (high aerial)                    | gemini-3-pro-image     | `Pd8Q8zO0dOrjHHMB4vzF` |
| Mid frame (150 m, front-left)                | gemini-3-pro-image     | `rWkXpViAmqZ7BxEuBRXS` |
| End frame (low sunrise)                      | gemini-3-pro-image     | `mq4Mzfvv176rRJQpHPal` |
| Clip A: drop and tilt (0–4.75 s used)        | veo-3.1-generate-001   | `LDnNBT2ZMNMkcTtl8sX9` |
| Clip C: orbit to front-left (0–6.25 s used)  | veo-3.1-generate-001   | `DBfT3G6RUtT7IQcdsHXV` |
| Clip D: final approach (0–7.3 s used)        | veo-3.1-generate-001   | `ehzgaK2Cc1CTdLCCjkvP` |
| Grass keyframe                               | gpt-image-2.5-sunburst | `016McNf5qOut0073atBv` |
| **Master: grass pass over the stitched cut** | runway-aleph2          | `mpbVT4qtXrejXILSZf8j` |

The master (18.6 s, 1920×1080, 24 fps) is downloadable from that generation
in ElevenLabs. Rebuild the page frames from it with
`node scripts/filmFrames.mjs path/to/master.mp4 descent 10`.

## How the stitch is put together

| Time in master | Source                                                         | Note                                                                      |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 0.00–4.75 s    | Clip A frames 0–113                                            |                                                                           |
| 4.75–11.0 s    | Clip C frames 0–149                                            | Join 1 at 4.75 s: the camera stops tilting and starts orbiting            |
| 11.0–13.0 s    | Clip D frames 0–47, sped up from 2× to 1×                      | Join 2 at 11.0 s; replaced the shot where the ground "swallowed" the barn |
| 13.0–16.8 s    | Clip D frames 48–139                                           |                                                                           |
| 16.8–18.6 s    | Clip D frames 140–176, motion-interpolated and eased to a stop | Clip D's last half second snapped back to a wide shot and was cut         |

## Open issues (Britt, 2026-10-19): marked, not yet regenerated

- **Drone angle changes.** The camera's angle shifts in a way a real drone
  would not. Most likely at join 1 (4.75 s, tilt turns into orbit) and join 2
  (11.0 s, orbit turns into straight approach).
- **A cut at the very end.** Most likely where clip D's tail was trimmed and
  slowed (about 16.8 s onward), or the descent simply stopping.
- Decision pending: judge how noticeable these are on the live page before
  spending credits on a regeneration.
