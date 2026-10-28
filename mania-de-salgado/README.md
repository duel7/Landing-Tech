# Mania de Salgado: protótipo do site

Protótipo navegável de duas páginas: **Home** (`index.html`) e **Cardápio** (`cardapio.html`). Inclui um pedido que termina no WhatsApp e o montador de cento para festas. É feito em HTML, CSS e JavaScript, sem dependências nem etapa de build.

A direção de arte, a arquitetura, a copy e a justificativa de cada decisão estão em **[CONCEITO.md](CONCEITO.md)**.

> **Conteúdo provisório.** Tudo o que aparece entre colchetes, como `[Bairro, Cidade]`, `R$ [0,00]` ou `[Nome]`, é um marcador a substituir por informação confirmada. No site, esses trechos têm sublinhado pontilhado dourado, para nunca passarem por dados reais. Nenhum preço, endereço, horário, depoimento ou fato da história da loja foi inventado. A lista de produtos e as descrições são **um cardápio de exemplo**, a conferir com a cozinha.

## Abrir localmente

Qualquer servidor estático serve. Por exemplo:

```bash
python3 -m http.server 8080
```

Em seguida, abra `http://localhost:8080/mania-de-salgado/` (a partir da raiz do repositório).

## Estrutura

```
index.html              Home: dobra principal, mais pedidos, festas, clientes, sobre, contato
cardapio.html           Cardápio: categorias, produtos, monte seu cento
CONCEITO.md             wireframe, guia de estilo, copy e justificativa
assets/css/main.css     tokens de cor e tipo, layout, componentes, movimento
assets/js/loja.js       dados da loja: WhatsApp, link do mapa, horários
assets/js/main.js       menu, entradas, pedido, envio pelo WhatsApp, cento, categorias
assets/fonts/           Fraunces (eixo Soft fixo, recortada) e Figtree, woff2, licença OFL
assets/favicon.svg      ícone provisório (silhueta de coxinha)
```

## Como o pedido funciona

1. **Adicionar.** Cada cartão de produto ganha um botão **Adicionar**, que vira contador (− 1 +). O pedido fica salvo no navegador (`localStorage`) e acompanha o cliente entre as páginas.
2. **Cento.** Em `cardapio.html#festa`, o cliente escolhe 100 ou 50 e os sabores, de 25 em 25, até 4 sabores. A bandeja de pontos mostra o progresso. O cento entra no pedido como um item, com os sabores na descrição.
3. **Envio.** A gaveta **Seu pedido** pergunta entrega ou retirada. Pede o endereço só na entrega, a data só quando há cento, e tem observações opcionais. **Enviar pedido pelo WhatsApp** abre a conversa com a loja e a mensagem pronta; o pagamento e a taxa de entrega são combinados lá.

Enquanto o número do WhatsApp não estiver configurado, o envio mostra "O envio ainda não está configurado neste site" em vez de fingir sucesso.

## O que precisa ser fornecido

### Dados da loja: `assets/js/loja.js`

| Campo | Para quê |
| --- | --- |
| `whatsapp` | Número com DDI e DDD, só algarismos (`5511912345678`). Ativa o envio do pedido e os links "Pedir/Chamar no WhatsApp". |
| `mapa` | Link do Google Maps para "Como chegar". |
| `horarios` | Horário de cada dia (`0` = domingo … `6` = sábado), por exemplo `1: ['09:00', '19:00']`, ou `null` para fechado. Gera o "Aberto agora · fecha às 19h" da Home e do Cardápio. |

Os horários também aparecem em texto no rodapé das duas páginas. Mantenha os dois iguais.

### Preços

Cada preço fica num elemento `<data>`, com o valor que a página calcula (`value`) e o texto que o cliente lê:

```html
<data class="price" value="6.50">R$ 6,50</data>
```

Com `value` vazio, o pedido mostra o total como "a confirmar". Os preços do cento (100 e meio cento) ficam no resumo do montador, em `cardapio.html`. Os quatro produtos da Home repetem os do cardápio: atualize os dois lugares.

### Marcadores nas páginas

Para encontrar todos, procure por `class="ph"` ou por `[` nos dois HTML.

| Marcador | Onde aparece |
| --- | --- |
| `[Bairro, Cidade]` | Rótulo acima do título da Home |
| `[Aberto até 19h]`, `[Bairros atendidos]`, `[Rua, número]` | Fatos da dobra principal. O primeiro é substituído automaticamente quando `horarios` é preenchido. |
| `[salgados que aparecem]` | Legenda da foto principal |
| `R$ [0,00]` | Preço de cada produto e do cento |
| `[24 horas]`, `[cerca de 20 g]` | Antecedência das encomendas e peso do salgado de festa |
| `[4,8]`, `[000]` | Nota e número de avaliações no Google |
| Três depoimentos, `[Nome]`, `[bairro]`, `[Plataforma]` | Clientes. Use trechos reais, com autorização: um sobre um salgado, um sobre festa e um sobre entrega. |
| `[Logo do iFood]`, `[Logo de outra plataforma]` | Plataformas de entrega, se houver |
| `[ano]`, `[bairro]`, frases do "Sobre" | História da loja, só com fatos confirmados |
| Endereço, WhatsApp, horários | Rodapé das duas páginas |
| `[Razão social]`, `[CNPJ]` | Rodapé |

### Cardápio

- Os produtos, as descrições e a escolha dos quatro **mais pedidos** são exemplos. Use os mais vendidos de verdade.
- Para acrescentar um produto, duplique um `<li class="product">` e troque o `data-product` (identificador único, sem espaços), o nome, a descrição, o preço e o pictograma.
- **Regras do cento:**
  - `data-step="25"` define o múltiplo por sabor.
  - `data-max-flavors="4"` define o número máximo de sabores.
  - Os sabores ficam em `<li class="flavor" data-flavor="…">`.

### Fotografia

As fotos ainda são espaços reservados. Cada um traz o pictograma do salgado, e os maiores dizem que foto vai ali. A direção completa (set, luz, ângulos e lista de fotos) está em [CONCEITO.md › Fotografia](CONCEITO.md#fotografia).

| Uso | Formato | Mínimo |
| --- | --- | --- |
| Dobra principal | Vertical 4:5 | 2000 px de largura |
| Produto | Quadrado 1:1 | 1200 px |
| Sobre | Horizontal 3:2 | 2400 px |
| Compartilhamento | 1200 × 630 | — |

Para colocar a foto de um produto, troque o `<div class="product__media slot">…</div>` por:

```html
<picture class="product__media">
  <source srcset="assets/media/coxinha-frango.avif" type="image/avif">
  <source srcset="assets/media/coxinha-frango.webp" type="image/webp">
  <img src="assets/media/coxinha-frango.jpg" width="1200" height="1200" loading="lazy" decoding="async"
    alt="Coxinha de frango partida ao meio, mostrando o recheio, sobre papel-manteiga.">
</picture>
```

### Logo

O logo atual é provisório: a silhueta da coxinha mais o nome em Fraunces. Ele aparece no cabeçalho e no rodapé das duas páginas (`.logo`) e no `favicon.svg`. Substitua pelo SVG oficial.

## Antes de publicar

- [ ] Substituir todos os marcadores entre colchetes, os preços e o logo provisório.
- [ ] Preencher `assets/js/loja.js` (WhatsApp, mapa, horários).
- [ ] Trocar os espaços de foto pela fotografia definitiva.
- [ ] Acrescentar `og:image` com endereço absoluto e `<link rel="canonical">`.
- [ ] Acrescentar dados estruturados (`Bakery` ou `Restaurant`, com endereço, horário e `hasMenu`).
- [ ] Testar um pedido completo no celular, até a mensagem chegar no WhatsApp da loja.

## Licenças

Fraunces e Figtree: SIL Open Font License 1.1 (arquivos em `assets/fonts/`). A Fraunces foi instanciada (eixo *Soft* = 100, peso 400–650), o que a licença permite.
