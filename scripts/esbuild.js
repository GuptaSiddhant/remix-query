#!/usr/bin/env node
// Script to build CLI with esbuild.

const args = process.argv.slice(2);
const watch = args.includes("watch");
const esbuild = require("esbuild");

/** @type import("esbuild").BuildOptions */
const commonBuildOptions = {
  entryPoints: ["src/index.ts"],
  color: true,
  bundle: true,
  external: ["react", "@remix-run/*"],
  logLevel: "info",
};

esbuild
  .build({
    ...commonBuildOptions,
    outfile: "dist/index.js",
    platform: "neutral",
    watch,
  })
  .catch(() => process.exit(1));

if (!watch) {
  esbuild
    .build({
      ...commonBuildOptions,
      minify: true,
      outfile: "dist/index.cjs",
      platform: "node",
    })
    .catch(() => process.exit(1));
}
