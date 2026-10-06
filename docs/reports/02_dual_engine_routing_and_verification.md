# Phase 0 — Technical Report 02: Dual-Engine Routing & Verification Architecture

**Author:** ArchaeoPhD Core Team  
**Date:** October 2026  
**Scope:** Native C++ Routing Engine, State Machine Verification, and Implementation Audit  
**Implementation Files:** `desktop/engine/extraction/dual_engine_router.hpp`, `desktop/src/main.cpp`  

---

## 1. Architecture Overview

To eliminate silent extraction corruptions in local desktop environments without relying on cloud APIs, ArchaeoPhD implements a **Dual-Engine Agreement Router** in native C++20. The router coordinates two independent OCR engines with orthogonal character segmentation algorithms:
1. **Windows Native OCR (`Windows.Media.Ocr.OcrEngine`):** Fast, bounding-box word-level segmentation built into the Windows OS.
2. **Tesseract OCR 5.4.1 (MinGW / Containerized LSTM):** Line-level LSTM neural sequence model specializing in faint strokes and dense ligature sequences.

```
                   [ Input PDF Document ]
                             │
                  [ Source Classification ]
                  ┌──────────┴──────────┐
                  ▼                     ▼
          [ Class A: Clean ]    [ Class B: Degraded ]
                  │                     │
        ┌─────────┴─────────┐           ▼
        ▼                   ▼     [ HARD GATE: Class B ]
  [ Windows OCR ]    [ Tesseract ]  (Zero automated writes;
        │                   │        100% manual transcription)
        └─────────┬─────────┘
                  │
        [ Exact Text Comparison ]
         engine_a == engine_b ?
                  │
         ┌────────┴────────┐
        YES                NO
         ▼                 ▼
  [ AUTO-ACCEPT ]   [ VERIFICATION QUEUE ]
  (Direct write     (Side-by-side snippet +
   to LanceDB)       researcher 1-click select)
```

---

## 2. Mathematical Routing State Machine

For any quantitative entity $e$ extracted from page $p$, the extraction tuple is:
$$E = (v_{\text{win}}, v_{\text{tess}}, c_{\text{win}}, c_{\text{tess}})$$
where $v$ represents extracted text and $c$ represents engine confidence.

The router executes four disjoint deterministic states:

### State 1: AUTO_ACCEPT
$$\text{Condition: } \text{Class}(p) = \text{Class A} \quad \land \quad v_{\text{win}} = v_{\text{tess}} \quad \land \quad v_{\text{win}} \neq \emptyset$$
- **Action:** Entity is written directly to the local compressed database (`.zst` / `.qvec`).
- **Status (ERRATUM 2026-10-06):** **PAUSED.** The previously reported "0.0% empirical false consensus rate" was **unmeasured** in Phase 1 (an artifact of test code assuming dual failures never agreed). Rigorous evaluation under span anchoring (`docs/specs/03_anchored_scorer_rules.md`) shows that while true optical false consensus is 0.00% (0/72 in Class A [Wilson 95% CI: 0.00%, 5.07%]), string-level agreement without span or unit binding admits 25.00% (18/72) agreed errors from dropped units (4.17%) and adjacent-number displacements (16.67%). Automated ingestion is paused; all Class A facts currently route to State 2 (Verification Queue) pending Step 4 attribution and unit validation.


### State 2: ROUTED_TO_VERIFICATION
$$\text{Condition: } \text{Class}(p) = \text{Class A} \quad \land \quad v_{\text{win}} \neq v_{\text{tess}} \quad \land \quad (v_{\text{win}} \neq \emptyset \lor v_{\text{tess}} \neq \emptyset)$$
- **Action:** Entity is staged in the pending verification queue. The desktop UI presents a side-by-side snippet modal highlighting the crop with two selectable candidate pills.

### State 3: REJECTED_UNRESOLVABLE
$$\text{Condition: } v_{\text{win}} = \emptyset \quad \land \quad v_{\text{tess}} = \emptyset$$
- **Action:** Both engines dropped the fact entirely. Flagged as unresolvable for human transcription.

### State 4: HARD_GATED_CLASS_B
$$\text{Condition: } \text{Class}(p) = \text{Class B}$$
- **Action:** Automated extraction disabled. Source is scheduled for split-screen manual transcription.

---

## 3. Shipping C++ Reproduction Audit

To eliminate the gap between offline analytical benchmarks and shipping application code, the exact C++ router logic was executed against raw OCR output files for all 166 ground-truth facts.

### Empirical Reproduction Distribution:

| Routing Bucket | Class A Facts (104) | Class B Facts (62) | Total Facts (166) | Operational Action in Workstation |
| :--- | :---: | :---: | :---: | :--- |
| **Auto-Accepted** | **92** (88.46%) | 27 (43.55%)* | **119** (71.69%) | Direct commit to LanceDB |
| **Verification Queue** | **9** (8.65%) | 0 (0.00%) | **9** (5.42%) | Human 1-click candidate selection |
| **Rejected / Low Conf** | **3** (2.88%) | 17 (27.42%) | **20** (12.05%) | Human manual entry required |
| **Hard-Gated (Class B)** | **0** (0.00%) | 18 (29.03%) | **18** (10.84%) | Total automated extraction block |
| **Total** | **104** (100.0%) | **62** (100.0%) | **166** (100.0%) | 100% of facts accounted for |

*\*Note: Under the Phase 1 hardening policy, all 62 Class B facts are diverted to Hard-Gated Manual Transcription, preventing any auto-writes regardless of engine consensus on degraded paper.*
*\*Erratum Note (2026-10-06): The 92 Class A facts were marked Auto-Accepted under the unanchored string-matching test harness. In production, automated ingestion for Class A is PAUSED; all facts route to the Verification Queue until Step 4 implements location- and unit-bound candidate extraction and attribution.*

### Verification Arithmetic Check:
$$\text{Class A Total} = 92 \text{ (Auto-Accepted)} + 9 \text{ (Verification)} + 3 \text{ (Rejected)} = 104 \text{ facts (100.0\%)}$$
$$\text{Class B Total} = 27 \text{ (Consensus)} + 17 \text{ (Both Failed)} + 18 \text{ (Hard Gated)} = 62 \text{ facts (100.0\%)}$$
$$\text{Grand Total} = 104 + 62 = 166 \text{ facts}$$

The compiled C++ executable reproduced the exact numerical distribution of the benchmark report with **zero discrepancy**.

---

## 4. Workstation Safeguards & Classification UI Hardening

Because the dual-engine safety guarantee requires modern offset printing (Class A), the desktop workstation implements three fail-safe UI mechanisms:

1. **Default-Safe Ingestion:** All newly imported PDFs and scanned archives default to **Class B (Degraded / Manual)** upon import.
2. **Explicit Researcher Confirmation for Class A:** A user must explicitly opt in to Class A processing by confirming that the document is modern offset print (>1980) free of porous ink bleed-through.
3. **Re-Flagging Path:** A 1-click "Report Ingestion Degradation" button allows researchers to downgrade any document or chapter to Class B instantly if faint print or bleed-through is encountered.
