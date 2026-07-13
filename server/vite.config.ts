import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    ssr: 'src/app.ts',
    outDir: 'dist',
    target: 'es2022',
    minify: false,
  },
})
