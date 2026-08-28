#!/usr/bin/env node
const path = require("path");
const { appendText, flattenEventText, readEvent, result } = require("../lib/utils");
const { getActiveProfile } = require("../lib/profile-resolution");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const profile = getActiveProfile();
  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = path.join(workspace, ".game-dev", "build-matrix.log");

  const looksLikeBuild = /build|package|export|cook|test|ci|deploy|archive/i.test(source);
  if (looksLikeBuild) {
    appendText(
      logFile,
      `[${new Date().toISOString()}] ${JSON.stringify({
        active_profile: profile,
        source_excerpt: source.slice(0, 500)
      })}\n`
    );
  }

  result({
    ok: true,
    status: looksLikeBuild ? "captured" : "ok",
    title: "Build matrix capture",
    message: looksLikeBuild
      ? "Captured build/test/export context for later debugging and release analysis."
      : "No build-like activity detected.",
    severity: "info",
    tags: ["build", "ci", "release"],
    data: {
      active_profile: profile,
      captured: looksLikeBuild
    }
  });
})().catch((error) => {
  result({
    ok: false,
    status: "error",
    title: "Build matrix capture",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["build", "ci", "release"]
  });
});
