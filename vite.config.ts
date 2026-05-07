import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Dev-only proxy so the browser can fetch the canonical ZIP index
      // without tripping CORS. See src/lib/load-zips.ts.
      '/__zips-source': {
        target: 'https://zips.z.cash',
        changeOrigin: true,
        rewrite: () => '/',
      },
    },
  },
})
