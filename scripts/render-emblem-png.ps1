param(
  [string]$OutputPath = "site/assets/glyfana-emblem.png",
  [int]$Size = 512
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
  param(
    [double]$X,
    [double]$Y,
    [double]$Width,
    [double]$Height,
    [double]$Radius
  )

  $diameter = [Math]::Max(1.0, $Radius * 2)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-ArgbBrush {
  param(
    [int]$A,
    [int]$R,
    [int]$G,
    [int]$B
  )

  return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($A, $R, $G, $B))
}

$outputFullPath = Join-Path (Get-Location) $OutputPath
$outputDir = Split-Path -Path $outputFullPath -Parent
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.Clear([System.Drawing.Color]::Transparent)

$scale = $Size / 256.0
$center = $Size / 2.0

$tilePath = New-RoundedRectPath -X (58 * $scale) -Y (58 * $scale) -Width (140 * $scale) -Height (140 * $scale) -Radius (38 * $scale)
$matrix = [System.Drawing.Drawing2D.Matrix]::new()
$matrix.RotateAt(45.0, [System.Drawing.PointF]::new([float]$center, [float]$center))
$tilePath.Transform($matrix)

$shadowPath = $tilePath.Clone()
$shadowMatrix = [System.Drawing.Drawing2D.Matrix]::new()
$shadowMatrix.Translate(0.0, [float](10 * $scale))
$shadowPath.Transform($shadowMatrix)
$shadowBrush = New-ArgbBrush -A 26 -R 16 -G 32 -B 39
$graphics.FillPath($shadowBrush, $shadowPath)

$tileBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.PointF]::new([float](64 * $scale), [float](54 * $scale)),
  [System.Drawing.PointF]::new([float](194 * $scale), [float](202 * $scale)),
  [System.Drawing.Color]::FromArgb(255, 252, 248, 241),
  [System.Drawing.Color]::FromArgb(255, 228, 239, 232)
)
$graphics.FillPath($tileBrush, $tilePath)

$strokeBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.PointF]::new([float](58 * $scale), [float](62 * $scale)),
  [System.Drawing.PointF]::new([float](204 * $scale), [float](198 * $scale)),
  [System.Drawing.Color]::FromArgb(255, 11, 123, 117),
  [System.Drawing.Color]::FromArgb(255, 239, 131, 84)
)
$strokePen = [System.Drawing.Pen]::new($strokeBrush, [float](6 * $scale))
$graphics.DrawPath($strokePen, $tilePath)

$glyphBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.PointF]::new([float](88 * $scale), [float](88 * $scale)),
  [System.Drawing.PointF]::new([float](172 * $scale), [float](170 * $scale)),
  [System.Drawing.Color]::FromArgb(255, 13, 85, 80),
  [System.Drawing.Color]::FromArgb(255, 11, 123, 117)
)
$glyphPen = [System.Drawing.Pen]::new($glyphBrush, [float](16 * $scale))
$glyphPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$glyphPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$glyphPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawArc(
  $glyphPen,
  [float](80 * $scale),
  [float](82 * $scale),
  [float](92 * $scale),
  [float](92 * $scale),
  -42,
  302
)
$graphics.DrawLine(
  $glyphPen,
  [float](125 * $scale),
  [float](128 * $scale),
  [float](163 * $scale),
  [float](128 * $scale)
)

$accentPath = New-RoundedRectPath -X (162 * $scale) -Y (86 * $scale) -Width (24 * $scale) -Height (24 * $scale) -Radius (10 * $scale)
$accentBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.PointF]::new([float](154 * $scale), [float](84 * $scale)),
  [System.Drawing.PointF]::new([float](186 * $scale), [float](116 * $scale)),
  [System.Drawing.Color]::FromArgb(255, 239, 131, 84),
  [System.Drawing.Color]::FromArgb(255, 243, 177, 104)
)
$graphics.FillPath($accentBrush, $accentPath)

$bitmap.Save($outputFullPath, [System.Drawing.Imaging.ImageFormat]::Png)

$accentBrush.Dispose()
$accentPath.Dispose()
$glyphPen.Dispose()
$glyphBrush.Dispose()
$strokePen.Dispose()
$strokeBrush.Dispose()
$tileBrush.Dispose()
$shadowBrush.Dispose()
$shadowPath.Dispose()
$shadowMatrix.Dispose()
$tilePath.Dispose()
$matrix.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Wrote $outputFullPath"
