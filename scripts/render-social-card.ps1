param(
  [ValidateSet("en", "ko")]
  [string]$Locale = "en",
  [string]$SvgPath = "site/assets/glyfana-emblem.svg",
  [string]$CopyPath = "scripts/social-card-copy.json",
  [string]$OutputPath = "",
  [int]$Width = 1200,
  [int]$Height = 630
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

function Get-CardCopy($locale, $copyFilePath) {
  $json = Get-Content -Path $copyFilePath -Raw -Encoding UTF8 | ConvertFrom-Json
  $selected = $json.$locale

  if ($null -eq $selected) {
    throw "No copy block was found for locale '$locale'."
  }

  return @{
    Eyebrow = [string]$selected.eyebrow
    Title = [string]$selected.title
    Description = [string]$selected.description
    BadgePrimary = [string]$selected.badgePrimary
    BadgeSecondary = [string]$selected.badgeSecondary
    SourceLabel = [string]$selected.sourceLabel
    SourceValue = [string]$selected.sourceValue
    IncludesLabel = [string]$selected.includesLabel
    IncludesValue = [string]$selected.includesValue
  }
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = "site/assets/og-$Locale.png"
}

$repoRoot = Get-Location
$svgFullPath = Join-Path $repoRoot $SvgPath
$copyFullPath = Join-Path $repoRoot $CopyPath
$outputFullPath = Join-Path $repoRoot $OutputPath
$outputDir = Split-Path -Path $outputFullPath -Parent

if (-not (Test-Path $svgFullPath)) {
  throw "SVG source was not found: $svgFullPath"
}

if (-not (Test-Path $copyFullPath)) {
  throw "Copy source was not found: $copyFullPath"
}

if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$copy = Get-CardCopy $Locale $copyFullPath
$browserPath = Resolve-BrowserPath
$svgMarkup = Get-Content -Path $svgFullPath -Raw
$langAttr = if ($Locale -eq "ko") { "ko" } else { "en" }
$bodyFont = if ($Locale -eq "ko") { '"Malgun Gothic", "Segoe UI", sans-serif' } else { '"Segoe UI", "Arial", sans-serif' }
$displayFont = if ($Locale -eq "ko") { '"Malgun Gothic", "Segoe UI", sans-serif' } else { '"Bahnschrift", "Segoe UI", sans-serif' }

$html = @"
<!doctype html>
<html lang="$langAttr">
  <head>
    <meta charset="utf-8" />
    <style>
      :root {
        --bg-0: #f5efe4;
        --bg-1: #e7efe9;
        --ink: #17242c;
        --muted: #4f5f68;
        --panel: rgba(255, 255, 255, 0.72);
        --line: rgba(15, 39, 47, 0.14);
        --brand: #0b7b75;
        --brand-deep: #0d5550;
        --accent: #ef8354;
      }

      * {
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        width: ${Width}px;
        height: ${Height}px;
        overflow: hidden;
      }

      body {
        position: relative;
        font-family: $bodyFont;
        color: var(--ink);
        background:
          radial-gradient(720px 360px at 12% -10%, rgba(52, 178, 157, 0.30) 0%, transparent 58%),
          radial-gradient(620px 340px at 100% 10%, rgba(255, 189, 116, 0.28) 0%, transparent 52%),
          linear-gradient(135deg, var(--bg-0), var(--bg-1));
      }

      .noise,
      .halo {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .noise {
        opacity: 0.3;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.34)),
          repeating-linear-gradient(
            0deg,
            transparent 0,
            transparent 18px,
            rgba(12, 71, 70, 0.04) 18px,
            rgba(12, 71, 70, 0.04) 19px
          ),
          repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 18px,
            rgba(239, 131, 84, 0.04) 18px,
            rgba(239, 131, 84, 0.04) 19px
          );
      }

      .halo {
        filter: blur(78px);
        opacity: 0.55;
      }

      .halo--left {
        width: 320px;
        height: 320px;
        top: -100px;
        left: -60px;
        background: rgba(34, 186, 154, 0.5);
        border-radius: 999px;
      }

      .halo--right {
        width: 380px;
        height: 380px;
        right: -120px;
        top: 200px;
        background: rgba(255, 174, 94, 0.46);
        border-radius: 999px;
      }

      .frame {
        position: relative;
        z-index: 1;
        width: calc(100% - 72px);
        height: calc(100% - 72px);
        margin: 36px;
        padding: 34px;
        border-radius: 34px;
        border: 1px solid var(--line);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.74), rgba(248, 251, 249, 0.62)),
          linear-gradient(135deg, rgba(11, 123, 117, 0.09), rgba(239, 131, 84, 0.07));
        box-shadow: 0 26px 80px rgba(16, 32, 39, 0.16);
      }

      .topline {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 18px;
      }

      .mark {
        width: 72px;
        height: 72px;
        flex: none;
        filter: drop-shadow(0 18px 24px rgba(11, 123, 117, 0.14));
      }

      .brand-name {
        font-family: $displayFont;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .eyebrow {
        margin: 0;
        color: var(--brand-deep);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .badge-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
        max-width: 320px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        min-height: 38px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid rgba(13, 73, 73, 0.12);
        background: rgba(255, 255, 255, 0.72);
        color: var(--brand-deep);
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
      }

      .badge--accent {
        background: linear-gradient(135deg, rgba(11, 123, 117, 0.18), rgba(239, 131, 84, 0.18));
        color: var(--ink);
      }

      .content {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 280px;
        gap: 32px;
        margin-top: 44px;
        align-items: end;
      }

      h1 {
        margin: 0;
        max-width: 720px;
        font-family: $displayFont;
        font-size: 62px;
        font-weight: 700;
        line-height: 0.98;
        letter-spacing: -0.03em;
      }

      p {
        margin: 18px 0 0;
        max-width: 700px;
        color: var(--muted);
        font-size: 25px;
        line-height: 1.42;
      }

      .side {
        display: grid;
        gap: 14px;
      }

      .panel {
        padding: 18px 20px;
        border: 1px solid rgba(13, 73, 73, 0.12);
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.72);
      }

      .panel-label {
        display: block;
        margin-bottom: 8px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .panel-value {
        display: block;
        font-family: $displayFont;
        font-size: 27px;
        font-weight: 700;
        line-height: 1.08;
      }
    </style>
  </head>
  <body>
    <div class="noise"></div>
    <div class="halo halo--left"></div>
    <div class="halo halo--right"></div>
    <div class="frame">
      <div class="topline">
        <div class="brand">
          <div class="mark">$svgMarkup</div>
          <div>
            <p class="eyebrow">$($copy.Eyebrow)</p>
            <div class="brand-name">Glyfana</div>
          </div>
        </div>
        <div class="badge-row">
          <div class="badge badge--accent">$($copy.BadgePrimary)</div>
          <div class="badge">$($copy.BadgeSecondary)</div>
        </div>
      </div>
      <div class="content">
        <div>
          <h1>$($copy.Title)</h1>
          <p>$($copy.Description)</p>
        </div>
        <div class="side">
          <div class="panel">
            <span class="panel-label">$($copy.SourceLabel)</span>
            <span class="panel-value">$($copy.SourceValue)</span>
          </div>
          <div class="panel">
            <span class="panel-label">$($copy.IncludesLabel)</span>
            <span class="panel-value">$($copy.IncludesValue)</span>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
"@

$pageUrl = "data:text/html;charset=utf-8," + [System.Uri]::EscapeDataString($html)

& $browserPath `
  --headless=new `
  --disable-gpu `
  --hide-scrollbars `
  --default-background-color=ffffffff `
  --run-all-compositor-stages-before-draw `
  --window-size=$Width,$Height `
  --screenshot="$outputFullPath" `
  "$pageUrl"

if (-not (Test-Path $outputFullPath)) {
  throw "Social card render did not produce an output file."
}

Write-Host "Wrote $outputFullPath"
$global:LASTEXITCODE = 0
