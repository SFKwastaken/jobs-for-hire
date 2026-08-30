import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import apiApp from './server/api'

function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server: any) {
      server.middlewares.use(apiApp);
    }
  }
}

// https://vite.dev/config/
// Trigger restart to load new api endpoints!!!
export default defineConfig({
  plugins: [react(), apiMiddleware()],
  server: {
    proxy: {
      '/api/jobicy': {
        target: 'https://jobicy.com/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jobicy/, '')
      }
    }
  }
})