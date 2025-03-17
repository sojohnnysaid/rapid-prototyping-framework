import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Suppress React Router v7 warnings
    'process.env.ROUTER_SUPPRESS_FUTURE_WARNINGS': JSON.stringify('true'),
  }
})