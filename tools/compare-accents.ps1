<#
  Compara la cantidad de vocales acentuadas / caracteres espanoles entre una
  revision "buena" de git y el arbol de trabajo, para detectar archivos que
  perdieron tildes (guardados con una codificacion equivocada).

  Uso: powershell -File tools/compare-accents.ps1 -GoodRef 21732b3
  Script ASCII-only a proposito.
#>
param(
  [Parameter(Mandatory = $true)][string]$GoodRef
)

$ErrorActionPreference = "Stop"
$tmp = Join-Path $env:TEMP "accent-cmp.bin"
$loose = New-Object System.Text.UTF8Encoding($false, $false)

$exts = @(
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.html', '.htm',
  '.css', '.scss', '.sql', '.md', '.txt', '.yml', '.yaml'
)

# Caracteres propios del espanol que se pierden al guardar en una codificacion errada.
$accentRe = [regex]"[\u00E1\u00E9\u00ED\u00F3\u00FA\u00FC\u00F1\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D1\u00BF\u00A1\u00BA\u00AA\u00B0\u2026\u2192\u2014\u2013\u00B7]"
$fffdRe = [regex]"\uFFFD"
# '?' entre letras: sintoma tipico de tilde destruida (excluye '?.' y '??').
$qmarkRe = [regex]"(?<=[A-Za-z])\?(?=[a-z])"

# core.quotepath=false evita rutas escapadas ("\303\261") en nombres con acentos.
$extAlt = ($exts | ForEach-Object { [regex]::Escape($_) }) -join '|'
$extRe = [regex]("(?i)(" + $extAlt + ")$")
$files = @(& git -c core.quotepath=false ls-files) | Where-Object { $_ -and $extRe.IsMatch($_) }

Write-Output ("Archivos rastreados analizados: {0}" -f $files.Count)
Write-Output ("Referencia buena: {0}" -f $GoodRef)
Write-Output ""

$flagged = New-Object System.Collections.ArrayList

foreach ($f in $files) {
  if (-not (Test-Path -LiteralPath $f)) { continue }

  $newBytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $f).Path)
  $newText = $loose.GetString($newBytes)
  $newAcc = $accentRe.Matches($newText).Count
  $newFffd = $fffdRe.Matches($newText).Count
  $newQ = $qmarkRe.Matches($newText).Count

  Remove-Item $tmp -ErrorAction SilentlyContinue
  $null = & cmd /c "git show ""${GoodRef}:$f"" > ""$tmp"" 2>nul"
  $oldAcc = -1
  if ((Test-Path -LiteralPath $tmp) -and ((Get-Item $tmp).Length -gt 0)) {
    $oldText = $loose.GetString([System.IO.File]::ReadAllBytes($tmp))
    $oldAcc = $accentRe.Matches($oldText).Count
  }

  $lost = if ($oldAcc -ge 0) { $oldAcc - $newAcc } else { 0 }

  if ($newFffd -gt 0 -or $newQ -gt 0 -or $lost -gt 0) {
    [void]$flagged.Add([pscustomobject]@{
        File = $f; OldAcc = $oldAcc; NewAcc = $newAcc; Lost = $lost; Fffd = $newFffd; QMark = $newQ
      })
  }
}

Remove-Item $tmp -ErrorAction SilentlyContinue

Write-Output "== Archivos sospechosos (tildes perdidas / '?' entre letras / U+FFFD) =="
Write-Output ""
$flagged | Sort-Object -Property @{Expression = 'Lost'; Descending = $true }, @{Expression = 'QMark'; Descending = $true } |
Format-Table -AutoSize File, OldAcc, NewAcc, Lost, Fffd, QMark | Out-String -Width 200 | Write-Output
