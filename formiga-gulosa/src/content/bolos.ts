/**
 * Informações das fotografias do mostruário.
 *
 * As fotos ficam em src/assets/bolos/. Toda foto colocada nessa pasta aparece
 * sozinha no site (abertura, Sobre e Mostruário) — não é preciso mexer no código.
 *
 * Recortes: um PNG com fundo transparente e o MESMO nome do arquivo, em
 * src/assets/bolos/recortes/, é usado onde o bolo aparece como objeto (dentro das
 * redomas de vidro da abertura e da vitrine). A foto inteira continua sendo usada
 * no Sobre e na visualização ampliada. Sem recorte, a foto inteira é usada em tudo.
 *
 * Este arquivo é opcional: serve para dar nome, categoria e descrição a cada foto.
 * A chave é o nome exato do arquivo. Exemplo:
 *
 *   'bolo-jardim.jpg': {
 *     titulo: 'Jardim de borboletas',
 *     categoria: 'Bolos temáticos',
 *     descricao: 'Dois andares em tons de lilás, com borboletas de papel.',
 *     alt: 'Bolo de dois andares lilás decorado com borboletas',
 *     destaque: true,          // aparece na abertura do site
 *     ordem: 1,                // posição no mostruário (menor vem primeiro)
 *     enquadramento: 'center 30%', // qual parte da foto priorizar ao recortar
 *   },
 *
 * Só use as categorias abaixo quando a foto realmente corresponder a elas.
 */

export const categorias = [
  'Bolos personalizados',
  'Bolos de aniversário',
  'Bolos temáticos',
  'Bolos infantis',
  'Bolos comemorativos',
  'Doces e sobremesas',
  'Mini bolos',
  'Tortas salgadas',
] as const

export type Categoria = (typeof categorias)[number]

export interface InfoBolo {
  titulo?: string
  categoria?: Categoria
  descricao?: string
  alt?: string
  destaque?: boolean
  ordem?: number
  enquadramento?: string
}

// Ordem escolhida pela direção de arte: o bolo de mosquitinhos coloridos abre o site
// (o mais marcante), seguido do vintage, do naked de frutas, do mini bolo e da quiche.
// Os textos descrevem apenas o que aparece nas fotos — ajuste à vontade.
export const infoBolos: Record<string, InfoBolo> = {
  '01-mosquitinhos-coloridos.png': {
    titulo: 'Mosquitinhos coloridos',
    categoria: 'Bolos personalizados',
    descricao: 'Cobertura lisa e branca, emoldurada por mosquitinhos coloridos no topo e na base.',
    alt: 'Bolo alto de cobertura branca decorado com mosquitinhos em azul, lilás, rosa e branco, sobre tábua com a marca Formiga Gulosa',
    destaque: true,
    ordem: 1,
  },
  '02-vintage-delicado.png': {
    titulo: 'Vintage delicado',
    categoria: 'Bolos personalizados',
    descricao: 'Bordas confeitadas, florzinhas rosadas e raminhos verdes feitos à mão.',
    alt: 'Bolo branco no estilo vintage, com bordas confeitadas e pequenas flores rosadas de caule verde',
    ordem: 2,
  },
  '03-naked-de-frutas.png': {
    titulo: 'Naked de frutas',
    categoria: 'Bolos personalizados',
    descricao: 'Massa aparente com recheio cremoso, uvas, kiwi, manga e morangos, e laço com o nome da Formiga Gulosa.',
    alt: 'Naked cake com recheio cremoso, coberto de uvas verdes, kiwi, manga e morangos, com laço vermelho escrito Formiga Gulosa',
    ordem: 3,
  },
  '04-mini-bolo.png': {
    titulo: 'Mini bolo',
    categoria: 'Mini bolos',
    descricao: 'Bolo individual com cobertura cremosa, granulado e bolinhas de chocolate, na caixinha.',
    alt: 'Mini bolo individual com gotas de cobertura cremosa, granulado de chocolate e bolinhas de chocolate na base, dentro de uma caixinha branca',
    ordem: 4,
  },
  '05-quiche.png': {
    titulo: 'Quiche',
    categoria: 'Tortas salgadas',
    descricao: 'Torta salgada de recheio cremoso, coberta de bacon e cebola.',
    alt: 'Quiche de massa dourada com recheio cremoso coberto de cubos de bacon e cebola',
    ordem: 5,
  },
}

/**
 * Depoimentos reais de clientes, com autorização. A seção só aparece quando houver
 * pelo menos um. Exemplo: { texto: '…', autor: 'Maria S.', ocasiao: 'Aniversário de 1 ano' }
 */
export interface Depoimento {
  texto: string
  autor: string
  ocasiao?: string
}

export const depoimentos: Depoimento[] = []
