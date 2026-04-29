import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    watch: {
      // Required for hot reload inside Docker on Windows (NTFS doesn't emit inotify events)
      usePolling: true,
      interval: 500,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/test-setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/**/*.test.{js,jsx}', 'src/__tests__/**'],
    },
  },
})
