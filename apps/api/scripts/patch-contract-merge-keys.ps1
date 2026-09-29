# Inyecta marcadores de la plataforma en las plantillas Word nuevas.
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$repo = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$srcAdmin = Join-Path $repo "contratos_nuevos\CONTRATO ACTUALIZADO  PERSONAL ADMINISTRATIVO.docx"
$srcCam = Join-Path $repo "contratos_nuevos\CONTRATO ACTUALIZADO CAMIONES.docx"
$docDir = Join-Path $repo "documentacion"
$dstAdmin = Join-Path $docDir "CONTRATO_ADMINISTRATIVO_OFICINA.docx"
$dstCam = Join-Path $docDir "CONTRATO_TERMINO_FIJO.docx"

function Get-EntryText([string]$docxPath) {
  $zip = [System.IO.Compression.ZipFile]::Open($docxPath, [System.IO.Compression.ZipArchiveMode]::Read)
  try {
    $entry = $zip.GetEntry("word/document.xml")
    $sr = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
    try { return $sr.ReadToEnd() } finally { $sr.Dispose() }
  } finally { $zip.Dispose() }
}

function Set-EntryText([string]$docxPath, [string]$xml) {
  $zip = [System.IO.Compression.ZipFile]::Open($docxPath, [System.IO.Compression.ZipArchiveMode]::Update)
  try {
    $entry = $zip.GetEntry("word/document.xml")
    $entry.Delete()
    $newEntry = $zip.CreateEntry("word/document.xml", [System.IO.Compression.CompressionLevel]::Optimal)
    $sw = New-Object System.IO.StreamWriter($newEntry.Open(), [System.Text.UTF8Encoding]::new($false))
    try { $sw.Write($xml) } finally { $sw.Dispose() }
  } finally { $zip.Dispose() }
}

function Assert-Contains($xml, $needle, $label) {
  if ($xml.IndexOf($needle) -lt 0) { throw "No se encontro '$label'" }
}

function Replace-Once([ref]$xml, $old, $new, $label) {
  $idx = $xml.Value.IndexOf($old)
  if ($idx -lt 0) { throw "Fallo reemplazo '$label'" }
  $dup = $xml.Value.IndexOf($old, $idx + $old.Length)
  $xml.Value = $xml.Value.Remove($idx, $old.Length).Insert($idx, $new)
  if ($dup -ge 0) { Write-Warning "Hay otra ocurrencia de '$label' (se reemplazo solo la primera)" }
}

Copy-Item -LiteralPath $srcAdmin -Destination $dstAdmin -Force
Copy-Item -LiteralPath $srcCam -Destination $dstCam -Force

$admin = Get-EntryText $dstAdmin
Replace-Once ([ref]$admin) "<w:t>___________________</w:t>" "<w:t>nombre_empleado</w:t>" "admin nombre"
Replace-Once ([ref]$admin) "<w:t>________________</w:t>" "<w:t>cedula_empleado</w:t>" "admin cedula"
Replace-Once ([ref]$admin) "<w:t>La Ceja(Antioquia)</w:t>" "<w:t>ciudad_empleado</w:t>" "admin ciudad"
Replace-Once ([ref]$admin) "<w:t>CONTADORA</w:t>" "<w:t>cargo_empleado</w:t>" "admin cargo"

$salaryOld = @"
<w:t>(</w:t></w:r><w:r w:rsidR="00DC22C3"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/></w:rPr><w:t xml:space="preserve">          </w:t></w:r><w:r w:rsidR="00241C4A"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:b/><w:bCs/></w:rPr><w:t>)</w:t></w:r><w:r w:rsidR="006E4403"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve"> </w:t></w:r><w:r w:rsidRPr="00CB0D6D"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:b/><w:bCs/></w:rPr><w:t>`$</w:t></w:r><w:r w:rsidR="00DC22C3"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">                    </w:t>
"@
$salaryNew = @"
<w:t>salario_letras</w:t></w:r><w:r w:rsidR="00241C4A"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/></w:rPr><w:t xml:space="preserve"> (`$</w:t></w:r><w:r w:rsidR="00DC22C3"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:b/><w:bCs/></w:rPr><w:t>salario</w:t></w:r><w:r w:rsidR="00241C4A"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:b/><w:bCs/></w:rPr><w:t>)</w:t>
"@
Replace-Once ([ref]$admin) $salaryOld $salaryNew "admin salario"

$bankNeedle = "mediante consignación bancaria, los días quince"
if ($admin.IndexOf($bankNeedle) -lt 0) { throw "No se encontro texto de consignacion admin" }
$admin = $admin.Replace(
  $bankNeedle,
  "mediante consignación bancaria en la cuenta de ahorros banco_cuenta_bancaria número cuenta_bancaria, los días quince"
)

$durNeedle = "a término fijo por un período de seis (6) meses,"
if ($admin.IndexOf($durNeedle) -lt 0) { throw "No se encontro duracion admin" }
$admin = $admin.Replace($durNeedle, "a término fijo por un período de duracion_contrato,")

Replace-Once ([ref]$admin) "<w:t>OMAIRA DEL SOCORRO PATIÑO SEPULVEDA</w:t>" "<w:t>nombre_empleado</w:t>" "admin firma nombre"
Replace-Once ([ref]$admin) "<w:t>39.421.752</w:t>" "<w:t>cedula_empleado</w:t>" "admin firma cedula"

Assert-Contains $admin "nombre_empleado" "nombre_empleado"
Assert-Contains $admin "cargo_empleado" "cargo_empleado"
Assert-Contains $admin "salario_letras" "salario_letras"
Set-EntryText $dstAdmin $admin
Write-Output "OK admin -> $dstAdmin"

$cam = Get-EntryText $dstCam
Replace-Once ([ref]$cam) "<w:t>__________________</w:t>" "<w:t>nombre_empleado</w:t>" "cam nombre"
# cedula blanks may be split; try full then fallbacks
if ($cam.Contains("<w:t>_________________</w:t>")) {
  Replace-Once ([ref]$cam) "<w:t>_________________</w:t>" "<w:t>cedula_empleado</w:t>" "cam cedula"
} elseif ($cam.Contains("_________________con")) {
  $cam = $cam.Replace("_________________con", "cedula_empleado con")
} else {
  throw "No se encontro cedula camiones"
}

$domOld = @"
<w:t xml:space="preserve">La Ceja </w:t></w:r><w:r w:rsidR="0033704C" w:rsidRPr="0058678D"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r><w:r w:rsidR="00B76FB2" w:rsidRPr="0058678D"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/></w:rPr><w:t>Antioquia</w:t>
"@
$domNew = @"
<w:t>municipio_empleado</w:t></w:r><w:r w:rsidR="0033704C" w:rsidRPr="0058678D"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r><w:r w:rsidR="00B76FB2" w:rsidRPr="0058678D"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/></w:rPr><w:t>Antioquia</w:t>
"@
Replace-Once ([ref]$cam) $domOld $domNew "cam domicilio"

$cargoPair = @"
<w:t>CONDUCTOR</w:t></w:r><w:r w:rsidR="0058678D"><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorHAnsi"/><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve"> DE CAMIÓN</w:t>
"@
if ($cam.IndexOf($cargoPair) -ge 0) {
  $cam = $cam.Replace($cargoPair, "<w:t>cargo_empleado</w:t></w:r><w:r w:rsidR=`"0058678D`"><w:rPr><w:rFonts w:asciiTheme=`"minorHAnsi`" w:hAnsiTheme=`"minorHAnsi`" w:cstheme=`"minorHAnsi`"/><w:b/><w:bCs/></w:rPr><w:t xml:space=`"preserve`"></w:t>")
} else {
  throw "No se encontro cargo CONDUCTOR DE CAMION (objeto)"
}

$salWords = "un millón setecientos cincuenta mil novecientos cinco pesos "
if ($cam.IndexOf($salWords) -lt 0) { throw "No se encontro salario en letras camiones" }
$cam = $cam.Replace($salWords, "salario_letras ")
Replace-Once ([ref]$cam) "<w:t>(`$1.750.905)</w:t>" "<w:t>(salario)</w:t>" "cam salario numero"

Replace-Once ([ref]$cam) "<w:t>cuatro (4) meses</w:t>" "<w:t>duracion_contrato</w:t>" "cam duracion"

$bankCam = "mediante consignación bancaria, los días quince"
if ($cam.IndexOf($bankCam) -ge 0) {
  $cam = $cam.Replace(
    $bankCam,
    "mediante consignación bancaria en la cuenta de ahorros banco_cuenta_bancaria número cuenta_bancaria, los días quince"
  )
}

# Firma trabajador: si hay un C.C. vacio, deja cc. para injectCedulaAfterCcRuns
if ($cam.Contains("<w:t>C.C. </w:t>") -eq $false -and $cam.Contains("<w:t xml:space=`"preserve`">C.C. </w:t>") -eq $false) {
  $anchor = "<w:t>EL TRABAJADOR</w:t></w:r><w:r w:rsidR=`"00224F40`" w:rsidRPr=`"0058678D`"><w:rPr><w:rFonts w:asciiTheme=`"minorHAnsi`" w:hAnsiTheme=`"minorHAnsi`" w:cstheme=`"minorHAnsi`"/></w:rPr><w:t xml:space=`"preserve`"> </w:t></w:r></w:p>"
  if ($cam.Contains($anchor)) {
    $insert = $anchor.Replace("</w:p>", "</w:p><w:p><w:r><w:t>nombre_empleado</w:t></w:r></w:p><w:p><w:r><w:t>Cc. </w:t></w:r></w:p>")
    $cam = $cam.Replace($anchor, $insert)
  }
}

Assert-Contains $cam "nombre_empleado" "cam nombre_empleado"
Assert-Contains $cam "cedula_empleado" "cam cedula_empleado"
Assert-Contains $cam "cargo_empleado" "cam cargo_empleado"
Assert-Contains $cam "salario_letras" "cam salario_letras"
Assert-Contains $cam "duracion_contrato" "cam duracion_contrato"
Set-EntryText $dstCam $cam
Write-Output "OK camiones -> $dstCam"
Write-Output "Marcadores inyectados."
