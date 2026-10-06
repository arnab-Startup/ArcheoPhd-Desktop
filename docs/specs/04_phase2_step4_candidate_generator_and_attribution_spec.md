# Specification: Phase 2 Step 4 — Candidate Generation, Semantic Attribution & Non-Finding Rejection

> **Document ID:** `SPEC-PHASE2-STEP4-ATTRIBUTION`  
> **Status:** FROZEN BEFORE IMPLEMENTATION (Pre-Registered)  
> **Date:** October 6, 2026  
> **Authors:** ArchaeoPhD Core Architecture & Engineering Team  
> **Provenance & Integrity:** Sealed against development tuning; authored by the engineering team prior to generator code; consists of 60 synthetic and styled archaeological test passages (30 finding positives, 30 hard adversarial negatives) testing unit binding, range capture, clausal attribution, and non-finding rejection. Not drawn from raw uninspected scans.  
> **Sealed Benchmark Dataset:** [`tests/step4_eval/step4_sealed_benchmark.json`](file:///d:/Prorgram/Project/ArcheoPhd/desktop/tests/step4_eval/step4_sealed_benchmark.json)  
> **Sealed Benchmark SHA-256:** `4B9AD58F8AEDF40237F9CE104978472175188086168D765B6509A821420B8F3C`  
> **Development Dataset:** [`tests/step4_eval/step4_dev_set.json`](file:///d:/Prorgram/Project/ArcheoPhd/desktop/tests/step4_eval/step4_dev_set.json) (Seed: 22 Forensic Audit Facts + 5 Targeted Challenge Cases)  

---

## 1. Executive Summary & Problem Formulation

In Phase 1 and Phase 2 Step 3, rigorous span-anchored evaluation established two fundamental empirical realities:
1. **Raw Optical Transcription:** Both classical OCR engines achieve $0.00\%$ shared optical false consensus ($0/80$ facts, $[0.00\%, 4.58\%]$ Wilson 95% CI; $0/72$ in Class A $[0.00\%, 5.07\%]$) where ground-truth characters are present in localized clausal spans.
2. **Candidate Selection Limitations:** A naive position-based nearest-token heuristic admitted $25.0\%$ errors in Class A ($18/72$) and $27.5\%$ overall ($22/80$). Crucially, these were **not** optical misreads, but candidate selection artifacts: dropped measurement units ($5.0\%$, e.g. `40 miles` $\to$ `40`) and neighbor token displacements ($16.3\%$, e.g. binding an adjacent year or page header number).
3. **Standing Policy:** Class A automated ingestion is **paused in code**. All candidate facts route to the human verification queue with source optical crops until Step 4 delivers an attributed candidate generator.

The objective of **Step 4** is to implement a **Candidate Generator & Attribution Engine** that couples OCR transcript tokens to structured Knowledge Graph entity slots (strata depths, layer thicknesses, artifact tallies, C-14 calibrated dates, site dimensions) while aggressively filtering out non-archaeological numerical noise.

### Core Pre-Flight Invariant:
**No generator implementation code shall be written until this specification and the sealed evaluation benchmark set are formally reviewed and committed.**

---

## 2. Evaluation Set Partition: Dev Set vs. Sealed Benchmark

To eliminate test-set contamination and prevent circular data dredging:

### 2.1 Development Set (`tests/step4_eval/step4_dev_set.json`)
- **Composition ($N = 27$):**
  - **All 22 Forensic Audit Facts** (`hand_audit_22.json` / `false_consensus_22_windows.md`) across five failure classes:
    - `UNIT_LOST`: Facts #51 (`6 m`), #93 (`40 miles`), #151 (`30%`), #153 (`10%`).
    - `PARTIAL`: Fact #143 (`1631-1641`).
    - `REJECTED_NON_FINDING`: Fact #144 (`1956:81` — Wheeler citation year/page relabeled from PARTIAL to Rule 2 Bibliographical Citation rejection).
    - `DISPLACED`: Facts #37 (`1947` vs `10,000`), #65 (`1545-48` vs `1538`), #84 (`1780` vs `1763`), #95 (`1927` vs `1923`), #97 (`5199 BC` vs `3700 BC`), #117 (`1816` vs `1788-1865`), #119 (`1839` vs `1819`), #124 (`1820-1903` vs `1859`), #135 (`1870` vs `1865`), #139 (`1542` vs `1506-1552`), #148 (`1952` vs `1954`), #152 (`2 hours` vs `181`), #154 (`3%` vs `10%`).
    - `ABSENT`: Facts #55 (`415 AD`), #56 (`428 AD`), #73 (`1712`).
    - `CORRECT`: Clean single-value baselines.
  - **5 Targeted Challenge Cases:**
    - `DEV-23`: Spaced OCR footnote numeral (`3.5 m. 14` / `3.5 m 14`).
    - `DEV-24`: Historical excavation season noun phrase (`Kenyon 1957 excavations`) as positive date.
    - `DEV-25`: Bibliographical author-date citation (`Kenyon (1957: 42)`) as negative non-finding.
    - `DEV-26`: Clausal multi-candidate ambiguity (competing counts 45 and 12 with no distinguishing query anchor).
    - `DEV-27`: Table cell with column-header unit (`rajan_p110`, header `Depth (m)` and cell `1.85`).
- **Usage:** Generator rules, regex grammars, clausal parsers, and disambiguation heuristics are developed, tuned, and tested against this set freely.

### 2.2 Sealed Benchmark Set (`tests/step4_eval/step4_sealed_benchmark.json`)
- **Composition ($N = 60$, 50/50 Balanced):**
  - **30 Positive Archaeological Findings:** Completely new cases styled after excavation reports and archaeological monographs, not derived from the 22 audit facts. Covers calibrated C-14 date ranges, rubble layer thicknesses, bedrock contact depths, lithic cleaver and micro-blade tallies, ceramic rim diameter ranges, architectural wall dimensions, and tomb weights.
  - **30 Hard Adversarial Negatives:** Specifically constructed to evaluate five failure modes:
    - *Page numbers inside excavation prose:* e.g. administrative trench and locus designations ("In trench 14, locus 52 yielded..."), diary sheet cross-references ("on page 181 during clearing..."), running header folios ("71 Studies in Indian Archaeology").
    - *Modern years in running narrative:* e.g. author-date literature citations inside ceramic typology discussions ("parallels the sequence in Kenyon (1957: 42)"), modern survey campaign years ("1971 partition survey report"), conservation agency repair dates ("repaired by ASI in 1985").
    - *Contour intervals in methods paragraphs:* e.g. topographic map contours ("5 m contour interval across the terrace"), balk grid quadrant dimensions ("10 x 10 m square balks"), planimetric map scales ("1:1,000 architectural scale").
    - *Accession and plate numbers adjacent to dimensions:* e.g. plate and figure labels immediately preceding finding measurements ("Plate 24, Fig. 5: rim sherd diameter 18 cm", where 24 and 5 must be suppressed while 18 cm is preserved).
    - *Footnote numerals fused to measurements:* e.g. footnote markers following periods ("depth reached 3.5 m.14 before water table rose", where 14 must not corrupt the measurement into 3514 or 3.5 m 14).
- **Cryptographic Seal:**
  - **SHA-256 Hash:** `4B9AD58F8AEDF40237F9CE104978472175188086168D765B6509A821420B8F3C`
  - The test harness verifies this hash before reading the file. Executed exactly **once** after generator development against the dev set is frozen.

---

## 3. Step 4 Candidate Output Data Contract & Schema

Every candidate extraction emitted by the Step 4 generator must produce a structured record conforming to the following C++ data contract:

```cpp
enum class ValueType { SINGLE, RANGE, APPROXIMATE };
enum class UnitOrigin { ADJACENT_TEXT, TABLE_HEADER, INFERRED_ERA, NONE };
enum class AttributeResolution { DIRECT_CLAUSAL, TABLE_ROW, SECTION_HEADER, UNRESOLVED_SUBJECT };
enum class CandidateStatus {
    CANDIDATE_ATTRIBUTED_FINDING,
    REJECTED_NON_FINDING,
    AMBIGUOUS_MULTI_CANDIDATE,
    UNANCHORED_OR_DEGRADED
};

struct StructuredValue {
    std::string raw_text;                   // Verbatim token string (e.g. "1631 to 1641", "95-55 BC")
    ValueType value_type;                   // SINGLE | RANGE | APPROXIMATE
    double numeric_start;                   // Primary numeric value or start of range
    std::optional<double> numeric_end;      // End of range (if value_type == RANGE)
    std::string normalized_unit;            // Physical unit (m, cm, %) or epoch (BCE, CE); empty for counts
    std::optional<int> astronomical_year_start; // Step 3 astronomical year (e.g. 95 BC -> -94)
    std::optional<int> astronomical_year_end;   // Step 3 astronomical year end (e.g. 55 BC -> -54)
};

struct EntitySlot {
    std::string subject_text;               // Surface text mention (e.g. "Layer 3", "Trench IX", "microliths")
    std::string subject_entity_id;          // Resolved Knowledge Graph foreign key (e.g. "stratum:layer_3", "site:chirki_loc102", "artifact_class:microlith")
    std::string property_type;              // STRATUM_DEPTH, STRATUM_THICKNESS, RADIOMETRIC_DATE, HISTORICAL_DATE, ARTIFACT_DIMENSION, ARTIFACT_COUNT, etc.
    AttributeResolution resolution;         // DIRECT_CLAUSAL | TABLE_ROW | SECTION_HEADER | UNRESOLVED_SUBJECT
    double linkage_confidence;              // Entity linkage confidence score [0.0, 1.0]
};

struct CandidateSpans {
    std::pair<int, int> value_span;         // [start_char, end_char] bounding the numeric token
    std::optional<std::pair<int, int>> unit_span; // [start_char, end_char] bounding adjacent unit token
    UnitOrigin unit_origin;                 // ADJACENT_TEXT | TABLE_HEADER | INFERRED_ERA | NONE
};

struct AttributedCandidate {
    StructuredValue value;                  // 1. Structured numerical value and range representation
    EntitySlot entity_slot;                 // 2. Bound archaeological entity subject and property type
    CandidateSpans spans;                   // 3. Exact character offsets for visual crop binding
    SourceProvenance source_chunk;          // 4. Immutable source provenance (doc, page, chunk, text)
    CandidateStatus status;                 // 5. Discrete routing and attribution taxonomy
};
```

### Detailed Schema Specifications:

1. **Value Representation & Astronomical Normalization:**
   - Single numbers are stored with `value_type = SINGLE`, `numeric_start = <val>`, `numeric_end = null`.
   - Lexical and punctuation ranges (`"1631 to 1641"`, `"20-40"`, `"1880-1690"`, `"95-55 BC"`) are stored with `value_type = RANGE`, preserving both bounds.
   - Chronological eras are normalized to astronomical integer years using the Step 3 normalizer (`NormalizeEraYear`): e.g. `95-55 BC` $\to$ `[-94, -54]`; `415 AD` $\to$ `415`.
   - Thousand separators are normalized (`10,000` $\to$ `10000.0`). Truncating a range into a single number is an extraction failure.

2. **Entity Slot Attribution & Knowledge Graph Linkage:**
   - In Step 3, numbers were unattached quantities with no owner.
   - In Step 4, every candidate finding MUST bind to an `EntitySlot`:
     - `subject_text`: Exact surface text token identifying the archaeological feature, locus, stratum, or artifact category (e.g. `"Layer 3"`, `"Trench IX"`, `"Locus 102"`).
     - `subject_entity_id`: Canonical Knowledge Graph foreign key formatted as `<entity_type>:<canonical_slug>` (e.g. `"stratum:layer_3"`, `"site:chirki_loc102"`, `"artifact_type:cleaver"`), directly ingestible by the Phase 2 graph store. If an entity cannot be linked to known project entities, a minted local slug is generated or `resolution = UNRESOLVED_SUBJECT` is recorded.
     - `property_type`: Archaeological semantic dimension (`STRATUM_DEPTH`, `STRATUM_THICKNESS`, `RADIOMETRIC_DATE`, `HISTORICAL_DATE`, `ARTIFACT_DIMENSION`, `ARTIFACT_COUNT`, `GEOGRAPHIC_DISTANCE`).
     - `resolution`: How the subject was bound (`DIRECT_CLAUSAL`, `TABLE_ROW`, `SECTION_HEADER`, or `UNRESOLVED_SUBJECT`).
   - **Target Subject Resolution Rate:** On positive archaeological findings, at least **85.0%** ($\ge 26/30$) of emitted candidates must resolve to an explicit entity slot subject (`DIRECT_CLAUSAL`, `TABLE_ROW`, or `SECTION_HEADER`). At most **15.0%** may fall back to `UNRESOLVED_SUBJECT` (which routes candidates to the human verification queue). On the 21 positive dev-set findings, the generator must achieve $\ge 18/21$ ($\ge 85.7\%$) explicit subject resolution.

3. **Disjoint Spans & Table Cells:**
   - For running prose, `value_span` bounds the number and `unit_span` bounds the immediately following unit token (`unit_origin = ADJACENT_TEXT`).
   - For table cells (e.g. `rajan_p110`), the unit is in the column header and the number is in the data row. The generator records `value_span` bounding the cell text, sets `unit_span = null`, and records `unit_origin = TABLE_HEADER`.

4. **Explicit Trigger Rule for `AMBIGUOUS_MULTI_CANDIDATE` & Clausal Scope Definition:**
   - **Clausal Scope Segmentation Specification:** A "clause" is defined deterministically as:
     1. *Sentence Boundary:* Terminal punctuation (`.`, `?`, `!`) followed by whitespace or EOF, excluding common scholarly abbreviations (`Fig.`, `Pl.`, `ca.`, `approx.`, `dr.`, `prof.`, `st.`, `no.`, `vol.`, `pp.`).
     2. *Intra-Sentence Clausal Segment:* Sub-divided by major punctuation boundaries: semicolons (`;`), em-dashes (`—` / `--`), colons (`:`), or coordinating conjunctions preceded by commas (`, and`, `, but`, `, while`, `, whereas`).
     3. *Token Window Ceiling:* A hard maximum window of **25 tokens (or $\le 160$ characters)** centered around the entity mention or property keyword.
   - **Trigger Condition:** If within a single clausal segment, multiple numeric tokens match the same dimension type (e.g., two dates `1947` and `10,000`, or two depths `3.5 m` and `6.2 m`), and the syntactic context contains no distinct prepositional or relational head-word anchor directly distinguishing them, the generator **MUST NOT** guess or default to the nearest token.
   - **Action:** The generator marks `status = AMBIGUOUS_MULTI_CANDIDATE`, bundles competing candidates with their respective spans, and routes the cluster directly to the human verification queue for disambiguation.

---

## 4. Explicit Rejection Rules (Noise Suppression)

The generator must enforce 5 explicit suppression categories:

| Category | Semantic Context | Example Patterns Suppressed | Target Status |
| :--- | :--- | :--- | :--- |
| **1. Page Numbers** | Folio headers, footers, pagination in field diaries, and page cross-references inside narrative. | `History of Archaeology 16`, `Field Conservation 181`, `on page 181`, `sheet 50`, `pp. 24-28` | `REJECTED_NON_FINDING` |
| **2. Bibliography Years** | Author-date citations, bibliographic imprints, journal volume dates, modern institutional reports.<br>*(Context Rule: Excavation campaign phrases like "Kenyon 1957 excavations" are preserved as historical dates; parenthetical or colon-page citations like "Kenyon (1957: 42)" are suppressed).* | `Kenyon (1957: 42)`, `Wheeler (1946)`, `Allchin (1968)`, `Amsterdam in 1780`, `1971 report`, `ASI in 1985` | `REJECTED_NON_FINDING` |
| **3. Contour Intervals** | Topographic elevation contours, bathymetric tracklines, survey transect spacing, balk grid squares. | `contour interval of 5 m`, `transects at 20 m intervals`, `grid 10 x 10 m`, `scale 1:1,000` | `REJECTED_NON_FINDING` |
| **4. Catalog & Accession IDs** | Specimen tags, museum inventory numbers, plate/figure indices adjacent to finding dimensions. | `Specimen No. 104`, `Plate 24, Fig. 5`, `Acc. 4501`, `Gazetteer Entry No. 84`, `Figure Cat. 12` | `REJECTED_NON_FINDING` |
| **5. Footnote Markers** | Numeric and Roman superscripts, bracketed note indices, numerals fused to sentence periods, or OCR-spaced footnote numerals. | `depth reached 3.5 m.14`, `3.5 m. 14`, `3.5 m 14`, `survey party.[5]`, `footnote 8`, `note (iv)` | `REJECTED_NON_FINDING` |

---

## 5. Gate Arithmetic & Acceptance Thresholds

### 5.1 The 60-Case Sealed Benchmark is a FAIL-ONLY Gate
- **Mathematical Reality:** A zero-wrong-value gate ($W = 0.0\%$) with a Wilson 95% upper bound $\le 2.0\%$ requires at least **$N \ge 180$ consecutive error-free trials**. A 60-case benchmark ($N=60$) cannot certify that gate.
- **Architectural Policy:**
  - **Passing the 60-case sealed benchmark permits ONLY the human-verified path** (presenting candidates in the verification queue with source crops).
  - **Passing the 60-case benchmark does NOT grant auto-commit authority.** It can only disqualify a generator that fails, not enable automated writing.
  - Auto-commit remains **strictly disabled in code** (`is_human_verified` gate). Enabling auto-commit in any future milestone requires a subsequent powered trial of $N \ge 180$ error-free facts ($W \le 2.0\%$ upper bound, Wilson lower bound $\ge 97.9\%$) and $N \ge 100$ non-findings with zero false inclusions (Wilson lower bound $\ge 96.3\%$).

### 5.2 Pre-Registered Acceptance Gates on the 60-Case Set

| Metric | Target Formula | Gate Threshold (60-Case Set) | Operational Meaning & Scoring Rubric |
| :--- | :--- | :--- | :--- |
| **Negative Rejection Specificity ($S_{reject}$)** | $\frac{N_{\text{REJECTED}}}{30}$ | **$100.0\%$ Point Estimate (30/30)**<br>(Wilson 95% CI: $[88.7\%, 100.0\%]$) | Zero non-findings permitted through as findings. Any false inclusion fails the gate. *(Auto-commit path will require $N \ge 100$ error-free rejections, Wilson lower bound $\ge 96.3\%$).* |
| **Attribution Precision ($P_{attr}$)** | $\frac{N_{\text{CORRECT}}}{30}$ | **$\ge 96.7\%$ Point Estimate (29/30)**<br>(Wilson 95% CI: $[83.3\%, 99.4\%]$; CC: $[81.0\%, 99.8\%]$) | Allows at most **1 miss** out of 30. 2 misses ($28/30 = 93.3\%$) fails the gate.<br>**Scoring Rubric:** Scored strictly under the 5 mutually exclusive outcome categories:<br>• `CORRECT`: Exact match on normalized value, unit, entity slot, and location span.<br>• `UNIT_LOST`: Value correct, but required unit dropped or missing (Failure).<br>• `PARTIAL`: Range truncated or corrupted punctuation (Failure).<br>• `DISPLACED`: Neighbor token captured instead of finding (Failure).<br>• `ABSENT`: Generator omitted candidate or emitted non-finding rejection (Failure). |
| **Unit Preservation Accuracy ($A_{unit}$)** | $\frac{\text{Preserved Units}}{\text{Facts with Units}}$ | **$100.0\%$ Point Estimate** | Zero unit-stripping allowed on any fact possessing a physical measurement unit (`m`, `cm`, `mm`, `km`, `ft`, `in`, `kg`, `g`, `%`) or chronological epoch marker (`BCE`, `BC`, `CE`, `AD`, `BP`). Bare counts (`694 tools`) are integer counts bound to artifact entity slots, not physical units. |

> **Standing Invariant:** Automated fact ingestion is disabled in C++ storage (`put_claim_safeguarded` rejects unverified claims). Passing this gate enables candidate presentation in the human verification queue only.

### 5.3 Class B Invariant
Degraded letterpress scans (Class B, e.g. Sankalia) remain **$100\%$ routed to manual human transcription** regardless of generator precision.

---

## 6. Monograph Page Partition Protocol

All 50 pages from Phase 0 were previously inspected across Phase 0, Step 1, Step 2, and Step 3. Partitions are defined mechanically from the ground-truth fact locations in `evaluated_166.json`:

- **Step 4 Development Pages (Tuning Allowed, $N = 16$):**
  - All 15 monograph pages containing the 22 forensic audit facts, plus 1 challenge case table page:
    - **Chakrabarti (4 pages):** `chakrabarti_p015-015` (#65), `chakrabarti_p018-018` (#73), `chakrabarti_p021-021` (#84), `chakrabarti_p215-215` (#93, #95)
    - **Rajan (9 pages):** `rajan_p019-019` (#97), `rajan_p022-022` (#117, #119), `rajan_p023-023` (#124), `rajan_p024-024` (#135), `rajan_p025-025` (#139, #143), `rajan_p050-050` (#144), `rajan_p075-075` (#148), `rajan_p100-100` (#151, #152, #153, #154), `rajan_p110-110` (DEV-27 table cell)
    - **Sankalia (3 pages):** `sankalia_p025-025` (#37), `sankalia_p150-150` (#51), `sankalia_p210-210` (#55, #56)
  - All generator development, regular expressions, and clausal heuristics are restricted strictly to these 16 pages and the dev set.
- **Held-Out Pages (Tuning Locked, $N = 34$):**
  - Remaining 34 monograph pages from the 50-page benchmark:
    - **Chakrabarti (6 pages):** `chakrabarti_p016-016`, `chakrabarti_p017-017`, `chakrabarti_p019-019`, `chakrabarti_p020-020`, `chakrabarti_p065-065`, `chakrabarti_p130-130`
    - **Rajan (6 pages):** `rajan_p016-016`, `rajan_p017-017`, `rajan_p018-018`, `rajan_p020-020`, `rajan_p021-021`, `rajan_p140-140`
    - **Sankalia (22 pages):** `sankalia_p052-052` through `sankalia_p071-071` (20 pages), `sankalia_p104-104`, `sankalia_p280-280`
  - Strictly held out from Step 4 development tuning.
- **Partition Disjointness & Verification:**
  - $\text{Dev Pages} \cap \text{Held-Out Pages} = \emptyset$ (Intersection size: **0**, mechanically verified).
  - All Class B Sankalia pages containing audit facts (#37, #51, #55, #56) reside exclusively in the Development partition, eliminating contamination from the held-out partition. Class B scans remain permanently hard-gated to manual double-entry transcription in production.
