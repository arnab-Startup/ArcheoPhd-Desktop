# Phase 2, Step 3 — Quantitative & Physical Entity Extraction Pipeline Specification & Pre-Registered Evaluation Set

**Author:** ArchaeoPhD Core Team  
**Date:** October 2026  
**Status:** Pre-Registered Specification (Committed PRIOR to Extractor Implementation)  
**Milestone:** Phase 2 (Knowledge Graph & Unified Store) — Step 3  

---

## 1. Method Statement & Scope

ArchaeoPhD implements a **deterministic, rule-based regular grammar and canonical normalizer** in pure C++ (zero LLM inference, zero cloud dependencies, zero external Python daemons) for the extraction and harmonization of physical, spatial, and chronological entities from archaeological literature. The extractor operates strictly on tokenized textual chunks and normalizes recognized entities into structured domain primitives.

### Scope & Invariants:
1. **Physical Measurements & Spatial Metrics:**
   - Linear measurements: millimeters (`mm`), centimeters (`cm`), meters (`m`), kilometers (`km`).
   - Volumetric / Cross-section dimensions: compound forms (`X by Y`, `X x Y`, `X × Y cm/m`).
   - Mass / Metrology: grams (`g`), kilograms (`kg`), milligrams (`mg`), and Harappan binary ratio weights.
2. **Ranges, Approximations & Uncertainties:**
   - Bounded intervals: `20-40 cm`, `between 1.5 and 2.0 m`, `10 to 15 metres`.
   - Approximations: `c. 1550`, `ca. 1400 BC`, `circa 732 BCE`, `approx. 2.5 m`.
   - Statistical errors / Radiometric spans: `1550 ± 50 BP`, `3200 +/- 45 rcybp`.
3. **Chronological Disciplines (BP vs. cal BCE/CE):**
   - **No In-House Calibration:** ArchaeoPhD does NOT apply internal calibration algorithms (e.g. IntCal20 curves) to raw radiocarbon determinations. The engine accepts and indexes author-reported calibrated spans (`cal BC`, `cal BCE`, `cal AD`, `cal CE`).
   - **Raw Radiocarbon Boundary:** Uncalibrated radiocarbon ages reported in years Before Present (`BP`, `rcybp`) are preserved as raw isotopic determinations and tagged with an advisory flag (`UNCALIBRATED_RADIOCARBON_BP`). They are never silently converted into calendar BCE/CE dates.
   - **Astronomical Normalization:** Historical BCE/CE dates are normalized to astronomical years ($1\text{ BCE} = 0$, $2\text{ BCE} = -1$, $1\text{ CE} = 1$) to prevent zero-year arithmetic bugs.
4. **Spatial Provenance & Locus Identifiers:**
   - Formal excavation spatial primitives: `Locus <id>`, `Loc. <id>`, `Trench <id>`, `Area <id>`, `Square <id>`, `Stratum <id>`, `Basket <id>`.
5. **Epistemic Invariant on OCR Corrupted Text (The "Never Repair" Rule):**
   - Degraded historical letterpress OCR artifacts (e.g. `2040 cm`, `691`, `1063`, `1846`, `1M7`) must **NEVER** be heuristically guessed, split, or repaired (e.g. `2040 cm` must NEVER be altered to `20-40 cm`).
   - Instead, the pipeline extracts the anomalous string verbatim, flags it explicitly with `FLAG_SUSPECTED_OCR_ANOMALY`, and queues it for human inspection. Modifying source text violates evidentiary provenance.

---

## 2. Pre-Registered Hand-Labeled Evaluation Dataset (40 Test Cases)

The evaluation set below is committed before writing any extractor implementation. It contains:
- 25 positive extraction cases spanning measurements, intervals, dates, and loci from the project corpus.
- 5 known OCR anomaly cases requiring verbatim extraction and flagging.
- 10 negative control cases (citation years, page numbers, monograph section IDs, and bibliographic numbers that must NOT be extracted as archaeological entities).

| ID | Category | Source Text Chunk | Target Entities to Extract | Required Normalization / Flag |
| :---: | :--- | :--- | :--- | :--- |
| **TC-01** | Linear Dim | `"The trench revealed a 2.5 cm layer of bitumen backing."` | Value: `2.5`, Unit: `cm` | Standardized to `0.025 m` |
| **TC-02** | Linear Dim | `"Mudbrick wall width measured 1.2 m across the crest."` | Value: `1.2`, Unit: `m` | Standardized to `1.200 m` |
| **TC-03** | Linear Range | `"Gravel lenses vary from 20-40 cm in total thickness."` | Min: `20`, Max: `40`, Unit: `cm` | Range `[0.20, 0.40] m` |
| **TC-04** | Linear Range | `"The revetment stood between 4.5 and 5.0 metres in height."` | Min: `4.5`, Max: `5.0`, Unit: `m` | Range `[4.50, 5.00] m` |
| **TC-05** | Compound Dim | `"Burnt bricks conformed strictly to 1:2:4, measuring 7 x 14 x 28 cm."` | Compound: `[7, 14, 28]`, Unit: `cm` | Standardized dimensions in `cm` |
| **TC-06** | Compound Dim | `"The soundings uncovered a pillar base 45 by 60 cm."` | Compound: `[45, 60]`, Unit: `cm` | Standardized dimensions in `cm` |
| **TC-07** | Depth / Elev | `"Water shaft descends forty metres through bedrock to depth 40 m."` | Value: `40`, Unit: `m`, Type: `DEPTH` | Depth `40.0 m` |
| **TC-08** | Mass / Weight | `"Chert weights included cubic specimens of 13.65 g and 27.3 g."` | Values: `13.65`, `27.3`, Unit: `g` | Standardized mass in grams |
| **TC-09** | Approx Date | `"Destruction of City IV occurred c. 1550 BC following intense burning."` | Span: `c. 1550 BC`, Type: `APPROX_BCE` | Astronomical year `~ -1549` (`1550 BCE`) |
| **TC-10** | Approx Date | `"Pottery horizon dates to circa 1400 BCE based on bichrome ware."` | Span: `circa 1400 BCE`, Type: `APPROX_BCE` | Astronomical year `~ -1399` (`1400 BCE`) |
| **TC-11** | Exact Date BCE| `"Terminal incineration by Tiglath-Pileser III in 732 BC."` | Value: `732 BC`, Type: `EXACT_BCE` | Astronomical year `-731` (`732 BCE`) |
| **TC-12** | Exact Date CE | `"Reoccupation continued until 135 CE under Hadrianic administration."` | Value: `135 CE`, Type: `EXACT_CE` | Astronomical year `+135` (`135 CE`) |
| **TC-13** | Date Range | `"Iron Age IIA occupation span dates to 1000-925 BCE."` | Start: `1000 BCE`, End: `925 BCE` | Astro Range `[-999, -924]` |
| **TC-14** | Date Range CE | `"The basilica floor was in continuous use from 320 to 390 CE."` | Start: `320 CE`, End: `390 CE` | Astro Range `[+320, +390]` |
| **TC-15** | Uncal C-14 BP | `"Short-lived seed samples yielded 3310 ± 45 BP (uncalibrated)."` | Value: `3310`, Error: `45`, Unit: `BP` | Flag: `UNCALIBRATED_RADIOCARBON_BP` |
| **TC-16** | Uncal C-14 BP | `"Charcoal speck determination gave 1550 +/- 50 rcybp."` | Value: `1550`, Error: `50`, Unit: `BP` | Flag: `UNCALIBRATED_RADIOCARBON_BP` |
| **TC-17** | Author Cal BC | `"Calibrated 2-sigma calendar range of 1620-1530 cal BC."` | Start: `1620 cal BC`, End: `1530 cal BC` | Astro Range `[-1619, -1529]`, Flag: `AUTHOR_CALIBRATED` |
| **TC-18** | Author Cal BCE| `"Radiocarbon calibration yields 1430 to 1390 cal BCE at 95.4% confidence."` | Start: `1430 cal BCE`, End: `1390 cal BCE`| Astro Range `[-1429, -1389]`, Flag: `AUTHOR_CALIBRATED` |
| **TC-19** | Temperature | `"Thermoluminescence plateau test reached 500 °C during annealing."` | Value: `500`, Unit: `°C` | Temp `500 °C` |
| **TC-20** | Locus Provenance| `"Excavated from Locus 102 immediately below the ash layer."` | Type: `LOCUS`, Id: `102` | Normalized Locus `102` |
| **TC-21** | Locus Provenance| `"Skeletal remains from Loc. 45-B adjacent to the north wall."` | Type: `LOCUS`, Id: `45-B` | Normalized Locus `45-B` |
| **TC-22** | Spatial Area | `"Temple courtyard revealed in Area H south sounding."` | Type: `AREA`, Id: `H` | Normalized Area `H` |
| **TC-23** | Stratum Name | `"Terminal destruction horizon identified as Stratum VI."` | Type: `STRATUM`, Id: `VI` | Normalized Stratum `VI` |
| **TC-24** | Trench ID | `"Mudbrick collapse documented in Trench I east face."` | Type: `TRENCH`, Id: `I` | Normalized Trench `I` |
| **TC-25** | Basket / Unit | `"Diagnostic cooking pot sherds recorded under Basket 104."` | Type: `BASKET`, Id: `104` | Normalized Basket `104` |
| **TC-26** | **OCR Corrupt** | `"Silt deposit with cobbles measuring 2040 cm depth."` | Raw: `2040 cm` | **EXTRACT AS-IS; FLAG_SUSPECTED_OCR_ANOMALY; NEVER REPAIR TO 20-40** |
| **TC-27** | **OCR Corrupt** | `"Artifact recorded from Locus 691 during season two."` | Raw: `691`, Type: `LOCUS` | **EXTRACT AS-IS; FLAG_SUSPECTED_OCR_ANOMALY; NEVER REPAIR TO 69-1** |
| **TC-28** | **OCR Corrupt** | `"Sample 1063 yielded contradictory stratigraphy."` | Raw: `1063`, Type: `SAMPLE_OR_LOCUS` | **EXTRACT AS-IS; FLAG_SUSPECTED_OCR_ANOMALY; NEVER REPAIR** |
| **TC-29** | **OCR Corrupt** | `"Terminal burn level recorded at elevation 1846 m."` | Raw: `1846 m` | **EXTRACT AS-IS; FLAG_SUSPECTED_OCR_ANOMALY; NEVER REPAIR** |
| **TC-30** | **OCR Corrupt** | `"Ceramic sherd registered as locus 1M7 on field bag."` | Raw: `1M7`, Type: `LOCUS` | **EXTRACT AS-IS; FLAG_SUSPECTED_OCR_ANOMALY; NEVER REPAIR** |
| **TC-31** | **Negative** | `"As noted in Kenyon (1981: 142), the wall was solid."` | **NONE** | Citations/page references MUST NOT extract as dates or measurements |
| **TC-32** | **Negative** | `"See bibliography reference 128 for further discussion."` | **NONE** | Reference pointer MUST NOT extract |
| **TC-33** | **Negative** | `"Figure 4 shows the schematic section of the mound."` | **NONE** | Figure caption reference MUST NOT extract as measurement |
| **TC-34** | **Negative** | `"Plate 16 illustrates the burnished carinated bowls."` | **NONE** | Plate reference MUST NOT extract |
| **TC-35** | **Negative** | `"The site spans approximately 15 hectares across the tell."` | Non-targeted units (hectares) excluded or flagged outside core grammar | Correct non-extraction or generic unit handling |
| **TC-36** | **Negative** | `"On page 320, Schiffer outlines n-transform models."` | **NONE** | Page reference MUST NOT extract |
| **TC-37** | **Negative** | `"The ratio of cattle to caprine bones was 3 to 1."` | **NONE** | Numerical ratio without units MUST NOT extract as physical measurement |
| **TC-38** | **Negative** | `"Trench supervisors counted 45 workers on the sounding."` | **NONE** | Human headcount MUST NOT extract as dimension or locus |
| **TC-39** | **Negative** | `"ISBN 0-19-813190-8 catalogued in institutional library."` | **NONE** | Catalog number MUST NOT extract |
| **TC-40** | **Negative** | `"Volume 2 of the final excavation report."` | **NONE** | Volume number MUST NOT extract |

---

## 3. Class B Security Gate Specification (Test-Driven Architecture)

In adherence to the core truth-plane invariants of ArchaeoPhD:

1. **Source Classification Guard:** Every extracted entity maintains an immutable link to its source document ID (`source_id`) and that document's classification (`SourceClassification::CLASS_A` vs `SourceClassification::CLASS_B`).
2. **Automated Commit Gate:**
   - Entities extracted from `CLASS_A` documents (clean, dual-engine verified print) may be promoted to `EntityStatus::CANDIDATE_COMMITTED` if consensus criteria are met.
   - Entities extracted from `CLASS_B` documents (unverified rough scans, historical letterpress) **MUST NEVER BE COMMITTED AUTOMATICALLY**.
3. **Negative Test Requirement:**
   - An automated test (`test_entity_extraction_gate.cpp`) will be compiled and executed **before** building the extraction engine.
   - The test seeds a `CLASS_B` source, invokes the extraction pipeline, and asserts that attempting to call `storage.commit_entity(entity_id)` or `dispatcher.commit_extracted_entity(id)` without human transcription operator signature results in:
     - Return code: `ERR_CLASS_B_VERIFICATION_REQUIRED`.
     - Zero entity insertions in the authoritative relational ledger.
     - Entity remains strictly quarantined in the pending review ledger (`EntityStatus::PENDING_HUMAN_VERIFICATION`).

---

## 4. Evaluation Metrics Protocol

The extraction pipeline will be measured using strict mathematical decoupling:

1. **Precision & Recall Reported Separately (No Composite-Only Smoothing):**
   - **True Positives ($TP$):** Extracted entity has correct boundary, correct normalized value, correct unit/type, and correct advisory flags.
   - **False Positives ($FP$):** Non-entity extracted, incorrect type, or altered/repaired string.
   - **False Negatives ($FN$):** Target entity in ground-truth missed by extractor.
   - **True Negatives ($TN$):** Clean rejection of negative control cases (TC-31 to TC-40).

2. **Wilson 95% Confidence Intervals:**
   Reported for both metrics:
   $$\text{Precision} = \frac{TP}{TP + FP} \pm \text{Wilson CI}_{95\%}$$
   $$\text{Recall} = \frac{TP}{TP + FN} \pm \text{Wilson CI}_{95\%}$$

3. **Sub-Metric Disciplines:**
   - **Anomaly Sensitivity:** $5/5$ OCR corruption cases must be detected and flagged ($100\%$ target).
   - **Repair Rate Violation:** Target $0\%$ (any heuristic rewrite of `2040 cm`, `691`, `1063`, `1846`, or `1M7` is an automatic gate failure).
   - **Negative Rejection Specificity:** $\frac{TN}{TN + FP_{\text{neg}}} \ge 90\%$.
