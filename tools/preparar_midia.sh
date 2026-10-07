#!/usr/bin/env bash
# Gera a mídia do site a partir do vídeo de referência (1280×720, 24 qps).
#
#   tools/preparar_midia.sh caminho/do/video.mp4
#
# Etapas: extrai os quadros, remove a interface do mockup (tools/limpar_quadros.py),
# monta um loop de ida e volta e exporta vídeo (WebM/MP4, sem áudio) e imagens
# (AVIF/WebP/JPEG) em assets/media, sempre na resolução de origem — nada é ampliado.
#
# Requisitos: ffmpeg (libvpx-vp9, libx264), Python 3 com numpy e Pillow (com AVIF).
# Ao receber fotografias e vídeos definitivos da marca, este script deixa de ser
# necessário: basta exportá-los para assets/media com os mesmos nomes.
set -euo pipefail

SRC="${1:?Informe o caminho do vídeo de referência}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/media"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Trecho usado: quadros 46–192. Antes do quadro 46 o mockup ainda mostra linhas de chamada.
FIRST=46
LAST=192

mkdir -p "$WORK/quadros" "$WORK/limpos" "$WORK/loop" "$OUT"
ffmpeg -v error -i "$SRC" "$WORK/quadros/%03d.png"
python3 -I "$ROOT/tools/limpar_quadros.py" "$WORK/quadros" "$WORK/limpos" "$FIRST" "$LAST"

# Loop de ida e volta começando no último quadro (mostrador mais nítido, que vira o pôster),
# para que o vídeo não tenha corte visível ao reiniciar.
N=$((LAST - FIRST + 1))
i=0
for k in $(seq "$N" -1 1) $(seq 2 $((N - 1))); do
  i=$((i + 1))
  ln -s "$WORK/limpos/$(printf %03d "$k").png" "$WORK/loop/$(printf %04d "$i").png"
done

ffmpeg -v error -y -framerate 24 -i "$WORK/loop/%04d.png" \
  -c:v libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 -deadline good -cpu-used 1 -pix_fmt yuv420p -an \
  "$OUT/cronografo-hora-azul.webm"
ffmpeg -v error -y -framerate 24 -i "$WORK/loop/%04d.png" \
  -c:v libx264 -preset veryslow -crf 19 -pix_fmt yuv420p -profile:v high -tune film \
  -movflags +faststart -an \
  "$OUT/cronografo-hora-azul.mp4"

python3 -I - "$WORK/limpos" "$OUT" "$N" <<'PY'
import sys
from PIL import Image

src, out, last = sys.argv[1], sys.argv[2], int(sys.argv[3])

def save(im, name):
    im = im.convert("RGB")
    im.save(f"{out}/{name}.avif", quality=62, speed=4)
    im.save(f"{out}/{name}.webp", quality=84, method=6)
    im.save(f"{out}/{name}.jpg", quality=86, optimize=True, progressive=True)

poster = Image.open(f"{src}/{last:03d}.png")          # 864×424
sweep = Image.open(f"{src}/{last - 47:03d}.png")      # reflexo de luz sobre o mostrador
save(poster, "cronografo-hora-azul-poster")
save(poster.crop((277, 0, 617, 424)), "cronografo-detalhe")   # 340×424, pontos em index.html
save(sweep.crop((280, 0, 620, 424)), "cronografo-colecao")
poster.crop((27, 0, 837, 424)).convert("RGB").save(
    f"{out}/compartilhamento.jpg", quality=88, optimize=True, progressive=True)
PY

echo "Mídia gerada em $OUT"
