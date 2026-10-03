# run_windows_ocr_batch.ps1 - Run Windows Native OCR across all 50 benchmark images

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
})[0]

function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime] | Out-Null

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) {
    $lang = [Windows.Globalization.Language]::new("en-US")
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
}
Write-Host "Windows OCR Engine initialized (Language: $($engine.RecognizerLanguage.LanguageTag))"

$imgDir = "desktop/tests/ocr_benchmark_50/images"
$outDir = "desktop/tests/ocr_benchmark_50/results_windows_ocr"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$images = Get-ChildItem -Path $imgDir -Filter "*.png" | Sort-Object Name
Write-Host "Processing $($images.Count) images with Windows Native OCR..."

$count = 0
$sw = [System.Diagnostics.Stopwatch]::StartNew()

foreach ($img in $images) {
    $count++
    $base = [System.IO.Path]::GetFileNameWithoutExtension($img.Name)
    $outPath = Join-Path $outDir "$base.txt"

    $fullPath = [System.IO.Path]::GetFullPath($img.FullName)
    $fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($fullPath)
    $file = Await $fileTask ([Windows.Storage.StorageFile])

    $streamTask = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = Await $streamTask ([Windows.Storage.Streams.IRandomAccessStream])

    $decoderTask = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = Await $decoderTask ([Windows.Graphics.Imaging.BitmapDecoder])

    $bitmapTask = $decoder.GetSoftwareBitmapAsync()
    $bitmap = Await $bitmapTask ([Windows.Graphics.Imaging.SoftwareBitmap])

    $ocrTask = $engine.RecognizeAsync($bitmap)
    $ocrResult = Await $ocrTask ([Windows.Media.Ocr.OcrResult])

    [System.IO.File]::WriteAllText($outPath, $ocrResult.Text)
    Write-Host "[$count/$($images.Count)] Processed $base -> $($ocrResult.Lines.Count) lines"
}

$sw.Stop()
Write-Host "Windows Native OCR complete in $($sw.Elapsed.TotalSeconds)s. Output saved to $outDir"
