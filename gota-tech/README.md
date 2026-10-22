# Gota Tech — Sistema sustentável de captação pluvial

Site do projeto de pesquisa escolar **Gota Tech**, da Escola Municipal Anne Frank (Palmas, TO): uma experiência de página única que mostra, em 3D e com animações conduzidas pela rolagem, o percurso da água da chuva — do telhado às calhas, tubos, filtro e reservatório — e os usos não potáveis propostos para a escola.

## Como executar

Requer Node.js 20 ou mais recente.

```bash
cd gota-tech
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # verificação de tipos + build de produção em dist/
npm run preview    # serve o build de produção em http://localhost:4173
```

O build usa caminhos relativos (`base: './'`): o conteúdo de `dist/` pode ser publicado em qualquer servidor estático ou subpasta.

## Tecnologias

| Uso | Biblioteca |
| --- | --- |
| Interface | React 19 + TypeScript, Vite 7 |
| Cena 3D | Three.js, React Three Fiber, drei (ambiente, reflexo do chão, monitor de desempenho), postprocessing (bloom, tone mapping, vinheta) |
| Movimento | GSAP + ScrollTrigger, Lenis (rolagem suave) |
| Efeitos 2D | Canvas 2D (simulação de ondulações) e um shader WebGL próprio (encerramento) |
| Tipografia | Unbounded (marca e numerais), Instrument Sans (texto), Instrument Serif (destaques), JetBrains Mono (legendas técnicas) — via Fontsource, licença OFL |

Toda a geometria é procedural: casa, telhas, calhas, tubulação, filtro, reservatório, vegetação, chuva e água são gerados em código. Não há modelos, texturas ou imagens externas para carregar.

## O que foi implementado

**Abertura (3D).** Ambiente escuro com luz azul; partículas d'água surgem; um plano de varredura revela a arquitetura do chão ao telhado; a luminária acende, as janelas se iluminam e a chuva começa; filetes escorrem pelos canais das telhas até as calhas; a câmera orbita da lateral até revelar o reservatório; o nome GOTA TECH entra letra a letra. Quem rola durante a entrada a acelera.

**O sistema em funcionamento (seção principal).** A cena fica fixa enquanto a rolagem percorre as cinco etapas, com a câmera seguindo a água:

1. **Captação** — a câmera se aproxima do telhado; a chuva se intensifica; respingos e filetes nas telhas; água correndo nas calhas.
2. **Condução** — os tubos ficam translúcidos (raio-x) e um brilho percorre a tubulação à frente da água.
3. **Filtragem** — enquadramento detalhado do filtro: carcaça transparente, tela iluminada e folhas retidas.
4. **Armazenamento** — o reservatório fica translúcido e a água sobe, com ondulações na superfície.
5. **Reaproveitamento** — linhas verdes levam a água à irrigação do canteiro, à limpeza da área externa (torneira e balde) e às descargas sanitárias, com rótulos e anéis pulsando.

Cada etapa tem numeral que "enche de água" conforme a leitura, legenda curta e trilha de progresso clicável com marcação de etapa concluída.

**Microinterações.** A chuva se abre em volta do cursor; a câmera tem paralaxe leve; o chão molhado reflete a cena; o botão principal se enche como água; os títulos sobem de máscaras; o menu indica a seção ativa com uma gota.

**Demais seções.**

- **Cada gota conta** (clara): três ilustrações com tratamentos distintos (gota com nível d'água, curvas de nível com rio, ondas que alcançam a comunidade); o painel alto acompanha a leitura.
- **Aplicação na escola** (verde): ilustração isométrica conceitual com o percurso da água e os três usos; passar o cursor, focar ou tocar em um uso destaca o ponto na ilustração.
- **Materiais e construção** (prancha técnica): vista explodida que se monta com a rolagem e, montada, mostra o fluxo; cada peça (A–D) responde a cursor, toque e teclado com a explicação da função.
- **Pesquisa e desenvolvimento**: linha do tempo das sete etapas da metodologia, com a sétima marcada como condicional.
- **O futuro começa com uma gota**: superfície d'água interativa (cursor e toque criam ondas) e os quatro resultados esperados.
- **Encerramento**: cena de água, luz e vegetação em shader, frase final, assinatura da escola e botão de volta ao início.

**Navegação.** Menu transparente na abertura que ganha fundo desfocado ao rolar e troca para o tema claro sobre seções claras; versão mobile em tela cheia (Esc fecha, foco preso no painel); todos os links levam às seções.

## Fidelidade ao conteúdo da pesquisa

- O texto vem do conteúdo da pesquisa fornecido no briefing (objetivos, justificativa, metodologia, materiais e resultados esperados) e está centralizado em `src/content/site.ts`.
- **O PDF da pesquisa e o vídeo de referência não estavam disponíveis no ambiente de desenvolvimento.** A cena 3D segue a descrição do vídeo dada no briefing (casa com telhado vermelho, calhas, tubulações, reservatório azul e torneira). Vale conferir os textos contra o PDF antes de publicar.
- Nenhum número foi inventado: não há percentuais, litros, custos, capacidade ou medições. Dimensões aparecem como "a definir" e as especificações como "definidas na elaboração da proposta" (etapa 4 da metodologia).
- O site trata o sistema como **proposta em investigação**: não afirma que foi instalado nem que houve economia. A ilustração da escola é identificada como conceitual, e a cena 3D, como "visualização ilustrativa · fora de escala".
- O reservatório traz a etiqueta "água não potável", e as descargas sanitárias aparecem com a ressalva "desde que a instalação seja tecnicamente adequada".

## Desempenho, acessibilidade e alternativas

- **Carregamento progressivo:** a cena 3D (three, R3F, pós-processamento) é um pedaço separado do bundle, carregado depois do conteúdo; enquanto ele chega, a abertura mostra um fundo com chuva em CSS e um indicador "Preparando a cena 3D". O carregamento inicial tem cerca de 150 KB comprimidos, mais as fontes.
- **Perfis de qualidade:** o perfil completo tem reflexo no chão, sombras, bloom, MSAA e mais chuva; o perfil leve (celulares, máquinas com até 4 núcleos ou 4 GB, economia de dados) dispensa esses efeitos. A densidade de pixels é limitada por um orçamento de área (nítido em 4K sem custo excessivo), e um monitor de desempenho reduz a resolução ou desliga os efeitos se a taxa de quadros cair.
- **A cena pausa** quando sai da tela; os canvas 2D e o shader do encerramento só animam quando visíveis.
- **Sem WebGL** (ou se o contexto falhar), a seção principal mostra um diagrama em SVG que acompanha as mesmas cinco etapas.
- **Reduzir movimento:** sem entrada animada; chuva e fluxos ficam parados; a câmera corta entre as poses em vez de voar; rolagem nativa (sem Lenis); as animações de entrada mostram o conteúdo já no lugar.
- **Teclado e leitores de tela:** link para pular ao conteúdo, foco visível, menu mobile com foco preso, peças da prancha e usos da escola acionáveis por teclado; os textos das etapas ficam sempre disponíveis para leitores de tela; contraste conferido nos fundos escuros e claros.
- **Escala da interface:** tipografia e espaçamentos fluidos; em telas 2K e 4K com densidade 1x o `rem` cresce suavemente, e a grade se limita a uma largura máxima para não esticar a composição em ultrawide.

### Parâmetros de teste (URL)

| Parâmetro | Efeito |
| --- | --- |
| `?webgl=0` | força o diagrama 2D no lugar da cena 3D |
| `?quality=low` / `?quality=high` | força o perfil leve ou completo |
| `?motion=reduce` | simula "reduzir movimento" |
| `?capture` | câmera sem amortecimento e qualidade fixa (capturas automatizadas em ambientes sem GPU) |

## Estrutura

```
gota-tech/
  index.html                 metadados, noscript
  public/                    favicon.svg, og.jpg (imagem de compartilhamento)
  src/
    content/site.ts          todo o texto do site
    lib/                     dispositivo, rolagem (Lenis + GSAP), estado da cena, revelações,
                             ondulações (canvas 2D), shader de tela cheia
    components/              marca, ícones, menu
    sections/                Stage (abertura + sistema), SystemDiagram (alternativa 2D),
                             Importance, Application + SchoolIllustration, Materials,
                             Research, Results, Closing
    three/                   Scene (Canvas, luzes, efeitos), House, Plumbing, Environment,
                             Water (chuva, respingos, filetes, partículas, brilho, água),
                             CameraRig, Labels, layout (medidas e percursos), geometry
    styles/global.css        tokens de cor, tipo, botões e utilitários
```

## Antes de publicar

- [ ] Conferir os textos de `src/content/site.ts` com o PDF da pesquisa.
- [ ] Trocar `og:image` em `index.html` por um endereço absoluto (`https://…/og.jpg`) e acrescentar `<link rel="canonical">`.
- [ ] Se houver fotos reais da escola ou do protótipo, elas podem complementar a seção "Aplicação".
