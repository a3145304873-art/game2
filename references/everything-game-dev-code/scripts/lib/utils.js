#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function safeJsonParse(value, fallback = {}) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
    process.stdin.resume();
  });
}

async function readEvent() {
  const raw = await readStdin();
  if (!raw) return {};
  return safeJsonParse(raw, {});
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function appendText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, text, "utf8");
}

function normalizeText(value) {
  return String(value || "").replace(/\r\n/g, "\n");
}

function textIncludesAny(text, patterns) {
  const source = normalizeText(text).toLowerCase();
  return patterns.some((p) => source.includes(String(p).toLowerCase()));
}

function collectStrings(value, out = []) {
  if (value == null) return out;
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value)) collectStrings(v, out);
    return out;
  }
  return out;
}

function flattenEventText(event) {
  return collectStrings(event).join("\n");
}

function result({
  ok = true,
  status = "ok",
  title = "",
  message = "",
  severity = "info",
  tags = [],
  data = {},
} = {}) {
  const payload = { ok, status, title, message, severity, tags, data };
  process.stdout.write(JSON.stringify(payload, null, 2));
}

module.exports = {
  appendText,
  ensureDir,
  flattenEventText,
  normalizeText,
  readEvent,
  result,
  safeJsonParse,
  textIncludesAny,
  writeJson,
};
