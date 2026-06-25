import { defineConfig } from "vitest/config"

// Vitest 4 transforms JSX with oxc's automatic runtime (default jsxImportSource
// "react", and "react/jsx-dev-runtime" in dev). We alias every react entry point
// — including both jsx runtimes — to preact so component tests run on the same
// engine the embed bundle ships (esbuild aliases the same set in build-embed.mjs).
export default defineConfig({
  test: {
    passWithNoTests: true,
    environment: "node", // per-file override to jsdom via a top-of-file comment
  },
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react/jsx-dev-runtime": "preact/jsx-dev-runtime",
    },
  },
})
