# ArchaeoPhD Desktop — Handoff & Current State

> **This file tells you exactly where work stopped, what is settled, and what to do next.**  
> Read this before touching any source file. Update it when you make significant progress.

---

## Orientation

This is a standalone native Windows desktop application: a single C++ binary (`release/ArchaeoPhD.exe`, ~2 MB) that embeds a WebView2 UI, a vector search engine, a knowledge graph store, a Harris matrix engine, and a deterministic entity extractor. **No cloud, no Python runtime, no external server.** Everything runs in-process on the researcher's machine.

The `desktop/` directory has its own Git repository (separate from the monorepo root). All commits and hashes below refer to this sub-repo.

**Toolchain:** MinGW-w64 G++ C++20 (`-std=c++20`). Build with `.\build.bat`. Tests compiled individually with `g++ -std=c++20 -O2 -Iengine -Itests -Iinclude <test>.cpp -o <test>.exe`.

---

## Current Commit

```
0e54f90  fix(extraction): excise 5 hardcoded OCR literals, add audit test, reconcile Report 12
```

**Start your next session from this commit.** Working tree is clean.

---

## Phase & Step Map

| Phase | Step | Description | Status |
|:---:|:---:|---|:---:|
| **Phase 1** | 1–5 | Ingestion, IPC bridge, native UI, vector persistence, BM25 hybrid retrieval | ✅ **COMPLETE** |
| **Phase 2** | Step 1 | Stratigraphic DAG, Harris matrix, Kahn + Tarjan cycle detection | ✅ DONE |
| **Phase 2** | Step 2 | Knowledge graph relational store (`NativeStorage`) | ✅ DONE |
| **Phase 2** | **Step 3** | Deterministic entity extractor (`entity_extractor.hpp`) | ⚠️ **IN PROGRESS — see below** |
| **Phase 2** | Step 4 | Attribution — link extracted mentions to KG findings | ⏳ **NOT STARTED** |
| **Phase 2** | Step 5 | Contradiction detection using extracted + attributed entities | ⏳ **NOT STARTED** |
| **Phase 3+** | — | Chronology engine, geographic layer, thesis auditor, export | ⏳ NOT STARTED |

---

## Phase 2 Step 3 — Exact Current State

### What is done

- **Spec v2.0** sealed at `ccbc5f3`: mention-level extraction, astronomical normalization, never-repair invariant, bare-year exclusion.
- **Extractor v2** (`engine/extraction/entity_extractor.hpp`, commit `116995d`): handles linear dimensions, ranges, compound dims, depth/elevation, mass, temperatures, locus IDs, strata, trenches, spatial areas, artifact counts, exact/approx/range BCE/CE dates, uncalibrated C-14 BP, author-calibrated dates, and negative-context exclusion (citations, figures, ratios, scales).
- **Hardcoded literals removed** (`0e54f90`): five synthetic anomaly patterns (`2040 cm`, `Locus 691`, `Sample 1063`, `1846 m`, `locus 1M7`) were excised from the extractor. A static audit test (`tests/test_no_hardcoded_literals.cpp`) guards against their return.
- **Report 12** (`docs/reports/12_phase2_step3_entity_extraction_benchmark_report.md`) documents all runs, number reconciliation, and the real-OCR capability analysis.

### Real-OCR capability numbers (the only numbers that matter for Step 4 planning)

| Metric | Tesseract 5.4 | Windows OCR |
|---|:---:|:---:|
| Overall clean recall (n=137, 124) | 14.6% (20/137) [9.7%, 21.5%] | 10.5% (13/124) [6.2%, 17.1%] |
| **In-scope clean recall (n=36, 30)** | **61.1% (22/36)** [44.9%, 75.2%] | **50.0% (15/30)** [33.2%, 66.8%] |
| In-scope Class A Clean (n=15) | 40.0% (6/15) [19.8%, 64.3%] | 40.0% (6/15) [19.8%, 64.3%] |
| In-scope Class B Clean (n=21, 15) | 76.2% (16/21) [54.9%, 89.4%] | 60.0% (9/15) [35.7%, 80.2%] |
| **Class A Pipeline Recall (n=19)** | **31.6% (6/19)** [15.4%, 54.0%] | **31.6% (6/19)** [15.4%, 54.0%] |
| Class B Pipeline Recall (n=36) | 44.4% (16/36) [29.5%, 60.4%] | 25.0% (9/36) [13.8%, 41.1%] |
| **End-to-End Pipeline Recall (n=55)** | **40.0% (22/55)** [28.1%, 53.2%] | **27.3% (15/55)** [17.3%, 40.2%] |
| Plausibility sensitivity | 0% (0/29 corrupted) | 0% (0/42 corrupted) |

**"In-scope"** means: era-marked dates (BC/BCE/AD/CE/BP), measurements, and counts (55 total facts). The 111 bare 4-digit years in the corpus are **out-of-scope by design** — adding them would cause massive false positives on page numbers and bibliography years. **Pipeline recall** measures retrieval out of all 55 in-scope facts, including those mangled or dropped by OCR.

**Class A pages** (Rajan, Chakrabarti) are where the application pre-fills form fields. Class B (Sankalia letterpress) is permanently manual-transcription only.

### What the extractor still doesn't do

1. **Anomaly detection on real OCR noise** — the hardcoded literals are gone; the general grammar simply doesn't extract severely corrupted tokens. A statistical plausibility layer (z-score per unit type) is the correct fix but is scoped to Step 3.3 or later.
2. **Bare-year extraction** — architectural decision needed by the product owner before implementing. Do not add bare-year regex to the extractor without that decision.
3. **Independent validation** — every authored test set was written by the same developer who wrote the extractor. Step 4 should not start until an independent set (written by someone who didn't write the extractor) passes the Spec v2.0 gates (P ≥ 90%, R ≥ 90%, Spec ≥ 95%).

### Test suites and their status

| File | Run | P | R | Spec | Gate |
|---|:---:|:---:|:---:|:---:|:---:|
| `eval_entity_extraction_dataset.hpp` (Dev Set 1) | Run 1b on `0e54f90` | 96.7% | 93.5% | 90.0% | FAIL Spec (≥95%) |
| `eval_entity_extraction_held_out.hpp` (Dev Set 2, frozen `ccbc5f3`) | Run 2 on `a6cf766` | 81.5% | 57.9% | 96.0% | FAIL P+R (Headline) |
| `eval_entity_extraction_third_set.hpp` (Dev Set 3) | Run 7 on `40c61d9` | 92.9% | 100.0% | 86.7% | FAIL Spec (Headline) |
| `eval_entity_extraction_third_set.hpp` (Dev Set 3) | Run 7b (v2.1 §2.3) | 100.0% | 100.0% | 100.0% | Relabelled post-hoc |
| `eval_entity_extraction_fourth_set.hpp` (Dev Set 4) | Run 8 on `40c61d9` | 100.0% | 100.0% | 100.0% | PASS (same author, point estimate) |
| Real-OCR (`ocr_benchmark_50/`, 166 facts) | Runs 5a/5b on `116995d` | — | 14.6% clean / 40.0% pipe | Vacuous | Capability benchmark only |


> Dev Set 4 passes gates on the point estimate. Wilson lower bound for specificity (10/10 negatives) is **72.2%**. Treat as a fourth development set, not an independent validation.

---

## Key Files

| File | Purpose |
|---|---|
| `engine/extraction/entity_extractor.hpp` | The extractor. **Start here for Step 3 work.** |
| `engine/extraction/dual_engine_ensemble.hpp` | Routes Tesseract / Windows OCR outputs |
| `engine/extraction/ingestion_manager.hpp` | Document ingestion pipeline |
| `engine/analysis/` | Vector index, embedding engine |
| `engine/core/` | Storage, data root, contradictions |
| `engine/ipc/` | WebView2 IPC bridge |
| `tests/eval_entity_extraction_held_out.hpp` | Dev Set 2 (SHA-256: `2193A980…B4D0`) — frozen baseline |
| `tests/eval_entity_extraction_fourth_set.hpp` | Dev Set 4 (SHA-256: `B103E4CA…FD66CB`) |
| `tests/test_entity_extraction_held_out_run.cpp` | Harness for Dev Set 2 |
| `tests/test_entity_extraction_fourth_set_run.cpp` | Harness for Dev Set 4 |
| `tests/test_no_hardcoded_literals.cpp` | Audit: asserts no synthetic literals in extractor |
| `tests/test_real_ocr_eval.cpp` | Real-OCR plausibility evaluation harness |
| `tests/ocr_benchmark_50/` | 50 Tesseract + 50 Windows OCR scanned pages + ground truth (166 facts) |
| `docs/reports/12_phase2_step3_entity_extraction_benchmark_report.md` | Full evaluation ledger — read before any extractor change |
| `docs/reports/README.md` | Index of all phase reports |

---

## Invariants You Must Not Break

These are non-negotiable. Breaking any of them invalidates all prior benchmarks.

1. **Never-Repair:** `entity.raw_match` must equal `text.substr(entity.span_start, entity.span_end - entity.span_start)` exactly. The extractor may not modify, correct, or re-tokenize what it found in the source text.
2. **No hardcoded test literals:** No specific numeric values from test cases may appear as literals in `entity_extractor.hpp`. `tests/test_no_hardcoded_literals.cpp` enforces this at compile time.
3. **No in-house calibration:** Uncalibrated radiocarbon BP dates are extracted as-is and flagged `UNCALIBRATED_RADIOCARBON_BP`. The extractor does not convert them to calendar dates.
4. **Astronomical normalization:** 1 BCE = year 0, N BCE = -(N-1), N CE = +N. Do not change this without updating every test case that checks `astro_year`.
5. **Negative-context suppression:** Figure captions, page references, bibliography citations, cartographic ratios (1:2000), and dimensionless ratios (3:1) must never be extracted as physical entities.
6. **Step 3 is mention-level only:** The extractor extracts every valid numeric mention. It does not decide whether a mention is relevant to an archaeological finding — that is Step 4's job. Do not add relevance filtering to the extractor.

---

## What Step 4 (Attribution) Needs

Step 4 links extracted entity mentions to knowledge graph nodes (finds, strata, trenches, contexts). Before starting Step 4:

- Know the **in-scope Class A recall number** (currently 40.0% on both engines). Step 4's pre-fill quality is bounded by this.
- Decide the **bare-year scope question**: should bare 4-digit years (e.g., `1784`, `1944`) be extracted? They appear in 111/125 date ground-truth facts. Extracting them requires a negative-context filter for bibliography/publication metadata. This is a product decision, not a precision-tuning decision.
- Have an independent validation set for the extractor (see "What the extractor still doesn't do" above).

The attribution engine should consume `EntityExtractor::extract_entities(text)` and match each `ExtractedEntity` to a KG node by (entity_type, normalized_value, span position). Start from `engine/core/` for the KG store API.

---

## How to Run Tests

```powershell
# Compile and run Dev Set 4 (fastest sanity check)
g++ -std=c++20 -O2 -Iengine -Itests -Iinclude tests/test_entity_extraction_fourth_set_run.cpp -o tests/test_fourth_set.exe
./tests/test_fourth_set.exe

# Compile and run Dev Set 2 (frozen baseline)
g++ -std=c++20 -O2 -Iengine -Itests -Iinclude tests/test_entity_extraction_held_out_run.cpp -o tests/test_held_out.exe
./tests/test_held_out.exe

# Run literal audit (must always pass)
g++ -std=c++20 -O2 -Iengine -Itests tests/test_no_hardcoded_literals.cpp -o tests/test_no_hardcoded_literals.exe
./tests/test_no_hardcoded_literals.exe

# Real-OCR evaluation (requires ocr_benchmark_50/ directory)
g++ -std=c++20 -O2 -Iengine -Iinclude tests/test_real_ocr_eval.cpp -o tests/test_real_ocr_eval.exe
./tests/test_real_ocr_eval.exe

# Full application build
.\build.bat
```

---

## Report Index (Quick Reference)

| Report | Subject | Verdict |
|---|---|:---:|
| [01](docs/reports/01_ocr_engine_and_preprocessing_benchmark.md) | OCR engine benchmark, 50 pages, 166 facts | Done |
| [02](docs/reports/02_dual_engine_routing_and_verification.md) | Dual-engine routing & verification state machine | Done |
| [03](docs/reports/03_vlm_degraded_scan_feasibility_investigation.md) | VLM feasibility on Class B letterpress — rejected | Done |
| [04](docs/reports/04_phase1_ingestion_and_adversarial_gating_test_report.md) | Ingestion & adversarial gating (11 tests, 100%) | Done |
| [05](docs/reports/05_phase1_step2_ipc_webview2_bridge_test_report.md) | IPC WebView2 bridge (18 tests, 100%) | Done |
| [06](docs/reports/06_phase1_step3_native_ui_integration_report.md) | Native UI integration (24 tests, 100%) | Done |
| [07](docs/reports/07_phase1_step4_vector_persistence_and_gguf_retrieval_report.md) | Vector persistence, GGUF embedding, Recall@5 85% | Done |
| [08](docs/reports/08_phase1_step5_hybrid_retrieval_and_bm25_fusion_report.md) | BM25 hybrid retrieval, Recall@5 95%, MRR 0.85 | Done |
| [09](docs/reports/09_phase1_final_signoff_report.md) | Phase 1 signoff, 72 assertions, 100% pass | Done |
| [10](docs/reports/10_phase2_step1_and_step2_harris_matrix_and_graph_report.md) | Harris matrix DAG, KG store (25 tests, 100%) | Done |
| [11](docs/reports/11_phase2_step3_entity_extraction_benchmark_report.md) | Entity extraction Dev Set 1 — **SUPERSEDED** by Report 12 | Superseded |
| [**12**](docs/reports/12_phase2_step3_entity_extraction_benchmark_report.md) | **Entity extraction full ledger — reconciled** | **Active** |

---

*Last updated: 2026-10-05, commit `0e54f90`*
