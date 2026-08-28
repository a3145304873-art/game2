param(
  [Parameter(Mandatory = $false)]
  [string]$Profile
)

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $RootDir
try {
  node scripts/install-profile.js $Profile
  exit $LASTEXITCODE
}
finally {
  Pop-Location
}
