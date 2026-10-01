$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $siteRoot 'server.pid'
if (Test-Path -LiteralPath $pidFile) {
    $sitePid = [int](Get-Content -LiteralPath $pidFile)
    $siteProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $sitePid"
    $expectedScript = Join-Path $siteRoot 'server.cjs'
    if ($siteProcess -and $siteProcess.Name -eq 'node.exe' -and $siteProcess.CommandLine.Contains($expectedScript)) { Stop-Process -Id $sitePid }
    Remove-Item -LiteralPath $pidFile -ErrorAction SilentlyContinue
}
