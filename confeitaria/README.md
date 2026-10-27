# Site — Confeitaria Águas Lindas

Página única da confeitaria: abertura com o vídeo aprovado, produtos, sobre nós e encomendas/contato. HTML, CSS e JavaScript sem dependências nem etapa de build — a mesma base do site de relógios na raiz deste repositório.

> **Conteúdo provisório.** Tudo o que aparece entre colchetes — `[Categoria ou produto]`, `[(DDD) número]`, `[Dias e horários]`… — é um marcador a substituir por informação confirmada. No site, esses trechos têm sublinhado pontilhado para nunca passarem por dados reais. Nenhum produto, preço, depoimento, história ou dado de contato foi inventado.

## Abrir localmente

Qualquer servidor estático serve. Por exemplo, nesta pasta:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

## Estrutura

```
index.html              página (conteúdo, metadados, marcadores, configuração do contato)
assets/css/main.css     tokens de cor e tipo, layout, componentes, movimento
assets/js/main.js       cabeçalho, menu, entradas, vídeo da abertura, links de contato
assets/fonts/           Cormorant Garamond e Manrope (woff2 variáveis, licença OFL)
assets/media/           vídeo, imagens e logo derivados do vídeo aprovado
tools/                  scripts que geraram a mídia a partir do vídeo aprovado
```

## Direção de arte

- **O vídeo é a peça principal e não é reinterpretado.** Ele aparece com as cores, o enquadramento e o movimento originais: sem filtros CSS, sem zoom, sem parallax, sem camada colorida por cima. Só foi retirada a interface que vinha gravada nele (ver *Sobre a mídia*).
- **Paleta tirada do vídeo**: rosa da parede e do pedestal nos fundos ao redor dele, creme (`--cream`) e rosa claro (`--blush`) alternando entre as seções, bordô (`--wine`) nos títulos, castanho do chocolate (`--cocoa`) no texto e o vermelho-cereja (`--cherry`) reservado à ação principal. Contrastes conferidos: texto 14:1 sobre o creme, texto secundário 6,5:1, títulos 10,7:1, botão principal 6,7:1, menu sobre a parte mais escura do vídeo 5:1.
- **Tipografia**: Cormorant Garamond (serifada de alto contraste, a mais próxima do título do vídeo) nos títulos; Manrope na interface e nos textos. Caixa-alta espaçada só na chamada da abertura, no menu, nos rótulos e nos botões.
- **Composição da abertura**: em telas deitadas, o vídeo ocupa a abertura inteira e o texto ocupa o espaço vazio à esquerda, como no mockup aprovado. O recorte muda conforme a proporção da tela para o bolo e o pedestal ficarem sempre inteiros:
  - 16:9 a 21:10 (Full HD, QHD, 4K, notebooks): vídeo de borda a borda, cortando no máximo ~15 % da altura — mais do alto que da base do pedestal;
  - 5:4 a 16:9 (tablets deitados, telas 16:10): corte nas laterais, ancorado no bolo;
  - acima de 21:10 (ultralargos): vídeo inteiro, sem corte, ancorado à direita, com a borda esquerda dissolvida no rosa da parede;
  - celular e tablet em pé: o texto vem primeiro, sobre o rosa da parede, e o vídeo vem abaixo, recortado em volta do bolo (o recorte mostra sempre mais que a largura do bolo).
- **Telas grandes**: acima de 1920 px de largura a escala inteira (texto, espaços, componentes) cresce com a tela, para um monitor 4K com zoom de 100 % ter a mesma composição do Full HD, sem se espalhar nem ficar miúda. Com zoom de 200 % (o padrão do 4K na maioria dos sistemas), o navegador já entrega a composição do Full HD com o dobro de densidade.
- **Elemento gráfico**: o arco com borda recortada das molduras de produto e da foto do Sobre vem do pedestal do vídeo.
- **Movimento**: o cabeçalho e o texto da abertura entram em sequência curta, enquanto o vídeo começa; ao rolar, títulos e textos sobem de leve e as imagens se abrem de baixo para cima; botões e links respondem ao cursor com deslocamentos mínimos. Tudo é desligado com "reduzir movimento"; sem JavaScript, o conteúdo aparece completo.

## O vídeo da abertura

- Roda **uma vez**, sem som, com reprodução automática e `playsinline`, e **para no último quadro** — exatamente a composição aprovada. O vídeo não tem um ponto de emenda: do último para o primeiro quadro a câmera salta e a calda de chocolate mudaria de direção se ele fosse tocado de trás para frente. Por isso não há loop.
- Um botão discreto no canto inferior direito pausa, retoma e revê a animação (exigência de acessibilidade para movimento automático com mais de 5 s).
- Antes de rodar, a abertura mostra o primeiro quadro como imagem (o mesmo em que o vídeo começa, então a troca não se nota). O vídeo só é baixado depois que a página carrega, e não é baixado quando o visitante pede economia de dados ou está em conexão 2G — nesses casos, e se o arquivo falhar, fica a imagem.
- Com "reduzir movimento" ativo, o vídeo não roda e a abertura mostra o último quadro.
- Fora da tela, o vídeo pausa; ao voltar, continua de onde parou.
- Formatos: WebM (VP9) e MP4 (H.264), sem áudio; o navegador baixa só um deles.

## O que precisa ser fornecido

### Informações (marcadores no `index.html`)

| Marcador | Onde aparece |
| --- | --- |
| `[Categoria ou produto]` e `[Descrição curta…]` | Produtos (4 peças). Use só o catálogo real: categorias, sabores, tamanhos ou ocasiões confirmados. |
| História da confeitaria | Sobre nós (um parágrafo). |
| WhatsApp, Instagram | Encomendas e contato — ver configuração abaixo. |
| `[Rua, número — bairro, cidade]`, `[Dias e horários]` | Encomendas e contato: edite o texto dos itens. |

Para localizar todos: procure por `class="ph"` ou por `[` no `index.html`.

### Contato e WhatsApp

Na `<section id="contato">`:

- `data-whatsapp="55DDDNUMERO"` — número com DDI e DDD, só dígitos. Com ele preenchido, o botão **Conversar pelo WhatsApp** abre a conversa com a mensagem de `data-whatsapp-text`, e o número aparece formatado na lista de canais. Enquanto estiver vazio, o botão leva à lista de canais, onde fica o marcador.
- `data-instagram="perfil"` — nome do perfil, sem @; o item Instagram vira link.

### Produtos

Cada `<li class="product">` é uma peça; o comentário acima da lista no `index.html` traz o trecho pronto para trocar a moldura pela fotografia. As classes `product--a` a `product--d` definem posição e proporção:

| Peça | Proporção | Tamanho mínimo da foto |
| --- | --- | --- |
| `product--a` | horizontal 5:4 | 2000 px de largura |
| `product--b`, `product--c` | vertical 4:5 | 1600 px de largura |
| `product--d` | quadrada 1:1 | 1800 px de lado |

Fotografias da mesma sessão, com a mesma luz e fundos em tons de creme ou rosa, mantêm a página coerente com o vídeo. Exporte em AVIF e JPEG (ou WebP). Para menos peças, apague um `<li>`; para mais, repita o padrão das peças `c` e `d` (o grid de 12 colunas está em `.products__grid` no CSS).

### Logo

A logo atual (`assets/media/logo.png` e `logo.webp`) foi **extraída do próprio vídeo**: lá ela tem cerca de 120 × 80 px, então em telas de alta densidade aparece um pouco macia. Ela não foi redesenhada nem redigitada — as tintas e as formas são as do vídeo. Assim que o arquivo original existir, de preferência em SVG, substitua `logo.png` (mantendo o nome, ou ajuste os dois `<img class="brand__logo">`) e o `favicon.png`.

## Sobre a mídia

- O vídeo aprovado (1024 × 576 px, 8 s, 24 qps) é um mockup de página: logo, menu, ícones de carrinho e menu, chamada, título e botão estavam desenhados sobre a cena. Esses elementos foram **apagados digitalmente** por `tools/limpar_quadros.py`, porque no site eles existem como HTML de verdade — senão apareceriam duplicados (e com os erros de grafia do mockup, como "Pedacinno" e "Proodutos"). Os pixels fora das letras saem idênticos aos originais.
- **As cores não foram alteradas.** A conversão de cor usa BT.709 na leitura e na gravação, como o arquivo original declara.
- **Nada foi ampliado artificialmente.** A resolução do vídeo é a do arquivo aprovado, 1024 × 576 px; em Full HD ele é exibido a 1,9× e em 4K a 3,75×, então fica naturalmente mais macio que o texto ao redor. Para nitidez total em telas grandes, o ideal é exportar o mesmo vídeo em 1920 × 1080 (Full HD) ou 3840 × 2160 (4K), sem a interface e sem áudio, e rodar `tools/preparar_midia.sh` com ele (ajustando as coordenadas das máscaras, ou pulando a limpeza se o vídeo já vier limpo).
- Onde ficavam o título e as demais letras, a parede é reconstruída a partir do entorno; ali os raios de luz ficam um pouco mais suaves que no resto do quadro. É justamente a área ocupada pelo título do site nas telas deitadas, e ela fica fora do recorte no celular em pé.
- No canto superior direito, as linhas do ícone de menu do mockup passavam por cima dos dedos da mão que despeja a calda; ali o preenchimento segue a unha e pode deixar um leve brilho. Esse canto fica sob o cabeçalho ou fora do recorte em todas as composições do site.
- `sobre.*` é um recorte do último quadro (o bolo no pedestal) e `compartilhamento.jpg`, o quadro final em 1,91:1 para redes sociais. Os textos alternativos descrevem apenas o que se vê.

Para regenerar a mídia a partir do vídeo: `tools/preparar_midia.sh caminho/do/video.mp4` (requer ffmpeg e Python com numpy, opencv-python-headless e Pillow).

## Antes de publicar

- [ ] Substituir todos os marcadores entre colchetes.
- [ ] Configurar `data-whatsapp` e `data-instagram` na seção de contato.
- [ ] Trocar a logo e o favicon pelos arquivos originais.
- [ ] Trocar as molduras de produto pelas fotografias do catálogo real.
- [ ] Trocar `og:image` por um endereço absoluto (`https://…/assets/media/compartilhamento.jpg`) e acrescentar `<link rel="canonical">`.
- [ ] Acrescentar dados estruturados (`Bakery`, com nome, endereço, telefone e horário reais).

## Licenças

Cormorant Garamond e Manrope: SIL Open Font License 1.1 (arquivos em `assets/fonts/`).
