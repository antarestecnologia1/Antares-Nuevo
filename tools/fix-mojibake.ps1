<#
  Repara mojibake: texto UTF-8 que fue decodificado como Latin-1/CP1252 y vuelto a
  guardar como UTF-8 (doble codificacion). Ej.: "mÃ³dulo" -> "modulo" con tilde.

  Estrategia (estilo ftfy), conservadora:
    1. Localiza SOLO las secuencias que parecen UTF-8 disfrazado
       (byte lider C2-F4 seguido de los bytes de continuacion 80-BF correspondientes).
    2. Convierte esa subcadena de vuelta a bytes usando un mapa hibrido Latin-1 + CP1252.
    3. Decodifica esos bytes como UTF-8 ESTRICTO. Si falla, NO toca nada.
  Asi el texto legitimo con acentos (p. ej. clases de caracteres en regex) queda intacto.

  Uso:
    powershell -File tools/fix-mojibake.ps1 -Paths 'a.js,b.ts'          # dry-run
    powershell -File tools/fix-mojibake.ps1 -Paths 'a.js' -Apply        # escribe
    powershell -File tools/fix-mojibake.ps1 -Paths 'a.js' -Apply -StripBom

  Script ASCII-only a proposito (Windows PowerShell 5.1 lee .ps1 sin BOM como ANSI).
#>
param(
  [Parameter(Mandatory = $true)][string[]]$Paths,
  [switch]$Apply,
  [switch]$StripBom,
  [int]$MaxSamples = 25
)

$ErrorActionPreference = "Stop"
$Paths = @($Paths | ForEach-Object { $_ -split ',' } | Where-Object { $_ -ne '' })

# --- Mapa caracter -> byte (Latin-1 directo + especiales CP1252 0x80-0x9F) ---
$cp1252Specials = @{
  [char]0x20AC = 0x80; [char]0x201A = 0x82; [char]0x0192 = 0x83; [char]0x201E = 0x84
  [char]0x2026 = 0x85; [char]0x2020 = 0x86; [char]0x2021 = 0x87; [char]0x02C6 = 0x88
  [char]0x2030 = 0x89; [char]0x0160 = 0x8A; [char]0x2039 = 0x8B; [char]0x0152 = 0x8C
  [char]0x017D = 0x8E; [char]0x2018 = 0x91; [char]0x2019 = 0x92; [char]0x201C = 0x93
  [char]0x201D = 0x94; [char]0x2022 = 0x95; [char]0x2013 = 0x96; [char]0x2014 = 0x97
  [char]0x02DC = 0x98; [char]0x2122 = 0x99; [char]0x0161 = 0x9A; [char]0x203A = 0x9B
  [char]0x0153 = 0x9C; [char]0x017E = 0x9E; [char]0x0178 = 0x9F
}

function ConvertTo-Byte([char]$ch) {
  $code = [int]$ch
  if ($code -le 0xFF) { return $code }
  if ($cp1252Specials.ContainsKey($ch)) { return $cp1252Specials[$ch] }
  return -1
}

# Clase de "byte de continuacion" (0x80-0xBF) tal como se ve tras el mal decode.
$CONT = "[\u0080-\u00BF\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178]"
$L2 = "[\u00C2-\u00DF]"
$L3 = "[\u00E0-\u00EF]"
$L4 = "[\u00F0-\u00F4]"
$mojiRe = [regex]("(?:$L4$CONT$CONT$CONT|$L3$CONT$CONT|$L2$CONT)+")

$strictUtf8 = New-Object System.Text.UTF8Encoding($false, $true)
$looseUtf8 = New-Object System.Text.UTF8Encoding($false, $false)

foreach ($p in $Paths) {
  if (-not (Test-Path -LiteralPath $p)) { Write-Output "MISSING: $p"; continue }
  $full = (Resolve-Path -LiteralPath $p).Path
  $bytes = [System.IO.File]::ReadAllBytes($full)
  $hadBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)

  $text = $looseUtf8.GetString($bytes)
  if ($hadBom -and $text.Length -gt 0 -and [int]$text[0] -eq 0xFEFF) { $text = $text.Substring(1) }

  $fixed = 0
  $skipped = 0
  $samples = New-Object System.Collections.ArrayList

  $evaluator = {
    param($m)
    $s = $m.Value
    $buf = New-Object 'System.Collections.Generic.List[byte]'
    foreach ($ch in $s.ToCharArray()) {
      $b = ConvertTo-Byte $ch
      if ($b -lt 0) { return $s }
      [void]$buf.Add([byte]$b)
    }
    try {
      $decoded = $strictUtf8.GetString($buf.ToArray())
    }
    catch {
      $script:skipped++
      return $s
    }
    # Seguridad: el resultado no debe reintroducir marcadores de mojibake.
    if ($decoded -match "[\u00C2\u00C3]" -or $decoded -match "\uFFFD") {
      $script:skipped++
      return $s
    }
    $script:fixed++
    if ($script:samples.Count -lt $MaxSamples) {
      [void]$script:samples.Add(("'{0}' -> '{1}'" -f $s, $decoded))
    }
    return $decoded
  }

  $newText = $mojiRe.Replace($text, $evaluator)

  Write-Output "=== $p"
  Write-Output ("    secuencias reparadas={0}  omitidas={1}  bom={2}" -f $fixed, $skipped, $hadBom)
  foreach ($s in $samples) { Write-Output ("      {0}" -f $s) }

  $residual = ([regex]"[\u00C2\u00C3]|\u00E2\u20AC").Matches($newText).Count
  Write-Output ("    residual sospechoso tras reparar: {0}" -f $residual)

  if ($Apply) {
    $changed = ($newText -ne $text) -or ($hadBom -and $StripBom)
    if ($changed) {
      $outBytes = $looseUtf8.GetBytes($newText)
      if ($hadBom -and -not $StripBom) {
        $bom = [byte[]](0xEF, 0xBB, 0xBF)
        $outBytes = $bom + $outBytes
      }
      [System.IO.File]::WriteAllBytes($full, $outBytes)
      Write-Output "    ESCRITO"
    }
    else {
      Write-Output "    sin cambios"
    }
  }
  else {
    Write-Output "    (dry-run, no se escribio)"
  }
  Write-Output ""
}
