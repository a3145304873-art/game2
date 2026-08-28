#Requires -Version 5.0
<#
  AI Handoff Kit - Harness Installer (Windows)
  Deploys the collaboration harness into the current user's Claude Code environment:
    commands -> ~/.claude/commands/
    agents   -> ~/.claude/agents/
    kernel   -> ~/.spec-workflow/   (templates / checklists / schemas)
  Existing files are backed up as <name>.bak-harness-<timestamp>; nothing is silently overwritten.
  Re-runnable: each run refreshes files and re-backs-up anything that diverged.
#>

$ErrorActionPreference = "Stop"
$HomeDir     = $env:USERPROFILE
$ClaudeDir   = Join-Path $HomeDir ".claude"
$KernelHome  = Join-Path $HomeDir ".spec-workflow"
$HarnessRoot = $PSScriptRoot
$stamp       = Get-Date -Format "yyyyMMdd-HHmmss"
$total = 0; $backups = 0

function Install-File {
    param($SrcFile, $DstRoot, $SrcRoot)
    $script:total++
    $rel = $SrcFile.Substring($SrcRoot.Length).TrimStart('\', '/')
    $dst = Join-Path $DstRoot $rel
    $dstDir = Split-Path $dst -Parent
    if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
    if (Test-Path $dst) {
        Copy-Item $dst "$dst.bak-harness-$stamp" -Force
        Write-Host "  [backup]  $rel" -ForegroundColor Yellow
        $script:backups++
    } else {
        Write-Host "  [install] $rel" -ForegroundColor Green
    }
    Copy-Item $SrcFile $dst -Force
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Handoff Kit - Harness Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  User home : $HomeDir"
Write-Host "  Source    : $HarnessRoot"
Write-Host ""

if (-not (Test-Path (Join-Path $HarnessRoot "commands"))) {
    Write-Host "ERROR: commands/ not found next to this script." -ForegroundColor Red
    Write-Host "Make sure you run this from the 01-harness folder (cd into it, then .\install.ps1)." -ForegroundColor Red
    exit 1
}

Write-Host "[1/3] commands -> ~/.claude/commands/" -ForegroundColor Cyan
$cmdSrc = Join-Path $HarnessRoot "commands"
Get-ChildItem $cmdSrc -File -Recurse | ForEach-Object { Install-File $_.FullName (Join-Path $ClaudeDir "commands") $cmdSrc }
Write-Host ""

Write-Host "[2/3] review agents -> ~/.claude/agents/" -ForegroundColor Cyan
$agentSrc = Join-Path $HarnessRoot "agents"
Get-ChildItem $agentSrc -File -Recurse | ForEach-Object { Install-File $_.FullName (Join-Path $ClaudeDir "agents") $agentSrc }
Write-Host ""

Write-Host "[3/3] shared kernel -> ~/.spec-workflow/" -ForegroundColor Cyan
$kernelSrc = Join-Path $HarnessRoot "kernel"
Get-ChildItem $kernelSrc -File -Recurse | ForEach-Object { Install-File $_.FullName $KernelHome $kernelSrc }
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Done. Installed $total file(s), backed up $backups." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verify it worked:"
Write-Host "  1. Open Claude Code (in any folder, run: claude)"
Write-Host "  2. Type /  -- you should see /kickoff  /write-spec  /write-plan  ..."
Write-Host "  3. Not visible? Close Claude Code and reopen it (commands load at startup)."
Write-Host ""
Write-Host "Next step: open the 02-collaboration folder and read its README + quick-start guide."
Write-Host ""
