import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    reporters: [
      'default',
      'html',
      'junit'
    ],
    outputFile: {
      html: './test-report.html',
      junit: './test-results.xml'
    }
  },
});


