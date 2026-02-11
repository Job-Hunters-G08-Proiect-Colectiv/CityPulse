const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    globals: true,
    reporters: ["default", "html", "junit"],
    outputFile: {
      html: "./test-report.html",
      junit: "./test-results.xml",
    },
  },
});
