// Todo o texto do site em um só lugar.
//
// Fonte: o conteúdo da pesquisa Gota Tech fornecido no briefing (objetivos,
// justificativa, metodologia, materiais e resultados esperados). Nenhum número,
// medição, custo, capacidade ou resultado obtido foi acrescentado — a pesquisa
// descreve uma proposta em estudo, não um sistema instalado.

export const site = {
  name: 'Gota Tech',
  subtitle: 'Sistema sustentável de captação pluvial',
  school: 'Escola Municipal Anne Frank',
  city: 'Palmas',
  state: 'Tocantins',
  stateShort: 'TO',
}

export const nav = [
  { id: 'inicio', label: 'Início' },
  { id: 'sistema', label: 'O sistema' },
  { id: 'sustentabilidade', label: 'Sustentabilidade' },
  { id: 'aplicacao', label: 'Aplicação' },
  { id: 'pesquisa', label: 'Pesquisa' },
] as const

export const hero = {
  wordmark: 'GOTA TECH',
  line1: 'A chuva cai.',
  line2: 'A tecnologia transforma.',
  support: 'Uma nova forma de aproveitar cada gota.',
  cta: 'Explore o sistema',
}

export type Step = {
  n: string
  title: string
  text: string
  /** Rótulo curto exibido na trilha de progresso. */
  short: string
}

export const steps: Step[] = [
  { n: '01', title: 'Captação', short: 'Captação', text: 'A chuva atinge o telhado e é conduzida pelas calhas.' },
  { n: '02', title: 'Condução', short: 'Condução', text: 'A água percorre tubulações até a área de armazenamento.' },
  { n: '03', title: 'Filtragem', short: 'Filtragem', text: 'Um filtro simples ajuda a reter folhas e outras partículas.' },
  { n: '04', title: 'Armazenamento', short: 'Armazenamento', text: 'A água fica armazenada em um reservatório adequado.' },
  {
    n: '05',
    title: 'Reaproveitamento',
    short: 'Reaproveitamento',
    text: 'A água pode ser destinada a usos não potáveis compatíveis com o sistema, como irrigação de plantas, limpeza de áreas externas e descargas sanitárias.',
  },
]

export const reuses = [
  { key: 'irrigacao', title: 'Irrigação de plantas', note: '' },
  { key: 'limpeza', title: 'Limpeza de áreas externas', note: '' },
  { key: 'descargas', title: 'Descargas sanitárias', note: 'Desde que a instalação seja tecnicamente adequada.' },
] as const

export const importance = {
  title: 'Cada gota conta',
  text: 'A água potável é essencial para a vida. Aproveitar a água da chuva em atividades que não exigem potabilidade é uma oportunidade de reduzir desperdícios e incentivar hábitos sustentáveis.',
  pillars: [
    { key: 'economia', title: 'Economia de água potável' },
    { key: 'preservacao', title: 'Preservação dos recursos naturais' },
    { key: 'consciencia', title: 'Consciência ambiental na comunidade escolar' },
  ],
}

export const application = {
  quote: 'Uma proposta para transformar a chuva em um recurso útil para a comunidade escolar.',
}

export type Component = {
  key: 'calhas' | 'tubos' | 'filtro' | 'reservatorio'
  code: string
  title: string
  text: string
}

// Funções descritas a partir das etapas do sistema. Especificações (dimensões,
// capacidade, materiais exatos) não constam da pesquisa e por isso não aparecem.
export const components: Component[] = [
  {
    key: 'calhas',
    code: 'A',
    title: 'Calhas',
    text: 'Recolhem a água que escorre do telhado.',
  },
  {
    key: 'tubos',
    code: 'B',
    title: 'Tubos e conexões',
    text: 'Levam a água das calhas até o reservatório.',
  },
  {
    key: 'filtro',
    code: 'C',
    title: 'Filtro para folhas e partículas',
    text: 'Retém folhas e outras partículas.',
  },
  {
    key: 'reservatorio',
    code: 'D',
    title: 'Reservatório adequado',
    text: 'Guarda a água para usos não potáveis.',
  },
]

export const methodology = [
  'Pesquisar a importância da água potável e os impactos do desperdício.',
  'Estudar sistemas de captação da água da chuva.',
  'Observar o ambiente escolar e identificar locais adequados.',
  'Elaborar uma proposta considerando materiais, custos e segurança.',
  'Identificar possibilidades de reaproveitamento.',
  'Apresentar a proposta à comunidade escolar.',
  'Caso ocorra a instalação, acompanhar o funcionamento e avaliar a água aproveitada.',
]

export const results = {
  title: 'O futuro começa com uma gota',
  items: [
    'Incentivar a economia de água potável.',
    'Demonstrar os benefícios da captação pluvial.',
    'Estimular a consciência ambiental.',
    'Possibilitar o aproveitamento da água em atividades adequadas.',
  ],
}

export const closing = {
  line1: 'O futuro é sustentável.',
  line2: 'E começa com cada gota.',
  tagline: 'Captação e reaproveitamento da água da chuva.',
}
