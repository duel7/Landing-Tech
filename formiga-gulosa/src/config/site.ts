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

  instagram: {
    usuario: '@formiga_gulosa_',
    link: 'https://www.instagram.com/formiga_gulosa_/',
  },
  /** Deixe vazio enquanto não houver. Quando preenchido, aparece em Localização. Ex.: 'Seg. a sáb., 9h às 18h' */
  horario: '',
} as const

export const enderecoCompleto = `${site.endereco.rua} - ${site.endereco.bairro}, ${site.endereco.cidade} - ${site.endereco.uf}, ${site.endereco.cep}, ${site.endereco.pais}`

const enderecoUrl = encodeURIComponent(enderecoCompleto)

export const links = {
  mapa: `https://www.google.com/maps/search/?api=1&query=${enderecoUrl}`,
  comoChegar: `https://www.google.com/maps/dir/?api=1&destination=${enderecoUrl}`,
  // iframe exatamente como fornecido pela Formiga Gulosa
  mapaEmbed:
    'https://www.google.com/maps?q=R.%20José%20Alves%20dos%20Reis,%2059%20-%20Góes%20Calmon,%20Itabuna%20-%20BA,%2045605-482,%20Brasil&output=embed',
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
