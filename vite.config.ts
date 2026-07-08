import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { navigatorPlugin } from './vite-plugin-navigator'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), navigatorPlugin()],
  server: {
    port: 5173,
    open: true,
  },
})
