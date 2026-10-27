# Site — Confeitaria Águas Lindas

Página única da confeitaria, feita para levar o visitante ao pedido: abertura com o vídeo aprovado, **Produtos** (o que dá para encomendar) e **Encomendas** (como funciona, contatos e o formulário de pedido, que monta a mensagem e abre o WhatsApp da confeitaria). HTML, CSS e JavaScript sem dependências nem etapa de build — a mesma base do site de relógios na raiz deste repositório.

> **Para o formulário enviar pedidos, falta o número do WhatsApp** (ver *Contato e WhatsApp*). Sem ele, o formulário valida os dados e avisa que os pedidos ainda não estão ativos — não finge um envio.

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
assets/fonts/           EB Garamond e Manrope (woff2 variáveis, só o estilo normal, licença OFL)
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
- **Movimento**: o cabeçalho e o texto da abertura entram em sequência curta (0,8 s) só com CSS — não esperam o JavaScript, as fontes nem o vídeo, e aparecem junto com a imagem mesmo em conexão lenta. Não há tela de carregamento nem introdução. Ao rolar, títulos, textos e a foto dos produtos surgem com um leve deslocamento; o formulário, que é destino dos botões de pedido, já está no lugar. Tudo é desligado com "reduzir movimento"; sem JavaScript, o conteúdo aparece completo.
- **Ritmo das seções**: abertura (vídeo) → Produtos (creme) → Encomendas (rosa-claro, formulário branco com detalhes bordô) → rodapé (creme). Encomendas usa fundo claro, e não bordô, para continuar a sequência de tons claros da página; o bordô fica nos títulos, nos números e no botão de envio.

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
| `data-whatsapp="5561900000000"` | DDI + DDD + número, só dígitos. É o destino do formulário de pedido; também faz aparecer o número e o link "Prefere conversar? Chamar no WhatsApp" em Encomendas, e o WhatsApp no rodapé. |
| `data-instagram="perfil"` | Nome do perfil, sem @. Aparece em Encomendas e no rodapé, com link. |
| `data-endereco="Rua…, nº — bairro, cidade"` | Aparece em Encomendas, com link para o mapa. |
| `data-horario="Seg. a sáb., 9h às 18h"` | Aparece em Encomendas. |

Campo vazio não aparece em lugar nenhum.

### Formulário de pedido

Campos: o que encomendar (obrigatório), para quando (obrigatório, a partir de hoje), quantas pessoas (opcional), sabor e detalhes (opcional) e nome (obrigatório). Os opcionais são marcados como tal.

- Erros em português ao lado de cada campo, com aviso geral e foco no primeiro campo a corrigir; os erros somem conforme os campos são corrigidos.
- Com o número configurado, o envio abre o WhatsApp da confeitaria com a mensagem montada — produto, data no formato dd/mm/aaaa, pessoas, detalhes e nome — e a página diz: "Abrimos o WhatsApp com o seu pedido. Confira e toque em enviar para a confeitaria receber." O pedido só chega quando a pessoa envia no WhatsApp; a página não anuncia nada além disso.
- Sem o número, nada é aberto: a página avisa que os pedidos ainda não estão ativos e o console registra o que falta configurar.
- Os botões de cada produto levam ao formulário com o item já escolhido.
- Campos com 16 px de texto, para o iPhone não aproximar a tela ao tocar; data com o calendário nativo do aparelho.

### Produtos

Os itens ficam na lista `<ul class="offers">`: **Bolos**, **Doces** e **Encomendas especiais** (categorias do briefing; Salgados ficou de fora por não aparecer no vídeo). Cada `<li class="offer">` tem o nome, uma frase e um botão com `data-order`, que leva ao formulário com aquele item escolhido. Para incluir um item, copie um `<li>` e acrescente a mesma opção no `<select name="produto">`; para tirar, apague os dois. Confirme se as categorias e as frases correspondem ao que a confeitaria faz.

A frase de apresentação da confeitaria fica no início da seção de produtos (há um comentário marcando o lugar): troque-a por um texto real — quem faz, onde fica — quando houver.

**Foto de cada item.** Não há fotografias reais dos produtos no projeto, então os itens aparecem só com número, nome, frase e botão — sem molduras vazias. Quando houver fotos, basta colocar uma `<img class="offer__photo">` como primeiro filho do `<li>` (o comentário acima da lista traz o trecho pronto): o item passa a mostrá-la ao lado do nome, na proporção 4:5 (de preferência 800 px de largura).

**Foto da seção.** Ao lado da lista fica o bolo do vídeo aprovado, `assets/media/bolo.*`: um recorte quadrado de 576 × 576 px do último quadro, com o bolo inteiro, o pedestal e respiro dos dois lados. Ela aparece a partir de 1024 px (no celular e no tablet em pé o mesmo bolo acabou de aparecer no vídeo) e a moldura tem a mesma proporção do arquivo e no máximo 600 px — o CSS não corta nem amplia a imagem além do que ela comporta. Por isso, em monitores 4K com zoom de 100 %, ela fica proporcionalmente menor que o texto: é o limite do arquivo. Com uma fotografia real em alta resolução, troque os arquivos mantendo os nomes e aumente o limite (`max-width` de `.products__figure` e a primeira coluna de `.products__grid`).

### Logo

A logo atual (`assets/media/logo.png` e `logo.webp`) foi **extraída do próprio vídeo**: lá ela tem cerca de 120 × 80 px, então em telas de alta densidade aparece um pouco macia. Ela não foi redesenhada nem redigitada — as tintas e as formas são as do vídeo. Assim que o arquivo original existir, de preferência em SVG, substitua `logo.png` (mantendo o nome, ou ajuste os dois `<img class="brand__logo">`) e o `favicon.png`.

## Sobre a mídia

- O vídeo aprovado (1024 × 576 px, 8 s, 24 qps) é um mockup de página: logo, menu, ícones de carrinho e menu, chamada, título e botão estavam desenhados sobre a cena. Esses elementos foram **apagados digitalmente** por `tools/limpar_quadros.py`, porque no site eles existem como HTML de verdade — senão apareceriam duplicados (e com os erros de grafia do mockup, como "Pedacinno" e "Proodutos"). Os pixels fora das letras saem idênticos aos originais.
- **As cores não foram alteradas.** A conversão de cor usa BT.709 na leitura e na gravação, como o arquivo original declara.
- **Nada foi ampliado artificialmente.** A resolução do vídeo é a do arquivo aprovado, 1024 × 576 px; em Full HD ele é exibido a 1,9× e em 4K a 3,75×, então fica naturalmente mais macio que o texto ao redor. Para nitidez total em telas grandes, o ideal é exportar o mesmo vídeo em 1920 × 1080 (Full HD) ou 3840 × 2160 (4K), sem a interface e sem áudio, e rodar `tools/preparar_midia.sh` com ele (ajustando as coordenadas das máscaras, ou pulando a limpeza se o vídeo já vier limpo).
- Onde ficavam o título e as demais letras, a parede é reconstruída a partir do entorno; ali os raios de luz ficam um pouco mais suaves que no resto do quadro. É justamente a área ocupada pelo título do site nas telas deitadas, e ela fica fora do recorte no celular em pé.
- No canto superior direito, as linhas do ícone de menu do mockup passavam por cima dos dedos da mão que despeja a calda; ali o preenchimento segue a unha e pode deixar um leve brilho. Esse canto fica sob o cabeçalho ou fora do recorte em todas as composições do site.
- `bolo.*` é um recorte quadrado do último quadro (o bolo no pedestal) e `compartilhamento.jpg`, o quadro final em 1,91:1 para redes sociais. Os textos alternativos descrevem apenas o que se vê.

Para regenerar a mídia a partir do vídeo: `tools/preparar_midia.sh caminho/do/video.mp4` (requer ffmpeg e Python com numpy, opencv-python-headless e Pillow).

## Antes de publicar

- [ ] Preencher `data-whatsapp` (e, se houver, Instagram, endereço e horário) no `<body>`.
- [ ] Confirmar as categorias e as frases dos produtos e a frase de apresentação.
- [ ] Trocar a logo e o favicon pelos arquivos originais.
- [ ] Trocar `og:image` por um endereço absoluto (`https://…/assets/media/compartilhamento.jpg`) e acrescentar `<link rel="canonical">`.
- [ ] Acrescentar dados estruturados (`Bakery`, com nome, endereço, telefone e horário reais).

## Licenças

EB Garamond e Manrope: SIL Open Font License 1.1 (arquivos em `assets/fonts/`).
