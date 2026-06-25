import * as esbuild from "esbuild"

const watch = process.argv.includes("--watch")

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ["embed/entry.tsx"],
  bundle: true,
  format: "iife",
  minify: true,
  target: ["es2019"],
  outfile: "public/embed.js",
  jsx: "automatic",
  jsxImportSource: "preact",
  loader: { ".css": "text" },
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
    "react/jsx-runtime": "preact/jsx-runtime",
  },
  logLevel: "info",
}

if (watch) {
  const ctx = await esbuild.context(options)
  await ctx.watch()
  console.log("[embed] watching for changes…")
} else {
  await esbuild.build(options)
  console.log("[embed] built public/embed.js")
}
