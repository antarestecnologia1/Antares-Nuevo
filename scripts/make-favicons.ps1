Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot '..\imagenes empresa\logo-recortado.png'
$outDir = Join-Path $PSScriptRoot '..\imagenes empresa'

$bmp = New-Object System.Drawing.Bitmap($src)

# El isotipo (olas) ocupa aprox x 0..290 del logo recortado de 800px
$mark = $bmp.Clone((New-Object System.Drawing.Rectangle(0, 0, 290, $bmp.Height)), $bmp.PixelFormat)

function Save-SquareIcon([System.Drawing.Image]$img, [int]$size, [string]$path, [System.Drawing.Color]$bg) {
  $canvas = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  if ($bg -ne [System.Drawing.Color]::Transparent) { $g.Clear($bg) }
  # margen 8%
  $inner = [int]($size * 0.84)
  $scale = [Math]::Min($inner / $img.Width, $inner / $img.Height)
  $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
  $g.DrawImage($img, [int](($size - $w) / 2), [int](($size - $h) / 2), $w, $h)
  $g.Dispose()
  $canvas.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
  Write-Output ("saved {0}" -f $path)
}

Save-SquareIcon $mark 64 (Join-Path $outDir 'favicon-64.png') ([System.Drawing.Color]::Transparent)
Save-SquareIcon $mark 180 (Join-Path $outDir 'apple-touch-icon-180.png') ([System.Drawing.Color]::White)

$mark.Dispose()
$bmp.Dispose()
