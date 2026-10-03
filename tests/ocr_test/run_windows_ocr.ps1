param(
    [string]$ImagePath = "desktop/tests/ocr_test/sankalia_chap-052.png"
)

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

$fullPath = [System.IO.Path]::GetFullPath($ImagePath)
Write-Host "Opening image: $fullPath"

$fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($fullPath)
$file = Await $fileTask ([Windows.Storage.StorageFile])

$streamTask = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
$stream = Await $streamTask ([Windows.Storage.Streams.IRandomAccessStream])

$decoderTask = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
$decoder = Await $decoderTask ([Windows.Graphics.Imaging.BitmapDecoder])

$bitmapTask = $decoder.GetSoftwareBitmapAsync()
$bitmap = Await $bitmapTask ([Windows.Graphics.Imaging.SoftwareBitmap])

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) {
    $lang = [Windows.Globalization.Language]::new("en-US")
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
}

Write-Host "Running OCR using Windows Native OCR Engine (Language: $($engine.RecognizerLanguage.LanguageTag))..."
$ocrTask = $engine.RecognizeAsync($bitmap)
$ocrResult = Await $ocrTask ([Windows.Media.Ocr.OcrResult])

Write-Host "============================================================"
Write-Host "  OCR TEXT OUTPUT: $($file.Name)"
Write-Host "============================================================"
Write-Host $ocrResult.Text
Write-Host "============================================================"
Write-Host "Total lines recognized: $($ocrResult.Lines.Count)"

$outTxt = [System.IO.Path]::ChangeExtension($fullPath, ".txt")
[System.IO.File]::WriteAllText($outTxt, $ocrResult.Text)
Write-Host "Saved recognized text to: $outTxt"
