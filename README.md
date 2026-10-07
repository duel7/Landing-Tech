# Site — [Nome da marca]

Página única de apresentação de relógios masculinos: abertura com vídeo, coleção, um modelo em detalhe, a marca e um formulário de atendimento. HTML, CSS e JavaScript sem dependências nem etapa de build.

> **Conteúdo provisório.** Tudo o que aparece entre colchetes — `[Nome da marca]`, `[Referência]`, `[Material da caixa]`… — é um marcador a substituir por informação confirmada. No site, esses trechos têm sublinhado pontilhado para nunca passarem por dados reais. Nenhuma especificação, história, preço ou dado de contato foi inventado.

## Abrir localmente

Qualquer servidor estático serve. Por exemplo:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

## Estrutura

```
index.html              página (conteúdo, metadados, marcadores)
assets/css/main.css     tokens de cor e tipo, layout, componentes, movimento
assets/js/main.js       menu, cabeçalho, entradas, vídeo, coleção, pontos, formulário
assets/fonts/           Newsreader e Archivo (woff2 variáveis, licença OFL)
assets/media/           vídeo, pôster e imagens derivadas do vídeo de referência
assets/favicon.svg      ícone provisório (mostrador neutro)
tools/                  scripts que geraram a mídia a partir do vídeo de referência
```

## Direção de arte

- **Paleta da própria fotografia**: azul da hora azul (`--ink`), marfim das flores (`--ivory`, `--paper`), cinza do granito (`--steel`) e o tom rosé da caixa (`--rose`), usado só em detalhes. Contrastes conferidos (texto principal 15:1, secundário 7,7:1, bordas de campo 3,8:1).
- **Tipografia**: Newsreader (serifada editorial com tamanhos ópticos) para títulos e textos de leitura; Archivo expandida, em caixa-alta espaçada, para rótulos, navegação e ficha técnica — como a impressão de um mostrador.
- **Sistema de seções**: cada seção é marcada por uma "hora" — 03 Coleção, 06 Em detalhe, 09 A casa, 12 Atendimento — com um pequeno mostrador cujo ponteiro aponta para ela. O mesmo anel de minutos aparece nos espaços reservados para fotografia.
- **Movimento** (inspirado no vídeo de referência: avanço lento de câmera, reflexo de luz, foco raso): título surge linha a linha; a fotografia da abertura se abre com um leve recuo; ao rolar, ela ganha escala e profundidade; os pontos do detalhe aparecem em sequência e acendem conforme a leitura da lista. Tudo é desligado com "reduzir movimento" e simplificado em telas de toque; sem JavaScript, o conteúdo aparece completo.

## O que precisa ser fornecido

### Informações (marcadores no `index.html`)

| Marcador | Onde aparece |
| --- | --- |
| `[Nome da marca]` e logotipo (SVG) | `<title>`, metadados de compartilhamento, cabeçalho, rodapé. O logotipo substitui `.wordmark__text`. |
| `[Nome da coleção]` | Abertura |
| `[Nome do modelo]`, `[Tipo]`, `[Material da caixa]`, `[Cor do mostrador]`, `[Diâmetro]` | Coleção (4 modelos), legendas e opções do formulário |
| `[Referência]` e ficha técnica: movimento, funções, caixa, diâmetro, espessura, vidro, resistência à água, pulseira, fecho | Em detalhe |
| Origem da marca, processo, ano de fundação, sede, local de montagem | A casa |
| E-mail, telefone ou WhatsApp, endereço e horário | Atendimento |
| Link da política de privacidade | Consentimento do formulário |
| Razão social e CNPJ | Rodapé |

Para localizar todos: procure por `class="ph"` ou por `[` no `index.html`.

A quantidade de modelos (4) segue o vídeo de referência; para mudar, duplique ou remova um `<li class="model">`, a `div` correspondente em `.collection__preview` e a opção em `#f-modelo`.

### Fotografia e vídeo

A mídia atual foi extraída do vídeo de referência e está limitada à resolução dele (ver abaixo). Para a qualidade que o layout comporta:

| Uso | Formato | Tamanho mínimo |
| --- | --- | --- |
| Abertura (vídeo ou foto) | horizontal ~2:1; manter o relógio no terço central, pois o celular recorta em 4:3 | 3840 px de largura (4K); vídeo de 8–15 s sem áudio, com plano estável |
| Coleção, um por modelo | vertical 4:5, fundo neutro, mesma luz para todos | 2000 px de largura |
| Em detalhe | vertical 4:5, relógio inteiro e nítido | 2000 px de largura |
| A casa | horizontal 3:2, ateliê ou bancada | 2400 px de largura |
| Compartilhamento | 1200 × 630 | — |

Ao trocar a imagem de **Em detalhe**, reposicione os pontos: cada botão `.hotspot` tem `--x` e `--y` em porcentagem da imagem.

Exporte em AVIF, WebP e JPEG com os nomes atuais em `assets/media/` (ou ajuste os `<source>`). Para o vídeo, WebM (VP9) e MP4 (H.264), sem áudio, com `-movflags +faststart`.

## Formulário de atendimento

O formulário valida os campos no navegador (mensagens em português, foco no primeiro erro, avisos lidos por leitores de tela) e precisa de um destino. Configure **um** dos atributos em `<form data-contact-form>`:

- `data-endpoint="https://…"` — endereço de um serviço de formulários que aceite `POST` (`multipart/form-data`) e responda com status 2xx. O site mostra sucesso ou erro conforme a resposta.
- `data-email="atendimento@…"` — sem serviço externo: abre o aplicativo de e-mail do visitante com a mensagem pronta.

Enquanto nenhum dos dois estiver preenchido, o envio mostra "O envio ainda não está configurado" em vez de fingir sucesso. Campos enviados: `nome`, `email`, `telefone`, `assunto`, `modelo`, `preferencia`, `mensagem`, `consentimento`. Há um campo invisível (`empresa`) que descarta envios automatizados.

## Sobre a mídia atual

- O vídeo de referência tem 1280 × 720 px e mostra um mockup de página: a cena útil, sem a interface, tem **864 × 424 px**. Os textos sobrepostos ("TIME", "BEYOND", chamadas) foram removidos digitalmente por `tools/limpar_quadros.py`; o loop usa o trecho em que as linhas de chamada já não aparecem.
- Nenhuma imagem foi ampliada artificialmente. Por isso, em telas grandes e de alta densidade a fotografia aparece mais macia do que o ideal; o layout limita a largura dela para reduzir o efeito.
- O mostrador traz o nome **"CHRONEX"**, como no vídeo. Confirme se este é o nome da marca e se o relógio mostrado é um produto real dela antes de publicar.
- Os textos de **Em detalhe** descrevem apenas o que se vê na imagem (mostrador preto, três submostradores, janela de data, coroa entre dois botões, pulseira com pesponto). A designação "cronógrafo" vem da aparência da peça e deve ser confirmada.

Para regenerar a mídia a partir do vídeo: `tools/preparar_midia.sh caminho/do/video.mp4` (requer ffmpeg e Python com numpy e Pillow).

## Antes de publicar

- [ ] Substituir todos os marcadores entre colchetes e o favicon provisório.
- [ ] Trocar `og:image` por um endereço absoluto (`https://…/assets/media/compartilhamento.jpg`) e acrescentar `<link rel="canonical">`.
- [ ] Acrescentar dados estruturados (`Organization`, e `Product` por modelo quando houver especificações) com nome e endereço reais.
- [ ] Configurar o destino do formulário e a política de privacidade.
- [ ] Substituir a mídia provisória pela fotografia definitiva.

## Licenças

Newsreader e Archivo: SIL Open Font License 1.1 (arquivos em `assets/fonts/`).
