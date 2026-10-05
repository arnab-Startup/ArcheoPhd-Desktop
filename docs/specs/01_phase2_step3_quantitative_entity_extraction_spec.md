# Phase 2, Step 3 — Quantitative & Physical Entity Extraction Pipeline Specification (Revised v2.0)

**Author:** ArchaeoPhD Core Team  
**Date:** October 2026  
**Status:** Pre-Registered Specification (Revised Post-Review; Sealed PRIOR to Extractor Implementation)  
**Milestone:** Phase 2 (Knowledge Graph & Unified Store) — Step 3  

---

## 1. Architectural Positioning: Mentions vs. Claims

A critical architectural distinction governs this pipeline:

1. **Extractor Output is Strictly Mention-Level:**
   - The extraction engine detects and normalizes **textual mentions**: bounded token spans within source passages representing quantitative metrics, calendar dates, radiocarbon determinations, physical dimensions, or spatial designators.
   - Each mention contains: `raw_match` (verbatim substring), `normalized_value`, `unit_or_type`, `token_offset_start`, `token_offset_end`, and `origin_type` (inherited from source document classification: `CLASS_A` vs `CLASS_B`).

2. **Claims Require Attribution (Downstream Knowledge Graph Boundary):**
   - A Knowledge Graph **Claim** requires an epistemic tuple:
     $$\text{Claim} = \langle \text{Subject}, \text{Predicate}, \text{Object/Value}, \text{Provenance}, \text{AttributionSignature} \rangle$$
     For example: $\langle \text{Stratum VI}, \text{destruction\_date}, -731, \text{doc\_yadin\_1972\_p195}, \text{OperatorSignature} \rangle$.
   - The extraction engine **never creates Claims directly**. It emits unassigned candidate Mentions.
   - **No entity or mention emitted by Step 3 enters the authoritative Knowledge Graph without explicit human attribution.**
   - Attribution (resolving which locus, stratum, or artifact a mention describes) is an independent downstream task with its own specification, test harness, and human review loop.

---

## 2. Metrological & Linguistic Scope

The deterministic pure C++ regular grammar and normalizer operates strictly in-process with zero external dependencies, zero LLMs, and zero network calls.

### 2.1 Targeted Quantitative Domains
1. **Physical Measurements & Spatial Metrics:**
   - **Linear Dimensions:** Millimeters (`mm`), centimeters (`cm`), meters (`m`), kilometers (`km`), including publication surface abbreviations with terminal periods (`m.`, `cm.`, `mm.`) and lexical forms (`mtrs`, `metres`, `meters`).
   - **Compound Dimensions:** Multi-dimensional cross-sections and architectural modular proportions (`7 x 14 x 28 cm`, `45 by 60 cm`, `1:2:4`).
   - **Depth & Elevation:** Explicit stratigraphic vertical coordinates (`depth 40 m`, `depth of 7 m.`, `elevation 1846 m`, `at -2.5 m`).
   - **Mass & Metrology:** Grams (`g`), kilograms (`kg`), milligrams (`mg`), and Harappan binary ratio weight specimens (`13.65 g`, `27.3 g`).
   - **Temperature (Pyrotechnology & Archaeometry):** Degrees Celsius (`°C`, `deg C`, `degrees Celsius`, e.g. `500 °C` for TL plateau tests, ceramic firing horizons, or metallurgical slag).
   - **Artifact & Assemblage Counts:** Explicit integer specimen tallies attached to material or artifact classes (`694 Early Stone Age tools`, `444 flakes`, `2050 artifacts`, `12 pithoi`, `6 pieces`, `3 bifaces`).  
     *Rationale:* In historical monographs and OCR reports, digit drops and digit fusions on artifact counts represent the single most common category of numerical corruption.

2. **Chronological Disciplines & Calendar Normalization:**
   - **Historical Dates (BCE / CE):** Exact historical dates (`732 BC`, `732 B.C.`, `135 CE`, `135 A.D.`, `A.D. 70`), approximate dates (`c. 1550 BC`, `circa 1400 BCE`, `ca. 1200 B.C.`), and spans (`1000-925 BCE`, `from 320 to 390 CE`, `1000–925 BCE`).
   - **Astronomical Year Arithmetic:** All calendar dates are standardized to astronomical years to eliminate the "Year Zero" arithmetic boundary bug:
     $$1\text{ BCE} = 0, \quad 2\text{ BCE} = -1, \quad 732\text{ BCE} = -731, \quad 1550\text{ BCE} = -1549, \quad 1\text{ CE} = +1$$
   - **Radiocarbon (Raw BP vs Author-Calibrated cal BCE/BP):**
     * **No In-House Calibration:** ArchaeoPhD does NOT execute internal calibration curves (e.g., IntCal20) on raw determinations.
     * **Raw Uncalibrated Determinations:** Determinations in Before Present (`BP`, `rcybp`) are preserved as raw isotopic values and tagged with `UNCALIBRATED_RADIOCARBON_BP`. They are never converted into BCE/CE calendar years.
     * **Author-Reported Calibrated Spans:** Calibrated spans reported in the literature (`cal BC`, `cal BCE`, `cal AD`, `cal CE`) are indexed and tagged as `AUTHOR_CALIBRATED`.
     * **Calibrated BP (`cal BP` / `cal. BP`):** Recognized as author-calibrated calendar determinations before 1950, tagged as `AUTHOR_CALIBRATED` (distinguished from raw uncalibrated `BP`).

3. **Spatial Provenance & Excavation Primitives:**
   - Formal field designations: `Locus <id>`, `Loc. <id>`, `Trench <id>`, `Area <id>`, `Square <id>`, `Stratum <id>`, `Basket <id>`.

4. **Real-Corpus Typographic Surface Forms:**
   - **Punctuation in Eras & Units:** `B.C.`, `A.D.`, `m.`, `cm.`
   - **Comma Thousands:** Formatted numbers with comma digit grouping (`10,000`, `20,000`, `1,200 m`).
   - **Dash Variations:** ASCII hyphen (`-`), Unicode en-dash (`–`, `\u2013`), and em-dash (`—`, `\u2014`) in numerical and chronological ranges.

### 2.2 Boundary & Scope Exclusions
1. **Spelled-Out Numbers Policy:**
   - The deterministic regex extractor targets digit-based numerical mentions (e.g. `40 m`, `1.2 m`).
   - Spelled-out verbal numbers without digits (e.g. "forty metres", "sixteen pieces") are intentionally excluded from regex extraction to maintain high precision and avoid grammatical ambiguity.
   - In passages containing both verbal and numeric mentions (e.g. TC-07: *"Water shaft descends forty metres through bedrock to depth 40 m"*), only the numeric token `depth 40 m` is extracted.
2. **Out-of-Scope Units vs. Negative Controls:**
   - Real physical units that lie outside the targeted micro-stratigraphic domain (e.g., `hectares`, `acres`, `square kilometers`, `degrees Fahrenheit`) are categorized as **Out-of-Scope Units** (`OUT_OF_SCOPE_UNIT`), rather than negative controls.
   - Negative controls are strictly reserved for non-archaeological entity text (citations, page numbers, figure numbers, catalog IDs).

---

## 3. Epistemic Invariants & Decoupled OCR Anomaly Architecture

The requirement to handle corrupted OCR text is explicitly decoupled into three distinct engineering layers, resolving the untestability of relying on ad-hoc regex tuning for valid-looking corrupted numbers.

```
+-------------------------------------------------------------------------------+
|                             INPUT TEXT PASSAGE                                |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| TIER 1: "NEVER REPAIR" INVARIANT (Plain String Identity)                      |
| - Rule: raw_match == input_slice                                              |
| - Zero heuristic guessing, character splitting, or alteration.               |
| - Violation Rate strictly 0% (Tested via string equality)                     |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| TIER 2: PROVENANCE INVARIANT (Source Origin Tracking)                         |
| - Rule: Inherit origin_type = SourceClassification (CLASS_A vs CLASS_B)       |
| - All mentions from Class B permanently tagged UNVERIFIED_EXTRACTION.         |
| - Authoritative Knowledge Graph write gate strictly enforced.                 |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| TIER 3: DETERMINISTIC PLAUSIBILITY BOUNDS (Domain Sanity Flags)               |
| - Rule: Flag tokens exceeding physically possible excavation limits           |
| - Evaluated on Real 166-Fact OCR Benchmark (Sensitivity on 47 true errors,    |
|   FP rate on 119 correct facts) — NOT tuned to 5 synthetic strings.           |
+-------------------------------------------------------------------------------+
```

### 3.1 Tier 1: The "Never Repair" Invariant (String Identity)
- **Principle:** Modifying source text violates evidentiary provenance. The extractor must **never** heuristically repair or alter OCR tokens (e.g., `2040 cm` must NEVER be altered to `20-40 cm`; `691` must NEVER be altered to `694`; `1M7` must NEVER be altered to `147`).
- **Testable Criterion:** String equality:
  $$\text{assert}(\text{mention.raw\_match} == \text{passage\_text}[\text{start}\dots\text{end}])$$
- **Acceptance Gate:** Repair Violation Rate = $0.0\%$. Any modification of the source slice is an automatic gate failure.

### 3.2 Tier 2: The Provenance Invariant (Class B Tracking)
- Every mention inherits the document classification of its source text.
- Any mention extracted from an unverified rough scan or Class B document receives:
  $$\text{mention.origin\_type} = \text{SourceClassification::CLASS\_B}$$
  $$\text{mention.status} = \text{EntityStatus::UNVERIFIED\_EXTRACTION}$$
- Mentions with `CLASS_B` origin cannot be committed into the authoritative relational tables without a valid human verification signature and verified optical image crop on disk.

### 3.3 Tier 3: Deterministic Physical Plausibility Thresholds
A deterministic grammar cannot distinguish `2040 cm` from a legitimate `2040 cm` (e.g. total depth of a well shaft) by lexical syntax alone. However, domain-specific physical bounds provide deterministic plausibility flags:

1. **Stratigraphic Layer Thickness Bound:**
   - Single stratum/sediment thickness $> 10.0\text{ m}$ (or $> 1000\text{ cm}$): Flagged with `PLAUSIBILITY_EXTREME_LAYER_THICKNESS`. (Excavated layers rarely exceed 1–2 m; 2040 cm = 20.4 m indicates probable fused range `20-40 cm`).
2. **Excavation Depth Bound:**
   - Subterranean feature depth $> 100.0\text{ m}$: Flagged with `PLAUSIBILITY_EXTREME_DEPTH`.
3. **Site Elevation Discontinuity:**
   - Excavation elevation $> 4,500\text{ m}$ (or negative outside the Dead Sea Rift): Flagged with `PLAUSIBILITY_EXTREME_ELEVATION`.
4. **Token Shape Anomaly (Letter/Digit Interleaving):**
   - Locus, trench, or numeric identifiers containing internal uppercase letters flanked by digits (e.g. `1M7`, `B8A0`, `O0` digit/letter confusion): Flagged with `PLAUSIBILITY_SHAPE_ANOMALY`.
5. **Single Assemblage Count Bound:**
   - Single find-spot / basket specimen count $> 10,000$: Flagged with `PLAUSIBILITY_EXTREME_COUNT`.

**Evaluation Requirement:** Plausibility detection sensitivity and false-alarm rates are evaluated against the **Real-OCR Benchmark (166 facts)**, measuring flag trigger rates across the 47 known errors vs. 119 correct facts.

---

## 4. Class B Security Gate Architecture

The Class B security gate enforces truth-plane isolation at the unified storage write path:

1. **Intrinsic Origin Keying:**
   - The security check is keyed directly off the mention's immutable `origin_type` field, NOT an external caller-supplied boolean parameter (`is_verified`) that could be inadvertently flipped or bypassed.
2. **Unified Entry Point:**
   - All extractor-emitted items enter storage through a single ingestion gateway:
     ```cpp
     ExtractionCommitResult commit_extracted_mention(
         const ExtractedMention& mention,
         const HumanVerificationSignature& signature
     );
     ```
3. **Enforcement Logic:**
   - If `mention.origin_type == SourceClassification::CLASS_B` and `signature.is_empty()`:
     * Returns error code `ERR_CLASS_B_VERIFICATION_REQUIRED`.
     * Zero records inserted into authoritative knowledge graph tables (`strata`, `features`, `artifacts`, `dates`).
     * Mention is quarantined in `verification_queue` ledger awaiting optical crop inspection.

---

## 5. Pre-Registered Evaluation Protocol & Dataset Structure

Evaluation is strictly partitioned into three decoupled datasets to eliminate circularity:

### 5.1 Dataset 1: Development Set (`tests/eval_entity_extraction_dataset.hpp`)
- **Nature:** 40 synthetic and curated test cases (25 positive, 5 OCR corruptions, 9 negative controls, 1 out-of-scope unit).
- **Purpose:** Test-driven development, internal regression bench, grammar unit tests.
- **Role:** Explicitly labeled as **DEV SET ONLY**. Not used to certify generalizable performance.

### 5.2 Dataset 2: Independent Held-Out Evaluation Set (`tests/eval_entity_extraction_held_out.hpp`)
- **Nature:** Passages extracted directly from real archaeological publications in the project corpus:
  * Sankalia (1974) *Prehistory and Protohistory of India and Pakistan*
  * Kenyon (1957, 1981) *Digging Up Jericho* / *Excavations at Jericho*
  * Yadin (1972) *Hazor: The Head of All Those Kingdoms*
  * Marshall (1931) & Mackay (1938) *Mohenjo-daro and the Indus Civilization*
  * Aitken (1990) *Science-based Dating in Archaeology*
  * Schiffer (1987) *Formation Processes of the Archaeological Record*
  * Courty, Macphail, Wattez (1989) *Soils and Micromorphology in Archaeology*
- **Composition:**
  * Positive extraction targets (metrics with `m.`, dates with `B.C.`, author-calibrated `cal BP`, artifact counts, strata).
  * High-difficulty negative controls (page spans `pp. 131–137`, bibliographic years `March 1945`, `Kenyon (1981: 142)`, figure references, table references, excavation permit IDs).
  * Out-of-scope units (hectares, acres).
- **Sealing Invariant:** Pre-registered and sealed with its SHA-256 hash in git prior to running final evaluation. Evaluated only once.

### 5.3 Dataset 3: Real-OCR Plausibility Benchmark (`tests/ocr_benchmark_50/ground_truth.json`)
- **Nature:** 166 blind ground-truth facts across 50 corpus document pages, coupled with raw OCR outputs from Tesseract LSTM (`results_tesseract/`) and Windows Native OCR (`results_windows_ocr/`).
- **Ground Truth Distribution:**
  * 119 verified correct facts (consensus / ground truth).
  * 47 true OCR errors / corruptions (digit drops, range fusions, letter substitutions).
- **Protocol:**
  * Run the extraction pipeline on raw OCR text outputs.
  * Evaluate Plausibility Flag Sensitivity (Recall on the 47 corrupted facts):
    $$\text{Sensitivity}_{\text{plausibility}} = \frac{\text{Corruptions Flagged}}{47} \pm \text{Wilson CI}_{95\%}$$
  * Evaluate Plausibility Flag Specificity (False Alarm Rate on the 119 correct facts):
    $$\text{Specificity}_{\text{plausibility}} = \frac{\text{Correct Facts NOT Flagged}}{119} \pm \text{Wilson CI}_{95\%}$$
  * Report both with Wilson 95% Confidence Intervals.

---

## 6. Pre-Registered Performance Gates

Prior to advancing Phase 2, the pipeline must satisfy the following gates on the **Held-Out Set** and **Real-OCR Benchmark**:

| Metric | Evaluation Scope | Pre-Registered Gate | Rationale |
|---|---|---|---|
| **Precision** | Held-Out Set | $\ge 90.0\%$ | Wilson 95% lower bound must demonstrate high precision |
| **Recall** | Held-Out Set | $\ge 85.0\%$ | Minimizes missed domain entities |
| **Repair Violation Rate** | Held-Out & Dev Sets | **$0.0\%$ (Strict Zero)** | Any heuristic modification of raw text slice fails gate |
| **Negative Specificity** | Held-Out Hard Negatives | $\ge 90.0\%$ | Clean rejection of bibliographic years, page numbers, citations |
| **Class B Quarantine** | Security Gate Test | **$100.0\%$** | Zero automated commits of Class B mentions to authoritative KG |
| **Plausibility Sensitivity** | Real-OCR 47 Corruptions | Measured & Reported | Statistical characterization on real letterpress noise |
