import { useEffect } from 'react'
import { SvgDefs } from './components/Brand'
import { Nav } from './components/Nav'
import { initScroll, ScrollTrigger } from './lib/scroll'
import { Stage } from './sections/Stage'
import { Importance } from './sections/Importance'
import { Application } from './sections/Application'
import { Materials } from './sections/Materials'
import { Research } from './sections/Research'
import { Results } from './sections/Results'
import { Closing } from './sections/Closing'

export function App() {
  useEffect(() => {
    initScroll()
    // Recalcula as posições depois que as fontes chegam (as alturas mudam).
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <SvgDefs />
      <a className="skip-link" href="#sistema">
        Pular para o conteúdo
      </a>
      <Nav />
      <main id="conteudo">
        <Stage />
        <Importance />
        <Application />
        <Materials />
        <Research />
        <Results />
        <Closing />
      </main>
    </>
  )
}
