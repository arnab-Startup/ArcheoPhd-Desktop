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
- **Report 12** (`../docs/desktop/reports/12_phase2_step3_entity_extraction_benchmark_report.md`) documents all runs, number reconciliation, and the real-OCR capability analysis.

### Real-OCR capability numbers (the only numbers that matter for Step 4 planning)

*Headline metrics lead with strict token-boundary matching and localized span-anchoring (`\b`). Lenient unanchored substring metrics are shown for comparison.*

| Metric | Tesseract 5.4 (Anchored) | Windows OCR (Anchored) | Tesseract 5.4 (Strict \b) | Windows OCR (Strict \b) | Tesseract (Lenient) | Windows (Lenient) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **In-scope clean recall** | **40.7% (11/27)** [24.5%, 59.3%] | **47.8% (11/23)** [29.2%, 67.0%] | 38.9% (14/36) [24.8%, 55.1%] | 44.8% (13/29)† [28.4%, 62.5%] | 61.1% (22/36) | 50.0% (15/30) |
| In-scope Class A Clean | 46.2% (6/13) [23.2%, 70.9%] | 38.5% (5/13) [17.7%, 64.5%] | 40.0% (6/15) [19.8%, 64.3%] | 40.0% (6/15) [19.8%, 64.3%] | 40.0% (6/15) | 40.0% (6/15) |
| In-scope Class B Clean | 35.7% (5/14) [16.3%, 61.2%] | 60.0% (6/10) [31.3%, 83.2%] | 38.1% (8/21) [20.8%, 59.1%] | 46.7% (7/15) [24.8%, 69.9%] | 76.2% (16/21) | 60.0% (9/15) |
| **Class A Pipeline Recall (n=19)** | **31.6% (6/19)** [15.4%, 54.0%] | **26.3% (5/19)** [11.8%, 48.8%] | 31.6% (6/19) [15.4%, 54.0%] | 31.6% (6/19) [15.4%, 54.0%] | 31.6% (6/19) | 31.6% (6/19) |
| Class B Pipeline Recall (n=36) | 13.9% (5/36) [6.1%, 28.7%] | 16.7% (6/36) [7.9%, 31.9%] | 22.2% (8/36) [11.7%, 38.1%] | 19.4% (7/36) [9.8%, 35.0%] | 44.4% (16/36) | 25.0% (9/36) |
| **End-to-End Pipeline Recall (n=55)** | **20.0% (11/55)** [11.6%, 32.4%] | **20.0% (11/55)** [11.6%, 32.4%] | 25.5% (14/55) [15.8%, 38.3%] | 23.6% (13/55) [14.4%, 36.3%] | 40.0% (22/55) | 27.3% (15/55) |
| Dual-Engine Consensus Audit | **0.0% true optical false consensus** (0/72) [0.0%, 5.1%]<br>**4.2% unit loss** (3/72) [1.4%, 11.6%] | **0.0% true optical false consensus** (0/80) [0.0%, 4.6%]<br>**5.0% unit loss** (4/80) [2.0%, 12.2%] | — | — | Unmeasured (0/47) | Unmeasured (0/47) |
| Plausibility Anomaly Detector | **Unevaluated on real noise** (0/29) | **Unevaluated on real noise** (0/42) | Unevaluated (0/29) | Unevaluated (0/42) | Vacuous (0/20) | Vacuous (0/13) |

*Key Methodological Takeaways & Architectural Decisions:*
- **Three-Layer Consensus Accounting:**
  1. *(a) OCR Optical Layer:* At located clausal positions, **0.0% true optical false consensus (0/72 Class A [0.0%, 5.1%]; 0/80 overall [0.0%, 4.6%])**. Dual engines do not make identical optical character misreads.
  2. *(b) Position-Based Candidate Picker:* Agrees on an erroneous value in **22 of 80 cases (27.5% overall, 18 of 72 = 25.0% in Class A)** due to dropped units (5.0%), partial compound reads (2.5%), and adjacent-number displacements (16.3%). Passing these 22 pairs to the router auto-accepts all 22 by construction (circular test), demonstrating that string equality alone cannot prevent ingestion errors.
  3. *(c) Production Policy Decision:* Step 4 has no candidate generator yet. Because string-level agreement cannot distinguish `40` from `40 miles` or bind the correct date when multiple numbers appear in a sentence, **Class A automated ingestion is paused**. All Class A facts will route to the human verification queue, with dual-engine consensus downgraded to a confidence score hint until Step 4 supplies location- and unit-bound attribution.
- **Attribution is the Core Challenge:** In cases like Fact #154 (`10%` and `3%` in the same sentence), optical transcription is flawless in both engines. The failure is selecting which number answers which query. Attribution, not transcription, is the gating problem for Step 4.
- **Unit Loss is a Safety Deficit (5.0%):** Production `NormalizeNumericFact` preserves units if present, but cannot detect when upstream extraction dropped a unit (`40 miles` $\to$ `40`, `30%` $\to$ `30`). A bare `40` passing into the Knowledge Graph as a distance corrupts queries.
- **Pipeline Recall of 11/55 is an Empirical Coincidence:** Tesseract (11/55) and Windows OCR (11/55) achieve the identical net hit count through different subsets: they share 7 hits (#7, #23, #38, #69, #100, #112, #113), while Tesseract uniquely captures 4 hits (#9, #14, #68, #96) and Windows OCR uniquely captures 4 different hits (#11, #20, #22, #156).
- **Clean Denominators Reflect Scorer Limits on Degraded Scans:** Under span anchoring, Class B clean denominators drop from 21 (Tess) and 15 (Win) down to 14 and 10 because 7 and 5 facts were lost to anchor failures on degraded Sankalia pages. In Class A, clean facts drop from 15 to 13 because tabular column layout in `rajan_p110` placed C-14 dates outside the localized clausal window.
- **Classification Provenance Disclosure:** The classification of the 22 consensus-error facts was performed forensically after viewing candidate extraction outputs and document page texts. Complete windows are preserved in `../docs/desktop/reports/false_consensus_22_windows.md`.

**"In-scope"** means: era-marked dates (BC/BCE/AD/CE/BP), measurements, and counts (55 total facts). Across the corpus, 111 of 166 facts (66.9%) are bare 4-digit years (85/104 in Class A, 81.7%; 26/62 in Class B, 41.9%) and are **out-of-scope by design** — adding them without contextual attribution would cause massive false positives on page numbers and bibliography years. **Pipeline recall** measures retrieval out of all 55 in-scope facts, including those mangled or dropped by OCR.

**Class A pages** (Rajan, Chakrabarti): Automated ingestion is paused; all facts route to the verification queue. Class B (Sankalia letterpress) remains 100% manually reviewed.


### What the extractor still doesn't do

1. **Anomaly detection on real OCR noise** — the hardcoded literals are gone; the general grammar simply drops severely corrupted tokens, so zero corrupted mentions ever reached the detector (unevaluated on real noise). A statistical plausibility layer (z-score per unit type) is the correct fix but is scoped to Step 3.3 or later.
2. **Bare-year extraction** — architectural decision needed by the product owner before implementing. Do not add bare-year regex to the extractor without that decision.
3. **Independent validation** — every authored test set was written by the same developer who wrote the extractor. Step 4 should not start until an independent set (written by someone who didn't write the extractor) passes the Spec v2.0 gates (P ≥ 90%, R ≥ 90%, Spec ≥ 95%).

### Test suites and their status

| File | Run | P | R | Spec | Gate |
|---|:---:|:---:|:---:|:---:|:---:|
| `eval_entity_extraction_dataset.hpp` (Dev Set 1) | Run 1b on `0e54f90` | 96.7% | 93.5% | 90.0% | FAIL Spec (≥95%) |
| `eval_entity_extraction_held_out.hpp` (Dev Set 2, frozen `ccbc5f3`) | Run 2 on `a6cf766` | 81.5% | 57.9% | 96.0% | FAIL P+R (Headline) |
| `eval_entity_extraction_third_set.hpp` (Dev Set 3) | Run 6a on `ccbc5f3` | 92.0% (23/25) | 88.5% (23/26) | 86.7% (13/15) | **FAIL** Spec+R (Unbiased initial run; missed TE-01, TE-02, TE-21) |
| `eval_entity_extraction_third_set.hpp` (Dev Set 3) | Run 6b on `116995d` | 92.9% (26/28) | 100.0% (26/26) | 86.7% (13/15) | **FAIL** Spec (TE-19 and TE-29 fire) |
| `eval_entity_extraction_third_set.hpp` (Dev Set 3) | Run 7 on `40c61d9` | 92.9% (26/28) | 100.0% (26/26) | 86.7% (13/15) | **FAIL** Spec (Headline) |
| `eval_entity_extraction_third_set.hpp` (Dev Set 3) | Run 7b (v2.1 §2.3) | 100.0% (28/28) | 96.6% (28/29) | 100.0% (13/13) | Relabelled post-hoc under §2.3; misses `0.25-metre` FN |
| `eval_entity_extraction_fourth_set.hpp` (Dev Set 4) | Run 8 on `40c61d9` | 100.0% (24/24) | 100.0% (24/24) | 100.0% (10/10) | PASS point estimate; Wilson lower bound 72.2% (same author) |
| Real-OCR (`ocr_benchmark_50/`, 55 in-scope facts) | Runs 9a/9b on `0e54f90` | — | **Strict: 38.9% (Tess) / 44.8% (Win) clean**<br>**Strict: 25.5% (Tess) / 23.6% (Win) pipe**<br>[Lenient: 61.1%/50.0% clean; 40.0%/27.3% pipe] | Vacuous | Capability benchmark only |


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
| `../docs/desktop/reports/12_phase2_step3_entity_extraction_benchmark_report.md` | Full evaluation ledger — read before any extractor change |
| `../docs/desktop/reports/README.md` | Index of all phase reports |

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

- Know the **strict in-scope Class A recall number** (**31.6% pipeline recall**, 6/19, on both engines; 40.0% clean recall, 6/15). Step 4 presents candidates for human verification, with the source crop; extraction capability is bounded by this.
- Decide the **bare-year scope question**: should bare 4-digit years (e.g., `1784`, `1944`) be extracted? They appear in 111/125 date ground-truth facts. Extracting them requires a negative-context filter for bibliography/publication metadata. This is a product decision, not a precision-tuning decision.
- Have an independent validation set for the extractor (see "What the extractor still doesn't do" above).
- **Step 4 Precision Measurement Framework (Pre-Registration):**
  Because Step 3 delegates precision by classifying survey, sampling, and methodology figures as valid mentions (under Spec v2.1 §2.3), Step 4 bears the sole architectural responsibility for preventing non-archaeological numbers from polluting the Knowledge Graph. Step 4 precision must be measured against a pre-registered quantitative framework:
  - **Attribution Precision ($P_{attr} \ge 90.0\%$):** $\frac{\text{Correctly linked archaeological mentions}}{\text{Total mentions linked to KG nodes}}$. Any cartographic parameter, survey spacing, or page number linked to a finding node is an FP.
  - **Rejection Specificity ($S_{reject} \ge 95.0\%$):** $\frac{\text{Correctly suppressed / unlinked methodology and metadata mentions}}{\text{Total non-archaeological mentions extracted}}$.
  - **Attribution Recall ($R_{attr} \ge 90.0\%$):** $\frac{\text{Correctly linked mentions}}{\text{Total valid ground-truth archaeological mentions}}$.
  - **Benchmarking Suite:** Step 4 must construct an independent 50-passage benchmark containing a 50/50 mix of genuine archaeological findings and non-archaeological methodology parameters (e.g. contour intervals, traverse grids, core sample depths, modern publication years, page citations). Testing must assert that parameters tagged `SURVEY_OR_CARTOGRAPHIC` are suppressed from KG insertion.

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
| [01](../docs/desktop/reports/01_ocr_engine_and_preprocessing_benchmark.md) | OCR engine benchmark, 50 pages, 166 facts | Done |
| [02](../docs/desktop/reports/02_dual_engine_routing_and_verification.md) | Dual-engine routing & verification state machine | Done |
| [03](../docs/desktop/reports/03_vlm_degraded_scan_feasibility_investigation.md) | VLM feasibility on Class B letterpress — rejected | Done |
| [04](../docs/desktop/reports/04_phase1_ingestion_and_adversarial_gating_test_report.md) | Ingestion & adversarial gating (11 tests, 100%) | Done |
| [05](../docs/desktop/reports/05_phase1_step2_ipc_webview2_bridge_test_report.md) | IPC WebView2 bridge (18 tests, 100%) | Done |
| [06](../docs/desktop/reports/06_phase1_step3_native_ui_integration_report.md) | Native UI integration (24 tests, 100%) | Done |
| [07](../docs/desktop/reports/07_phase1_step4_vector_persistence_and_gguf_retrieval_report.md) | Vector persistence, GGUF embedding, Recall@5 85% | Done |
| [08](../docs/desktop/reports/08_phase1_step5_hybrid_retrieval_and_bm25_fusion_report.md) | BM25 hybrid retrieval, Recall@5 95%, MRR 0.85 | Done |
| [09](../docs/desktop/reports/09_phase1_final_signoff_report.md) | Phase 1 signoff, 72 assertions, 100% pass | Done |
| [10](../docs/desktop/reports/10_phase2_step1_and_step2_harris_matrix_and_graph_report.md) | Harris matrix DAG, KG store (25 tests, 100%) | Done |
| [11](../docs/desktop/reports/11_phase2_step3_entity_extraction_benchmark_report.md) | Entity extraction Dev Set 1 — **SUPERSEDED** by Report 12 | Superseded |
| [**12**](../docs/desktop/reports/12_phase2_step3_entity_extraction_benchmark_report.md) | **Entity extraction full ledger — reconciled** | **Active** |

---

*Last updated: 2026-10-05, commit `0e54f90`*
