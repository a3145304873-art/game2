#!/usr/bin/env node
const { appendText, flattenEventText, readEvent, result, textIncludesAny } = require("../lib/utils");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const title = "GDD / design-sync warning";
  const tags = ["design", "docs", "source-of-truth"];
  const hits = ["gdd", "design", "combat", "economy", "quest", "onboarding", "tutorial", "progression", "narrative"];
  const matched = textIncludesAny(source, hits);
  const finalMessage = matched
    ? "Design-facing changes detected. Confirm the matching GDD, feature spec, or technical notes are also updated."
    : "No hook action needed.";

  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = require("path").join(workspace, ".game-dev", "gdd-sync.log");
  appendText(
    logFile,
    `[${new Date().toISOString()}] gdd-sync-warning :: ${JSON.stringify({ title, message: finalMessage, tags, sample: source.slice(0, 400) })}\n`
  );

  result({
    ok: true,
    status: matched ? "attention" : "ok",
    title,
    message: finalMessage,
    severity: matched ? "warning" : "info",
    tags,
    data: {
      matched,
      trigger_count: matched ? hits.filter((item) => source.toLowerCase().includes(String(item).toLowerCase())).length : 0
    }
  });
})().catch((error) => {
  result({
    ok: false,
    status: "error",
    title: "GDD / design-sync warning",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["design", "docs", "source-of-truth"]
  });
});
