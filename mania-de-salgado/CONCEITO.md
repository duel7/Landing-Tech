# Mania de Salgado: conceito do site

Este documento reúne os quatro entregáveis: wireframe, guia de estilo, copy e justificativa. O protótipo navegável nesta pasta (`index.html` e `cardapio.html`) aplica tudo o que está descrito aqui. Os trechos entre colchetes no protótipo são marcadores: nenhum preço, endereço, depoimento ou fato da história da loja foi inventado.

## A ideia central

**Uma salgaderia vende para dois momentos.** O lanche de agora, comprado por unidade, e a festa, comprada por cento, com data marcada. O site se organiza em torno dessas duas jornadas, e o pedido termina no WhatsApp, onde o cliente já conversa com a loja.

**A paleta vem do próprio produto.** O dourado é a cor da casquinha frita, o branco é o da farinha e do papel-manteiga, e o rosa é o da caixa de festa. Com essa origem, as três cores deixam de ser decoração e passam a contar o que a loja faz.

---

## 1. Wireframe descritivo

### Home

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ● Mania de Salgado                 Cardápio   Sobre   Contato  [Pedido 2]│ 1 Cabeçalho fixo
├──────────────────────────────────────────────────────────────────────────┤
│                                              ┌────────────────────────┐  │
│ SALGADERIA EM [BAIRRO]                       │                        │  │
│ Crocante por fora,                           │      FOTO 4:5          │  │ 2 Dobra principal
│ recheado até a ponta.                        │      bandeja real,     │  │
│ Salgados fritos e assados, por unidade       │      um salgado        │  │
│ ou por cento. Finalize no WhatsApp.          │      partido ao meio   │  │
│ [ Ver cardápio → ]    Pedir pelo WhatsApp    │                        │  │
│ ────────────────────────────────────────     └────────────────────────┘  │
│ HOJE              ENTREGA          RETIRADA  Na foto: coxinha e kibe     │
│ ● Aberto · 19h    [bairros]        [rua, nº]                             │
├──────────────────────────────────────────────────────────────────────────┤
│ Os mais pedidos                                     Cardápio completo →  │
│ ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐                        │ 3 Destaque
│ │  foto  │   │  foto  │   │  foto  │   │  foto  │                        │
│ └────────┘   └────────┘   └────────┘   └────────┘                        │
│ Nome         Nome         Nome         Nome                              │
│ uma linha    uma linha    uma linha    uma linha                         │
│ R$ 0,00 [+]  R$ 0,00 [+]  R$ 0,00 [+]  R$ 0,00 [+]                       │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌─ rosa claro ───────────────────────────────────────────────────────┐  │
│ │ PARA FESTAS                                    ● ● ● ● ● ● ● ● ● ● │  │ 4 Festas
│ │ Monte seu cento com até 4 sabores.             ● ● ● ● ● ○ ○ ○ ○ ○ │  │
│ │ Múltiplos de 25 · [24 h] de antecedência       100 pontos =        │  │
│ │ [ Montar meu cento → ]                         100 salgados        │  │
│ └────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│ O que dizem os clientes                  [4,8] de 5 no Google · [n] aval.│
│ ──────────────    ──────────────    ──────────────                       │ 5 Confiança
│ "sobre um         "sobre uma        "sobre entrega                       │
│  salgado"          festa"            e atendimento"                      │
│ Nome, bairro      Nome, bairro      Nome, bairro                         │
│ Também entregamos pelo   [iFood]   [outra plataforma]                    │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────┐   Sobre a Mania                                    │
│ │ foto balcão 3:2   │   Duas frases: quando abriu, quem faz,             │ 6 Sobre
│ └───────────────────┘   o que é preparado na casa. Ver o cardápio →      │
├──────────────────────────────────────────────────────────────────────────┤
│ Contato                                                                  │
│ ENDEREÇO            WHATSAPP               HORÁRIOS                      │ 7 Rodapé
│ Rua, nº, bairro     (00) 00000-0000        Seg. a sex.   9h às 19h       │
│ Como chegar →       Chamar no WhatsApp →   Sábado        9h às 14h       │
│ ● Mania de Salgado                         © Razão social · CNPJ         │
└──────────────────────────────────────────────────────────────────────────┘
```

| Bloco | O que tem e por quê | No celular |
| --- | --- | --- |
| **1. Cabeçalho** | Logo à esquerda, três links (Cardápio, Sobre, Contato) e o botão **Pedido** com contador rosa. Fundo branco; um filete dourado aparece só depois que a página rola. | Logo, sacola com contador e botão de menu. O menu desce como painel, com os três links em letra grande. |
| **2. Dobra principal** | Título de duas linhas e um subtítulo que explica como comprar (por unidade, por cento, finalizando no WhatsApp). Um botão primário rosa, **Ver cardápio**, e um secundário em forma de link, **Pedir pelo WhatsApp**. Embaixo, três fatos respondem as perguntas que hoje viram mensagem no WhatsApp: está aberto? entrega no meu bairro? onde retiro? O "Hoje" é calculado a partir do horário ("Aberto agora · fecha às 19h"). A foto real vem com legenda "Na foto:", como numa revista. | Texto e botão aparecem primeiro, inteiros acima da dobra numa tela de 390 × 844. A foto vem logo abaixo e já fica visível ao rolar. Sem carrossel. |
| **3. Mais pedidos** | Quatro produtos, os mais vendidos de fato (do relatório do caixa ou do iFood). Os cartões não têm caixa nem sombra: foto quadrada, nome, uma linha de descrição, preço em dourado e **Adicionar**, que vira um contador (− 1 +) sem sair da página. Ao lado do título, o link para o cardápio completo. | Grade 2 × 2. O botão ocupa a largura do cartão. |
| **4. Festas** | A única faixa colorida da página (rosa claro). À direita, uma bandeja de 100 pontos que se enche quando a seção aparece: é a imagem do "cento" e antecipa o montador. Botão **Montar meu cento**. | O texto vem em cima e a bandeja embaixo, menor. |
| **5. Confiança** | A nota média com a fonte e o número de avaliações, mais três trechos reais. Cada trecho responde a uma dúvida diferente: o sabor, o pedido para festa e a entrega. Assinatura com nome, bairro e plataforma. Uma linha discreta com as plataformas de entrega. Sem fileira de estrelas e sem fotos de banco. | Os três trechos ficam empilhados. |
| **6. Sobre** | Foto de quem faz os salgados e duas ou três frases com fatos: quando abriu, quem cozinha, o que é preparado na casa. É o destino do link "Sobre". | Foto em cima, texto embaixo. |
| **7. Rodapé (Contato)** | Três colunas, cada uma com uma ação: Endereço (Como chegar), WhatsApp (Chamar no WhatsApp) e Horários. Embaixo, logo, razão social e CNPJ. É o destino do link "Contato". | Uma coluna. |

**O pedido (gaveta lateral, nas duas páginas).** Abre pela direita no desktop e ocupa a tela inteira no celular. Lista os itens com contador e a opção "Remover", depois pergunta entrega ou retirada. O endereço só aparece na entrega e a data da festa só aparece quando há um cento no pedido; observações são opcionais. Embaixo, o subtotal, a frase "Taxa de entrega e forma de pagamento são combinadas no WhatsApp" e o botão **Enviar pedido pelo WhatsApp**, que abre a conversa com a mensagem pronta:

```
Olá, Mania de Salgado! Quero fazer um pedido:

• 2 × Coxinha de frango — R$ 13,00
• 1 × Cento: 50 Coxinha, 25 Kibe, 25 Risole — R$ 120,00

Subtotal: R$ 133,00
Entrega em: Rua Exemplo, 100, Centro
Data da festa: 14/11/2026 (sábado)
```

*(Os valores acima só ilustram o formato.)* O pedido fica guardado no navegador quando o cliente troca de página. No celular, quando há itens, uma barra fixa **Ver pedido · 3 itens** aparece no rodapé da tela.

### Cardápio (catálogo)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ cabeçalho (Cardápio sublinhado em dourado)                               │
├──────────────────────────────────────────────────────────────────────────┤
│ Cardápio                                                                 │
│ Preços por unidade. Para festas, monte seu cento.                        │
│ Hoje: ● Aberto agora · fecha às 19h                                      │
│ ( ◊ Fritos )  ( △ Assados )  ( ⁘ Para festa )    ← atalhos fixos ao rolar│
├──────────────────────────────────────────────────────────────────────────┤
│ Fritos                                                                   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   4 colunas no desktop, 3 no tablet  │
│ └──────┘ └──────┘ └──────┘ └──────┘                                      │
│ nome · uma linha · R$ 0,00 [+ Adicionar]                                 │
│ Assados                                                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ ░ Para festa: monte seu cento ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ( Cento · 100 ) ( Meio cento · 50 )          ┌──────────────────────┐    │
│ ◊ Coxinha         ●   [ −  50  + ]           │ ● ● ● ● ● ● ● ● ● ●  │    │
│ ◊ Kibe            ●   [ −  25  + ]           │ ● ● ● ● ● ○ ○ ○ ○ ○  │    │
│ ◊ Bolinha de queijo   [ −   0  + ]           │ 75 de 100. Faltam 25.│    │
│ ◊ Risole              [ −   0  + ]           │ R$ 0,00 o cento      │    │
│ ◊ Enroladinho         [ −   0  + ]           │ [Adicionar ao pedido]│    │
│ ◊ Esfiha              [ −   0  + ]           └──────────────────────┘    │
├──────────────────────────────────────────────────────────────────────────┤
│ Contato (rodapé)                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Topo.** Título, uma frase que vale para a página inteira ("Preços por unidade") e o status de hoje. Assim, "unidade" não precisa se repetir em cada cartão.
- **Atalhos de categoria.** Ficam presos abaixo do cabeçalho e cada um traz o pictograma da categoria. A categoria visível fica marcada em rosa claro. No celular, a faixa rola de lado e acompanha a categoria atual.
- **Produtos.** No desktop, são os mesmos cartões da Home. Até 640 px, viram **lista**: foto de 104 px à esquerda e, à direita, nome, descrição, preço e botão na mesma linha. Com o polegar, uma lista se percorre bem mais depressa que cartões grandes.
- **Monte seu cento.** Primeiro o cliente escolhe o tamanho (100 ou 50). Depois escolhe os sabores com contadores que andam de 25 em 25, até 4 sabores. Cada sabor escolhido ganha uma cor e preenche a bandeja de 100 pontos, que mostra o progresso sem exigir conta de cabeça. O botão só fica ativo com a bandeja cheia, e as mensagens dizem o que falta ("75 de 100. Faltam 25.", "Até 4 sabores por pedido de festa."). No desktop, o resumo acompanha a rolagem. As regras (múltiplo, número de sabores, tamanhos) se ajustam no HTML.
- **Por que não há uma página por produto.** Salgado é compra de valor baixo e decisão rápida. O que decide a compra (foto, recheio, preço) cabe no cartão. Uma página por item custaria um clique e um "voltar" a cada salgado, e pediria texto de enchimento para ocupar a tela. Recomendo mostrar ingredientes e alérgenos numa linha discreta no próprio cartão, quando a loja tiver essas informações. Uma página de produto só passa a fazer sentido se surgirem combos com variações.

---

## 2. Guia de estilo

### Cores

| | Nome | Hex | Uso | Contraste |
| --- | --- | --- | --- | --- |
| Branco | Branco farinha | `#FFFDFA` | Fundo de todas as páginas | — |
| | Branco | `#FFFFFF` | Campos, gaveta do pedido, resumo do cento | — |
| | Creme | `#FAF5EE` | Espaço da foto, faixa "Sobre" | — |
| Dourado | Dourado | `#C6A15B` | Logo, filetes, bandeja (só decorativo) | — |
| | Dourado traço | `#B8893A` | Pictogramas, ponto "aberto agora" | 3,1:1 |
| | Dourado tinta | `#7D5818` | **Preços**, rótulos curtos | 6,3:1 |
| | Dourado claro | `#E6CF9F` | 3º sabor na bandeja | — |
| Rosa | Rosa | `#B8456B` | **Botões de ação**, contador do pedido | 5,1:1 com texto branco |
| | Rosa profundo | `#9E3859` | Botão ao passar o mouse; texto sobre rosa claro | 6:1 |
| | Rosa suave | `#E8A9BC` | Botão ainda indisponível, 2º sabor | — |
| | Rosa claro | `#FBF0F2` | Faixa de festas, item selecionado | — |
| Texto | Tinta | `#2B211B` | Texto principal | 15,5:1 |
| | Tinta 2 | `#6E6158` | Texto secundário | 5,9:1 |
| | Linha | `#EDE4D9` | Divisórias | — |

O texto não é preto. É o dourado levado ao extremo escuro: preto puro sobre branco quente fica duro, e um marrom derivado do dourado mantém a paleta estrita.

**Proporção na tela:** cerca de 85% de branco, 10% de texto, 4% de dourado e 1% de rosa.

**Regras**

- **Rosa significa ação.** Se é rosa, dá para clicar. A única exceção é a faixa de festas, em rosa claro.
- **Dourado claro nunca vai em texto.** Em preços e rótulos, use o dourado tinta.
- **Sem degradê e sem sombra.** A exceção é a barra do pedido no celular, que flutua sobre o conteúdo.
- **Cores de alerta também saem da paleta:** erros em rosa profundo e "aberto" em dourado. Não há verde nem vermelho.

### Tipografia

| Fonte | Papel | Por quê |
| --- | --- | --- |
| **[Fraunces](https://fonts.google.com/specimen/Fraunces)**, eixo *Soft* no máximo, pesos 480 a 600 | Títulos, nomes de produtos, depoimentos, logo provisório | Serifa de cantos arredondados, que lembra letreiro de padaria e massa macia sem ficar infantil. Ajusta o desenho ao tamanho (*optical size*). |
| **[Figtree](https://fonts.google.com/specimen/Figtree)**, pesos 400, 500, 600 e 650 | Texto, botões, preços, formulários | Sem serifa geométrica e humana, muito legível em tela pequena. Tem algarismos tabulares, então os preços ficam alinhados. |

Ficaram de fora Poppins, Montserrat, Inter e Playfair Display. São as fontes padrão de templates e geradores de site, e o leitor as reconhece em um segundo.

| Nível | Tamanho (celular → desktop) | Estilo |
| --- | --- | --- |
| Título da dobra | 36 → 60 px, entrelinha 1,04 | Fraunces 480, espaçamento −2% |
| Título de seção | 28 → 40 px, entrelinha 1,1 | Fraunces 480 |
| Nome do produto | 18 a 19 px | Fraunces 500 |
| Texto | 16 a 18 px, entrelinha 1,6 | Figtree 400 |
| Preço | 16 a 17 px | Figtree 650, algarismos tabulares, dourado tinta |
| Rótulo | 12 a 13 px, caixa-alta, espaçamento +10% | Figtree 600, dourado tinta |

Regras de uso:

- No máximo dois tamanhos de título por tela.
- Caixa-alta só em rótulos de uma ou duas palavras ("Hoje", "Endereço").
- Sem itálico.
- Blocos de texto alinhados à esquerda.

As fontes ficam hospedadas no próprio site, em woff2. Juntas pesam 75 KB, porque a Fraunces foi recortada para levar só o necessário. Assim a página carrega mais rápido e nenhuma visita é repassada a terceiros (LGPD).

### Grid, espaço e forma

- **Container:** 1200 px, com margens de 16 px (celular) a 40 px (desktop).
- **Espaçamento:** escala de 4, 8, 12, 16, 24, 32, 48, 64 e 120 px. Entre seções, de 64 px (celular) a 120 px (desktop).
- **Cantos:** 10 px em campos e botões pequenos, 14 px nos botões e 20 a 28 px nas fotos. Contadores e atalhos têm forma de pílula. Tudo arredondado, como os próprios salgados.
- **Pontos de quebra:**
  - 640 px: o cardápio passa de lista para grade.
  - 900 px: o menu vira linha e a dobra ganha duas colunas.
  - 1100 px: o cardápio passa a ter 4 colunas.

### Ícones e pictogramas

- **Pictogramas da marca.** São oito, desenhados para a casa: coxinha, kibe, bolinha, risole, enroladinho, esfiha, empada e cento. Têm traço de 1,4 a 2 px, em dourado, e aparecem nos atalhos do cardápio, nos sabores do cento e nos espaços de foto. O logo provisório é a silhueta da coxinha preenchida.
- **Ícones de interface.** Sacola, seta, mais, menos, conversa e fechar, com o mesmo traço.
- **O que não entra:** emoji e ícones genéricos de biblioteca do tipo "qualidade, sabor, entrega".

### Movimento

| Onde | O quê | Tempo |
| --- | --- | --- |
| Blocos ao rolar | Sobem 14 px enquanto aparecem, uma vez só, em sequência curta | 700 ms; 70 ms entre um e outro |
| Adicionar | O botão vira contador com um leve "pop" e o contador do pedido pulsa | 280 ms / 400 ms |
| Bandeja do cento | Os pontos se enchem um a um e mostram o progresso | 7 ms por ponto |
| Gaveta do pedido | Desliza da direita enquanto o fundo escurece | 400 ms |
| Links e botões | A seta avança 3 px e o filete dourado se completa | 350 ms |
| Fotos | Aproximam 6% quando o mouse passa | 800 ms |
| "Aberto agora" | O ponto dourado "respira" | ciclo de 2,4 s |

As regras valem para todas as animações:

- Curva *ease-out* (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Nada passa de 800 ms e nada bloqueia um clique.
- A opção "reduzir movimento" do sistema desliga tudo.
- Não entram parallax, carrossel automático, contador numérico animado nem texto digitando sozinho.

### Fotografia

1. **Real e da loja.** As fotos mostram a produção do dia. Nada de banco de imagens nem de imagem gerada por IA.
2. **Um único set para o cardápio inteiro.** A mesma superfície clara (mármore claro, linho cru ou papel-manteiga), a mesma luz natural lateral de janela, o mesmo ângulo e a mesma distância. Essa consistência é o que faz o cardápio parecer profissional.
3. **Ângulo.** Produtos em 45°, que mostra volume e casquinha. Bandejas e centos vistos de cima. Quando o recheio é o argumento (coxinha, bolinha de queijo), um salgado aparece partido ao meio.
4. **Cor fiel.** Branco neutro e o dourado da fritura como ele é. Sem filtro, sem saturação extra, sem vinheta. Vapor, só se for real.
5. **Pessoas.** Mãos segurando, partindo ou montando a bandeja. Rostos da equipe aparecem no "Sobre", com autorização.
6. **O que não entra:** fundo recortado com sombra falsa, salgado de outra loja, montagem ou molho escorrendo de propósito.

| Uso | Formato | Mínimo |
| --- | --- | --- |
| Dobra principal | Vertical 4:5 | 2000 px de largura |
| Produto | Quadrado 1:1 | 1200 px |
| Sobre | Horizontal 3:2 | 2400 px |
| Compartilhamento | 1200 × 630 | — |

Exporte em AVIF, WebP e JPEG. O alvo é menos de 200 KB por foto de produto.

**Lista de fotos para a sessão:**

- 1 bandeja para a dobra principal.
- 1 foto por produto do cardápio.
- 1 cento montado em bandeja de festa.
- 1 foto do balcão ou da cozinha com a equipe.
- 1 de mãos partindo uma coxinha, como alternativa para a dobra principal.

### Voz e microcopy

**Princípios**

- Descrever o que é, não o quanto é bom.
- Frases curtas.
- Falar com o cliente como "você".
- Usar números e fatos no lugar de adjetivos.
- Nada de exclamação, emoji ou caixa-alta gritando.

| Momento | Texto |
| --- | --- |
| Botão no produto | Adicionar |
| Pedido vazio | Seu pedido está vazio. · Ver o cardápio |
| Cento incompleto | 75 de 100. Faltam 25. |
| Cento cheio | O cento já está completo. Tire um sabor para trocar. |
| Fora do horário | Fechado · abre amanhã às 9h |
| Campo faltando | Informe o endereço para a entrega. |
| Depois de enviar | Abrimos o WhatsApp com o pedido escrito. Falta só enviar a mensagem. |

**Palavras que não entram:** irresistível, imperdível, inigualável, explosão de sabor, o melhor da cidade, experiência gastronômica, descubra, delicie-se, feito com amor. Esta última pode entrar se houver como mostrar, e a foto da equipe mostra.

---

## 3. Exemplos de copy

### Títulos para a dobra principal

**1. Sensorial (usado no protótipo)**

> **Crocante por fora, recheado até a ponta.**
> Salgados fritos e assados, por unidade ou por cento. Escolha aqui e finalize o pedido no WhatsApp.

Fala de textura sem usar "delicioso". "Até a ponta" é um detalhe que só quem come coxinha reconhece. O subtítulo é puramente funcional: diz o que se vende e como se compra.

**2. Ocasião**

> **Do lanche da tarde à festa de sábado.**
> Peça por unidade para hoje ou monte um cento com até 4 sabores para o seu evento.

Apresenta as duas formas de comprar numa frase, e o subtítulo já aponta o caminho de cada uma. Funciona bem se as encomendas de festa forem a maior parte do faturamento.

**3. Frescor**

> **Feitos hoje. Entregues quentes.**
> Salgados fritos e assados para o lanche, o escritório e a festa, em [bairro].

São duas afirmações curtas e verificáveis. **Use só se forem verdade todos os dias**: produção diária e uma área de entrega pequena o bastante para o salgado chegar quente. Uma promessa dessas que falha uma vez custa mais que qualquer título.

### Descrições de produto

Fórmula: **o que é + um detalhe concreto (textura, recheio, técnica) + uma informação útil**, em até cerca de 20 palavras e sem adjetivo de valor. Ajuste os ingredientes à receita da casa.

> **Coxinha de frango**
> Frango desfiado com tempero verde, em massa macia e casquinha fina. O recheio vai até a ponta.

> **Bolinha de queijo**
> Muçarela no centro, que estica quando você parte ao meio. Dica da casa: coma nos primeiros minutos, ainda quente.

A primeira troca "deliciosa" e "suculenta" por fatos que o cliente confere na primeira mordida. A segunda termina com uma dica de quem faz. É o tipo de frase que uma pessoa de verdade diria no balcão, e nenhum gerador de texto diria.

**Para comparar:** a versão "cara de IA" da mesma coxinha seria *"🔥 Descubra a coxinha mais irresistível da cidade! Uma explosão de sabor que vai conquistar seu paladar!"*. São 16 palavras e nenhuma informação.

---

## 4. Justificativa das decisões

### Contra a "cara de IA"

| O que denuncia um site genérico | O que foi feito aqui |
| --- | --- |
| Paleta sem origem: degradês, roxos, sombra em tudo | Paleta ligada ao produto (fritura, farinha, caixa de festa). Cores chapadas, sem degradê e quase sem sombra. |
| Fontes de template (Poppins, Montserrat, Playfair) | Fraunces Soft e Figtree: pouco usadas em delivery e com personalidade de padaria. |
| Emoji e ícones genéricos | Oito pictogramas desenhados para os salgados da casa. |
| Seção "Por que nos escolher" com três ícones (Qualidade, Sabor, Entrega) | Removida. Os fatos que importam (horário, bairros, retirada) estão na dobra, como informação. |
| Foto de banco ou gerada | Direção de fotografia com set único e lista de fotos, e uma legenda "Na foto:" que diz o que aparece. |
| Depoimentos genéricos com cinco estrelas | Nota média com fonte e três trechos reais, com nome, bairro e plataforma, escolhidos para responder a três dúvidas. |
| Texto promocional vazio | Frases factuais, uma dica de quem faz, microcopy com tom de balcão. |
| Layout simétrico de template | Dobra assimétrica, uma única faixa de cor na página e cartões sem caixa. |
| Nada que seja só desta loja | A bandeja de 100 pontos, que se enche enquanto o cliente monta o cento. Não existe em template porque nasce de como a salgaderia vende. |

### Contra a poluição visual e textual

- **Uma ação principal por tela.** Ela é rosa; o resto é link.
- **Branco como base:** cerca de 85% da área.
- **Nada repetido.** "Preços por unidade" aparece uma vez no topo do cardápio, e não em cada cartão.
- **Sobretítulo só em dois lugares.** O rótulo em caixa-alta acima do título aparece na dobra e na faixa de festas, e não em toda seção.
- **Fora da página:** contador animado de clientes, pop-up de newsletter, cupom piscando, chat flutuante, slider e seção de vantagens.
- **Textos curtos.** No máximo duas linhas por bloco, e descrição de produto com até 20 palavras.
- **Sem página por produto.** São menos telas e não sobra espaço para preencher com texto vazio.

### Contra a usabilidade ruim

- **A dobra responde às três perguntas** que hoje viram mensagem no WhatsApp: está aberto? entrega aqui? onde retiro?
- **Menu com três itens.** "Cardápio" vem primeiro e também é o botão principal.
- **No cardápio**, os atalhos de categoria ficam fixos, o celular mostra lista de leitura rápida e o **Adicionar** fica no próprio item, com contador, sem trocar de página.
- **A festa tem fluxo próprio.** A bandeja mostra o que falta, as regras aparecem como mensagens claras e a data é pedida só quando há um cento no pedido.
- **O pedido termina no WhatsApp com a mensagem pronta.** É o canal que o cliente já usa com a loja: não há cadastro nem senha, e a loja recebe o pedido organizado.
- **No celular, a barra "Ver pedido"** aparece quando há itens, e o pedido continua guardado ao trocar de página.
- **Acessibilidade.**
  - Contraste AA em todos os textos e foco visível.
  - Rótulos para leitores de tela e uso completo pelo teclado (Esc fecha o pedido e o menu).
  - A preferência "reduzir movimento" é respeitada.
  - Sem JavaScript, cardápio, preços e contato continuam aparecendo.

---

O [README](README.md) lista o que a loja precisa fornecer (preços, número do WhatsApp, horários, endereço, depoimentos, fotos e logo) e onde cada informação entra.
