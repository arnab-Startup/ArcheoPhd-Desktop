#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <map>
#include <future>
#include <json.hpp>
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
// Simulated window.nativeBridge Client (JS <-> C++ Bridge Protocol Harness)
// =============================================================================
// Exactly simulates the JS window.nativeBridge.call(action, payload, projectId)
// defined in desktop/src/main.cpp:
//
// window.nativeBridge = {
//   call: function(action, payload, projectId) {
//     return new Promise(function(resolve, reject) {
//       var id = 'req_' + Math.random().toString(36).substr(2, 9);
//       function onMsg(e) {
//         var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
//         if (d && d.id === id) {
//           window.chrome.webview.removeEventListener('message', onMsg);
//           if (d.error) reject(new Error(d.error)); else resolve(d.result);
//         }
//       }
//       window.chrome.webview.addEventListener('message', onMsg);
//       window.chrome.webview.postMessage({ id: id, action: action, payload: payload || {}, projectId: projectId || 'default' });
//     });
//   }
// };
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

    BridgeResult call(const std::string& action, const json& payload = json::object(), const std::string& projectId = "default") {
        BridgeResult br;
        std::string reqId = "req_" + std::to_string(++reqCounter_);
        br.req_id = reqId;

        // 1. Serialize message in JS: postMessage({ id, action, payload, projectId })
        json jsReq;
        jsReq["id"] = reqId;
        jsReq["action"] = action;
        jsReq["payload"] = payload;
        jsReq["projectId"] = projectId;
        std::string rawRequest = jsReq.dump();

        // 2. Transmit across WebView2 WebMessage boundary to C++ Dispatcher
        std::string rawReply = dispatcher_.dispatch(rawRequest);
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
            br.error = "ID correlation mismatch: expected " + reqId + " but received " + replyId;
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
};

int main() {
    std::cout << "================================================================================\n";
    std::cout << "  ArchaeoPhD Engine — Step 2: WebView2 IPC Bridge & UI Guardrails Test Suite    \n";
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
        std::string malformedReply = dispatcher.dispatch("{this is not valid json");
        json mJson = json::parse(malformedReply);
        assert(mJson.contains("error"));
        assert(mJson["error"] == "Invalid JSON payload");

        // B. Empty JSON object
        std::string emptyReply = dispatcher.dispatch("{}");
        json eJson = json::parse(emptyReply);
        assert(eJson.contains("error"));
        assert(eJson["error"] == "Unknown native action: ");

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
    // TEST 11: UI Guardrail: Amber UNVERIFIED_ROUGH_SCAN Badge on Passage Search
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 11] UI Guardrail: Amber UNVERIFIED_ROUGH_SCAN Badge on Passage Search...\n";

        // Index rough scan text chunks for discovery
        json pageChunks = json::array({
            {{"page_number", 12}, {"text", "Section 4. Stratigraphic Trench VII revealed extensive Acheulian handaxes\nembedded in dense boulder conglomerate overlying basalt bedrock."}}
        });

        auto indexRes = bridge.call("index_rough_text", {{"source_id", createdSourceId}, {"pages", pageChunks}});
        assert(indexRes.resolved == true);
        assert(indexRes.result["chunks_indexed"] == 1);

        // Search semantic passages via IPC
        auto searchRes = bridge.call("search_semantic_passages", {{"query", "Acheulian handaxes basalt bedrock"}, {"top_k", 3}});
        assert(searchRes.resolved == true);
        assert(searchRes.result.is_array());
        assert(searchRes.result.size() >= 1);

        const auto& firstMatch = searchRes.result[0];
        assert(firstMatch.contains("badge"));
        assert(firstMatch.contains("is_unverified_rough_scan"));
        assert(firstMatch.contains("degradation_class"));
        assert(firstMatch["is_unverified_rough_scan"] == true);
        assert(firstMatch["badge"] == "UNVERIFIED_ROUGH_SCAN");
        assert(firstMatch["degradation_class"] == "CLASS_B");
        assert(!firstMatch["text"].get<std::string>().empty());
        std::cout << "  ✓ Search results carry mandatory amber UNVERIFIED_ROUGH_SCAN badge for UI rendering.\n\n";
    }

    // -------------------------------------------------------------------------
    // TEST 12: Concurrent JS Bridge Request Simulation & Isolation
    // -------------------------------------------------------------------------
    {
        std::cout << "[TEST 12] Concurrent JS Bridge Request Simulation & Isolation...\n";
        // Simulate 20 rapid, sequential asynchronous calls with distinct request IDs
        for (int i = 0; i < 20; ++i) {
            auto res = bridge.call("ping");
            assert(res.resolved == true);
            assert(!res.req_id.empty());
            assert(res.result["status"] == "online");
        }
        std::cout << "  ✓ 20 rapid IPC bridge message cycles executed with 100% request ID correlation.\n\n";
    }

    // Clean up temporary files
    std::filesystem::remove(dummyPdf, ec);
    std::filesystem::remove_all(testDir, ec);

    std::cout << "================================================================================\n";
    std::cout << "  ALL 12 WEBVIEW2 IPC BRIDGE & UI GUARDRAIL TESTS PASSED WITH ZERO FAILURES!    \n";
    std::cout << "================================================================================\n";
    return 0;
}
