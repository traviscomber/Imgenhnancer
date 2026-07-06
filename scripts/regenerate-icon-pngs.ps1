$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$base = Join-Path $repoRoot "public\images\landing"
$out = Join-Path $base "icons"
$square = Join-Path $base "icons-grid-square.jpg"
$wide = Join-Path $base "icons-grid-wide.jpg"

New-Item -ItemType Directory -Force -Path $out | Out-Null

function Export-IconGlyph {
  param(
    [string] $Source,
    [string] $Name,
    [int] $X,
    [int] $Y,
    [int] $W,
    [int] $H,
    [int] $CanvasW = 174,
    [int] $CanvasH = 174
  )

  $img = [System.Drawing.Image]::FromFile($Source)
  try {
    $bmp = New-Object System.Drawing.Bitmap($CanvasW, $CanvasH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.Clear([System.Drawing.Color]::Black)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      $scale = [Math]::Min($CanvasW / $W, $CanvasH / $H)
      $drawW = [int][Math]::Round($W * $scale)
      $drawH = [int][Math]::Round($H * $scale)
      $dx = [int][Math]::Floor(($CanvasW - $drawW) / 2)
      $dy = [int][Math]::Floor(($CanvasH - $drawH) / 2)

      $dest = New-Object System.Drawing.Rectangle($dx, $dy, $drawW, $drawH)
      $src = New-Object System.Drawing.Rectangle($X, $Y, $W, $H)
      $g.DrawImage($img, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
      $bmp.Save((Join-Path $out "$Name.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $g.Dispose()
      $bmp.Dispose()
    }
  } finally {
    $img.Dispose()
  }
}

# Inner glyph crops, excluding the original sheet frames. The UI draws the visible frames.
Export-IconGlyph $square "archive-scan" 84 106 174 174
Export-IconGlyph $square "face-profile" 307 106 174 174
Export-IconGlyph $square "high-resolution" 530 106 174 174
Export-IconGlyph $square "digital-upscale" 976 106 174 174
Export-IconGlyph $square "upload-cloud" 84 329 174 174
Export-IconGlyph $square "preset-sliders" 307 329 174 174
Export-IconGlyph $square "download-tray" 530 329 174 174
Export-IconGlyph $square "face-preserve" 753 329 174 174
Export-IconGlyph $square "natural-tones" 976 329 174 174
Export-IconGlyph $square "real-detail" 1200 329 174 174
Export-IconGlyph $square "cultural-respect" 84 553 174 174
Export-IconGlyph $square "balanced-results" 307 553 174 174
Export-IconGlyph $square "heritage-restore" 976 553 174 174
Export-IconGlyph $square "cultural-archives" 80 785 130 164
Export-IconGlyph $square "photo-restoration" 252 782 136 168
Export-IconGlyph $square "creators-digital-artists" 431 785 135 162
Export-IconGlyph $wide "museum-projects" 433 729 252 126
Export-IconGlyph $wide "print-shops" 779 724 286 136
Export-IconGlyph $wide "brands-businesses" 1168 727 225 132

Write-Host "Regenerated landing icon PNG glyph sources in $out"
exit 0
