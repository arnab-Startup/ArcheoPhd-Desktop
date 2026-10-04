#pragma once

#include <string>
#include <vector>
#include <map>
#include <functional>
#include <json.hpp>
#include "models.hpp"
#include "storage/storage.hpp"
#include "analysis/vector_index.hpp"
#include "analysis/contradictions.hpp"
#include "analysis/thesis_audit.hpp"
#include "core/system_inspector.hpp"
#include "validation/benchmark_seed.hpp"
#include "storage/data_root.hpp"
#include "extraction/document_extractor.hpp"
#include "extraction/ingestion_manager.hpp"

namespace archaeophd {

using json = nlohmann::json;

class NativeIpcDispatcher {
private:
    NativeStorage* storage_ = nullptr;
    NativeContradictionEngine* contradictions_ = nullptr;
    NativeThesisAuditor* thesisAuditor_ = nullptr;
    std::string currentDataRoot_;
    HWND hWnd_ = nullptr;
    std::function<bool(const std::string&)> initEngineCallback_;

public:
    NativeIpcDispatcher(
        NativeStorage* storage = nullptr,
        NativeContradictionEngine* contradictions = nullptr,
        NativeThesisAuditor* thesisAuditor = nullptr,
        std::string currentDataRoot = "",
        HWND hWnd = nullptr,
        std::function<bool(const std::string&)> initEngineCallback = nullptr
    ) : storage_(storage),
        contradictions_(contradictions),
        thesisAuditor_(thesisAuditor),
        currentDataRoot_(std::move(currentDataRoot)),
        hWnd_(hWnd),
        initEngineCallback_(std::move(initEngineCallback)) {}

    void set_storage(NativeStorage* s) { storage_ = s; }
    void set_contradictions(NativeContradictionEngine* c) { contradictions_ = c; }
    void set_thesis_auditor(NativeThesisAuditor* t) { thesisAuditor_ = t; }
    void set_data_root(const std::string& r) { currentDataRoot_ = r; }

    std::string dispatch(const std::string& inputJson) {
        json req;
        try {
            req = json::parse(inputJson);
        } catch (...) {
            return "{\"error\": \"Invalid JSON payload\"}";
        }

        // Structural validation of request
        if (!req.is_object()) {
            return "{\"error\": \"Invalid JSON payload: root must be an object\"}";
        }

        std::string reqId = req.value("id", "");
        if (reqId.empty()) {
            json errRes;
            errRes["id"] = "";
            errRes["error"] = "Invalid request: missing required 'id' field";
            return errRes.dump();
        }

        if (!req.contains("action") || !req["action"].is_string() || req["action"].get<std::string>().empty()) {
            json errRes;
            errRes["id"] = reqId;
            errRes["error"] = "Invalid request: missing or invalid 'action' field";
            return errRes.dump();
        }

        std::string action = req["action"].get<std::string>();
        std::string projectId = req.value("projectId", "default");

        if (req.contains("payload") && !req["payload"].is_object()) {
            json errRes;
            errRes["id"] = reqId;
            errRes["error"] = "Invalid request: 'payload' must be a JSON object";
            return errRes.dump();
        }
        json payload = req.value("payload", json::object());

        json res;
        res["id"] = reqId;

        // -------------------------------------------------------------
        // Group 1: Data Root & Host Management Endpoints
        // -------------------------------------------------------------
        try {
            if (action == "get_data_root_status") {
                auto st = DataRootManager::GetStatus();
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
                    auto st = DataRootManager::GetStatus();
                    initial = st.configured ? st.data_root : st.default_path;
                }
                std::string picked;
                bool ok = DataRootManager::BrowseForFolder(hWnd_, initial, picked);
                if (ok) {
                    std::string cloud = DataRootManager::DetectCloudSyncService(DataRootManager::Utf8ToWide(picked));
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
                std::string cloud = DataRootManager::DetectCloudSyncService(DataRootManager::Utf8ToWide(p));
                res["result"] = {
                    {"path", p},
                    {"cloud_service", cloud}
                };
                return res.dump();
            } else if (action == "set_data_root") {
                std::string newPath = payload.value("data_root", "");
                std::string err;
                bool ok = DataRootManager::SaveDataRoot(newPath, err);
                if (!ok) {
                    res["error"] = err.empty() ? "Failed to set Data Root" : err;
                    return res.dump();
                }
                if (initEngineCallback_) {
                    initEngineCallback_(newPath);
                }
                std::string cloud = DataRootManager::DetectCloudSyncService(DataRootManager::Utf8ToWide(newPath));
                res["result"] = {
                    {"status", "success"},
                    {"data_root", newPath},
                    {"cloud_service", cloud}
                };
                return res.dump();
            } else if (action == "reconnect_data_root") {
                auto st = DataRootManager::GetStatus();
                if (st.configured && !st.is_missing) {
                    if (initEngineCallback_) {
                        initEngineCallback_(st.data_root);
                    }
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
                auto st = DataRootManager::GetStatus();
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
        if (!storage_) {
            res["error"] = "Data Root is not configured or engine is initializing";
            return res.dump();
        }

        try {
            // -------------------------------------------------------------
            // Group 2: Core Knowledge Graph & Analysis Endpoints
            // -------------------------------------------------------------
            if (action == "get_contradictions") {
                if (!contradictions_) {
                    res["error"] = "Contradiction engine not initialized";
                    return res.dump();
                }
                auto conflicts = contradictions_->run_all(projectId);
                json arr = json::array();
                for (const auto& c : conflicts) arr.push_back(c);
                res["result"] = arr;
            } else if (action == "get_thesis_audit") {
                if (!thesisAuditor_) {
                    res["error"] = "Thesis auditor not initialized";
                    return res.dump();
                }
                res["result"] = thesisAuditor_->run_audit(projectId);
            } else if (action == "get_sites") {
                auto sites = storage_->get_sites(projectId);
                json arr = json::array();
                for (const auto& s : sites) arr.push_back(s);
                res["result"] = arr;
            } else if (action == "get_strata") {
                auto strata = storage_->get_strata(projectId);
                json arr = json::array();
                for (const auto& s : strata) arr.push_back(s);
                res["result"] = arr;
            } else if (action == "get_artifacts") {
                auto artifacts = storage_->get_artifacts(projectId);
                json arr = json::array();
                for (const auto& a : artifacts) arr.push_back(a);
                res["result"] = arr;
            } else if (action == "get_claims") {
                auto claims = storage_->get_claims(projectId);
                json arr = json::array();
                for (const auto& c : claims) arr.push_back(c);
                res["result"] = arr;
            } else if (action == "put_claim") {
                // Safeguarded Claim Write: Enforces hard-gate rejection against automated writes into Class B
                if (!payload.contains("claim") || !payload["claim"].is_object()) {
                    res["error"] = "Invalid request: 'claim' object is required for put_claim";
                    return res.dump();
                }
                Claim c = payload["claim"].get<Claim>();
                c.project_id = projectId;
                bool ok = storage_->put_claim_safeguarded(c, false);
                if (!ok) {
                    res["error"] = "Hard gate violation: Automated claim insertion is strictly prohibited for Class B sources. Only manual transcription is permitted.";
                } else {
                    storage_->save_state();
                    res["result"] = {{"success", true}, {"claim_id", c.id}};
                }
            } else if (action == "verify_claim_grounding") {
                std::string claimId = payload.value("claim_id", "");
                std::string correctedText = payload.value("corrected_text", "");
                std::string act = payload.value("action", "correct");
                auto claims = storage_->get_claims(projectId);
                bool found = false;
                for (auto& c : claims) {
                    if (c.id == claimId) {
                        if (act == "correct" && !correctedText.empty()) {
                            c.claim_text = correctedText;
                        }
                        c.verification_status = "VERIFIED";
                        c.anomaly_flag = false;
                        c.anomaly_reason = "";
                        storage_->put_claim(c);
                        found = true;
                        break;
                    }
                }
                storage_->save_state();
                res["result"] = {{"success", found}};
            } else if (action == "get_evidence") {
                auto evidence = storage_->get_evidence(projectId);
                json arr = json::array();
                for (const auto& e : evidence) arr.push_back(e);
                res["result"] = arr;
            } else if (action == "get_sources") {
                auto sources = storage_->get_sources(projectId);
                json arr = json::array();
                for (const auto& s : sources) arr.push_back(s);
                res["result"] = arr;
            } else if (action == "get_notes") {
                auto notes = storage_->get_notes(projectId);
                json arr = json::array();
                for (const auto& n : notes) arr.push_back(n);
                res["result"] = arr;
            } else if (action == "get_hardware_info") {
                res["result"] = NativeSystemInspector::get_hardware_info();
            } else if (action == "get_storage_breakdown") {
                res["result"] = NativeSystemInspector::get_storage_breakdown(currentDataRoot_.empty() ? "data" : currentDataRoot_);
            } else if (action == "load_benchmark") {
                seed_benchmark_corpus(*storage_, projectId);
                res["result"] = {{"status", "success"}, {"message", "Benchmark corpus loaded into native storage."}};
            } else if (action == "run_document_extraction" || action == "get_extraction_report" || action == "run_phase0_validation") {
                auto report = DocumentExtractor::RunExtractionEvaluation();
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
            }
            // -------------------------------------------------------------
            // Group 3: Phase 1 Gated Ingestion & Two-Plane Search Endpoints
            // -------------------------------------------------------------
            else if (action == "ingest_document") {
                if (!payload.contains("file_path") || !payload["file_path"].is_string() || payload["file_path"].get<std::string>().empty()) {
                    res["error"] = "Invalid request: 'file_path' is required for document ingestion";
                    return res.dump();
                }
                std::string filePath = payload["file_path"].get<std::string>();
                std::string title = payload.value("title", "");
                std::string author = payload.value("author", "");
                std::string year = payload.value("year", "");
                auto ingRes = IngestionManager::IngestDocument(*storage_, filePath, title, author, year, projectId);
                if (!ingRes.success) {
                    res["error"] = ingRes.message.empty() ? "Ingestion failed" : ingRes.message;
                } else {
                    res["result"] = {
                        {"success", ingRes.success},
                        {"source_id", ingRes.source_id},
                        {"degradation_class", ingRes.degradation_class},
                        {"status", ingRes.status},
                        {"original_bytes", ingRes.original_bytes},
                        {"compressed_bytes", ingRes.compressed_bytes},
                        {"sha256", ingRes.sha256_checksum},
                        {"message", ingRes.message}
                    };
                }
            } else if (action == "classify_source") {
                if (!payload.contains("source_id") || !payload["source_id"].is_string() || payload["source_id"].get<std::string>().empty()) {
                    res["error"] = "Invalid request: 'source_id' is required for classification";
                    return res.dump();
                }
                std::string sourceId = payload["source_id"].get<std::string>();
                std::string targetClass = "CLASS_B";
                if (payload.contains("target_class") && payload["target_class"].is_string()) {
                    targetClass = payload["target_class"].get<std::string>();
                }

                // TYPE SAFETY: confirmed_clean_offset MUST be a strict boolean true.
                // Strings ("true"), numbers (1), arrays ([true]), objects ({}) MUST NOT be coerced to true.
                bool confirmedCleanOffset = false;
                if (payload.contains("confirmed_clean_offset") && payload["confirmed_clean_offset"].is_boolean()) {
                    confirmedCleanOffset = payload["confirmed_clean_offset"].get<bool>();
                }

                std::string err;
                bool ok = IngestionManager::ClassifySource(*storage_, sourceId, targetClass, confirmedCleanOffset, err, projectId);
                if (!ok) {
                    res["error"] = err.empty() ? "Classification failed" : err;
                } else {
                    res["result"] = {{"success", true}, {"source_id", sourceId}, {"degradation_class", targetClass}};
                }
            } else if (action == "reflag_source_class") {
                if (!payload.contains("source_id") || !payload["source_id"].is_string() || payload["source_id"].get<std::string>().empty()) {
                    res["error"] = "Invalid request: 'source_id' is required for reflagging";
                    return res.dump();
                }
                std::string sourceId = payload["source_id"].get<std::string>();
                bool ok = IngestionManager::ReflagSourceToClassB(*storage_, sourceId, projectId);
                res["result"] = {{"success", ok}, {"source_id", sourceId}, {"degradation_class", "CLASS_B"}};
            } else if (action == "get_verification_queue") {
                std::string sourceId = payload.value("source_id", "");
                auto items = storage_->get_verification_items(projectId, sourceId);
                json arr = json::array();
                for (const auto& v : items) arr.push_back(v);
                res["result"] = arr;
            } else if (action == "resolve_verification_item") {
                if (!payload.contains("item_id") || !payload["item_id"].is_string() || payload["item_id"].get<std::string>().empty()) {
                    res["error"] = "Invalid request: 'item_id' is required for verification resolution";
                    return res.dump();
                }
                std::string itemId = payload["item_id"].get<std::string>();
                std::string resolutionType = payload.value("resolution_type", "");
                std::string overrideValue = payload.value("override_value", "");

                // ANTI-ANCHORING GUARDRAIL: Optical crop is mandatory for verification
                auto items = storage_->get_verification_items(projectId);
                const VerificationItem* targetItem = nullptr;
                for (const auto& it : items) {
                    if (it.id == itemId) { targetItem = &it; break; }
                }

                if (!targetItem) {
                    res["error"] = "Verification item not found: " + itemId;
                } else if (resolutionType != "REJECT" && targetItem->crop_image_path.empty()) {
                    res["error"] = "Anti-anchoring violation: Optical crop is mandatory for verification. Item cannot be resolved without visual crop evidence.";
                } else {
                    bool ok = storage_->resolve_verification_item(itemId, resolutionType, overrideValue);
                    if (!ok) {
                        res["error"] = "Failed to resolve verification item: invalid resolution type or internal error.";
                    } else {
                        res["result"] = {{"success", true}, {"item_id", itemId}, {"status", resolutionType}};
                    }
                }
            } else if (action == "get_transcription_template") {
                // ENFORCES ANTI-ANCHORING & ZERO PRE-FILL:
                // For Class B documents, return purely blank schema fields.
                // Never supply machine OCR guesses or pre-fills.
                std::string sourceId = payload.value("source_id", "");
                int pageNumber = 1;
                if (payload.contains("page_number") && payload["page_number"].is_number_integer()) {
                    pageNumber = payload["page_number"].get<int>();
                }
                res["result"] = {
                    {"source_id", sourceId},
                    {"page_number", pageNumber},
                    {"prefill_enabled", false},
                    {"fields", json::array({
                        {{"field_name", "entity_name"}, {"value", ""}, {"placeholder", "Enter transcribed entity name"}},
                        {{"field_name", "value"}, {"value", ""}, {"placeholder", "Enter exact transcribed measurement/text"}},
                        {{"field_name", "type"}, {"value", "measurement"}, {"placeholder", "measurement / date / locus / artifact"}}
                    })}
                };
            } else if (action == "save_manual_transcription") {
                if (!payload.contains("source_id") || !payload["source_id"].is_string() || payload["source_id"].get<std::string>().empty()) {
                    res["error"] = "Invalid request: 'source_id' is required for manual transcription";
                    return res.dump();
                }
                std::string sourceId = payload["source_id"].get<std::string>();
                int pageNumber = 1;
                if (payload.contains("page_number") && payload["page_number"].is_number_integer()) {
                    pageNumber = payload["page_number"].get<int>();
                }
                if (!payload.contains("facts") || !payload["facts"].is_array()) {
                    res["error"] = "Invalid request: 'facts' must be an array of transcribed entities";
                    return res.dump();
                }
                json facts = payload["facts"];
                bool ok = IngestionManager::SaveManualTranscription(*storage_, sourceId, pageNumber, facts, projectId);
                if (!ok) {
                    res["error"] = "Failed to save manual transcription: internal storage failure.";
                } else {
                    res["result"] = {{"success", true}, {"source_id", sourceId}, {"page_number", pageNumber}};
                }
            } else if (action == "index_rough_text") {
                std::string sourceId = payload.value("source_id", "");
                json pages = payload.value("pages", json::array());
                std::vector<std::pair<int, std::string>> pageTexts;
                for (const auto& p : pages) {
                    int num = p.value("page_number", 1);
                    std::string txt = p.value("text", "");
                    pageTexts.push_back({num, txt});
                }
                int count = IngestionManager::IndexRoughTextForSearch(*storage_, sourceId, pageTexts, projectId);
                res["result"] = {{"success", true}, {"source_id", sourceId}, {"chunks_indexed", count}};
            } else if (action == "search_semantic_passages") {
                std::string query = payload.value("query", "");
                int topK = 5;
                if (payload.contains("top_k") && payload["top_k"].is_number_integer()) {
                    topK = payload["top_k"].get<int>();
                }
                auto queryEmb = VectorIndex::embed_text(query);
                auto matches = storage_->vectors().search(queryEmb, topK);

                // Cross-reference sources table to attach UI degradation and badging guardrails
                auto sources = storage_->get_sources(projectId);
                std::map<std::string, Source> sourceMap;
                for (const auto& s : sources) sourceMap[s.id] = s;

                // Cross-reference claims for chunk-level grounding precision
                auto claims = storage_->get_claims(projectId);

                json arr = json::array();
                for (const auto& m : matches) {
                    std::string degClass = "CLASS_B";
                    std::string ingStatus = "UNVERIFIED_ROUGH_SCAN";
                    auto sit = sourceMap.find(m.doc_id);
                    if (sit != sourceMap.end()) {
                        degClass = sit->second.degradation_class;
                        ingStatus = sit->second.ingestion_status;
                    }

                    // Check chunk/page level grounding: has this specific page been manually verified?
                    int verifiedFactsOnPage = 0;
                    std::string targetPageRef = "p." + std::to_string(m.page_ref);
                    for (const auto& c : claims) {
                        if (c.source_id == m.doc_id && c.page_ref == targetPageRef && c.verification_status == "VERIFIED") {
                            verifiedFactsOnPage++;
                        }
                    }

                    bool isChunkVerified = (verifiedFactsOnPage > 0);
                    bool isDocFullyVerified = (ingStatus == "VERIFIED_MANUAL" || ingStatus == "COMPLETED");

                    // Precise Badge Logic:
                    // 1. Fully verified document -> "VERIFIED_MANUAL" or "VERIFIED_CONSENSUS" (green/blue)
                    // 2. Partially verified page with human grounding -> "PARTIALLY_VERIFIED" (clean status)
                    // 3. Otherwise unverified machine OCR -> "UNVERIFIED_ROUGH_SCAN" (amber warning)
                    std::string badge;
                    bool isRough = false;
                    if (isDocFullyVerified) {
                        badge = (ingStatus == "VERIFIED_MANUAL") ? "VERIFIED_MANUAL" : "VERIFIED_CONSENSUS";
                        isRough = false;
                    } else if (isChunkVerified) {
                        badge = "PARTIALLY_VERIFIED";
                        isRough = false;
                    } else {
                        badge = "UNVERIFIED_ROUGH_SCAN";
                        isRough = true;
                    }

                    arr.push_back({
                        {"chunk_id", m.chunk_id},
                        {"doc_id", m.doc_id},
                        {"page_ref", m.page_ref},
                        {"score", m.score},
                        {"text", storage_->read_compressed_chunk(m.chunk_id)},
                        {"degradation_class", degClass},
                        {"ingestion_status", ingStatus},
                        {"is_unverified_rough_scan", isRough},
                        {"badge", badge},
                        {"verified_facts_on_page", verifiedFactsOnPage},
                        {"has_page_grounding", isChunkVerified}
                    });
                }
                res["result"] = arr;
            } else {
                res["error"] = "Unknown native action: " + action;
            }
        } catch (const std::exception& e) {
            res["error"] = e.what();
        }

        return res.dump();
    }
};

} // namespace archaeophd
