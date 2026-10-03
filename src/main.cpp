#ifndef UNICODE
#define UNICODE
#endif
#ifndef _UNICODE
#define _UNICODE
#endif
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <shlwapi.h>
#include <string>
#include <iostream>
#include <vector>

// Include local EventToken.h and WebView2.h
#include <EventToken.h>
#include <WebView2.h>

// Include Native C++ Engine headers (Zero HTTP / Zero Socket dependencies)
#include <json.hpp>
#include <memory>
#include "core/models.hpp"
#include "storage/storage.hpp"
#include "analysis/vector_index.hpp"
#include "analysis/contradictions.hpp"
#include "analysis/thesis_audit.hpp"
#include "core/system_inspector.hpp"
#include "validation/benchmark_seed.hpp"
#include "storage/data_root.hpp"
#include "extraction/document_extractor.hpp"

using json = nlohmann::json;

// Native Engine Singletons
static std::unique_ptr<archaeophd::NativeStorage> g_storage;
static std::unique_ptr<archaeophd::NativeContradictionEngine> g_contradictions;
static std::unique_ptr<archaeophd::NativeThesisAuditor> g_thesisAuditor;
static std::string g_currentDataRoot;

inline bool InitNativeEngineWithDataRoot(const std::string& dataRoot) {
    if (dataRoot.empty()) return false;
    std::string libDir = dataRoot + "\\libraries\\default";
    std::string legacyDir = dataRoot + "\\data";
    std::string actualStorageDir = libDir;
    if (!archaeophd::fs_compat::exists(libDir) && archaeophd::fs_compat::exists(legacyDir)) {
        actualStorageDir = legacyDir;
    } else {
        archaeophd::fs_compat::create_directories(actualStorageDir);
    }

    g_storage = std::unique_ptr<archaeophd::NativeStorage>(new archaeophd::NativeStorage(actualStorageDir));
    g_contradictions = std::unique_ptr<archaeophd::NativeContradictionEngine>(new archaeophd::NativeContradictionEngine(*g_storage));
    g_thesisAuditor = std::unique_ptr<archaeophd::NativeThesisAuditor>(new archaeophd::NativeThesisAuditor(*g_storage, *g_contradictions));

    if (g_storage->count_sites() == 0) {
        archaeophd::seed_benchmark_corpus(*g_storage, "default");
    }
    g_currentDataRoot = dataRoot;
    return true;
}

// Typedef for the loader export
typedef HRESULT (STDAPICALLTYPE *CreateCoreWebView2EnvironmentWithOptionsFn)(
    PCWSTR browserExecutableFolder,
    PCWSTR userDataFolder,
    ICoreWebView2EnvironmentOptions* environmentOptions,
    ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler* environmentCreatedHandler
);

// Window constants
static const wchar_t* CLASS_NAME = L"ArchaeoPhDNativeWindow";
static const wchar_t* WINDOW_TITLE = L"ArchaeoPhD — Offline Research Workstation";
static const int DEFAULT_WIDTH = 1366;
static const int DEFAULT_HEIGHT = 868;
static const int MIN_WIDTH = 1024;
static const int MIN_HEIGHT = 680;

#define IDR_APP_PAYLOAD 101

// Global state
HWND g_hWnd = nullptr;
ICoreWebView2Controller* g_controller = nullptr;
ICoreWebView2* g_webview = nullptr;
static std::wstring g_appDistFolder;

// Forward declarations
class ControllerCompletedHandler;
class EnvironmentCompletedHandler;
class WebMessageReceivedHandler;

// Helper to convert Windows backslash path to file:// URL
std::wstring PathToFileUri(const std::wstring& path) {
    std::wstring uri = L"file:///";
    for (wchar_t c : path) {
        if (c == L'\\') {
            uri += L'/';
        } else {
            uri += c;
        }
    }
    return uri;
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Embedded Payload Extraction (Single-File Standalone Support)
// -----------------------------------------------------------------------------
bool EnsureRuntimeExtracted(std::wstring& outDistFolder, std::wstring& outLoaderPath) {
    wchar_t exePathBuffer[MAX_PATH];
    GetModuleFileNameW(nullptr, exePathBuffer, MAX_PATH);
    std::wstring exeDir = exePathBuffer;
    size_t lastSlash = exeDir.find_last_of(L"\\/");
    if (lastSlash != std::wstring::npos) {
        exeDir = exeDir.substr(0, lastSlash);
    }

    // 1. Fast path: check if dist/index.html and WebView2Loader.dll already exist beside the EXE
    std::wstring localDist = exeDir + L"\\dist";
    std::wstring localLoader = exeDir + L"\\WebView2Loader.dll";
    if (GetFileAttributesW((localDist + L"\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES &&
        GetFileAttributesW(localLoader.c_str()) != INVALID_FILE_ATTRIBUTES) {
        outDistFolder = localDist;
        outLoaderPath = localLoader;
        return true;
    }

    // 2. Persistent AppData location for extracted standalone payload
    wchar_t localAppData[MAX_PATH];
    std::wstring baseDir;
    if (GetEnvironmentVariableW(L"LOCALAPPDATA", localAppData, MAX_PATH) > 0) {
        baseDir = std::wstring(localAppData) + L"\\ArchaeoPhD";
    } else {
        baseDir = exeDir;
    }

    std::wstring appPayloadDir = baseDir + L"\\app";
    std::wstring targetDist = appPayloadDir + L"\\dist";
    std::wstring targetLoader = appPayloadDir + L"\\WebView2Loader.dll";

    // If already extracted from previous run and intact, use it immediately
    if (GetFileAttributesW((targetDist + L"\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES &&
        GetFileAttributesW(targetLoader.c_str()) != INVALID_FILE_ATTRIBUTES) {
        outDistFolder = targetDist;
        outLoaderPath = targetLoader;
        return true;
    }

    // 3. Extract embedded payload from resource
    HRSRC hRes = FindResourceW(nullptr, MAKEINTRESOURCEW(IDR_APP_PAYLOAD), (LPCWSTR)RT_RCDATA);
    if (!hRes) {
        outDistFolder = localDist;
        outLoaderPath = localLoader;
        return false;
    }

    HGLOBAL hData = LoadResource(nullptr, hRes);
    if (!hData) return false;
    DWORD resSize = SizeofResource(nullptr, hRes);
    void* resData = LockResource(hData);
    if (!resData || resSize == 0) return false;

    CreateDirectoryW(baseDir.c_str(), nullptr);
    CreateDirectoryW(appPayloadDir.c_str(), nullptr);

    wchar_t tempPath[MAX_PATH];
    GetTempPathW(MAX_PATH, tempPath);
    std::wstring tempZip = std::wstring(tempPath) + L"archaeophd_payload.zip";

    HANDLE hFile = CreateFileW(tempZip.c_str(), GENERIC_WRITE, 0, nullptr, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, nullptr);
    if (hFile != INVALID_HANDLE_VALUE) {
        DWORD bytesWritten = 0;
        WriteFile(hFile, resData, resSize, &bytesWritten, nullptr);
        CloseHandle(hFile);

        // Try extraction with tar.exe first
        std::wstring tarCmd = L"tar.exe -xf \"" + tempZip + L"\" -C \"" + appPayloadDir + L"\"";
        STARTUPINFOW si = { sizeof(si) };
        si.dwFlags = STARTF_USESHOWWINDOW;
        si.wShowWindow = SW_HIDE;
        PROCESS_INFORMATION pi = { 0 };

        std::vector<wchar_t> cmdBuf(tarCmd.begin(), tarCmd.end());
        cmdBuf.push_back(L'\0');

        bool extracted = false;
        if (CreateProcessW(nullptr, cmdBuf.data(), nullptr, nullptr, FALSE, CREATE_NO_WINDOW, nullptr, nullptr, &si, &pi)) {
            WaitForSingleObject(pi.hProcess, 10000);
            DWORD ec = 0;
            GetExitCodeProcess(pi.hProcess, &ec);
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
            if (ec == 0 && GetFileAttributesW((targetDist + L"\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES) {
                extracted = true;
            }
        }

        // If tar.exe failed or dist\index.html not created, fallback to PowerShell Expand-Archive
        if (!extracted) {
            std::wstring psCmd = L"powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -Command \"Expand-Archive -Path '" + tempZip + L"' -DestinationPath '" + appPayloadDir + L"' -Force\"";
            std::vector<wchar_t> psBuf(psCmd.begin(), psCmd.end());
            psBuf.push_back(L'\0');
            STARTUPINFOW psSi = { sizeof(psSi) };
            psSi.dwFlags = STARTF_USESHOWWINDOW;
            psSi.wShowWindow = SW_HIDE;
            PROCESS_INFORMATION psPi = { 0 };
            if (CreateProcessW(nullptr, psBuf.data(), nullptr, nullptr, FALSE, CREATE_NO_WINDOW, nullptr, nullptr, &psSi, &psPi)) {
                WaitForSingleObject(psPi.hProcess, 15000);
                CloseHandle(psPi.hProcess);
                CloseHandle(psPi.hThread);
            }
        }

        DeleteFileW(tempZip.c_str());
    }

    if (GetFileAttributesW((targetDist + L"\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES) {
        outDistFolder = targetDist;
        outLoaderPath = targetLoader;
        return true;
    }

    outDistFolder = localDist;
    outLoaderPath = localLoader;
    return false;
}

// -----------------------------------------------------------------------------
// Navigation Completed Handler (Auto-recovery / Fallback)
// -----------------------------------------------------------------------------
class NavigationCompletedHandler : public ICoreWebView2NavigationCompletedEventHandler {
    LONG m_refCount;
    HWND m_hWnd;
    std::wstring m_fallbackUrl;
    bool m_attemptedFallback;

public:
    NavigationCompletedHandler(HWND hWnd, const std::wstring& fallbackUrl)
        : m_refCount(1), m_hWnd(hWnd), m_fallbackUrl(fallbackUrl), m_attemptedFallback(false) {}

    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
        if (!ppvObject) return E_POINTER;
        if (riid == IID_IUnknown || riid == IID_ICoreWebView2NavigationCompletedEventHandler) {
            *ppvObject = static_cast<ICoreWebView2NavigationCompletedEventHandler*>(this);
            AddRef();
            return S_OK;
        }
        *ppvObject = nullptr;
        return E_NOINTERFACE;
    }

    ULONG STDMETHODCALLTYPE AddRef() override {
        return InterlockedIncrement(&m_refCount);
    }

    ULONG STDMETHODCALLTYPE Release() override {
        ULONG count = InterlockedDecrement(&m_refCount);
        if (count == 0) delete this;
        return count;
    }

    HRESULT STDMETHODCALLTYPE Invoke(ICoreWebView2* sender, ICoreWebView2NavigationCompletedEventArgs* args) override {
        if (!args || !sender) return S_OK;
        BOOL isSuccess = FALSE;
        args->get_IsSuccess(&isSuccess);
        if (!isSuccess && !m_attemptedFallback) {
            m_attemptedFallback = true;
            if (!m_fallbackUrl.empty()) {
                sender->Navigate(m_fallbackUrl.c_str());
            } else {
                const wchar_t* fallbackHtml = 
                    L"<!DOCTYPE html><html><head><meta charset='utf-8'>"
                    L"<style>body{background:#080b12;color:#f1f5f9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}"
                    L".box{text-align:center;padding:2rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;max-width:500px;}"
                    L"h1{color:#e2b35a;margin-bottom:0.5rem;}p{color:#94a3b8;font-size:0.9rem;}"
                    L"button{background:#e2b35a;color:#080b12;border:none;padding:10px 20px;border-radius:6px;font-weight:bold;cursor:pointer;margin-top:1rem;}"
                    L"</style></head><body><div class='box'><h1>ArchaeoPhD Workstation</h1>"
                    L"<p>Offline research engine initialized. Click below to load interface.</p>"
                    L"<button onclick='location.reload()'>Load Interface</button></div></body></html>";
                sender->NavigateToString(fallbackHtml);
            }
        }
        return S_OK;
    }
};

// -----------------------------------------------------------------------------
// Native C++ Engine In-Memory IPC Dispatcher (Zero HTTP / Zero Sockets)
// -----------------------------------------------------------------------------
inline std::string DispatchNativeMessage(const std::string& inputJson) {
    json req;
    try {
        req = json::parse(inputJson);
    } catch (...) {
        return "{\"error\": \"Invalid JSON payload\"}";
    }

    std::string reqId = req.value("id", "");
    std::string action = req.value("action", "");
    std::string projectId = req.value("projectId", "default");
    json payload = req.value("payload", json::object());

    json res;
    res["id"] = reqId;

    // Data Root & System Endpoints (Can be called even before g_storage is initialized)
    try {
        if (action == "get_data_root_status") {
            auto st = archaeophd::DataRootManager::GetStatus();
            res["result"] = {
                {"configured", st.configured},
                {"data_root", st.data_root},
                {"is_missing", st.is_missing},
                {"cloud_service", st.cloud_service},
                {"default_path", st.default_path},
                {"models_dir", st.models_dir},
                {"libraries_dir", st.libraries_dir},
                {"logs_dir", st.logs_dir}
            };
            return res.dump();
        } else if (action == "browse_folder") {
            std::string initial = payload.value("initial_path", "");
            if (initial.empty()) {
                auto st = archaeophd::DataRootManager::GetStatus();
                initial = st.configured ? st.data_root : st.default_path;
            }
            std::string picked;
            bool ok = archaeophd::DataRootManager::BrowseForFolder(g_hWnd, initial, picked);
            if (ok) {
                std::string cloud = archaeophd::DataRootManager::DetectCloudSyncService(archaeophd::DataRootManager::Utf8ToWide(picked));
                res["result"] = {
                    {"cancelled", false},
                    {"path", picked},
                    {"cloud_service", cloud}
                };
            } else {
                res["result"] = {
                    {"cancelled", true},
                    {"path", ""}
                };
            }
            return res.dump();
        } else if (action == "check_cloud_sync") {
            std::string p = payload.value("path", "");
            std::string cloud = archaeophd::DataRootManager::DetectCloudSyncService(archaeophd::DataRootManager::Utf8ToWide(p));
            res["result"] = {
                {"path", p},
                {"cloud_service", cloud}
            };
            return res.dump();
        } else if (action == "set_data_root") {
            std::string newPath = payload.value("data_root", "");
            std::string err;
            bool ok = archaeophd::DataRootManager::SaveDataRoot(newPath, err);
            if (!ok) {
                res["error"] = err.empty() ? "Failed to set Data Root" : err;
                return res.dump();
            }
            InitNativeEngineWithDataRoot(newPath);
            std::string cloud = archaeophd::DataRootManager::DetectCloudSyncService(archaeophd::DataRootManager::Utf8ToWide(newPath));
            res["result"] = {
                {"status", "success"},
                {"data_root", newPath},
                {"cloud_service", cloud}
            };
            return res.dump();
        } else if (action == "reconnect_data_root") {
            auto st = archaeophd::DataRootManager::GetStatus();
            if (st.configured && !st.is_missing) {
                InitNativeEngineWithDataRoot(st.data_root);
                res["result"] = {
                    {"connected", true},
                    {"data_root", st.data_root}
                };
            } else {
                res["result"] = {
                    {"connected", false},
                    {"data_root", st.data_root},
                    {"is_missing", true}
                };
            }
            return res.dump();
        } else if (action == "ping") {
            auto st = archaeophd::DataRootManager::GetStatus();
            res["result"] = {
                {"status", "online"},
                {"engine", "ArchaeoPhD Native C++ Workstation (Pure In-Memory IPC, Zero HTTP)"},
                {"zero_cloud_leakage", true},
                {"data_root_configured", st.configured},
                {"data_root", st.data_root},
                {"data_root_missing", st.is_missing}
            };
            return res.dump();
        }
    } catch (const std::exception& e) {
        res["error"] = e.what();
        return res.dump();
    }

    // Engine entities require initialized storage
    if (!g_storage || !g_contradictions || !g_thesisAuditor) {
        res["error"] = "Data Root is not configured or engine is initializing";
        return res.dump();
    }

    try {
        if (action == "get_contradictions") {
            auto conflicts = g_contradictions->run_all(projectId);
            json arr = json::array();
            for (const auto& c : conflicts) arr.push_back(c);
            res["result"] = arr;
        } else if (action == "get_thesis_audit") {
            res["result"] = g_thesisAuditor->run_audit(projectId);
        } else if (action == "get_sites") {
            auto sites = g_storage->get_sites(projectId);
            json arr = json::array();
            for (const auto& s : sites) arr.push_back(s);
            res["result"] = arr;
        } else if (action == "get_strata") {
            auto strata = g_storage->get_strata(projectId);
            json arr = json::array();
            for (const auto& s : strata) arr.push_back(s);
            res["result"] = arr;
        } else if (action == "get_artifacts") {
            auto artifacts = g_storage->get_artifacts(projectId);
            json arr = json::array();
            for (const auto& a : artifacts) arr.push_back(a);
            res["result"] = arr;
        } else if (action == "get_claims") {
            auto claims = g_storage->get_claims(projectId);
            json arr = json::array();
            for (const auto& c : claims) arr.push_back(c);
            res["result"] = arr;
        } else if (action == "verify_claim_grounding") {
            std::string claimId = payload.value("claim_id", "");
            std::string correctedText = payload.value("corrected_text", "");
            std::string act = payload.value("action", "correct");
            auto claims = g_storage->get_claims(projectId);
            bool found = false;
            for (auto& c : claims) {
                if (c.id == claimId) {
                    if (act == "correct" && !correctedText.empty()) {
                        c.claim_text = correctedText;
                    }
                    c.verification_status = "VERIFIED";
                    c.anomaly_flag = false;
                    c.anomaly_reason = "";
                    g_storage->put_claim(c);
                    found = true;
                    break;
                }
            }
            res["result"] = {{"success", found}};
        } else if (action == "get_evidence") {
            auto evidence = g_storage->get_evidence(projectId);
            json arr = json::array();
            for (const auto& e : evidence) arr.push_back(e);
            res["result"] = arr;
        } else if (action == "get_sources") {
            auto sources = g_storage->get_sources(projectId);
            json arr = json::array();
            for (const auto& s : sources) arr.push_back(s);
            res["result"] = arr;
        } else if (action == "get_notes") {
            auto notes = g_storage->get_notes(projectId);
            json arr = json::array();
            for (const auto& n : notes) arr.push_back(n);
            res["result"] = arr;
        } else if (action == "get_hardware_info") {
            res["result"] = archaeophd::NativeSystemInspector::get_hardware_info();
        } else if (action == "get_storage_breakdown") {
            res["result"] = archaeophd::NativeSystemInspector::get_storage_breakdown(g_currentDataRoot.empty() ? "data" : g_currentDataRoot);
        } else if (action == "load_benchmark") {
            archaeophd::seed_benchmark_corpus(*g_storage, projectId);
            res["result"] = {{"status", "success"}, {"message", "Benchmark corpus loaded into native storage."}};
        } else if (action == "run_document_extraction" || action == "get_extraction_report" || action == "run_phase0_validation") {
            auto report = archaeophd::DocumentExtractor::RunExtractionEvaluation();
            json r;
            r["timestamp"] = report.timestamp;
            r["documents_processed"] = report.documents_processed;
            r["total_words_analyzed"] = report.total_words_analyzed;
            r["overall_precision"] = report.overall_precision;
            r["overall_recall"] = report.overall_recall;
            r["hallucination_rate"] = report.hallucination_rate;
            r["bce_ce_chronological_fidelity"] = report.bce_ce_chronological_fidelity;
            r["compression_sha256_lossless"] = report.compression_sha256_lossless;
            r["avg_compression_ratio"] = report.avg_compression_ratio;
            r["type1_date_clashes_detected"] = report.type1_date_clashes_detected;
            r["type2_interpretive_conflicts_flagged"] = report.type2_interpretive_conflicts_flagged;
            r["type3_stratigraphic_cycles_caught"] = report.type3_stratigraphic_cycles_caught;
            r["review_guardrail_enforced"] = report.review_guardrail_enforced;
            r["minimum_precision_threshold"] = report.minimum_precision_threshold;
            r["passed_quality_gate"] = report.passed_quality_gate;
            r["status_verdict"] = report.status_verdict;
            r["evaluation_summary"] = report.evaluation_summary;
            
            json docsArr = json::array();
            for (const auto& d : report.document_results) {
                json dj;
                dj["doc_id"] = d.doc_id;
                dj["word_count"] = d.word_count;
                dj["entity_precision"] = d.entity_precision;
                dj["entity_recall"] = d.entity_recall;
                dj["hallucinated_claims"] = d.hallucinated_claims;
                dj["citation_grounded"] = d.citation_grounded;
                dj["extraction_duration_ms"] = d.extraction_duration_ms;
                dj["extracted_sites"] = d.extracted_sites;
                dj["extracted_strata"] = d.extracted_strata;
                dj["extracted_loci"] = d.extracted_loci;
                dj["extracted_artifacts"] = d.extracted_artifacts;
                dj["extracted_date_claims"] = d.extracted_date_claims;
                docsArr.push_back(dj);
            }
            r["document_results"] = docsArr;
            res["result"] = r;
        } else {
            res["error"] = "Unknown native action: " + action;
        }
    } catch (const std::exception& e) {
        res["error"] = e.what();
    }

    return res.dump();
}

// -----------------------------------------------------------------------------
// Native WebView2 In-Memory Message Received Handler
// -----------------------------------------------------------------------------
class WebMessageReceivedHandler : public ICoreWebView2WebMessageReceivedEventHandler {
    LONG m_refCount;
    HWND m_hWnd;

public:
    WebMessageReceivedHandler(HWND hWnd) : m_refCount(1), m_hWnd(hWnd) {}

    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
        if (!ppvObject) return E_POINTER;
        if (riid == IID_IUnknown || riid == IID_ICoreWebView2WebMessageReceivedEventHandler) {
            *ppvObject = static_cast<ICoreWebView2WebMessageReceivedEventHandler*>(this);
            AddRef();
            return S_OK;
        }
        *ppvObject = nullptr;
        return E_NOINTERFACE;
    }

    ULONG STDMETHODCALLTYPE AddRef() override {
        return InterlockedIncrement(&m_refCount);
    }

    ULONG STDMETHODCALLTYPE Release() override {
        ULONG count = InterlockedDecrement(&m_refCount);
        if (count == 0) delete this;
        return count;
    }

    HRESULT STDMETHODCALLTYPE Invoke(ICoreWebView2* sender, ICoreWebView2WebMessageReceivedEventArgs* args) override {
        if (!sender || !args) return S_OK;

        LPWSTR msgJson = nullptr;
        HRESULT hr = args->get_WebMessageAsJson(&msgJson);
        if (FAILED(hr) || !msgJson) return S_OK;

        int utf8Len = WideCharToMultiByte(CP_UTF8, 0, msgJson, -1, nullptr, 0, nullptr, nullptr);
        std::string rawJson(utf8Len, '\0');
        WideCharToMultiByte(CP_UTF8, 0, msgJson, -1, &rawJson[0], utf8Len, nullptr, nullptr);
        if (!rawJson.empty() && rawJson.back() == '\0') rawJson.pop_back();

        CoTaskMemFree(msgJson);

        std::string replyJson = DispatchNativeMessage(rawJson);

        int wideLen = MultiByteToWideChar(CP_UTF8, 0, replyJson.c_str(), -1, nullptr, 0);
        std::wstring wideReply(wideLen, L'\0');
        MultiByteToWideChar(CP_UTF8, 0, replyJson.c_str(), -1, &wideReply[0], wideLen);
        if (!wideReply.empty() && wideReply.back() == L'\0') wideReply.pop_back();

        sender->PostWebMessageAsJson(wideReply.c_str());
        return S_OK;
    }
};

// -----------------------------------------------------------------------------
// Controller Creation Handler
// -----------------------------------------------------------------------------
class ControllerCompletedHandler : public ICoreWebView2CreateCoreWebView2ControllerCompletedHandler {
    LONG m_refCount;
    HWND m_hWnd;
    std::wstring m_targetUrl;

public:
    ControllerCompletedHandler(HWND hWnd, const std::wstring& targetUrl)
        : m_refCount(1), m_hWnd(hWnd), m_targetUrl(targetUrl) {}

    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
        if (!ppvObject) return E_POINTER;
        if (riid == IID_IUnknown || riid == IID_ICoreWebView2CreateCoreWebView2ControllerCompletedHandler) {
            *ppvObject = static_cast<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler*>(this);
            AddRef();
            return S_OK;
        }
        *ppvObject = nullptr;
        return E_NOINTERFACE;
    }

    ULONG STDMETHODCALLTYPE AddRef() override {
        return InterlockedIncrement(&m_refCount);
    }

    ULONG STDMETHODCALLTYPE Release() override {
        ULONG count = InterlockedDecrement(&m_refCount);
        if (count == 0) delete this;
        return count;
    }

    HRESULT STDMETHODCALLTYPE Invoke(HRESULT result, ICoreWebView2Controller* controller) override {
        if (FAILED(result) || !controller) {
            MessageBoxW(m_hWnd, L"Failed to create CoreWebView2 controller.", L"ArchaeoPhD Error", MB_ICONERROR);
            return result;
        }

        g_controller = controller;
        g_controller->AddRef();

        g_controller->get_CoreWebView2(&g_webview);
        if (!g_webview) {
            MessageBoxW(m_hWnd, L"Failed to obtain CoreWebView2 instance.", L"ArchaeoPhD Error", MB_ICONERROR);
            return E_FAIL;
        }

        // Resize WebView2 to fit window bounds
        RECT bounds;
        GetClientRect(m_hWnd, &bounds);
        g_controller->put_Bounds(bounds);

        // Configure Settings
        ICoreWebView2Settings* settings = nullptr;
        if (SUCCEEDED(g_webview->get_Settings(&settings)) && settings) {
            settings->put_IsScriptEnabled(TRUE);
            settings->put_AreDefaultScriptDialogsEnabled(TRUE);
            settings->put_IsWebMessageEnabled(TRUE);
            settings->put_AreDevToolsEnabled(TRUE);
            settings->Release();
        }

        // Locate executable folder
        wchar_t exePathBuf[MAX_PATH];
        GetModuleFileNameW(nullptr, exePathBuf, MAX_PATH);
        std::wstring exeFolder = exePathBuf;
        size_t slashPos = exeFolder.find_last_of(L"\\/");
        if (slashPos != std::wstring::npos) {
            exeFolder = exeFolder.substr(0, slashPos);
        }

        // Determine target folder (from embedded runtime extraction or local directory)
        std::wstring targetFolder = g_appDistFolder;
        if (targetFolder.empty() || GetFileAttributesW((targetFolder + L"\\index.html").c_str()) == INVALID_FILE_ATTRIBUTES) {
            std::wstring distCandidate = exeFolder + L"\\dist";
            if (GetFileAttributesW((distCandidate + L"\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES) {
                targetFolder = distCandidate;
            } else if (GetFileAttributesW((exeFolder + L"\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES) {
                targetFolder = exeFolder;
            }
        }

        std::wstring fallbackHtmlPath;
        if (!targetFolder.empty() && GetFileAttributesW((targetFolder + L"\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES) {
            fallbackHtmlPath = targetFolder + L"\\index.html";
        }

        // Attach navigation failure auto-recovery handler pointing to real file
        std::wstring fallbackUri = fallbackHtmlPath.empty() ? L"" : PathToFileUri(fallbackHtmlPath);
        EventRegistrationToken tokenNavCompleted;
        g_webview->add_NavigationCompleted(
            new NavigationCompletedHandler(m_hWnd, fallbackUri),
            &tokenNavCompleted
        );

        // Register Native WebMessage IPC Handler (Zero HTTP, Zero Sockets, Zero Ports)
        EventRegistrationToken tokenWebMessage;
        g_webview->add_WebMessageReceived(
            new WebMessageReceivedHandler(m_hWnd),
            &tokenWebMessage
        );

        // Inject Native IPC bridge client into window.nativeBridge
        const wchar_t* bridgeScript = 
            L"if (window.location.pathname.endsWith('/index.html') || window.location.pathname === '/index.html') {"
            L"  try { window.history.replaceState(null, '', '/'); } catch(e){}"
            L"}"
            L"window.nativeBridge = {"
            L"  call: function(action, payload, projectId) {"
            L"    return new Promise(function(resolve, reject) {"
            L"      var id = 'req_' + Math.random().toString(36).substr(2, 9);"
            L"      function onMsg(e) {"
            L"        var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;"
            L"        if (d && d.id === id) {"
            L"          window.chrome.webview.removeEventListener('message', onMsg);"
            L"          if (d.error) reject(new Error(d.error)); else resolve(d.result);"
            L"        }"
            L"      }"
            L"      window.chrome.webview.addEventListener('message', onMsg);"
            L"      window.chrome.webview.postMessage({ id: id, action: action, payload: payload || {}, projectId: projectId || 'default' });"
            L"    });"
            L"  }"
            L"};";

        g_webview->AddScriptToExecuteOnDocumentCreated(bridgeScript, nullptr);

        bool mappedVirtualHost = false;
        if (!targetFolder.empty()) {
            ICoreWebView2_3* wv3 = nullptr;
            if (SUCCEEDED(g_webview->QueryInterface(IID_ICoreWebView2_3, (void**)&wv3)) && wv3) {
                // Map appassets.example (RFC 2606/6761 standard recommended for WebView2)
                HRESULT hrMap1 = wv3->SetVirtualHostNameToFolderMapping(
                    L"appassets.example",
                    targetFolder.c_str(),
                    COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW
                );
                // Also map app.archaeophd.local for compatibility
                wv3->SetVirtualHostNameToFolderMapping(
                    L"app.archaeophd.local",
                    targetFolder.c_str(),
                    COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW
                );
                wv3->Release();
                if (SUCCEEDED(hrMap1)) {
                    mappedVirtualHost = true;
                    // CRITICAL: Must specify /index.html. Navigating to / causes WebView2
                    // to attempt opening the folder itself, resulting in ERR_ACCESS_DENIED.
                    g_webview->Navigate(L"https://appassets.example/index.html");
                }
            }
        }

        if (!mappedVirtualHost) {
            // Fallback to local file URI
            g_webview->Navigate(m_targetUrl.c_str());
        }

        return S_OK;
    }
};

// -----------------------------------------------------------------------------
// Environment Creation Handler
// -----------------------------------------------------------------------------
class EnvironmentCompletedHandler : public ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler {
    LONG m_refCount;
    HWND m_hWnd;
    std::wstring m_targetUrl;

public:
    EnvironmentCompletedHandler(HWND hWnd, const std::wstring& targetUrl)
        : m_refCount(1), m_hWnd(hWnd), m_targetUrl(targetUrl) {}

    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppvObject) override {
        if (!ppvObject) return E_POINTER;
        if (riid == IID_IUnknown || riid == IID_ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler) {
            *ppvObject = static_cast<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler*>(this);
            AddRef();
            return S_OK;
        }
        *ppvObject = nullptr;
        return E_NOINTERFACE;
    }

    ULONG STDMETHODCALLTYPE AddRef() override {
        return InterlockedIncrement(&m_refCount);
    }

    ULONG STDMETHODCALLTYPE Release() override {
        ULONG count = InterlockedDecrement(&m_refCount);
        if (count == 0) delete this;
        return count;
    }

    HRESULT STDMETHODCALLTYPE Invoke(HRESULT result, ICoreWebView2Environment* env) override {
        if (FAILED(result) || !env) {
            MessageBoxW(m_hWnd, 
                L"Failed to initialize Microsoft Edge WebView2 Environment.\n"
                L"Please ensure the WebView2 Runtime is installed (standard on Windows 10/11).",
                L"ArchaeoPhD Error", MB_ICONERROR);
            return result;
        }

        return env->CreateCoreWebView2Controller(m_hWnd, new ControllerCompletedHandler(m_hWnd, m_targetUrl));
    }
};

// -----------------------------------------------------------------------------
// Window Procedure
// -----------------------------------------------------------------------------
LRESULT CALLBACK WindowProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_GETMINMAXINFO: {
            LPMINMAXINFO lpMMI = (LPMINMAXINFO)lParam;
            lpMMI->ptMinTrackSize.x = MIN_WIDTH;
            lpMMI->ptMinTrackSize.y = MIN_HEIGHT;
            return 0;
        }
        case WM_SIZE: {
            if (g_controller) {
                RECT bounds;
                GetClientRect(hWnd, &bounds);
                g_controller->put_Bounds(bounds);
            }
            return 0;
        }
        case WM_DESTROY: {
            if (g_webview) {
                g_webview->Release();
                g_webview = nullptr;
            }
            if (g_controller) {
                g_controller->Close();
                g_controller->Release();
                g_controller = nullptr;
            }
            PostQuitMessage(0);
            return 0;
        }
        default:
            return DefWindowProcW(hWnd, uMsg, wParam, lParam);
    }
}

inline void EnsureStartMenuShortcutRegistered() {
    wchar_t programsPath[MAX_PATH];
    if (SHGetFolderPathW(nullptr, CSIDL_PROGRAMS, nullptr, 0, programsPath) != S_OK) return;

    std::wstring shortcutPath = std::wstring(programsPath) + L"\\ArchaeoPhD.lnk";
    if (GetFileAttributesW(shortcutPath.c_str()) != INVALID_FILE_ATTRIBUTES) return;

    wchar_t exePath[MAX_PATH];
    GetModuleFileNameW(nullptr, exePath, MAX_PATH);

    std::wstring exeDir = exePath;
    size_t pos = exeDir.find_last_of(L"\\/");
    if (pos != std::wstring::npos) exeDir = exeDir.substr(0, pos);

    IShellLinkW* psl = nullptr;
    if (SUCCEEDED(CoCreateInstance(CLSID_ShellLink, nullptr, CLSCTX_INPROC_SERVER, IID_IShellLinkW, (void**)&psl))) {
        psl->SetPath(exePath);
        psl->SetWorkingDirectory(exeDir.c_str());
        psl->SetDescription(L"ArchaeoPhD - Offline Research Workstation");
        psl->SetIconLocation(exePath, 0);

        IPersistFile* ppf = nullptr;
        if (SUCCEEDED(psl->QueryInterface(IID_IPersistFile, (void**)&ppf))) {
            ppf->Save(shortcutPath.c_str(), TRUE);
            ppf->Release();
        }
        psl->Release();
    }
}

// -----------------------------------------------------------------------------
// WinMain Entry Point
// -----------------------------------------------------------------------------
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE /*hPrevInstance*/, LPSTR /*lpCmdLine*/, int nCmdShow) {
    // 1. Initialize COM
    HRESULT hrCo = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    if (FAILED(hrCo)) {
        MessageBoxW(nullptr, L"Failed to initialize COM apartment.", L"ArchaeoPhD Error", MB_ICONERROR);
        return 1;
    }

    // Auto-register in Windows Start Menu if not already present
    EnsureStartMenuShortcutRegistered();

    // 2. Enable Per-Monitor DPI Awareness V2 if available
#ifndef DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2
    typedef void* DPI_AWARENESS_CONTEXT;
    #define DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2 ((DPI_AWARENESS_CONTEXT)-4)
#endif
    typedef BOOL (WINAPI *SetProcessDpiAwarenessContextFn)(DPI_AWARENESS_CONTEXT);
    HMODULE hUser32 = GetModuleHandleW(L"user32.dll");
    if (hUser32) {
        SetProcessDpiAwarenessContextFn pfnSetDpi = 
            (SetProcessDpiAwarenessContextFn)GetProcAddress(hUser32, "SetProcessDpiAwarenessContext");
        if (pfnSetDpi) {
            pfnSetDpi(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
        }
    }

    // 3. Register Win32 Window Class
    WNDCLASSEXW wc = { sizeof(WNDCLASSEXW) };
    wc.style = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = CLASS_NAME;
    wc.hIcon = (HICON)LoadImageW(hInstance, MAKEINTRESOURCEW(1), IMAGE_ICON, GetSystemMetrics(SM_CXICON), GetSystemMetrics(SM_CYICON), LR_DEFAULTCOLOR);
    if (!wc.hIcon) wc.hIcon = LoadIconW(nullptr, IDI_APPLICATION);
    wc.hIconSm = (HICON)LoadImageW(hInstance, MAKEINTRESOURCEW(1), IMAGE_ICON, GetSystemMetrics(SM_CXSMICON), GetSystemMetrics(SM_CYSMICON), LR_DEFAULTCOLOR);

    if (!RegisterClassExW(&wc)) {
        MessageBoxW(nullptr, L"Failed to register Win32 window class.", L"ArchaeoPhD Error", MB_ICONERROR);
        CoUninitialize();
        return 1;
    }

    // 4. Center window on monitor
    int screenWidth = GetSystemMetrics(SM_CXSCREEN);
    int screenHeight = GetSystemMetrics(SM_CYSCREEN);
    int posX = (screenWidth - DEFAULT_WIDTH) / 2;
    int posY = (screenHeight - DEFAULT_HEIGHT) / 2;

    // 5. Create Window
    g_hWnd = CreateWindowExW(
        0,
        CLASS_NAME,
        WINDOW_TITLE,
        WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN,
        posX, posY,
        DEFAULT_WIDTH, DEFAULT_HEIGHT,
        nullptr, nullptr, hInstance, nullptr
    );

    if (!g_hWnd) {
        MessageBoxW(nullptr, L"Failed to create ArchaeoPhD desktop window.", L"ArchaeoPhD Error", MB_ICONERROR);
        CoUninitialize();
        return 1;
    }

    if (wc.hIcon) SendMessageW(g_hWnd, WM_SETICON, ICON_BIG, (LPARAM)wc.hIcon);
    if (wc.hIconSm) SendMessageW(g_hWnd, WM_SETICON, ICON_SMALL, (LPARAM)wc.hIconSm);
    SetWindowTextW(g_hWnd, WINDOW_TITLE);

    ShowWindow(g_hWnd, nCmdShow);
    UpdateWindow(g_hWnd);

    // 6. Locate executable folder and ensure runtime assets are available
    wchar_t exePathBuffer[MAX_PATH];
    GetModuleFileNameW(nullptr, exePathBuffer, MAX_PATH);
    std::wstring exeDir = exePathBuffer;
    size_t lastSlash = exeDir.find_last_of(L"\\/");
    if (lastSlash != std::wstring::npos) {
        exeDir = exeDir.substr(0, lastSlash);
    }

    std::wstring runtimeDistFolder;
    std::wstring runtimeLoaderPath;
    EnsureRuntimeExtracted(runtimeDistFolder, runtimeLoaderPath);
    g_appDistFolder = runtimeDistFolder;
    std::wstring finalHtmlPath;
    if (!runtimeDistFolder.empty() && GetFileAttributesW((runtimeDistFolder + L"\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES) {
        finalHtmlPath = runtimeDistFolder + L"\\index.html";
    } else if (GetFileAttributesW((exeDir + L"\\dist\\index.html").c_str()) != INVALID_FILE_ATTRIBUTES) {
        finalHtmlPath = exeDir + L"\\dist\\index.html";
    } else {
        finalHtmlPath = exeDir + L"\\index.html";
    }

    std::wstring targetUrl = PathToFileUri(finalHtmlPath);

    // 7. Setup User Data Directory for WebView2 cache/storage
    wchar_t localAppData[MAX_PATH];
    std::wstring userDataDir;
    if (GetEnvironmentVariableW(L"LOCALAPPDATA", localAppData, MAX_PATH) > 0) {
        userDataDir = std::wstring(localAppData) + L"\\ArchaeoPhD\\WebView2Data";
    } else {
        userDataDir = exeDir + L"\\WebView2Data";
    }
    CreateDirectoryW(userDataDir.c_str(), nullptr);

    // Initialize Native C++ Offline Engine if Data Root was previously configured and accessible
    auto rootStatus = archaeophd::DataRootManager::GetStatus();
    if (rootStatus.configured && !rootStatus.is_missing) {
        InitNativeEngineWithDataRoot(rootStatus.data_root);
    }

    // 8. Load WebView2Loader.dll dynamically
    HMODULE hLoader = nullptr;
    if (!runtimeLoaderPath.empty() && GetFileAttributesW(runtimeLoaderPath.c_str()) != INVALID_FILE_ATTRIBUTES) {
        hLoader = LoadLibraryW(runtimeLoaderPath.c_str());
    }
    if (!hLoader) {
        std::wstring loaderPath = exeDir + L"\\WebView2Loader.dll";
        hLoader = LoadLibraryW(loaderPath.c_str());
    }
    if (!hLoader) {
        hLoader = LoadLibraryW(L"WebView2Loader.dll");
    }
    if (!hLoader) {
        std::wstring pkgLoader = exeDir + L"\\packages\\webview2\\build\\native\\x86\\WebView2Loader.dll";
        hLoader = LoadLibraryW(pkgLoader.c_str());
    }

    if (!hLoader) {
        MessageBoxW(g_hWnd,
            L"WebView2Loader.dll could not be loaded.\n"
            L"Please verify Microsoft Edge WebView2 Runtime is installed.",
            L"ArchaeoPhD Startup Error", MB_ICONERROR);
        CoUninitialize();
        return 1;
    }

    CreateCoreWebView2EnvironmentWithOptionsFn pfnCreateEnv =
        (CreateCoreWebView2EnvironmentWithOptionsFn)GetProcAddress(hLoader, "CreateCoreWebView2EnvironmentWithOptions");

    if (!pfnCreateEnv) {
        MessageBoxW(g_hWnd,
            L"Failed to locate CreateCoreWebView2EnvironmentWithOptions in WebView2Loader.dll.",
            L"ArchaeoPhD Startup Error", MB_ICONERROR);
        FreeLibrary(hLoader);
        CoUninitialize();
        return 1;
    }

    // 9. Initialize WebView2 Environment asynchronously
    HRESULT hr = pfnCreateEnv(
        nullptr,
        userDataDir.c_str(),
        nullptr,
        new EnvironmentCompletedHandler(g_hWnd, targetUrl)
    );

    if (FAILED(hr)) {
        MessageBoxW(g_hWnd,
            L"Failed to start WebView2 initialization.\n"
            L"Verify Microsoft Edge WebView2 Runtime is installed.",
            L"ArchaeoPhD Startup Error", MB_ICONERROR);
    }

    // 10. Win32 Message Loop
    MSG msg = {};
    while (GetMessageW(&msg, nullptr, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    CoUninitialize();
    return (int)msg.wParam;
}
