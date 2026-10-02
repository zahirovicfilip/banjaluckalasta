#!/usr/bin/env bash
# Regenerates every web asset from the club's source material (the "transfer" folder):
# logos, textures, cutouts, camp photos, icons, and the web-sized videos with posters.
# macOS only (uses AVFoundation through scripts/media/main.swift). No ffmpeg required.
#
#   scripts/build-media.sh [path-to-transfer-folder] [images|videos|all]
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="${1:-$(ls -d transfer-* 2>/dev/null | head -1)}"
WHAT="${2:-all}"
[ -d "$SRC" ] || { echo "Source folder not found. Pass it as the first argument."; exit 1; }

BIN=scripts/media/.build/media
if [ ! -x "$BIN" ] || [ scripts/media/main.swift -nt "$BIN" ]; then
  mkdir -p scripts/media/.build
  swiftc -O -swift-version 5 scripts/media/main.swift -o "$BIN"
fi

A=src/assets
V=public/media
TMP=scripts/media/.build/tmp
BRO="$SRC/Brošura"
mkdir -p "$A/kamp" "$V" "$TMP"

if [ "$WHAT" = all ] || [ "$WHAT" = images ]; then
  echo "== Logo and camp badge (transparent layers out of the PSD)"
  python3 scripts/media/psd_layers.py "$SRC/Grafika za video.psd" "$TMP/psd" 3,4 >/dev/null
  cp "$TMP"/psd/03_*.png "$A/logo.png"
  cp "$TMP"/psd/04_*.png "$A/kamp-badge.png"
  $BIN img "$SRC/Seal_of_the_Republika_Srpska.png" "$A/seal.png" w=256

  echo "== Cutouts"
  $BIN img "$BRO/Igor.png" "$A/igor.png" crop=140,90,861,700
  $BIN img "$SRC/Uniforma Front 2.png" "$A/jersey-white.png" crop=1160,430,3720,4115 w=1100
  $BIN img "$SRC/Uniforma Front 2a.png" "$A/jersey-pink.png" crop=1160,430,3720,4115 w=1100

  echo "== Torn-paper textures"
  # Clean strip of texture above the logo on the brochure's back cover.
  $BIN img "$BRO/Brošura 2026-08.png" "$A/texture-wide.jpg" crop=0,0,2481,1150 w=2000 q=0.8
  $BIN img "$BRO/Pozadina.png" "$A/texture-tall.jpg" q=0.82
  $BIN img "$BRO/Untitled-1.png" "$A/pattern.png" crop=600,500,1300,2400 w=800

  echo "== Camp photos, one square per day"
  $BIN frames "$SRC/Dron/DJI_0757.MP4" "$TMP/d1" 2160 "6.0" >/dev/null
  $BIN img "$TMP/d1_00.jpg" "$A/kamp/dan-1.jpg" crop=0,1000,2160,2160 w=1000 q=0.8
  $BIN frames "$SRC/Skokovi/Skok5.mp4" "$TMP/d2" 1080 "1.55" >/dev/null
  $BIN img "$TMP/d2_00.jpg" "$A/kamp/dan-2.jpg" crop=0,430,1080,1080 w=1000 q=0.8
  $BIN img "$BRO/Brošura 2026-04.png" "$A/kamp/dan-3.jpg" crop=1400,465,760,760 q=0.84
  $BIN frames "$SRC/Dron/DJI_0786.MP4" "$TMP/d4" 2160 "22.0" >/dev/null
  $BIN img "$TMP/d4_00.jpg" "$A/kamp/dan-4.jpg" crop=0,900,2160,2160 w=1000 q=0.8
  $BIN img "$BRO/Brošura 2026-06.png" "$A/kamp/dan-5.jpg" crop=1152,212,910,910 q=0.84
  $BIN img "$BRO/Brošura 2026-07.png" "$A/kamp/dan-6.jpg" crop=205,219,1065,1065 q=0.84
  $BIN img "$BRO/Brošura 2026-09.png" "$A/kamp/dan-7.jpg" crop=985,92,636,636 q=0.86

  echo "== Icons and share image"
  $BIN img "$A/logo.png" src/app/icon.png w=256
  $BIN layers src/app/apple-icon.png 180 180 "fill=#003156FF,0,0,180,180" "$A/logo.png,8,8,164"
  $BIN layers src/app/opengraph-image.jpg 1200 630 "$A/texture-wide.jpg,-80,0,1360" "fill=#001928A6,0,0,1200,630" "$A/logo.png,96,165,300" "$A/igor.png,470,70,680"
fi

if [ "$WHAT" = all ] || [ "$WHAT" = videos ]; then
  echo "== Camp opener: the drone fly-in over Jezero Manjača, 2.5x speed"
  # Source is vertical 4K. Desktop gets a 16:9 band around the horizon, phones get the full frame.
  $BIN export "$SRC/Dron/DJI_0757.MP4" "$V/kamp-wide.mp4" 1 40 1600 2600 crop=0,0.30,1,0.31640625 speed=2.5
  $BIN export "$SRC/Dron/DJI_0757.MP4" "$V/kamp-tall.mp4" 1 40 720 1800 speed=2.5
  # Posters are the first encoded frame, so the swap from poster to video is invisible.
  $BIN frames "$V/kamp-wide.mp4" "$TMP/kw" 1600 "0.0" >/dev/null && cp "$TMP/kw_00.jpg" "$V/kamp-wide.jpg"
  $BIN frames "$V/kamp-tall.mp4" "$TMP/kt" 720 "0.0" >/dev/null && cp "$TMP/kt_00.jpg" "$V/kamp-tall.jpg"

  echo "== Reel: jump clips from the camp finale"
  # name | source clip | start | duration | poster time (seconds in the source, mid-flight)
  REEL=(
    "01|Skok20|0|99|3.06"
    "02|Skok1|0|99|1.46"
    "03|Skok5|0|99|1.55"
    "04|DusanSkok1|0|99|5.08"
    "05|Skok12|0|99|1.39"
    "06|Skok22|0|99|2.95"
    "07|Skok16|0|99|2.45"
    "08|Skok3|0|99|1.85"
    "09|SanelSkok1|9.2|9.6|13.31"
    "10|Skok15|0|99|2.21"
    "11|Skok18|0|99|2.77"
    "12|Skok24|0|99|3.19"
  )
  for row in "${REEL[@]}"; do
    IFS='|' read -r n clip start dur poster <<<"$row"
    $BIN export "$SRC/Skokovi/$clip.mp4" "$V/skok-$n.mp4" "$start" "$dur" 720 1400
    $BIN frames "$SRC/Skokovi/$clip.mp4" "$TMP/p$n" 540 "$poster,$poster" >/dev/null && cp "$TMP/p${n}_00.jpg" "$V/skok-$n.jpg"
  done
fi

# AVAssetWriter leaves its fast-start scratch files behind when it runs sandboxed.
rm -f "$V"/*.sb-*

echo "Done. Assets in $A and $V."
