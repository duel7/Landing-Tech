"""Remove dos quadros do vídeo de referência a interface que veio gravada nele.

uso: python3 -I limpar_quadros.py <pasta_quadros> <pasta_saida>

O vídeo aprovado (1024 × 576) é um mockup de página: logo, menu, ícones, chamada, título e
botão estão desenhados sobre a cena. No site, esses elementos são HTML de verdade; aqui eles
são apagados para não aparecerem duas vezes. Nada mais é tocado: os pixels fora das máscaras
saem idênticos aos de entrada, sem filtro de cor, recorte ou ampliação.

Logo, menu e ícones ficam parados na tela. A chamada, o título e o botão derivam alguns pixels
para a esquerda ao longo do vídeo, por isso o desenho de cada um é rastreado quadro a quadro.
As letras são preenchidas a partir da parede ao redor: uma média ponderada dos pixels vizinhos
seguida de relaxamento harmônico (Laplace), que continua os degradês da luz sem manchas. No
título, que passa sobre as flores desfocadas, a máscara cobre cada palavra inteira. Folhas e
morangos não servem de borda para o preenchimento, para não tingirem a parede. O preenchimento
sobre a parede é suavizado no tempo para não cintilar e recebe um grão leve.
"""
import glob
import os
import sys

import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
paths = sorted(glob.glob(os.path.join(src, "*.png")))
N = len(paths)

# box: caixa x0, y0, x1, y1 no quadro de 1024 × 576
# ref: quadros em que o elemento aparece inteiro e nítido, usados para desenhar a máscara
# drift: o elemento desliza e é rastreado quadro a quadro
# expand: a máscara cresce até a franja tingida pela compressão (letras sobre a parede lisa)
# wall: o fundo é parede parada, então o preenchimento pode ser suavizado no tempo
# close: letras grandes que passam sobre as flores desfocadas: a máscara cobre a palavra inteira
# Os ícones do canto direito são linhas claras que ficam por cima da mão e da calda em parte do
# vídeo; o desenho deles vem dos primeiros quadros, quando ainda estão sobre a parede lisa.
ELEMENTS = {
    "logo": dict(box=(50, 14, 172, 97), ref=range(150, N), drift=False, expand=True, wall=True),
    "nav": dict(box=(350, 24, 666, 52), ref=range(150, N), drift=False, expand=True, wall=True),
    "icons": dict(box=(922, 24, 1000, 50), ref=range(0, 10), drift=False, expand=False, wall=False),
    "eyebrow": dict(box=(100, 150, 242, 198), ref=range(N - 4, N), drift=True, expand=True, wall=True, close=True),
    # o título em duas linhas: a caixa da primeira para antes da lasca de chocolate que flutua
    # logo depois de "Confeitaria" (x ≈ 427–447, y ≈ 177–207 no fim do vídeo)
    "title1": dict(box=(98, 193, 372, 256), ref=range(N - 4, N), drift=True, expand=True, wall=True, close=True),
    "title2": dict(box=(98, 252, 432, 316), ref=range(N - 4, N), drift=True, expand=True, wall=True, close=True),
    "button": dict(box=(98, 324, 264, 367), ref=range(N - 4, N), drift=True, expand=True, wall=True),
}
FIRST_VISIBLE = 14  # antes disso a chamada e o título ainda estão surgindo
# As máscaras valem desde o primeiro quadro: as letras começam a surgir, muito tênues, já nos
# primeiros quadros, e qualquer resto delas apareceria como um fantasma do título.
THRESH = 7.0  # escurecimento mínimo (0–255) em relação ao fundo para ser traço
ICON_T = 5.0  # contraste mínimo (0–255) para ser traço dos ícones
ICON_NOISE_T = 3.5  # contraste mínimo do ruído de compressão colado aos ícones
WALL_DE = 12.0  # diferença de cor (Lab) até a qual o fundo de um ícone ainda é a parede
GROW = 3  # px além do traço: cobre a suavização das bordas e o ruído de compressão
HALO = 6.0  # desvio de cor (Lab, croma com peso 2) que ainda conta como franja da letra
HALO_REACH = 6  # px a partir do traço em que a franja é procurada
RELAX = 220  # iterações do relaxamento harmônico
GRAIN = 1.0  # desvio do grão acrescentado ao preenchimento (0–255)
TIME_WIN = 2  # quadros de cada lado na suavização temporal do preenchimento
PAD = 48  # margem de trabalho ao redor de cada elemento
BLOCK_REACH = 5  # px ao redor de folhas e morangos que não servem de borda ao preenchimento
HOLE = 80  # área máxima (px) de uma ilha cercada pela máscara que passa a fazer parte dela
CLOSE = 10  # raio (px) do fechamento que une as letras grandes numa só forma por palavra


def load(i):
    return cv2.imread(paths[i], cv2.IMREAD_COLOR)


def darkness(img):
    """Quanto cada pixel é mais escuro que o fundo desfocado ao redor (traço escuro sobre rosa)."""
    f = img.astype(np.float32)
    g = cv2.GaussianBlur(f, (0, 0), 4)
    return np.clip((g - f).mean(axis=2), 0, None)


def lightness(img):
    """Quanto o pixel é mais claro (+) ou mais escuro (−) que a mediana da vizinhança. A mediana
    ignora as linhas finas dos ícones, então os vãos entre elas continuam fora da máscara."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return g.astype(np.float32) - cv2.medianBlur(g, 9).astype(np.float32)


def contrast(img):
    return np.abs(lightness(img))


def dilate(mask, r):
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    return cv2.dilate(mask.astype(np.uint8), k) > 0


def shift(a, dx):
    m = np.float32([[1, 0, dx], [0, 1, 0]])
    return cv2.warpAffine(a.astype(np.float32), m, (a.shape[1], a.shape[0]), flags=cv2.INTER_LINEAR)


def box_only(a, box):
    x0, y0, x1, y1 = box
    o = np.zeros_like(a)
    o[y0:y1, x0:x1] = a[y0:y1, x0:x1]
    return o


frames = [load(i) for i in range(N)]
H, W = frames[0].shape[:2]
dark = [darkness(f) for f in frames]
labs = [cv2.cvtColor(f, cv2.COLOR_BGR2LAB).astype(np.float32) for f in frames]


def scene_object(lab):
    """Folhas (verde-oliva) e morangos (cor intensa): nunca entram na máscara nem na borda.
    O branco neutro das flores desfocadas não conta como folha."""
    a, b = lab[..., 1] - 128, lab[..., 2] - 128
    return ((a < 3) & (b > 10)) | (np.hypot(a, b) > 46)


# ---------------------------------------------------------------------------
# Modelos (desenho de cada elemento) e deriva por quadro
# ---------------------------------------------------------------------------
templates = {
    name: box_only(
        np.median(np.stack([dark[i] if e["expand"] else contrast(frames[i]) for i in e["ref"]]), axis=0),
        e["box"],
    )
    for name, e in ELEMENTS.items()
}

offsets = {}
for name, e in ELEMENTS.items():
    if not e["drift"]:
        offsets[name] = np.zeros(N)
        continue
    x0, y0, x1, y1 = e["box"]
    t = templates[name][y0:y1, x0:x1]
    t = t - t.mean()
    found = np.zeros(N)
    cand = range(-4, 16)
    for i in range(FIRST_VISIBLE, N):
        scores = []
        for dx in cand:
            c = dark[i][y0:y1, x0 + dx:x1 + dx]
            c = c - c.mean()
            scores.append((c * t).sum() / np.sqrt((c * c).sum() * (t * t).sum() + 1e-6))
        k = int(np.argmax(scores))
        frac = 0.0
        if 0 < k < len(scores) - 1:  # refinamento subpixel por parábola
            a, b, c = scores[k - 1], scores[k], scores[k + 1]
            den = a - 2 * b + c
            frac = 0.5 * (a - c) / den if den != 0 else 0.0
        found[i] = cand[k] + frac
    found[:FIRST_VISIBLE] = found[FIRST_VISIBLE]
    # a deriva é lenta e contínua: uma média móvel tira o tremor da medição
    pad = np.pad(found, 6, mode="edge")
    offsets[name] = np.convolve(pad, np.ones(13) / 13, mode="valid")
    print(f"{name}: deriva de {offsets[name][0]:+.1f} px a {offsets[name][-1]:+.1f} px", file=sys.stderr)


# ---------------------------------------------------------------------------
# Máscaras por quadro
# ---------------------------------------------------------------------------
def smooth_fill(img, mask, known, sigmas=(2, 4, 8, 16, 32)):
    """Média ponderada dos pixels conhecidos, da escala menor para a maior (convolução normalizada)."""
    f = img.astype(np.float32)
    k = known.astype(np.float32)
    est = f.copy()
    todo = mask.copy()
    for s in sigmas:
        den = cv2.GaussianBlur(k, (0, 0), s)
        num = cv2.GaussianBlur(f * k[..., None], (0, 0), s)
        ok = todo & (den > 0.2)
        est[ok] = (num / np.maximum(den, 1e-6)[..., None])[ok]
        todo &= ~ok
    return est


def color_halo(lab, base, protect):
    """Pixels perto do traço cuja cor se afasta do fundo: a franja que a compressão deixa."""
    bg = smooth_fill(lab, dilate(base, 2), ~dilate(base, 2) & ~protect, sigmas=(8, 16, 32))
    bg = cv2.GaussianBlur(bg, (0, 0), 3)
    d = lab - bg
    dev = np.sqrt(d[..., 0] ** 2 + (2 * d[..., 1]) ** 2 + (2 * d[..., 2]) ** 2)
    return (dev > HALO) & dilate(base, HALO_REACH)


def window(box, pad=PAD):
    x0, y0, x1, y1 = box
    return slice(max(y0 - pad, 0), min(y1 + pad, H)), slice(max(x0 - pad, 0), min(x1 + pad, W))


# Cor da parede atrás dos ícones nos quadros de referência: sobre ela a máscara pode crescer até
# o ruído de compressão; sobre a mão, não (seguiria as dobras dos dedos e borraria a unha).
wall_ref = {
    name: cv2.GaussianBlur(np.median(np.stack([labs[i][window(e["box"])] for i in e["ref"]]), axis=0), (0, 0), 1.5)
    for name, e in ELEMENTS.items()
    if not e["expand"]
}


def fill_holes(m, max_area):
    """Ilhas cercadas pela máscara (miolo de letras) entram nela: sozinhas no meio do
    preenchimento liso, virariam pintas. O que toca a borda da janela é fundo, não ilha."""
    n, labels, stats, _ = cv2.connectedComponentsWithStats((~m).astype(np.uint8), connectivity=4)
    x, y, w, h, area = (stats[:, k] for k in range(5))
    edge = (x == 0) | (y == 0) | (x + w == m.shape[1]) | (y + h == m.shape[0])
    hole = (area <= max_area) & ~edge
    hole[0] = False
    return m | hole[labels]


def frame_masks(i):
    """Devolve (máscara total, parte sobre parede parada, pixels que não servem de borda)."""
    protect = scene_object(labs[i])
    m = np.zeros((H, W), bool)
    wall = np.zeros((H, W), bool)
    for name, e in ELEMENTS.items():
        win = window(e["box"])
        lab, prot = labs[i][win], protect[win]
        base = (shift(templates[name], offsets[name][i]) > (THRESH if e["expand"] else ICON_T))[win]
        if e["expand"]:
            # o que o quadro mostra de diferente do modelo, mas só colado ao desenho dele
            own = (dark[i][win] > THRESH) & dilate(base, GROW) & ~prot
            core = dilate(base, 1)
            grown = (dilate(base | own, GROW) & ~prot) | core
            grown |= color_halo(lab, grown, prot) & ~prot
            part = dilate(grown, 1) & ~(prot & ~core)
        else:
            # Linhas claras e finas, desenhadas também por cima da mão e da calda: a máscara é o
            # próprio traço, sem fundir as linhas, para o preenchimento seguir a textura dos dedos.
            # Sobre a parede entra também a franja escura da compressão; sobre a mão e a calda, só o
            # que é mais claro que o entorno (as linhas), nunca as dobras escuras dos dedos.
            d = cv2.GaussianBlur(lab, (0, 0), 1.5) - wall_ref[name]
            on_wall = np.sqrt((d ** 2).sum(axis=2)) < WALL_DE
            li = lightness(frames[i])[win]
            noise = dilate(base, 2) & ((on_wall & (np.abs(li) > ICON_NOISE_T)) | (~on_wall & (li > ICON_NOISE_T)))
            part = base | noise
        if e.get("close"):
            # A palavra inteira entra na máscara (miolo e vãos entre as letras): um pedaço de flor
            # desfocada que sobrasse ali, cercado de parede lisa, viraria uma pinta clara.
            k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * CLOSE + 1, 2 * CLOSE + 1))
            closed = cv2.morphologyEx(part.astype(np.uint8), cv2.MORPH_CLOSE, k) > 0
            part = fill_holes(closed, closed.size) & ~(prot & ~dilate(base, 1))
        elif e["expand"]:
            part = fill_holes(part, HOLE)
        m[win] |= part
        if e["wall"]:
            wall[win] |= part
    # a borda desfocada das folhas também fica fora, senão escurece a parede em volta
    return m, wall, dilate(protect, BLOCK_REACH) & ~m


# ---------------------------------------------------------------------------
# Preenchimento, suavização temporal e grão
# ---------------------------------------------------------------------------
def relax(u, mask, blocked):
    """Relaxamento de Jacobi até um preenchimento harmônico, só dentro da máscara.
    Pixels bloqueados (objetos da cena) não servem de borda: o fluxo através deles é nulo."""
    n, _, stats, _ = cv2.connectedComponentsWithStats(dilate(mask, 2).astype(np.uint8))
    for k in range(1, n):
        x, y, w, h = stats[k, :4]
        x0, y0 = max(x - 1, 1), max(y - 1, 1)
        x1, y1 = min(x + w + 1, W - 1), min(y + h + 1, H - 1)
        v = u[y0 - 1:y1 + 1, x0 - 1:x1 + 1]
        ok = (~blocked[y0 - 1:y1 + 1, x0 - 1:x1 + 1]).astype(np.float32)[..., None]
        inner = mask[y0:y1, x0:x1]
        wsum = ok[:-2, 1:-1] + ok[2:, 1:-1] + ok[1:-1, :-2] + ok[1:-1, 2:]
        free = inner & (wsum[..., 0] > 0)
        for _ in range(RELAX):
            vk = v * ok
            avg = (vk[:-2, 1:-1] + vk[2:, 1:-1] + vk[1:-1, :-2] + vk[1:-1, 2:]) / np.maximum(wsum, 1)
            core = v[1:-1, 1:-1]
            core[free] = avg[free]
    return u


masks, walls, filled = [], [], []
for i in range(N):
    m, wall, blocked = frame_masks(i)
    u = smooth_fill(frames[i], m, ~m & ~blocked)
    filled.append(relax(u, m, blocked))
    masks.append(m)
    walls.append(wall)

os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)
for i in range(N):
    lo, hi = max(0, i - TIME_WIN), min(N, i + TIME_WIN + 1)
    fill = filled[i].copy()
    avg = np.mean(np.stack(filled[lo:hi]), axis=0)
    fill[walls[i]] = avg[walls[i]]
    fill += rng.normal(0, GRAIN, fill.shape).astype(np.float32)
    # borda macia de 1 px entre o preenchimento e a imagem original
    alpha = cv2.GaussianBlur(masks[i].astype(np.float32), (0, 0), 0.8)
    alpha = np.maximum(alpha, masks[i].astype(np.float32))[..., None]
    res = frames[i].astype(np.float32) * (1 - alpha) + fill * alpha
    cv2.imwrite(os.path.join(out, os.path.basename(paths[i])), np.clip(res.round(), 0, 255).astype(np.uint8))
