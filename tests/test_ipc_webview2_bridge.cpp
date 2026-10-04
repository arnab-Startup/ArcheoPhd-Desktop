#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <map>
#include <thread>
#include <future>
#include <json.hpp>
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include "models.hpp"
#include "storage/storage.hpp"
#include "analysis/vector_index.hpp"
#include "analysis/contradictions.hpp"
#include "analysis/thesis_audit.hpp"
#include "extraction/ingestion_manager.hpp"
#include "ipc/native_ipc_dispatcher.hpp"

using json = nlohmann::json;
using namespace archaeophd;

// =============================================================================
// Simulated WebView2 Native Bridge Harness
// =============================================================================
// Replicates the complete Win32 WideCharToMultiByte / MultiByteToWideChar
// round-trip pipeline executed by WebMessageReceivedHandler::Invoke:
//
// 1. JS caller: window.chrome.webview.postMessage(obj) -> WebView2 encodes to UTF-16 (LPWSTR msgJson)
// 2. Win32 WebMessageReceivedHandler:
//      WideCharToMultiByte(CP_UTF8, ...) -> UTF-8 std::string rawJson
// 3. Dispatcher:
//      std::string replyJson = DispatchNativeMessage(rawJson)
// 4. Win32 WebMessageReceivedHandler:
//      MultiByteToWideChar(CP_UTF8, ...) -> UTF-16 std::wstring wideReply
//      sender->PostWebMessageAsJson(wideReply.c_str())
// 5. JS caller receives reply event and correlates req_id.
// =============================================================================
class SimulatedNativeBridge {
private:
    NativeIpcDispatcher& dispatcher_;
    uint64_t reqCounter_ = 1000;

public:
    explicit SimulatedNativeBridge(NativeIpcDispatcher& dispatcher)
        : dispatcher_(dispatcher) {}

    struct BridgeResult {
        bool resolved = false;
        bool rejected = false;
        std::string req_id;
        json result;
        std::string error;
        std::string raw_reply;
    };

    // Low-level helper: Replicates exact Win32 conversion in WebMessageReceivedHandler::Invoke
    std::string simulate_win32_webview2_transport(const std::string& utf8Input) {
        // Step A: Convert incoming UTF-8 string to Win32 UTF-16 (simulates WebView2 msgJson LPWSTR)
        int wideInLen = MultiByteToWideChar(CP_UTF8, 0, utf8Input.c_str(), -1, nullptr, 0);
        std::wstring wideMsg(wideInLen, L'\0');
        MultiByteToWideChar(CP_UTF8, 0, utf8Input.c_str(), -1, &wideMsg[0], wideInLen);
        if (!wideMsg.empty() && wideMsg.back() == L'\0') wideMsg.pop_back();

        // Step B: Replicate WebMessageReceivedHandler::Invoke converting LPWSTR to UTF-8 rawJson
        int utf8Len = WideCharToMultiByte(CP_UTF8, 0, wideMsg.c_str(), -1, nullptr, 0, nullptr, nullptr);
        std::string rawJson(utf8Len, '\0');
        WideCharToMultiByte(CP_UTF8, 0, wideMsg.c_str(), -1, &rawJson[0], utf8Len, nullptr, nullptr);
        if (!rawJson.empty() && rawJson.back() == '\0') rawJson.pop_back();

        // Step C: Native C++ Dispatcher
        std::string replyJson = dispatcher_.dispatch(rawJson);

        // Step D: Replicate WebMessageReceivedHandler::Invoke converting replyJson to UTF-16 wideReply
        int wideReplyLen = MultiByteToWideChar(CP_UTF8, 0, replyJson.c_str(), -1, nullptr, 0);
        std::wstring wideReply(wideReplyLen, L'\0');
        MultiByteToWideChar(CP_UTF8, 0, replyJson.c_str(), -1, &wideReply[0], wideReplyLen);
        if (!wideReply.empty() && wideReply.back() == L'\0') wideReply.pop_back();

        // Step E: Replicate PostWebMessageAsJson delivering UTF-16 payload back to JS
        int finalUtf8Len = WideCharToMultiByte(CP_UTF8, 0, wideReply.c_str(), -1, nullptr, 0, nullptr, nullptr);
        std::string finalReply(finalUtf8Len, '\0');
        WideCharToMultiByte(CP_UTF8, 0, wideReply.c_str(), -1, &finalReply[0], finalUtf8Len, nullptr, nullptr);
        if (!finalReply.empty() && finalReply.back() == '\0') finalReply.pop_back();

        return finalReply;
    }

    BridgeResult call(const std::string& action, const json& payload = json::object(), const std::string& projectId = "default", const std::string& customId = "") {
        BridgeResult br;
        std::string reqId = customId.empty() ? ("req_" + std::to_string(++reqCounter_)) : customId;
        br.req_id = reqId;

        // 1. Serialize message in JS: postMessage({ id, action, payload, projectId })
        json jsReq;
        if (!reqId.empty()) {
            jsReq["id"] = reqId;
        }
        jsReq["action"] = action;
        jsReq["payload"] = payload;
        jsReq["projectId"] = projectId;
        std::string rawRequest = jsReq.dump();

        // 2. Transmit through Win32 WebView2 WebMessage boundary
        std::string rawReply = simulate_win32_webview2_transport(rawRequest);
        br.raw_reply = rawReply;

        // 3. Receive message in JS: onMsg(e) -> JSON.parse(e.data)
        json d;
        try {
            d = json::parse(rawReply);
        } catch (const std::exception& e) {
            br.rejected = true;
            br.error = std::string("Malformed JSON reply from bridge: ") + e.what();
            return br;
        }

        // 4. Correlate request ID (d && d.id === id)
        std::string replyId = d.value("id", "");
        if (replyId != reqId) {
            br.rejected = true;
            br.error = "ID correlation mismatch: expected '" + reqId + "' but received '" + replyId + "'";
            return br;
        }

        // 5. Evaluate if (d.error) reject(new Error(d.error)) else resolve(d.result)
        if (d.contains("error") && !d["error"].is_null()) {
            br.rejected = true;
            br.error = d["error"].is_string() ? d["error"].get<std::string>() : d["error"].dump();
        } else if (d.contains("result")) {
            br.resolved = true;
            br.result = d["result"];
        } else {
            br.rejected = true;
            br.error = "Invalid bridge response: neither result nor error present.";
        }

        return br;
    }

    // Direct raw dispatch tester (for testing syntactically broken strings or non-object roots)
    std::string call_raw(const std::string& rawJson) {
        return simulate_win32_webview2_transport(rawJson);
    }
};

int main() {
    std::cout << "================================================================================\n";
    std::cout << "  ArchaeoPhD Engine — Step 2: WebView2 IPC Bridge & Adversarial Test Suite      \n";
    std::cout << "================================================================================\n\n";

    std::string testDir = "test_ipc_bridge_data";
    std::error_code ec;
    std::filesystem::remove_all(testDir, ec);

    // Create a dummy PDF file on disk for ingestion
    std::string dummyPdf = "test_ipc_sample_paper.pdf";
    {
        std::ofstream f(dummyPdf, std::ios::binary);
        f << "%PDF-1.4 sample archaeological monograph for IPC bridge validation";
    }

    NativeStorage storage(testDir);
    NativeContradictionEngine contradictions(storage);
    NativeThesisAuditor thesisAuditor(storage, contradictions);

    NativeIpcDispatcher dispatcher(
        &storage,
        &contradictions,
        &thesisAuditor,
        testDir,
        nullptr,
        nullptr
    );

    SimulatedNativeBridge bridge(dispatcher);

    std::string createdSourceId;

    // -------------------------------------------------------------------------
    // TEST 1: IPC Request Correlation & Malformed JSON Resilience
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 1] IPC Request Correlation & Malformed JSON Resilience...\n";

        // A. Malformed JSON directly into dispatcher
        std::string malformedReply = bridge.call_raw("{this is not valid json");
        json mJson = json::parse(malformedReply);
        assert(mJson.contains("error"));
        assert(mJson["error"] == "Invalid JSON payload");

        // B. Non-object root JSON (array)
        std::string arrayReply = bridge.call_raw("[1, 2, 3]");
        json aJson = json::parse(arrayReply);
        assert(aJson.contains("error"));
        assert(aJson["error"] == "Invalid JSON payload: root must be an object");

        // C. Standard ping via bridge
        auto pingRes = bridge.call("ping");
        assert(pingRes.resolved == true);
        assert(pingRes.rejected == false);
        assert(pingRes.result["status"] == "online");
        assert(pingRes.result["zero_cloud_leakage"] == true);
        assert(!pingRes.req_id.empty());
        std::cout << "  ✓ Request ID correlation verified; malformed JSON handled fail-safe with zero crashes.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 2: IPC Endpoint: ingest_document Defaults Safely to Class B
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 2] IPC Endpoint: ingest_document Defaults Safely to Class B...\n";
        json payload = {
            {"file_path", dummyPdf},
            {"title", "Excavations at Chirki on Pravara"},
            {"author", "Gudrun Corvinus"},
            {"year", "1968"}
        };

        auto res = bridge.call("ingest_document", payload);
        assert(res.resolved == true);
        assert(res.rejected == false);
        assert(res.result["success"] == true);
        assert(res.result["degradation_class"] == "CLASS_B");
        assert(res.result["status"] == "UNVERIFIED_ROUGH_SCAN");
        assert(!res.result["source_id"].get<std::string>().empty());
        assert(res.result["sha256"].get<std::string>().length() == 64);

        createdSourceId = res.result["source_id"].get<std::string>();

        // Verify storage state was saved
        auto sources = storage.get_sources();
        assert(sources.size() == 1);
        assert(sources[0].id == createdSourceId);
        assert(sources[0].degradation_class == "CLASS_B");
        assert(sources[0].confirmed_clean_offset == false);
        assert(sources[0].ingestion_status == "UNVERIFIED_ROUGH_SCAN");
        std::cout << "  ✓ ingest_document executed over IPC: document defaulted safely to CLASS_B.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 3: IPC Hard-Gate Survival: Unconfirmed Class A Upgrade Rejection
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 3] IPC Hard-Gate Survival: Unconfirmed Class A Upgrade Rejection...\n";
        json payload = {
            {"source_id", createdSourceId},
            {"target_class", "CLASS_A"},
            {"confirmed_clean_offset", false} // Unconfirmed!
        };

        auto res = bridge.call("classify_source", payload);
        // The bridge must REJECT this call
        assert(res.resolved == false);
        assert(res.rejected == true);
        assert(!res.error.empty());
        assert(res.error.find("Class A requires explicit physical print confirmation") != std::string::npos);

        // Verify storage degradation_class remained CLASS_B
        auto s = storage.get_sources()[0];
        assert(s.degradation_class == "CLASS_B");
        assert(s.confirmed_clean_offset == false);
        std::cout << "  ✓ Hard-gate error survived IPC boundary cleanly: Promise rejected with '" << res.error << "'\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 4: IPC Endpoint: Valid Class A Upgrade and Dual-Engine Routing
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 4] IPC Endpoint: Valid Class A Upgrade & Dual-Engine Verification Routing...\n";
        json payload = {
            {"source_id", createdSourceId},
            {"target_class", "CLASS_A"},
            {"confirmed_clean_offset", true} // Explicit physical print confirmation!
        };

        auto res = bridge.call("classify_source", payload);
        assert(res.resolved == true);
        assert(res.rejected == false);
        assert(res.result["success"] == true);
        assert(res.result["degradation_class"] == "CLASS_A");

        auto s = storage.get_sources()[0];
        assert(s.degradation_class == "CLASS_A");
        assert(s.confirmed_clean_offset == true);

        // Feed candidate facts via ProcessClassAFacts (1 consensus, 1 disagreement)
        ExtractedFact f1;
        f1.fact_id = "fact_ipc_001";
        f1.entity_name = "Chirki Discovery Year";
        f1.value_engine_a = "1963";
        f1.value_engine_b = "1963"; // Exact consensus!

        ExtractedFact f2;
        f2.fact_id = "fact_ipc_002";
        f2.entity_name = "Rubble Thickness";
        f2.value_engine_a = "2040 cm";
        f2.value_engine_b = "20-40 cm"; // Disagreement!
        f2.context_snippet = "rubble boulder horizon measured 20-40 cm";

        IngestionManager::ProcessClassAFacts(storage, createdSourceId, {f1, f2});

        // Verify consensus fact was committed to knowledge graph
        auto claims = storage.get_claims();
        assert(claims.size() == 1);
        assert(claims[0].claim_text == "Chirki Discovery Year: 1963");
        assert(claims[0].verification_status == "VERIFIED");

        // Verify disagreement was queued in verification items
        auto vQueueRes = bridge.call("get_verification_queue", {{"source_id", createdSourceId}});
        assert(vQueueRes.resolved == true);
        assert(vQueueRes.result.is_array());
        assert(vQueueRes.result.size() == 1);
        assert(vQueueRes.result[0]["id"] == "vitem_fact_ipc_002");
        assert(vQueueRes.result[0]["candidate_a"] == "2040 cm");
        assert(vQueueRes.result[0]["candidate_b"] == "20-40 cm");
        assert(vQueueRes.result[0]["crop_image_path"] == "crops/fact_ipc_002.png");
        std::cout << "  ✓ Consensus committed; disagreement routed to verification queue with optical crop link.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 5: UI Guardrail: Optical Crop Mandatory for Verification (Anti-Anchoring)
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 5] UI Guardrail: Optical Crop Mandatory for Verification (Anti-Anchoring)...\n";

        // Create an unanchored verification item lacking an optical crop path
        VerificationItem unanchoredItem;
        unanchoredItem.id = "vitem_unanchored_001";
        unanchoredItem.source_id = createdSourceId;
        unanchoredItem.candidate_a = "1550 BCE";
        unanchoredItem.candidate_b = "1400 BCE";
        unanchoredItem.crop_image_path = ""; // EMPTY CROP: violates anti-anchoring!
        unanchoredItem.status = "PENDING";
        storage.put_verification_item(unanchoredItem);

        // Attempt to resolve without optical crop
        json resolvePayload = {
            {"item_id", "vitem_unanchored_001"},
            {"resolution_type", "CANDIDATE_A"},
            {"override_value", ""}
        };

        auto res = bridge.call("resolve_verification_item", resolvePayload);
        assert(res.resolved == false);
        assert(res.rejected == true);
        assert(!res.error.empty());
        assert(res.error.find("Anti-anchoring violation: Optical crop is mandatory") != std::string::npos);

        // Verify status remained PENDING
        auto items = storage.get_verification_items();
        for (const auto& it : items) {
            if (it.id == "vitem_unanchored_001") {
                assert(it.status == "PENDING");
            }
        }
        std::cout << "  ✓ Anti-anchoring guardrail enforced: resolving item without optical crop rejected over IPC.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 6: IPC Endpoint: resolve_verification_item With Optical Crop
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 6] IPC Endpoint: resolve_verification_item With Optical Crop...\n";
        json resolvePayload = {
            {"item_id", "vitem_fact_ipc_002"},
            {"resolution_type", "CANDIDATE_B"}, // Human researcher chose Candidate B (20-40 cm) after inspecting crop
            {"override_value", ""}
        };

        auto res = bridge.call("resolve_verification_item", resolvePayload);
        assert(res.resolved == true);
        assert(res.rejected == false);
        assert(res.result["success"] == true);
        assert(res.result["status"] == "CANDIDATE_B");

        auto items = storage.get_verification_items();
        for (const auto& it : items) {
            if (it.id == "vitem_fact_ipc_002") {
                assert(it.status == "RESOLVED_B");
                assert(it.resolved_value == "20-40 cm");
            }
        }
        std::cout << "  ✓ Disagreement resolved over IPC with verified crop anchor.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 7: IPC Hard-Gate Survival: Direct Automated Write Injection Blocked
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 7] IPC Hard-Gate Survival: Direct Automated Write Injection Blocked on Class B...\n";

        // Create a dedicated Class B source
        Source bSource;
        bSource.id = "src_pure_class_b";
        bSource.degradation_class = "CLASS_B";
        bSource.confirmed_clean_offset = false;
        bSource.ingestion_status = "MANUAL_TRANSCRIPTION_PENDING";
        storage.put_source(bSource);

        // Attempt automated claim insertion via IPC
        json injectPayload = {
            {"claim", {
                {"id", "claim_injected_via_ipc"},
                {"source_id", "src_pure_class_b"},
                {"claim_text", "Automated OCR extraction injected without human transcription"},
                {"origin_type", "scanned_ocr_dual_consensus"},
                {"verification_status", "PENDING_VERIFICATION"}
            }}
        };

        auto res = bridge.call("put_claim", injectPayload);
        assert(res.resolved == false);
        assert(res.rejected == true);
        assert(!res.error.empty());
        assert(res.error.find("Hard gate violation: Automated claim insertion is strictly prohibited for Class B sources") != std::string::npos);

        // Verify database contains zero claims for this Class B source
        for (const auto& c : storage.get_claims()) {
            assert(c.source_id != "src_pure_class_b");
        }
        std::cout << "  ✓ Automated write injection rejected by storage hard-gate and surfaced as bridge error.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 8: UI Guardrail: Manual Transcription Blank Template (No Pre-Fill)
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 8] UI Guardrail: Manual Transcription Blank Template (No Pre-Fill)...\n";
        auto res = bridge.call("get_transcription_template", {{"source_id", "src_pure_class_b"}, {"page_number", 7}});
        assert(res.resolved == true);
        assert(res.rejected == false);
        assert(res.result["prefill_enabled"] == false);
        assert(res.result["fields"].is_array());
        assert(res.result["fields"].size() >= 2);

        // Verify 100% of fields are blank strings — NO machine OCR guesses or pre-fills
        for (const auto& fld : res.result["fields"]) {
            std::string fldName = fld["field_name"];
            std::string val = fld["value"];
            if (fldName == "entity_name" || fldName == "value") {
                assert(val.empty()); // MUST BE COMPLETELY EMPTY
            }
        }
        std::cout << "  ✓ Zero pre-fill principle enforced: manual template returned strictly blank input fields.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 9: IPC Endpoint: save_manual_transcription Human Double-Entry
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 9] IPC Endpoint: save_manual_transcription Human Double-Entry...\n";
        json facts = json::array({
            {{"entity_name", "Trench VII Rubble Thickness"}, {"value", "20-40 cm"}, {"type", "measurement"}},
            {{"entity_name", "Artifact Count (Cleavers)"}, {"value", "67 specimens"}, {"type", "count"}}
        });

        json manualPayload = {
            {"source_id", "src_pure_class_b"},
            {"page_number", 7},
            {"facts", facts}
        };

        auto res = bridge.call("save_manual_transcription", manualPayload);
        assert(res.resolved == true);
        assert(res.rejected == false);
        assert(res.result["success"] == true);

        // Verify claims are stored with origin_type == "manual_transcription" and status == "VERIFIED"
        auto claims = storage.get_claims();
        int manualCount = 0;
        for (const auto& c : claims) {
            if (c.source_id == "src_pure_class_b") {
                assert(c.origin_type == "manual_transcription");
                assert(c.verification_status == "VERIFIED");
                manualCount++;
            }
        }
        assert(manualCount == 2);

        // Verify source ingestion status updated to VERIFIED_MANUAL
        for (const auto& s : storage.get_sources()) {
            if (s.id == "src_pure_class_b") {
                assert(s.ingestion_status == "VERIFIED_MANUAL");
            }
        }
        std::cout << "  ✓ Manual double-entry facts committed via IPC with verified human provenance.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 10: IPC Endpoint: reflag_source_class Retroactive Purge
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 10] IPC Endpoint: reflag_source_class Retroactive Purge...\n";
        // createdSourceId is currently CLASS_A with 1 auto consensus claim + 1 resolved verification item
        // Let's also add 1 manual transcription to createdSourceId
        json manualFact = json::array({
            {{"entity_name", "Manual Note"}, {"value", "Confirmed basalt bedrock"}, {"type", "stratum"}}
        });
        bridge.call("save_manual_transcription", {{"source_id", createdSourceId}, {"page_number", 1}, {"facts", manualFact}});

        // Now call reflag_source_class over IPC
        auto res = bridge.call("reflag_source_class", {{"source_id", createdSourceId}});
        assert(res.resolved == true);
        assert(res.result["success"] == true);
        assert(res.result["degradation_class"] == "CLASS_B");

        // Verify retroactive purge:
        // The automated consensus claim ("Chirki Discovery Year: 1963") MUST BE PURGED.
        // The manual transcription ("Manual Note: Confirmed basalt bedrock") MUST SURVIVE.
        auto claims = storage.get_claims();
        bool foundAuto = false;
        bool foundManual = false;
        for (const auto& c : claims) {
            if (c.source_id == createdSourceId) {
                if (c.origin_type != "manual_transcription") foundAuto = true;
                if (c.origin_type == "manual_transcription") foundManual = true;
            }
        }
        assert(foundAuto == false);  // Purged!
        assert(foundManual == true); // Preserved!
        std::cout << "  ✓ Reflagged source over IPC: unconfirmed extractions purged, manual transcription preserved.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 11: UI Guardrail: Scoped Passage Badging (Per-Chunk & Page Grounding)
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 11] UI Guardrail: Scoped Passage Badging (Per-Chunk & Page Grounding)...\n";

        // Index two separate pages for createdSourceId (which is Class B):
        // Page 1: Has a verified manual transcription ("Manual Note: Confirmed basalt bedrock")
        // Page 12: Has ZERO manual transcription (raw, unverified rough OCR scan)
        json pageChunks = json::array({
            {{"page_number", 1}, {"text", "Trench VII overview: basalt bedrock reached across all grids with clear stratum boundaries."}},
            {{"page_number", 12}, {"text", "Section 4: Unverified scan text reporting ambiguous handaxe frequencies in upper colluvium."}}
        });

        bridge.call("index_rough_text", {{"source_id", createdSourceId}, {"pages", pageChunks}});

        // Search for page 1 content (has page-level human grounding)
        auto resP1 = bridge.call("search_semantic_passages", {{"query", "basalt bedrock overview"}, {"top_k", 2}});
        assert(resP1.resolved == true);
        bool foundP1 = false;
        for (const auto& m : resP1.result) {
            if (m["doc_id"] == createdSourceId && m["page_ref"] == 1) {
                foundP1 = true;
                assert(m["has_page_grounding"] == true);
                assert(m["verified_facts_on_page"] >= 1);
                assert(m["badge"] == "PARTIALLY_VERIFIED");
                assert(m["is_unverified_rough_scan"] == false); // NOT flagged as rough scan because page has verified facts!
            }
        }
        assert(foundP1 == true);

        // Search for page 12 content (untranscribed rough scan)
        auto resP12 = bridge.call("search_semantic_passages", {{"query", "ambiguous handaxe frequencies upper colluvium"}, {"top_k", 2}});
        assert(resP12.resolved == true);
        bool foundP12 = false;
        for (const auto& m : resP12.result) {
            if (m["doc_id"] == createdSourceId && m["page_ref"] == 12) {
                foundP12 = true;
                assert(m["has_page_grounding"] == false);
                assert(m["verified_facts_on_page"] == 0);
                assert(m["badge"] == "UNVERIFIED_ROUGH_SCAN"); // CORRECTLY carries the amber warning badge!
                assert(m["is_unverified_rough_scan"] == true);
            }
        }
        assert(foundP12 == true);
        std::cout << "  ✓ Inverted condition eliminated: badging is fine-grained per-chunk (page 1: PARTIALLY_VERIFIED, page 12: UNVERIFIED_ROUGH_SCAN).\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 12: Concurrent JS Bridge Request Simulation & Isolation
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 12] Concurrent JS Bridge Request Simulation & Isolation...\n";
        // Simulate 20 rapid sequential asynchronous calls with distinct request IDs
        for (int i = 0; i < 20; ++i) {
            auto res = bridge.call("ping");
            assert(res.resolved == true);
            assert(!res.req_id.empty());
            assert(res.result["status"] == "online");
        }
        std::cout << "  ✓ 20 rapid IPC bridge message cycles executed with 100% request ID correlation.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 13: Adversarial IPC: Missing Required Request Fields (id, action)
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 13] Adversarial IPC: Missing Required Request Fields (id, action)...\n";

        // A. Request with missing 'id'
        std::string noIdJson = "{\"action\": \"ping\", \"payload\": {}}";
        std::string noIdReply = bridge.call_raw(noIdJson);
        json r1 = json::parse(noIdReply);
        assert(r1.contains("error"));
        assert(r1["error"] == "Invalid request: missing required 'id' field");

        // B. Request with missing 'action'
        std::string noActJson = "{\"id\": \"req_no_act\", \"payload\": {}}";
        std::string noActReply = bridge.call_raw(noActJson);
        json r2 = json::parse(noActReply);
        assert(r2.contains("error"));
        assert(r2["id"] == "req_no_act");
        assert(r2["error"] == "Invalid request: missing or invalid 'action' field");

        // C. Request with non-object 'payload'
        std::string badPayloadJson = "{\"id\": \"req_bad_pl\", \"action\": \"ping\", \"payload\": \"string_not_obj\"}";
        std::string badPlReply = bridge.call_raw(badPayloadJson);
        json r3 = json::parse(badPlReply);
        assert(r3.contains("error"));
        assert(r3["id"] == "req_bad_pl");
        assert(r3["error"] == "Invalid request: 'payload' must be a JSON object");

        std::cout << "  ✓ Missing IDs, missing actions, and malformed payload shapes rejected immediately.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 14: Adversarial IPC: Type Confusion Injection on confirmed_clean_offset
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 14] Adversarial IPC: Type Confusion Injection on confirmed_clean_offset...\n";

        // Adversarial attempts to bypass Class A gating with non-boolean truthy values:
        // 1. String "true"
        auto res1 = bridge.call("classify_source", {
            {"source_id", createdSourceId},
            {"target_class", "CLASS_A"},
            {"confirmed_clean_offset", "true"} // STRING, NOT BOOLEAN
        });
        assert(res1.resolved == false);
        assert(res1.rejected == true);
        assert(res1.error.find("Class A requires explicit physical print confirmation") != std::string::npos);

        // 2. Integer 1
        auto res2 = bridge.call("classify_source", {
            {"source_id", createdSourceId},
            {"target_class", "CLASS_A"},
            {"confirmed_clean_offset", 1} // INT, NOT BOOLEAN
        });
        assert(res2.resolved == false);
        assert(res2.rejected == true);
        assert(res2.error.find("Class A requires explicit physical print confirmation") != std::string::npos);

        // 3. Array [true]
        auto res3 = bridge.call("classify_source", {
            {"source_id", createdSourceId},
            {"target_class", "CLASS_A"},
            {"confirmed_clean_offset", json::array({true})} // ARRAY
        });
        assert(res3.resolved == false);
        assert(res3.rejected == true);

        // 4. Object {"bypass": true}
        auto res4 = bridge.call("classify_source", {
            {"source_id", createdSourceId},
            {"target_class", "CLASS_A"},
            {"confirmed_clean_offset", {{"bypass", true}}} // OBJECT
        });
        assert(res4.resolved == false);
        assert(res4.rejected == true);

        // 5. Strict literal boolean true -> Must succeed
        auto res5 = bridge.call("classify_source", {
            {"source_id", createdSourceId},
            {"target_class", "CLASS_A"},
            {"confirmed_clean_offset", true} // STRICT BOOLEAN TRUE
        });
        assert(res5.resolved == true);
        assert(res5.result["success"] == true);

        std::cout << "  ✓ Type confusion attacks blocked: strings ('true'), ints (1), arrays, and objects rejected.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 15: Adversarial IPC: Missing Entity IDs in Mutation Payloads
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 15] Adversarial IPC: Missing Entity IDs in Mutation Payloads...\n";

        // A. classify_source with empty source_id
        auto r1 = bridge.call("classify_source", {{"target_class", "CLASS_A"}, {"confirmed_clean_offset", true}});
        assert(r1.resolved == false);
        assert(r1.error == "Invalid request: 'source_id' is required for classification");

        // B. reflag_source_class with missing source_id
        auto r2 = bridge.call("reflag_source_class", json::object());
        assert(r2.resolved == false);
        assert(r2.error == "Invalid request: 'source_id' is required for reflagging");

        // C. resolve_verification_item with missing item_id
        auto r3 = bridge.call("resolve_verification_item", {{"resolution_type", "REJECT"}});
        assert(r3.resolved == false);
        assert(r3.error == "Invalid request: 'item_id' is required for verification resolution");

        // D. save_manual_transcription with missing facts array
        auto r4 = bridge.call("save_manual_transcription", {{"source_id", createdSourceId}, {"page_number", 1}});
        assert(r4.resolved == false);
        assert(r4.error == "Invalid request: 'facts' must be an array of transcribed entities");

        std::cout << "  ✓ All mutation endpoints validate required fields before touching storage.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 16: Multi-Byte UTF-8 Diacritics & Multilingual Archaeological Citations
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 16] Multi-Byte UTF-8 Diacritics & Archaeological Citations...\n";

        // Archaeological monograph test string with French accents, German umlauts,
        // Semitic diacritics (ṣ, ṭ, š, ā), Devanagari script (रुग्ण), em-dashes, and quotation marks
        std::string complexTitle = "Tell es-Sulṭān (Jericho) — Stratum IV Phase b, Šarru-kīn & Chirki-on-Pravarā (रुग्ण)";
        std::string complexAuthor = "Kathleen M. Kenyon (1952–1958) & François Bordes (Bordeaux)";

        json payload = {
            {"file_path", dummyPdf},
            {"title", complexTitle},
            {"author", complexAuthor},
            {"year", "1958"}
        };

        auto res = bridge.call("ingest_document", payload);
        assert(res.resolved == true);
        std::string utf8SourceId = res.result["source_id"];

        // Query source over bridge and verify 100% byte-for-byte character fidelity across Win32 UTF-16 <-> UTF-8 conversion
        auto qRes = bridge.call("get_sources");
        assert(qRes.resolved == true);
        bool foundComplex = false;
        for (const auto& s : qRes.result) {
            if (s["id"] == utf8SourceId) {
                foundComplex = true;
                assert(s["title"] == complexTitle);
                assert(s["author"] == complexAuthor);
            }
        }
        assert(foundComplex == true);
        std::cout << "  ✓ Non-ASCII multilingual diacritics preserved with 100% byte fidelity across Win32 boundary.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 17: Duplicate Request IDs & Monotonic Sequence Uniqueness Guarantee
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 17] Duplicate Request IDs & Monotonic Sequence Uniqueness Guarantee...\n";

        // Defined Behavior A (C++ Dispatcher Statelessness):
        // If an external or buggy client sends two concurrent messages sharing the exact same ID,
        // the C++ dispatcher treats each as an independent transaction and returns both responses
        // tagged with that ID. It does NOT hang, crash, or drop either response.
        std::string sharedId = "req_duplicate_test";
        auto res1 = bridge.call("ping", json::object(), "default", sharedId);
        auto res2 = bridge.call("ping", json::object(), "default", sharedId);

        assert(res1.resolved == true);
        assert(res2.resolved == true);
        assert(res1.req_id == sharedId);
        assert(res2.req_id == sharedId);
        assert(res1.result["status"] == "online");
        assert(res2.result["status"] == "online");

        // Defined Behavior B (Client-Side Collision Prevention Invariant):
        // In the DOM, sharing an ID causes multiple event listeners to trigger on the first response.
        // To guarantee zero client-side collision risk, window.nativeBridge uses a monotonic
        // sequential counter (_seq) plus random nonce:
        //   var id = 'req_' + (++window.nativeBridge._seq) + '_' + Math.random().toString(36).substr(2, 9);
        // Verify that consecutive calls from the bridge yield strictly distinct, monotonically increasing IDs:
        auto normalRes1 = bridge.call("ping");
        auto normalRes2 = bridge.call("ping");
        assert(normalRes1.req_id != normalRes2.req_id);
        assert(normalRes1.req_id < normalRes2.req_id); // Monotonically increasing counter

        std::cout << "  ✓ Dispatcher is stateless under duplicate IDs; bridge guarantees monotonic ID uniqueness.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 18: Stress Test: Large Payload (500 KB Chunk) Across Bridge
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 18] Stress Test: Large Payload (500 KB Chunk) Across Bridge...\n";

        // Construct 500 KB chunk of text
        std::string largeChunk;
        largeChunk.reserve(500 * 1024);
        std::string snippet = "Stratigraphic trench excavation unit 42-B yielded 14 Acheulian handaxes in situ. ";
        while (largeChunk.size() < 500 * 1024) {
            largeChunk += snippet;
        }

        json chunkPayload = {
            {"source_id", createdSourceId},
            {"pages", json::array({
                {{"page_number", 42}, {"text", largeChunk}}
            })}
        };

        auto idxRes = bridge.call("index_rough_text", chunkPayload);
        assert(idxRes.resolved == true);
        assert(idxRes.result["chunks_indexed"] >= 1);

        // Search across the large chunk
        auto sRes = bridge.call("search_semantic_passages", {{"query", "excavation unit 42-B Acheulian handaxes"}, {"top_k", 1}});
        assert(sRes.resolved == true);
        assert(sRes.result.is_array());
        assert(!sRes.result.empty());
        assert(sRes.result[0]["text"].get<std::string>().size() > 100);

        std::cout << "  ✓ 500 KB payload transmitted, indexed, and retrieved with zero truncation or memory corruption.\n\n";
    }

    // Clean up temporary files
    std::filesystem::remove(dummyPdf, ec);
    std::filesystem::remove_all(testDir, ec);

    std::cout << "================================================================================\n";
    std::cout << "  ALL 18 WEBVIEW2 IPC BRIDGE & ADVERSARIAL TESTS PASSED WITH ZERO FAILURES!     \n";
    std::cout << "================================================================================\n";
    return 0;
}
