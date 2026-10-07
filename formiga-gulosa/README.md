# Formiga Gulosa — site

Landing page da **Formiga Gulosa**, confeitaria artesanal de bolos personalizados e doces em Itabuna - BA.
React + Vite + TypeScript, CSS próprio, animações com Motion, rolagem suave com Lenis e ícones Lucide.

## Rodar e publicar

```bash
npm install
npm run dev       # desenvolvimento em http://localhost:5173
npm run build     # gera a versão de produção em dist/
npm run preview   # confere o build localmente
```

A pasta `dist/` é um site estático: pode ir para Netlify, Vercel, GitHub Pages, Hostinger ou qualquer
hospedagem. Os caminhos são relativos, então também funciona dentro de uma subpasta.

## Fotos dos bolos (o mais importante)

O site foi montado para as fotografias reais da Formiga Gulosa. **Basta colocar os arquivos em
`src/assets/bolos/`** (JPG, PNG, WebP ou AVIF) e rodar `npm run build` de novo: cada foto é convertida
automaticamente para AVIF e WebP em quatro tamanhos, e o navegador baixa só o que a tela precisa.

Onde as fotos aparecem:

| Lugar | Qual foto |
| --- | --- |
| Abertura, dentro da redoma de vidro | a marcada com `destaque: true` (ou a primeira) |
| Trilho "Criações" ao lado da redoma | as quatro primeiras; clicar troca a foto da redoma |
| Sobre, no prato com lupa | a primeira foto diferente da abertura |
| Mostruário (vitrine) | todas, na ordem definida |
| Visualização ampliada | todas, com setas, teclado e arrastar no celular |

Para dar nome, categoria e descrição a uma foto, edite `src/content/bolos.ts` (a chave é o nome do arquivo):

```ts
export const infoBolos: Record<string, InfoBolo> = {
  'bolo-jardim.jpg': {
    titulo: 'Jardim de borboletas',
    categoria: 'Bolos temáticos',
    descricao: 'Dois andares em tons de lilás, com borboletas de papel.',
    alt: 'Bolo de dois andares lilás decorado com borboletas',
    destaque: true,
    ordem: 1,
    enquadramento: 'center 30%', // qual parte priorizar quando a foto é recortada
  },
}
```

- Os filtros do Mostruário só aparecem quando houver ao menos duas categorias diferentes. Use apenas as
  categorias que correspondem de verdade às fotos.
- Fotos verticais (4:5) ficam melhores na redoma e na vitrine. Mínimo recomendado: 1600 px no lado maior.
- **Enquanto não houver fotos**, o site continua completo: a redoma mostra a logo, o Sobre mostra uma
  bandeja de docinhos ilustrada e o Mostruário convida a pedir fotos pelo WhatsApp. Nenhuma imagem de banco
  ou bolo inventado é usado no lugar.

## Dados da empresa

Telefone, WhatsApp, mensagem pré-preenchida, endereço, Instagram e horário ficam em
`src/config/site.ts`. Instagram e horário estão vazios de propósito: quando preenchidos, aparecem sozinhos
no rodapé e em Localização.

Depoimentos de clientes (reais e autorizados) entram em `depoimentos`, em `src/content/bolos.ts`. A seção
só aparece quando houver pelo menos um.

## Estrutura

```
index.html                 título, descrição, Open Graph, dados estruturados (Bakery), noscript
public/                    favicons (a formiga da logo), ícones, og-image.jpg, manifest
src/config/site.ts         dados da empresa e links (WhatsApp, telefone, mapa)
src/content/bolos.ts       informações das fotos e depoimentos
src/assets/bolos/          ← fotos dos bolos
src/assets/marca/          logo oficial (apenas recortada no círculo original)
src/lib/                   carregamento das fotos, hooks, rolagem suave
src/components/            formiga, doces em vetor, bordas de calda, botões, cursor, trilha de progresso
src/sections/              Navbar, Hero, Diferenciais, Sobre, Mostruário (+ Lightbox), Processo,
                           Localização, Depoimentos, Contato, Final (CTA + rodapé)
src/styles/global.css      tokens de cor e tipo, base, botões
```

## Direção de arte

**Da referência veio a estrutura**: abertura com título à esquerda, peça central sobre boleira, anotação
manuscrita com seta e trilho vertical à direita; faixa escura com cartões em arco; destaque com marca
d'água, ícones em coluna e ilustração em traço; etapas em linha com setas; corte de camadas numerado;
CTA final centralizado sobre fundo escuro com o rodapé na mesma faixa.

**Da logo veio a identidade**: o rosa do papel e da pincelada em aquarela, o dourado das letras (usado em
degradê metálico), o chocolate do brigadeiro (faixas escuras) e o rosa-cereja da forminha (detalhes).
Tipografia: Bodoni Moda em caixa-alta nos títulos, Great Vibes para as notas manuscritas douradas e
Montserrat — parente da "CONFEITARIA ARTESANAL" da logo — nos textos e rótulos.

**A formiga é a assinatura**: redesenhada em vetor a partir da logo (olho grande, chapéu de confeiteiro,
doce nas patas). Ela caminha até o item ativo do menu, desce pela trilha de progresso, atravessa a
prateleira da vitrine, conduz as etapas de "Como funciona" e, no final, forma uma fila levando doces até o
botão do WhatsApp — "onde tem festa, tem formiga".

**Experiências próprias**:

- Abertura: entrada em camadas (sem tela de carregamento), parallax de profundidade pelo mouse, redoma de
  vidro com reflexo que passa, doces na mesa e no ar.
- Bordas entre seções feitas de calda de chocolate que escorre ao aparecer; toalhinha rendada entre seções
  claras.
- Mostruário no desktop: a página "prende" e a vitrine desliza para o lado com a rolagem, com etiquetas
  penduradas na prateleira. No celular, vira um carrossel de deslizar.
- "Como funciona": o bolo nasce desenhado em traço dourado, etapa por etapa, conforme a rolagem.
- Contato: um montador de pedido — cada campo preenchido vira uma camada da fatia de bolo; com as quatro, a
  cereja cai no topo. A mensagem do WhatsApp sai pronta com ocasião, data, convidados, ideia e nome.
- Celular: menu em tela cheia que se abre como uma gota, barra fixa de WhatsApp e ligação, cartões e
  vitrine deslizantes, linha do tempo vertical.

## Acessibilidade e desempenho

- HTML semântico, títulos em ordem, textos alternativos, foco visível, link para pular ao conteúdo.
- Menu e visualização ampliada com foco preso, Esc para fechar e foco devolvido ao botão de origem.
- "Reduzir movimento" do sistema desliga parallax, rolagem suave, vitrine fixa e animações contínuas; todo o
  conteúdo continua visível.
- Animações só com `transform` e `opacity`; imagens responsivas em AVIF/WebP com `lazy loading`; mapa
  carregado sob demanda; fontes auto-hospedadas (só o subconjunto latino é baixado).
- Contrastes de texto conferidos (textos secundários e rótulos ≥ 4,5:1).

## Antes de publicar

- [ ] Colocar as fotos reais em `src/assets/bolos/` e, se quiser, os nomes em `src/content/bolos.ts`.
- [ ] Confirmar a grafia do nome: a logo diz **Formiga Gulosa** (usada no site); o briefing citava "Golosa".
      Para mudar, troque em `src/config/site.ts` e `index.html`.
- [ ] Confirmar o telefone: `(73) 9131-3180` tem 8 dígitos. Se for celular, o formato atual é
      `(73) 9 9131-3180`; o link `tel:` pode precisar de `+5573991313180`. O WhatsApp costuma aceitar os dois.
- [ ] Trocar `og:image` em `index.html` pelo endereço absoluto (`https://seu-dominio/og-image.jpg`) e
      acrescentar `<link rel="canonical">` com o domínio.
- [ ] Preencher Instagram e horário em `src/config/site.ts`, se houver.
- [ ] Abrir o site publicado e conferir o mapa e os botões de WhatsApp e telefone num celular.

## Licenças

Bodoni Moda, Great Vibes e Montserrat: SIL Open Font License (via Fontsource). Ícones Lucide: ISC.
A logo e o nome Formiga Gulosa pertencem à empresa.
