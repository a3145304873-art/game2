#!/usr/bin/env node
const { appendText, flattenEventText, readEvent, result, textIncludesAny } = require("../lib/utils");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const title = "Scene / map / mission integrity warning";
  const tags = ["scene", "level", "mission", "integration"];
  const hits = [".unity", ".umap", ".tscn", "scene", "prefab", "blueprint", "autoload", "level beat", "quest state", "mission flow"];
  const matched = textIncludesAny(source, hits);
  const finalMessage = matched
    ? "High-risk scene or mission-flow edits detected. Confirm reference integrity, transitions, and representative smoke coverage."
    : "No hook action needed.";

  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = require("path").join(workspace, ".game-dev", "scene-integrity.log");
  appendText(
    logFile,
    `[${new Date().toISOString()}] scene-integrity-check :: ${JSON.stringify({ title, message: finalMessage, tags, sample: source.slice(0, 400) })}\n`
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
    title: "Scene / map / mission integrity warning",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["scene", "level", "mission", "integration"]
  });
});
