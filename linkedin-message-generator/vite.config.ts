import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define:{'process.env': {}}, // Prevents process.env errors in the browser
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup.html',
        auth: 'public/auth.html',
      },
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: `[name][extname]`,
        chunkFileNames: 'assets/[name].js'
      }
    }
  }
})
