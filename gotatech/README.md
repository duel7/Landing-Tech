# GotaTech — Sistema Sustentável de Captação Pluvial

Página de apresentação do projeto para a **Feira Científica Anne Frank 2026** (Escola Municipal Anne Frank, Palmas/TO).

O site inteiro está em um único arquivo, `index.html`, com o HTML, o CSS (dentro de `<style>`) e o JavaScript (dentro de `<script>`). Para abrir, basta dar dois cliques no arquivo; funciona sem internet (só a fonte Inter é trocada por uma fonte parecida do sistema).

## O que tem na página

1. **Abertura**: nome do projeto, frase "A chuva pode ter um novo caminho." e o botão "Veja como funciona".
2. **O caminho da água**: ilustração animada do sistema (Chuva → Telhado → Calha → Filtro → Reservatório subterrâneo → Bomba → Uso não potável). A animação começa sozinha quando aparece na tela e tem os botões Reproduzir/Pausar e Reiniciar; clicar em uma etapa a destaca.
3. **Por que captar a água da chuva?**: conceito, frase em destaque e o contexto de Palmas/TO.
4. **Etapas do projeto**: metodologia em cinco etapas e os resultados **esperados** (ainda não comprovados).
5. **Rodapé**: instituição, equipe, orientador e referências.

## Como editar

| Quero mudar… | Onde |
| --- | --- |
| Um texto | Procure o texto no `index.html` (Ctrl+F) e edite entre as tags. |
| As cores | Variáveis em `:root`, no começo do `<style>`. |
| A velocidade da animação | `DURACAO_ETAPA` no `<script>` (segundos por etapa). |
| A explicação de cada etapa da animação | Blocos `<article class="legenda__item">`. |
| Quando a água chega em cada parte | Atributos `data-de`, `data-ate` e `data-cheio-em` no desenho (medidos em etapas; o comentário acima da ilustração explica). |

## Acessibilidade

- Funciona no teclado (tecla Tab) e tem textos para leitores de tela.
- Respeita a opção "reduzir movimento" do sistema: a ilustração abre completa e parada, e só anima se a pessoa apertar "Reproduzir".
- Sem JavaScript, a ilustração aparece completa e as explicações de todas as etapas ficam em lista.
- No celular, a ilustração fica simplificada: os nomes dentro do desenho dão lugar a números maiores, explicados na lista logo abaixo.
