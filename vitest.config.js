import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    reporters: [
      'default',
      'junit',
      ['html', { outputFile: './html/index.html' }]
    ],
    outputFile: {
      junit: './test-results.xml'
    }
  },
});


