import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration
// The proxy forwards all API calls to our backend on port 1000
// This way React (port 5173) talks to the backend (port 1000) without CORS issues
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All these paths → forwarded to the Express backend at port 1000
      '/register':  { target: 'http://localhost:1000', changeOrigin: true },
      '/login':     { target: 'http://localhost:1000', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:1000', changeOrigin: true },
      '/medicines': { target: 'http://localhost:1000', changeOrigin: true },
      '/bill':      { target: 'http://localhost:1000', changeOrigin: true },
      '/history':   { target: 'http://localhost:1000', changeOrigin: true },
      '/profile':   { target: 'http://localhost:1000', changeOrigin: true },
      '/chatbot':   { target: 'http://localhost:1000', changeOrigin: true },
      '/customers': { target: 'http://localhost:1000', changeOrigin: true },
    }
  }
})

