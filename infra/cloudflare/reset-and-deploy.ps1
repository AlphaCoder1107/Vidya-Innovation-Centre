param(
  [Parameter(Mandatory = $true)]
  [string]$CloudflareApiToken,

  [Parameter(Mandatory = $false)]
  [string]$AccountId = '4582f7abee1bcd3a921af5fcc0da5fa6',

  [Parameter(Mandatory = $false)]
  [string]$ZoneName = 'vic.college',

  [Parameter(Mandatory = $true)]
  [string]$HiEventsOrigin,

  [Parameter(Mandatory = $true)]
  [string]$LandingOrigin
)

$ErrorActionPreference = 'Stop'

$headers = @{ Authorization = "Bearer $CloudflareApiToken" }

Write-Host '[1/6] Resolving zone id...'
$zoneResp = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones?name=$ZoneName" -Headers $headers
if (-not $zoneResp.success -or $zoneResp.result.Count -eq 0) {
  throw "Failed to resolve zone id for $ZoneName"
}
$zoneId = $zoneResp.result[0].id
Write-Host "Zone ID: $zoneId"

Write-Host '[2/6] Deleting existing worker routes...'
$routeResp = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/workers/routes" -Headers $headers
if ($routeResp.result.Count -gt 0) {
  foreach ($route in $routeResp.result) {
    Write-Host "Deleting route $($route.pattern) ($($route.id))"
    Invoke-RestMethod -Method Delete -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/workers/routes/$($route.id)" -Headers $headers | Out-Null
  }
}

Write-Host '[3/6] Deleting known old scripts (best effort)...'
$oldScripts = @('vsie-router', 'codepod-vic', 'vic-events-router')
foreach ($script in $oldScripts) {
  try {
    Invoke-RestMethod -Method Delete -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/workers/scripts/$script" -Headers $headers | Out-Null
    Write-Host "Deleted script: $script"
  } catch {
    Write-Host "Skipped script delete (scope or not found): $script"
  }
}

Write-Host '[4/6] Setting env for wrangler deploy...'
$env:CLOUDFLARE_API_TOKEN = $CloudflareApiToken
$env:CLOUDFLARE_ACCOUNT_ID = $AccountId

Write-Host '[5/6] Deploying worker...'
$wranglerCmd = Get-Command wrangler.cmd -ErrorAction SilentlyContinue
if (-not $wranglerCmd) {
  throw 'wrangler.cmd not found. Install with npm.cmd install -g wrangler'
}

& wrangler.cmd deploy --name vic-events-router --var "HIEVENTS_ORIGIN:$HiEventsOrigin" --var "LANDING_ORIGIN:$LandingOrigin"

Write-Host '[6/6] Binding routes...'
Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/workers/routes" -Headers $headers -ContentType 'application/json' -Body (@{ pattern = "$ZoneName/*"; script = 'vic-events-router' } | ConvertTo-Json)
Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/workers/routes" -Headers $headers -ContentType 'application/json' -Body (@{ pattern = "www.$ZoneName/*"; script = 'vic-events-router' } | ConvertTo-Json)

Write-Host 'Done: Fresh Cloudflare worker deployment complete.'
