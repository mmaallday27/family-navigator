import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The frontend dev server. All /api requests are proxied to the real backend
// (server/index.ts) so cookies and the AI navigator work in development exactly
// as they will in production, where the backend serves the built client itself.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
