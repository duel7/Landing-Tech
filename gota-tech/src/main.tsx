import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/instrument-sans/wdth.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource-variable/unbounded/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import './styles/global.css'

import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
