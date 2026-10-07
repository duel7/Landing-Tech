/**
 * Dados da Formiga Gulosa usados em todo o site.
 * Para mudar telefone, endereço ou a mensagem do WhatsApp, altere apenas este arquivo.
 */
export const site = {
  nome: 'Formiga Gulosa',
  assinatura: 'Confeitaria artesanal',
  descricao: 'Bolos personalizados e doces de confeitaria artesanal em Itabuna - BA.',

  endereco: {
    rua: 'R. José Alves dos Reis, 59',
    bairro: 'Góes Calmon',
    cidade: 'Itabuna',
    uf: 'BA',
    estado: 'Bahia',
    cep: '45605-482',
    pais: 'Brasil',
  },

  telefone: {
    exibicao: '(73) 9131-3180',
    link: 'tel:+557391313180',
  },

  whatsapp: {
    exibicao: '(73) 9131-3180',
    numero: '557391313180',
    mensagem: 'Olá! Conheci a Formiga Gulosa pelo site e gostaria de saber mais sobre os bolos personalizados.',
  },

  /** Deixe vazio enquanto não houver. Quando preenchido, aparece no rodapé. Ex.: 'https://instagram.com/…' */
  instagram: '',
  /** Deixe vazio enquanto não houver. Quando preenchido, aparece em Localização. Ex.: 'Seg. a sáb., 9h às 18h' */
  horario: '',
} as const

export const enderecoCompleto = `${site.endereco.rua} - ${site.endereco.bairro}, ${site.endereco.cidade} - ${site.endereco.uf}, ${site.endereco.cep}, ${site.endereco.pais}`

const enderecoUrl = encodeURIComponent(enderecoCompleto)

export const links = {
  mapa: `https://www.google.com/maps/search/?api=1&query=${enderecoUrl}`,
  comoChegar: `https://www.google.com/maps/dir/?api=1&destination=${enderecoUrl}`,
  mapaEmbed: `https://www.google.com/maps?q=${enderecoUrl}&hl=pt-BR&z=16&output=embed`,
  telefone: site.telefone.link,
}

export function linkWhatsapp(mensagem: string = site.whatsapp.mensagem) {
  return `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`
}

export const secoes = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'sobre', rotulo: 'Sobre' },
  { id: 'mostruario', rotulo: 'Mostruário' },
  { id: 'localizacao', rotulo: 'Localização' },
  { id: 'contato', rotulo: 'Contato' },
] as const

export type SecaoId = (typeof secoes)[number]['id']
