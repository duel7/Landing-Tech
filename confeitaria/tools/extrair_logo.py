"""Extrai a logo da confeitaria do vídeo de referência, com fundo transparente.

uso: python3 -I extrair_logo.py <quadros_originais> <quadros_limpos> <pasta_saida>

A logo só existe gravada no vídeo (cerca de 120 × 80 px). Com o mesmo quadro antes e depois da
limpeza (tools/limpar_quadros.py), sabe-se a cor da parede atrás de cada pixel; daí se obtém a
cobertura (alfa) da tinta em cada ponto, como numa fotografia de recorte. A média de muitos
quadros tira o ruído de compressão. A cor de cada traço é a tinta original medida no próprio
vídeo: nada é redesenhado.

Saídas: logo.png e logo.webp (2×, para telas de alta densidade) e favicon.png (o batedor com o
coração, 64 × 64). A resolução de origem é baixa: substitua estes arquivos pela logo vetorial
original assim que ela estiver disponível.
"""
import glob
import os
import sys

import cv2
import numpy as np
from PIL import Image

src, clean, out = sys.argv[1], sys.argv[2], sys.argv[3]
paths = sorted(glob.glob(os.path.join(src, "*.png")))
N = len(paths)

BOX = (52, 16, 170, 95)  # x0, y0, x1, y1 da logo no quadro de 1024 × 576
MARK = (88, 66, 132, 92)  # batedor com coração, usado no favicon
FRAMES = range(N - 60, N)  # trecho em que a logo está mais nítida
SCALE = 2


def crop(path):
    x0, y0, x1, y1 = BOX
    return cv2.imread(path, cv2.IMREAD_COLOR)[y0:y1, x0:x1, ::-1].astype(np.float32)


obs = np.stack([crop(paths[i]) for i in FRAMES])
bgs = np.stack([crop(os.path.join(clean, os.path.basename(paths[i]))) for i in FRAMES])

# Tinta: pixels de maior contraste com a parede. Há duas — o castanho-bordô das letras e do
# batedor e o vermelho do coração —, separadas pela saturação.
diff = (bgs - obs).mean(axis=3)
strong = diff > np.percentile(diff, 98.5)
inks_px = obs[strong]
hsv = cv2.cvtColor(inks_px.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_RGB2HSV).reshape(-1, 3)
red = hsv[:, 1] > np.percentile(hsv[:, 1], 80)
inks = [np.median(inks_px[~red], axis=0), np.median(inks_px[red], axis=0)]
print("tintas:", ["#%02x%02x%02x" % tuple(int(round(c)) for c in ink) for ink in inks], file=sys.stderr)

# Cobertura por pixel para cada tinta; fica a tinta que melhor explica o pixel observado.
best_alpha = None
best_err = None
best_ink = None
for k, ink in enumerate(inks):
    d = bgs - ink
    a = ((bgs - obs) * d).sum(axis=3) / np.maximum((d * d).sum(axis=3), 1e-3)
    a = np.clip(a, 0, 1)
    model = a[..., None] * ink + (1 - a[..., None]) * bgs
    err = ((model - obs) ** 2).sum(axis=3).mean(axis=0)
    a = a.mean(axis=0)
    if best_err is None:
        best_alpha, best_err, best_ink = a, err, np.zeros(a.shape, int)
    else:
        take = err < best_err
        best_alpha = np.where(take, a, best_alpha)
        best_err = np.minimum(err, best_err)
        best_ink = np.where(take, k, best_ink)

alpha = best_alpha
# A tinta escolhida varia nas bordas suaves; ela segue a do pixel mais coberto ao redor.
ink_id = cv2.dilate(np.where(alpha > 0.35, best_ink + 1, 0).astype(np.uint8), np.ones((3, 3), np.uint8))
ink_id = np.where(ink_id > 0, ink_id - 1, best_ink)
# ruído residual da parede: abaixo de 6 % de cobertura é fundo
alpha = np.clip((alpha - 0.06) / 0.94, 0, 1)

rgb = np.stack([inks[k] for k in (0, 1)])[ink_id]
h, w = alpha.shape


def upscale(a, c, s):
    """Amplia em espaço pré-multiplicado e devolve as bordas a uma transição curta, como num
    traço vetorial renderizado, sem mudar a forma."""
    pre = np.dstack([c * a[..., None], a])
    big = cv2.resize(pre, (w * s, h * s), interpolation=cv2.INTER_LANCZOS4)
    big = np.clip(big, 0, 255)
    ab = np.clip(big[..., 3], 0, 1)
    col = big[..., :3] / np.maximum(ab[..., None], 1e-4)
    ab = np.clip((ab - 0.5) * 1.35 + 0.5, 0, 1)
    return ab, np.clip(col, 0, 255)


os.makedirs(out, exist_ok=True)
a2, c2 = upscale(alpha, rgb, SCALE)
img = Image.fromarray(np.dstack([c2, a2 * 255]).round().astype(np.uint8), "RGBA")
img.save(os.path.join(out, "logo.png"), optimize=True)
img.save(os.path.join(out, "logo.webp"), lossless=True, quality=100, method=6)

# favicon: o batedor com o coração, centralizado num quadrado
mx0, my0, mx1, my1 = (MARK[0] - BOX[0], MARK[1] - BOX[1], MARK[2] - BOX[0], MARK[3] - BOX[1])
am, cm = upscale(alpha[my0:my1, mx0:mx1], rgb[my0:my1, mx0:mx1], 1)
mark = Image.fromarray(np.dstack([cm, am * 255]).round().astype(np.uint8), "RGBA")
side = int(max(mark.size) * 1.18)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2), mark)
canvas.resize((64, 64), Image.LANCZOS).save(os.path.join(out, "favicon.png"), optimize=True)
print(f"logo: {w * SCALE} × {h * SCALE} px", file=sys.stderr)
