import { AnimatePresence, motion } from 'motion/react'
import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { linkWhatsapp, site } from '../config/site'
import { WhatsAppIcon } from './Sweets'
import './floating-whatsapp.css'

/**
 * Atalho fixo para o WhatsApp. Aparece depois da abertura e some quando a pessoa
 * já está diante dos botões de contato, para não repetir o mesmo convite.
 */
export function FloatingWhatsApp({ menuAberto }: { menuAberto: boolean }) {
  const [passouAbertura, setPassouAbertura] = useState(false)
  const [contatoVisivel, setContatoVisivel] = useState(false)

  useEffect(() => {
    const onScroll = () => setPassouAbertura(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const visiveis = new Set<Element>()
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)))
        setContatoVisivel(visiveis.size > 0)
      },
      { rootMargin: '0px 0px -25% 0px' },
    )
    document.querySelectorAll('[data-esconde-flutuante]').forEach((el) => io.observe(el))
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  const mostrar = passouAbertura && !contatoVisivel && !menuAberto

  return (
    <AnimatePresence>
      {mostrar && (
        <motion.div
          className="float-wa"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <a className="float-wa__main" href={linkWhatsapp()} target="_blank" rel="noopener noreferrer">
            <span className="float-wa__icon">
              <WhatsAppIcon size={22} />
            </span>
            <span className="float-wa__text">
              Encomendar <span className="float-wa__hide-desk">pelo WhatsApp</span>
            </span>
            <span className="sr-only"> (abre o WhatsApp)</span>
          </a>
          <a className="float-wa__call" href={site.telefone.link} aria-label={`Ligar para ${site.telefone.exibicao}`}>
            <Phone size={19} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
