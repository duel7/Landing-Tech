/**
 * Informações das fotografias do mostruário.
 *
 * As fotos ficam em src/assets/bolos/. Toda foto colocada nessa pasta aparece
 * sozinha no site (abertura, Sobre e Mostruário) — não é preciso mexer no código.
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

export const infoBolos: Record<string, InfoBolo> = {}

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
