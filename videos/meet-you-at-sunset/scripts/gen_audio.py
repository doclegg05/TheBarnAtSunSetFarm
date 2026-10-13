"""Generate narration, music and sound effects for the promo through ElevenLabs.

The API key is read from the macOS keychain (service ELEVENLABS_API_KEY) at run
time and never written anywhere.

    python3 scripts/gen_audio.py vo            # one mp3 per narration line
    python3 scripts/gen_audio.py sfx           # every sound effect in SFX
    python3 scripts/gen_audio.py music SECONDS # music bed, from a section plan

Outputs land in assets/audio/. Existing files are kept unless --force is given.
"""

import json
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.elevenlabs.io/v1"
OUT = Path(__file__).resolve().parent.parent / "assets" / "audio"
VOICE_ID = "cgSgspJ2msm6clMCkdW9"  # Jessica: playful, bright, warm (stock voice)
VO_MODEL = "eleven_multilingual_v2"

VO_LINES = [
    ("vo-01", "Three o'clock on Mount Nebo. The mountains are wide awake... and so are your nerves."),
    ("vo-02", "Your crew gets ready upstairs. Somebody already lost a shoe."),
    ("vo-03", "Then you say \"I do\"... with the whole valley as your witness."),
    ("vo-04", "The cedar doors swing open..."),
    ("vo-05", "and dinner is served for up to two hundred of your favorite people."),
    ("vo-06", "And then the sky shows off. It does that here."),
    ("vo-07", "When the last song plays, you don't have to go anywhere. Stay the night, right here on the farm."),
    ("vo-08", "The Barn at Sunset Farm. Meet you at sunset."),
]

SFX = {
    "sfx-birds": ("Gentle afternoon birdsong in a quiet mountain meadow, soft breeze, peaceful", 6.0),
    "sfx-tick": ("A single soft wooden clock tick followed by a tiny bright bell chime, clean, close", 1.0),
    "sfx-shutter": ("Instant camera shutter click and a polaroid photo sliding out, quick and crisp", 1.2),
    "sfx-cheer": ("Small outdoor wedding crowd cheering and clapping warmly after the vows, joyful", 3.5),
    "sfx-doors": ("Two heavy wooden barn doors creaking and rolling open on a metal track", 2.5),
    "sfx-clink": ("Champagne glasses clinking together with soft happy dinner chatter in the background", 3.0),
    "sfx-lights": ("A big vintage light switch clunk, then a soft magical twinkle as string lights turn on", 2.0),
    "sfx-crickets": ("Calm summer evening crickets and a distant whip-poor-will in the mountains", 8.0),
}

MUSIC_PLAN = {
    "positive_global_styles": [
        "warm acoustic folk-pop", "fingerpicked acoustic guitar", "soft piano",
        "romantic", "playful", "hopeful", "major key", "92 bpm", "instrumental",
    ],
    "negative_global_styles": ["vocals", "singing", "electronic drums", "synth bass", "dark", "aggressive"],
    "sections": [
        {"section_name": "Afternoon intro", "seconds": 7.0,
         "positive_local_styles": ["gentle fingerpicked guitar", "light piano notes", "airy", "anticipation"],
         "negative_local_styles": ["drums"]},
        {"section_name": "Getting ready and vows", "seconds": 11.6,
         "positive_local_styles": ["soft hand claps", "tambourine", "warm upright bass", "sweet and bouncy"],
         "negative_local_styles": ["loud"]},
        {"section_name": "Celebration build", "seconds": 8.0,
         "positive_local_styles": ["mandolin joins", "strings swell", "building energy", "joyful"],
         "negative_local_styles": []},
        {"section_name": "Golden hour chorus", "seconds": 13.8,
         "positive_local_styles": ["full band lift", "soaring strings", "sunlit", "euphoric but gentle"],
         "negative_local_styles": []},
        {"section_name": "Dusk outro", "seconds": 6.6,
         "positive_local_styles": ["slow down", "solo guitar and piano", "final held chord", "tender ending"],
         "negative_local_styles": ["abrupt stop"]},
    ],
}


def api_key() -> str:
    result = subprocess.run(
        ["security", "find-generic-password", "-s", "ELEVENLABS_API_KEY", "-w"],
        capture_output=True, text=True, check=True,
    )
    return result.stdout.strip()


def post(path: str, body: dict, out: Path) -> None:
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(body).encode(),
        headers={"xi-api-key": api_key(), "Content-Type": "application/json", "Accept": "audio/mpeg"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            out.write_bytes(resp.read())
    except urllib.error.HTTPError as err:
        detail = err.read().decode(errors="replace")[:500]
        raise SystemExit(f"{path} failed with HTTP {err.code}: {detail}") from err
    print(f"wrote {out.relative_to(OUT.parent.parent)}")


def gen_vo(force: bool) -> None:
    for i, (name, text) in enumerate(VO_LINES):
        out = OUT / f"{name}.mp3"
        if out.exists() and not force:
            continue
        body = {
            "text": text,
            "model_id": VO_MODEL,
            "previous_text": VO_LINES[i - 1][1] if i else None,
            "next_text": VO_LINES[i + 1][1] if i + 1 < len(VO_LINES) else None,
            "voice_settings": {"stability": 0.42, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True},
        }
        post(f"/text-to-speech/{VOICE_ID}?output_format=mp3_44100_192", body, out)


def gen_sfx(force: bool) -> None:
    for name, (prompt, seconds) in SFX.items():
        out = OUT / f"{name}.mp3"
        if out.exists() and not force:
            continue
        body = {"text": prompt, "duration_seconds": seconds, "prompt_influence": 0.5}
        post("/sound-generation?output_format=mp3_44100_192", body, out)


def music_plan(total_seconds: float) -> dict:
    """Scale each section's planned seconds so the plan sums to total_seconds."""
    planned = sum(sec["seconds"] for sec in MUSIC_PLAN["sections"])
    total_ms = int(total_seconds * 1000)
    sections, used = [], 0
    for i, sec in enumerate(MUSIC_PLAN["sections"]):
        is_last = i == len(MUSIC_PLAN["sections"]) - 1
        ms = total_ms - used if is_last else int(total_ms * sec["seconds"] / planned)
        used += ms
        sections.append({
            "section_name": sec["section_name"],
            "positive_local_styles": sec["positive_local_styles"],
            "negative_local_styles": sec["negative_local_styles"],
            "duration_ms": ms,
            "lines": [],
        })
    return {
        "positive_global_styles": MUSIC_PLAN["positive_global_styles"],
        "negative_global_styles": MUSIC_PLAN["negative_global_styles"],
        "sections": sections,
    }


def gen_music(total_seconds: float, force: bool) -> None:
    out = OUT / "music-bed.mp3"
    if out.exists() and not force:
        return
    plan = music_plan(total_seconds)
    (OUT / "music-plan.json").write_text(json.dumps(plan, indent=2))
    post("/music?output_format=mp3_44100_192", {"composition_plan": plan}, out)


def main(argv: list[str]) -> None:
    if not argv:
        raise SystemExit(__doc__)
    force = "--force" in argv
    args = [a for a in argv if a != "--force"]
    OUT.mkdir(parents=True, exist_ok=True)
    if args[0] == "vo":
        gen_vo(force)
    elif args[0] == "sfx":
        gen_sfx(force)
    elif args[0] == "music" and len(args) == 2:
        gen_music(float(args[1]), force)
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
