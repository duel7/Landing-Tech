#!/usr/bin/env python3
"""
Prepara as fotografias do site a partir dos originais do Unsplash.

Uso:
    python3 tools/preparar_imagens.py PASTA_DOS_ORIGINAIS

Os originais devem estar nomeados pelo identificador do Unsplash
(ex.: 1614283233556-f35b0c801ef1.jpg). Baixe cada um em
https://images.unsplash.com/photo-<id>?w=2600&q=92&fm=jpg

Para cada foto o script:
  1. recorta na proporção usada no layout;
  2. aplica o mesmo tratamento de cor em todas (balanço de branco quente,
     azuis e violetas dessaturados, pretos levemente levantados) para que
     fotos de autores diferentes pareçam da mesma sessão;
  3. exporta AVIF e WebP em várias larguras e um JPEG de reserva.

Requer Python 3 com Pillow (com suporte a AVIF) e numpy.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "assets" / "img"

# slug, id no Unsplash, recorte (esq., topo, dir., base em frações) ou None, larguras
FOTOS = [
    ("abertura-perfil", "1614283233556-f35b0c801ef1", (0.0, 0.07, 1.0, 0.903), (480, 800, 1200)),
    ("clinica-maos-hidratante", "1619451334792-150fd785ee74", (0.0, 0.07, 1.0, 0.933), (480, 800, 1200)),
    ("limpeza-de-pele", "1570172619644-dfd03ed5d881", (0.16, 0.0, 0.693, 1.0), (480, 800, 1100)),
    ("hidratacao-profunda", "1617897903246-719242758050", (0.0, 0.07, 1.0, 0.903), (480, 800, 1100)),
    ("peeling-de-renovacao", "1573461160327-b450ce3d8e7f", None, (480, 800, 1100)),
    ("revitalizacao-facial", "1600428877878-1a0fd85beda8", (0.17, 0.0, 0.703, 1.0), (480, 800, 1100)),
    ("drenagem-linfatica", "1519823551278-64ac92734fb1", (0.0, 0.14, 1.0, 0.973), (480, 800, 1100)),
    ("ritual-alvor", "1590439471364-192aa70c0b53", (0.0, 0.08, 1.0, 0.913), (480, 800, 1100)),
    ("espaco-sala-de-banho", "1507652313519-d4e9174996dd", None, (640, 1024, 1600)),
    ("espaco-frasco-luz", "1608571423902-eed4a5ad8108", (0.0, 0.0, 1.0, 0.889), (480, 800, 1100)),
    ("espaco-textura", "1599305090598-fe179d501227", None, (480, 800, 1100)),
    ("espaco-serum-marmore", "1576426863848-c21f53c60b19", None, (640, 1024, 1600)),
]

# Imagem de compartilhamento (1200 × 630) feita a partir da foto de abertura.
COMPARTILHAMENTO = ("1614283233556-f35b0c801ef1", (0.0, 0.25, 1.0, 0.775))


def rgb_to_hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(-1)
    mn = rgb.min(-1)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rc = np.where(m, (mx - r) / np.where(m, d, 1), 0)
    gc = np.where(m, (mx - g) / np.where(m, d, 1), 0)
    bc = np.where(m, (mx - b) / np.where(m, d, 1), 0)
    h = np.where(r == mx, bc - gc, h)
    h = np.where(g == mx, 2.0 + rc - bc, h)
    h = np.where(b == mx, 4.0 + gc - rc, h)
    h = np.where(m, (h / 6.0) % 1.0, 0)
    s = np.where(mx > 1e-6, d / np.where(mx > 1e-6, mx, 1), 0)
    return h, s, mx


def hsv_to_rgb(h, s, v):
    i = np.floor(h * 6.0)
    f = h * 6.0 - i
    p = v * (1 - s)
    q = v * (1 - s * f)
    t = v * (1 - s * (1 - f))
    i = i.astype(int) % 6
    conds = [i == k for k in range(6)]
    r = np.select(conds, [v, q, p, p, t, v])
    g = np.select(conds, [t, v, v, q, p, p])
    b = np.select(conds, [p, p, t, v, v, q])
    return np.stack([r, g, b], -1)


def tratar(im):
    a = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0

    # 1. Balanço de branco: aproxima de um neutro quente as fotos que estão frias.
    lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    sel = (lum > 0.35) & (lum < 0.92)
    media = a[sel].mean(0) if sel.any() else a.reshape(-1, 3).mean(0)
    alvo = np.array([1.0, 0.962, 0.905], dtype=np.float32)
    ganho = (alvo / alvo[1]) / (media / media[1])
    # Só aquece: fotos já quentes não são esfriadas.
    ganho[0] = max(ganho[0], 1.0)
    ganho[2] = min(ganho[2], 1.0)
    ganho = 1.0 + (ganho - 1.0) * 0.6
    ganho = np.clip(ganho, 0.9, 1.1)
    a = np.clip(a * ganho, 0, 1)

    # 2. Cor: azuis, cianos e violetas perdem saturação; o resto, um pouco.
    h, s, v = rgb_to_hsv(a)
    graus = h * 360.0
    faixa = np.clip(1.0 - np.abs(graus - 235.0) / 75.0, 0, 1)  # 160°–310°
    s = s * (0.94 - 0.5 * faixa)
    a = hsv_to_rgb(h, s, v)

    # 3. Tom: curva suave, pretos levantados com leve calor, altas luzes contidas.
    x = a
    curva = x + 0.08 * x * (1 - x) * (x - 0.35) * 4.0
    a = 0.032 + curva * (0.962 - 0.032)
    sombra = (1.0 - lum[..., None]) ** 2
    a = a + sombra * np.array([0.014, 0.007, 0.0], dtype=np.float32)

    a = np.clip(a, 0, 1)
    return Image.fromarray((a * 255.0 + 0.5).astype(np.uint8), "RGB")


def recortar(im, caixa):
    if not caixa:
        return im
    w, h = im.size
    l, t, r, b = caixa
    return im.crop((round(l * w), round(t * h), round(r * w), round(b * h)))


def exportar(im, slug, larguras):
    for lw in larguras:
        if lw > im.width:
            continue
        alt = round(im.height * lw / im.width)
        r = im.resize((lw, alt), Image.LANCZOS)
        r.save(OUT / f"{slug}-{lw}.avif", quality=58, speed=4)
        r.save(OUT / f"{slug}-{lw}.webp", quality=80, method=6)
    meio = larguras[1]
    alt = round(im.height * meio / im.width)
    im.resize((meio, alt), Image.LANCZOS).save(
        OUT / f"{slug}-{meio}.jpg", quality=82, optimize=True, progressive=True
    )
    proporcao = im.width / im.height
    print(f"{slug}: {im.width}x{im.height} (proporção {proporcao:.3f})")


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    origem = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, uid, caixa, larguras in FOTOS:
        im = Image.open(origem / f"{uid}.jpg")
        im = tratar(recortar(im, caixa))
        exportar(im, slug, larguras)

    uid, caixa = COMPARTILHAMENTO
    im = tratar(recortar(Image.open(origem / f"{uid}.jpg"), caixa))
    compartilhamento(im)


def compartilhamento(im):
    """1200 × 630: o perfil à direita e a parede da foto estendida à esquerda, com a assinatura."""
    from PIL import ImageDraw, ImageFont

    im = im.resize((round(630 * im.width / im.height), 630), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    borda = a[:, 4:40].mean(1)  # cor da parede, linha a linha
    tela = np.repeat(borda[:, None, :], 1200, 1)
    x0 = 1200 - im.width
    tela[:, x0:] = a
    costura = 120
    alfa = np.linspace(0, 1, costura)[None, :, None]
    tela[:, x0:x0 + costura] = borda[:, None, :] * (1 - alfa) + a[:, :costura] * alfa
    img = Image.fromarray(np.clip(tela, 0, 255).astype(np.uint8))

    fontes = Path(__file__).resolve().parent.parent / "assets" / "fonts"
    d = ImageDraw.Draw(img)
    marca = ImageFont.truetype(str(fontes / "libre-caslon-text-latin.woff2"), 96)
    texto = ImageFont.truetype(str(fontes / "geist-latin.woff2"), 22)
    try:
        texto.set_variation_by_axes([500])
    except Exception:
        pass
    d.text((72, 236), "Alvor", font=marca, fill=(31, 28, 25))
    d.text((76, 364), "CLÍNICA DE ESTÉTICA  ·  JARDINS, SÃO PAULO", font=texto, fill=(67, 89, 74))
    img.save(OUT / "compartilhamento.jpg", quality=84, optimize=True, progressive=True)
    print("compartilhamento.jpg: 1200x630")

if __name__ == "__main__":
    main()
