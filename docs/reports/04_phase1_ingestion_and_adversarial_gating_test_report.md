# Phase 1 — Technical Report 04: Document Ingestion, Adversarial Gating, and Search Plane Isolation Test Report

**Author:** ArchaeoPhD Core Team  
**Date:** October 2026  
**Scope:** Native Ingestion Pipeline, Fail-Safe Source Classification, Adversarial Gating Harness, Two-Plane Architecture (Search vs Knowledge Graph), and Manual Transcription Protocol  
**Implementation Files:** `desktop/engine/extraction/ingestion_manager.hpp`, `desktop/engine/storage/storage.hpp`, `desktop/engine/core/models.hpp`, `desktop/engine/analysis/vector_index.hpp`, `desktop/src/main.cpp`  
**Test Suite:** `desktop/tests/test_ingestion_gating_adversarial.cpp` (Binary: `tests/test_ingestion_gating_adversarial.exe`)  

---

## 1. Executive Summary & Test Verdict

Phase 1 translates the empirical findings from Phase 0 (166-fact OCR benchmark, dual-engine router, and local VLM letterpress collapse) into the production C++ engine architecture. Rather than relying on UI conventions or advisory flags, safety guarantees are enforced as hard, programmatic gates at the storage and ingestion layer.

To validate these defenses, a dedicated **11-Test Adversarial Ingestion & Gating Test Suite** was compiled and executed natively on Windows.

### Test Suite Execution Summary

```
================================================================================
  ArchaeoPhD Engine — Adversarial Ingestion Gating & Safeguard Test Suite       
================================================================================
[TEST 1] Ingestion Defaults strictly to Class B (Default-Safe)...                 PASSED ✓
[TEST 2] Malformed & Date-Heuristic Class Strings Fail-Safe to Class B...         PASSED ✓
[TEST 3] Class A Rejection Without Explicit Physical Print Confirmation...        PASSED ✓
[TEST 4] Direct Automated Write Injection on Class B is Programmatically Blocked.. PASSED ✓
[TEST 5] Valid Class A Upgrade and Dual-Engine Verification Routing...             PASSED ✓
[TEST 6] RETROACTIVE PURGE on Mid-Session Reflag (A -> B)...                      PASSED ✓
[TEST 7] Search Indexing vs Knowledge Graph Truth-Plane Isolation...              PASSED ✓
[TEST 8] Manual Transcription Commits Clean Grounded Facts (No Pre-Fill)...       PASSED ✓
[TEST 9] Crash/Restart State Recovery Preserves Class B Gating from Disk...       PASSED ✓
[TEST 10] Interrupted Ingestion Atomicity (IO Failure Cleanup)...                 PASSED ✓
[TEST 11] Upgrading B -> A Mid-Session Preserves All Grounded Manual Facts...     PASSED ✓
================================================================================
  ALL 11 ADVERSARIAL INGESTION & GATING TESTS PASSED WITH ZERO FAILURES!
================================================================================
Exit Code: 0 (Execution Duration: ~45ms)
```

---

## 2. Adversarial Review Scorecard: Gap Closure & Status

Following architectural critique of the initial 9-test harness, three critical failure modes and one UI requirement were audited and resolved:

| Audit Item | Scenario / Risk | Resolution Mechanism | Verification Test | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Gap 1: Retroactive Purge on Reflag (A $\to$ B)** | 40 pages of Class A consensus facts auto-commit; user finds bleed-through on p.41 and reflags to B. Committed OCR consensus facts remain in DB. | In `reflag_source_to_class_b()`: (1) all claims where `origin_type != "manual_transcription"` are purged, AND (2) all pending `VerificationItem` entries for this source are marked `REJECTED_DUE_TO_RECLASSIFICATION`. Both loops run atomically. Only human double-entry survives. | **Test 6** | ✅ **CLOSED** |
| **Gap 2: Interrupted / Partial Ingestion** | Crash or IO error during ingestion leaves orphaned, unclassified source records or half-copied archive files on disk. | `IngestDocument()` writes to a `*.pdf.bin.tmp` staging file and renames via `MoveFileExA(MOVEFILE_REPLACE_EXISTING \| MOVEFILE_WRITE_THROUGH)`. On any IO error, the temp file is unlinked and no storage record is created. **What Test 10 proves:** the no-orphan property (unreadable file → `success=false` with zero records and zero `.tmp` files). **What it cannot prove:** true power-loss atomicity at the hardware level — that guarantee comes from `MOVEFILE_WRITE_THROUGH` forcing the directory entry update to disk before the call returns, not from the test. | **Test 10** | ✅ **CLOSED (bounded)** |
| **Gap 3: Reverse Reclassification (B $\to$ A)** | Source with human-transcribed Class B facts is later confirmed clean offset (Class A). Manual facts could be corrupted or overwritten. | `ClassifySource()` updates source metadata and unlocks dual-engine routing for future pages, while leaving 100% of existing `manual_transcription` claims intact and verified. | **Test 11** | ✅ **CLOSED** |
| **UI Anchor: Rough Search Result Badging** | Researcher searching `UNVERIFIED_ROUGH_SCAN` passages might cognitively treat rough OCR text as ground truth. | Search results will carry a distinct amber/striped visual badge indicating unverified rough scan text, distinct from verified claims. | Scheduled for UI Step | 📋 **LOCKED (UI)** |

---

## 3. Locked Core Requirements & Architectural Safeguards

Prior to Phase 1 implementation, four critical architectural decisions were pre-locked to ensure long-term stability:

### 3.1 Elimination of Date Heuristics ("Modern print >1980" Dropped)
- **Problem:** Calendar year (e.g. `>1980`) is not a valid proxy for print degradation. A university press document from 1995 printed on porous acidic paper suffers from severe reverse-side bleed-through, while a well-preserved 1950s offset volume may be pristine. Smuggling a calendar year into classification logic reintroduces silent false consensus.
- **Engine Enforcement:** All date heuristics were purged from classification code, data models, and prompt strings. Upgrading a document to `CLASS_A` requires explicit confirmation of physical printing criteria:
  1. Opaque, non-porous paper stock.
  2. High-contrast, sharp black-on-white typography.
  3. Total absence of reverse-side ink bleed-through.

### 3.2 Prominent Optical Crop in Discrepancy Resolution
- **Problem:** When two OCR engines disagree, presenting candidate pills (`Candidate A: 2040 cm` vs `Candidate B: 20-40 cm`) side by side creates cognitive anchoring. A tired researcher is primed to pick one candidate without checking the primary source.
- **Engine Enforcement:** `VerificationItem` binds the physical crop coordinate and image path (`optical_crop_path`) as the primary anchor. The UI contract mandates that the optical crop is centered and prominent, requiring the user to inspect the source crop before selecting or entering an override in a blank field.

### 3.3 Two Distinct Data Planes: Search Indexing vs. Knowledge Graph of Record
- **Problem:** Ingesting a Class B document without automated extraction leaves it invisible to full-text library search until a human transcribes it. Conversely, indexing unverified text into the Knowledge Graph corrupts quantitative archaeological truth.
- **Engine Enforcement:** The system decouples the repository into two isolated data planes:
  1. **Unstructured Search Plane (`VectorIndex`):** Full OCR rough text is split into chunks and indexed with status `UNVERIFIED_ROUGH_SCAN`. This enables immediate semantic passage retrieval across the entire PDF collection, with results clearly badged as rough/unverified.
  2. **Structured Knowledge Graph of Record (`NativeStorage` claims):** Hard-gated against automated writes. Zero claims are written to the database for Class B documents without verified human transcription.

```
                              [ Ingested PDF Document ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     [ SEARCH DATA PLANE ]                           [ TRUTH DATA PLANE ]
   (Vector Index & Text Chunks)                   (Knowledge Graph & Claims)
                  │                                               │
   Chunks marked with status:                      Source Classification Gate:
    "UNVERIFIED_ROUGH_SCAN"                         • Class B: Hard-gated (0 auto-writes)
                  │                                 • Class A: Dual-engine consensus only
                  ▼                                               │
   [ Instant Semantic Discovery ]                                 ▼
   (Badged as Unverified Scan)                     [ Grounded Archaeological Truth ]
```

### 3.4 Retroactive Reflagging Purge & No Assistive Pre-Fill Principle
- **Retroactive Reflag Invariant:** If a researcher starts reviewing a document and discovers bleed-through on later pages, clicking **"Reflag to Class B"** immediately purges all staged/unverified claims and all previously auto-committed OCR consensus claims from that source, cancels pending verification items, and permanently blocks further automated writes. Only verified human double-entry (`origin_type == "manual_transcription"`) is retained.
- **No Assistive Pre-Fill Rule:** Manual transcription forms (`save_manual_transcription`) are rendered completely empty. In accordance with the finding *"A blank field is safer than a plausible-looking wrong one,"* no low-confidence or machine-guessed values are ever inserted into input fields.

---

## 4. Adversarial Test Suite Specification & Results

The test suite in `desktop/tests/test_ingestion_gating_adversarial.cpp` subjected the engine to hostile and edge-case inputs:

### Test 1: Ingestion Defaults Strictly to Class B (Default-Safe)
- **Objective:** Verify that any document ingested through `IngestionManager::IngestDocument` defaults to `CLASS_B` with `confirmed_clean_offset == false` and status `UNVERIFIED_ROUGH_SCAN`.
- **Assertion:** `sources[0].degradation_class == "CLASS_B"` and zero claims exist in storage.
- **Result:** **PASS**. Clean initial state.

### Test 2: Malformed and Date-Heuristic Class Strings Fail-Safe to Class B
- **Objective:** Attempt to inject non-standard, malformed, or heuristic class identifiers: `""`, `"CLASS_C"`, `"1980"`, `">1980"`, `"MODERN_OFFSET"`, `"random_junk"`.
- **Assertion:** Ingestion manager must reject all unvalidated strings and retain `CLASS_B`.
- **Result:** **PASS**. 100% of invalid classifications fail-safe to `CLASS_B`.

### Test 3: Class A Upgrade Blocked Without Physical Print Confirmation
- **Objective:** Call `ClassifySource(storage, id, "CLASS_A", false, err)` attempting to upgrade to Class A while passing `confirmed_clean_offset = false`.
- **Assertion:** Call must return `false`, return an explicit explanatory error message, and leave the document as `CLASS_B`.
- **Result:** **PASS**. Blocked with error: *"Class A requires explicit physical print confirmation: opaque paper, high-contrast black-on-white text, and zero reverse-side ink bleed-through."*

### Test 4: Direct Automated Write Injection on Class B is Programmatically Blocked
- **Objective:** Adversarially bypass the router and attempt to directly insert an unverified claim (`put_claim_safeguarded(claim, is_manual=false)`) into a Class B source.
- **Assertion:** Storage layer must detect that the source is `CLASS_B` and return `false`, dropping the claim before writing to disk.
- **Result:** **PASS**. Zero claims written to disk.

### Test 5: Valid Class A Upgrade and Dual-Engine Verification Routing
- **Objective:** Confirm physical print criteria and ingest two facts: Fact 1 with dual-engine consensus (`1963` == `1963`), Fact 2 with discrepancy (`2040 cm` vs `20-40 cm`), and 1 manual fact (`Gudrun Corvinus`).
- **Assertion:**
  - Fact 1 auto-commits to storage as a verified claim (`Chirki Discovery Year: 1963`).
  - Fact 2 is staged in `VerificationItem` with status `PENDING` and crop reference.
  - Manual fact commits as verified human entry.
- **Result:** **PASS**. Consensus auto-accepted; discrepancy safely queued.

### Test 6: Retroactive Purge on Mid-Session Reflag (A $\to$ B)
- **Objective:** Simulate a researcher discovering ink bleed-through on page 41 and triggering `ReflagSourceToClassB`.
- **Assertion:**
  - Document status updates to `CLASS_B`, `confirmed_clean_offset = false`.
  - The auto-committed OCR consensus claim (`Chirki Discovery Year: 1963`) is **retroactively purged**.
  - The human manual claim (`Gudrun Corvinus`) is **strictly preserved**.
  - Pending verification items are marked `REJECTED_DUE_TO_RECLASSIFICATION`.
  - Subsequent automated writes are immediately blocked.
- **Result:** **PASS**. Machine extractions wiped cleanly; human ground truth preserved.

### Test 7: Search Indexing vs. Knowledge Graph Truth-Plane Isolation
- **Objective:** Index rough full-text OCR scan into the vector index (`VectorIndex`) for semantic discovery while checking Knowledge Graph claim count.
- **Assertion:**
  - `storage.vectors().search(...)` finds the passage based on vector embeddings.
  - `storage.get_claims().size()` remains unchanged (0 automated writes created).
- **Result:** **PASS**. Total isolation between the Search plane and Truth plane.

### Test 8: Manual Transcription Commits Clean Grounded Facts
- **Objective:** Save human double-entry facts (`20-40 cm`, `694 tools`) using `SaveManualTranscription`.
- **Assertion:**
  - Source status updates to `VERIFIED_MANUAL`.
  - Claims saved with `origin_type = "manual_transcription"` and `verification_status = "VERIFIED"`.
- **Result:** **PASS**. Verbatim human-entered facts accurately committed.

### Test 9: Crash/Restart State Recovery Preserves Class B Gating Across Disk Cycles
- **Objective:** Simulate application crash or restart by creating a new `NativeStorage` instance bound to the existing database folder. Attempt automated injection against the reloaded state.
- **Assertion:** Persisted metadata correctly restores `CLASS_B` status; automated injection on reloaded state is rejected.
- **Result:** **PASS**. Gate remains active and tamper-proof across restarts.

### Test 10: Interrupted Ingestion Atomicity (IO Failure Cleanup)
- **Objective:** Simulate a failure mid-ingestion (e.g. non-existent file or write failure).
- **Assertion:**
  - `IngestDocument()` returns `success == false`.
  - Zero orphaned source records are committed to storage.
  - Zero `.tmp` files are leaked into the archives directory.
- **Result:** **PASS**. Atomic rollback verified.

### Test 11: Reverse Reclassification (B $\to$ A) Preserves Grounded Manual Facts
- **Objective:** Take a Class B document containing 3 verified human manual transcriptions and upgrade it to Class A after verifying physical print criteria.
- **Assertion:**
  - Source status upgrades to `CLASS_A`.
  - All 3 human manual transcriptions remain completely intact and `VERIFIED`.
- **Result:** **PASS**. Human double-entry claims preserved without alteration.

---

## 5. Native Host & IPC Endpoint Specification

All features are exposed to the desktop UI via pure in-memory Windows WebView2 IPC (`window.nativeBridge`):

| Endpoint Name | Input Parameters | Return Value | Safety Behavior |
| :--- | :--- | :--- | :--- |
| `ingest_document` | `file_path`, `title`, `author`, `year` | `source_id`, `class`, `status` | Defaults strictly to `CLASS_B`; atomic file staging |
| `classify_source` | `source_id`, `class_type`, `confirmed_clean_offset` | `success`, `error` | Rejects `CLASS_A` without clean offset confirmation |
| `reflag_source_class`| `source_id`, `target_class` | `success`, `purged_items` | Retroactively purges all automated claims on downgrade |
| `get_verification_queue`| `source_id` (optional) | Array of `VerificationItem` | Includes mandatory image crop link and candidate values |
| `resolve_verification_item`| `item_id`, `selected_value`, `manual_override` | `success` | Commits verified claim; marks item `RESOLVED` |
| `save_manual_transcription`| `source_id`, `page_number`, `facts` | `success`, `claims_committed` | Empty-form human entry; sets `origin_type="manual"` |
| `search_semantic_passages`| `query`, `top_k` | Array of text chunks + status | Returns passages badged as `UNVERIFIED_ROUGH_SCAN` |

---

## 6. Platform Scope: Windows-Only (v1) — Deliberate Decision

Every component of Phase 0 and Phase 1 engineering is Windows-specific by deliberate design:

- **OCR Engines:** Windows Native OCR (`Windows.Media.Ocr.OcrEngine`, WinRT) and Tesseract 5.4.1 (MinGW build).
- **Host Process:** Win32 application with WebView2 embedding.
- **File Atomicity:** `MoveFileExA` (Win32 API).
- **Binary:** `ArchaeoPhD.exe`, statically linked MinGW G++ C++20, zero DLL dependencies.

### The Load-Bearing Dependency That Must Be Stated Explicitly

**Windows OCR is structural to the dual-engine safety model.** The core safety guarantee — that a 0% false consensus rate on auto-accepted facts was empirically validated across 166 blind ground-truth facts — was demonstrated with the specific pairing of Windows Native OCR and Tesseract LSTM. The Class A auto-accept gate is calibrated to *that pair*.

If ArchaeoPhD is ported to macOS or Linux, Windows Native OCR is not available. A replacement engine pairing (e.g., Tesseract + PaddleOCR, or Tesseract + EasyOCR) would need to be identified, and the **full 166-fact benchmark methodology from Phase 0 (Report 01) would need to be rerun against the new pairing** before any Class A auto-accept logic could be trusted on those platforms. This is not a minor porting task — it is a second empirical validation cycle.

**Decision recorded:** Shipping Windows-first is an explicit scope choice. Cross-platform support is deferred. The Class A dual-engine safety argument is not portable until a new benchmark certifies a replacement engine pair.

---

## 7. Architectural Conclusions

1. **Safety is Retroactive, Not Just Forward-Looking:** Reflagging a source to Class B does not merely stop future writes — it actively purges all committed machine consensus facts AND cancels pending verification items in a single atomic operation. Only verified human double-entry survives.
2. **Epistemic Hygiene Confirmed:** Dropping the calendar year heuristic and requiring physical print confirmation eliminates the primary vector of silent OCR error propagation identified in Phase 0.
3. **Dual Planes Validated:** Archaeologists retain instant full-text library discoverability across all scanned literature without compromising the rigorous truth-integrity of the Knowledge Graph.
4. **Readiness for UI Integration:** Phase 1 engine and adversarial testing are 100% complete and verified. The C++ core is ready for WebView2 UI layout assembly.
5. **Platform Scope Documented:** Windows-only for v1 is a deliberate decision. The dual-engine safety model is Windows-OCR-dependent; porting to other platforms requires a full benchmark re-certification cycle.
