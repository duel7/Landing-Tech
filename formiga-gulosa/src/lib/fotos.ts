import { infoBolos, type InfoBolo } from '../content/bolos'

export interface Picture {
  sources: Record<string, string>
  img: { src: string; w: number; h: number }
}

export interface Foto extends Required<Pick<InfoBolo, 'alt'>> {
  id: string
  numero: number
  picture: Picture
  titulo?: string
  categoria?: InfoBolo['categoria']
  descricao?: string
  destaque: boolean
  enquadramento: string
  proporcao: number
}

// Cada foto vira AVIF e WebP em quatro larguras (nunca maiores que o original).
const arquivos = import.meta.glob<Picture>('../assets/bolos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  import: 'default',
  query: '?w=480;800;1200;1800&format=avif;webp&quality=78&as=picture',
})

const nomeArquivo = (caminho: string) => caminho.split('/').pop() ?? caminho

export const fotos: Foto[] = Object.entries(arquivos)
  .map(([caminho, picture]) => {
    const id = nomeArquivo(caminho)
    const info = infoBolos[id] ?? {}
    return { id, info, picture }
  })
  .sort((a, b) => {
    const oa = a.info.ordem ?? Number.POSITIVE_INFINITY
    const ob = b.info.ordem ?? Number.POSITIVE_INFINITY
    return oa === ob ? a.id.localeCompare(b.id, 'pt-BR', { numeric: true }) : oa - ob
  })
  .map(({ id, info, picture }, i) => ({
    id,
    numero: i + 1,
    picture,
    titulo: info.titulo,
    categoria: info.categoria,
    descricao: info.descricao,
    alt:
      info.alt ??
      (info.titulo
        ? `${info.titulo}, bolo da Formiga Gulosa`
        : `Bolo personalizado da Formiga Gulosa, criação ${String(i + 1).padStart(2, '0')}`),
    destaque: Boolean(info.destaque),
    enquadramento: info.enquadramento ?? 'center',
    proporcao: picture.img.w / picture.img.h,
  }))

/** Foto da abertura: a marcada como destaque ou, se nenhuma, a primeira. */
export const fotoDestaque: Foto | undefined = fotos.find((f) => f.destaque) ?? fotos[0]

/** Rótulo curto para uma foto: título, categoria ou o número da criação. */
export function rotuloFoto(f: Foto) {
  return f.titulo ?? f.categoria ?? `Criação ${String(f.numero).padStart(2, '0')}`
}
