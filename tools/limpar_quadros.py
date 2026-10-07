"""Remove os textos da interface do mockup dos quadros do vídeo de referência e recorta a cena.

uso: python3 -I limpar_quadros.py <pasta_quadros> <pasta_saida> <primeiro> <ultimo>
Os quadros são PNGs %03d.png (a partir de 1) extraídos do vídeo de 1280×720.

Os pixels de texto são encontrados pela luminância dentro de cada região, ampliados para
cobrir a sombra suave que o mockup desenhou em volta, e preenchidos por convolução
normalizada a partir do fundo desfocado ao redor. As máscaras são unidas entre quadros
vizinhos para que o preenchimento não cintile enquanto as letras geradas oscilam.
"""
import sys
import numpy as np
from PIL import Image

src, out, first, last = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])

# Recorte da cena dentro da "janela" do mockup (sem a barra de navegação, miniaturas e botão).
CROP = (208, 92, 1072, 516)

# caixa de detecção, limiar de luminância, ampliação (px), caixa que mantém o preenchimento
# longe do relógio, e o menor valor de azul menos vermelho ainda lido como letra (None: qualquer
# cor). As letras são brancas neutras, mas esquentam sobre a névoa rosada ou uma flor desfocada.
TEXT = [
    ((234, 143, 540, 254), 105, 7, (214, 128, 543, 262), -14),    # TIME
    ((778, 300, 1080, 380), 118, 4, (777, 292, 1080, 386), None),  # BEYOND
    ((930, 378, 1080, 404), 105, 4, (924, 374, 1080, 410), None),  # MOMENT
    ((298, 290, 422, 342), 105, 5, (290, 284, 428, 348), -14),     # texto da chamada à esquerda
    ((834, 416, 945, 468), 105, 5, (826, 410, 952, 474), -40),     # texto da chamada à direita
]
# As chamadas são duas linhas finas de texto, em parte sobre flores desfocadas: reconstruídas
# coluna a coluna a partir dos pixels logo acima e abaixo, para a borda da flor continuar.
THIN = (3, 4)
DOTS = [(436, 322), (820, 435)]  # pontos das chamadas, localizados de novo a cada quadro
DOT_R = 20
WIN = 3  # janela temporal (quadros) da união das máscaras


def box_blur(a, r):
    if r < 1:
        return a
    for axis in (0, 1):
        pad = [(0, 0)] * a.ndim
        pad[axis] = (r + 1, r)
        p = np.pad(a, pad, mode="edge")
        c = np.cumsum(p, axis=axis, dtype=np.float64)
        n = a.shape[axis]
        hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=axis)
        lo = np.take(c, np.arange(0, n), axis=axis)
        a = ((hi - lo) / (2 * r + 1)).astype(np.float32)
    return a


def gauss(a, sigma):
    """Três passadas de média aproximam um desfoque gaussiano."""
    r = max(1, int(round(np.sqrt(12 * sigma * sigma / 3 + 1) - 1) // 2))
    for _ in range(3):
        a = box_blur(a, r)
    return a


def grow(m, r):
    return gauss(m.astype(np.float32), r / 2.0) > 0.02


H, W = 720, 1280
yy, xx = np.mgrid[0:H, 0:W]
LW = np.array([0.299, 0.587, 0.114], dtype=np.float32)


def load(i):
    return np.asarray(Image.open(f"{src}/{i:03d}.png").convert("RGB"), dtype=np.float32)


def raw_mask(img):
    """Devolve (máscara preenchida por convolução normalizada, máscara preenchida por coluna)."""
    lum = img @ LW
    b_r = img[..., 2] - img[..., 0]
    # As letras são brancas neutras; pétalas, couro e a caixa em tom rosé são quentes.
    protect = grow((b_r < -18) & (lum > 90), 2)
    m = np.zeros((H, W), bool)
    thin = np.zeros((H, W), bool)
    for k, ((x0, y0, x1, y1), t, g, (cx0, cy0, cx1, cy1), warmest) in enumerate(TEXT):
        hit = lum[y0:y1, x0:x1] > t
        if warmest is not None:
            hit &= b_r[y0:y1, x0:x1] > warmest
        sub = np.zeros((H, W), bool)
        sub[y0:y1, x0:x1] = hit
        sub = grow(sub, g)
        if warmest is not None and warmest > -20:
            sub &= ~protect  # perto do relógio e das flores nítidas
        clip = np.zeros((H, W), bool)
        clip[cy0:cy1, cx0:cx1] = True
        if k in THIN:
            thin |= sub & clip
        else:
            m |= sub & clip
    for k, (cx, cy) in enumerate(DOTS):
        win = gauss(lum, 2)[cy - 14:cy + 15, cx - 14:cx + 15]
        dy, dx = np.unravel_index(np.argmax(win), win.shape)
        px, py = cx - 14 + dx, cy - 14 + dy
        disk = (xx - px) ** 2 + (yy - py) ** 2 <= DOT_R * DOT_R
        thin |= disk & ~protect if k == 0 else disk
    return m, thin


def fill_columns(img, mask):
    out = img.copy()
    ys, xs = np.nonzero(mask)
    if not len(xs):
        return out
    for x in range(xs.min(), xs.max() + 1):
        col = mask[:, x]
        if not col.any():
            continue
        d = np.diff(np.concatenate([[0], col.astype(np.int8), [0]]))
        for a, b in zip(np.nonzero(d == 1)[0], np.nonzero(d == -1)[0]):
            top = img[max(a - 3, 0):a, x].mean(0)
            bot = img[b:min(b + 3, H), x].mean(0)
            t = np.linspace(0, 1, b - a + 2, dtype=np.float32)[1:-1, None]
            out[a:b, x] = top * (1 - t) + bot * t
    # Relaxa até um preenchimento harmônico (Laplace), partindo da mistura por coluna: suave nas
    # duas direções, para que uma flor desfocada mantenha a borda macia em vez de cortada.
    y0, y1 = max(ys.min() - 1, 1), min(ys.max() + 2, H - 1)
    x0, x1 = max(xs.min() - 1, 1), min(xs.max() + 2, W - 1)
    u = out[y0 - 1:y1 + 1, x0 - 1:x1 + 1]
    inner = mask[y0:y1, x0:x1]
    for _ in range(400):
        avg = 0.25 * (u[:-2, 1:-1] + u[2:, 1:-1] + u[1:-1, :-2] + u[1:-1, 2:])
        core = u[1:-1, 1:-1]
        core[inner] = avg[inner]
    out[y0 - 1:y1 + 1, x0 - 1:x1 + 1] = u
    rng = np.random.default_rng(int(xs.sum()) % 2**32)
    out[mask] += rng.normal(0, 1.4, (mask.sum(), 3)).astype(np.float32)
    return out


frames = list(range(first, last + 1))
masks = {i: raw_mask(load(i)) for i in frames}

for i in frames:
    img = load(i)
    m = np.zeros((H, W), bool)
    thin = np.zeros((H, W), bool)
    for j in range(max(first, i - WIN), min(last, i + WIN) + 1):
        m |= masks[j][0]
        thin |= masks[j][1]
    thin &= ~m
    img = fill_columns(img, thin)

    known = (~m).astype(np.float32)
    # Amostra só a própria cena: a moldura da janela do mockup fica logo fora do recorte.
    known[:, :CROP[0]] = 0
    known[:, CROP[2]:] = 0
    fill = np.zeros_like(img)
    have = np.zeros((H, W), bool)
    for sigma in (3, 6, 12, 24, 48):
        den = gauss(known, sigma)
        num = np.stack([gauss(img[..., c] * known, sigma) for c in range(3)], -1)
        est = num / np.maximum(den, 1e-6)[..., None]
        ok = ((den > 0.15) | ((sigma == 48) & (den > 0))) & ~have
        fill[ok] = est[ok]
        have |= ok
    rng = np.random.default_rng(i)
    fill += rng.normal(0, 1.4, fill.shape).astype(np.float32)

    alpha = np.clip(gauss(m.astype(np.float32), 1.2) * 1.6, 0, 1)
    alpha = np.maximum(alpha, m.astype(np.float32))[..., None]
    res = img * (1 - alpha) + fill * alpha
    x0, y0, x1, y1 = CROP
    Image.fromarray(np.clip(res[y0:y1, x0:x1], 0, 255).astype(np.uint8)).save(
        f"{out}/{i - first + 1:03d}.png"
    )
