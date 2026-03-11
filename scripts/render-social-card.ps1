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
Add-Type -AssemblyName System.Drawing

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

function Encode-Html([string]$Value) {
  return [System.Net.WebUtility]::HtmlEncode([string]$Value)
}

function Get-StringArray($Value) {
  return @($Value | ForEach-Object { [string]$_ })
}

function Get-CardCopy($LocaleName, $CopyFilePath) {
  $json = Get-Content -Path $CopyFilePath -Raw -Encoding UTF8 | ConvertFrom-Json
  $selected = $json.$LocaleName

  if ($null -eq $selected) {
    throw "No copy block was found for locale '$LocaleName'."
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
    WindowLabel = [string]$selected.windowLabel
    SidebarLabel = [string]$selected.sidebarLabel
    NoteItems = Get-StringArray $selected.noteItems
    EditorLabel = [string]$selected.editorLabel
    PreviewLabel = [string]$selected.previewLabel
    EditorLines = Get-StringArray $selected.editorLines
    PreviewTitle = [string]$selected.previewTitle
    PreviewLines = Get-StringArray $selected.previewLines
    StatusPrimary = [string]$selected.statusPrimary
    StatusSecondary = [string]$selected.statusSecondary
  }
}

function New-NoteMarkup([string[]]$Items) {
  $markup = @()

  for ($index = 0; $index -lt $Items.Count; $index++) {
    $stateClass = if ($index -eq 0) { "note is-active" } else { "note" }
    $encoded = Encode-Html $Items[$index]
    $markup += "<div class=`"$stateClass`"><span class=`"note__dot`"></span><span>$encoded</span></div>"
  }

  return $markup -join "`n"
}

function New-EditorLineMarkup([string[]]$Items) {
  $markup = @()

  for ($index = 0; $index -lt $Items.Count; $index++) {
    $line = [string]$Items[$index]

    if ([string]::IsNullOrWhiteSpace($line)) {
      $markup += '<div class="doc-line doc-line--spacer"></div>'
      continue
    }

    $lineClass = if ($index -eq 0) { "doc-line doc-line--heading" } else { "doc-line" }
    $markup += "<div class=`"$lineClass`">$(Encode-Html $line)</div>"
  }

  return $markup -join "`n"
}

function New-PreviewLineMarkup([string[]]$Items) {
  $markup = @()

  foreach ($item in $Items) {
    $encoded = Encode-Html $item
    $markup += "<div class=`"preview-item`"><span class=`"preview-dot`"></span><span>$encoded</span></div>"
  }

  return $markup -join "`n"
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
$titleSize = if ($Locale -eq "ko") { 58 } else { 62 }
$descriptionSize = if ($Locale -eq "ko") { 22 } else { 24 }
$noteMarkup = New-NoteMarkup $copy.NoteItems
$editorLineMarkup = New-EditorLineMarkup $copy.EditorLines
$previewLineMarkup = New-PreviewLineMarkup $copy.PreviewLines

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
        --panel: rgba(255, 255, 255, 0.78);
        --line: rgba(15, 39, 47, 0.14);
        --brand: #0b7b75;
        --brand-deep: #0d5550;
        --accent: #ef8354;
        --workspace: #f7fbf8;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background:
          radial-gradient(720px 360px at 12% -10%, rgba(52, 178, 157, 0.30) 0%, transparent 58%),
          radial-gradient(620px 340px at 100% 10%, rgba(255, 189, 116, 0.28) 0%, transparent 52%),
          linear-gradient(135deg, var(--bg-0), var(--bg-1));
      }

      body {
        position: relative;
        font-family: $bodyFont;
        color: var(--ink);
      }

      .noise,
      .backdrop,
      .halo {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .backdrop {
        position: fixed;
        background:
          radial-gradient(720px 360px at 12% -10%, rgba(52, 178, 157, 0.30) 0%, transparent 58%),
          radial-gradient(620px 340px at 100% 10%, rgba(255, 189, 116, 0.28) 0%, transparent 52%),
          linear-gradient(135deg, var(--bg-0), var(--bg-1));
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
        padding: 32px 34px 34px;
        border-radius: 34px;
        border: 1px solid var(--line);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.76), rgba(248, 251, 249, 0.66)),
          linear-gradient(135deg, rgba(11, 123, 117, 0.09), rgba(239, 131, 84, 0.07));
        box-shadow: 0 26px 80px rgba(16, 32, 39, 0.16);
      }

      .topline {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
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
        font-size: 35px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .eyebrow {
        margin: 0 0 6px;
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
        max-width: 360px;
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

      .main {
        display: grid;
        grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
        gap: 28px;
        margin-top: 28px;
        align-items: end;
      }

      h1 {
        margin: 0;
        max-width: 470px;
        font-family: $displayFont;
        font-size: ${titleSize}px;
        font-weight: 700;
        line-height: 0.98;
        letter-spacing: -0.035em;
      }

      .desc {
        margin: 18px 0 0;
        max-width: 480px;
        color: var(--muted);
        font-size: ${descriptionSize}px;
        line-height: 1.44;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        max-width: 500px;
        margin-top: 26px;
      }

      .stat-card {
        min-height: 104px;
        padding: 16px 18px;
        border: 1px solid rgba(13, 73, 73, 0.12);
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.72);
      }

      .stat-label {
        display: block;
        margin-bottom: 8px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .stat-value {
        display: block;
        font-family: $displayFont;
        font-size: 25px;
        font-weight: 700;
        line-height: 1.12;
      }

      .shell-wrap {
        position: relative;
        padding: 18px;
        border-radius: 32px;
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.60), rgba(255, 255, 255, 0.24)),
          linear-gradient(135deg, rgba(11, 123, 117, 0.18), rgba(239, 131, 84, 0.14));
        box-shadow: 0 22px 56px rgba(9, 30, 32, 0.16);
      }

      .shell-wrap::before {
        content: "";
        position: absolute;
        inset: 18px auto auto 22px;
        width: 180px;
        height: 180px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(11, 123, 117, 0.16), transparent 70%);
        pointer-events: none;
      }

      .window {
        position: relative;
        z-index: 1;
        overflow: hidden;
        border-radius: 24px;
        border: 1px solid rgba(11, 76, 74, 0.14);
        background: rgba(247, 251, 248, 0.94);
      }

      .window-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 18px;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(11, 76, 74, 0.10);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(239, 245, 241, 0.94));
      }

      .window-meta {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .window-dots {
        display: inline-flex;
        gap: 6px;
      }

      .window-dots span {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(11, 76, 74, 0.18);
      }

      .window-dots span:last-child {
        background: rgba(239, 131, 84, 0.46);
      }

      .window-label {
        color: var(--muted);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .workspace {
        display: grid;
        grid-template-columns: 152px minmax(0, 1fr);
        min-height: 364px;
      }

      .sidebar {
        padding: 18px 14px;
        border-right: 1px solid rgba(11, 76, 74, 0.10);
        background: linear-gradient(180deg, rgba(11, 123, 117, 0.08), rgba(11, 123, 117, 0.03));
      }

      .sidebar-label {
        display: block;
        margin-bottom: 12px;
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .note {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 42px;
        padding: 0 12px;
        border-radius: 16px;
        color: var(--muted);
        font-size: 14px;
        font-weight: 600;
      }

      .note + .note {
        margin-top: 8px;
      }

      .note__dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(11, 76, 74, 0.20);
        flex: none;
      }

      .note.is-active {
        background: rgba(255, 255, 255, 0.82);
        color: var(--ink);
        box-shadow: 0 12px 24px rgba(12, 34, 38, 0.08);
      }

      .note.is-active .note__dot {
        background: linear-gradient(135deg, var(--brand), var(--accent));
      }

      .editor {
        padding: 16px;
      }

      .editor-head {
        display: inline-flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .panel-tab {
        display: inline-flex;
        align-items: center;
        min-height: 32px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid rgba(11, 76, 74, 0.10);
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .panel-tab.is-active {
        background: rgba(11, 123, 117, 0.12);
        color: var(--brand-deep);
      }

      .canvas {
        display: grid;
        grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
        gap: 14px;
      }

      .doc,
      .preview {
        min-height: 236px;
        padding: 16px;
        border: 1px solid rgba(11, 76, 74, 0.10);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.84);
      }

      .doc {
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 250, 248, 0.92));
      }

      .doc-line {
        font-family: "Consolas", "Courier New", monospace;
        color: #27505e;
        font-size: 14px;
        line-height: 1.56;
      }

      .doc-line + .doc-line {
        margin-top: 7px;
      }

      .doc-line--heading {
        color: var(--brand-deep);
        font-size: 16px;
        font-weight: 700;
      }

      .doc-line--spacer {
        height: 10px;
      }

      .preview-label {
        display: block;
        margin-bottom: 10px;
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .preview h3 {
        margin: 0 0 14px;
        font-family: $displayFont;
        font-size: 22px;
        line-height: 1.12;
      }

      .preview-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        color: var(--muted);
        font-size: 15px;
        font-weight: 600;
        line-height: 1.35;
      }

      .preview-item + .preview-item {
        margin-top: 10px;
      }

      .preview-dot {
        width: 9px;
        height: 9px;
        margin-top: 6px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--brand), var(--accent));
        flex: none;
      }

      .status-row {
        display: flex;
        gap: 10px;
        margin-top: 14px;
        flex-wrap: wrap;
      }

      .status-chip {
        display: inline-flex;
        align-items: center;
        min-height: 34px;
        padding: 0 12px;
        border-radius: 999px;
        background: rgba(11, 123, 117, 0.10);
        color: var(--brand-deep);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }
    </style>
  </head>
  <body>
    <div class="backdrop"></div>
    <div class="noise"></div>
    <div class="halo halo--left"></div>
    <div class="halo halo--right"></div>
    <div class="frame">
      <div class="topline">
        <div class="brand">
          <div class="mark">$svgMarkup</div>
          <div>
            <p class="eyebrow">$(Encode-Html $copy.Eyebrow)</p>
            <div class="brand-name">Glyfana</div>
          </div>
        </div>
        <div class="badge-row">
          <div class="badge badge--accent">$(Encode-Html $copy.BadgePrimary)</div>
          <div class="badge">$(Encode-Html $copy.BadgeSecondary)</div>
        </div>
      </div>
      <div class="main">
        <div class="copy">
          <h1>$(Encode-Html $copy.Title)</h1>
          <p class="desc">$(Encode-Html $copy.Description)</p>
          <div class="stats">
            <div class="stat-card">
              <span class="stat-label">$(Encode-Html $copy.SourceLabel)</span>
              <span class="stat-value">$(Encode-Html $copy.SourceValue)</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">$(Encode-Html $copy.IncludesLabel)</span>
              <span class="stat-value">$(Encode-Html $copy.IncludesValue)</span>
            </div>
          </div>
        </div>
        <div class="shell-wrap">
          <div class="window">
            <div class="window-bar">
              <div class="window-meta">
                <div class="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="window-label">$(Encode-Html $copy.WindowLabel)</span>
              </div>
              <div class="panel-tab is-active">$(Encode-Html $copy.BadgePrimary)</div>
            </div>
            <div class="workspace">
              <aside class="sidebar">
                <span class="sidebar-label">$(Encode-Html $copy.SidebarLabel)</span>
                $noteMarkup
              </aside>
              <section class="editor">
                <div class="editor-head">
                  <span class="panel-tab is-active">$(Encode-Html $copy.EditorLabel)</span>
                  <span class="panel-tab">$(Encode-Html $copy.PreviewLabel)</span>
                </div>
                <div class="canvas">
                  <div class="doc">
                    $editorLineMarkup
                  </div>
                  <div class="preview">
                    <span class="preview-label">$(Encode-Html $copy.PreviewLabel)</span>
                    <h3>$(Encode-Html $copy.PreviewTitle)</h3>
                    $previewLineMarkup
                  </div>
                </div>
                <div class="status-row">
                  <div class="status-chip">$(Encode-Html $copy.StatusPrimary)</div>
                  <div class="status-chip">$(Encode-Html $copy.StatusSecondary)</div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
"@

$htmlBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($html))
$pageUrl = "data:text/html;base64,$htmlBase64"
$captureHeight = $Height + 128
$rawOutputPath = Join-Path $outputDir "og-raw-$Locale.png"

& $browserPath `
  --headless=new `
  --disable-gpu `
  --hide-scrollbars `
  --force-device-scale-factor=1 `
  --default-background-color=ffffffff `
  --run-all-compositor-stages-before-draw `
  --window-size=$Width,$captureHeight `
  --screenshot="$rawOutputPath" `
  "$pageUrl"

for ($attempt = 0; $attempt -lt 20 -and -not (Test-Path $rawOutputPath); $attempt++) {
  Start-Sleep -Milliseconds 250
}

if (-not (Test-Path $rawOutputPath)) {
  throw "Social card render did not produce an output file."
}

$rawBitmap = [System.Drawing.Bitmap]::new($rawOutputPath)
$finalBitmap = [System.Drawing.Bitmap]::new($Width, $Height)
$graphics = [System.Drawing.Graphics]::FromImage($finalBitmap)

try {
  $graphics.Clear([System.Drawing.Color]::White)
  $sourceRect = [System.Drawing.Rectangle]::new(0, 0, [Math]::Min($Width, $rawBitmap.Width), [Math]::Min($Height, $rawBitmap.Height))
  $destRect = [System.Drawing.Rectangle]::new(0, 0, $Width, $Height)
  $graphics.DrawImage($rawBitmap, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
  $finalBitmap.Save($outputFullPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $graphics.Dispose()
  $finalBitmap.Dispose()
  $rawBitmap.Dispose()

  if (Test-Path $rawOutputPath) {
    Remove-Item $rawOutputPath -Force
  }
}

Write-Host "Wrote $outputFullPath"
$global:LASTEXITCODE = 0
