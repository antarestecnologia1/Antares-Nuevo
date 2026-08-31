# Codificación y tildes (UTF-8)

Guía para que las tildes, las eñes y los símbolos (`→`, `…`, `·`) dejen de
romperse. **Todo el repositorio es UTF-8 sin BOM.**

## Por qué se rompían

El código fuente estaba bien. El daño lo introducían las herramientas usadas
para editarlo desde Windows PowerShell 5.1, donde:

- la codepage ANSI es **Windows-1252**,
- la del terminal es **IBM-850**,
- y `Get-Content` / `Set-Content` / `Out-File` / `>` **no usan UTF-8 por defecto**.

Cualquier script que lea y reescriba un archivo con esos cmdlets convierte
`Gestión` en `Gesti?n` o en `GestiÃ³n`. Como la conversión ocurre al guardar, el
daño queda dentro del archivo y se propaga en el siguiente commit.

### Los tres daños típicos

| Síntoma en el archivo | Nombre | Causa | ¿Recuperable? |
| --- | --- | --- | --- |
| `GestiÃ³n`, `TÃ©rmino`, `â€œ` | mojibake ANSI | UTF-8 leído como Windows-1252 | Sí, automático |
| `cach├⌐`, `ΓÇö`, `┬╖` | mojibake OEM | UTF-8 leído como cp850/cp437, típico de capturar salida de consola a un archivo | Sí, automático |
| `Gesti?n`, `f?sica` | pérdida a `?` | texto guardado en una codificación que no soporta el carácter | No: solo desde git |
| `Gesti\uFFFDn`, `???` | pérdida a U+FFFD | bytes inválidos reemplazados al decodificar | No: solo desde git |

La diferencia importa: el mojibake es reversible byte a byte, pero un `?` es
**indistinguible** de un `?` legítimo (`moduleId?: string`, `a ? b : c`), así que
recuperarlo exige comparar contra una versión sana de git.

## Reglas

1. **Nunca** edites archivos del repo con `Get-Content`/`Set-Content`/`Out-File`/`>`.
   Usa el editor, o `[System.IO.File]::ReadAllBytes` / `WriteAllBytes` desde .NET.
2. Los scripts `.ps1` se escriben en **ASCII puro**. PowerShell 5.1 lee un `.ps1`
   sin BOM como Windows-1252, así que un literal con tilde dentro del script se
   corrompe al ejecutarlo. Si necesitas un carácter no ASCII, usa `[char]0xF3`.
3. Los `.ps1` se guardan con BOM (lo aplica `.editorconfig`), como segunda red.
4. No escribas scripts desechables que reescriban archivos completos. Si hace
   falta, que lean y escriban **bytes**, no texto.

## Herramientas

Node (multiplataforma, es lo que corre en CI). Detecta todo; repara el mojibake
ANSI, el BOM y el UTF-16:

```bash
npm run encoding:scan     # reporte
npm run encoding:check    # falla si hay problemas (incluido en npm run verify)
```

Windows (no requiere Node). Es la herramienta completa: además repara el
mojibake OEM, porque distinguirlo de un diagrama hecho con caracteres de caja
necesita revisar los cambios uno por uno:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\encoding-tool.ps1            # reporte
powershell -ExecutionPolicy Bypass -File scripts\encoding-tool.ps1 -Mode Fix  # repara
```

Para inspeccionar un caso puntual y ver los code points exactos:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\inspect-line.ps1 -File ruta\archivo.js -Line 14140
```

Recuperar tildes ya perdidas (`?` o U+FFFD) usando git como referencia:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\restore-accents.ps1          # dry-run
powershell -ExecutionPolicy Bypass -File scripts\restore-accents.ps1 -Apply
```

Restaura en dos pasadas: primero líneas completas que coinciden con la
referencia salvo por los caracteres dañados, después palabras sueltas donde el
`?` está entre dos letras. Lo ambiguo no se toca: se reporta para revisión.

### Falsos positivos

Un archivo puede contener secuencias tipo `Ã©` **a propósito** — por ejemplo
`repairUtf8Mojibake()` en `modules/domain/company-documents.domain.js`, cuya
tabla de reemplazos dejaría de funcionar si se "reparara". Esos archivos llevan
el marcador `encoding-tool:allow-mojibake` y se reportan como `INTENTIONAL`,
nunca se reescriben.

## Terminal en UTF-8

Para que el propio terminal no confunda el diagnóstico:

```powershell
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
```

Ya viene aplicado en el perfil de terminal de `.vscode/settings.json`.
