# Full-page film: shot list (draft for Britt's approval)

One continuous camera journey behind the whole `/experience` page, from the
sky at first light to a starry night, replacing the 3D background. It never
cuts: down from the sky, through the cedar doors, through the barn, out onto
the porch, down to the ceremony lawn, then sunset, string lights and stars.
Venue and setting only: no people. Labelled "Artistic rendering".

| #   | Chapter                  | Time of day      | Behind these sections        | Length |
| --- | ------------------------ | ---------------- | ---------------------------- | ------ |
| 0   | The descent (done)       | Dawn             | Arrive, opening title        | 18 s   |
| 1   | The doors open           | Morning          | Our story, The day           | ~12 s  |
| 2   | Through the barn         | Late morning     | The barn, Amenities          | ~15 s  |
| 3   | The ceremony lawn        | Golden hour      | Stay the night, Packages     | ~12 s  |
| 4   | Sunset into string light | Sunset into dusk | Planning, Explore the region | ~12 s  |
| 5   | Stars over the hilltop   | Night            | Questions, Inquire, Finale   | ~12 s  |

About 80 seconds in all, streamed one chapter at a time. The page's
time-of-day colours will be retuned to match the film.

## The shots

**1. The doors open (morning).** Picks up at the cedar doors where the
descent ends. The big sliding doors roll open and morning light pours in as
the camera moves inside. The doors open straight into the main reception
hall (confirmed by Britt).

**2. Through the barn (late morning).** A slow walk through the floor space
in the order guests experience it, ending at the doors onto the wraparound
porch, with the mountains framed beyond the porch posts.
_Needs from Britt:_ interior photos in walking order, starting just inside
the cedar doors and ending on the porch (and a rough floor-plan sketch if
there is one).

**3. The ceremony lawn (golden hour).** Out across the porch, down the
steps and onto the lawn, gliding toward the wooden arbor and the rows of
white chairs that face the mountains, with long golden shadows.

**4. Sunset into string light (sunset into dusk).** The camera turns back
toward the barn as the sun drops behind the ridges and the sky goes
purple-orange. The porch string lights come on.

**5. Stars over the hilltop (night).** The camera rises slowly up and away.
The windows glow under a sky full of stars, with fireflies over the lawn. It
ends on a wide, still frame behind the inquiry form and finale.

## The look

- One colour grade across every chapter, light film grain, a soft vignette.
- Text sections get a subtle shaded backing so copy stays crisp over motion.
- Chapters behind long text move slowly; the big moments move more.

## Two ways to make it

**A. AI video from photos (how the descent was made).** Keyframes generated
from the real photos, then Veo 3.1 clips chained frame to frame. Strong on
landscape, light and atmosphere. Weak points, all seen in the descent: the
camera angle can wander between clips, joins need care, and anything not in
a photo (an interior route, say) gets invented.

**B. 3D model as a guide, AI for the realism (proposed pilot).** A simple 3D
model of the barn, porch, lawn and arbor, built to the real proportions,
with one continuous camera path through the whole film and the sun moving
from dawn to night. That render goes through Runway Aleph with the real
photos as the style guide, which keeps every camera move and the building's
layout exactly as modelled and paints realism on top. It fixes the angle
changes and cuts at the source and keeps the interior true to the real floor
plan. Aleph takes up to 30 seconds per pass; passes overlap and blend over
identical geometry, so the seams don't show.

The pilot: model the barn exterior from the photos and render about
10 seconds (the doors opening into the first part of the interior), run it
through Aleph, and compare it with approach A before committing either way.

## Rough cost

- Approach A: about 20,000–35,000 credits per chapter, roughly $17–30 for
  all five.
- Approach B: Aleph costs about 1,700 credits per second of film, roughly
  $22–30 for the whole film plus tests; the pilot is about 17,000 credits
  (about $3).

Exact costs are checked before every run.
