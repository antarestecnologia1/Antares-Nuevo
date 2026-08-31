<#
    Muestra los code points no-ASCII de una linea concreta.
    Diagnostico puntual. Script 100% ASCII a proposito.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$File,
    [Parameter(Mandatory = $true)][int]$Line
)

$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false, $false)
$text = $utf8.GetString([System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $File).Path))
$lines = $text -split "`r?`n"
$l = $lines[$Line - 1]

Write-Host ("L{0} ({1} chars)" -f $Line, $l.Length)
for ($j = 0; $j -lt $l.Length; $j++) {
    $code = [int][char]$l[$j]
    if ($code -gt 127) {
        Write-Host ("  pos={0,-5} U+{1:X4}" -f $j, $code)
    }
}
