# Specification: Phase 2 Step 4 — Candidate Generation, Semantic Attribution & Non-Finding Rejection

> **Document ID:** `SPEC-PHASE2-STEP4-ATTRIBUTION`  
> **Status:** FROZEN BEFORE IMPLEMENTATION (Pre-Registered)  
> **Date:** October 6, 2026  
> **Authors:** ArchaeoPhD Core Architecture & Engineering Team  
> **Sealed Benchmark Dataset:** [`tests/step4_eval/step4_sealed_benchmark.json`](file:///d:/Prorgram/Project/ArcheoPhd/desktop/tests/step4_eval/step4_sealed_benchmark.json)  
> **Sealed Benchmark SHA-256:** `92CE13B1B13422C68E116BFA6ECCD0064E57C204FACFD2CC261CD385CCB5E177`  
> **Development Dataset:** [`tests/step4_eval/step4_dev_set.json`](file:///d:/Prorgram/Project/ArcheoPhd/desktop/tests/step4_eval/step4_dev_set.json) (Seed: 22 Forensic Audit Facts)  

---

## 1. Executive Summary & Problem Formulation

In Phase 1 and Phase 2 Step 3, rigorous span-anchored evaluation established two fundamental realities:
1. **Raw Optical Transcription:** Both classical OCR engines achieve $0.00\%$ shared optical false consensus ($0/80$ facts, $[0.00\%, 4.58\%]$ Wilson 95% CI) where ground-truth characters are present in localized clausal spans.
2. **Candidate Selection Limitations:** A position-based nearest-token heuristic admitted $25.0\%$ errors in Class A ($18/72$) and $27.5\%$ overall ($22/80$). Crucially, these were **not** optical misreads, but candidate selection artifacts: dropped measurement units ($5.0\%$, e.g. `40 miles` $\to$ `40`) and neighbor token displacements ($16.3\%$, e.g. binding an adjacent year or page header number).
3. **Standing Policy:** Class A automated ingestion is **paused in code**. All candidate facts route to the human verification queue with source optical crops until Step 4 delivers an attributed candidate generator.

The goal of **Step 4** is to implement a **Candidate Generator & Attribution Engine** that couples OCR transcript tokens to structured Knowledge Graph entity slots (strata depths, artifact tallies, C-14 calibrated dates, site dimensions) while aggressively filtering out non-archaeological numerical noise.

### Core Pre-Flight Invariant:
**No generator implementation code shall be written until this specification and the sealed evaluation benchmark set are formally reviewed and committed.**

---

## 2. Evaluation Set Partition: Dev Set vs. Sealed Benchmark

To eliminate test-set contamination and prevent data dredging:

### 2.1 Development Set (`tests/step4_eval/step4_dev_set.json`)
- **Composition:** Seeded with all **22 forensic audit facts** (`hand_audit_22.json` / `false_consensus_22_windows.md`) across five failure classes:
  - `UNIT_LOST`: Facts #51 (`6 m`), #93 (`40 miles`), #151 (`30%`), #153 (`10%`).
  - `PARTIAL`: Facts #143 (`1631-1641`), #144 (`1956:81`).
  - `DISPLACED`: Facts #37 (`1947` vs `10,000`), #65 (`1545-48` vs `1538`), #84 (`1780` vs `1763`), #95 (`1927` vs `1923`), #97 (`5199 BC` vs `3700 BC`), #117 (`1816` vs `1788-1865`), #119 (`1839` vs `1819`), #124 (`1820-1903` vs `1859`), #135 (`1870` vs `1865`), #139 (`1542` vs `1506-1552`), #148 (`1952` vs `1954`), #152 (`2 hours` vs `181`), #154 (`3%` vs `10%`).
  - `ABSENT`: Facts #55 (`415 AD`), #56 (`428 AD`), #73 (`1712`).
  - `CORRECT`: Clean single-value baselines.
- **Usage:** Generator rules, regex grammars, and clausal heuristics are developed, tuned, and refined against this set freely.

### 2.2 Sealed Benchmark Set (`tests/step4_eval/step4_sealed_benchmark.json`)
- **Composition ($N = 60$, 50/50 Balanced):**
  - **30 Positive Archaeological Findings:** Completely new cases from monograph pages, not derived from the 22 audit facts. Covers calibrated C-14 date ranges, rubble layer thicknesses, bedrock contact depths, lithic cleaver and micro-blade tallies, ceramic rim diameter ranges, architectural wall dimensions, and tomb weights.
  - **30 Hard Adversarial Negatives:** Specifically constructed to include hard boundary cases:
    - *Page numbers inside excavation prose:* e.g. trench and locus designations ("In trench 14, locus 52 yielded..."), diary sheet cross-references ("on page 181 during clearing...").
    - *Modern years in running narrative:* e.g. author-date literature citations inside ceramic typology discussions ("parallels the sequence in Kenyon (1957: 42)"), modern survey campaign years ("1971 partition survey report"), conservation agency repair dates ("repaired by ASI in 1985").
    - *Contour intervals in methods paragraphs:* e.g. topographic map contours ("5 m contour interval across the terrace"), balk grid quadrant dimensions ("10 x 10 m square balks"), planimetric map scales ("1:1,000 architectural scale").
    - *Accession and plate numbers adjacent to dimensions:* e.g. plate and figure labels immediately preceding finding measurements ("Plate 24, Fig. 5: rim sherd diameter 18 cm", where 24 and 5 must be suppressed while 18 cm is preserved).
    - *Footnote numerals fused to measurements:* e.g. footnote markers following periods ("depth reached 3.5 m.14 before water table rose", where 14 must not corrupt the measurement into 3514 or 3.5 m 14).
- **Cryptographic Seal:**
  - **SHA-256 Hash:** `92CE13B1B13422C68E116BFA6ECCD0064E57C204FACFD2CC261CD385CCB5E177`
  - The test harness verifies this hash before reading the file. Run **once** at the conclusion of Step 4.

---

## 3. Step 4 Candidate Output Data Contract

Every candidate extraction emitted by the Step 4 generator must produce a structured 5-field record:

```cpp
struct AttributedCandidate {
    std::string value;              // 1. Normalized numerical value or compound range
    std::string unit;               // 2. Preserved physical unit, chronological epoch, or artifact noun
    std::pair<int, int> location_span; // 3. Exact [start_char, end_char] character offsets
    SourceProvenance source_chunk;  // 4. Provenance: doc_id, page_number, chunk_id, context passage
    CandidateStatus status;         // 5. Discrete routing and attribution taxonomy
};
```

### Field Definitions:

1. **`value`**:
   - Standardized digits (`"6"`, `"25"`), compound hyphenated ranges (`"20-40"`, `"1880-1690"`), or decimal measurements (`"8.2"`, `"1.8"`).
   - Thousand separators stripped (`10,000` $\to$ `10000`). Truncating a range into a single number is an extraction failure.
2. **`unit`**:
   - Mandatory physical unit (`m`, `cm`, `mm`, `miles`, `tons`, `%`), chronological epoch (`BCE`, `CE`, `BC`, `AD`, `BP`), or artifact count noun (`cleavers`, `bifaces`, `coins`, `jars`).
   - **Unit Loss Ban:** Stripping a unit (e.g. emitting `40` instead of `40 miles`, or `6` instead of `6 m`) is an immediate failure.
3. **`location_span`**:
   - Character index pair `[start_char, end_char]` relative to the chunk text.
   - Binds directly to native Win32/WebView2 visual crop rendering on the underlying scan.
4. **`source_chunk`**:
   - Immutable record containing `doc_id`, `page_number`, `chunk_id`, and surrounding clausal context passage ($\ge 60$ characters).
5. **`status`**:
   - `CANDIDATE_ATTRIBUTED_FINDING`: Passed all filters and attributed to an entity slot.
   - `REJECTED_NON_FINDING`: Classified as noise/metadata and suppressed.
   - `AMBIGUOUS_MULTI_CANDIDATE`: Multiple competing numbers in clause; routed to human verification queue for disambiguation.
   - `UNANCHORED_OR_DEGRADED`: Optical OCR distortion prevents reliable span bounding.

---

## 4. Explicit Rejection Rules (Noise Suppression)

The generator must enforce 5 explicit suppression categories:

| Category | Semantic Context | Example Patterns Suppressed | Action |
| :--- | :--- | :--- | :--- |
| **1. Page Numbers** | Folio headers, footers, pagination in field diaries, and page cross-references inside narrative. | `History of Archaeology 16`, `Field Conservation 181`, `on page 181`, `sheet 50`, `pp. 24-28` | `REJECTED_NON_FINDING` |
| **2. Bibliography Years** | Author-date citations, bibliographic imprints, journal volume dates, modern institutional reports. | `Kenyon (1957: 42)`, `Wheeler (1946)`, `Allchin (1968)`, `Amsterdam in 1780`, `1971 report` | `REJECTED_NON_FINDING` |
| **3. Contour Intervals** | Topographic elevation contours, bathymetric tracklines, survey transect spacing, balk grid squares. | `contour interval of 5 m`, `transects at 20 m intervals`, `grid 10 x 10 m`, `scale 1:1,000` | `REJECTED_NON_FINDING` |
| **4. Catalog & Accession IDs** | Specimen tags, museum inventory numbers, plate/figure indices adjacent to finding dimensions. | `Specimen No. 104`, `Plate 24, Fig. 5`, `Acc. 4501`, `Gazetteer Entry No. 84` | `REJECTED_NON_FINDING` |
| **5. Footnote Markers** | Numeric and Roman superscripts, bracketed note indices, numerals fused to sentence periods. | `depth reached 3.5 m.14`, `survey party.[5]`, `footnote 8`, `note (iv)` | `REJECTED_NON_FINDING` |

---

## 5. Gate Arithmetic & Acceptance Thresholds

### 5.1 The 60-Case Sealed Benchmark is a FAIL-ONLY Gate
- **Mathematical Reality:** A zero-wrong-value gate ($W = 0.0\%$) with a Wilson 95% upper bound $\le 2.0\%$ requires at least **$N \ge 180$ error-free trials**. A 60-case benchmark ($N=60$) cannot certify that gate.
- **Architectural Policy:**
  - **Passing the 60-case sealed benchmark permits ONLY the human-verified path** (presenting candidates in the verification queue with source crops).
  - **Passing the 60-case benchmark does NOT grant auto-commit authority.** It can only disqualify a generator that fails, not enable automated writing.
  - Auto-commit remains **strictly disabled in code**. Re-enabling auto-commit in any form requires a subsequent powered trial of $N \ge 180$ error-free facts.

### 5.2 Pre-Registered Acceptance Gates on the 60-Case Set

| Metric | Target Formula | Gate Threshold (60-Case Set) | Operational Meaning |
| :--- | :--- | :--- | :--- |
| **Negative Rejection Specificity ($S_{reject}$)** | $\frac{\text{Correctly Suppressed Negatives}}{30}$ | **$100.0\%$ Point Estimate (30/30)**<br>(Wilson lower bound: $88.7\%$) | Zero non-findings permitted through as findings. (Auto-commit path will require Wilson lower bound $\ge 96.0\%$, $N \ge 100$). |
| **Attribution Precision ($P_{attr}$)** | $\frac{\text{Correctly Attributed Positives}}{30}$ | **$\ge 96.7\%$ Point Estimate (29/30)**<br>(Wilson 95% CI: $[83.3\%, 99.4\%]$) | Allows at most **1 miss** out of 30. 2 misses ($28/30 = 93.3\%$) fails the gate. |
| **Unit Preservation Accuracy ($A_{unit}$)** | $\frac{\text{Preserved Units}}{\text{Facts with Units}}$ | **$100.0\%$ Point Estimate** | Zero unit-stripping allowed (`40 miles` $\to$ `40` is an immediate fail). |
| **Wrong-Value Auto-Accept Rate ($W$)** | $\frac{\text{Corrupt Auto-Accepted}}{\text{Total Auto-Accepted}}$ | **$\mathbf{0.0\%}$ (Locked)** | Auto-commit disabled; zero automated writes permitted. |

### 5.3 Class B Invariant
Degraded letterpress scans (Class B, e.g. Sankalia) remain **$100\%$ routed to manual human transcription** regardless of generator precision.

---

## 6. Monograph Page Partition Protocol (25 Dev / 25 Sealed)

- **Development Partition (25 Pages):**
  - 10 Rajan pages (`p016`–`p025`)
  - 5 Chakrabarti pages (`p015`–`p019`)
  - 10 Sankalia pages (`p052`–`p061`)
  - All generator development and tuning are restricted to this set.
- **Sealed Holdout Partition (25 Pages):**
  - 5 Rajan spreads (`p050`, `p075`, `p100`, `p110`, `p140`)
  - 5 Chakrabarti pages (`p020`, `p021`, `p065`, `p130`, `p215`)
  - 15 Sankalia pages (`p025`, `p062`–`p071`, `p104`, `p150`, `p210`, `p280`)
  - Executed exactly **once** after generator development is frozen.
