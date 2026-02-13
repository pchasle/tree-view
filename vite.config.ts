import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/tree-view/',
  plugins: [react()],
  resolve: {
    alias: {
      '@akeneo-pim/shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    proxy: {
      '/enrich': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
