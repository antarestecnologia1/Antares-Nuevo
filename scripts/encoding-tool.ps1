<#
.SYNOPSIS
    Diagnostica y repara problemas de codificacion (tildes / enies) en el repo.

.DESCRIPTION
    Trabaja SIEMPRE a nivel de BYTES usando .NET. Nunca usa Get-Content /
    Set-Content / Out-File, porque en Windows PowerShell 5.1 esos cmdlets leen y
    escriben en la codepage ANSI (Windows-1252) y son justamente los que
    destruyen las tildes de archivos UTF-8.

    IMPORTANTE: este script es 100% ASCII a proposito. Un .ps1 sin BOM que
    contenga tildes es leido por PS 5.1 como Windows-1252 y se corrompe solo.

    Problemas detectados:
      NOT_UTF8    El archivo no es UTF-8 valido (bytes cp1252 crudos).
      MOJIBAKE    UTF-8 valido pero doblemente codificado (A-tilde + simbolo).
      LOST_CHARS  Contiene U+FFFD: el caracter original ya se perdio.
      BOM         UTF-8 con BOM.
      UTF16       Archivo en UTF-16.

.PARAMETER Mode
    Scan (default) solo reporta. Fix reescribe los archivos reparables.

.PARAMETER Path
    Subcarpeta o archivo a analizar. Por defecto, todo el repo.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts\encoding-tool.ps1
    powershell -ExecutionPolicy Bypass -File scripts\encoding-tool.ps1 -Mode Fix
#>

[CmdletBinding()]
param(
    [ValidateSet('Scan', 'Fix')]
    [string]$Mode = 'Scan',

    [string]$Path,

    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'

# --------------------------------------------------------------------------
# Tablas Windows-1252 <-> Unicode (biyeccion completa sobre 0x00-0xFF).
# Se declaran con codigos hex para que el script no contenga byte no-ASCII.
# --------------------------------------------------------------------------
$Cp1252ToChar = New-Object 'char[]' 256
for ($i = 0; $i -lt 256; $i++) { $Cp1252ToChar[$i] = [char]$i }

$HighRange = @(
    0x20AC, 0x0081, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021,
    0x02C6, 0x2030, 0x0160, 0x2039, 0x0152, 0x008D, 0x017D, 0x008F,
    0x0090, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014,
    0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0x009D, 0x017E, 0x0178
)
for ($i = 0; $i -lt 32; $i++) { $Cp1252ToChar[0x80 + $i] = [char]$HighRange[$i] }

$CharToCp1252 = @{}
for ($i = 0; $i -lt 256; $i++) {
    $c = $Cp1252ToChar[$i]
    if (-not $CharToCp1252.ContainsKey($c)) { $CharToCp1252[$c] = [byte]$i }
}

# Tablas OEM: son las codepages del terminal en Windows. Cuando la salida de una
# herramienta UTF-8 pasa por la consola y se captura a un archivo, los bytes
# UTF-8 se leen como cp850 o cp437 y aparece mojibake con cajas y letras griegas.
# Las dos se prueban porque difieren justo en los rangos donde cae el dano:
# cp437 0xE2 es Gamma mientras que cp850 0xE2 es O-circunflejo.
function New-CodepageTable {
    param([int]$CodePage)
    try {
        $enc = [System.Text.Encoding]::GetEncoding($CodePage)
    } catch {
        return $null
    }
    $map = @{}
    $one = New-Object 'byte[]' 1
    for ($i = 0; $i -lt 256; $i++) {
        $one[0] = [byte]$i
        $s = $enc.GetString($one)
        if ($s.Length -ne 1) { continue }
        if (-not $map.ContainsKey($s[0])) { $map[$s[0]] = [byte]$i }
    }
    return $map
}

$CharToCp850 = New-CodepageTable -CodePage 850
$CharToCp437 = New-CodepageTable -CodePage 437

$Utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false, $false)

$SkipDirs = @(
    'node_modules', '.git', '.next', 'dist', 'build', 'coverage',
    'test-results', 'playwright-report', 'tmp-docx',
    '_tmp_docx_inspect', '_tmp_docx2_inspect', '.turbo', '.cache'
)
$TextExtensions = @(
    '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts',
    '.json', '.jsonc', '.html', '.htm', '.css', '.scss', '.less',
    '.md', '.mdx', '.sql', '.txt', '.yml', '.yaml', '.svg', '.py',
    '.sh', '.xml', '.csv', '.toml', '.ini'
)
$SkipFiles = @('package-lock.json', 'yarn.lock', 'pnpm-lock.yaml')

# Un archivo que contenga este marcador declara que sus secuencias tipo "A-tilde"
# son INTENCIONALES (tablas de reparacion, ejemplos en documentacion). Se reporta
# como INTENTIONAL pero nunca se reescribe: repararlo lo romperia.
$IgnorePragma = 'encoding-tool:allow-mojibake'

# Caracteres que encabezan una secuencia de mojibake real (UTF-8 leido cp1252).
$MojibakeLead = [regex]'[\u00C2-\u00DF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]'

# Firma del mojibake OEM: los bytes lead de UTF-8 caen en cp850 sobre caracteres
# de dibujo de cajas o griegos (C3 -> box, C2 -> box, E2 -> Gamma). Ver uno de
# esos pegado a texto normal es practicamente siempre dano, no contenido real.
$OemMojibakeLead = [regex]'[\u2500-\u257F\u0393\u2591-\u2593]'

$NonAsciiRun = [regex]'[^\u0000-\u007F]+'
$InsaneChars = [regex]'[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFD]'

function Test-IsValidUtf8 {
    param([byte[]]$Bytes)
    try { [void]$Utf8Strict.GetString($Bytes); return $true }
    catch { return $false }
}

function ConvertFrom-Cp1252 {
    param([byte[]]$Bytes)
    $sb = New-Object System.Text.StringBuilder $Bytes.Length
    foreach ($b in $Bytes) { [void]$sb.Append($Cp1252ToChar[$b]) }
    return $sb.ToString()
}

# Repara la doble codificacion corrida por corrida (no el archivo entero, para
# no romper emojis ni simbolos legitimos). $Table es char -> byte de la codepage
# con la que se leyo mal el UTF-8; $Lead es la firma que debe aparecer en la
# corrida para considerarla danada.
function Repair-Sequence {
    param(
        [string]$Text,
        [hashtable]$Table,
        [regex]$Lead
    )

    if ($null -eq $Table) { return [pscustomobject]@{ Text = $Text; Fixes = 0 } }

    $script:tblRef = $Table
    $script:leadRef = $Lead
    $current = $Text
    $total = 0

    for ($pass = 0; $pass -lt 5; $pass++) {
        $evaluator = {
            param($m)
            $run = $m.Value
            if (-not $script:leadRef.IsMatch($run)) { return $run }

            $bytes = New-Object 'byte[]' $run.Length
            for ($k = 0; $k -lt $run.Length; $k++) {
                $b = $script:tblRef[$run[$k]]
                if ($null -eq $b) { return $run }
                $bytes[$k] = $b
            }
            try { $decoded = $Utf8Strict.GetString($bytes) } catch { return $run }
            if ($decoded -ceq $run) { return $run }
            if ($InsaneChars.IsMatch($decoded)) { return $run }
            $script:passFixesRef++
            return $decoded
        }

        $script:passFixesRef = 0
        $next = $NonAsciiRun.Replace($current, $evaluator)
        $passFixes = $script:passFixesRef

        $current = $next
        $total += $passFixes
        if ($passFixes -eq 0) { break }
    }

    return [pscustomobject]@{ Text = $current; Fixes = $total }
}

# UTF-8 leido como Windows-1252 ("GestiA-tilde-3n").
function Repair-Mojibake {
    param([string]$Text)
    return Repair-Sequence -Text $Text -Table $CharToCp1252 -Lead $MojibakeLead
}

# UTF-8 leido como OEM, tipico de capturar salida de consola a un archivo.
# Se encadenan cp850 y cp437: un mismo archivo puede traer dano de ambas.
function Repair-OemMojibake {
    param([string]$Text)
    $current = $Text
    $total = 0
    foreach ($table in @($CharToCp850, $CharToCp437)) {
        $r = Repair-Sequence -Text $current -Table $table -Lead $OemMojibakeLead
        $current = $r.Text
        $total += $r.Fixes
    }
    return [pscustomobject]@{ Text = $current; Fixes = $total }
}

function Get-SampleLines {
    param([string]$Text, [regex]$Pattern, [int]$Limit = 3)
    $samples = @()
    $lines = $Text -split "`r?`n"
    for ($i = 0; $i -lt $lines.Length -and $samples.Count -lt $Limit; $i++) {
        if (-not $Pattern.IsMatch($lines[$i])) { continue }
        $t = $lines[$i].Trim()
        if ($t.Length -gt 150) { $t = $t.Substring(0, 150) + '...' }
        $samples += [pscustomobject]@{ Line = ($i + 1); Text = $t }
    }
    return $samples
}

function Get-TargetFiles {
    param([string]$Root)
    Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $rel = $_.FullName.Substring($Root.Length).TrimStart('\', '/')
        $parts = $rel -split '[\\/]'
        $skip = $false
        foreach ($p in $parts) { if ($SkipDirs -contains $p) { $skip = $true; break } }
        (-not $skip) -and
        ($TextExtensions -contains $_.Extension.ToLower()) -and
        ($SkipFiles -notcontains $_.Name) -and
        ($_.Length -lt 20MB)
    }
}

# --------------------------------------------------------------------------
# Ejecucion
# --------------------------------------------------------------------------
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Target = if ($Path) { (Resolve-Path -LiteralPath $Path).Path } else { $RepoRoot }

if (Test-Path -LiteralPath $Target -PathType Leaf) {
    $files = @(Get-Item -LiteralPath $Target)
} else {
    $files = @(Get-TargetFiles -Root $Target)
}

$results = @()

foreach ($file in $files) {
    try { $bytes = [System.IO.File]::ReadAllBytes($file.FullName) }
    catch { Write-Warning "No se pudo leer: $($file.FullName)"; continue }
    if ($bytes.Length -eq 0) { continue }

    $issues = @()
    $samples = @()
    $repairedText = $null

    # UTF-16?
    if ($bytes.Length -ge 2 -and (($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) -or ($bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF))) {
        $issues += 'UTF16'
        $enc = if ($bytes[0] -eq 0xFF) { [System.Text.Encoding]::Unicode } else { [System.Text.Encoding]::BigEndianUnicode }
        $repairedText = $enc.GetString($bytes).TrimStart([char]0xFEFF)
    } else {
        $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
        if ($hasBom) { $issues += 'BOM' }

        $body = if ($hasBom) { $bytes[3..($bytes.Length - 1)] } else { $bytes }

        if (-not (Test-IsValidUtf8 -Bytes $body)) {
            $issues += 'NOT_UTF8'
            $text = ConvertFrom-Cp1252 -Bytes $body
            $samples = Get-SampleLines -Text $text -Pattern ([regex]'[^\u0000-\u007F]')
            $repairedText = (Repair-Mojibake -Text $text).Text
        } else {
            $text = $Utf8Strict.GetString($body)

            if ($text.Contains([char]0xFFFD)) {
                $issues += 'LOST_CHARS'
                $samples += Get-SampleLines -Text $text -Pattern ([regex]'\uFFFD')
            }

            $fixed = Repair-Mojibake -Text $text
            $oem = Repair-OemMojibake -Text $text

            if (($fixed.Fixes -gt 0 -or $oem.Fixes -gt 0) -and $text.Contains($IgnorePragma)) {
                $issues += 'INTENTIONAL'
                if ($hasBom) { $repairedText = $text }
            } elseif ($fixed.Fixes -gt 0) {
                $issues += 'MOJIBAKE'
                $samples += Get-SampleLines -Text $text -Pattern $MojibakeLead
                # Un archivo puede acumular ambos danos; se encadenan las pasadas.
                $repairedText = (Repair-OemMojibake -Text $fixed.Text).Text
            } elseif ($oem.Fixes -gt 0) {
                $issues += 'MOJIBAKE_OEM'
                $samples += Get-SampleLines -Text $text -Pattern $OemMojibakeLead
                $repairedText = $oem.Text
            } elseif ($hasBom) {
                $repairedText = $text
            }
        }
    }

    if ($issues.Count -eq 0) { continue }

    $rel = $file.FullName.Substring($RepoRoot.Length).TrimStart('\', '/') -replace '\\', '/'
    $results += [pscustomobject]@{
        File     = $rel
        FullName = $file.FullName
        Issues   = $issues
        Samples  = $samples
        Repaired = $repairedText
    }

    if ($Mode -eq 'Fix' -and $null -ne $repairedText -and $issues -notcontains 'LOST_CHARS') {
        [System.IO.File]::WriteAllBytes($file.FullName, $Utf8NoBom.GetBytes($repairedText))
    }
}

# --------------------------------------------------------------------------
# Reporte
# --------------------------------------------------------------------------
if (-not $Quiet) {
    Write-Host "Archivos de texto revisados: $($files.Count)" -ForegroundColor DarkGray
    if ($results.Count -eq 0) {
        Write-Host 'OK: no se detectaron problemas de codificacion.' -ForegroundColor Green
    } else {
        $order = @('NOT_UTF8', 'MOJIBAKE', 'MOJIBAKE_OEM', 'LOST_CHARS', 'UTF16', 'BOM', 'INTENTIONAL')
        foreach ($issue in $order) {
            $matched = @($results | Where-Object { $_.Issues -contains $issue })
            if ($matched.Count -eq 0) { continue }
            Write-Host ''
            Write-Host "=== $issue ($($matched.Count) archivo(s)) ===" -ForegroundColor Yellow
            foreach ($r in $matched) {
                Write-Host "  $($r.File)"
                foreach ($s in ($r.Samples | Select-Object -First 2)) {
                    Write-Host "      L$($s.Line): $($s.Text)" -ForegroundColor DarkGray
                }
            }
        }
        Write-Host ''
        Write-Host "Total: $($results.Count) archivo(s) con hallazgos." -ForegroundColor Cyan
        if ($Mode -eq 'Scan') {
            Write-Host 'Ejecuta con -Mode Fix para reparar (LOST_CHARS no es reparable).' -ForegroundColor Cyan
        }
    }
}

# Codigo de salida util para CI: INTENTIONAL no cuenta como fallo.
$real = @($results | Where-Object { $_.Issues -ne 'INTENTIONAL' -or $_.Issues.Count -gt 1 })
if ($real.Count -gt 0) { exit 1 } else { exit 0 }
