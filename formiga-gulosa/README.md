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

As fotografias reais da Formiga Gulosa ficam em duas pastas, sempre com o **mesmo nome de arquivo**:

```
src/assets/bolos/            foto inteira (PNG, JPG, WebP ou AVIF)
src/assets/bolos/recortes/   o mesmo bolo recortado, PNG com fundo transparente (opcional)
```

Rode `npm run build` de novo depois de trocar uma foto: cada imagem é convertida automaticamente para AVIF e
WebP (mantendo a transparência) em vários tamanhos, e o navegador baixa só o que a tela precisa.

Onde as fotos aparecem:

| Lugar | Qual foto |
| --- | --- |
| Abertura, dentro da redoma de vidro | o recorte da marcada com `destaque: true` (ou da primeira) |
| Trilho "Criações" ao lado da redoma | as quatro primeiras; clicar troca o bolo da redoma |
| Sobre, no prato com lupa | a foto inteira da primeira diferente da abertura |
| Mostruário (vitrine) | todas, cada uma numa redoma sobre a prateleira |
| Visualização ampliada | as fotos inteiras, com setas, teclado e arrastar no celular |

O recorte é o que permite o bolo aparecer "dentro" do vidro. Sem recorte, a foto continua aparecendo, só que
inteira, dentro do arco. Para recortar uma foto nova, qualquer removedor de fundo serve (remove.bg, Photoshop,
Canva); salve como PNG transparente em `recortes/` com o mesmo nome da foto, sem prato, mesa ou embalagem.

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

Telefone, WhatsApp, mensagem pré-preenchida, endereço, mapa, Instagram (`@formiga_gulosa_`) e horário ficam
em `src/config/site.ts`. O horário está vazio de propósito: quando preenchido, aparece sozinho no rodapé e em
Localização.

Depoimentos de clientes (reais e autorizados) entram em `depoimentos`, em `src/content/bolos.ts`. A seção
só aparece quando houver pelo menos um.

## Estrutura

```
index.html                 título, descrição, Open Graph, dados estruturados (Bakery), noscript
public/                    favicons (a formiga da logo), ícones, og-image.jpg, manifest
src/config/site.ts         dados da empresa e links (WhatsApp, telefone, mapa)
src/content/bolos.ts       informações das fotos e depoimentos
src/assets/bolos/          ← fotos dos bolos (e recortes/ com os recortes transparentes)
src/assets/marca/          logo oficial (apenas recortada no círculo original)
src/lib/                   carregamento das fotos, hooks, rolagem suave
src/components/            formiga, redoma de vidro, movimento (parallax, magnético, inclinação), doces em
                           vetor, bordas de calda, botões, cursor, trilha de progresso
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

- Abertura: entrada em camadas (sem tela de carregamento). O bolo sobe para a boleira e a redoma desce sobre
  ele; vidro de trás, bolo e vidro da frente são camadas separadas, com reflexo que passa e parallax pelo
  mouse. Ao rolar, a redoma se ergue um pouco e o bolo se aproxima — a rolagem continua sendo só rolagem.
- Bordas entre seções feitas de calda de chocolate que escorre ao aparecer; toalhinha rendada entre seções
  claras.
- Mostruário: uma vitrine de confeitaria com redomas em prateleiras. Cada bolo sobe para a prateleira e o
  vidro desce sobre ele; com o mouse, a redoma inclina e o reflexo acompanha. Clicar abre a foto inteira.
- Sobre: a foto se revela num círculo que se abre, com lupa para ver os detalhes.
- Botões principais "magnéticos" (seguem levemente o cursor) e cartões que inclinam ao passar o mouse.
- "Como funciona": o bolo nasce desenhado em traço dourado, etapa por etapa, conforme a rolagem.
- Contato: um montador de pedido — cada campo preenchido vira uma camada da fatia de bolo; com as quatro, a
  cereja cai no topo. A mensagem do WhatsApp sai pronta com ocasião, data, convidados, ideia e nome.
- Celular: menu em tela cheia que se abre como uma gota, barra fixa de WhatsApp e ligação, vitrine em duas
  colunas, cartões em lista, botões em largura total, linha do tempo vertical.

## Acessibilidade e desempenho

- HTML semântico, títulos em ordem, textos alternativos, foco visível, link para pular ao conteúdo.
- Menu e visualização ampliada com foco preso, Esc para fechar e foco devolvido ao botão de origem.
- "Reduzir movimento" do sistema desliga parallax, rolagem suave, inclinações e animações contínuas; todo o
  conteúdo continua visível.
- Animações só com `transform` e `opacity`; imagens responsivas em AVIF/WebP com `lazy loading`; mapa
  carregado sob demanda; fontes auto-hospedadas (só o subconjunto latino é baixado).
- Contrastes de texto conferidos (textos secundários e rótulos ≥ 4,5:1).

## Antes de publicar

- [ ] Revisar nomes e descrições das fotos em `src/content/bolos.ts` (foram escritos a partir do que aparece
      em cada foto).
- [ ] Confirmar a grafia do nome: a logo diz **Formiga Gulosa** (usada no site); o briefing citava "Golosa".
      Para mudar, troque em `src/config/site.ts` e `index.html`.
- [ ] Confirmar o telefone: `(73) 9131-3180` tem 8 dígitos. Se for celular, o formato atual é
      `(73) 9 9131-3180`; o link `tel:` pode precisar de `+5573991313180`. O WhatsApp costuma aceitar os dois.
- [ ] Trocar `og:image` em `index.html` pelo endereço absoluto (`https://seu-dominio/og-image.jpg`) e
      acrescentar `<link rel="canonical">` com o domínio.
- [ ] Preencher o horário em `src/config/site.ts`, se houver.
- [ ] Abrir o site publicado e conferir o mapa e os botões de WhatsApp e telefone num celular.

## Licenças

Bodoni Moda, Great Vibes e Montserrat: SIL Open Font License (via Fontsource). Ícones Lucide: ISC.
A logo e o nome Formiga Gulosa pertencem à empresa.
