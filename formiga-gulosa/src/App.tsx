import { MotionConfig } from 'motion/react'
import { useEffect, useState } from 'react'
import { Cursor } from './components/Cursor'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'
import { ScrollProgress } from './components/ScrollProgress'
import { useFinePointer, useReducedMotionPref } from './lib/hooks'
import { iniciarRolagemSuave, irPara } from './lib/scroll'
import { Contato } from './sections/Contato'
import { Depoimentos } from './sections/Depoimentos'
import { Diferenciais } from './sections/Diferenciais'
import { Final } from './sections/Final'
import { Hero } from './sections/Hero'
import { Localizacao } from './sections/Localizacao'
import { Mostruario } from './sections/Mostruario'
import { Navbar } from './sections/Navbar'
import { Processo } from './sections/Processo'
import { Sobre } from './sections/Sobre'

export default function App() {
  const [menuAberto, setMenuAberto] = useState(false)
  const fino = useFinePointer()
  const reduzir = useReducedMotionPref()

  useEffect(() => iniciarRolagemSuave(), [])

  // Links internos (#secao) passam pela rolagem suave e levam o foco junto.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]')
      const id = a?.getAttribute('href')?.slice(1)
      if (!id || !document.getElementById(id)) return
      e.preventDefault()
      irPara(id)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navbar menuAberto={menuAberto} setMenuAberto={setMenuAberto} />
      <main id="conteudo">
        <Hero />
        <Diferenciais />
        <Sobre />
        <Mostruario />
        <Processo />
        <Localizacao />
        <Depoimentos />
        <Contato />
        <Final />
      </main>
      <ScrollProgress />
      <FloatingWhatsApp menuAberto={menuAberto} />
      {fino && !reduzir && <Cursor />}
    </MotionConfig>
  )
}
