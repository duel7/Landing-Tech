import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

// As fotos dos bolos (src/assets/bolos) são convertidas no build para AVIF e WebP
// em várias larguras — o navegador baixa só o tamanho que a tela precisa.
export default defineConfig({
  base: './',
  plugins: [react(), imagetools()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 2048,
  },
})
