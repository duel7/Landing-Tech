import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A cena 3D (three, R3F, pós-processamento) fica em um pedaço separado do bundle,
// carregado depois do conteúdo — o site fica navegável antes de a cena chegar.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
    // three + R3F + pós-processamento formam um pedaço grande, carregado sob demanda
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id) || /preload-helper|commonjsHelpers/.test(id)) return 'react'
          if (/node_modules\/(three|@react-three|postprocessing|maath|three-stdlib|troika|camera-controls)/.test(id)) return 'three'
          if (/node_modules\/(gsap|lenis)/.test(id)) return 'motion'
        },
      },
    },
  },
})
