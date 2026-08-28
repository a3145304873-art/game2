#!/usr/bin/env node
const path = require("path");
const { appendText, flattenEventText, readEvent, result } = require("../lib/utils");
const { getActiveProfile } = require("../lib/profile-resolution");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = path.join(workspace, ".game-dev", "session-summary.md");
  const profile = getActiveProfile();

  const summary = [
    `## ${new Date().toISOString()}`,
    ``,
    `- Active profile: ${profile || "none"}`,
    `- Summary seed: ${source ? source.slice(0, 300).replace(/\n+/g, " ") : "No event text provided."}`,
    `- Follow-up: review decisions, risks, blockers, and documentation updates before closing the session.`,
    ``
  ].join("\n");

  appendText(logFile, summary + "\n");
  result({
    ok: true,
    status: "captured",
    title: "Session summary",
    message: "Wrote a session summary entry with profile and summary seed.",
    severity: "info",
    tags: ["session", "summary", "memory"],
    data: { active_profile: profile }
  });
})().catch((error) => {
  result({
    ok: false,
    status: "error",
    title: "Session summary",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["session", "summary", "memory"]
  });
});
