#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include <fstream>
#include "core/update_manager.hpp"

using namespace archaeophd;

int main() {
    std::cout << "================================================================================\n";
    std::cout << "  ArchaeoPhD Desktop — Update Manager & Version Persistence Verification Suite   \n";
    std::cout << "================================================================================\n";

    // 1. Semantic Version Parsing & Comparison
    {
        SemanticVersion v100 = SemanticVersion::parse("1.0.0");
        SemanticVersion v110 = SemanticVersion::parse("1.1.0");
        SemanticVersion v120 = SemanticVersion::parse("1.2.0");
        SemanticVersion v101 = SemanticVersion::parse("1.0.1");
        SemanticVersion vBeta = SemanticVersion::parse("1.2.0-beta");

        assert(v100 < v110);
        assert(v110 < v120);
        assert(v101 > v100);
        assert(v101 < v110);
        assert(vBeta < v120);
        assert(v100 == SemanticVersion::parse("v1.0.0"));
        std::cout << "  [PASS] Semantic version parsing & comparison verified\n";
    }

    // 2. Version History Registry
    {
        auto history = UpdateManager::GetVersionHistory();
        assert(!history.empty());
        assert(history.size() >= 4);
        assert(history[0].version == "1.2.0");
        assert(history[0].is_latest == true);
        assert(history.back().version == "1.0.0");
        assert(!history[0].sha256.empty());
        assert(!history[0].highlights.empty());
        std::cout << "  [PASS] Full version history registry (v1.0.0 .. v1.2.0) verified\n";
    }

    // 3. Check for Updates Logic
    {
        json chk = UpdateManager::CheckForUpdate();
        assert(chk["current_version"] == "1.0.0");
        assert(chk["latest_version"] == "1.2.0");
        assert(chk["update_available"] == true);
        assert(chk["reclaimed_space_estimate_mb"] == 480);
        assert(chk.contains("version_history"));
        assert(chk["version_history"].is_array() && chk["version_history"].size() >= 4);
        std::cout << "  [PASS] Check for updates detection (v1.0.0 -> v1.2.0) verified\n";
    }

    // 4. Pre-Update Backup & Rolling Pruning (Max 3 Backups)
    {
        std::string test_data_root = "test_run_update_data_root";
        fs_compat::cleanup_tmp_files(test_data_root);
        fs_compat::create_directories(test_data_root + "\\libraries\\default");
        fs_compat::create_directories(test_data_root + "\\backups");

        // Write sample state
        std::string sampleState = test_data_root + "\\libraries\\default\\relational_state.json";
        {
            std::ofstream out(sampleState);
            out << "{\"schema_version\": 1, \"sample_count\": 42}";
        }

        // Create 4 consecutive backups
        std::string b1 = UpdateManager::CreatePreUpdateBackup(test_data_root, "1.0.0", "1.0.1");
        Sleep(50);
        std::string b2 = UpdateManager::CreatePreUpdateBackup(test_data_root, "1.0.1", "1.1.0");
        Sleep(50);
        std::string b3 = UpdateManager::CreatePreUpdateBackup(test_data_root, "1.1.0", "1.2.0");
        Sleep(50);
        std::string b4 = UpdateManager::CreatePreUpdateBackup(test_data_root, "1.2.0", "1.2.1");

        assert(!b4.empty());
        assert(fs_compat::exists(b4));

        // Verify rolling pruning: backups directory should contain at most 3 backups
        size_t backupCount = 0;
        std::wstring wDir = DataRootManager::Utf8ToWide(test_data_root + "\\backups") + L"\\*.bak";
        WIN32_FIND_DATAW fd;
        HANDLE hFind = FindFirstFileW(wDir.c_str(), &fd);
        if (hFind != INVALID_HANDLE_VALUE) {
            do {
                if (!(fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) backupCount++;
            } while (FindNextFileW(hFind, &fd));
            FindClose(hFind);
        }

        assert(backupCount <= 3);
        std::cout << "  [PASS] Pre-update safety snapshot & rolling pruning (max 3) verified\n";

        // Cleanup
        UpdateManager::DeleteDirectoryRecursive(DataRootManager::Utf8ToWide(test_data_root));
    }

    // 5. Offline Package Verification (PE MZ Header Guardrail)
    {
        // Valid MZ mock binary (> 1 MB with MZ signature)
        std::string validPkg = "test_mock_valid_package.exe";
        {
            std::ofstream out(validPkg, std::ios::binary);
            char mz[2] = {'M', 'Z'};
            out.write(mz, 2);
            std::vector<char> padding(1024 * 1024 + 100, 0);
            out.write(padding.data(), padding.size());
        }

        // Invalid package (no MZ signature)
        std::string invalidPkg = "test_mock_invalid_package.bin";
        {
            std::ofstream out(invalidPkg, std::ios::binary);
            std::vector<char> padding(1024 * 1024 + 100, 0);
            out.write(padding.data(), padding.size());
        }

        // Tiny package (< 1 MB)
        std::string tinyPkg = "test_mock_tiny.exe";
        {
            std::ofstream out(tinyPkg, std::ios::binary);
            char mz[2] = {'M', 'Z'};
            out.write(mz, 2);
        }

        assert(UpdateManager::VerifyOfflinePackage(validPkg) == true);
        assert(UpdateManager::VerifyOfflinePackage(invalidPkg) == false);
        assert(UpdateManager::VerifyOfflinePackage(tinyPkg) == false);
        assert(UpdateManager::VerifyOfflinePackage("non_existent_file.exe") == false);

        DeleteFileA(validPkg.c_str());
        DeleteFileA(invalidPkg.c_str());
        DeleteFileA(tinyPkg.c_str());
        std::cout << "  [PASS] Offline package MZ header & size verification verified\n";
    }

    // 6. Ephemeral Cache Pruning
    {
        std::wstring testInstallDir = L"test_mock_install_dir";
        CreateDirectoryW(testInstallDir.c_str(), nullptr);
        std::wstring testCacheDir = testInstallDir + L"\\WebView2Data\\EBWebView\\Default\\Cache";
        fs_compat::create_directories(DataRootManager::WideToUtf8(testCacheDir));

        std::string mockCacheFile = DataRootManager::WideToUtf8(testCacheDir) + "\\data_0";
        {
            std::ofstream out(mockCacheFile);
            out << "cache payload";
        }

        size_t pruned = UpdateManager::PruneEphemeralCache(testInstallDir);
        assert(pruned >= 1);
        assert(!fs_compat::exists(mockCacheFile));

        UpdateManager::DeleteDirectoryRecursive(testInstallDir);
        std::cout << "  [PASS] Ephemeral cache pruning (WebView2 Cache & shaders) verified\n";
    }

    std::cout << "\n================================================================================\n";
    std::cout << "  ALL UPDATE MANAGER VERIFICATION TESTS PASSED (100% SUCCESS)\n";
    std::cout << "================================================================================\n";
    return 0;
}
