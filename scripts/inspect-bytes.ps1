<#
    Muestra los bytes no-ASCII de un archivo, agrupados por linea.
    Diagnostico puntual: permite ver exactamente en que se convirtio cada tilde.
    Script 100% ASCII a proposito.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$File,
    [int]$MaxLines = 25
)

$ErrorActionPreference = 'Stop'
$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $File).Path)
$utf8 = New-Object System.Text.UTF8Encoding($false, $false)
$text = $utf8.GetString($bytes)
$lines = $text -split "`r?`n"

$shown = 0
for ($i = 0; $i -lt $lines.Length -and $shown -lt $MaxLines; $i++) {
    $line = $lines[$i]
    $hits = @()
    for ($j = 0; $j -lt $line.Length; $j++) {
        $code = [int][char]$line[$j]
        if ($code -gt 127 -or $code -eq 0x3F) {
            $hits += ("pos={0} U+{1:X4}" -f $j, $code)
        }
    }
    if ($hits.Count -eq 0) { continue }
    $shown++
    Write-Host ("L{0}: {1}" -f ($i + 1), $line.Trim()) -ForegroundColor Gray
    Write-Host ("      " + ($hits -join '  ')) -ForegroundColor DarkYellow
}
