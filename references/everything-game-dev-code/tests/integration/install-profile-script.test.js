#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const scriptPath = path.join(repoRoot, "scripts", "install-profile.js");

assert.ok(fs.existsSync(scriptPath), "scripts/install-profile.js must exist.");

const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "everything-game-dev-code-"));
const result = spawnSync(process.execPath, [scriptPath, "unity-production"], {
  cwd: repoRoot,
  env: {
    ...process.env,
    WORKSPACE_ROOT: workspaceRoot,
  },
  encoding: "utf8",
});

assert.strictEqual(result.status, 0, `install-profile.js should succeed.\n${result.stderr}`);

const output = JSON.parse(result.stdout);
assert.strictEqual(output.ok, true, "install-profile.js should report success.");
assert.strictEqual(output.profile, "unity-production", "The requested profile should be installed.");
assert.strictEqual(output.active_engine, "unity", "The active engine should resolve from the engine component.");
assert.ok(output.included_files > 0, "The install report should contain resolved files.");

const statePath = path.join(workspaceRoot, ".game-dev", "install-state.json");
const profilePath = path.join(workspaceRoot, ".game-dev", "profile.json");
const reportPath = path.join(workspaceRoot, ".game-dev", "install-report.json");

for (const filePath of [statePath, profilePath, reportPath]) {
  assert.ok(fs.existsSync(filePath), `Expected generated file '${path.basename(filePath)}'.`);
}

const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
assert.strictEqual(state.version, 1, "install-state.json should include schema version.");
assert.strictEqual(state.active_profile, "unity-production", "install-state.json should record the install profile.");
assert.strictEqual(state.active_engine, "unity", "install-state.json should record the active engine.");
assert.ok(Array.isArray(state.installed_components), "install-state.json should list installed components.");
assert.ok(Array.isArray(state.installed_modules), "install-state.json should list installed modules.");

const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
assert.strictEqual(profile.active_profile, "unity", "profile.json should expose the active engine for runtime hooks.");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
assert.strictEqual(report.profile.id, "unity-production", "install-report.json should record the profile id.");
assert.ok(
  report.included_files.includes("commands/unity-review.md"),
  "install-report.json should include files from the selected engine layer."
);

fs.rmSync(workspaceRoot, { recursive: true, force: true });

console.log("PASS integration/install-profile-script.test.js");
