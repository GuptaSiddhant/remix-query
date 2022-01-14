#!/usr/bin/env node
// Script to publish CLI to NPM.

const { npmPublish } = require("@jsdevtools/npm-publish");
const { readFileSync, writeFileSync } = require("fs");

const token = process.argv[2];
const manifestPath = "package.json";
const preId = "canary";

publishToNpm().then(handleSuccess).catch(handleError);

async function publishToNpm() {
  const result = await npmPublish({ token });

  if (result.type === "none") return await publishCanaryToNpm();

  return result;
}

async function publishCanaryToNpm() {
  const manifestFile = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(manifestFile);
  const canaryManifest = {
    ...manifest,
    version: `${manifest.version}-${preId}.${Date.now().valueOf()}`,
  };
  writeFileSync(manifestPath, JSON.stringify(canaryManifest, null, 2));

  return await npmPublish({ token, tag: preId });
}

/** @param {import("@jsdevtools/npm-publish").Results} results */
function handleSuccess({ tag, version }) {
  console.log(`Usage: npx guptasiddhant@${tag}`);
  console.log(
    `Link : https://www.npmjs.com/package/guptasiddhant/v/${version}`
  );
}

function handleError(error) {
  console.error(error);
  process.exit(1);
}
