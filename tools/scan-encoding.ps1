<#
  Auditoria de codificacion: detecta archivos con problemas de tildes.
    notUtf8  : bytes que no forman UTF-8 valido (archivo guardado en cp1252/latin-1).
    mojibake : UTF-8 leido como latin-1/cp1252 (aparecen U+00C3 / U+00C2 / "a-euro").
    replChar : U+FFFD, tilde ya perdida de forma irreversible.
    bom      : BOM UTF-8 al inicio del archivo.
  Script deliberadamente ASCII-only para ser seguro en Windows PowerShell 5.1.
#>
param(
  [string]$Root = ".",
  [switch]$Json
)

$ErrorActionPreference = "SilentlyContinue"
$Root = (Resolve-Path -LiteralPath $Root).Path

$skipDirs = @(
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out',
  'test-results', 'tmp-docx', '_tmp_docx_inspect', '_tmp_docx2_inspect',
  'playwright-report', '.turbo', '.cache'
)
$exts = @(
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.html', '.htm',
  '.css', '.scss', '.sql', '.md', '.txt', '.yml', '.yaml', '.svg'
)

$strictUtf8 = New-Object System.Text.UTF8Encoding($false, $true)
$looseUtf8 = New-Object System.Text.UTF8Encoding($false, $false)

# U+00C3 / U+00C2 / "a-euro" (U+00E2 U+20AC) casi nunca aparecen en espanol legitimo.
$mojiRe = [regex]"[\u00C3\u00C2]|\u00E2\u20AC"
$replRe = [regex]"\uFFFD"

$files = Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
  $rel = $_.FullName.Substring($Root.Length).TrimStart('\', '/')
  $parts = $rel -split '[\\/]'
  $skipped = $false
  foreach ($p in $parts[0..([Math]::Max(0, $parts.Length - 2))]) {
    if ($skipDirs -contains $p) { $skipped = $true; break }
  }
  (-not $skipped) -and ($exts -contains $_.Extension.ToLower()) -and ($_.Length -lt 8MB)
}

$report = New-Object System.Collections.ArrayList

foreach ($f in $files) {
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  if ($bytes.Length -eq 0) { continue }

  $issues = New-Object System.Collections.ArrayList

  $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  if ($hasBom) { [void]$issues.Add([pscustomobject]@{ kind = 'bom'; count = 1; samples = @() }) }

  $validUtf8 = $true
  try { [void]$strictUtf8.GetString($bytes) } catch { $validUtf8 = $false }

  $text = $looseUtf8.GetString($bytes)

  # Indice de inicio de cada linea, para traducir offset -> numero de linea.
  $lineStarts = New-Object System.Collections.ArrayList
  [void]$lineStarts.Add(0)
  for ($i = 0; $i -lt $text.Length; $i++) {
    if ($text[$i] -eq "`n") { [void]$lineStarts.Add($i + 1) }
  }
  function Get-LineNo([int]$idx) {
    $lo = 0; $hi = $lineStarts.Count - 1
    while ($lo -lt $hi) {
      $mid = [int](($lo + $hi + 1) / 2)
      if ($lineStarts[$mid] -le $idx) { $lo = $mid } else { $hi = $mid - 1 }
    }
    return $lo + 1
  }
  function Get-Snippet([int]$idx) {
    $s = [Math]::Max(0, $idx - 40)
    $len = [Math]::Min(90, $text.Length - $s)
    return ($text.Substring($s, $len) -replace '\s+', ' ')
  }

  if (-not $validUtf8) {
    # Reinterpretar como cp1252 para mostrar el texto real que se pretendia.
    $cp1252 = [System.Text.Encoding]::GetEncoding(1252)
    $asAnsi = $cp1252.GetString($bytes)
    $bad = [regex]::Match($asAnsi, "[\u00A0-\u00FF]")
    $samples = @()
    if ($bad.Success) {
      $s = [Math]::Max(0, $bad.Index - 40)
      $len = [Math]::Min(90, $asAnsi.Length - $s)
      $samples = @([pscustomobject]@{
          line    = (($asAnsi.Substring(0, $bad.Index) -split "`n").Count)
          snippet = ($asAnsi.Substring($s, $len) -replace '\s+', ' ')
        })
    }
    [void]$issues.Add([pscustomobject]@{ kind = 'notUtf8'; count = 1; samples = $samples })
  }

  $mojiMatches = $mojiRe.Matches($text)
  if ($mojiMatches.Count -gt 0) {
    $samples = @()
    foreach ($m in ($mojiMatches | Select-Object -First 3)) {
      $samples += [pscustomobject]@{ line = (Get-LineNo $m.Index); snippet = (Get-Snippet $m.Index) }
    }
    [void]$issues.Add([pscustomobject]@{ kind = 'mojibake'; count = $mojiMatches.Count; samples = $samples })
  }

  $replMatches = $replRe.Matches($text)
  if ($replMatches.Count -gt 0) {
    $samples = @()
    foreach ($m in ($replMatches | Select-Object -First 3)) {
      $samples += [pscustomobject]@{ line = (Get-LineNo $m.Index); snippet = (Get-Snippet $m.Index) }
    }
    [void]$issues.Add([pscustomobject]@{ kind = 'replChar'; count = $replMatches.Count; samples = $samples })
  }

  if ($issues.Count -gt 0) {
    [void]$report.Add([pscustomobject]@{
        file   = $f.FullName.Substring($Root.Length).TrimStart('\', '/').Replace('\', '/')
        issues = $issues
      })
  }
}

if ($Json) {
  $report | ConvertTo-Json -Depth 8
  return
}

$out = New-Object System.Collections.ArrayList
[void]$out.Add("Archivos de texto analizados: $($files.Count)")
[void]$out.Add("Archivos con hallazgos: $($report.Count)")
[void]$out.Add("")

foreach ($kind in @('notUtf8', 'mojibake', 'replChar', 'bom')) {
  $list = $report | Where-Object { $_.issues.kind -contains $kind }
  [void]$out.Add("== $kind : $(@($list).Count) archivo(s) ==")
  foreach ($r in $list) {
    $iss = $r.issues | Where-Object { $_.kind -eq $kind }
    [void]$out.Add(("  {0} ({1})" -f $r.file, $iss.count))
    foreach ($s in $iss.samples) { [void]$out.Add(("      L{0}: {1}" -f $s.line, $s.snippet)) }
  }
  [void]$out.Add("")
}

$outFile = Join-Path $Root "tools/encoding-report.txt"
[System.IO.File]::WriteAllLines($outFile, $out, (New-Object System.Text.UTF8Encoding($false)))
$out -join "`n" | Write-Output
