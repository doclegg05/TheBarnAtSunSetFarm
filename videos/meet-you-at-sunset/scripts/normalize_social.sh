#!/usr/bin/env bash
# Two-pass loudness normalization to -14 LUFS / -1.5 dBTP (Instagram, TikTok,
# YouTube). The video stream is copied untouched.
#   scripts/normalize_social.sh renders/meet-you-at-sunset-16x9.mp4 [more.mp4 ...]
set -euo pipefail
for src in "$@"; do
  out="${src%.mp4}-social.mp4"
  stats=$(ffmpeg -nostats -i "$src" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  measured=$(python3 -c '
import json, sys
d = json.loads(sys.stdin.read())
keys = [("measured_I", "input_i"), ("measured_TP", "input_tp"), ("measured_LRA", "input_lra"),
        ("measured_thresh", "input_thresh"), ("offset", "target_offset")]
print(":".join(k + "=" + d[v] for k, v in keys))
' <<< "$stats")
  ffmpeg -v error -y -i "$src" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:${measured}:linear=true" \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$out"
  echo "$out"
done
