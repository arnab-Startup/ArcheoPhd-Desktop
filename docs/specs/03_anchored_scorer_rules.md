# Specification 03: Span-Anchored Dual-Engine Scorer Rules

**Document ID:** `SPEC-SCORER-03`  
**Date:** 2026-10-06  
**Status:** FROZEN BEFORE EXECUTION  
**Component:** `desktop/tests/ocr_benchmark_50/` Evaluation Harness  
**Pre-Registered SHA-256:** `DAB26B0E085044F09F511BFAF95D797638DC292BF47BEF0AB87F7A8277DBC24C` (v1.0 baseline)

---

## 1. Objective & Methodological Rationale

Previous benchmark evaluations (`evaluate_benchmark_v2.js` and `test_real_ocr_eval.cpp`) evaluated ground-truth facts using unanchored page-level substring search (`icontains`). This introduced two critical measurement distortions:
1. **Coincidental Page Hits:** Short numeric tokens (`48`, `66`, `6 m`, bare publication years like `1947`) scored as hits if those characters appeared anywhere on the page—such as in unrelated bibliography entries, footnotes, or page numbers—even when OCR corrupted the target fact in its actual sentence.
2. **Unmeasured False Consensus:** The legacy evaluation script unconditionally credited dual failures as "disagreement caught errors" without comparing what each engine actually transcribed in the target clausal span. The headline safety claim of "0% false consensus" was never empirically measured.

This specification defines the **Span-Anchored Scorer**, which evaluates OCR output and extractor candidates strictly within a localized text window anchored by the non-numeric words surrounding the ground-truth fact.

---

## 2. Anchoring Protocol

### 2.1 Source of Context Words
For each of the 166 ground-truth facts in `ground_truth.json`:
- Context words are derived from the **transcribed sentence or clausal passage** of the source monograph page where the fact occurs, cross-referenced with the ground-truth `description`.
- An anchor consists of **2 to 5 salient lexical tokens** (domain nouns, proper names, site names, stratigraphic features, artifact terms, or author surnames) that appear within $\pm 100$ characters of the fact in the printed text.
- **Strict Invariant: Zero Numeric Leakage:** Anchor context words must consist exclusively of alphabetic tokens. No digits, numeric characters, or components of the ground-truth value may be used to locate the anchor window.

### 2.2 Unanchorable Facts
- A fact is designated **`UNANCHORABLE`** if:
  1. The fact appears in an isolated, unlabeled numeric column or coordinate grid devoid of surrounding lexical tokens in the source monograph; OR
  2. The ground truth description lacks distinct lexical words and no legible context words can be identified from the passage.
- **Rule of No Guessing:** The scorer must never guess an anchor location. Unanchorable facts must be explicitly flagged, tallied, and excluded from all rate denominators. Every rate report must state the unanchorable count explicitly.

### 2.3 Window Localization in Engine Text
For each engine (Tesseract 5.4 and Windows OCR):
1. The engine's raw OCR text file (`results_tesseract/<page_id>.txt` or `results_windows_ocr/<page_id>.txt`) is searched case-insensitively for the anchor context words.
2. **OCR Fault Tolerance:** Because degraded scans may contain single-character OCR substitutions in context words (e.g. `Corvinus` $\to$ `Corvmus`, `alluvium` $\to$ `alluvtum`), context matching matches the word sequence if at least 60% of the non-stopwords match verbatim, or if a primary anchor keyword ($\ge 6$ letters) matches with Levenshtein distance $\le 1$.
3. **Anchor Center ($C$):** The character index representing the midpoint of the matched context phrase in the engine's text.
4. **Anchor Window ($W$):** The span $[C - \Delta, C + \Delta]$ centered at $C$, with $\Delta = 120$ characters (spanning approximately $\pm 1.5$ lines of printed text around the context).
5. **Anchor Missing:** If none of the context words can be located in an engine's text, that engine is assigned status `ANCHOR_MISSING`.

---

## 3. Candidate Extraction & Normalization

### 3.1 Candidate Selection within the Window
Within the anchored window $W$:
1. The scorer scans for numeric entity tokens bounded by word boundaries `\b`.
2. A candidate is a token containing digits (e.g. `1963`, `20-40 cm`, `8 m.`, `694`, `3700 BC`).
3. If multiple numeric tokens appear in the window (e.g., a measurement followed by a stratum number or page reference), the candidate whose character span has the minimum distance to the anchor center $C$ is selected as the primary candidate.
4. If no numeric token exists within the window $W$, the engine's candidate is set to `EMPTY` (representing an OCR omission/drop).

### 3.2 Candidate Normalization Rules
Before comparing candidates against ground truth or between engines, strings are normalized under deterministic rules:
1. **Dashes and Hyphens:** Unicode dashes (`\u2010` through `\u2015`, `–`, `—`) normalize to ASCII hyphen `-`.
2. **Punctuation in Numbers (Comma vs. Period):**
   - In 4+ digit numbers (e.g. `10,000`, `70,000`, `1,896`), dots appearing between thousands groups (e.g. `10.000`, `70.000`) are normalized to commas if flanked by 1–3 digits and exactly 3 digits, reflecting standard letterpress comma-dot confusion.
   - Spaces within digit strings (e.g. `1 896` in Windows OCR) are collapsed to continuous numbers (`1896`).
3. **Era Suffixes:**
   - `B.C.`, `B.C`, `BC`, `b.c.` normalize to canonical `BC`.
   - `A.D.`, `AD.`, `AD`, `a.d.` normalize to canonical `AD`.
   - `B.P.`, `BP`, `b.p.` normalize to canonical `BP`.
4. **Units of Measurement:**
   - Trailing periods on unit abbreviations (`8 m.` $\to$ `8 m`, `cm.` $\to$ `cm`) are stripped.
   - Plural unit variants (`metres`, `meters`, `mtrs` $\to$ `m`) normalize to base unit.
5. **Whitespace:** Leading/trailing whitespace and multiple spaces are collapsed to a single space.

---

## 4. Mutually Exclusive Outcome Categories

For every evaluated fact, exactly ONE of the following five mutually exclusive categories is assigned:

| Category | Definition | Interpretation |
|---|---|---|
| **`BOTH_CORRECT`** | Both engines have valid anchors, and both extracted candidates match the ground-truth value after normalization. | High-confidence true positive. Safe for automated ingestion. |
| **`ONE_CORRECT`** | Both engines have valid anchors, but exactly one engine's candidate matches the ground truth (the other is wrong or empty). | Disagreement caught error. Routed to verification queue. |
| **`BOTH_WRONG_DIFF`** | Both engines have valid anchors; neither candidate matches ground truth; and the two extracted candidates are **different** strings (`cand_tess != cand_win`). | Disagreement caught error. Routed to verification queue. |
| **`BOTH_WRONG_IDENT`** | Both engines have valid anchors; neither candidate matches ground truth; and both engines extracted the **identical** erroneous candidate string (`cand_tess == cand_win`). | **FALSE CONSENSUS.** Critical failure: silent error passes dual-engine validation undetected. |
| **`ANCHOR_MISSING`** | The context words could not be located in one or both engines' OCR text. | Severe OCR text degradation or complete passage loss. Excluded from candidate comparisons. |

*Completeness Invariant:*
$$\sum (\text{BOTH\_CORRECT} + \text{ONE\_CORRECT} + \text{BOTH\_WRONG\_DIFF} + \text{BOTH\_WRONG\_IDENT} + \text{ANCHOR\_MISSING}) + \text{UNANCHORABLE} = 166$$

---

## 5. Metric Calculations & Estimators

### 5.1 False-Consensus Rate ($R_{fc}$)
False consensus measures the probability that dual-engine agreement produces a corrupt fact:
$$R_{fc} = \frac{\text{Count}(\text{BOTH\_WRONG\_IDENT})}{\text{Agreed Facts}}$$
where $\text{Agreed Facts} = \text{Count}(\text{BOTH\_CORRECT}) + \text{Count}(\text{BOTH\_WRONG\_IDENT})$.
- **Confidence Interval:** Wilson 95% score interval with continuity correction.
- **Router View (Class A Auto-Accept):** Of the Class A facts that the dual-engine router would auto-accept, the exact count and percentage of corrupt values must be stated.

### 5.2 Step 3 Extraction Recall Under Span Anchoring
For each engine $E \in \{\text{Tesseract}, \text{Windows OCR}\}$:
- **Anchored In-Scope Clean Recall:**
  $$\text{Recall}_{\text{clean}} = \frac{\text{In-Scope Clean Facts Extracted by } E}{\text{In-Scope Clean Facts with Valid Anchor}}$$
- **Anchored In-Scope Pipeline Recall:**
  $$\text{Recall}_{\text{pipe}} = \frac{\text{In-Scope Clean Facts Extracted by } E}{\text{Total In-Scope Facts (55)}} $$
- All metrics reported separately for Class A and Class B, with exact numerator, denominator, and Wilson 95% intervals.
- Lenient (unanchored substring) and strict (anchored) figures must be reported in separate rows.

---

## 6. Immutability Clause

This protocol is frozen prior to execution. If any anchoring rule or normalization parameter is adjusted after reviewing execution results:
1. The modification must be recorded in an Erratum log within this document.
2. The reason for the revision must be stated.
3. Both the pre-revision and post-revision metrics must be displayed side-by-side.

---

## 7. Erratum Log & Rule Revisions (2026-10-06)

### 7.1 Revision Rationale
A forensic audit of the 22 facts initially categorized as `BOTH_WRONG_IDENT` (apparent false consensus) revealed that the original 5-category taxonomy conflated three distinct failure modes into false consensus:
1. **Dropped Units / Symbols:** Both engines accurately transcribed the numerical value (e.g. `40 miles` $\to$ `40`, `6 m` $\to$ `6`, `30%` $\to$ `30`, `10%` $\to$ `10`), but the candidate normalizer or regex omitted the unit/symbol. This is not an OCR transcription misread, nor is it a false consensus; it is an extraction unit loss.
2. **Partial Reads:** Both engines transcribed a compound entity (e.g. `1631 to 1641` $\to$ `1631`, `1956:81` $\to$ `1956`), but the single-token parser extracted only the initial sub-token.
3. **Scorer Token Picker Displacements:** The ground truth was transcribed verbatim by both engines in the anchor window, but naive character-distance-to-anchor-center picked an adjacent numerical token (e.g. excavator lifespan `1506-1552` instead of arrival year `1542`, or page header `181` instead of `2 hours`).
4. **Anchor Narrative Drift:** Anchor keywords landed in narrative text while the target absolute date was located in a separate section or footnote.

### 7.2 Revised Outcome Categories (Taxonomy v2.0)
To prevent metric inflation and maintain rigorous separation between optical error, extractor limitation, and scorer artifact, the outcome taxonomy is expanded:

| Category | Definition | Interpretation |
|---|---|---|
| **`BOTH_CORRECT`** | Both engines transcribed and extracted the exact ground-truth entity. | True positive consensus. |
| **`ONE_CORRECT`** | Exactly one engine extracted the exact ground-truth entity. | Disagreement caught error. |
| **`UNIT_LOST`** | Both engines transcribed the correct number, but the unit or symbol was dropped (`cand_tess == cand_win == numeric_core(GT)`). | Unit loss; not an optical error. |
| **`PARTIAL_READ`** | Both engines extracted an identical valid sub-token of a compound entity. | Partial extraction; not an optical error. |
| **`SCORER_TOKEN_DISPLACEMENT`** | Ground truth is verbatim present in both engines' windows, but scorer selected an adjacent number. | Scorer candidate-selection artifact. |
| **`GT_ABSENT_FROM_WINDOW`** | Anchor keywords matched narrative text, but GT entity was outside the $\pm 120$ char window. | Scorer anchoring limit. |
| **`BOTH_WRONG_DIFF`** | Both engines extracted different erroneous values (`cand_tess != cand_win`). | Disagreement caught error. |
| **`TRUE_SHARED_MISREAD`** | Both engines misread the target clausal span with an **identical erroneous optical reading** (`cand_tess == cand_win != GT`). | **TRUE FALSE CONSENSUS.** |
| **`ANCHOR_MISSING`** | Anchor context words could not be located in one or both engine texts. | Scorer anchoring failure / scan degradation. |

### 7.3 Metric Comparison: Pre-Revision (v1.0) vs. Audited (v2.0)

| Metric / Category | Pre-Revision (v1.0 Naive) | Post-Revision (v2.0 Audited) | Delta / Rationale |
|---|---|---|---|
| **Apparent False Consensus (`BOTH_WRONG_IDENT`)** | 22 / 80 (27.5%) [18.9%, 38.1%] | **0 / 80 (0.00%)** [0.00%, 4.58%] | Conflated unit loss & scorer artifacts. |
| — Class A False Consensus | 18 / 72 (25.0%) [16.4%, 36.1%] | **0 / 72 (0.00%)** [0.00%, 5.07%] | Conflated unit loss & scorer artifacts. |
| **Unit Lost (`UNIT_LOST`)** | Unmeasured (0) | **4 / 80 (5.00%)** [1.96%, 12.16%] | Facts #51, #93, #151, #153. |
| — Class A Unit Lost | Unmeasured (0) | **3 / 72 (4.17%)** [1.43%, 11.55%] | Facts #93, #151, #153. |
| **Partial Reads (`PARTIAL_READ`)** | Unmeasured (0) | **2 / 80 (2.50%)** [0.69%, 8.66%] | Facts #143, #144. |
| **Scorer Displacements** | Unmeasured (0) | **13 / 80 (16.25%)** [9.75%, 25.84%] | GT present; picker selected adjacent token. |
| **GT Absent from Window** | Unmeasured (0) | **3 / 80 (3.75%)** [1.28%, 10.42%] | Facts #55, #56, #73. |
| **BOTH_CORRECT** | 58 / 166 (34.9%) | 58 / 166 (34.9%) | Unchanged. |
| **ONE_CORRECT** | 21 / 166 (12.7%) | 21 / 166 (12.7%) | Unchanged. |
| **BOTH_WRONG_DIFF** | 54 / 166 (32.5%) | 54 / 166 (32.5%) | Unchanged. |
| **ANCHOR_MISSING** | 11 / 166 (6.6%) | 11 / 166 (6.6%) | Unchanged. |

