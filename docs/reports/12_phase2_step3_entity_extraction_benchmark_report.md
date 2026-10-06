# Report 12 — Phase 2 Step 3: Entity Extraction Evaluation Ledger

**Date:** 2026-10-05  
**Component:** `desktop/engine/extraction/entity_extractor.hpp`  
**Toolchain:** MinGW-w64 G++ C++20 (`-std=c++20`)  
**Status:** Baseline documented. Hardcoded literals excised (`0e54f90`). Ledger reconciled.

---

## 1. Executive Status at a Glance (Strict & Anchored Metrics)

**Headline Result:** Under rigorous evaluation, field pipeline recall across 55 in-scope archaeological facts on 50 real scanned monograph pages is **20.0%–25.5%** (**26.3%–31.6% in Class A**), bounded by real optical degradation. Earlier reports of 27.3%–40.0% were inflated by unanchored substring matching on degraded letterpress counts. Crucially, Phase 0's headline safety claim of **"0% false consensus" was unmeasured**—an artifact of an evaluation script that unconditionally assumed dual OCR failures never agreed.

To understand the consensus risk for automated ingestion, three distinct operational layers must be separated:
1. **(a) The OCR Optical Layer (Located Positions):** When evaluating raw optical character recognition within located clausal spans, **no case of both engines misreading the same target characters identically was observed** across 80 agreed facts—meaning **0 shared misreads where the target was present in the window** (**0.00% true optical false consensus, 0 / 80 [Wilson 95% CI: 0.00%, 4.58%]; 0 / 72 in Class A [0.00%, 5.07%]**).
2. **(b) The Position-Based Candidate Picker (Heuristic Warning):** When candidate selection uses a position-based nearest-token heuristic without semantic attribution, **22 of 80 agreed values were wrong (27.50% [18.92%, 38.14%]) overall, and 18 of 72 in Class A (25.00% [16.44%, 36.09%])**. Testing `DualEngineEnsembleRouter::ProcessDocument` on these 22 pairs confirms that string-equality routing auto-accepts all 22 by construction (circular test), demonstrating that string matching alone cannot detect dropped units (5.0%) or adjacent token displacements (16.3%). This is a design warning against un-attributed candidate generators, not a measured production failure rate.
3. **(c) Production Reality & Policy Decision:** The production app has no candidate generator for Step 4 yet, and the extractor's output has not been coupled to the router. Because string-level agreement cannot distinguish `40` from `40 miles` or bind the correct date when multiple valid numbers appear in a clause, **Class A automated ingestion is paused**. Until Step 4 delivers a candidate generator that strictly binds each value to a clausal span and unit, all Class A facts will route to the human verification queue, with dual-engine consensus retained strictly as a confidence score hint.

### Primary Benchmark Performance (Real Scanned Pages)

| Engine | Anchored Pipeline Recall (n=55) | Anchored Clean Recall | Strict Boundary Pipeline Recall (n=55) | Strict Boundary Clean Recall | Lenient Pipeline Recall (Unanchored) | Lenient Clean Recall (Unanchored) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Tesseract 5.4** | **20.0% (11/55)**<br>[11.6%, 32.4%] | **40.7% (11/27)**<br>[24.5%, 59.3%] | **25.5% (14/55)**<br>[15.8%, 38.3%] | **38.9% (14/36)**<br>[24.8%, 55.1%] | 40.0% (22/55)<br>[28.1%, 53.2%] | 61.1% (22/36)<br>[44.9%, 75.2%] |
| **Windows OCR** | **20.0% (11/55)**<br>[11.6%, 32.4%] | **47.8% (11/23)**<br>[29.2%, 67.0%] | **23.6% (13/55)**<br>[14.4%, 36.3%] | **44.8% (13/29)**†<br>[28.4%, 62.5%] | 27.3% (15/55)<br>[17.3%, 40.2%] | 50.0% (15/30)<br>[33.2%, 66.8%] |

### Dual-Engine Consensus Audit: OCR Optical Agreement vs. Candidate Picker Error

| Metric / Perspective | Class A (n=72 agreed) | Rate (Class A) | Overall (n=80 agreed) | Rate (Overall) | Wilson 95% CI (Overall) | Architectural Meaning |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **(a) True Optical False Consensus** | **0** | **0.00%** | **0** | **0.00%** | **[0.00%, 4.58%]** | Pure optical transcription agreement where target was present. |
| **(b) Position-Based Picker Agreed Errors** | **18** | **25.00%** | **22** | **27.50%** | **[18.92%, 38.14%]** | **Design warning:** Heuristic picker selects neighboring numbers. |
| — Unit / Symbol Loss (Safety Deficit) | 3 | 4.17% | 4 | 5.00% | [1.96%, 12.16%] | Correct digits, unit stripped (`40 miles` $\to$ `40`). |
| — Partial Compound Read | 2 | 2.78% | 2 | 2.50% | [0.69%, 8.66%] | Sub-token from range/citation (`1631 to 1641` $\to$ `1631`). |
| — Candidate Displacement (Attribution Failure) | 12 | 16.67% | 13 | 16.25% | [9.75%, 25.84%] | GT in window; picker chose adjacent date or header. |
| — Agreed Wrong Candidate, GT Absent | 1 | 1.39% | 3 | 3.75% | [1.28%, 10.42%] | Both engines missed GT; both agreed on adjacent narrative number. |
| **`BOTH_CORRECT` (Verified Target Hits)** | **54** | **75.00%** | **58** | **72.50%** | **[61.90%, 81.10%]** | Ground truth accurately transcribed and matched. |

*Key Methodological Takeaways:*
- **No Shared Misreads Observed on Class A Print in this Sample:** Across 80 agreed facts, zero shared optical misreads occurred where the target was present (upper bound 4.6% on 80 agreed facts, clean denominator 13, 50 pages of three books). In cases like Fact #154 (`10%` and `3%` in the same sentence), both engines transcribe both values flawlessly. The failure occurs when candidate selection picks the wrong valid number for the target attribute. Step 4 contextual attribution (which number answers which archaeological question) is the real barrier to automated ingestion.
- **Unit Loss is a Safety Deficit (5.0%):** Production `NormalizeNumericFact` preserves units if present, but cannot detect when upstream extraction dropped a unit (`40 miles` $\to$ `40`, `30%` $\to$ `30`). A bare `40` passing into the Knowledge Graph as a distance corrupts archaeological queries.
- **Pipeline Recall of 11/55 is an Empirical Coincidence:** Tesseract (11/55) and Windows OCR (11/55) achieve the identical net hit count through different subsets: they share 7 hits (#7, #23, #38, #69, #100, #112, #113), while Tesseract uniquely captures 4 hits (#9, #14, #68, #96) and Windows OCR uniquely captures 4 different hits (#11, #20, #22, #156).
- **Clean Denominators Reflect Scorer Limits on Degraded Scans:** Under span anchoring, Class B clean denominators drop from 21 (Tess) and 15 (Win) down to 14 and 10 because 7 and 5 facts were lost to anchor failures (`ANCHOR_MISSING` or window displacement) on degraded Sankalia pages. In Class A, clean facts drop from 15 to 13 because tabular column layout in `rajan_p110` placed C-14 dates outside the localized clausal window. A substantial share of clean recall movement reflects the limits of span anchoring on degraded scans rather than extractor performance.

---

## 2. In-Scope / Out-of-Scope Scope Analysis

The ground truth contains 166 facts across 50 pages per engine. Under current Spec v2.0/v2.1 rules, all era dates, measurements, and counts are in-scope:

| Type | Total | In-Scope (Current Spec) | Out-of-Scope (Current Spec) |
|:---:|:---:|:---:|:---:|
| Dates (era-marked: BC/BCE/AD/CE/BP) | 14 | 14 | 0 |
| Dates (bare 4-digit years, e.g. `1784`, `1944`) | 111 | 0 | **111** |
| Measurements | 20 | 20 | 0 |
| Counts | 21 | 21 | 0 |
| **Total** | **166** | **55** | **111** |

Across the entire benchmark, **111 of 166 facts (66.9%)** are bare 4-digit years:
- **Class A (Rajan, Chakrabarti):** 85 of 104 facts (**81.7%**) are bare years, leaving **19 in-scope Class A facts**.
- **Class B (Sankalia):** 26 of 62 facts (**41.9%**) are bare years, leaving **36 in-scope Class B facts**.
- **Total in-scope corpus:** $19 + 36 = 55$ facts.

Bare 4-digit years are **out-of-scope by architectural decision**, not by omission. The grammar deliberately excludes them to avoid false positives on page numbers, publication years, and modern survey metadata. This is a precision-preserving constraint; raising in-scope recall by adding year extraction requires a negative-context filter that belongs to Step 4 (Attribution).

### 2.1 Complete Class A Accounting Bridge (19 In-Scope Facts)

The 19 in-scope Class A facts account for every non-year entity mention in the modern offset monograph pages:
- **15 appeared cleanly in OCR:** 14 appeared cleanly in both engines; 1 was clean in Tesseract only (`300-10,000`, fact-161); 1 was clean in Windows OCR only (`7,400`, fact-165).
- **4 were corrupted or dropped by OCR:** 3 were corrupted in both engines (`70,000` as `70.000`, fact-157; `10,000-20,000,000`, fact-159; `5,000-40,000`, fact-166); plus 1 engine-specific corruption (`7,400` dropped in Tess; `300-10,000` read as `300-10.000` in Win).
- **Breakdown of the 15 clean Class A facts:**
  - **6 extracted hits:** Era-marked dates (`3700 BC`, `5199 BC`, `4004 BC`, `79 AD`, `800 BC`, `95-55 BC`). Unadjusted Clean Recall = $6 / 15 = 40.0\%$ [95% CI: 19.8%, 64.3%].
  - **5 Prospective Out-of-Scope Units (currently counted as in-scope grammar misses):** `40 miles` (imperial distance), `30%`, `10%`, `3%` (chemical conservation solutions), `2 hours` (immersion duration). These remain in-scope misses until formally excised by an approved spec amendment.
  - **4 Legitimate grammar gaps:** `50,000 BP` (comma-thousands before `BP`), `300-10,000` (bare range without unit suffix), `400` houses / `300` galleries (count-noun lexicon gap).
- **Accounting closes:** $19 = 6\text{ hits} + 5\text{ prospective OOS units} + 4\text{ grammar gaps} + 4\text{ OCR corruptions}$.
- **Headline Capability vs. Post-Hoc Diagnostic:**
### 2.2 Ground-Truth Audit of Bare-Year Facts & Scorer Leniency

Following the discovery that Fact #31 was recorded as `"955"` despite appearing as `"955 B.C."` in the Sankalia text, an exhaustive audit was conducted across all 111 date facts that lacked era markers in `ground_truth.json`:
- **Audit Methodology & Source Limitation:** The initial automated scan read the OCR text files (`results_tesseract/` and `results_windows_ocr/`). Because optical degradation routinely mangles era markers (e.g. `B.Cc.`, `R.C.`, `535 R¢` on Sankalia page 70), an automated string scan alone cannot detect era markers that OCR destroyed. Facts #30 and #31 were identified through manual passage inspection of Sankalia page 70 against the scanned monograph text. This is an acknowledged limitation of OCR-based auditing: to completely rule out omitted era markers in degraded letterpress, physical page images must be inspected directly. Keeping the ground truth sealed at 55 facts and reporting the 55/56/57 variants as sensitivities is the established and methodologically robust protocol.
- **Audit Findings:**
  - **109 of 111 facts** are genuine bare 4-digit years (modern excavation seasons, publication years, traveler visit dates, or medieval reign years) without era markers.
  - **Exactly two facts**—Fact #30 (`"555"`) and Fact #31 (`"955"`), both appearing on `sankalia_p070-070`—were era-marked BCE radiocarbon dates where the ground-truth annotator omitted the `"B.C."` suffix (`555 B.C.` and `955 B.C.`).
- **Bare-Year Scorer Leniency & Lack of Syntactic Verification:** Bare 4-digit years in narrative survey text and bibliographies (such as Rajan pp. 16–25 and Sankalia p. 25) lack era markers or unit suffixes. Under page-level unanchored matching, common 4-digit years (e.g. `1947`, `1896`, `1963`) hit if the string appeared anywhere on the page, masking OCR corruptions in the target clause. Step 4 must not reduce attention or attribution safeguards on bare excavation years.
- **Effect on In-Scope Denominators & Pipeline Recall:**
  - *Sealed Baseline (n=55):* In-scope facts = 55 (14 dates, 20 measurements, 21 counts). Windows OCR achieves 13/55 strict pipeline recall (**23.6%** [14.4%, 36.3%]; 15/55 lenient, 27.3%); Tesseract achieves 14/55 strict (**25.5%** [15.8%, 38.3%]; 22/55 lenient, 40.0%).
  - *Re-classified Fact #31 (n=56):* Adding Fact #31 as an in-scope era date increases total in-scope facts to 56. Strict pipeline recall is **25.0% (14/56)** [15.5%, 37.7%] on both engines. Windows OCR strict clean recall becomes **46.7% (14/30)** [30.2%, 63.9%]. (Under lenient matching: Windows achieves 16/56 [28.6%] and 16/31 [51.6%]; Tesseract achieves 22/56 [39.3%]).
  - *Re-classified Facts #30 & #31 (n=57):* Fact #30 was corrupted on both engines (`535 R¢` in Tess, `555 R.C.` in Win), yielding 0 clean hits. Strict pipeline recalls are **24.6% (14/57)** [15.2%, 37.1%] on both engines.
  - *Class A Invariance:* Both mislabelled facts reside in Class B (Sankalia). Class A in-scope pipeline recall remains strictly **6/19 (31.6%)** across all accounting frameworks.

---

## 3. Evaluation Ledger

All runs: MinGW G++ C++20. Wilson confidence intervals: 95% score.  
Extractor: `desktop/engine/extraction/entity_extractor.hpp`.  

| Run | Extractor Commit | Dataset | Provenance | Denominator | Precision | Recall | Specificity | Status |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | `a6cf766` | Dev Set 1 (`eval_entity_extraction_dataset.hpp`) | Same author; synthetic strings | 31 pos entities, 10 neg controls | ~~100.0% (31/31)~~ | ~~100.0% (31/31)~~ | ~~100.0% (10/10)~~ | **VOID.** OCR sensitivity 5/5 was driven by 5 hardcoded literals. 2 cases (TC-28, TC-30) had no general-grammar match; 3 also matched general patterns. See §4. |
| **1b** | `0e54f90` (literals excised) | Dev Set 1 re-run | Same author | 30 pos cases (31 expected entities), 10 neg controls | **96.7% (29/30)** [83.3%, 99.4%] | **93.5% (29/31)** [79.3%, 98.2%] | **90.0% (9/10)** [59.6%, 98.2%] | Correct baseline after excision. TC-28 and TC-30 now FN. TC-05 FP=1 (compound 3D). |
| **2** | `a6cf766` | Dev Set 2 — frozen baseline (`ccbc5f3`) | Same author; authored after extractor v1. Dataset sealed pre-run. | 35 pos cases / 38 entities, 20 neg, 5 OOS | **81.5% (22/27)** [63.3%, 91.8%] | **57.9% (22/38)** [42.2%, 72.1%] | **96.0% (24/25)** [80.4%, 99.3%] | **BASELINE.** 16 FN (count grammar, B.C./A.D., en-dash, multi-entity). 5 FPs = 4 secondary entities not yet in dataset + Trench I from HO-52. TN=24/25 because HO-52 labelled NEGATIVE at this commit. |
| **3** | `116995d` | Dev Set 2 — relabelled (`116995d`) | Same author; dataset edited post-run to match extractor | 36 pos cases / 43 entities (+5), 19 neg, 5 OOS | **100.0% (43/43)** [91.8%, 100.0%] | **100.0% (43/43)** [91.8%, 100.0%] | **100.0% (24/24)** [86.2%, 100.0%] | **NOT INDEPENDENT.** Extractor and dataset co-evolved. See §5 for which cases changed. Gates reconciled to Spec v2.0 (90%/90%/95%). |
| **4a** | `a6cf766` | Real-OCR: Tesseract 50 pages (`ocr_benchmark_50`) | Scanned monograph pages (Rajan, Chakrabarti, Sankalia) | 137 clean, 29 corrupted of 166 GT facts | N/A | **3.6% (5/137)** [1.6%, 8.3%] | Vacuous — detector never fired | **FAIL (Invariant 1).** 2/12 NR violations (span offset on `in X BC`). 0/29 corrupted facts produced any mention. |
| **4b** | `a6cf766` | Real-OCR: Windows OCR 50 pages | Scanned monograph pages | 124 clean, 42 corrupted of 166 GT facts | N/A | **4.8% (6/124)** [2.2%, 10.2%] | Vacuous — detector never fired | **FAIL (Invariant 1).** 2/10 NR violations. 0/42 corrupted facts produced any mention. |
| **5a** | `116995d` | Real-OCR: Tesseract 50 pages (v2 with literals) | Scanned monograph pages | 137 clean, 29 corrupted of 166 GT facts | N/A | **14.6% (20/137)** [9.7%, 21.5%] | Vacuous (0/20 fired) | Lenient in-scope clean: 61.1% (22/36). Lenient pipeline: 40.0% (22/55). 1/29 corrupted facts produced a mention (0 flagged). Literals present in build. |
| **5b** | `116995d` | Real-OCR: Windows OCR 50 pages (v2 with literals) | Scanned monograph pages | 124 clean, 42 corrupted of 166 GT facts | N/A | **10.5% (13/124)** [6.2%, 17.1%] | Vacuous (0/13 fired) | Lenient in-scope clean: 50.0% (15/30). Lenient pipeline: 27.3% (15/55). 2/42 corrupted facts produced a mention (0 flagged). Literals present in build. |
| **6a** | `ccbc5f3` | Dev Set 3 — Initial Unbiased Run | Same author; written 2026-10-05 prior to B.C./A.D. patches | 26 pos entities, 10 neg, 5 OOS | **92.0% (23/25)** [75.0%, 97.8%] | **88.5% (23/26)** [71.0%, 96.0%] | **86.7% (13/15)** [62.1%, 96.3%] | **FAIL Spec.** Unbiased initial run. 3 FN: TE-01 (`3100 B.C.`), TE-02 (`530 A.D.`), and TE-21 (`Stratum IVB`) missed due to period punctuation; 2 FP: TE-19, TE-29. |
| **6b** | `116995d` | Dev Set 3 — after punctuation patch | Same author; extractor patched for B.C./A.D. with periods | 26 pos entities, 10 neg, 5 OOS | **92.9% (26/28)** [77.4%, 98.0%] | **100.0% (26/26)** [87.1%, 100.0%] | **86.7% (13/15)** [62.1%, 96.3%] | **FAIL Spec.** TE-19 and TE-29 still fire. Headline result. With n=15 negatives, ≥95% requires 15/15. |
| **7** | `40c61d9` | Dev Set 3 — regression | Same author | 26 pos entities, 10 neg, 5 OOS | **92.9% (26/28)** [77.4%, 98.0%] | **100.0% (26/26)** [87.1%, 100.0%] | **86.7% (13/15)** [62.1%, 96.3%] | **FAIL Spec.** TE-19 and TE-29 still fire. See §6. |
| **7b** | `40c61d9` | Dev Set 3 — v2.1 Relabelled under §2.3 | Same author; TE-19 and TE-29 recognized as valid physical mentions | 29 pos entities under §2.3 (+3), 13 neg controls | **100.0% (28/28)** [87.9%, 100.0%] | **96.6% (28/29)** [82.8%, 99.4%] | **100.0% (13/13)** [77.2%, 100.0%] | **RELABELLED.** Under §2.3, `0.25-metre` in TE-29 is a valid mention missed by extractor (hyphenated unit bug). Omitting it hid an FN; genuine recall under §2.3 is 28/29 (96.6%). |
| **8** | `40c61d9` (confirmed on `0e54f90`) | **Fourth Dev Set** (`eval_entity_extraction_fourth_set.hpp`) | Same author; written 2026-10-05 under Section 2.3 after third-set taxonomy. Dataset SHA-256: `B103E4CA…FD66CB` | 24 pos entities, 6 neg, 4 OOS | **100.0% (24/24)** [86.2%, 100.0%] | **100.0% (24/24)** [86.2%, 100.0%] | **100.0% (10/10)** [72.2%, 100.0%] | **FOURTH DEV SET — not independent.** Gate met on point estimate only; Wilson lower bound 72.2%. FE-20 formatted with space (`5 cm`), avoiding hyphen bug. See §7. |
| **9a** | `0e54f90` (confirmed on HEAD) | Real-OCR: Tesseract 50 pages (Strict Boundary Re-run) | Scanned monograph pages | 36 clean, 19 corrupted in-scope facts | N/A | **25.5% (14/55)** [15.8%, 38.3%] pipe<br>**38.9% (14/36)** [24.8%, 55.1%] clean | Vacuous (0/22 fired) | **PASS Invariant 1.** Strict boundary matching removes 8 spurious Class B count matches. Pipeline recall drops 14.5 pp (40.0% $\to$ 25.5%). 0/29 corrupted facts produced mentions. |
| **9b** | `0e54f90` (confirmed on HEAD) | Real-OCR: Windows OCR 50 pages (Strict Boundary Re-run) | Scanned monograph pages | 29 clean (boundary), 26 corrupted in-scope facts | N/A | **23.6% (13/55)** [14.4%, 36.3%] pipe<br>**44.8% (13/29)** [28.4%, 62.5%] clean† | Vacuous (0/16 fired) | **PASS Invariant 1.** Strict boundary matching yields 13/29 clean (Fact #68 merged as `"of400"`). Pipeline drops 3.7 pp (27.3% $\to$ 23.6%). 0/42 corrupted facts produced mentions. |

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

All five literals were excised at commit `0e54f90`. A static audit test (`tests/test_no_hardcoded_literals.cpp`) now asserts at compile time that none of `{2040, 691, 1063, 1846, 1M7}` appear in `entity_extractor.hpp`. **[PASS on 0e54f90]**

**Commit Chronology & Provenance:**  
`a6cf766` (v1 extractor; literals present) $\to$ `ccbc5f3` (held-out baseline frozen) $\to$ `116995d` (extractor v2; Run 5a/5b initial real-OCR benchmark) $\to$ `40c61d9` (Fourth Dev Set added) $\to$ `0e54f90` (5 hardcoded OCR literals excised, literal audit test added, Report 12 reconciled).

*Evidence on Commit Hash bf46805:* Early report drafts referenced commit `bf46805`. Direct git inspection confirms that a local amend did occur (`bf46805` $\to$ `0e54f90`), superseding earlier informal statements that no commits were amended:
```bash
$ git cat-file -t bf46805
commit
$ git branch --contains bf46805
# (exits 0 with empty output — not contained in any branch)
$ git log -1 --format="%h %ad %s" bf46805
bf46805 Mon Oct 5 16:08:01 2026 +0530 fix(extraction): excise 5 hardcoded OCR literals, add audit test, reconcile Report 12
$ git log -1 --format="%h %ad %s" 0e54f90
0e54f90 Mon Oct 5 16:30:15 2026 +0530 fix(extraction): excise 5 hardcoded OCR literals, add audit test, reconcile Report 12
```
`bf46805` was the unamended local commit authored at 16:08:01. It was amended locally 22 minutes later on `main` at 16:30:15 into canonical commit `0e54f90` (which included the completed Report 12 reconciliation). `bf46805` was thereby orphaned and is not part of the active branch history. All references across the ledger and report cite `0e54f90`.

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

**TE-19:** `"The site map was produced at 1:2000 scale with 0.5 m contour intervals."` → labelled `NEGATIVE_CONTROL`. Extractor extracts `0.5 m` (LINEAR_DIMENSION). **FP (1 entity).**

**TE-29:** `"The magnetometer survey covered a grid of 20 by 40 metres at 0.25-metre traverse spacing."` → labelled `OUT_OF_SCOPE_UNIT`. Extractor extracts `20 by 40 metres` as a single `COMPOUND_DIMENSION`; the hyphenated `0.25-metre` is suppressed. **FP (1 entity).**

Both passages contain genuine physical dimension mentions. The extractor is correct that they are numeric entities. The third set labelled them as negatives because the author's intent was that cartographic and geophysics parameters are not archaeological finds. That intent belongs to Step 4 (Attribution), not to Step 3 (Mention-Level Extraction). Spec v2.0 Section 2.3 settled this: Step 3 extracts all valid mentions.

**Reconciliation of False-Positive Entity Counts:**  
Together, TE-19 (1 FP: `0.5 m`) and TE-29 (1 FP: `20 by 40 m`) account for the exact 2 false-positive entities observed in Run 6 and Run 7 (precision = 26 TP / (26 TP + 2 FP) = 26/28 = 92.9%). Relabelling both passages as positive mentions in Run 7b under Spec v2.1 §2.3 adds exactly +2 positive entities, yielding 28/28 = 100.0% precision.

**Hyphenated Unit Recall Gap Masked by Relabelling:**  
Under Spec v2.1 §2.3 ("extract all valid mentions"), the string `0.25-metre` in TE-29 is a valid physical dimension mention. However, because `entity_extractor.hpp` does not support hyphenated unit adjectives (`<number>-<unit>`), it failed to extract `0.25-metre`. In Run 7b, the author relabelled TE-29 by adding only `20 by 40 m` to the expected entity list, omitting `0.25-metre`. Had `0.25-metre` been included as expected, Run 7b recall would have been 28/29 (96.6%) rather than 100.0%. Furthermore, in Dev Set 4, FE-20 formulated its equivalent sampling case with a space (`5 cm intervals`) rather than a hyphen, keeping the defect hidden. This hyphenated unit limitation is a documented grammar gap.

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

Run 8 extractor commit: `40c61d9`. Confirmed re-run on `0e54f90`: identical results (30/30 PASS).  
Dataset SHA-256: `B103E4CAB17A4A9B93EFEE4122A925A8BA228073F1631BCDBB5B107EB8FD66CB`

**Treat Run 8 as a Fourth Dev Set until an independent author writes a set against a hash-sealed extractor commit.**

---

## 8. Dual-OCR Engine Transcription Agreement (Diagnostic)

An earlier intermediate run reported 139 clean facts (Tesseract) and 128 (Windows OCR). The current evaluation (`test_real_ocr_eval.cpp`) reports 137 and 124. The difference:

- `test_real_ocr_eval.cpp` uses **exact case-insensitive substring search** (`icontains`): a value must appear verbatim as a contiguous substring of the OCR text.
- The earlier run (`test_reproduce_benchmark_166.cpp`) used **whitespace- and punctuation-flexible regex**: allowed `\s*` between tokens, comma variations `[,.]?`, and optional periods in eras (`\.?`).

### 8.1 The 2 + 4 Discrepant Facts Between Matchers

| Engine | Fact # | Page ID | Type | Ground Truth | OCR Observed String | Matcher Discrepancy Reason |
|---|---|---|---|---|---|---|
| **Tesseract** | #57 | `sankalia_p210-210` | Date | `"431 A.D."` | `"431 AD"` | Missing periods. Matched by regex `\.?`; missed by strict `icontains`. |
| **Tesseract** | #145 | `rajan_p050-050` | Date | `"1881 and 1896"` | `"1881 and\n1896"` | OCR newline between tokens. Matched by regex `\s+`; missed by strict `icontains`. |
| **Windows OCR** | #38 | `sankalia_p025-025` | Count | `"10,000"` | `"10.000"` | Dot instead of comma. Matched by regex `[,.]?`; missed by strict `icontains`. |
| **Windows OCR** | #54 | `sankalia_p210-210` | Date | `"400 A.D."` | `"400 AD."` | Missing period after A. Matched by regex `\.?`; missed by strict `icontains`. |
| **Windows OCR** | #157 | `rajan_p110-110` | Measurement | `"70,000"` | `"70.000"` | Dot instead of comma. Matched by regex `[,.]?`; missed by strict `icontains`. |
| **Windows OCR** | #161 | `rajan_p110-110` | Measurement | `"300-10,000"` | `"300-10.000"` | Dot instead of comma. Matched by regex `[,.]?`; missed by strict `icontains`. |

### 8.2 Dual-Engine Agreement Re-Run Under Strict Scorer

Re-running the dual-engine router across all 166 facts under both regimes:

**Important note on terminology.** The scorer (§8.1) classifies facts by whether each engine found the ground-truth value. The router (`DualEngineEnsembleRouter`) classifies facts by whether both engines' *extracted strings*, after normalization, agree with each other. A fact can be scorer-both-correct (both engines found the GT value) while simultaneously being router-queued (the extracted strings differ). §8.2 uses scorer buckets throughout; §8.3 uses router status. Keep these separate.

**Full six-fact transition table (scorer buckets, old regex → strict `icontains`):**

| Fact | Class | GT Value | Old scorer bucket | New scorer bucket | Old Win extracted | Old Tess extracted |
|---|---|---|---|---|---|---|
| **#38** | B (Sankalia) | `10,000` | **both-correct** | Tess-only | `"10.000"` via `[,.]?` | `"10,000"` verbatim |
| **#54** | B (Sankalia) | `400 A.D.` | **both-correct** | Tess-only | `"400 AD."` via `\.?` | `"400 A.D."` verbatim |
| **#57** | B (Sankalia) | `431 A.D.` | **Tess-only** | both-fail | miss | `"431 AD"` via `\.?` |
| **#145** | A (Rajan) | `1881 and 1896` | **Tess-only** | both-fail | miss | `"1881 and\n1896"` via `\s+` |
| **#157** | A (Rajan) | `70,000` | **Win-only** | both-fail | `"70.000"` via `[,.]?` | miss |
| **#161** | A (Rajan) | `300-10,000` | **both-correct** | Tess-only | `"300-10.000"` via `[,.]?` | `"300-10,000"` verbatim |

**Column delta verification** (old → new): both-correct −3 (#38, #54, #161) → 116 ✓; Tess-only +1 (−2 from #57,#145 leaving; +3 from #38,#54,#161 entering) → 21 ✓; Win-only −1 (#157 leaves) → 8 ✓; both-fail +3 (#57, #145, #157) → 21 ✓.

| Metric | Older Rule (Regex) | Strict Rule (`icontains`) | Delta | Explanation |
|---|:---:|:---:|:---:|---|
| **Tesseract Hits** | 139 / 166 (83.7%) | 137 / 166 (82.5%) | -2 | #57 and #145 lost (Tess-only → both-fail) |
| **Windows OCR Hits** | 128 / 166 (77.1%) | 124 / 166 (74.7%) | -4 | #38, #54, #157, #161 lost |
| **Dual-OCR Agreement on Ground Truth (scorer)*** | 119 (71.7%) | 116 (69.9%) | **-3** | **#38, #54, #161** leave (→ Tess-only). #57 was Tess-only, not both-correct. |
| **Windows OCR Only Correct** | 9 | 8 | -1 | #157 leaves (Win-only → both-fail) |
| **Tesseract Only Correct** | 20 | 21 | +1 | +3 arrive (#38, #54, #161); −2 leave (#57, #145 → both-fail); net +1 |
| **Both Failed** | 18 | 21 | +3 | #57, #145, #157 all → both-fail |
| **Total Errors** | 47 (28.3%) | 50 (30.1%) | +3 | Error set expanded from 47 to 50 |
| **Class A Auto-Accepted (Router)** | **92 / 104 (88.5%)** | **92 / 104 (88.5%)** | **0** | **Same 92 physical facts — see §8.3** |
| **Class A Routed to Verification Queue** | **12 / 104 (11.5%)** | **12 / 104 (11.5%)** | **0** | **Same 12 physical facts — see §8.3** |
| **Class B Auto-Accepted** | **0 / 62 (0.0%)** | **0 / 62 (0.0%)** | **0** | Architecturally gated to 100% manual review |

*\*Note on OCR Agreement vs Extractor Capability: The 116/166 (69.9%) figure measures OCR text transcription agreement with ground truth across all 166 facts (including 111 bare years). It is NOT extractor recall. The extractor's in-scope pipeline recall is 27.3%–40.0% (and 31.6% in Class A).*

### 8.3 Class A Router Set Identity — Per-Fact Proof

**Preliminary: is the router independent of the scorer?**  
No — not trivially. The router (`DualEngineEnsembleRouter::ProcessDocument`) receives `value_engine_a` and `value_engine_b` from `MatchCandidateInText`. The scorer choice determines what string is placed in those fields. The claim that 92/104 is identical under both regimes requires per-fact tracing, not a trivial independence argument.

**Fact #161 — scorer both-correct, router queued (two different statuses, not a contradiction):**  
Fact #161 (`300-10,000`, `rajan_p110`, Class A): Under the old matcher, Win extracted `"300-10.000"` (comma→dot via `[,.]?` regex) and Tess extracted `"300-10,000"` (verbatim). The scorer counted both engines as hitting the ground-truth value → **scorer: both-correct**. But `NormalizeNumericFact("300-10.000")` = `"300-10.000"` while `NormalizeNumericFact("300-10,000")` = `"300-10000"` (comma stripped). These are unequal → **router: Queue** under old regime. Under strict matcher, Win missed entirely → also **router: Queue**. Router status is identical in both regimes despite the scorer bucket changing (both-correct → Tess-only).

**Class B gating:** All Sankalia facts (#38, #54, #57) are hard-gated to `GATED_MANUAL_REVIEW_REQUIRED` before any consensus logic runs — they never reach the `normA == normB` path and are irrelevant to the Class A count in both regimes.

**All 12 Class A queued facts — router status under each regime:**

| Fact | Page | GT Value | Old regime router | Strict regime router |
|---|---|---|---|---|
| fact-101 | rajan_p020 | `1764` | Win miss, Tess hit → Queue | Win miss, Tess hit → Queue |
| fact-104 | rajan_p020 | `1799` | Win miss, Tess hit → Queue | Win miss, Tess hit → Queue |
| fact-110 | rajan_p021 | `1611-1632` | Win miss, Tess hit → Queue | Win miss, Tess hit → Queue |
| fact-125 | rajan_p023 | `1871` | Win miss, Tess hit → Queue | Win miss, Tess hit → Queue |
| fact-129 | rajan_p024 | `1774` | Win miss, Tess hit → Queue | Win miss, Tess hit → Queue |
| fact-134 | rajan_p024 | `1834-1913` | Win miss, Tess hit → Queue | Win miss, Tess hit → Queue |
| fact-145 | rajan_p050 | `1881 and 1896` | Old Win miss (OCR has `"1 896"` with broken digit), Old Tess hit (`"1881 and\n1896"` via `\s+`) → Queue | Both miss (both `""`) → Queue |
| fact-157 | rajan_p110 | `70,000` | Win `"70.000"`, Tess miss → Queue | Both miss → Queue |
| fact-159 | rajan_p110 | `10,000-20,000,000` | Both miss → Queue | Both miss → Queue |
| fact-161 | rajan_p110 | `300-10,000` | Win `"300-10.000"` ≠ Tess `"300-10,000"` → normalize unequal → Queue | Win miss, Tess hit → Queue |
| fact-165 | rajan_p110 | `7,400` | Win hit, Tess miss → Queue | Win hit, Tess miss → Queue |
| fact-166 | rajan_p110 | `5,000-40,000` | Both miss → Queue | Both miss → Queue |

The 92 auto-accepted facts are the **identical physical items** in both regimes.

**Diagnostic Status & Scope Limitation of Dual-Engine Agreement:**  
This evaluation measures OCR transcription consistency between Tesseract and Windows OCR on known ground-truth strings. It must NOT be interpreted as an evaluation of `EntityExtractor` output or autonomous routing capability:
1. **Extraction Target Disconnect:** The router harness queries OCR text directly for known ground-truth values via `MatchCandidateInText`. Because 85 of the 104 Class A facts are bare 4-digit years that `EntityExtractor` intentionally excludes, **at least 78 of the 92 auto-accepted facts are entities that the Step 3 extractor never extracts**. The 88.5% figure measures dual-OCR transcript agreement on 4-digit years, not extractor coverage.
2. **Phase 0 False Consensus Finding (Unmeasured Benchmark Artifact):** Phase 0 Report 01 cited a "0% false consensus rate" across 50 real scanned pages. Inspection of `benchmark_results_v2.json` and the evaluation script `evaluate_benchmark_v2.js` (at commit `e71f709`) reveals the origin of this figure:
   ```javascript
       } else {
         // Both failed
         totalErrors++;
         bothFailed++;
         // Did they disagree in their failure, or agree on the false value?
         // If one engine found nothing and one found garbled text, they disagreed.
         // False consensus only occurs if both produced the identical corrupted string.
         disagreementCaughtErrors++; // In archaeological scans, failure modes differ (e.g. garble vs drop)
       }
   ```
   `benchmark_results_v2.json` stores only boolean `win_hit` and `tess_hit` flags per fact, not the raw strings transcribed by each engine when ground-truth matching failed. Whenever both engines failed to find the ground truth, the script unconditionally incremented `disagreementCaughtErrors` and left `falseConsensusCount` at 0 without comparing what either engine actually transcribed. Therefore, the 0% false consensus claim was **never directly measured** on failed facts; it was an untested structural assumption of the evaluation script. A location-anchored re-read is required for the 12 queued and 50 failed Class A facts before relying on dual-engine consensus as a safety mechanism.

### 8.4 Empirical Measurement Under Span-Anchored Scorer (Task 3)

The benchmark evaluation harness was evaluated under the pre-registered Span-Anchored Scorer (`docs/specs/03_anchored_scorer_rules.md`, SHA-256: `DAB26B0E085044F09F511BFAF95D797638DC292BF47BEF0AB87F7A8277DBC24C`). Every fact was anchored to its surrounding clausal context words ($\pm 120$ characters) without numeric value leakage.

#### Mutually Exclusive Outcome Categories (Taxonomy v2.0, N = 166):

| Outcome Category | Class A (n=104) | Class B (n=62) | Overall Corpus (N=166) | Interpretation |
|---|:---:|:---:|:---:|---|
| **`BOTH_CORRECT`** | **54** (51.9%) | **4** (6.5%) | **58** (34.9%) | Both engines extracted correct ground-truth value |
| **`ONE_CORRECT`** | **11** (10.6%) | **10** (16.1%) | **21** (12.7%) | Disagreement caught error (routed to human queue) |
| **`UNIT_LOST`** | **3** (2.9%) | **1** (1.6%) | **4** (2.4%) | Correct number read, unit/symbol dropped (#51, #93, #151, #153) |
| **`PARTIAL_READ`** | **2** (1.9%) | **0** (0.0%) | **2** (1.2%) | Valid sub-token of compound entity extracted (#143, #144) |
| **`SCORER_TOKEN_DISPLACEMENT`** | **12** (11.5%) | **1** (1.6%) | **13** (7.8%) | GT verbatim in both windows; scorer picked adjacent token |
| **`GT_ABSENT_FROM_WINDOW`** | **1** (1.0%) | **2** (3.2%) | **3** (1.8%) | Context words matched narrative; target entity in separate section |
| **`BOTH_WRONG_DIFF`** | **19** (18.3%) | **35** (56.5%) | **54** (32.5%) | Both failed with differing candidate strings (disagreement caught) |
| **`TRUE_SHARED_MISREAD`** | **0** (0.0%) | **0** (0.0%) | **0** (0.0%) | **TRUE FALSE CONSENSUS:** Both made identical optical misread |
| **`ANCHOR_MISSING`** | **2** (1.9%) | **9** (14.5%) | **11** (6.6%) | Severe OCR text degradation (anchor context unlocated) |
| **`UNANCHORABLE`** | **0** (0.0%) | **0** (0.0%) | **0** (0.0%) | Zero facts unanchorable |
| **Total** | **104** | **62** | **166** | Mutually exclusive & complete partition |

#### Empirical Consensus Audit Findings:
1. **True Optical False Consensus is 0.00% (0 / 80 [0.00%, 4.58%]):** A forensic inspection of all 22 apparent false consensus cases revealed that **zero facts represent a shared optical misread** of the target fact. When both engines agree on the target clausal span, their optical transcription is correct.
2. **Unit / Symbol Loss (5.00% of agreed facts):** 4 facts (#51 `6 m`, #93 `40 miles`, #151 `30%`, #153 `10%`) represent accurate numeric transcription where units or symbols were stripped by candidate normalization. Auto-accepting bare numbers without unit validation would introduce silent database corruption; Step 4 must require unit preservation.
3. **Partial Reads (2.50% of agreed facts):** 2 facts (#143 `1631 to 1641` $\to$ `1631`, #144 `1956:81` $\to$ `1956`) represent partial reads of compound structures.
4. **Scorer Token Picker Displacements (16.25% of agreed facts):** In 13 facts, the ground truth was transcribed verbatim by both engines within the clausal window, but naive character-proximity selection selected an adjacent numerical token (e.g. excavator lifespan `1506-1552` instead of arrival date `1542`, or page header `181` instead of `2 hours`). These reflect scorer candidate-selection mechanics, not OCR failure.
5. **Attribution is the Real Hard Problem (Fact #154):** In cases like Fact #154 (`10%` and `3%` in the same sentence), both engines transcribe both values cleanly. The error is the picker choosing the wrong valid number for the attribute. Attribution (which number answers which archaeological question) is the architectural challenge, not optical transcription.
6. **Agreed Wrong Candidate, GT Absent (3.75% of agreed facts):** In 3 facts (#55, #56, #73), anchor context words matched narrative text while the target date resided in a table, footnote, or citation block outside the $\pm 120$ character window. Both engines missed the target date and agreed on a neighboring number.
7. **Router Circularity & Product Policy:** Passing the 22 pairs to `DualEngineEnsembleRouter::ProcessDocument` results in all 22 being auto-accepted by construction (`normA == normB` evaluates true on equal strings). This demonstrates that string equality alone cannot prevent ingestion errors when a candidate picker drops units or displaces tokens. Consequently, **Class A automated ingestion is paused**, and all facts are routed to the verification queue until Step 4 binds candidates to clausal spans and units.

#### Classification Provenance (Honest Disclosure):
The classification of the 22 consensus-error facts was performed **forensically after viewing candidate extraction outputs and document page texts**. It did not precede execution. The presence of the ground truth in the window and the diagnoses of unit loss and token displacement were verified post-hoc. Complete ±120 character windows for all 22 facts are recorded in `docs/reports/false_consensus_22_windows.md`.



### 8.4 Scorer Matching Boundaries & Re-Derived Clean Denominators

The benchmark evaluation harness was audited for sensitivity to unanchored case-insensitive substring search (`icontains`):
1. **Re-Derived Clean Denominators under Word Boundaries (`\b`):**
   - On **Tesseract 5.4**, boundary matching confirms exactly **36 clean facts** (15 Class A, 21 Class B)—identical to the unanchored count.
   - On **Windows OCR**, boundary matching confirms **29 clean facts** (14 Class A, 15 Class B) vs. 30 under unanchored search. The single discrepancy is Fact #68 (`chakrabarti_p016`, count `"400"`): Windows OCR merged `"of"` and `"400"` into `"of400"` without whitespace. Under unanchored search, `"of400"` contained `"400"` as a substring, but strict boundary matching correctly rejects it.
2. **Token Boundary Absence in Extraction Hits:**
   - Unanchored `icontains` checks raw substring containment without word boundaries. As revealed in Appendix 11, this allowed 8 single-digit count extractions (`"3"`, `"6"`, `"4"`, `"1"`) on pages 57 and 58 to score as spurious hits against multi-digit ground truths (`"330"`, `"186"`, `"276"`), inflating Tesseract's pipeline recall by 14.5 percentage points.
3. **Unanchored Page-Level Matching:**
   - Matching was page-level rather than coordinate-anchored to the ground-truth token location. If an identical numerical value appears elsewhere on the page in an unrelated passage (e.g. repeated publication dates), it is credited as a hit.
4. **Harness Upgrade Requirement:**
   - Step 4 attribution and subsequent evaluations must upgrade the test harness to enforce strict regex word boundaries and ground-truth character span proximity to prevent unanchored false-positive hits.

---

## 9. Gate Status Summary (Spec v2.0)

Pre-registered gates: **Precision ≥ 90.0%, Recall ≥ 90.0%, Specificity ≥ 95.0%**  
With n = 15 negatives, Spec ≥ 95% requires 15/15 (zero FP tolerance). Test harness assertions have been formally reconciled to Spec v2.0 gates (`90/90/95`).

| Suite | Precision | Recall | Specificity | Gate |
|:---:|:---:|:---:|:---:|:---:|
| Dev Set 1 — `a6cf766` (Run 1) | VOID | VOID | VOID | VOID (hardcoded literals) |
| Dev Set 1 — `0e54f90` (Run 1b) | 96.7% | 93.5% | 90.0% | FAIL Spec (≥95% requires 10/10) |
| Dev Set 2 — baseline `ccbc5f3` (Run 2) | 81.5% | 57.9% | 96.0% | FAIL P and R |
| Dev Set 2 — relabelled (Run 3) | 100.0% | 100.0% | 100.0% | Not independent (co-evolved) |
| Dev Set 3 — Initial Unbiased Run (Run 6a) | 92.0% (23/25) | 88.5% (23/26) | 86.7% (13/15) | **FAIL** Spec. Initial run on `ccbc5f3`; missed TE-01, TE-02, TE-21 |
| Dev Set 3 — Post-Patch (Run 6b / Run 7) | 92.9% (26/28) | 100.0% (26/26) | 86.7% (13/15) | **FAIL** Spec. TE-19 and TE-29 still fire (Headline Result) |
| Dev Set 3 — v2.1 Relabelled (Run 7b) | 100.0% (28/28) | 96.6% (28/29) | 100.0% (13/13) | Relabelled post-hoc under §2.3; misses `0.25-metre` FN |
| Fourth Dev Set (Run 8) | 100.0% (24/24) | 100.0% (24/24) | 100.0% (10/10) | Point estimate PASS (24/24); lower bound 72.2% (10/10 neg); confirmed on HEAD post-excision (`0e54f90`); not independent |
| Real-OCR Tesseract (Run 5a, `116995d`) | N/A | Lenient: 61.1% in-scope clean (22/36)<br>40.0% pipeline (22/55)<br>[14.6% raw all-fact clean (20/137)] | Vacuous (0/20 fired) | Literals present in build; 1/29 corrupted produced mention |
| Real-OCR Windows OCR (Run 5b, `116995d`) | N/A | Lenient: 50.0% in-scope clean (15/30)<br>27.3% pipeline (15/55)<br>[10.5% raw all-fact clean (13/124)] | Vacuous (0/13 fired) | Literals present in build; 2/42 corrupted produced mention |
| Real-OCR Tesseract (Run 9a, `0e54f90`) | N/A | **Strict: 38.9% in-scope clean (14/36)**<br>**25.5% pipeline (14/55)**<br>[Lenient: 61.1% clean, 40.0% pipe] | Vacuous (0/22 fired, 22/22) | Post-excision strict boundary confirmed; 0/29 corrupted produced mention |
| Real-OCR Windows OCR (Run 9b, `0e54f90`) | N/A | **Strict: 44.8% in-scope clean (13/29)**†<br>**23.6% pipeline (13/55)**<br>[Lenient: 50.0% clean, 27.3% pipe] | Vacuous (0/16 fired, 16/16) | Post-excision strict boundary confirmed; 0/42 corrupted produced mention |

*†Note on Windows OCR Clean Denominator: 13/29 (44.8%) under strict word boundaries; 13/30 (43.3%) under lenient denominator.*  
*\*Note on Fact #31 & Denominator Accounting: Under the sealed 55-fact ground truth, Windows OCR achieves 13/55 strict pipeline recall (23.6% [14.4%, 36.3%]) and Tesseract achieves 14/55 (25.5% [15.8%, 38.3%]). If Fact #31 ("955 B.C.", recorded in GT as "955") is re-classified as an in-scope era date, both engines achieve 14/56 strict pipeline recall (25.0% [15.5%, 37.7%]); Windows OCR achieves 14/30 strict clean recall (46.7% [30.2%, 63.9%]).*

---

## 10. Open Items & Step 4 Dependencies

1. **Independent evaluation & Dev Set 4 provenance:**  
   Dev Set 4 passed 30/30 (TP: 24, FP: 0, TN: 10/10; Specificity Wilson 95% CI: [72.2%, 100.0%]) and was confirmed on HEAD after excising all hardcoded literals (`0e54f90`). However, because Dev Set 4 was authored by the same developer who wrote the extractor, it functions as a regression guard rather than an independent validation. Production gating requires an evaluation set authored independently against a hash-sealed binary.

2. **Anomaly sensitivity architecture & unevaluated detector on real noise:**  
   With the 5 hardcoded literals excised, the plausibility anomaly detector was **unevaluated** on real OCR corruptions because 0 of 29 (Tesseract) and 0 of 42 (Windows OCR) corrupted facts produced an entity mention. The general grammar simply dropped the corrupted tokens, meaning zero corrupted mentions ever reached the detector. Plausibility specificity on real OCR clean facts (22/22 Tess and 16/16 Win) is **vacuous** because the detector never fired on any mention. The detector provides zero demonstrated protection on real OCR noise and must not be cited as a safeguard. A statistical plausibility approach (e.g., z-scores on measurement distributions per unit type) is the required architectural replacement in a future step.

3. **Bare-year corruption risk & Step 4 Scope (Critical Risk):**
   - Across the entire corpus, 111 of 166 total facts (**66.9%**) are bare 4-digit years (85 of 104 in Class A, 81.7%; 26 of 62 in Class B, 41.9%).
   - **Bare-Year Structural Risk & Lack of Syntactic Verification:** Bare 4-digit years lack era markers or unit suffixes. Under unanchored matching, repeated 4-digit years in bibliography entries mask target sentence corruptions. Step 4 must NOT downgrade attention or attribution safeguards on bare excavation years.
   - **The Real Bare-Year Risk is Structural and Deceptive:**
     - *Sheer Volume:* Bare years dominate the corpus (66.9% overall, 81.7% in Class A).
     - *Absence of Syntactic Verification:* Unlike era dates (`BC`, `BP`) or measurements (`m`, `cm`), bare years lack syntactic markers. Single-digit OCR substitutions (`1963` $\to$ `1063`, `1945` $\to$ `1965`) remain syntactically indistinguishable from legitimate historical years and cannot be caught by regex or unit plausibility.
     - *Misleading Headline Consensus:* While dual-OCR agreement in Class A is 88.5% (92/104), at least 78 of those 92 auto-accepted facts are bare years that the Step 3 extractor intentionally excludes. The high consensus measures OCR transcript agreement on years, not extractor coverage.
   - Excluding bare years from Step 3 preserves mention-level precision, but **does not make those OCR corruptions go away**.
   - Step 4 (Attribution) must explicitly introduce a contextual negative filter (suppressing page numbers, bibliography dates, modern publication metadata) to safely handle bare excavation years.

4. **Principled In-Scope Denominator & Extractor Gaps:**  
   The 19 in-scope Class A facts account for 15 clean facts and 4 OCR-corrupted facts (3 corrupted on both engines, 1 engine-specific). For the 15 clean facts:
   - **6 extracted hits:** Era-marked dates (`3700 BC`, `5199 BC`, `4004 BC`, `79 AD`, `800 BC`, `95-55 BC`). Unadjusted Clean Recall = $6 / 15 = 40.0\%$ [95% CI: 19.8%, 64.3%].
   - **5 Prospective Out-of-Scope units (in-scope misses under current Spec v2.0):** `40 miles` (imperial distance), `30%`, `10%`, `3%` (conservation-solution percentages), `2 hours` (immersion duration). These lie outside §2.2 OOS examples; they are counted as in-scope grammar misses in the 55-fact denominator until formally excised by an approved spec amendment.
   - **4 Legitimate grammar gaps:** `50,000 BP` (comma-thousands before `BP` not handled), `300-10,000` (bare measurement range without a unit suffix), `400` houses / `300` galleries (count-noun lexicon gap). These are in-scope by the spec and represent real extractor shortfalls.
   - Accounting closes: $19 = 6\text{ hits} + 5\text{ prospective OOS units} + 4\text{ grammar gaps} + 4\text{ OCR corruptions}$.
   - **Metric Framing:** The primary headline capability metric is **Pipeline Recall: $6 / 19 = 31.6\%$ [95% CI: 15.4%, 54.0%]**. If the 5 prospective OOS facts are formally re-classified, clean Class A recall becomes $6 / 10 = 60.0\%$ [95% CI: 31.3%, 83.2%]. This 60.0% figure was evaluated across the full 50-page set (not a distinct 25-page development partition); it is strictly an exploratory diagnostic with a wide confidence interval, not a validated headline capability.

5. **`SURVEY_OR_CARTOGRAPHIC` Tag — Test Coverage Gap:**  
   The tag is specified in §2.3.3 (spec prose) but is not yet a field on `ExtractedEntity` and has no test assertion. No test can detect a regression if the extractor silently drops the tag. Step 4 must: (a) add `context_domain` to `ExtractedEntity`, (b) write assertions that TE-19, TE-29, FE-19, FE-20 type passages produce the tag, and (c) seal the result with the commit hash. Until then, the tag is unenforceable.

6. **Corpus Scope & Real-Page Evaluation Protocol:**
   - The entire real-page benchmark currently rests on 50 pages from 3 Indian site monographs (Rajan, Chakrabarti, Sankalia).
   - **Methodological Status of 25/25 Split:** All 50 physical monograph pages were evaluated and inspected during benchmark construction; the 25/25 development/evaluation split was not maintained as a blinded partition during Phase 2 Step 3. All reported statistics (including the 60.0% Class A diagnostic and the 27.3%–40.0% pipeline recall) derive from the full 50-page set.
   - The 25/25 partition is a **prospective protocol** that must be instituted with newly scanned pages for future tuning.

7. **Scorer Token Boundary & Location Matching Harness Requirement:**
   - Step 4 Attribution must upgrade the benchmark evaluation harness from unanchored case-insensitive substring matching (`icontains`) to regex word-boundary (`\b`) matching and character-span proximity against ground-truth locations, eliminating potential unanchored false-positive hits from unrelated page text.

8. **Test Harness Threshold Reconciliation:**
   - The test harnesses (`tests/test_entity_extraction_held_out_run.cpp` and `test_entity_extraction_third_set_run.cpp`) previously evaluated against legacy exploratory thresholds (`92/80/95`).
   - These have now been formally reconciled to the Spec v2.0 pre-registered gates: **Precision ≥ 90.0%, Recall ≥ 90.0%, Specificity ≥ 95.0%**.

9. **Methodological Shift of Precision Responsibility to Step 4:**
   - Section 5 of this report notes that "a baseline cannot be edited after the extractor has been fixed against it." Yet the progression of Step 3 development reveals a recurring co-evolution: Dev Set 2 was relabelled in Run 3; Spec v2.1 §2.3 was introduced after TE-19 and TE-29 failed Runs 6 and 7; Dev Set 3 was relabelled in Run 7b; and Dev Set 4 was authored by the extractor developer with identical cases pre-labelled as positives (Run 8).
   - Under Spec v2.1 §2.3 ("extract all valid physical mentions"), mention-level extraction specificity becomes straightforward because non-archaeological survey parameters (e.g. contour intervals, traverse grids) are classified as true positives.
   - However, this architectural choice shifts the entire burden of precision—rejecting survey, cartographic, and administrative figures from the archaeological database—downstream to Step 4 (Attribution). A Step 3 gate pass under §2.3 therefore provides no guarantee of end-to-end pipeline precision.

10. **TE-29 Hyphenation Recall Gap & Dataset Co-Evolution:**
    - Under Spec v2.1 §2.3 ("extract all valid physical mentions"), the passage in TE-29 (`"...grid of 20 by 40 metres at 0.25-metre traverse spacing."`) contains two physical dimension mentions. The extractor extracts `20 by 40 metres` but misses `0.25-metre` because `re_linear_dim` expects whitespace or immediate suffixes, failing on hyphenated unit adjectives (`<number>-<unit>`).
    - When TE-29 was relabelled in Run 7b, the author added only `20 by 40 m` to the expected entity list, omitting `0.25-metre`. Had `0.25-metre` been included as expected under §2.3, Run 7b recall would have dropped to 28/29 (96.6%) rather than 100.0%.
    - Furthermore, when Dev Set 4 was authored (Run 8), its equivalent methodological sampling case (FE-20) formulated the dimension with a space (`5 cm intervals`) rather than a hyphen, keeping the hyphenation limitation hidden and allowing Dev Set 4 to score 100%.
    - This pattern—where test datasets are edited or authored to mirror the extractor's specific output—masks a real False Negative. Hyphenated unit adjectives must be explicitly incorporated into the extractor grammar in Step 4.

11. **Step 4 Attribution Precision & Rejection Measurement Framework:**
    Because Step 3 delegates precision by classifying survey and sampling figures as valid mentions, Step 4 bears the sole architectural responsibility for preventing non-archaeological numbers from polluting the Knowledge Graph. Step 4 precision must be measured against a pre-registered framework:
    - **Attribution Precision ($P_{attr} \ge 90.0\%$):** Correctly linked archaeological mentions to true KG nodes / total mentions linked. Any cartographic parameter or page number linked to a finding node is an FP.
    - **Rejection Specificity ($S_{reject} \ge 95.0\%$):** Correctly suppressed / unlinked survey, cartographic, and metadata mentions / total non-archaeological mentions extracted.
    - **Attribution Recall ($R_{attr} \ge 90.0\%$):** Correctly linked mentions / total valid archaeological mentions.
    - **Benchmarking Suite:** Step 4 must construct an independent 50-passage benchmark containing a 50/50 mix of genuine archaeological findings and non-archaeological methodology parameters (e.g. contour intervals, traverse grids, core sample depths, modern publication years, page citations). Testing must assert that parameters tagged `SURVEY_OR_CARTOGRAPHIC` are suppressed from KG insertion.

---

## 11. Appendix: Complete Audit of Real-OCR Extracted Hits & Match Equality

The benchmark evaluation harness accepts an extraction as a hit if `icontains(raw_match, gt)` or `icontains(gt, raw_match)` in either direction, or if `icontains(normalized_value, gt)`. A partial extraction can therefore score as a hit—for example, extracting `"10,000"` from the range `"300-10,000"` counts because the ground-truth string contains the extraction. Until strict token-boundary and span-equality matching is enforced, "extractor recall" in benchmark scoring really means "extractor produced a candidate string overlapping the ground truth."

To measure the impact of this bidirectional leniency, every extracted hit across both engines was inspected for exact character-span equality against the ground-truth value.

### 11.1 Class A Hits (Modern Offset Monograph Pages)

All 6 Class A hits on Tesseract and Windows OCR represent era-marked historical dates:

| Hit # | Fact ID | Page ID | GT Type | Ground-Truth Value | Extracted `raw_match` | Extracted `normalized_value` | Match Equality Status | Description |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **1** | Fact 96 | `rajan_p019` | date | `"3700 BC"` | `"about 3700 BC"` | `"-3699"` (`APPROX_DATE_BCE`) | Substring Overlap | Biblical rabbinical creation date (captured modifier) |
| **2** | Fact 97 | `rajan_p019` | date | `"5199 BC"` | `"5199 BC"` | `"-5198"` (`EXACT_DATE_BCE`) | **EXACT VERBATIM** | Pope Clement VIII creation date |
| **3** | Fact 98 | `rajan_p019` | date | `"4004 BC"` | `"4004 BC"` | `"-4003"` (`EXACT_DATE_BCE`) | **EXACT VERBATIM** | Archbishop James Ussher creation date |
| **4** | Fact 100 | `rajan_p020` | date | `"79 AD"` | `"79 AD"` | `"+79"` (`EXACT_DATE_CE`) | **EXACT VERBATIM** | Vesuvius eruption date |
| **5** | Fact 112 | `rajan_p022` | date | `"800 BC"` | `"about 800 BC"` | `"-799"` (`APPROX_DATE_BCE`) | Substring Overlap | Hesiod epic poem date (captured modifier) |
| **6** | Fact 113 | `rajan_p022` | date | `"95-55 BC"` | `"95-55 BC"` | `"[-94, -54]"` (`DATE_RANGE`) | **EXACT VERBATIM** | Titus Lucretius Carus dates |

*Class A Finding:* 4 of 6 hits are exact character-for-character verbatim matches. The remaining 2 are genuine date extractions where the grammar correctly incorporated the approximate modifier `"about "`. Zero Class A hits are spurious.

### 11.2 Class B Hits (Degraded Letterpress Monograph Pages)

On Tesseract 5.4, 16 hits were credited in Class B:

| Hit # | Fact ID | Page ID | GT Type | Ground-Truth Value | Extracted `raw_match` | Extracted `normalized_value` | Match Equality Status | Description & Diagnosis |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **1** | Fact 4 | `sankalia_p053` | measurement | `"8 m."` | `"8 m"` | `"8.000 m"` | Substring Overlap | Trailing period omitted by regex (genuine hit) |
| **2** | Fact 7 | `sankalia_p053` | measurement | `"20-40 cm"` | `"20-40 cm"` | `"[0.20, 0.40] m"` | **EXACT VERBATIM** | Rubble horizon thickness (genuine hit) |
| **3** | Fact 8 | `sankalia_p054` | measurement | `"7 m."` | `"7 m"` | `"7.000 m"` | Substring Overlap | Trailing period omitted by regex (genuine hit) |
| **4** | Fact 9 | `sankalia_p055` | count | `"6 pieces"` | `"6 pieces"` | `"6"` | **EXACT VERBATIM** | Large cores in Trench B (genuine hit) |
| **5** | Fact 14 | `sankalia_p057` | count | `"330"` | `"3 choppers"` | `"3"` | **SPURIOUS OVERLAP** | Single digit `"3"` matched `"330"` via `icontains` |
| **6** | Fact 15 | `sankalia_p057` | count | `"546"` | `"6 scrapers"` | `"6"` | **SPURIOUS OVERLAP** | Single digit `"6"` matched `"546"` via `icontains` |
| **7** | Fact 17 | `sankalia_p058` | count | `"186"` | `"6 scrapers"` | `"6"` | **SPURIOUS OVERLAP** | Single digit `"6"` matched `"186"` via `icontains` |
| **8** | Fact 18 | `sankalia_p058` | count | `"382"` | `"3 choppers"` | `"3"` | **SPURIOUS OVERLAP** | Single digit `"3"` matched `"382"` via `icontains` |
| **9** | Fact 19 | `sankalia_p058` | count | `"66"` | `"6 scrapers"` | `"6"` | **SPURIOUS OVERLAP** | Single digit `"6"` matched `"66"` via `icontains` |
| **10** | Fact 20 | `sankalia_p058` | count | `"276"` | `"6 cortex flakes"` | `"6"` | **SPURIOUS OVERLAP** | Single digit `"6"` matched `"276"` via `icontains` |
| **11** | Fact 21 | `sankalia_p058` | count | `"48"` | `"4 worked flakes"` | `"4"` | **SPURIOUS OVERLAP** | Single digit `"4"` matched `"48"` via `icontains` |
| **12** | Fact 22 | `sankalia_p058` | count | `"152"` | `"1 handaxes"` | `"1"` | **SPURIOUS OVERLAP** | Single digit `"1"` matched `"152"` via `icontains` |
| **13** | Fact 26 | `sankalia_p064` | date | `"2000 B.C."` | `"about 2000 B.c."` | `"-1999"` | Substring Overlap | Captured modifier and OCR case `"B.c."` (genuine) |
| **14** | Fact 51 | `sankalia_p150` | measurement | `"6 m"` | `"6 m"` | `"6.000 m"` | **EXACT VERBATIM** | Depth of silt (genuine hit) |
| **15** | Fact 54 | `sankalia_p210` | date | `"400 A.D."` | `"about 400 A.D."` | `"+400"` | Substring Overlap | Captured modifier (genuine hit) |
| **16** | Fact 55 | `sankalia_p210` | date | `"415 A.D."` | `"415 A.D."` | `"+415"` | **EXACT VERBATIM** | Death year of Rudrasena II (genuine hit) |

*Class B Critical Finding:*  
Of the 16 credited Class B hits on Tesseract, **exactly 8 are genuine archaeological extractions** (4 exact verbatim, 4 with minor trailing punctuation or modifier variations). The other **8 hits (Facts 14, 15, 17, 18, 19, 20, 21, 22) are spurious substring artifacts** of the bidirectional `icontains` matching logic: single-digit count extractions (`"3"`, `"6"`, `"4"`, `"1"`) appearing on pages 57 and 58 were accepted as hits against multi-digit counts (`"330"`, `"546"`, `"186"`, `"382"`, `"66"`, `"276"`, `"48"`, `"152"`) simply because the multi-digit ground-truth string contained the single digit.

When strict token-boundary matching (`\b`) is enforced:
- Tesseract genuine clean hits drop from 22 to **14** (6 in Class A, 8 in Class B).
- Genuine clean in-scope recall on Tesseract is **38.9% (14/36)** (rather than 61.1%).
- Genuine pipeline recall on Tesseract is **25.5% (14/55)** (rather than 40.0%).
- On Windows OCR, genuine clean hits drop from 16 to **13** (6 Class A, 7 Class B; Facts 11 and 21 were spurious, Fact 31 was out-of-scope), yielding genuine clean recall of **43.3% (13/30)** and genuine pipeline recall of **23.6% (13/55)**.

This proves that unanchored substring matching artificially inflated Step 3 recall on degraded letterpress counts by roughly 15 percentage points, making the upgrade to anchored token-boundary matching in Step 4 critical.

