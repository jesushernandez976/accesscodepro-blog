import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   build: {
    assetsInlineLimit: 0, // Prevents font inlining
  },
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf'],

  server: {
    host: true,
  },

  
})

