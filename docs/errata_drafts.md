# Draft Errata for Prior Phase Reports & Specifications

**Date:** 2026-10-06  
**Status:** DRAFT (Uncommitted working-tree document — pending final stakeholder signoff)  
**Author:** ArchaeoPhD Core Team / Audit Response  

### Classification Provenance Disclosure:
The classification of the 22 consensus-error facts was performed **forensically after viewing candidate extraction outputs and document page texts**. It did not precede execution. The presence of the ground truth in the window and the diagnoses of unit loss and token displacement were verified post-hoc. Complete ±120 character windows for all 22 facts are recorded in `docs/reports/false_consensus_22_windows.md`.

---


## 1. Draft Erratum for Report 02: Dual-Engine Routing & Verification Architecture

**Target Location:** `desktop/docs/reports/02_dual_engine_routing_and_verification.md` (§2.3 & Table 2)

### Target Text to Amend:
> `- **Safety Guarantee:** Empirical false consensus rate = $0.0\%$.`

### Replacement Text:
> **ERRATUM (2026-10-06):** The previously reported "0.0% empirical false consensus rate" was **unmeasured** in Phase 1; it was an artifact of the evaluation script (`evaluate_benchmark_v2.js` at `e71f709`), which unconditionally classified all dual-engine transcription failures as "disagreement caught errors" without comparing what each engine actually transcribed.  
> The first direct empirical measurement under the pre-registered Span-Anchored Scorer (`docs/specs/03_anchored_scorer_rules.md`) reveals two complementary operational figures:  
> 1. **OCR Transcription Agreement (Located Positions):** At located positions, no case of both engines misreading the same target the same way was found across 80 agreed facts (**0.00% true optical false consensus, 0 / 80 [Wilson 95% CI: 0.00%, 4.58%]; 0 / 72 in Class A [0.00%, 5.07%]**).  
> 2. **Router-Pipeline Auto-Accept Agreement:** When candidate selection operates without ground-truth peeking, **22 of 80 agreed values were wrong (27.50% [18.92%, 38.14%]) overall, and 18 of 72 in Class A (25.00% [16.44%, 36.09%])**. Direct execution of the production C++ router (`DualEngineEnsembleRouter::ProcessDocument`) confirms that all 22 carry matching values and are auto-accepted as consensus.  
> **Caveats:**  
> - Dual OCR consensus does not prevent non-optical errors: **5.00% of agreed facts (4/80, 4.17% in Class A)** suffered **unit/symbol loss** (e.g., `40 miles` $\to$ `40`, `6 m` $\to$ `6`), where the number was read correctly but the unit was stripped.  
> - An additional **2.50% (2/80)** were partial reads of compound expressions (`1631 to 1641` $\to$ `1631`).  
> - In **16.25% (13/80)**, both engines contained the ground-truth value verbatim, but naive candidate selection selected an adjacent numerical token.  
> - In **3.75% (3/80, 1.39% in Class A)**, both engines missed the target entity and agreed on an adjacent narrative number (#55, #56, #73).  
> Dual-engine agreement is an essential optical safeguard, but automated ingestion cannot rely on dual OCR consensus alone; explicit unit validation and Step 4 contextual attribution are required before auto-acceptance is safe.


---

## 2. Draft Erratum for Report 03: VLM Feasibility & Ingestion Architecture

**Target Location:** `desktop/docs/reports/03_vlm_degraded_scan_feasibility_investigation.md` (§2.2)

### Target Text to Amend:
> `**Standing System Rule:** Anywhere in ArchaeoPhD where machine learning extraction lacks verified dual-engine consensus, the application must **never pre-fill the form**. Fields must remain blank, requiring clean human double-entry.`

### Replacement Text:
> **ERRATUM (2026-10-06):** Phase 1 described dual-engine consensus as an absolute guarantee against incorrect pre-fills. While direct measurement under clausal anchoring confirms that true optical false consensus is **0.00% (0/80 [0.00%, 4.58%])**, dual consensus was previously unmeasured and admits two specific non-optical failure modes: dropped measurement units (5.00%) and partial reads of compound dates (2.50%). Form pre-filling must therefore require dual-engine agreement on *both* numeric value and associated unit symbol.

---

## 3. Draft Erratum for Report 04: Phase 1 Ingestion & Adversarial Gating Report

**Target Location:** `desktop/docs/reports/04_phase1_ingestion_and_adversarial_gating_test_report.md` (§8.1)

### Target Text to Amend:
> `The core safety guarantee — that a 0% false consensus rate on auto-accepted facts was empirically validated across 166 blind ground-truth facts — was demonstrated with the specific pairing of Windows Native OCR and Tesseract LSTM.`

### Replacement Text:
> **ERRATUM (2026-10-06):** The assertion that a "0% false consensus rate was empirically validated across 166 blind ground-truth facts" was inaccurate because false consensus was **unmeasured** in Phase 1 evaluation code. The first rigorous measurement under span anchoring (`docs/specs/03_anchored_scorer_rules.md`) shows that the true shared optical misread rate is indeed **0.00% (0/80 [0.00%, 4.58%]; 0/72 in Class A [0.00%, 5.07%])**. However, dual-engine agreement alone is not sufficient to guarantee factual completeness: 5.00% of agreed facts lose units/symbols, and naive extraction without syntactic binding risks binding adjacent numerical tokens. Dual-engine agreement provides an optical transcription filter, not an end-to-end semantic guarantee.

---

## 4. Draft Erratum for Report 09: Phase 1 Signoff Report

**Target Location:** `desktop/docs/reports/09_phase1_final_signoff_report.md` (§6.2, Signoff Gate 2)

### Target Text to Amend:
> `2. **Dual-Engine Consensus Gate:** Automated fact ingestion requires exact 100% consensus between two orthogonal OCR engines (Windows Native OCR + Tesseract LSTM) on confirmed Class A print.`

### Replacement Text:
> **ERRATUM (2026-10-06):** Signoff Gate 2 relied on an unmeasured assumption of 0% false consensus. The first empirical measurement under localized clausal evaluation confirms that **true optical false consensus is 0.00% (0/72 in Class A [0.00%, 5.07%])**. However, dual OCR consensus permits unit-dropping (4.17% in Class A) and partial compound reads (2.78%). Phase 2 Step 4 (Attribution & Gating) must incorporate explicit unit-compatibility checks before any entity is auto-accepted into the database.

---

## 5. Draft Erratum for Specifications 01 and 02

**Target Location:**  
- `desktop/docs/specs/01_phase2_step3_quantitative_entity_extraction_spec.md` (§7.1)  
- `desktop/docs/specs/02_real_ocr_plausibility_evaluation_protocol.md` (§2.2, Table 4 citation)

### Target Text to Amend:
> `• Clean Consensus Facts ($n=119$, $71.69\%$): Both OCR engines or consensus arbitration extracted the fact accurately without numerical corruption.`

### Replacement Text:
> **ERRATUM (2026-10-06):** The figure of "119 clean consensus facts" was derived using unanchored page-level substring matching. Under the frozen Span-Anchored Scorer (`docs/specs/03_anchored_scorer_rules.md`), exactly **58 of 166 facts (34.9%)** achieve dual-engine clean consensus (**54 in Class A, 4 in Class B**). Across the 80 facts with mutual engine agreement, true optical false consensus is **0.00% (0/80 [0.00%, 4.58%])**, while unit-drop rate is **5.00% (4/80 [1.96%, 12.16%])** and partial-read rate is **2.50% (2/80 [0.69%, 8.66%])**. In Class B degraded print, 9 facts suffered anchor failure due to severe scan degradation. Baseline calculations must cite the span-anchored accounting.

