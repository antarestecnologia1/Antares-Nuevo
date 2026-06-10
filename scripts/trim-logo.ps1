Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot '..\imagenes empresa\Logo.png'
$dst = Join-Path $PSScriptRoot '..\imagenes empresa\logo-recortado.png'

$bmp = New-Object System.Drawing.Bitmap($src)
$w = $bmp.Width
$h = $bmp.Height

$minX = $w; $minY = $h; $maxX = 0; $maxY = 0
$step = 3
for ($y = 0; $y -lt $h; $y += $step) {
  for ($x = 0; $x -lt $w; $x += $step) {
    $p = $bmp.GetPixel($x, $y)
    # contenido = pixel visible que no sea blanco
    if ($p.A -gt 16 -and (($p.R -lt 240) -or ($p.G -lt 240) -or ($p.B -lt 240))) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

$corner = $bmp.GetPixel(2, 2)
Write-Output ("corner A={0} R={1} G={2} B={3}" -f $corner.A, $corner.R, $corner.G, $corner.B)
Write-Output ("bbox {0},{1} -> {2},{3} (canvas {4}x{5})" -f $minX, $minY, $maxX, $maxY, $w, $h)

# margen de respiro proporcional
$pad = [int]([Math]::Round(($maxY - $minY) * 0.06))
$cx = [Math]::Max(0, $minX - $pad)
$cy = [Math]::Max(0, $minY - $pad)
$cw = [Math]::Min($w - $cx, ($maxX - $minX) + 2 * $pad)
$ch = [Math]::Min($h - $cy, ($maxY - $minY) + 2 * $pad)

$rect = New-Object System.Drawing.Rectangle($cx, $cy, $cw, $ch)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)

# reescalar a 800px de ancho para web
$targetW = 800
$targetH = [int]([Math]::Round($ch * ($targetW / $cw)))
$final = New-Object System.Drawing.Bitmap($targetW, $targetH)
$g = [System.Drawing.Graphics]::FromImage($final)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($cropped, 0, 0, $targetW, $targetH)
$g.Dispose()

$final.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output ("saved {0} ({1}x{2})" -f $dst, $targetW, $targetH)

$cropped.Dispose()
$final.Dispose()
$bmp.Dispose()
