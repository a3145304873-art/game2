#!/usr/bin/env node
const path = require("path");
const { appendText, flattenEventText, readEvent, result } = require("../lib/utils");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = path.join(workspace, ".game-dev", "playtest-notes.log");
  const matched = /playtest|usability|session findings|first-time user|retention test/i.test(source);

  if (matched) {
    appendText(
      logFile,
      `[${new Date().toISOString()}] ${JSON.stringify({
        note: "Playtest-related edit or note detected.",
        source_excerpt: source.slice(0, 500)
      })}\n`
    );
  }

  result({
    ok: true,
    status: matched ? "captured" : "ok",
    title: "Playtest capture",
    message: matched
      ? "Captured playtest-related context for later analysis and reporting."
      : "No playtest-related activity detected.",
    severity: "info",
    tags: ["playtest", "ux", "analysis"],
    data: { captured: matched }
  });
})().catch((error) => {
  result({
    ok: false,
    status: "error",
    title: "Playtest capture",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["playtest", "ux", "analysis"]
  });
});
