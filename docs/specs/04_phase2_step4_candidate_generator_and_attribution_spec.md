# Specification: Phase 2 Step 4 — Candidate Generation, Semantic Attribution & Non-Finding Rejection

> **Document ID:** `SPEC-PHASE2-STEP4-ATTRIBUTION`  
> **Status:** FROZEN BEFORE IMPLEMENTATION (Pre-Registered)  
> **Date:** October 6, 2026  
> **Authors:** ArchaeoPhD Core Architecture & Engineering Team  
> **Sealed Benchmark SHA-256:** `68025311A8D1E1C738CB752B0013BA4B70BAF263B79D1FDCC1E87AC6D053A831`  
> **Evaluation Dataset Location:** [`tests/step4_eval/step4_evaluation_set_sealed.json`](file:///d:/Prorgram/Project/ArcheoPhd/desktop/tests/step4_eval/step4_evaluation_set_sealed.json)  

---

## 1. Executive Summary & Architectural Motivation

In Phase 1 and Phase 2 Step 3, ingestion gating established that:
1. **Raw optical transcription** achieves $0.0\%$ shared optical false consensus ($0/80$ facts, $[0.0\%, 4.6\%]$ Wilson 95% CI) where ground-truth characters are present in localized clausal windows.
2. **Naive string-matching candidate selection**, however, admits a $25.0\%$ error rate in Class A ($18/72$) and $27.5\%$ overall ($22/80$), caused by dropped measurement units ($5.0\%$, e.g., `40 miles` $\to$ `40`) and neighbor token displacements ($16.3\%$, e.g., binding an adjacent year or page number).
3. **Class A automated ingestion is paused in code.** Ingestion routing directs all extracted facts to the human verification queue with optical crops until Step 4 delivers an attributed candidate generator.

The objective of **Step 4** is to replace un-attributed string search with a **syntactically bound and semantically attributed Candidate Generator**. Step 4 connects OCR transcript tokens to structured Knowledge Graph entity slots (finds, strata, trenches, radiometric samples) while aggressively suppressing non-archaeological numeric noise.

**Core Invariant:** No candidate generator code shall be written until this specification and the sealed evaluation benchmark set are formally reviewed and committed.

---

## 2. Step 4 Candidate Output Data Contract

Every extraction emitted by the Step 4 Candidate Generator must conform strictly to the following 5-field tuple schema:

```cpp
struct AttributedCandidate {
    std::string value;              // 1. Normalized numerical value, range, or structured date
    std::string unit;               // 2. Preserved physical unit or chronological epoch
    std::pair<int, int> location_span; // 3. Exact [start_char, end_char] offset in source text
    SourceProvenance source_chunk;  // 4. Provenance: doc_id, page_number, chunk_id, context passage
    CandidateStatus status;         // 5. Discrete routing and attribution taxonomy
};
```

### Detailed Field Definitions:

1. **`value` (Value Field):**
   - Pure numeric digits (e.g. `"6"`, `"25"`), compound hyphenated ranges (e.g. `"20-40"`, `"1631-1641"`), or composite dates.
   - Punctuation normalized: commas stripped from thousands (`10,000` $\to$ `10000`), decimal points preserved (`0.25`).
   - Single-number truncations of ranges (such as extracting `1631` from `from 1631 to 1641`) are treated as **incomplete extraction failures**.

2. **`unit` (Preserved Unit / Epoch):**
   - Mandatory physical measurement unit or chronological epoch.
   - Supported units: `m`, `cm`, `mm`, `km`, `miles`, `ft`, `in`, `%`, `bifaces`, `cleavers`, `sherds`, `pieces`, `hours`, `days`, `years`, `BCE`, `CE`, `BC`, `AD`, `BP`.
   - **Unit Loss Rule:** Stripping a unit (e.g. outputting value `40` without unit `miles`, or `6` without `m`) constitutes a critical extraction error. If a number is a dimensionless count, `unit` must be explicitly tagged as `"count"` or the specific artifact noun (e.g. `"bifaces"`).

3. **`location_span` (Character Boundary Offsets):**
   - Character index pair `[start_char, end_char]` relative to the source chunk text.
   - Enables native Win32/WebView2 optical crop generation and precise visual bounding-box extraction from underlying PDF scan layers.
   - `location_span` must tightly bound the value and its immediate associated unit token.

4. **`source_chunk` (Provenance Context):**
   - Immutable reference containing:
     - `doc_id`: Unique document SHA-256 identifier.
     - `page_number`: 1-based page index.
     - `chunk_id`: Deterministic content-addressed chunk hash.
     - `context_passage`: Complete clause or sentence containing the extraction (minimum 60 characters).

5. **`status` (Discrete Status Taxonomy):**
   - `CANDIDATE_ATTRIBUTED_FINDING`: Candidate cleanly attributed to an archaeological entity slot (stratum depth, artifact count, C-14 date, site dimension).
   - `REJECTED_NON_FINDING`: Candidate identified as non-archaeological methodology noise or bibliographic metadata (suppressed).
   - `AMBIGUOUS_MULTI_CANDIDATE`: Multiple valid numerical tokens compete in the same clause (e.g. Fact #154: `10%` vs `3%`); routed to verification queue for researcher disambiguation.
   - `UNANCHORED_OR_DEGRADED`: Optical OCR distortion or layout destruction prevents reliable clausal anchoring.

---

## 3. Explicit Rejection Filters (Non-Finding Noise Suppression)

Step 4 must evaluate and directly measure precision by aggressively rejecting numbers that do not describe primary archaeological discoveries. The Candidate Generator must enforce 5 explicit suppression categories:

| Rejection Category | Description & Semantic Context | Example Patterns Suppressed | Target Action |
| :--- | :--- | :--- | :--- |
| **1. Page Numbers** | Running headers, footers, folio pagination, chapter numerals prepended to OCR text streams. | `History of Archaeology 16`, `Field Conservation 181`, `Studies in Indian Archaeology 52` | `REJECTED_NON_FINDING` (Suppress) |
| **2. Bibliography Years** | Publication dates in bibliographic lists, modern author-date citations, reprint imprints. | `Allchin (1968)`, `Daniel (1975: 42)`, `Trigger (1989)`, `Amsterdam in 1780` | `REJECTED_NON_FINDING` (Suppress) |
| **3. Contour Intervals** | Topographic elevation contours, bathymetric depths, traverse grid square dimensions. | `contour interval 5 m`, `plotted at 2 m contours`, `grid 5 x 5 m`, `scale 1:50,000` | `REJECTED_NON_FINDING` (Suppress) |
| **4. Catalog / Accession IDs** | Museum specimen accession codes, figure/plate references, gazetteer entry numbers. | `Specimen Catalog No. 402`, `Plate XIV, Fig. 3`, `Inv. 1954/12`, `Gazetteer Entry No. 71` | `REJECTED_NON_FINDING` (Suppress) |
| **5. Footnote Markers** | Numeric and alphabetic footnote indices, bracketed citations, endnote cross-references. | `expedition,[3]`, `Society.4`, `footnote 12`, `op. cit., p. 118, n. 4`, `note (b)` | `REJECTED_NON_FINDING` (Suppress) |

---

## 4. Sealed Evaluation Benchmark Protocol

To prevent test-set leakage, data dredging, or post-hoc threshold shifting, the evaluation dataset is **sealed and hashed before generator implementation**.

### 4.1 Composition & Balance
- **Total Test Cases ($N = 60$):**
  - **Positive Finding Cases ($N_{pos} = 30$):**
    - Seeded with all **22 facts from the forensic audit** (`desktop/tests/ocr_benchmark_50/hand_audit_22.json`), covering all five outcome classes:
      - `CORRECT` (Clean single-date and measurement extractions, e.g. #23–#30).
      - `UNIT_LOST` (Facts #51 `6 m`, #93 `40 miles`, #151 `30%`, #153 `10%`).
      - `PARTIAL` (Compound dates and citation suffixes, e.g. #143 `1631-1641`, #144 `1956:81`).
      - `DISPLACED` (Neighbor token displacements, e.g. #37 `1947` vs `10,000`, #65 `1545-48` vs `1538`, #97 `5199 BC` vs `3700 BC`, #117 `1816` vs `1788-1865`, #152 `2 hours` vs `181`, #154 `3%` vs `10%`).
      - `ABSENT` (Optical misses outside clausal window, e.g. #55 `415 AD`, #56 `428 AD`, #73 `1712`).
  - **Negative Non-Finding Cases ($N_{neg} = 30$):**
    - Exactly balances the positive set ($N_{neg} \ge N_{pos}$).
    - Covers the 5 explicit suppression categories (6 cases each):
      - 6 Page Numbers (`NEG-01` to `NEG-06`)
      - 6 Bibliography Imprint Years (`NEG-07` to `NEG-12`)
      - 6 Cartographic Contour Intervals & Grid Dimensions (`NEG-13` to `NEG-18`)
      - 6 Specimen Catalog & Accession IDs (`NEG-19` to `NEG-24`)
      - 6 Footnote Citations & Superscript Numbers (`NEG-25` to `NEG-30`)

### 4.2 Cryptographic Seal
- **File:** `tests/step4_eval/step4_evaluation_set_sealed.json`
- **SHA-256 Hash:** `68025311A8D1E1C738CB752B0013BA4B70BAF263B79D1FDCC1E87AC6D053A831`
- **Integrity Rule:** The test harness must verify this SHA-256 hash at startup before evaluating any cases. Any modification to the evaluation set invalidates the test run.

---

## 5. Quantitative Acceptance Criteria & Precision Measurement

Step 4 measures precision and specificity directly. Acceptance gates are pre-registered as follows:

| Metric | Target Formula | Pre-Registered Pass Threshold | Rationale |
| :--- | :--- | :--- | :--- |
| **Negative Rejection Specificity ($S_{reject}$)** | $\frac{\text{Correctly Suppressed Negatives}}{\text{Total Non-Finding Negatives } (30)}$ | **$100.0\%$ (Point Estimate)**<br>Wilson 95% Lower Bound $\ge \mathbf{88.7\%}$ | A single page number or bibliography year admitted as a finding pollutes the Knowledge Graph. |
| **Attribution Precision ($P_{attr}$)** | $\frac{\text{Correctly Attributed Positive Findings}}{\text{Total Findings Extracted}}$ | **$\ge 95.0\%$ (Point Estimate)**<br>Wilson 95% Lower Bound $\ge \mathbf{85.0\%}$ | Prevents misattributed neighbor tokens from creating false graph edges. |
| **Unit Preservation Accuracy ($A_{unit}$)** | $\frac{\text{Correctly Preserved Units}}{\text{Total Positive Facts with Physical Units}}$ | **$100.0\%$** (Zero unit loss) | Eliminates the 5.0% unit loss observed in Step 3 (`40 miles` $\to$ `40`). |
| **Wrong-Value Auto-Accept Rate ($W$)** | $\frac{\text{Incorrect / Corrupted Values Auto-Accepted}}{\text{Total Facts Auto-Accepted}}$ | **$\mathbf{0.0\%}$ (Point Estimate)**<br>Wilson 95% Upper Bound $\le \mathbf{2.0\%}$ | **Absolute Safety Barrier:** Any auto-accept path requires mathematical proof of error containment. |

### 5.1 Auto-Commit Ban & Class B Invariant
1. **Zero Auto-Commit Path:** No automated database write path (`put_claim_safeguarded` or equivalent) may be enabled in production until the candidate generator satisfies the wrong-value rate threshold ($W = 0.0\%$, Wilson upper bound $\le 2.0\%$) on a verified sample of $N \ge 180$ error-free facts.
2. **Class B Permanent Gating:** Degraded letterpress scans (Class B) remain **$100\%$ routed to manual human transcription** regardless of any algorithmic scores or generator benchmarks.

---

## 6. Monograph Page Partition Protocol (25 Dev / 25 Sealed)

To prevent iterative over-fitting during candidate generator development:
1. **Development Partition (25 Pages):**
   - 10 Rajan pages (`p016`–`p025`)
   - 5 Chakrabarti pages (`p015`–`p019`)
   - 10 Sankalia pages (`p052`–`p061`)
   - All rule refinement, regex tuning, and heuristic validation are restricted strictly to this 25-page set.
2. **Sealed Holdout Partition (25 Pages):**
   - 5 Rajan holdout spreads (`p050`, `p075`, `p100`, `p110`, `p140`)
   - 5 Chakrabarti holdout pages (`p020`, `p021`, `p065`, `p130`, `p215`)
   - 15 Sankalia holdout pages (`p025`, `p062`–`p071`, `p104`, `p150`, `p210`, `p280`)
   - **One-Shot Evaluation:** The sealed holdout partition is executed exactly **once** at the conclusion of Step 4, after development on the dev partition is frozen.
