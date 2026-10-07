import { useCallback, useState } from 'react'
import type { Picture as PictureData } from '../lib/fotos'

interface Props {
  picture: PictureData
  alt: string
  sizes: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  objectPosition?: string
  draggable?: boolean
}

/** <picture> com AVIF/WebP responsivos e um fade suave quando a imagem termina de carregar. */
export function Picture({
  picture,
  alt,
  sizes,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  priority = false,
  objectPosition,
  draggable,
}: Props) {
  const [carregada, setCarregada] = useState(false)
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth) setCarregada(true)
  }, [])

  return (
    <picture className={className}>
      {Object.entries(picture.sources).map(([formato, srcSet]) => (
        <source key={formato} type={`image/${formato}`} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        ref={ref}
        className={`${imgClassName} ${carregada ? 'is-loaded' : ''}`}
        src={picture.img.src}
        width={picture.img.w}
        height={picture.img.h}
        alt={alt}
        loading={priority ? 'eager' : loading}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        style={objectPosition ? { objectPosition } : undefined}
        onLoad={() => setCarregada(true)}
        draggable={draggable}
      />
    </picture>
  )
}
