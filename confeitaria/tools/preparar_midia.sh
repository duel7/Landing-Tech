#!/usr/bin/env bash
# Gera a mídia do site a partir do vídeo aprovado (1024 × 576, 24 qps, 8 s).
#
#   tools/preparar_midia.sh caminho/do/video.mp4
#
# Etapas: extrai os quadros, apaga a interface gravada no mockup (tools/limpar_quadros.py),
# extrai a logo (tools/extrair_logo.py) e exporta vídeo (WebM/MP4, sem áudio) e imagens
# (AVIF/WebP/JPEG) em assets/media, sempre na resolução de origem — nada é ampliado nem
# recolorido. A conversão de cor usa BT.709 nas duas pontas, como o arquivo original declara, e
# arredondamento exato, para os tons de rosa e de chocolate saírem iguais aos do vídeo aprovado.
#
# Requisitos: ffmpeg (libx264, libvpx-vp9), Python 3 com numpy, opencv-python-headless e
# Pillow (com AVIF). Leva alguns minutos.
set -euo pipefail

SRC="${1:?Informe o caminho do vídeo aprovado}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/media"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$WORK/quadros" "$WORK/limpos" "$OUT"
# accurate_rnd: o arredondamento padrão do ffmpeg escurece cerca de 1 nível (de 255) a cada conversão
SWS="flags=accurate_rnd+full_chroma_int"
ffmpeg -v error -i "$SRC" -vf "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:$SWS,format=rgb24" \
  "$WORK/quadros/%03d.png"
python3 -I "$ROOT/tools/limpar_quadros.py" "$WORK/quadros" "$WORK/limpos"
python3 -I "$ROOT/tools/extrair_logo.py" "$WORK/quadros" "$WORK/limpos" "$OUT"

TO_YUV="scale=in_range=pc:out_color_matrix=bt709:out_range=tv:$SWS,format=yuv420p"
TAGS=(-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv)

ffmpeg -v error -y -framerate 24 -i "$WORK/limpos/%03d.png" -vf "$TO_YUV" \
  -c:v libx264 -preset veryslow -crf 18 -profile:v high -tune film "${TAGS[@]}" \
  -movflags +faststart -an \
  "$OUT/hero-confeitaria.mp4"
ffmpeg -v error -y -framerate 24 -i "$WORK/limpos/%03d.png" -vf "$TO_YUV" \
  -c:v libvpx-vp9 -crf 28 -b:v 0 -row-mt 1 -deadline good -cpu-used 1 "${TAGS[@]}" -an \
  "$OUT/hero-confeitaria.webm"

python3 -I - "$WORK/limpos" "$OUT" <<'PY'
import glob
import os
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
frames = sorted(glob.glob(os.path.join(src, "*.png")))

def save(im, name):
    im = im.convert("RGB")
    im.save(f"{out}/{name}.avif", quality=64, speed=4)
    im.save(f"{out}/{name}.webp", quality=86, method=6)
    im.save(f"{out}/{name}.jpg", quality=88, optimize=True, progressive=True)

first = Image.open(frames[0])   # 1024 × 576: o vídeo começa aqui
last = Image.open(frames[-1])   # composição final, onde o vídeo para
save(first, "hero-inicio")
save(last, "hero-final")
save(last.crop((462, 3, 918, 573)), "sobre")   # 456 × 570 (4:5), o bolo no pedestal
last.crop((0, 20, 1024, 556)).convert("RGB").save(
    f"{out}/compartilhamento.jpg", quality=88, optimize=True, progressive=True)
PY

echo "Mídia gerada em $OUT"
