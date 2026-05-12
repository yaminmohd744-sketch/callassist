import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base './' ensures file:// paths work when Electron loads the built app
  base: './',
  // 'inline' source maps don't use eval, avoiding CSP blocks in browser dev
  esbuild: { sourcemap: 'inline' },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@supabase/supabase-js', '@sentry/react', '@sentry/browser'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/release/**', '**/dist/**'],
    },
  },
})
