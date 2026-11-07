# Alvor — clínica de estética (projeto demonstrativo)

Landing page de uma clínica de estética fictícia, feita como peça de demonstração comercial: abertura com fotografia, a clínica, seis tratamentos, o espaço, depoimentos, dúvidas e agendamento pelo WhatsApp. HTML, CSS e JavaScript sem dependências nem etapa de build.

> **Tudo é fictício.** A Alvor não existe. Nome, endereço, telefone, perfil do Instagram, profissionais, valores e depoimentos foram criados para esta demonstração e estão identificados como tal na própria página (rodapé, bloco de agendamento, aviso dos depoimentos e rótulo do botão de WhatsApp). Nenhuma certificação ou resultado clínico foi inventado.

## Abrir localmente

Qualquer servidor estático serve, a partir desta pasta:

```bash
python3 -m http.server 8080
```

ou

```bash
npx serve .
```

## Estrutura

```
index.html                 página (conteúdo, metadados, ícones em sprite SVG)
assets/css/main.css        tokens, componentes, seções, responsivo e movimento
assets/js/main.js          WhatsApp, cabeçalho, menu, revelações, tratamentos, FAQ, botão flutuante
assets/fonts/              Libre Caslon Text e Geist (woff2, licença OFL)
assets/img/                fotografias tratadas em AVIF, WebP e JPEG + imagem de compartilhamento
assets/favicon.svg         ícone (o "alvor" — sol nascendo sobre a linha do horizonte)
tools/preparar_imagens.py  recorte, tratamento de cor e exportação das fotografias
tools/demo/                palco e roteiro que gravam o vídeo de demonstração
demo/alvor-demo.mp4        vídeo de demonstração (1080p, ~80 s)
```

## Do modelo à Alvor

O ponto de partida foi o modelo de estilo *"clinical journal in morning light"* (CodeMakers): tela clara, autoridade pela contenção, uma única palavra colorida num título serifado.

**Mantido do modelo** — porque já funciona para um negócio de saúde e bem-estar:

- tela clara com **uma única camada de cartão** e elevação só por linha fina (nenhuma sombra difusa);
- **serifada editorial** na abertura e nos títulos de seção, **Geist** na interface, com tracking negativo que aumenta com o tamanho;
- a **palavra-assinatura**: um único termo do título na cor da marca ("tempo", "método", "desacelerar", "avaliação");
- **pílula de categoria** com contorno acima do título, **faixa de anúncio** no topo, **cabeçalho fixo** com botão-fantasma à direita;
- **cartão flutuante** sobre a foto da abertura (no modelo, uma conversa; aqui, um exemplo de protocolo);
- a **fórmula de prova**: rótulo em caixa-alta → ícone de linha → número grande → legenda;
- botões em pílula — **escuro preenchido + contorno** — e raios só em 8/12 px, 20/24 px ou pílula;
- largura máxima de 1200 px, texto alinhado à esquerda, colunas de leitura curtas.

**Adaptado** — para virar uma clínica de estética de alto padrão, e não um produto de tecnologia:

- **Paleta tirada das fotografias**: porcelana, linho e areia nas superfícies; o verde clínico virou **verde eucalipto**, amostrado das folhas da foto de hidratação. O fechamento usa uma "noite de eucalipto", quase preta.
- **Assinatura em itálico**: o itálico da Libre Caslon dá à palavra colorida um tom mais humano.
- **Tratamentos sem grade de cartões**: no computador, uma lista editorial com a foto fixa ao lado, que troca conforme a leitura; no celular, um carrossel com contador.
- **O espaço** em mosaico assimétrico, **depoimentos** com monogramas (sem rostos atribuídos a pessoas inventadas) e **dúvidas** em acordeão.
- A faixa de logos de parceiros do modelo foi omitida: inventar parcerias ou menções na imprensa passaria por informação real.

## Identidade

| Token | Cor | Uso | Contraste |
| --- | --- | --- | --- |
| `--canvas` | `#fbf9f6` | tela | — |
| `--surface` | `#f2eee8` | cartões e faixa de depoimentos | — |
| `--ink` | `#1f1c19` | texto principal, botão escuro | 16,1:1 |
| `--ink-2` | `#3d3833` | texto de leitura | 11,0:1 |
| `--muted` | `#6b635b` | metadados | 5,6:1 (5,1:1 no linho) |
| `--accent` | `#4b5d45` | assinatura, rótulos, ícones | 6,8:1 |
| `--night` | `#1d231f` | agendamento e rodapé | texto claro 14:1 |
| `--accent-light` | `#aebda2` | assinatura sobre fundo escuro | 8,1:1 |

- **Tipografia**: Libre Caslon Text (títulos e assinatura) e Geist (texto e interface).
- **Marca**: "Alvor" é a primeira luz da manhã. O símbolo é um sol nascendo sobre a linha do horizonte; o conceito da clínica é **estética sem pressa**.
- **Ícones**: desenhados em linha de 1,5 px, sempre em verde eucalipto.

## Fotografia

Doze fotos do [Unsplash](https://unsplash.com/license) (uso comercial permitido, sem necessidade de atribuição), escolhidas pela mesma direção: luz natural, sombras macias, linho, pedra, madeira e momentos reais de tratamento. Para que fotos de autores diferentes pareçam da mesma sessão, todas passam pelo mesmo tratamento em `tools/preparar_imagens.py`: balanço de branco levemente quente (só nas fotos frias), azuis e violetas dessaturados e pretos um pouco levantados. Depois são exportadas em AVIF, WebP e JPEG, em três larguras cada.

| Arquivo | Original |
| --- | --- |
| `abertura-perfil` | `images.unsplash.com/photo-1614283233556-f35b0c801ef1` |
| `clinica-maos-hidratante` | `images.unsplash.com/photo-1619451334792-150fd785ee74` |
| `limpeza-de-pele` | `images.unsplash.com/photo-1570172619644-dfd03ed5d881` |
| `hidratacao-profunda` | `images.unsplash.com/photo-1617897903246-719242758050` |
| `peeling-de-renovacao` | `images.unsplash.com/photo-1573461160327-b450ce3d8e7f` |
| `revitalizacao-facial` | `images.unsplash.com/photo-1600428877878-1a0fd85beda8` |
| `drenagem-linfatica` | `images.unsplash.com/photo-1519823551278-64ac92734fb1` |
| `ritual-alvor` | `images.unsplash.com/photo-1590439471364-192aa70c0b53` |
| `espaco-sala-de-banho` | `images.unsplash.com/photo-1507652313519-d4e9174996dd` |
| `espaco-frasco-luz` | `images.unsplash.com/photo-1608571423902-eed4a5ad8108` |
| `espaco-textura` | `images.unsplash.com/photo-1599305090598-fe179d501227` |
| `espaco-serum-marmore` | `images.unsplash.com/photo-1576426863848-c21f53c60b19` |

Para regenerar: baixe cada original (`https://images.unsplash.com/photo-<id>?w=2600&q=92&fm=jpg`, salvo como `<id>.jpg`) e rode `python3 tools/preparar_imagens.py pasta-dos-originais` (requer Pillow com AVIF e numpy).

As fotos de **ambiente** são ilustrativas: com um cliente real, substitua-as por fotografias do espaço dele, com a mesma luz e o mesmo tratamento.

## Interação, acessibilidade e desempenho

- Abertura com título revelado linha a linha e foto que se abre; seções entram com um leve deslocamento; foto dos tratamentos com transição cruzada; acordeão com altura animada; link da seção atual marcado na navegação.
- Tudo é desligado com "reduzir movimento". **Sem JavaScript**, o conteúdo aparece completo e os links continuam funcionando.
- HTML semântico, um único `h1`, hierarquia de títulos contínua, texto alternativo descritivo em todas as fotos, link para pular ao conteúdo, foco visível, menu do celular com `Esc` e foco preso enquanto aberto. Verificado com axe-core (sem violações em computador e celular).
- Fontes e imagens auto-hospedadas; a foto da abertura é pré-carregada e as demais usam `loading="lazy"` com `srcset` (AVIF → WebP → JPEG). O primeiro carregamento fica entre 300 KB (computador) e 460 KB (celular de tela densa), sem contar a compressão do servidor.

## Celular

O celular não é o computador encolhido: na abertura, a foto vem logo depois do título e os botões ocupam toda a largura; os tratamentos viram um carrossel com contador e botões; depoimentos deslizam para os lados; o menu ocupa a tela com links grandes e o botão de agendamento; o WhatsApp flutuante só aparece depois da abertura e some ao chegar ao bloco de agendamento.

## Vídeo de demonstração

`demo/alvor-demo.mp4` — 1920 × 1080, 60 quadros/s, cerca de 80 segundos, sem áudio: cartela de abertura, tour pela página no computador (entrada da abertura, seções, troca de fotos dos tratamentos, galeria, depoimentos, dúvidas e agendamento), a experiência no celular dentro de um aparelho, com legendas, e uma cartela final que identifica o projeto como demonstrativo.

O vídeo é gravado de forma automática a partir de `tools/demo/demo.html` (palco com cartelas, cursor e moldura de celular) e `tools/demo/gravar_demo.js` (roteiro). Para regravar depois de mudar a página, a partir desta pasta:

```bash
python3 -m http.server 8766 --bind 127.0.0.1
```

```bash
node tools/demo/gravar_demo.js http://127.0.0.1:8766/tools/demo/demo.html demo/alvor-demo.mp4
```

Requer Node com Playwright (Chromium) e ffmpeg com libx264.

## Antes de publicar para um cliente real

- [ ] Trocar o número de WhatsApp: a constante `WHATSAPP` em `assets/js/main.js` **e** os links `wa.me/5511900000000` e `tel:` do `index.html`.
- [ ] Trocar endereço, horários e perfil do Instagram (hoje o perfil é só texto, sem link, para não apontar para uma conta que pode existir).
- [ ] Substituir os depoimentos por avaliações reais, com autorização, e remover o aviso de conteúdo ilustrativo.
- [ ] Rever tratamentos, durações e valores com a equipe responsável pela clínica.
- [ ] Remover os avisos de demonstração do rodapé, do bloco de agendamento e do botão flutuante.
- [ ] Usar endereço absoluto em `og:image`, acrescentar `<link rel="canonical">` e dados estruturados (`BeautySalon`) com os dados reais.
- [ ] Trocar as fotos de ambiente pelas do espaço real.

## Licenças

- Libre Caslon Text e Geist: SIL Open Font License 1.1 (arquivos em `assets/fonts/`).
- Fotografias: [Licença Unsplash](https://unsplash.com/license).
