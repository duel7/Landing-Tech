/// <reference types="vite/client" />

declare module '*&as=picture' {
  const picture: import('./lib/fotos').Picture
  export default picture
}
