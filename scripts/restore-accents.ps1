<#
.SYNOPSIS
    Restaura tildes perdidas usando una version de git como referencia.

.DESCRIPTION
    Cuando un archivo pasa por una herramienta que no respeta UTF-8, las letras
    acentuadas se convierten en '?' (U+003F) y algunos simbolos en U+FFFD. Esa
    perdida NO es reversible por si sola: un '?' es indistinguible de un '?'
    legitimo (por ejemplo `moduleId?: string` en TypeScript, o un ternario).

    Este script recupera el texto comparando contra una referencia sana de git,
    en dos pasadas y sin adivinar nunca:

      1. Por LINEA: si una linea danada coincide con una linea de la referencia
         al reducir ambas a su "esqueleto" (cada caracter no-ASCII y cada '?'
         se vuelven comodin), se restaura la linea completa.
      2. Por PALABRA: para lineas que el usuario edito y ya no existen en la
         referencia, se restauran solo los tokens donde el '?' esta ENTRE dos
         letras (asi nunca se toca `moduleId?:` ni `a ? b : c`).

    Lo que no se puede resolver sin ambiguedad se reporta para revision manual.
    Script 100% ASCII a proposito.

.PARAMETER File
    Archivo(s) a restaurar. Si se omite, usa los archivos modificados en git.

.PARAMETER Ref
    Referencia git sana. Por defecto HEAD.

.PARAMETER Apply
    Sin este switch el script solo reporta (dry-run).

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts\restore-accents.ps1
    powershell -ExecutionPolicy Bypass -File scripts\restore-accents.ps1 -Apply
#>

[CmdletBinding()]
param(
    [string[]]$File,
    [string]$Ref = 'HEAD',
    [switch]$Apply
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path
$Utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false, $false)

$MARKER = [char]0xE000  # comodin privado, no aparece en codigo real
$DamagedChar = [regex]'[\uFFFD]|\?'
$WordCandidate = [regex]'(?<=\p{L})\?(?=\p{L})'

function Get-Skeleton {
    param([string]$Line)
    $sb = New-Object System.Text.StringBuilder $Line.Length
    $prevMarker = $false
    foreach ($ch in $Line.ToCharArray()) {
        $code = [int][char]$ch
        if ($code -gt 127 -or $ch -eq '?') {
            # Un solo simbolo perdido puede haberse convertido en varios U+FFFD
            # (uno por byte UTF-8), asi que las corridas se colapsan a un comodin.
            if (-not $prevMarker) { [void]$sb.Append($MARKER) }
            $prevMarker = $true
        } else {
            [void]$sb.Append($ch)
            $prevMarker = $false
        }
    }
    return $sb.ToString()
}

function Get-DamageKey {
    param([string]$Token)
    $sb = New-Object System.Text.StringBuilder $Token.Length
    foreach ($ch in $Token.ToCharArray()) {
        if ([int][char]$ch -gt 127) { [void]$sb.Append('?') }
        else { [void]$sb.Append($ch) }
    }
    return $sb.ToString()
}

function Get-GitBlob {
    param([string]$RelPath, [string]$Reference)
    $tmp = [System.IO.Path]::GetTempFileName()
    # Redireccion via cmd para conservar los bytes crudos: el operador '>' de
    # PowerShell 5.1 escribiria UTF-16 y arruinaria la referencia.
    $spec = "$Reference`:$RelPath"
    cmd /c "git show `"$spec`" > `"$tmp`" 2>nul" | Out-Null
    if ($LASTEXITCODE -ne 0) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue; return $null }
    $bytes = [System.IO.File]::ReadAllBytes($tmp)
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    if ($bytes.Length -eq 0) { return $null }
    try { return $Utf8Strict.GetString($bytes) } catch { return $null }
}

# --------------------------------------------------------------------------
# Seleccion de archivos
# --------------------------------------------------------------------------
Push-Location $RepoRoot
try {
    if (-not $File -or $File.Count -eq 0) {
        $File = @(git diff --name-only) + @(git diff --name-only --cached) |
            Sort-Object -Unique | Where-Object { $_ -and (Test-Path -LiteralPath (Join-Path $RepoRoot $_)) }
    }

    if (-not $File -or $File.Count -eq 0) {
        Write-Host 'No hay archivos que revisar.' -ForegroundColor Green
        exit 0
    }

    $anyChange = $false

    foreach ($f in $File) {
        $full = (Resolve-Path -LiteralPath (Join-Path $RepoRoot $f)).Path
        $rel = $full.Substring($RepoRoot.Length).TrimStart('\', '/') -replace '\\', '/'

        $bytes = [System.IO.File]::ReadAllBytes($full)
        try { $target = $Utf8Strict.GetString($bytes) }
        catch { Write-Warning "$rel no es UTF-8 valido; corrige la codificacion primero."; continue }

        if (-not $DamagedChar.IsMatch($target)) { continue }

        $reference = Get-GitBlob -RelPath $rel -Reference $Ref
        if ($null -eq $reference) {
            Write-Warning "$rel : sin referencia en $Ref; se omite."
            continue
        }

        # --- Indices de la referencia -------------------------------------
        $refLines = $reference -split "`n"
        $bySkeleton = @{}
        foreach ($rl in $refLines) {
            if ($rl -notmatch '[^\u0000-\u007F]') { continue }
            $k = Get-Skeleton $rl
            if ($bySkeleton.ContainsKey($k)) {
                if ($bySkeleton[$k] -cne $rl) { $bySkeleton[$k] = $null }  # ambiguo
            } else {
                $bySkeleton[$k] = $rl
            }
        }

        $byWord = @{}
        foreach ($m in ([regex]'[\p{L}]+').Matches($reference)) {
            $tok = $m.Value
            if ($tok -notmatch '[^\u0000-\u007F]') { continue }
            $k = Get-DamageKey $tok
            if ($byWord.ContainsKey($k)) {
                if ($byWord[$k] -cne $tok) { $byWord[$k] = $null }
            } else {
                $byWord[$k] = $tok
            }
        }

        # --- Restauracion --------------------------------------------------
        $lines = $target -split "`n"
        $lineFixes = 0
        $wordFixes = 0
        $pending = @()

        for ($i = 0; $i -lt $lines.Length; $i++) {
            $line = $lines[$i]
            if (-not $DamagedChar.IsMatch($line)) { continue }

            # Pasada 1: linea completa
            $skel = Get-Skeleton $line
            if ($bySkeleton.ContainsKey($skel) -and $null -ne $bySkeleton[$skel]) {
                $restored = $bySkeleton[$skel]
                if ($restored -cne $line) {
                    $lines[$i] = $restored
                    $lineFixes++
                }
                continue
            }

            # Pasada 2: palabra por palabra (solo '?' entre letras)
            if ($WordCandidate.IsMatch($line)) {
                $script:wordHit = 0
                $newLine = [regex]::Replace($line, '[\p{L}]+(?:\?[\p{L}]+)+', {
                    param($m)
                    $tok = $m.Value
                    if ($byWord.ContainsKey($tok) -and $null -ne $byWord[$tok]) {
                        $script:wordHit++
                        return $byWord[$tok]
                    }
                    return $tok
                })
                if ($newLine -cne $line) {
                    $lines[$i] = $newLine
                    $wordFixes += $script:wordHit
                }
            }

            if ($DamagedChar.IsMatch($lines[$i]) -and $lines[$i] -match '\uFFFD') {
                $pending += [pscustomobject]@{ Line = ($i + 1); Text = $lines[$i].Trim() }
            }
        }

        $result = $lines -join "`n"

        Write-Host ''
        Write-Host "== $rel" -ForegroundColor Cyan
        Write-Host "   lineas restauradas: $lineFixes    palabras restauradas: $wordFixes"
        if ($pending.Count -gt 0) {
            Write-Host "   SIN RESOLVER ($($pending.Count)) - revisar a mano:" -ForegroundColor Yellow
            foreach ($p in ($pending | Select-Object -First 10)) {
                Write-Host "     L$($p.Line): $($p.Text)" -ForegroundColor DarkGray
            }
        }

        if ($result -cne $target) {
            $anyChange = $true
            if ($Apply) {
                [System.IO.File]::WriteAllBytes($full, $Utf8NoBom.GetBytes($result))
                Write-Host '   APLICADO' -ForegroundColor Green
            } else {
                Write-Host '   (dry-run: usa -Apply para escribir)' -ForegroundColor DarkYellow
            }
        }
    }

    if (-not $anyChange) { Write-Host ''; Write-Host 'Nada que restaurar.' -ForegroundColor Green }
}
finally {
    Pop-Location
}
