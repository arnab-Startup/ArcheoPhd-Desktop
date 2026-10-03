#include <windows.h>
#include <gdiplus.h>
#include <iostream>
#include <vector>
#include <cmath>
#include <string>
#include <algorithm>

// Get encoder CLSID for PNG
int GetEncoderClsid(const WCHAR* format, CLSID* pClsid) {
    UINT num = 0;          // number of image encoders
    UINT size = 0;         // size of the image encoder array in bytes

    Gdiplus::GetImageEncodersSize(&num, &size);
    if (size == 0) return -1;

    Gdiplus::ImageCodecInfo* pImageCodecInfo = (Gdiplus::ImageCodecInfo*)(malloc(size));
    if (pImageCodecInfo == NULL) return -1;

    Gdiplus::GetImageEncoders(num, size, pImageCodecInfo);
    for (UINT j = 0; j < num; ++j) {
        if (wcscmp(pImageCodecInfo[j].MimeType, format) == 0) {
            *pClsid = pImageCodecInfo[j].Clsid;
            free(pImageCodecInfo);
            return j;
        }
    }
    free(pImageCodecInfo);
    return -1;
}

// Compute Otsu threshold on grayscale buffer
int ComputeOtsuThreshold(const std::vector<unsigned char>& gray, int totalPixels) {
    int hist[256] = {0};
    for (int i = 0; i < totalPixels; ++i) {
        hist[gray[i]]++;
    }

    double sum = 0;
    for (int i = 0; i < 256; ++i) sum += i * hist[i];

    double sumB = 0;
    int wB = 0;
    int wF = 0;
    double varMax = 0;
    int threshold = 128;

    for (int t = 0; t < 256; ++t) {
        wB += hist[t];
        if (wB == 0) continue;
        wF = totalPixels - wB;
        if (wF == 0) break;

        sumB += (double)(t * hist[t]);
        double mB = sumB / wB;
        double mF = (sum - sumB) / wF;

        double varBetween = (double)wB * (double)wF * (mB - mF) * (mB - mF);
        if (varBetween > varMax) {
            varMax = varBetween;
            threshold = t;
        }
    }
    return threshold;
}

// Apply Sauvola Adaptive Thresholding (tailored for bleed-through and non-uniform lighting)
void ApplySauvolaThreshold(const std::vector<unsigned char>& src, std::vector<unsigned char>& dst, int w, int h, int winSize = 25, double k = 0.25) {
    dst.resize(w * h);
    int r = winSize / 2;

    // Integral images for fast local mean and variance
    std::vector<double> integralImg((w + 1) * (h + 1), 0.0);
    std::vector<double> integralSq((w + 1) * (h + 1), 0.0);

    for (int y = 0; y < h; ++y) {
        double rowSum = 0;
        double rowSqSum = 0;
        for (int x = 0; x < w; ++x) {
            unsigned char val = src[y * w + x];
            rowSum += val;
            rowSqSum += (double)val * val;

            integralImg[(y + 1) * (w + 1) + (x + 1)] = integralImg[y * (w + 1) + (x + 1)] + rowSum;
            integralSq[(y + 1) * (w + 1) + (x + 1)] = integralSq[y * (w + 1) + (x + 1)] + rowSqSum;
        }
    }

    for (int y = 0; y < h; ++y) {
        int y1 = (std::max)(0, y - r);
        int y2 = (std::min)(h - 1, y + r);
        for (int x = 0; x < w; ++x) {
            int x1 = (std::max)(0, x - r);
            int x2 = (std::min)(w - 1, x + r);

            int count = (x2 - x1 + 1) * (y2 - y1 + 1);

            double sum = integralImg[(y2 + 1) * (w + 1) + (x2 + 1)]
                       - integralImg[y1 * (w + 1) + (x2 + 1)]
                       - integralImg[(y2 + 1) * (w + 1) + x1]
                       + integralImg[y1 * (w + 1) + x1];

            double sqSum = integralSq[(y2 + 1) * (w + 1) + (x2 + 1)]
                         - integralSq[y1 * (w + 1) + (x2 + 1)]
                         - integralSq[(y2 + 1) * (w + 1) + x1]
                         + integralSq[y1 * (w + 1) + x1];

            double mean = sum / count;
            double variance = (sqSum / count) - (mean * mean);
            double stdDev = (variance > 0) ? std::sqrt(variance) : 0;

            // Sauvola formula: T = mean * (1 + k * (stdDev / 128 - 1))
            double T = mean * (1.0 + k * ((stdDev / 128.0) - 1.0));

            dst[y * w + x] = (src[y * w + x] < T) ? 0 : 255;
        }
    }
}

void ProcessImage(const std::wstring& inPath, const std::wstring& outOtsuPath, const std::wstring& outSauvolaPath) {
    Gdiplus::Bitmap bmp(inPath.c_str());
    if (bmp.GetLastStatus() != Gdiplus::Ok) {
        std::wcerr << L"[ERROR] Failed to load image: " << inPath << std::endl;
        return;
    }

    int width = bmp.GetWidth();
    int height = bmp.GetHeight();
    std::wcout << L"Processing " << inPath << L" (" << width << L"x" << height << L")..." << std::endl;

    Gdiplus::Rect rect(0, 0, width, height);
    Gdiplus::BitmapData bmpData;
    bmp.LockBits(&rect, Gdiplus::ImageLockModeRead, PixelFormat32bppARGB, &bmpData);

    std::vector<unsigned char> gray(width * height);
    unsigned char* pPixels = (unsigned char*)bmpData.Scan0;

    for (int y = 0; y < height; ++y) {
        unsigned char* row = pPixels + y * bmpData.Stride;
        for (int x = 0; x < width; ++x) {
            unsigned char b = row[x * 4 + 0];
            unsigned char g = row[x * 4 + 1];
            unsigned char r = row[x * 4 + 2];
            gray[y * width + x] = (unsigned char)(0.299 * r + 0.587 * g + 0.114 * b);
        }
    }
    bmp.UnlockBits(&bmpData);

    // 1. Otsu Threshold
    int otsuT = ComputeOtsuThreshold(gray, width * height);
    std::cout << "  * Computed Global Otsu Threshold: " << otsuT << std::endl;

    Gdiplus::Bitmap otsuBmp(width, height, PixelFormat32bppARGB);
    Gdiplus::BitmapData otsuData;
    otsuBmp.LockBits(&rect, Gdiplus::ImageLockModeWrite, PixelFormat32bppARGB, &otsuData);
    unsigned char* pOtsu = (unsigned char*)otsuData.Scan0;

    for (int y = 0; y < height; ++y) {
        unsigned char* row = pOtsu + y * otsuData.Stride;
        for (int x = 0; x < width; ++x) {
            unsigned char val = (gray[y * width + x] < otsuT) ? 0 : 255;
            row[x * 4 + 0] = val;
            row[x * 4 + 1] = val;
            row[x * 4 + 2] = val;
            row[x * 4 + 3] = 255;
        }
    }
    otsuBmp.UnlockBits(&otsuData);

    // 2. Sauvola Adaptive Threshold
    std::vector<unsigned char> sauvola(width * height);
    ApplySauvolaThreshold(gray, sauvola, width, height, 31, 0.28);
    std::cout << "  * Computed Sauvola Adaptive Thresholding (win=31, k=0.28)" << std::endl;

    Gdiplus::Bitmap sauvolaBmp(width, height, PixelFormat32bppARGB);
    Gdiplus::BitmapData sauvolaData;
    sauvolaBmp.LockBits(&rect, Gdiplus::ImageLockModeWrite, PixelFormat32bppARGB, &sauvolaData);
    unsigned char* pSauvola = (unsigned char*)sauvolaData.Scan0;

    for (int y = 0; y < height; ++y) {
        unsigned char* row = pSauvola + y * sauvolaData.Stride;
        for (int x = 0; x < width; ++x) {
            unsigned char val = sauvola[y * width + x];
            row[x * 4 + 0] = val;
            row[x * 4 + 1] = val;
            row[x * 4 + 2] = val;
            row[x * 4 + 3] = 255;
        }
    }
    sauvolaBmp.UnlockBits(&sauvolaData);

    CLSID pngClsid;
    GetEncoderClsid(L"image/png", &pngClsid);
    otsuBmp.Save(outOtsuPath.c_str(), &pngClsid, NULL);
    sauvolaBmp.Save(outSauvolaPath.c_str(), &pngClsid, NULL);
    std::wcout << L"  [SAVED] " << outOtsuPath << std::endl;
    std::wcout << L"  [SAVED] " << outSauvolaPath << std::endl << std::endl;
}

int main() {
    Gdiplus::GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    Gdiplus::GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);

    std::cout << "============================================================" << std::endl;
    std::cout << "  ArchaeoPhD Document Image Preprocessing Benchmark         " << std::endl;
    std::cout << "  Global Otsu vs. Sauvola Adaptive Bleed-Through Filter     " << std::endl;
    std::cout << "============================================================" << std::endl << std::endl;

    std::vector<std::pair<std::wstring, std::wstring>> pages = {
        {L"tests/ocr_test/sankalia_chap-052.png", L"tests/ocr_test/sankalia_chap-052"},
        {L"tests/ocr_test/sankalia_chap-053.png", L"tests/ocr_test/sankalia_chap-053"},
        {L"tests/ocr_test/sankalia_page-025.png", L"tests/ocr_test/sankalia_page-025"}
    };

    for (const auto& p : pages) {
        ProcessImage(p.first, p.second + L"_otsu.png", p.second + L"_sauvola.png");
    }

    Gdiplus::GdiplusShutdown(gdiplusToken);
    return 0;
}
