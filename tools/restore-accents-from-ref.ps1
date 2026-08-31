<#
  Restaura tildes perdidas usando una version de referencia (previa al dano).

  Idea: al guardar el archivo con una codificacion equivocada, cada caracter
  no-ASCII se convirtio en '?'. Por tanto, la linea danada actual es EXACTAMENTE
  la "firma ASCII" de la linea original. Comparamos:

      firma(lineaBuena) = lineaBuena con cada caracter no-ASCII -> '?'

  Si la linea actual es identica a esa firma, restauramos la linea buena.
  Es una coincidencia exacta, asi que no puede inventar texto.

  Uso:
    powershell -File tools/restore-accents-from-ref.ps1 -Target f.ts -Reference good.ts
    powershell -File tools/restore-accents-from-ref.ps1 -Target f.ts -Reference good.ts -Apply

  Script ASCII-only a proposito.
#>
param(
  [Parameter(Mandatory = $true)][string]$Target,
  [Parameter(Mandatory = $true)][string]$Reference,
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
$utf8 = New-Object System.Text.UTF8Encoding($false, $false)

function Get-AsciiSignature([string]$s) {
  $sb = New-Object System.Text.StringBuilder
  foreach ($ch in $s.ToCharArray()) {
    if ([int]$ch -gt 127) { [void]$sb.Append('?') } else { [void]$sb.Append($ch) }
  }
  return $sb.ToString()
}

$targetText = $utf8.GetString([System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $Target).Path))
$refText = $utf8.GetString([System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $Reference).Path))

$targetLines = $targetText -split "`n"
$refLines = $refText -split "`n"

# firma -> linea original (solo si no hay ambiguedad entre lineas distintas)
$map = @{}
$ambiguous = @{}
foreach ($rawLine in $refLines) {
  # git puede entregar LF mientras el arbol de trabajo usa CRLF: comparar sin el \r.
  $line = $rawLine.TrimEnd("`r")
  if ($line -notmatch "[^\x00-\x7F]") { continue }   # sin no-ASCII: nada que restaurar
  $sig = Get-AsciiSignature $line
  if ($map.ContainsKey($sig)) {
    if ($map[$sig] -ne $line) { $ambiguous[$sig] = $true }
  }
  else { $map[$sig] = $line }
}

$restored = 0
$out = New-Object 'System.Collections.Generic.List[string]'
$changes = New-Object System.Collections.ArrayList

for ($i = 0; $i -lt $targetLines.Count; $i++) {
  $line = $targetLines[$i]
  $hadCr = $line.EndsWith("`r")
  $key = $line.TrimEnd("`r")
  if ($key -match '\?' -and $map.ContainsKey($key) -and -not $ambiguous.ContainsKey($key)) {
    $good = $map[$key]
    if ($good -ne $key) {
      if ($changes.Count -lt 200) {
        [void]$changes.Add(("  L{0}`n    - {1}`n    + {2}" -f ($i + 1), $key.Trim(), $good.Trim()))
      }
      $line = if ($hadCr) { $good + "`r" } else { $good }
      $restored++
    }
  }
  $out.Add($line)
}

$newText = [string]::Join("`n", $out)

Write-Output ("Lineas restauradas: {0}" -f $restored)
Write-Output ""
foreach ($c in $changes) { Write-Output $c }
Write-Output ""

# Lineas que siguen mostrando sintomas de tilde destruida.
$remaining = New-Object System.Collections.ArrayList
$qRe = [regex]"(?<=[A-Za-z])\?(?=[a-z])"
$sepRe = [regex]"\s\?\s"
$newLines = $newText -split "`n"
for ($i = 0; $i -lt $newLines.Count; $i++) {
  $l = $newLines[$i]
  if ($qRe.IsMatch($l) -or ($sepRe.IsMatch($l) -and $l -match '`')) {
    [void]$remaining.Add(("  L{0}: {1}" -f ($i + 1), $l.Trim()))
  }
}
Write-Output ("Lineas aun sospechosas (revisar a mano): {0}" -f $remaining.Count)
foreach ($r in $remaining) { Write-Output $r }

if ($Apply -and $restored -gt 0) {
  [System.IO.File]::WriteAllBytes((Resolve-Path -LiteralPath $Target).Path, $utf8.GetBytes($newText))
  Write-Output ""
  Write-Output "ESCRITO"
}
elseif (-not $Apply) {
  Write-Output ""
  Write-Output "(dry-run, no se escribio)"
}
