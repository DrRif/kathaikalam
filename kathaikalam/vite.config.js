import { defineConfig } from 'vite'

export default defineConfig({
  base: '/kathaikalam/',   // ← add this line
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
})
