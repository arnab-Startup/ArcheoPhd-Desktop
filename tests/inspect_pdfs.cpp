#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <windows.h>
#include <wincrypt.h>

std::string compute_sha256(const std::vector<char>& data) {
    HCRYPTPROV hProv = 0;
    HCRYPTHASH hHash = 0;
    BYTE rgbHash[32];
    DWORD cbHash = 32;
    CHAR rgbDigits[] = "0123456789abcdef";
    std::string result = "";

    if (CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        if (CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) {
            if (CryptHashData(hHash, (const BYTE*)data.data(), data.size(), 0)) {
                if (CryptGetHashParam(hHash, HP_HASHVAL, rgbHash, &cbHash, 0)) {
                    for (DWORD i = 0; i < cbHash; i++) {
                        result += rgbDigits[rgbHash[i] >> 4];
                        result += rgbDigits[rgbHash[i] & 0xf];
                    }
                }
            }
            CryptDestroyHash(hHash);
        }
        CryptReleaseContext(hProv, 0);
    }
    return result;
}

void inspect_pdf(const std::string& path, const std::string& filename) {
    std::ifstream file(path, std::ios::binary | std::ios::ate);
    if (!file.is_open()) {
        std::cout << "[ERROR] Could not open " << filename << std::endl;
        return;
    }
    std::streamsize size = file.tellg();
    file.seekg(0, std::ios::beg);

    std::vector<char> buffer(size);
    if (!file.read(buffer.data(), size)) {
        std::cout << "[ERROR] Could not read " << filename << std::endl;
        return;
    }

    std::string sha = compute_sha256(buffer);

    // Scan for PDF structure
    std::string str(buffer.begin(), buffer.begin() + (size > 1000000 ? 1000000 : size));
    
    // Check header
    std::string header = (size >= 8) ? std::string(buffer.begin(), buffer.begin() + 8) : "";
    
    // Count objects, pages, font, stream
    size_t obj_count = 0;
    size_t stream_count = 0;
    size_t font_count = 0;
    size_t page_count = 0;
    
    // Fast scan over whole buffer
    const std::string whole(buffer.data(), buffer.size());
    size_t pos = 0;
    while ((pos = whole.find("endobj", pos)) != std::string::npos) { obj_count++; pos += 6; }
    pos = 0;
    while ((pos = whole.find("/Page\n", pos)) != std::string::npos || (pos = whole.find("/Page ", pos)) != std::string::npos || (pos = whole.find("/Page/", pos)) != std::string::npos) {
        page_count++;
        pos += 6;
    }
    pos = 0;
    while ((pos = whole.find("stream", pos)) != std::string::npos) { stream_count++; pos += 6; }
    pos = 0;
    while ((pos = whole.find("/Font", pos)) != std::string::npos) { font_count++; pos += 5; }

    // Check for readable text strings / keywords
    std::vector<std::string> keywords = {"Harappa", "Mohenjo", "Taxila", "Indus", "Neolithic", "BCE", "BC", "Stratum", "pottery", "excavation", "carbon", "dating"};
    std::vector<std::string> found_keywords;
    for (const auto& kw : keywords) {
        if (whole.find(kw) != std::string::npos) {
            found_keywords.push_back(kw);
        }
    }

    std::cout << "============================================================" << std::endl;
    std::cout << "FILE: " << filename << std::endl;
    std::cout << "Size: " << (double)size / (1024 * 1024) << " MB (" << size << " bytes)" << std::endl;
    std::cout << "SHA-256: " << sha << std::endl;
    std::cout << "Header: " << header << std::endl;
    std::cout << "PDF Objects: " << obj_count << " | Streams: " << stream_count << " | Font refs: " << font_count << std::endl;
    std::cout << "Direct text streams detected: " << (font_count > 0 ? "YES (Searchable text / fonts present)" : "Scanned bitmaps") << std::endl;
    std::cout << "Archaeological keywords found in text layer: ";
    if (found_keywords.empty()) {
        std::cout << "None (PDF streams are compressed with FlateDecode or raster images)";
    } else {
        for (const auto& kw : found_keywords) std::cout << "[" << kw << "] ";
    }
    std::cout << std::endl;
}

int main() {
    std::cout << "ArchaeoPhD Phase 0 — Real PDF Corpus Inspector" << std::endl;
    std::cout << "Analyzing 4 Real Archaeology Publications in testdocs/..." << std::endl << std::endl;

    std::string base = "../testdocs/";
    std::vector<std::string> files = {
        "A history of Indian archaeology from the beginning to 1947 (Dilip K. Chakrabarti).pdf",
        "Archaeology Principal And Methods (K.Rajan).pdf",
        "DOC-20241118-WA0013. (1).pdf",
        "studies in indian archaeology by Sankalia.pdf"
    };

    for (const auto& f : files) {
        inspect_pdf(base + f, f);
    }

    return 0;
}
