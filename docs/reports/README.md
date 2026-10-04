# ArchaeoPhD Desktop — Engineering & Verification Reports

This directory contains the complete technical reports and empirical benchmark findings produced during **Phase 0 (Extraction Validation)** and **Phase 1 (Ingestion & Adversarial Gating)** for the ArchaeoPhD native Windows desktop workstation.

---

## Technical Reports Index

| Report | Title | Core Focus & Empirical Findings |
| :--- | :--- | :--- |
| [**Report 01**](01_ocr_engine_and_preprocessing_benchmark.md) | **OCR Engine & Preprocessing Benchmark** | 50 pages, 166 blind ground truth facts. Otsu/Sauvola binarization degradation finding (`2040 cm` $\to$ `0-40 thick`). Class A (88.46% accuracy) vs Class B (53.23% - 62.90%). 0% false consensus across 47 silent errors. |
| [**Report 02**](02_dual_engine_routing_and_verification.md) | **Dual-Engine Routing & Verification Architecture** | Native C++ router implementation (`dual_engine_router.hpp`). 4-way routing state machine: 119 auto-accepted, 9 verification queue, 20 rejected, 18 hard-gated Class B. Zero discrepancy reproduction check. |
| [**Report 03**](03_vlm_degraded_scan_feasibility_investigation.md) | **Local VLM Feasibility on Degraded Letterpress** | SmolVLM-256M evaluation on porous bleed-through paper. Visual downsampling collapse. 4/7 silent corruptions (`1966` $\to$ `1656`, `20-40` $\to$ `20-10`, `694` $\to$ `74`). Tier 3 triggered: Class B permanently manual. |
| [**Report 04**](04_phase1_ingestion_and_adversarial_gating_test_report.md) | **Document Ingestion, Adversarial Gating & Search Plane Isolation** | Full 11-test adversarial test harness passed (100%). Removal of date heuristics. Prominent optical crop enforcement. Two-plane architecture: Search discovery (`UNVERIFIED_ROUGH_SCAN`) vs Knowledge Graph truth isolation. Retroactive purge on reflag (Gap 1) and atomic content flush (Gap 2). |
| [**Report 05**](05_phase1_step2_ipc_webview2_bridge_test_report.md) | **WebView2 IPC Bridge & UI Guardrails Test Report** | Full 18-test JSON IPC bridge harness passed (100%). Win32 UTF-16/UTF-8 round-trip transport, adversarial type confusion defense, scoped passage badging, and live WebView2 execution. |
| [**Report 06**](06_phase1_step3_native_ui_integration_report.md) | **Native UI Integration & Workflow Guardrails** | Full 24-test IPC and Native UI suite passed (100%). Covers Ingestion Screen (`showIngestionModal`), Classification Dialog (`showClassificationModal`), Verification Queue (`showVerificationQueueModal`) with Anti-Anchoring Lockout, and Manual Transcription (`showManualTranscriptionModal`) with Zero Pre-Fill Invariant. Standalone binary rebuilt and verified live. |
| [**Report 07**](07_phase1_step4_vector_persistence_and_gguf_retrieval_report.md) | **Vector Persistence, In-Process GGUF Embedding & Retrieval Benchmark** | Full 8-test durability suite and 20-query pre-registered benchmark passed (100%). Zero-external-daemon in-process GGUF inference (`nomic-embed-text-v1.5.Q4_K_M.gguf`, 128-dim Matryoshka). Recall@5: 85.0% (Wilson [64.0%, 94.8%]), MRR@10: 0.7571, Latency: 23.4ms. Compile-time stub exclusion. Pure C++ PDF stream extractor (`extract_archive_text`) closing ingest→archive→extract→embed→search join (Check 9). |
| [**Report 08**](08_phase1_step5_hybrid_retrieval_and_bm25_fusion_report.md) | **Hybrid Lexical (BM25) + Dense Vector Retrieval & Disambiguation** | Pure C++ Okapi BM25 index + Reciprocal Rank Fusion ($k=60$). Resolves intra-document near-neighbor collisions. Recall@5: 95.0% (+10 pp), Recall@1: 80.0% (+15 pp), Recall@10: 100.0% (+15 pp), MRR: 0.8521 (+0.0950), Latency: 22.48 ms (<25 ms gate). Wilson 95% CI: $[76.4\%,\; 99.1\%]$. Zero regressions across all 43 automated assertions. |
| [**Report 09**](09_phase1_final_signoff_report.md) | **Phase 1 Final Signoff & Verification Audit** | Comprehensive audit across all 5 test harnesses and 72 assertions (100% pass rate). Zero regressions. Formal closure of Phase 1 (Ingestion & Adversarial Gating) and architectural transition plan to Phase 2 (Knowledge Graph & Unified Store). |

---

## Standing Architectural Principles Established in Phase 0

1. **"A Blank Field is Safer Than a Plausible-Looking Wrong One"**:
   - The application shall **never pre-fill form fields** with low-confidence or single-engine extractions. Cognitive confirmation bias makes plausible errors (e.g., `1656` instead of `1966`) significantly more dangerous than leaving a blank field for human entry.
2. **Dual-Engine Consensus Safety Gate**:
   - Auto-write to the database is only permitted when two orthogonal OCR engines (Windows Native OCR + Tesseract LSTM) agree with 100% character identity on Class A documents.
3. **Strict Document Ingestion Gating**:
   - All newly imported documents default to **Class B (Degraded / Manual Transcription)**. Class A requires explicit researcher confirmation. Any document can be re-flagged to Class B with 1 click.
4. **Permanent Manual Transcription for Class B**:
   - Degraded 19th–20th century letterpress with ink bleed-through is permanently routed to split-screen human transcription. No automated ML or assistive pre-fill will be attempted.
