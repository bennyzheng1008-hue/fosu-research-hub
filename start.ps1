$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$siteAddress = 'http://127.0.0.1:41847/'
$siteNode = (Get-Command node -ErrorAction Stop).Source
$healthy = $false
try { $siteHealth = Invoke-RestMethod -Uri ($siteAddress + 'health') -TimeoutSec 2; $healthy = $siteHealth.site -eq 'fosu-research-hub' } catch {}
if (-not $healthy) {
    $siteProcess = Start-Process -FilePath $siteNode -ArgumentList ('"' + (Join-Path $siteRoot 'server.cjs') + '"') -WorkingDirectory $siteRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $siteRoot 'server.log') -RedirectStandardError (Join-Path $siteRoot 'server-error.log')
    $siteProcess.Id | Set-Content -LiteralPath (Join-Path $siteRoot 'server.pid')
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 200
        try { $siteHealth = Invoke-RestMethod -Uri ($siteAddress + 'health') -TimeoutSec 1; if ($siteHealth.site -eq 'fosu-research-hub') { $healthy = $true; break } } catch {}
    }
}
if (-not $healthy) { throw 'The local site could not start. Check server-error.log or whether port 41847 is occupied.' }
if ($args -notcontains '-NoBrowser') { Start-Process $siteAddress }
Write-Output $siteAddress
