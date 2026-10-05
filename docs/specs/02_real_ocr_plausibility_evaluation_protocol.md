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
The engine executes the following deterministic physical sanity rules on all extracted numerical mentions:
1. **Layer Thickness Limit:** Single stratum or sediment layer thickness $> 10.0\text{ m}$ (or $> 1000\text{ cm}$) triggers `PLAUSIBILITY_EXTREME_LAYER_THICKNESS`.
2. **Excavation Depth Limit:** Subterranean feature depth $> 100.0\text{ m}$ triggers `PLAUSIBILITY_EXTREME_DEPTH`.
3. **Identifier Token Shape:** Alphanumeric tokens with mixed letters flanked by digits (e.g. `1M7`, `B8A0`, `O0`) trigger `PLAUSIBILITY_SHAPE_ANOMALY`.
4. **Assemblage Count Limit:** Single find-spot artifact tally $> 10,000$ triggers `PLAUSIBILITY_EXTREME_COUNT`.

---

## 4. Mathematical Metrics & Wilson 95% Confidence Intervals

The plausibility evaluation evaluates performance across the two empirical cohorts:

### 4.1 Plausibility Sensitivity / Recall ($n=47$ True Corruptions)
Measures the proportion of true OCR corruptions that trigger an anomaly or plausibility flag:
$$\text{Sensitivity}_{\text{plausibility}} = \frac{TP_{\text{anom}}}{47} \times 100\%$$
Reported with Wilson score 95% confidence interval:
$$\tilde{p} = \frac{TP_{\text{anom}} + \frac{z^2}{2}}{47 + z^2} \pm \frac{z}{47 + z^2} \sqrt{\frac{TP_{\text{anom}}(47 - TP_{\text{anom}})}{47} + \frac{z^2}{4}}, \quad z = 1.95996$$

### 4.2 Plausibility Specificity / False-Alarm Rate ($n=119$ Correct Facts)
Measures the proportion of legitimate correct facts that are correctly recognized without generating a false plausibility warning:
$$\text{Specificity}_{\text{plausibility}} = \frac{TN_{\text{anom}}}{119} \times 100\%$$
$$\text{False Alarm Rate} = 100\% - \text{Specificity}_{\text{plausibility}}$$
Reported with Wilson score 95% confidence interval on $n=119$.

---

## 5. Summary of Pre-Registered Signoff Gates

| Metric | Target / Gate | Statistical Boundary | Enforcement Mechanism |
|---|---|---|---|
| **Never-Repair Invariant** | **$0.0\%$ (Strict Zero)** | $0 / 166$ mutations | Automated string equality assertion |
| **Class B Quarantine** | **$100.0\%$** | $0 / 166$ automated KG commits | Unified storage write-path guard |
| **Mention-Level Isolation** | **$100.0\%$** | Zero unassigned claims created | Downstream attribution boundary |
| **Plausibility Specificity** | $\ge 90.0\%$ on clean facts | Wilson 95% CI on $n=119$ | Minimizes human review alert fatigue |
| **Plausibility Sensitivity** | Characterized & Reported | Wilson 95% CI on $n=47$ | Ground-truth empirical measurement |
