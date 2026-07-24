import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // History mode fallback: serve index.html for all routes (including /admin)
    // so React's client-side routing handles them instead of the dev server returning 404
    historyApiFallback: true,
  },
})
