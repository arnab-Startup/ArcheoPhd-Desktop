#include <windows.h>
#include <gdiplus.h>
#include <iostream>

int main() {
    Gdiplus::GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    Gdiplus::Status st = Gdiplus::GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);
    std::cout << "GDI+ Startup Status: " << (st == Gdiplus::Ok ? "OK" : "FAILED") << std::endl;
    Gdiplus::GdiplusShutdown(gdiplusToken);
    return 0;
}
