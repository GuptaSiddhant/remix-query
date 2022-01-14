#!/usr/bin/env node
// Script to build CLI with esbuild.

const args = process.argv.slice(2);
const watch = args.includes("watch");

/** @type import("esbuild").BuildOptions */
const buildOptions = {
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.cjs",
  bundle: true,
  platform: "node",
  watch,
  color: true,
  logLevel: "info",
  external: ["react", "@remix-run/*"],
};

require("esbuild")
  .build(buildOptions)
  .catch(() => process.exit(1));

require("esbuild")
  .build({ ...buildOptions, outfile: "dist/index.js", platform: "neutral" })
  .catch(() => process.exit(1));
