#!/usr/bin/env node
const { appendText, flattenEventText, readEvent, result, textIncludesAny } = require("../lib/utils");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const title = "Prefab / Blueprint / node graph warning";
  const tags = ["content-architecture", "ownership", "review"];
  const hits = ["prefab", "blueprint", ".uasset", ".prefab", ".tscn", "node path", "nested prefab", "widget tree", "graph"];
  const matched = textIncludesAny(source, hits);
  const finalMessage = matched
    ? "Complex authored-structure changes detected. Check ownership, hidden coupling, override safety, and review impact."
    : "No hook action needed.";

  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = require("path").join(workspace, ".game-dev", "content-structure.log");
  appendText(
    logFile,
    `[${new Date().toISOString()}] prefab-blueprint-node-warning :: ${JSON.stringify({ title, message: finalMessage, tags, sample: source.slice(0, 400) })}\n`
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
    title: "Prefab / Blueprint / node graph warning",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["content-architecture", "ownership", "review"]
  });
});
