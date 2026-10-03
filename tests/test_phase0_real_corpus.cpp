#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <windows.h>
#include <wincrypt.h>

struct PdfBenchmarkResult {
    std::string filename;
    uint64_t original_bytes = 0;
    uint64_t compressed_bytes = 0;
    double compression_ratio_pct = 0.0;
    std::string original_sha256;
    std::string reconstructed_sha256;
    bool sha256_verified = false;
    double compression_duration_ms = 0.0;
    double decompression_duration_ms = 0.0;
    double throughput_mb_s = 0.0;
    std::string document_nature;
    int object_count = 0;
    int stream_count = 0;
    bool has_font_layer = false;
};

std::string compute_sha256_file(const std::string& filepath) {
    std::ifstream file(filepath, std::ios::binary);
    if (!file.is_open()) return "";

    HCRYPTPROV hProv = 0;
    HCRYPTHASH hHash = 0;
    BYTE rgbHash[32];
    DWORD cbHash = 32;
    CHAR rgbDigits[] = "0123456789abcdef";
    std::string result = "";

    if (CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        if (CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) {
            char buffer[65536];
            while (file.read(buffer, sizeof(buffer)) || file.gcount() > 0) {
                CryptHashData(hHash, (const BYTE*)buffer, (DWORD)file.gcount(), 0);
            }
            if (CryptGetHashParam(hHash, HP_HASHVAL, rgbHash, &cbHash, 0)) {
                for (DWORD i = 0; i < cbHash; i++) {
                    result += rgbDigits[rgbHash[i] >> 4];
                    result += rgbDigits[rgbHash[i] & 0xf];
                }
            }
            CryptDestroyHash(hHash);
        }
        CryptReleaseContext(hProv, 0);
    }
    return result;
}

uint64_t get_file_size(const std::string& path) {
    WIN32_FILE_ATTRIBUTE_DATA fad;
    if (GetFileAttributesExA(path.c_str(), GetFileExInfoStandard, &fad)) {
        LARGE_INTEGER size;
        size.HighPart = fad.nFileSizeHigh;
        size.LowPart = fad.nFileSizeLow;
        return size.QuadPart;
    }
    return 0;
}

PdfBenchmarkResult benchmark_pdf(const std::string& filepath, const std::string& filename, int index, int total) {
    PdfBenchmarkResult res;
    res.filename = filename;
    res.original_bytes = get_file_size(filepath);

    std::cout << "[" << index << "/" << total << "] Processing: " << filename << std::endl;
    std::cout << "    Original Size: " << std::fixed << std::setprecision(2) << (double)res.original_bytes / (1024 * 1024) << " MB (" << res.original_bytes << " bytes)" << std::endl;

    // 1. Calculate Original SHA-256
    auto t_start = std::chrono::high_resolution_clock::now();
    res.original_sha256 = compute_sha256_file(filepath);
    auto t_hash = std::chrono::high_resolution_clock::now();
    std::cout << "    Original SHA-256: " << res.original_sha256 << std::endl;

    // 2. Scan internal PDF stream structure
    {
        std::ifstream f(filepath, std::ios::binary);
        std::string buffer((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
        size_t pos = 0;
        while ((pos = buffer.find("endobj", pos)) != std::string::npos) { res.object_count++; pos += 6; }
        pos = 0;
        while ((pos = buffer.find("stream", pos)) != std::string::npos) { res.stream_count++; pos += 6; }
        res.has_font_layer = (buffer.find("/Font") != std::string::npos);

        if (res.has_font_layer && res.stream_count < 150) {
            res.document_nature = "Born-Digital PDF (Vector text + layout streams)";
        } else if (res.has_font_layer) {
            res.document_nature = "OCR-Annotated Academic Monograph (Double-layer)";
        } else {
            res.document_nature = "Historical Photographic Scan (Raster bitmap pages)";
        }
    }
    std::cout << "    Document Type:    " << res.document_nature << std::endl;
    std::cout << "    Internal Objects: " << res.object_count << " objects, " << res.stream_count << " streams" << std::endl;

    // 3. Compress with Zstandard per-file pipeline
    std::string archive_path = "tests/bin/doc_" + std::to_string(index) + ".tar.zst";
    std::string extract_dir = "tests/bin/reconstructed_" + std::to_string(index);
    CreateDirectoryA(extract_dir.c_str(), NULL);

    // Build tar command
    std::string comp_cmd = "tar --zstd -cf \"" + archive_path + "\" -C \"" + filepath.substr(0, filepath.find_last_of("\\/")) + "\" \"" + filename + "\" >nul 2>&1";
    
    auto t_c1 = std::chrono::high_resolution_clock::now();
    system(comp_cmd.c_str());
    auto t_c2 = std::chrono::high_resolution_clock::now();

    res.compressed_bytes = get_file_size(archive_path);
    res.compression_duration_ms = std::chrono::duration<double, std::milli>(t_c2 - t_c1).count();
    res.compression_ratio_pct = (res.original_bytes > 0) ? (100.0 * (1.0 - (double)res.compressed_bytes / (double)res.original_bytes)) : 0.0;
    res.throughput_mb_s = (res.compression_duration_ms > 0) ? (((double)res.original_bytes / (1024 * 1024)) / (res.compression_duration_ms / 1000.0)) : 0.0;

    std::cout << "    Compressed (.zst):" << std::fixed << std::setprecision(2) << (double)res.compressed_bytes / (1024 * 1024) << " MB (Reduction: " << res.compression_ratio_pct << "%)" << std::endl;
    std::cout << "    Comp. Speed:      " << std::fixed << std::setprecision(1) << res.throughput_mb_s << " MB/s (" << res.compression_duration_ms << " ms)" << std::endl;

    // 4. Decompress back to original
    std::string decomp_cmd = "tar --zstd -xf \"" + archive_path + "\" -C \"" + extract_dir + "\" >nul 2>&1";
    auto t_d1 = std::chrono::high_resolution_clock::now();
    system(decomp_cmd.c_str());
    auto t_d2 = std::chrono::high_resolution_clock::now();
    res.decompression_duration_ms = std::chrono::duration<double, std::milli>(t_d2 - t_d1).count();

    // 5. Verify reconstructed SHA-256 byte-for-byte
    std::string decomp_file = extract_dir + "/" + filename;
    res.reconstructed_sha256 = compute_sha256_file(decomp_file);
    res.sha256_verified = (res.original_sha256 == res.reconstructed_sha256 && !res.original_sha256.empty());

    std::cout << "    Decomp. SHA-256:  " << res.reconstructed_sha256 << std::endl;
    std::cout << "    Lossless Check:   " << (res.sha256_verified ? "VERIFIED (100% BYTE-FOR-BYTE IDENTICAL)" : "FAILED (HASH MISMATCH)") << std::endl;
    std::cout << std::endl;

    // Clean up temporary files
    DeleteFileA(archive_path.c_str());
    DeleteFileA(decomp_file.c_str());
    RemoveDirectoryA(extract_dir.c_str());

    return res;
}

int main() {
    std::cout << "============================================================" << std::endl;
    std::cout << "  ArchaeoPhD Phase 0 — Real PDF Validation Spike Suite      " << std::endl;
    std::cout << "  Ingestion, Lossless Compression & Verification on 4 PDFs  " << std::endl;
    std::cout << "============================================================" << std::endl << std::endl;

    CreateDirectoryA("tests/bin", NULL);

    std::string base_dir = "../testdocs/";
    std::vector<std::string> test_files = {
        "A history of Indian archaeology from the beginning to 1947 (Dilip K. Chakrabarti).pdf",
        "Archaeology Principal And Methods (K.Rajan).pdf",
        "DOC-20241118-WA0013. (1).pdf",
        "studies in indian archaeology by Sankalia.pdf"
    };

    std::vector<PdfBenchmarkResult> results;
    uint64_t total_orig = 0;
    uint64_t total_comp = 0;
    bool all_verified = true;

    for (size_t i = 0; i < test_files.size(); i++) {
        auto r = benchmark_pdf(base_dir + test_files[i], test_files[i], static_cast<int>(i + 1), static_cast<int>(test_files.size()));
        results.push_back(r);
        total_orig += r.original_bytes;
        total_comp += r.compressed_bytes;
        if (!r.sha256_verified) all_verified = false;
    }

    std::cout << "============================================================" << std::endl;
    std::cout << "  PHASE 0 REAL CORPUS EVALUATION SUMMARY                   " << std::endl;
    std::cout << "============================================================" << std::endl;
    std::cout << "  Total Publications Tested:    " << results.size() << std::endl;
    std::cout << "  Total Corpus Data Volume:     " << std::fixed << std::setprecision(2) << (double)total_orig / (1024 * 1024) << " MB (" << total_orig << " bytes)" << std::endl;
    std::cout << "  Total Compressed Volume:      " << std::fixed << std::setprecision(2) << (double)total_comp / (1024 * 1024) << " MB (" << total_comp << " bytes)" << std::endl;
    double overall_ratio = (total_orig > 0) ? (100.0 * (1.0 - (double)total_comp / (double)total_orig)) : 0.0;
    std::cout << "  Net Corpus Reduction:         " << std::fixed << std::setprecision(2) << overall_ratio << "%" << std::endl;
    std::cout << "  Byte-for-Byte SHA-256 Match:  " << (all_verified ? "100.0% (PASSED — ZERO DATA LOSS)" : "FAILED") << std::endl;
    std::cout << "------------------------------------------------------------" << std::endl;
    std::cout << "  CORPUS COMPOSITION & ARCHAEOLOGICAL BREAKDOWN:" << std::endl;
    for (const auto& r : results) {
        std::cout << "  * " << r.filename.substr(0, 42) << "... | " 
                  << std::setw(8) << (double)r.original_bytes / (1024*1024) << " MB | "
                  << r.document_nature << std::endl;
    }
    std::cout << "============================================================" << std::endl;

    return all_verified ? 0 : 1;
}
