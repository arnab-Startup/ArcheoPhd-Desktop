# Report 12 — Phase 2 Step 3: Entity Extraction Evaluation Ledger

**Date:** 2026-10-05  
**Component:** `desktop/engine/extraction/entity_extractor.hpp`  
**Toolchain:** MinGW-w64 G++ C++20 (`-std=c++20`)  
**Status:** Baseline documented. Hardcoded literals excised (`bf46805`). Ledger reconciled.

---

## 1. Primary Finding

**The extractor reaches 100% on text its authors wrote and 10–15% on real scanned pages. Authored test suites measure grammar coverage, not field capability.**

On 100 real scanned pages from three published Indian site monographs (Rajan, Chakrabarti, Sankalia):

| Engine | Overall Clean Recall | In-Scope Clean Recall | Class A In-Scope | Class B In-Scope |
|:---:|:---:|:---:|:---:|:---:|
| Tesseract | 14.6% (20/137) | **61.1% (22/36)** | 40.0% (6/15) | 76.2% (16/21) |
| Windows OCR | 10.5% (13/124) | **50.0% (15/30)** | 40.0% (6/15) | 60.0% (9/15) |

**Plausibility sensitivity: 0% on both engines.** Of 29 corrupted facts (Tesseract) and 42 (Windows OCR), only 1 (Tess) and 2 (Win) produced any entity mention at all. Neither mention was anomaly-flagged. The bulk of corrupted facts were mangled so severely by OCR that no grammar pattern matched — they are simply not extracted.

**Plausibility specificity (20/20 and 13/13) is vacuous.** The anomaly detector never fired on either engine. A detector that never fires achieves perfect specificity by definition. It is not a result.

Class A pages (Rajan, Chakrabarti) are the primary use case for Step 3 output; Class B pages (Sankalia) are letterpress scans whose OCR is too noisy for automated pre-fill.

---

## 2. In-Scope / Out-of-Scope Scope Analysis

The ground truth contains 166 facts across 50 pages per engine.

| Type | Total | In-Scope | Out-of-Scope |
|:---:|:---:|:---:|:---:|
| Dates (era-marked: BC/BCE/AD/CE/BP) | 14 | 14 | 0 |
| Dates (bare 4-digit years, e.g. `1784`, `1944`) | 111 | 0 | **111** |
| Measurements | 20 | 20 | 0 |
| Counts | 21 | 21 | 0 |
| **Total** | **166** | **55** | **111** |

Bare 4-digit years are **out-of-scope by architectural decision**, not by omission. The grammar deliberately excludes them to avoid false positives on page numbers, publication years, and modern survey metadata. This is a precision-preserving constraint; raising in-scope recall by adding year extraction would require a negative-context filter that belongs to Step 4 (Attribution). The spec decision should be revisited when the product's pre-fill use case is defined — not to raise this number.

The 36 in-scope clean facts (Tesseract) and 30 (Windows OCR) are those of the 55 in-scope facts whose ground-truth value appeared verbatim in that engine's OCR output. The remainder were corrupted.

---

## 3. Evaluation Ledger

All runs: MinGW G++ C++20. Wilson confidence intervals: 95% score.  
Extractor: `desktop/engine/extraction/entity_extractor.hpp`.  
Datasets: `desktop/tests/`.

| Run | Extractor Commit | Dataset | Provenance | Denominator | Precision | Recall | Specificity | Status |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | `a6cf766` | Dev Set 1 (`eval_entity_extraction_dataset.hpp`) | Same author; synthetic strings | 31 pos entities, 10 neg controls | ~~100.0% (31/31)~~ | ~~100.0% (31/31)~~ | ~~100.0% (10/10)~~ | **VOID.** OCR sensitivity 5/5 was driven by 5 hardcoded literals. 2 cases (TC-28, TC-30) had no general-grammar match; 3 also matched general patterns. See §4. |
| **1b** | `bf46805` (literals excised) | Dev Set 1 re-run | Same author | 30 pos entities, 10 neg controls | **96.7% (29/30)** [83.3%, 99.4%] | **93.5% (29/31)** [79.3%, 98.2%] | **90.0% (9/10)** [59.6%, 98.2%] | Correct baseline after excision. TC-28 and TC-30 now FN. TC-05 FP=1 (compound 3D). |
| **2** | `a6cf766` | Dev Set 2 — frozen baseline (`ccbc5f3`) | Same author; authored after extractor v1. Dataset sealed pre-run. | 35 pos cases / 38 entities, 20 neg, 5 OOS | **81.5% (22/27)** [63.3%, 91.8%] | **57.9% (22/38)** [42.2%, 72.1%] | **96.0% (24/25)** [80.4%, 99.3%] | **BASELINE.** 16 FN (count grammar, B.C./A.D., en-dash, multi-entity). 5 FPs = 4 secondary entities not yet in dataset + Trench I from HO-52. TN=24/25 because HO-52 labelled NEGATIVE at this commit. |
| **3** | `116995d` | Dev Set 2 — relabelled (`116995d`) | Same author; dataset edited post-run to match extractor | 36 pos cases / 43 entities (+5), 19 neg, 5 OOS | **100.0% (43/43)** [91.8%, 100.0%] | **100.0% (43/43)** [91.8%, 100.0%] | **100.0% (24/24)** [86.2%, 100.0%] | **NOT INDEPENDENT.** Extractor and dataset co-evolved. See §5 for which cases changed. Gates printed by harness use uncommitted thresholds (92%/80%/95%); Spec v2.0 gates are 90%/90%/95%. |
| **4a** | `a6cf766` | Real-OCR: Tesseract 50 pages (`ocr_benchmark_50`) | Scanned monograph pages (Rajan, Chakrabarti, Sankalia) | 137 clean, 29 corrupted of 166 GT facts | N/A | **3.6% (5/137)** [1.6%, 8.3%] | Vacuous — detector never fired | **FAIL (Invariant 1).** 2/12 NR violations (span offset on `in X BC`). 0/29 corrupted facts produced any mention. |
| **4b** | `a6cf766` | Real-OCR: Windows OCR 50 pages | Scanned monograph pages | 124 clean, 42 corrupted of 166 GT facts | N/A | **4.8% (6/124)** [2.2%, 10.2%] | Vacuous — detector never fired | **FAIL (Invariant 1).** 2/10 NR violations. 0/42 corrupted facts produced any mention. |
| **5a** | `116995d` | Real-OCR: Tesseract 50 pages | Scanned monograph pages | 137 clean, 29 corrupted | N/A | **14.6% (20/137)** [9.7%, 21.5%] | Vacuous — detector never fired | **PASS Invariant 1.** 0 NR violations. In-scope clean recall: 61.1% (22/36). 1/29 corrupted facts produced a mention; 0/1 anomaly-flagged. |
| **5b** | `116995d` | Real-OCR: Windows OCR 50 pages | Scanned monograph pages | 124 clean, 42 corrupted | N/A | **10.5% (13/124)** [6.2%, 17.1%] | Vacuous — detector never fired | **PASS Invariant 1.** 0 NR violations. In-scope clean recall: 50.0% (15/30). 2/42 corrupted facts produced a mention; 0/2 anomaly-flagged. |
| **6** | `116995d` | Dev Set 3 — Third Set (`eval_entity_extraction_third_set.hpp`) | Same author; written 2026-10-05 after second-set failure taxonomy | 26 pos entities, 10 neg, 5 OOS | **92.9% (26/28)** [77.4%, 98.0%] | **100.0% (26/26)** [87.1%, 100.0%] | **86.7% (13/15)** [62.1%, 96.3%] | **FAIL** (Spec). With n=15 negatives, ≥95% requires 15/15. TE-19 and TE-29 are the 2 FPs. |
| **7** | `40c61d9` | Dev Set 3 — regression | Same author | 26 pos entities, 10 neg, 5 OOS | **92.9% (26/28)** [77.4%, 98.0%] | **100.0% (26/26)** [87.1%, 100.0%] | **86.7% (13/15)** [62.1%, 96.3%] | **FAIL** (Spec). TE-19 and TE-29 still fire. See §6. |
| **8** | `40c61d9` (confirmed on `bf46805`) | **Fourth Dev Set** (`eval_entity_extraction_fourth_set.hpp`) | Same author; written 2026-10-05 under Section 2.3 after third-set taxonomy. Dataset SHA-256: `B103E4CA…FD66CB` | 24 pos entities, 6 neg, 4 OOS | **100.0% (24/24)** [86.2%, 100.0%] | **100.0% (24/24)** [86.2%, 100.0%] | **100.0% (10/10)** [72.2%, 100.0%] | **FOURTH DEV SET — not independent.** Gate met on point estimate only; Wilson lower bound 72.2%. See §7. |

---

## 4. Run 1 Literal Audit (VOID)

**Finding:** `entity_extractor.hpp` at `a6cf766` hardcoded five exact-match patterns targeting specific OCR anomaly strings appearing verbatim in Dev Set 1:

| Regex | Literal | TC case | Also matched by general grammar? |
|:---:|:---:|:---:|:---:|
| `re_corrupt_2040` | `2040 cm` | TC-26 | Yes — `re_linear_dim` extracts `2040 cm` |
| `re_corrupt_691` | `Locus 691` | TC-27 | Yes — `re_locus` extracts `Locus 691` |
| `re_corrupt_1063` | `Sample 1063` | TC-28 | **No** — depended solely on hardcoded literal |
| `re_corrupt_1846` | `1846 m` | TC-29 | Yes — `re_linear_dim` extracts `1846 m` |
| `re_corrupt_1m7` | `locus 1M7` | TC-30 | **No** — depended solely on hardcoded literal |

All five literals were excised at commit `bf46805`. A static audit test (`tests/test_no_hardcoded_literals.cpp`) now asserts at compile time that none of `{2040, 691, 1063, 1846, 1M7}` appear in `entity_extractor.hpp`. **[PASS on bf46805]**

Post-excision re-run (Run 1b): TC-28 and TC-30 now correctly miss (no FN → FN, no general grammar match). The "OCR Anomaly Sensitivity: 5/5" claim in Report 11 is **void**; true post-excision sensitivity is 3/5 (those three matched via general grammar, not by the hardcoded pass).

---

## 5. Run 2 / Run 3 Baseline Discrepancy

The held-out dataset was **frozen at `ccbc5f3`** and **retroactively edited in `116995d`**. A baseline cannot be edited after the extractor has been fixed against it. Both states are documented.

**Cases changed between `ccbc5f3` and `116995d`:**

| Case | Change | Old entity count | New entity count |
|:---:|:---:|:---:|:---:|
| HO-04 | Added secondary entity `{Area H, "H", area}` | 1 | 2 |
| HO-10 | Added secondary entity `{Area L, "L", area}` | 2 | 3 |
| HO-18 | Added secondary entity `{Trench VII, "VII", trench}` | 3 | 4 |
| HO-20 | Added secondary entity `{Stratum V, "V", stratum}` | 2 | 3 |
| HO-52 | Category `NEGATIVE_CONTROL` → `TRENCH_ID`; added `{Trench I, "I", trench}` | 0 | 1 |

**Effect on denominators:**

| Snapshot | Pos cases | Pos entities | Neg cases | OOS | Total | TN denominator |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ccbc5f3` (frozen) | 35 | 38 | 20 | 5 | 60 | 25 |
| `116995d` (relabelled) | 36 | 43 | 19 | 5 | 60 | 24 |

In Run 2, the 5 entities the extractor correctly extracted (Area H, Area L, Trench VII, Stratum V, Trench I) appeared as false positives because they were not yet in the `ccbc5f3` expected list. In Run 3, they are true positives because the dataset was edited to include them.

The HO-52 relabelling is mechanically correct — the passage does contain `Trench I` — but it should not have been made to a file already used as a benchmark denominator.

**Held-out dataset SHA-256 (current):** `2193A980…B4D0`

---

## 6. Third Set Failures TE-19 and TE-29 (Architectural Boundary)

**TE-19:** `"The site map was produced at 1:2000 scale with 0.5 m contour intervals."` → labelled `NEGATIVE_CONTROL`. Extractor extracts `0.5 m`. **FP.**

**TE-29:** `"The magnetometer survey covered a grid of 20 by 40 metres at 0.25-metre traverse spacing."` → labelled `OUT_OF_SCOPE_UNIT`. Extractor extracts `20 by 40 metres` and `0.25 m`. **FP.**

Both passages contain genuine physical dimension mentions. The extractor is correct that they are numeric entities. The third set labelled them as negatives because the author's intent was that cartographic and geophysics parameters are not archaeological finds. That intent belongs to Step 4 (Attribution), not to Step 3 (Mention-Level Extraction). Spec v2.0 Section 2.3 settled this: Step 3 extracts all valid mentions.

---

## 7. Fourth Dev Set (Run 8) — Provenance Assessment

**Author:** Same developer (entity extractor author).  
**Written:** 2026-10-05, after the Section 2.3 rule was settled, which itself was settled because of TE-19 and TE-29.  
**Status: Fourth Development Set, not independent evaluation.**

**The fourth set contains the cartographic/survey cases that fail Run 7 — but relabelled as positives:**

| Fourth Set Case | Passage | Third Set Equivalent | Label in Fourth Set | Label in Third Set |
|:---:|:---:|:---:|:---:|:---:|
| FE-19 | `"…1.0 m contour interval."` | TE-19 (`"…0.5 m contour intervals."`) | **POSITIVE (LINEAR_DIMENSION)** | NEGATIVE_CONTROL |
| FE-20 | `"…sub-sampled at 5 cm intervals…"` | TE-29 (`"…20 by 40 metres at 0.25-metre traverse spacing."`) | **POSITIVE (LINEAR_DIMENSION)** | OUT_OF_SCOPE_UNIT |

The extractor fires on FE-19 and FE-20 for the same reason it fires on TE-19 and TE-29 — they are genuine dimension mentions. The fourth set achieves 100% because the author aligned the labels to what the extractor does under Section 2.3. This is not wrong (Section 2.3 is the correct architectural rule), but it means the gate pass is tautological: the same author wrote the rule, the extractor, and the set, and aligned all three.

**Gate assessment:**
- Precision ≥ 90%: met (100.0%)
- Recall ≥ 90%: met (100.0%)  
- Specificity ≥ 95%: met on point estimate (100.0%, 10/10). **Wilson lower bound 72.2% — gate not met at lower bound.**

Run 8 extractor commit: `40c61d9`. Confirmed re-run on `bf46805`: identical results (30/30 PASS).  
Dataset SHA-256: `B103E4CAB17A4A9B93EFEE4122A925A8BA228073F1631BCDBB5B107EB8FD66CB`

**Treat Run 8 as a Fourth Dev Set until an independent author writes a set against a hash-sealed extractor commit.**

---

## 8. Real-OCR Denominator Reconciliation

An earlier intermediate run reported 139 clean facts (Tesseract) and 128 (Windows OCR). The current evaluation (`test_real_ocr_eval.cpp`) reports 137 and 124. The difference:

- `test_real_ocr_eval.cpp` uses **exact case-insensitive substring search** (`icontains`): a value must appear verbatim as a contiguous substring of the OCR text
- The earlier run used **whitespace-flexible regex**: allowed `\s*` between tokens and optional trailing periods
- 2 (Tesseract) and 4 (Windows OCR) facts span OCR line-breaks or carry trailing punctuation (`BC.`, `cm.`) that regex bridges but `icontains` does not

The 137/124 numbers from `test_real_ocr_eval.cpp` are the authoritative denominators for this report.

---

## 9. Gate Status Summary (Spec v2.0)

Pre-registered gates: **Precision ≥ 90.0%, Recall ≥ 90.0%, Specificity ≥ 95.0%**  
With n = 15 negatives, Spec ≥ 95% requires 15/15 (zero FP tolerance).

| Suite | Precision | Recall | Specificity | Gate |
|:---:|:---:|:---:|:---:|:---:|
| Dev Set 1 — `a6cf766` (Run 1) | VOID | VOID | VOID | VOID (hardcoded literals) |
| Dev Set 1 — `bf46805` (Run 1b) | 96.7% | 93.5% | 90.0% | FAIL Spec (≥95% requires 10/10) |
| Dev Set 2 — baseline `ccbc5f3` (Run 2) | 81.5% | 57.9% | 96.0% | FAIL P and R |
| Dev Set 2 — relabelled (Run 3) | 100.0% | 100.0% | 100.0% | Not independent |
| Dev Set 3 (Runs 6–7) | 92.9% | 100.0% | 86.7% | **FAIL** Spec |
| Fourth Dev Set (Run 8) | 100.0% | 100.0% | 100.0% | Point estimate PASS; lower bound 72.2%; not independent |
| Real-OCR Tesseract (Runs 4a/5a) | N/A | 14.6% overall / 61.1% in-scope | Vacuous | Capability benchmark only |
| Real-OCR Windows OCR (Runs 4b/5b) | N/A | 10.5% overall / 50.0% in-scope | Vacuous | Capability benchmark only |

---

## 10. Open Items

1. **Independent evaluation:** No authored set to date was written by someone other than the extractor author. Gate validity requires an independent set against a hash-sealed commit.

2. **Anomaly sensitivity architecture:** With the 5 hardcoded literals removed, the general grammar no longer fires on the real-OCR corruption patterns. A statistical plausibility approach (e.g., z-score on measurement distributions per unit type) is the correct architectural replacement and is scoped to a future step.

3. **Bare-year scope decision:** 111/125 dates in the real corpus are bare 4-digit years. Extracting them requires a negative-context filter (suppress page numbers, bibliography years, modern metadata). That filter belongs to Step 4 and should be designed against the product's pre-fill requirements, not to raise this number.

4. **Class A in-scope recall (40.0%)** is the number downstream steps consume. Step 4 (Attribution) design should start from this figure.
