#!/usr/bin/env node
const { appendText, flattenEventText, readEvent, result, textIncludesAny } = require("../lib/utils");

(async function main() {
  const event = await readEvent();
  const source = flattenEventText(event);
  const title = "Asset-size / content-weight warning";
  const tags = ["asset-budget", "memory", "build-size"];
  const hits = [".wav", ".png", ".tga", ".exr", ".fbx", ".uasset", ".mp4", "4k", "8k", "texture", "cinematic", "voice pack", "bundle", "addressables"];
  const matched = textIncludesAny(source, hits);
  const finalMessage = matched
    ? "Potentially heavy content change detected. Confirm import settings, compression, runtime use, and platform budget impact."
    : "No hook action needed.";

  const workspace = process.env.WORKSPACE_ROOT || process.cwd();
  const logFile = require("path").join(workspace, ".game-dev", "asset-size.log");
  appendText(
    logFile,
    `[${new Date().toISOString()}] asset-size-warning :: ${JSON.stringify({ title, message: finalMessage, tags, sample: source.slice(0, 400) })}\n`
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
    title: "Asset-size / content-weight warning",
    message: error && error.message ? error.message : "Unexpected hook failure.",
    severity: "error",
    tags: ["asset-budget", "memory", "build-size"]
  });
});
