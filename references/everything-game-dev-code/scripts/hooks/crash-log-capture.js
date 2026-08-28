#!/usr/bin/env node
const path = require("path");
const { appendText, flattenEventText, readEvent, result } = require("../lib/utils");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = path.join(workspace, ".game-dev", "crash-log-capture.log");
  const matched = /crash|exception|stack trace|callstack|fatal error|segmentation fault|nullreference|access violation/i.test(source);

  if (matched) {
    appendText(
      logFile,
      `[${new Date().toISOString()}] ${JSON.stringify({
        source_excerpt: source.slice(0, 1000)
      })}\n`
    );
  }

  result({
    ok: true,
    status: matched ? "captured" : "ok",
    title: "Crash-log capture",
    message: matched
      ? "Captured crash-related context for triage clustering and follow-up."
      : "No crash-related activity detected.",
    severity: matched ? "warning" : "info",
    tags: ["crash", "triage", "stability"],
    data: { captured: matched }
  });
})().catch((error) => {
  result({
    ok: false,
    status: "error",
    title: "Crash-log capture",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["crash", "triage", "stability"]
  });
});
