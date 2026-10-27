# Site — Confeitaria Águas Lindas

Página única da confeitaria, feita para levar o visitante ao pedido: abertura com o vídeo aprovado, o que dá para encomendar, como pedir em 3 passos e uma faixa final de pedido. Todos os botões de pedido abrem o WhatsApp com a mensagem já escrita. HTML, CSS e JavaScript sem dependências nem etapa de build — a mesma base do site de relógios na raiz deste repositório.

> **Para os botões funcionarem, falta o número do WhatsApp** (ver *Contato e WhatsApp*). Enquanto ele não for preenchido, os botões levam à faixa de pedido no fim da página.

## Abrir localmente

Qualquer servidor estático serve. Por exemplo, nesta pasta:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

## Estrutura

```
index.html              página (conteúdo, metadados, configuração do contato no <body>)
assets/css/main.css     tokens de cor e tipo, layout, componentes, movimento
assets/js/main.js       cabeçalho, menu, entradas, vídeo da abertura, links de pedido e contato
assets/fonts/           EB Garamond e Manrope (woff2 variáveis, licença OFL)
assets/media/           vídeo, imagens e logo derivados do vídeo aprovado
tools/                  scripts que geraram a mídia a partir do vídeo aprovado
```

## Direção de arte

- **O vídeo é a peça principal e não é reinterpretado.** Ele aparece com as cores, o enquadramento e o movimento originais: sem filtros CSS, sem zoom, sem parallax, sem camada colorida por cima. Só foi retirada a interface que vinha gravada nele (ver *Sobre a mídia*).
- **Paleta tirada do vídeo**: rosa da parede e do pedestal nos fundos ao redor dele, creme (`--cream`) e rosa claro (`--blush`) alternando entre as seções, bordô (`--wine`) nos títulos, castanho do chocolate (`--cocoa`) no texto e o vermelho-cereja (`--cherry`) reservado à ação principal. Contrastes conferidos: texto 14:1 sobre o creme, texto secundário 6,5:1, títulos 10,7:1, botão principal 6,7:1, menu sobre a parte mais escura do vídeo 5:1.
- **Tipografia**: EB Garamond (serifada clássica, próxima do título do vídeo) nos títulos; Manrope na interface e nos textos. A Cormorant Garamond, primeira escolha, foi trocada porque o circunflexo dela (você, três, pôr) fica alto e pontudo demais em português. Caixa-alta espaçada só na chamada da abertura, no menu, nos rótulos e nos botões.
- **Textos**: diretos, voltados ao pedido — o que dá para encomendar, como pedir e um convite claro para chamar no WhatsApp. Sem frases de efeito.
- **Composição da abertura**: em telas deitadas, o vídeo ocupa a abertura inteira e o texto ocupa o espaço vazio à esquerda, como no mockup aprovado. O recorte muda conforme a proporção da tela para o bolo e o pedestal ficarem sempre inteiros:
  - 16:9 a 21:10 (Full HD, QHD, 4K, notebooks): vídeo de borda a borda, cortando no máximo ~15 % da altura — mais do alto que da base do pedestal;
  - 5:4 a 16:9 (tablets deitados, telas 16:10): corte nas laterais, ancorado no bolo;
  - acima de 21:10 (ultralargos): vídeo inteiro, sem corte, ancorado à direita, com a borda esquerda dissolvida no rosa da parede;
  - celular e tablet em pé: o texto vem primeiro, sobre o rosa da parede, e o vídeo vem abaixo, recortado em volta do bolo (o recorte mostra sempre mais que a largura do bolo).
- **Telas grandes**: acima de 1920 px de largura a escala inteira (texto, espaços, componentes) cresce com a tela, para um monitor 4K com zoom de 100 % ter a mesma composição do Full HD, sem se espalhar nem ficar miúda. Com zoom de 200 % (o padrão do 4K na maioria dos sistemas), o navegador já entrega a composição do Full HD com o dobro de densidade.
- **Movimento**: o cabeçalho e o texto da abertura entram em sequência curta, enquanto o vídeo começa; ao rolar, títulos e textos sobem de leve e as imagens se abrem de baixo para cima; botões e links respondem ao cursor com deslocamentos mínimos. Tudo é desligado com "reduzir movimento"; sem JavaScript, o conteúdo aparece completo.

## O vídeo da abertura

- Roda **uma vez**, sem som, com reprodução automática e `playsinline`, e **para no último quadro** — exatamente a composição aprovada. O vídeo não tem um ponto de emenda: do último para o primeiro quadro a câmera salta e a calda de chocolate mudaria de direção se ele fosse tocado de trás para frente. Por isso não há loop.
- Um botão discreto no canto inferior direito pausa, retoma e revê a animação (exigência de acessibilidade para movimento automático com mais de 5 s).
- Antes de rodar, a abertura mostra o primeiro quadro como imagem (o mesmo em que o vídeo começa, então a troca não se nota). O vídeo só é baixado depois que a página carrega, e não é baixado quando o visitante pede economia de dados ou está em conexão 2G — nesses casos, e se o arquivo falhar, fica a imagem.
- Com "reduzir movimento" ativo, o vídeo não roda e a abertura mostra o último quadro.
- Fora da tela, o vídeo pausa; ao voltar, continua de onde parou.
- Formatos: WebM (VP9) e MP4 (H.264), sem áudio; o navegador baixa só um deles.

## O que precisa ser preenchido

### Contato e WhatsApp

Tudo fica no `<body>` do `index.html` (há um comentário logo acima dele):

| Atributo | O que faz |
| --- | --- |
| `data-whatsapp="5561900000000"` | DDI + DDD + número, só dígitos. Todos os botões de pedido (topo, cabeçalho, menu, produtos, passos e faixa final) passam a abrir o WhatsApp com a mensagem pronta, e o número aparece na faixa final. |
| `data-instagram="perfil"` | Nome do perfil, sem @. Aparece na faixa final, com link. |
| `data-endereco="Rua…, nº — bairro, cidade"` | Aparece na faixa final, com link para o mapa. |
| `data-horario="Seg. a sáb., 9h às 18h"` | Aparece na faixa final. |

Campo vazio não aparece. Sem nenhum canal preenchido, a faixa final mostra só o convite e o botão, centralizados.

### Produtos

Os itens ficam na lista `<ul class="offers">`: **Bolos**, **Doces** e **Encomendas especiais** (categorias do briefing; Salgados ficou de fora por não aparecer no vídeo). Cada `<li class="offer">` tem o nome, uma frase e um botão com a mensagem própria em `data-whatsapp-text` — "Olá! Quero encomendar um bolo.", por exemplo. Confirme se as categorias e as frases correspondem ao que a confeitaria faz; para incluir um item, copie um `<li>`, para tirar, apague.

A foto ao lado da lista (só em telas largas — no celular o mesmo bolo acabou de aparecer no vídeo) é o bolo do vídeo, `assets/media/bolo.*`. Com fotografias reais dos produtos, ela pode ser trocada mantendo o nome dos arquivos (vertical 4:5, de preferência com 1600 px de largura ou mais).

### Logo

A logo atual (`assets/media/logo.png` e `logo.webp`) foi **extraída do próprio vídeo**: lá ela tem cerca de 120 × 80 px, então em telas de alta densidade aparece um pouco macia. Ela não foi redesenhada nem redigitada — as tintas e as formas são as do vídeo. Assim que o arquivo original existir, de preferência em SVG, substitua `logo.png` (mantendo o nome, ou ajuste os dois `<img class="brand__logo">`) e o `favicon.png`.

## Sobre a mídia

- O vídeo aprovado (1024 × 576 px, 8 s, 24 qps) é um mockup de página: logo, menu, ícones de carrinho e menu, chamada, título e botão estavam desenhados sobre a cena. Esses elementos foram **apagados digitalmente** por `tools/limpar_quadros.py`, porque no site eles existem como HTML de verdade — senão apareceriam duplicados (e com os erros de grafia do mockup, como "Pedacinno" e "Proodutos"). Os pixels fora das letras saem idênticos aos originais.
- **As cores não foram alteradas.** A conversão de cor usa BT.709 na leitura e na gravação, como o arquivo original declara.
- **Nada foi ampliado artificialmente.** A resolução do vídeo é a do arquivo aprovado, 1024 × 576 px; em Full HD ele é exibido a 1,9× e em 4K a 3,75×, então fica naturalmente mais macio que o texto ao redor. Para nitidez total em telas grandes, o ideal é exportar o mesmo vídeo em 1920 × 1080 (Full HD) ou 3840 × 2160 (4K), sem a interface e sem áudio, e rodar `tools/preparar_midia.sh` com ele (ajustando as coordenadas das máscaras, ou pulando a limpeza se o vídeo já vier limpo).
- Onde ficavam o título e as demais letras, a parede é reconstruída a partir do entorno; ali os raios de luz ficam um pouco mais suaves que no resto do quadro. É justamente a área ocupada pelo título do site nas telas deitadas, e ela fica fora do recorte no celular em pé.
- No canto superior direito, as linhas do ícone de menu do mockup passavam por cima dos dedos da mão que despeja a calda; ali o preenchimento segue a unha e pode deixar um leve brilho. Esse canto fica sob o cabeçalho ou fora do recorte em todas as composições do site.
- `bolo.*` é um recorte do último quadro (o bolo no pedestal) e `compartilhamento.jpg`, o quadro final em 1,91:1 para redes sociais. Os textos alternativos descrevem apenas o que se vê.

Para regenerar a mídia a partir do vídeo: `tools/preparar_midia.sh caminho/do/video.mp4` (requer ffmpeg e Python com numpy, opencv-python-headless e Pillow).

## Antes de publicar

- [ ] Preencher `data-whatsapp` (e, se houver, Instagram, endereço e horário) no `<body>`.
- [ ] Confirmar as categorias e as frases dos produtos.
- [ ] Trocar a logo e o favicon pelos arquivos originais.
- [ ] Trocar `og:image` por um endereço absoluto (`https://…/assets/media/compartilhamento.jpg`) e acrescentar `<link rel="canonical">`.
- [ ] Acrescentar dados estruturados (`Bakery`, com nome, endereço, telefone e horário reais).

## Licenças

EB Garamond e Manrope: SIL Open Font License 1.1 (arquivos em `assets/fonts/`).
