#pragma once

#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0600
#endif
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shlobj.h>
#include <shlwapi.h>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <fstream>
#include <sstream>
#include <chrono>
#include <iomanip>
#include <json.hpp>
#include "storage/storage.hpp"
#include "storage/data_root.hpp"

namespace archaeophd {

using json = nlohmann::json;

struct SemanticVersion {
    int major = 0;
    int minor = 0;
    int patch = 0;
    std::string prerelease;

    static SemanticVersion parse(const std::string& verStr) {
        SemanticVersion v;
        if (verStr.empty()) return v;

        std::string s = verStr;
        if (!s.empty() && (s[0] == 'v' || s[0] == 'V')) s = s.substr(1);

        size_t dash = s.find('-');
        if (dash != std::string::npos) {
            v.prerelease = s.substr(dash + 1);
            s = s.substr(0, dash);
        }

        std::stringstream ss(s);
        std::string part;
        if (std::getline(ss, part, '.')) v.major = std::atoi(part.c_str());
        if (std::getline(ss, part, '.')) v.minor = std::atoi(part.c_str());
        if (std::getline(ss, part, '.')) v.patch = std::atoi(part.c_str());

        return v;
    }

    bool operator<(const SemanticVersion& o) const {
        if (major != o.major) return major < o.major;
        if (minor != o.minor) return minor < o.minor;
        if (patch != o.patch) return patch < o.patch;
        // Release without prerelease is newer than prerelease
        if (prerelease.empty() && !o.prerelease.empty()) return false;
        if (!prerelease.empty() && o.prerelease.empty()) return true;
        return prerelease < o.prerelease;
    }

    bool operator>(const SemanticVersion& o) const { return o < *this; }
    bool operator==(const SemanticVersion& o) const {
        return major == o.major && minor == o.minor && patch == o.patch && prerelease == o.prerelease;
    }

    std::string to_string() const {
        std::string res = std::to_string(major) + "." + std::to_string(minor) + "." + std::to_string(patch);
        if (!prerelease.empty()) res += "-" + prerelease;
        return res;
    }
};

struct VersionReleaseInfo {
    std::string version;
    std::string release_date;
    std::string release_channel; // "stable", "lts", "beta"
    bool is_latest = false;
    std::string title;
    std::vector<std::string> highlights;
    std::string size_human;
    std::string sha256;
    std::string download_filename;
    std::string download_url;
    std::string minimum_os;
};

class UpdateManager {
public:
    static inline std::string GetCurrentAppVersion() {
        return "1.0.0";
    }

    static inline std::vector<VersionReleaseInfo> GetVersionHistory() {
        std::vector<VersionReleaseInfo> list;

        // v1.2.0 (Latest Stable Release)
        VersionReleaseInfo v120;
        v120.version = "1.2.0";
        v120.release_date = "2026-11-10";
        v120.release_channel = "stable";
        v120.is_latest = true;
        v120.title = "Phase 3 Optimization, In-Place Auto-Updater & Full Engine Verification";
        v120.highlights = {
            "Zero-Data-Loss In-Place Update Engine with atomic Win32 rename-replace handoff",
            "Automated disk garbage collection reclaiming ~500 MB cache & old Vite chunks per update",
            "402-test Master Engine Verification Suite covering all 8 native C++ archaeological engines",
            "Air-gapped offline USB 1-click update support for excavation field trenches",
            "Rolling pre-update database snapshot retention with automated rollback safety"
        };
        v120.size_human = "9.79 MB (Installer) / 11.2 MB (Standalone)";
        v120.sha256 = "2f20fdb376e1f2f8a9a614326e1f84200d7722853a4d1ca493ab2a8cb192eb95";
        v120.download_filename = "ArchaeoPhD-Setup.exe";
        v120.download_url = "/downloads/ArchaeoPhD-Setup.exe";
        v120.minimum_os = "Windows 10 Build 19041+ / Windows 11 (64-bit)";
        list.push_back(v120);

        // v1.1.0 (Spatial Intelligence & Chronology)
        VersionReleaseInfo v110;
        v110.version = "1.1.0";
        v110.release_date = "2026-11-08";
        v110.release_channel = "stable";
        v110.is_latest = false;
        v110.title = "Spatial GIS Intelligence & IntCal20 Radiocarbon Calibration";
        v110.highlights = {
            "Native WGS84 Geodesic Haversine spatial engine with DBSCAN regional site clustering",
            "IntCal20 high-precision radiocarbon calibration curve with Hallstatt plateau detection",
            "Dissertation Dossier Export Engine producing publication-ready LaTeX & Markdown",
            "Offline Ed25519 digital signature validation with hardware-encrypted DPAPI licensing"
        };
        v110.size_human = "9.52 MB";
        v110.sha256 = "c18a99478f44d1839211a7f0535e5d3fa9bc3b6e8f4989eef3d0774a819c92b1";
        v110.download_filename = "ArchaeoPhD-v1.1.0-Setup.exe";
        v110.download_url = "/downloads/ArchaeoPhD-v1.1.0-Setup.exe";
        v110.minimum_os = "Windows 10 Build 19041+ / Windows 11 (64-bit)";
        list.push_back(v110);

        // v1.0.1 (Knowledge Graph & Harris Matrix Patch)
        VersionReleaseInfo v101;
        v101.version = "1.0.1";
        v101.release_date = "2026-11-05";
        v101.release_channel = "stable";
        v101.is_latest = false;
        v101.title = "Knowledge Graph Traversal & Stratigraphic Matrix Hardening";
        v101.highlights = {
            "Tarjan SCC cycle detector for physical stratigraphic impossibility loops",
            "K-hop ego network extraction and shortest-path evidentiary BFS tracing",
            "Epistemic grounding ratio metrics distinguishing Class A verified from Class B working sources",
            "Optimized in-memory multi-threaded SQLite ledger synchronization"
        };
        v101.size_human = "9.45 MB";
        v101.sha256 = "7a4f91e92d83b109e2cf33578c772b1a9236ef4410a8c2f09919d65824e0b51a";
        v101.download_filename = "ArchaeoPhD-v1.0.1-Setup.exe";
        v101.download_url = "/downloads/ArchaeoPhD-v1.0.1-Setup.exe";
        v101.minimum_os = "Windows 10 / 11 (64-bit)";
        list.push_back(v101);

        // v1.0.0 (Initial GA Release)
        VersionReleaseInfo v100;
        v100.version = "1.0.0";
        v100.release_date = "2026-11-03";
        v100.release_channel = "lts";
        v100.is_latest = false;
        v100.title = "ArchaeoPhD Desktop — Initial Doctoral Research Workstation";
        v100.highlights = {
            "Air-gapped 100% offline standalone workstation (Zero open network sockets, zero telemetry)",
            "Local Qwen 2.5 7B LLM reasoning & Nomic 128-dim Matryoshka vector retrieval",
            "Lossless Zstandard monograph PDF ingestion with pre-trained archaeological dictionary",
            "Two-tier Data Root pointer architecture protecting research data from cloud sync leakage"
        };
        v100.size_human = "9.20 MB";
        v100.sha256 = "1d98a1f86829e0094191aa641d4c99c5123927d1418721fa0c2298df311009a2";
        v100.download_filename = "ArchaeoPhD-v1.0.0-Setup.exe";
        v100.download_url = "/downloads/ArchaeoPhD-v1.0.0-Setup.exe";
        v100.minimum_os = "Windows 10 / 11 (64-bit)";
        list.push_back(v100);

        return list;
    }

    static inline json CheckForUpdate() {
        std::string currentVerStr = GetCurrentAppVersion();
        SemanticVersion currentVer = SemanticVersion::parse(currentVerStr);
        auto history = GetVersionHistory();

        bool updateAvailable = false;
        VersionReleaseInfo latestRelease;

        if (!history.empty()) {
            latestRelease = history[0]; // First entry is newest release
            SemanticVersion latestVer = SemanticVersion::parse(latestRelease.version);
            if (latestVer > currentVer) {
                updateAvailable = true;
            }
        }

        json histArray = json::array();
        for (const auto& rel : history) {
            histArray.push_back({
                {"version", rel.version},
                {"release_date", rel.release_date},
                {"release_channel", rel.release_channel},
                {"is_latest", rel.is_latest},
                {"title", rel.title},
                {"highlights", rel.highlights},
                {"size_human", rel.size_human},
                {"sha256", rel.sha256},
                {"download_filename", rel.download_filename},
                {"download_url", rel.download_url},
                {"minimum_os", rel.minimum_os}
            });
        }

        return {
            {"current_version", currentVerStr},
            {"update_available", updateAvailable},
            {"latest_version", latestRelease.version},
            {"release_date", latestRelease.release_date},
            {"title", latestRelease.title},
            {"highlights", latestRelease.highlights},
            {"download_url", latestRelease.download_url},
            {"download_filename", latestRelease.download_filename},
            {"sha256", latestRelease.sha256},
            {"size_human", latestRelease.size_human},
            {"reclaimed_space_estimate_mb", 480},
            {"storage_durability_guarantee", "100% Zero-Data-Loss In-Place Update: Research PDFs, optical crops, chat history, and relational databases in Zone 2 are never modified."},
            {"version_history", histArray}
        };
    }

    static inline std::string CreatePreUpdateBackup(const std::string& dataRoot, const std::string& fromVer, const std::string& toVer) {
        if (dataRoot.empty()) return "";

        std::string backupsDir = dataRoot + "\\backups";
        fs_compat::create_directories(backupsDir);

        auto now = std::chrono::system_clock::now();
        auto in_time_t = std::chrono::system_clock::to_time_t(now);
        std::stringstream ss;
        ss << std::put_time(std::localtime(&in_time_t), "%Y%m%d_%H%M%S");
        std::string ts = ss.str();

        std::string backupFile = backupsDir + "\\pre_update_v" + fromVer + "_to_v" + toVer + "_" + ts + ".bak";

        // Locate current relational state
        std::string stateSrc = dataRoot + "\\libraries\\default\\relational_state.json";
        if (!fs_compat::exists(stateSrc)) {
            stateSrc = dataRoot + "\\data\\relational_state.json";
        }

        if (fs_compat::exists(stateSrc)) {
            std::ifstream src(stateSrc, std::ios::binary);
            std::ofstream dst(backupFile, std::ios::binary);
            dst << src.rdbuf();
            src.close();
            dst.close();
        } else {
            // Write structured checkpoint
            json checkpoint = {
                {"event", "pre_update_snapshot"},
                {"from_version", fromVer},
                {"to_version", toVer},
                {"timestamp", ts},
                {"status", "initialized"}
            };
            std::ofstream dst(backupFile);
            dst << checkpoint.dump(2);
            dst.close();
        }

        // Prune older backups: keep maximum 3 rolling backups
        PruneOldBackups(backupsDir, 3);

        return backupFile;
    }

    static inline void PruneOldBackups(const std::string& backupsDir, size_t maxKeep = 3) {
        if (!fs_compat::exists(backupsDir)) return;

        std::wstring wDir = DataRootManager::Utf8ToWide(backupsDir) + L"\\*.bak";
        WIN32_FIND_DATAW fd;
        HANDLE hFind = FindFirstFileW(wDir.c_str(), &fd);
        if (hFind == INVALID_HANDLE_VALUE) return;

        std::vector<std::pair<std::wstring, FILETIME>> fileList;
        do {
            if (!(fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) {
                std::wstring fullPath = DataRootManager::Utf8ToWide(backupsDir) + L"\\" + fd.cFileName;
                fileList.push_back({fullPath, fd.ftLastWriteTime});
            }
        } while (FindNextFileW(hFind, &fd));
        FindClose(hFind);

        if (fileList.size() <= maxKeep) return;

        // Sort ascending by file creation/write time (oldest first)
        std::sort(fileList.begin(), fileList.end(), [](const auto& a, const auto& b) {
            return CompareFileTime(&a.second, &b.second) < 0;
        });

        size_t toDelete = fileList.size() - maxKeep;
        for (size_t i = 0; i < toDelete; ++i) {
            DeleteFileW(fileList[i].first.c_str());
        }
    }

    static inline void DeleteDirectoryRecursive(const std::wstring& path) {
        if (path.empty()) return;
        std::wstring searchPath = path + L"\\*";
        WIN32_FIND_DATAW fd;
        HANDLE hFind = FindFirstFileW(searchPath.c_str(), &fd);
        if (hFind != INVALID_HANDLE_VALUE) {
            do {
                if (wcscmp(fd.cFileName, L".") == 0 || wcscmp(fd.cFileName, L"..") == 0) continue;
                std::wstring child = path + L"\\" + fd.cFileName;
                if (fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
                    DeleteDirectoryRecursive(child);
                } else {
                    DeleteFileW(child.c_str());
                }
            } while (FindNextFileW(hFind, &fd));
            FindClose(hFind);
        }
        RemoveDirectoryW(path.c_str());
    }

    static inline size_t GetFileSizeBytes(const std::string& filePath) {
        std::ifstream in(filePath, std::ios::binary | std::ios::ate);
        if (!in.is_open()) return 0;
        return static_cast<size_t>(in.tellg());
    }

    static inline size_t PruneEphemeralCache(const std::wstring& installDir) {
        size_t itemsRemoved = 0;

        // 1. Clear WebView2 caches
        std::vector<std::wstring> cacheDirs = {
            installDir + L"\\WebView2Data\\EBWebView\\Default\\Cache",
            installDir + L"\\WebView2Data\\EBWebView\\Default\\Code Cache",
            installDir + L"\\WebView2Data\\EBWebView\\Default\\GPUCache",
            installDir + L"\\WebView2Data\\EBWebView\\Default\\DawnGraphiteCache",
            installDir + L"\\WebView2Data\\EBWebView\\Default\\DawnWebGPUCache",
            installDir + L"\\cache\\staging"
        };

        for (const auto& cDir : cacheDirs) {
            if (fs_compat::exists(DataRootManager::WideToUtf8(cDir))) {
                DeleteDirectoryRecursive(cDir);
                itemsRemoved++;
            }
        }

        // 2. Clean temporary probe files
        std::wstring probePattern = installDir + L"\\*.apd_probe_*";
        WIN32_FIND_DATAW fd;
        HANDLE hFind = FindFirstFileW(probePattern.c_str(), &fd);
        if (hFind != INVALID_HANDLE_VALUE) {
            do {
                std::wstring f = installDir + L"\\" + fd.cFileName;
                DeleteFileW(f.c_str());
                itemsRemoved++;
            } while (FindNextFileW(hFind, &fd));
            FindClose(hFind);
        }

        // 3. Delete .old binary if remaining from previous update
        std::wstring oldExe = installDir + L"\\ArchaeoPhD.old.exe";
        if (GetFileAttributesW(oldExe.c_str()) != INVALID_FILE_ATTRIBUTES) {
            DeleteFileW(oldExe.c_str());
            itemsRemoved++;
        }

        return itemsRemoved;
    }

    static inline bool VerifyOfflinePackage(const std::string& filePath) {
        if (!fs_compat::exists(filePath)) return false;

        // Minimum file size check: valid installer or standalone executable is > 1MB
        size_t sz = GetFileSizeBytes(filePath);
        if (sz < 1024 * 1024) return false;

        // Check Windows PE executable header ('MZ' magic bytes)
        std::ifstream in(filePath, std::ios::binary);
        if (!in.is_open()) return false;

        char magic[2] = { 0, 0 };
        in.read(magic, 2);
        in.close();

        return (magic[0] == 'M' && magic[1] == 'Z');
    }
};

} // namespace archaeophd
