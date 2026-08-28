#!/usr/bin/env node
const { appendText, flattenEventText, readEvent, result, textIncludesAny } = require("../lib/utils");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const title = "Performance-budget warning";
  const tags = ["performance", "budget", "profiling"];
  const hits = ["tick", "update loop", "particle", "shader", "post-process", "streaming", "niagara", "vfx", "animation", "gc", "alloc", "ai wave", "pathfinding"];
  const matched = textIncludesAny(source, hits);
  const finalMessage = matched
    ? "Potential performance-sensitive change detected. Confirm budget ownership, representative benchmarks, and profiling plan."
    : "No hook action needed.";

  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = require("path").join(workspace, ".game-dev", "performance-budget.log");
  appendText(
    logFile,
    `[${new Date().toISOString()}] performance-budget-warning :: ${JSON.stringify({ title, message: finalMessage, tags, sample: source.slice(0, 400) })}\n`
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
    title: "Performance-budget warning",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["performance", "budget", "profiling"]
  });
});
