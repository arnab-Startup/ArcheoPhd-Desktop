# render_pages.ps1 - Render exactly the 50 specified benchmark pages to PNG

$poppler = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin\pdftoppm.exe"
$outDir = "desktop/tests/ocr_benchmark_50/images"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$pdfSankalia = "testdocs/studies in indian archaeology by Sankalia.pdf"
$pdfRajan = "testdocs/Archaeology Principal And Methods (K.Rajan).pdf"
$pdfChakrabarti = "testdocs/A history of Indian archaeology from the beginning to 1947 (Dilip K. Chakrabarti).pdf"

# Sankalia: 20 core (52-71) + 5 random (25, 104, 150, 210, 280)
$sankaliaPages = (52..71) + @(25, 104, 150, 210, 280)
Write-Host "Rendering $($sankaliaPages.Count) pages from Sankalia..."
foreach ($p in $sankaliaPages) {
    $prefix = "$outDir/sankalia_p$($p.ToString('D3'))"
    & $poppler -png -f $p -l $p -r 200 $pdfSankalia $prefix
}

# Rajan: 10 core (16-25) + 5 random (50, 110, 175, 240, 310)
$rajanPages = (16..25) + @(50, 110, 175, 240, 310)
Write-Host "Rendering $($rajanPages.Count) pages from Rajan..."
foreach ($p in $rajanPages) {
    $prefix = "$outDir/rajan_p$($p.ToString('D3'))"
    & $poppler -png -f $p -l $p -r 200 $pdfRajan $prefix
}

# Chakrabarti: 7 core (15-21) + 3 random (65, 130, 215)
$chakPages = (15..21) + @(65, 130, 215)
Write-Host "Rendering $($chakPages.Count) pages from Chakrabarti..."
foreach ($p in $chakPages) {
    $prefix = "$outDir/chakrabarti_p$($p.ToString('D3'))"
    & $poppler -png -f $p -l $p -r 200 $pdfChakrabarti $prefix
}

$rendered = Get-ChildItem -Path $outDir -Filter "*.png"
Write-Host "Rendering complete. Total PNG images created: $($rendered.Count)"
