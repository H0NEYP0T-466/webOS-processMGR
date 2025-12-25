import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend API server URL
const BACKEND_URL = 'http://localhost:8888'

// API routes to proxy to the backend
const apiRoutes = ['/auth', '/files', '/desktop', '/vproc', '/hproc', '/health']

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API routes to backend
      ...Object.fromEntries(
        apiRoutes.map(route => [route, { target: BACKEND_URL, changeOrigin: true }])
      ),
      // WebSocket proxy
      '/ws': {
        target: BACKEND_URL.replace('http', 'ws'),
        ws: true,
      },
    },
  },
})
