import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    reporters: [
      'default',
      'junit',
      ['html', { outputFile: './html/index.html' }]
    ],
    outputFile: {
      junit: './test-results.xml'
    }
  }
})