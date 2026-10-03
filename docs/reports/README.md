# ArchaeoPhD Desktop — Phase 0 Engineering Reports

This directory contains the complete technical reports and empirical benchmark findings produced during **Phase 0 (PDF Ingestion & Text Extraction Validation)** for the ArchaeoPhD native Windows desktop workstation.

---

## Technical Reports Index

| Report | Title | Core Focus & Empirical Findings |
| :--- | :--- | :--- |
| [**Report 01**](01_ocr_engine_and_preprocessing_benchmark.md) | **OCR Engine & Preprocessing Benchmark** | 50 pages, 166 blind ground truth facts. Otsu/Sauvola binarization degradation finding (`2040 cm` $\to$ `0-40 thick`). Class A (88.46% accuracy) vs Class B (53.23% - 62.90%). 0% false consensus across 47 silent errors. |
| [**Report 02**](02_dual_engine_routing_and_verification.md) | **Dual-Engine Routing & Verification Architecture** | Native C++ router implementation (`dual_engine_router.hpp`). 4-way routing state machine: 119 auto-accepted, 9 verification queue, 20 rejected, 18 hard-gated Class B. Zero discrepancy reproduction check. |
| [**Report 03**](03_vlm_degraded_scan_feasibility_investigation.md) | **Local VLM Feasibility on Degraded Letterpress** | SmolVLM-256M evaluation on porous bleed-through paper. Visual downsampling collapse. 4/7 silent corruptions (`1966` $\to$ `1656`, `20-40` $\to$ `20-10`, `694` $\to$ `74`). Tier 3 triggered: Class B permanently manual. |

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
