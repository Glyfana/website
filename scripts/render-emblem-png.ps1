param(
  [string]$SvgPath = "site/assets/glyfana-emblem.svg",
  [string]$OutputPath = "site/assets/glyfana-emblem.png",
  [int]$Size = 512
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-BrowserPath {
  $candidates = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  throw "No supported browser executable was found. Install Microsoft Edge or Google Chrome."
}

$repoRoot = Get-Location
$svgFullPath = Join-Path $repoRoot $SvgPath
$outputFullPath = Join-Path $repoRoot $OutputPath
$outputDir = Split-Path -Path $outputFullPath -Parent

if (-not (Test-Path $svgFullPath)) {
  throw "SVG source was not found: $svgFullPath"
}

if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$browserPath = Resolve-BrowserPath
$svgMarkup = Get-Content -Path $svgFullPath -Raw

$html = @"
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        overflow: hidden;
      }
      body {
        display: grid;
        place-items: center;
      }
      svg {
        width: ${Size}px;
        height: ${Size}px;
        display: block;
      }
    </style>
  </head>
  <body>
    $svgMarkup
  </body>
</html>
"@

$pageUrl = "data:text/html;charset=utf-8," + [System.Uri]::EscapeDataString($html)

& $browserPath `
  --headless=new `
  --disable-gpu `
  --hide-scrollbars `
  --default-background-color=00000000 `
  --run-all-compositor-stages-before-draw `
  --window-size=$Size,$Size `
  --screenshot="$outputFullPath" `
  "$pageUrl"

if (-not (Test-Path $outputFullPath)) {
  throw "PNG render did not produce an output file."
}

Write-Host "Wrote $outputFullPath"
