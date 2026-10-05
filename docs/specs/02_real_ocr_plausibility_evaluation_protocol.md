# Protocol Specification: Real-OCR Plausibility Evaluation on 166-Fact Benchmark

**Author:** ArchaeoPhD Core Team  
**Date:** October 2026  
**Status:** Pre-Registered Protocol Specification (Sealed PRIOR to Extractor Implementation)  
**Milestone:** Phase 2 (Knowledge Graph & Unified Store) — Step 3  

---

## 1. Executive Summary & Objective

In compliance with the Phase 2 code review, OCR anomaly detection is decoupled from heuristic regular grammar parsing. A deterministic grammar cannot tell `2040 cm` from a legitimate depth, or `Locus 691` from `Locus 694`, or `1846 m` from an elevation. Only character-shape defects (such as `1M7`) are detectable from string tokens alone.

Therefore, the performance of the extraction pipeline on degraded historical letterpress OCR is certified against the **real-world 166-fact blind OCR benchmark** (`desktop/tests/ocr_benchmark_50/ground_truth.json`) and raw engine outputs (`results_tesseract/` and `results_windows_ocr/`), rather than on five synthetic test strings.

---

## 2. Dataset Composition & Ground Truth Topology

The benchmark comprises 166 ground-truth facts extracted from 50 authentic letterpress pages across three foundational monographs:
- **Sankalia (1974) / Corvinus:** Chirki-on-Pravara Acheulian workshop report (`sankalia_p052` to `p064`)
- **Rajan (2002):** *Archaeology: Principles and Methods* (`rajan_p019` to `p027`)
- **Chakrabarti (1988):** *A History of Indian Archaeology* (`chakrabarti_p015` to `p021`, `p065`, `p130`, `p215`)

### Ground Truth Distribution ($N=166$):
| Category | Fact Count | Target Entity Types | Representative Ground Truth Values |
|---|---|---|---|
| **Historical & C-14 Dates** | 125 | Exact BCE/CE, Ranges, Approximate Dates | `1963`, `1966 to 1969`, `3700 BC`, `79 AD`, `95-55 BC`, `1734` |
| **Physical Measurements** | 20 | Linear dimensions, Layer thickness, Depths | `8 m.`, `74 mtrs`, `20-40 cm`, `7 m.`, `110` |
| **Artifact & Specimen Counts**| 21 | Tool counts, Debitage tallies, Assemblages | `694`, `6 pieces`, `2050`, `1511`, `95`, `444`, `330`, `546`, `186` |
| **Total** | **166** | Complete benchmark coverage | Real excavation monograph facts |

### Empirical Partitioning from Report 01 Benchmark:
As established in Report 01 Table 4:
- **Clean Consensus Facts ($n=119$, $71.69\%$):** Both OCR engines or consensus arbitration extracted the fact accurately without numerical corruption.
- **True Corrupted Facts ($n=47$, $28.31\%$):** At least one engine suffered numerical OCR corruption (e.g. range fusion `20-40 cm` $\to$ `2040 cm`, digit loss `694` $\to$ `69.'`, digit drop `1966` $\to$ `196`, letter confusion `1M7` $\to$ `147` or `IM7`).

---

## 3. Evaluation Procedure & Automated Test Harness

The evaluation harness reads the raw text files for each of the 50 pages from `desktop/tests/ocr_benchmark_50/results_tesseract/` and `results_windows_ocr/`, and evaluates three distinct invariants:

```
+---------------------------------------------------------------------------------+
|                        RAW OCR TEXT FILE (Tesseract / Windows OCR)              |
+---------------------------------------------------------------------------------+
                                         |
                                         v
               +---------------------------------------------------+
               |    DETERMINISTIC REGULAR GRAMMAR & AST PARSER     |
               +---------------------------------------------------+
                                         |
                                         v
                     List of Extracted Mentions (per page)
                                         |
                 +-----------------------+-----------------------+
                 |                       |                       |
                 v                       v                       v
      +---------------------+ +---------------------+ +---------------------+
      | INVARIANT 1:        | | INVARIANT 2:        | | INVARIANT 3:        |
      | NEVER REPAIR        | | PROVENANCE GATE     | | PHYSICAL PLAUSIBILITY|
      | raw_match == slice  | | origin == CLASS_B   | | Domain Sanity Bounds|
      | Violation rate: 0%  | | Zero auto-commit    | | Evaluated on 47 vs  |
      | (Strict Equality)   | | to Knowledge Graph  | | 119 real facts      |
      +---------------------+ +---------------------+ +---------------------+
```

### Invariant 1: "Never Repair" Verification (Strict String Identity)
For every extracted mention $m$ on each page:
$$\text{assert}(m.\text{raw\_match} == \text{page\_text}[m.\text{start}\dots m.\text{end}])$$
- Any heuristic mutation, character substitution, digit split, or hyphen insertion fails the invariant.
- **Gate Requirement:** $\text{Violation Rate} = 0.0\%$ ($0 / 166$).

### Invariant 2: Provenance Tagging & Class B Quarantine
Because the 50 benchmark documents represent historical letterpress scans:
- All mentions must carry `m.origin_type = SourceClassification::CLASS_B`.
- The storage write interface must reject any automated commit attempt with `ERR_CLASS_B_VERIFICATION_REQUIRED`.
- **Gate Requirement:** $100.0\%$ Quarantine. Zero records written to authoritative relational KG tables.

### Invariant 3: Deterministic Physical Plausibility Sanity Checks
The engine executes frozen deterministic physical sanity rules on all extracted numerical mentions:
1. **Layer Thickness Limit:** Single stratum or sediment layer thickness $> 10.0\text{ m}$ (or $> 1000\text{ cm}$) triggers `PLAUSIBILITY_EXTREME_LAYER_THICKNESS`.
2. **Excavation Depth Limit:** Subterranean feature depth $> 100.0\text{ m}$ triggers `PLAUSIBILITY_EXTREME_DEPTH`.
3. **Identifier Token Shape:** Alphanumeric tokens with mixed letters flanked by digits (e.g. `1M7`, `B8A0`, `O0`) trigger `PLAUSIBILITY_SHAPE_ANOMALY`.
4. **Assemblage Count Limit:** Single find-spot artifact tally $> 10,000$ triggers `PLAUSIBILITY_EXTREME_COUNT`.

---

## 4. Methodological Disclosures & Pre-Execution Outcome Prediction

### 4.1 Disclosure of Optimistic Threshold Formulation Bias
> [!IMPORTANT]
> **Threshold Selection Disclosure:**  
> The $10.0\text{ m}$ stratum thickness bound and $100.0\text{ m}$ excavation depth bound were formulated after observing the specific `2040 cm` ($20.4\text{ m}$) range-fusion error on `sankalia_p053`. Because the ground-truth benchmark was inspected during Phase 0 analysis, the sensitivity figure on pages sharing this specific corruption pattern is inherently optimistic. This bias is acknowledged: these thresholds represent physical sanity bounds, not generalizable machine-learned anomaly detectors.

### 4.2 Predicted Outcome: Expected Low Plausibility Sensitivity
> [!NOTE]
> **Theoretical Prediction on Plausibility Sensitivity:**  
> Of the 47 true OCR errors in the benchmark, the vast majority are **plausible numerical substitutions or digit drops**:
> - `1966` $\to$ `196` (a valid integer, resembles a CE year or count)
> - `694` $\to$ `654` or `69.'` (valid integer or punctuation tail)
> - `8 m.` $\to$ `8 m` (valid linear dimension)
> - `95-55 BC` $\to$ `95-5` (valid-looking span)
> 
> A deterministic grammar evaluating magnitude bounds cannot and *should not* flag plausible integers without domain-external context. Magnitude thresholds will only trigger on extreme fused bounds (e.g., `2040 cm`) or token shape corruptions (e.g., `1M7`).
> 
> Consequently, **the expected sensitivity on the 47 true errors is LOW (predicted $\sim 10\%\text{--}25\%$, $<30\%$)**.  
> This low sensitivity is **not an architectural defect**; it is the fundamental evidentiary reason why **Tier 2 Provenance Isolation (quarantining all Class B text)** is the true protection of ArchaeoPhD. No heuristic plausibility filter can substitute for Class B human transcription verification.

---

## 5. Ground-Truth Match Rules

To avoid ambiguity, the evaluation harness maps extracted mentions to ground-truth facts according to strict criteria:

1. **Page Association:** The mention must occur within the raw OCR text of `item.page_id`.
2. **Category Congruence:**
   - Ground truth `type: "date"` maps to mention categories `EXACT_DATE_*`, `APPROX_DATE_*`, `DATE_RANGE_*`, `UNCALIBRATED_C14_BP`, or `AUTHOR_CALIBRATED_DATE`.
   - Ground truth `type: "measurement"` maps to `LINEAR_DIMENSION`, `LINEAR_RANGE`, `COMPOUND_DIMENSION`, `DEPTH_ELEVATION`, or `MASS_WEIGHT`.
   - Ground truth `type: "count"` maps to `ARTIFACT_SPECIMEN_COUNT`.
3. **Character Span Alignment:**
   - The mention's `token_offset_start` and `token_offset_end` must fall within the textual sentence/clause corresponding to `item.description` in the source page text.
4. **Fact Evaluation Status:**
   - **Correct Fact Hit ($TN_{\text{anom}}$):** For the 119 clean facts, the mention extracts the true value and `plausibility_flag == false` (no false alarm).
   - **Flagged Corruption Hit ($TP_{\text{anom}}$):** For the 47 true OCR errors, the mention extracted at that location has `plausibility_flag == true`.
   - **Unflagged Corruption ($FN_{\text{anom}}$):** The OCR error is extracted as a plausible entity with `plausibility_flag == false`.

---

## 6. Mathematical Metrics & Wilson 95% Confidence Intervals

The evaluation evaluates performance across the two empirical cohorts:

### 6.1 Plausibility Sensitivity / Recall ($n=47$ True Corruptions)
Measures the proportion of true OCR corruptions that trigger an anomaly or plausibility flag:
$$\text{Sensitivity}_{\text{plausibility}} = \frac{TP_{\text{anom}}}{47} \times 100\%$$
Reported with Wilson score 95% confidence interval on $n=47$.

### 6.2 Plausibility Specificity / False-Alarm Rate ($n=119$ Correct Facts)
Measures the proportion of legitimate correct facts that are correctly recognized without generating a false plausibility warning:
$$\text{Specificity}_{\text{plausibility}} = \frac{TN_{\text{anom}}}{119} \times 100\%$$
$$\text{False Alarm Rate} = 100\% - \text{Specificity}_{\text{plausibility}}$$
Reported with Wilson score 95% confidence interval on $n=119$. Target: $\text{Specificity} \ge 90.0\%$.

---

## 7. Summary of Pre-Registered Signoff Gates

| Metric | Target / Gate | Statistical Boundary | Enforcement Mechanism |
|---|---|---|---|
| **Never-Repair Invariant** | **$0.0\%$ (Strict Zero)** | $0 / 166$ mutations | Automated string equality assertion |
| **Class B Quarantine** | **$100.0\%$** | $0 / 166$ automated KG commits | Unified storage write-path guard |
| **Mention-Level Isolation** | **$100.0\%$** | Zero unassigned claims created | Downstream attribution boundary |
| **Plausibility Specificity** | $\ge 90.0\%$ on clean facts | Wilson 95% CI on $n=119$ | Minimizes human review alert fatigue |
| **Plausibility Sensitivity** | Characterized & Reported | Wilson 95% CI on $n=47$ | Ground-truth empirical measurement (expected low $\sim 10\text{--}25\%$) |
