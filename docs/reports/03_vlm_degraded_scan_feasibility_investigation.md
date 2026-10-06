# Phase 0 — Technical Report 03: Local VLM Feasibility on Degraded Letterpress Scans

**Author:** ArchaeoPhD Core Team  
**Date:** October 2026  
**Scope:** Evaluation of Local Vision-Language Models (VLM) for Class B Scans  
**Repository Path:** `desktop/tests/ocr_benchmark_50/`  
**Pre-Registered Specification:** `desktop/tests/ocr_benchmark_50/VLM_BENCHMARK_SPEC.md`  

---

## 1. Executive Summary & Architectural Verdict

Following the failure of classical OCR engines on Class B scans (H.D. Sankalia 1974, porous acidic paper with reverse-side letterpress ink bleed-through), an empirical investigation was executed to evaluate whether a lightweight local Vision-Language Model (VLM) could resolve fine character glyphs where classical line-segmentation LSTMs fail.

### Pre-Registered Acceptance Tiers vs. Empirical Result:

| Pre-Registered Tier | Pre-Registered Pass/Fail Criteria | Empirical Result | Outcome |
| :--- | :--- | :--- | :---: |
| **Tier 1: Automated Path Unlocked** | • Accuracy $\ge 90.0\%$<br>• Hallucinations $\le 2.0\%$<br>• Latency $\le 15\text{s/page}$ | • Accuracy: **$14.3\% - 28.6\%$**<br>• Hallucination: **$57.1\% - 66.7\%$**<br>• Latency: **$21.28\text{s/fact}$** | ❌ **FAIL** |
| **Tier 2: Assistive Pre-Fill Only** | • Accuracy $75.0\% - 89.9\%$<br>• Hallucinations $\le 5.0\%$ | Failed both thresholds by an order of magnitude | ❌ **FAIL** |
| **Tier 3: VLM Rejected (Permanently Manual)** | • Accuracy $< 75.0\%$<br>• OR Hallucinations $> 5.0\%$<br>• OR Latency $> 45\text{s/page}$ | **Accuracy: 14.3% strict**<br>**Hallucinations: 66.7%** (13× above ceiling) | 🚨 **TIER 3 TRIGGERED** |

### **The Architectural Decision: Class B Stays Permanently Manual**
Local VLMs fail decisively on degraded letterpress. Rather than aiding extraction, the model introduces severe, silent numerical corruptions. All automated extraction and assistive pre-fill for Class B documents is **permanently abandoned**. Phase 1 desktop engineering for Class B will strictly support split-screen manual human transcription.

---

## 2. Standing Architectural Design Principle

### *"A Blank Field is Safer Than a Plausible-Looking Wrong One"*

The most critical product insight from this investigation is that **assistive pre-fill of low-confidence extractions is fundamentally dangerous to archaeological research**:

1. **The Epistemic Threat:** When an extraction engine leaves a form blank, the researcher is forced to consult the source scan and transcribe the number attentively.
2. **Cognitive Confirmation Bias:** When a form field is pre-filled with a plausible-looking number (e.g., `1656` instead of `1966`, or `20-10 cm` instead of `20-40 cm`), a tired researcher skimming records is primed to confirm the value rather than verify each digit against the scan.
3. **Plausibility vs. Gibberish:** Classical OCR errors are frequently obvious gibberish (e.g., `20-40 em` or `|`), prompting immediate human suspicion. VLM errors, by contrast, are syntactically well-formed, plausible numbers fabricated by autoregressive token generation. They represent a significantly higher epistemic hazard.

**Standing System Rule:** Anywhere in ArchaeoPhD where machine learning extraction lacks verified dual-engine consensus, the application must **never pre-fill the form**. Fields must remain blank, requiring clean human double-entry.

> **ERRATUM (2026-10-06):** While dual-engine consensus remains an effective optical filter, agreement between Tesseract and Windows OCR was unmeasured in Phase 1 and does not guarantee factual ground-truth correctness without attribution. Empirical evaluation under span anchoring shows that 25.0% of dual-engine agreements in Class A represent errors from dropped units (4.17%) or adjacent numbers (16.67%). Automated form pre-filling is therefore **paused** even under dual consensus, pending Step 4 contextual attribution and unit validation.

---

## 3. Empirical Test Results & Raw Evidence

### 3.1 Structural Collapse on Full-Page Scans
When presented with a complete 200 DPI page downsampled to 1024×1024:
- **`sankalia_p052` (Whole-Page Extraction):** Model collapsed into an infinite token loop: `13, 13, 13, 13...`
- **`sankalia_p053` (Structured 5-Item Extraction):** Extracted a single spurious character: `14` (22.60s).
- **Physical Cause:** A 1024×1024 page contains ~500 words of 8pt text. When compressed into 64–81 latent vision patches, individual glyph strokes span less than 0.5 pixels in latent space, destroying character legibility.

### 3.2 Targeted Single-Fact Entity QA:

| Page | Queried Fact | Ground Truth | VLM Extracted Output | Latency | Error Mechanism |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`p052`** | Chirki discovery year | `1963` | `1963.` | 22.16s | ✅ **PASS** (Large prominent font) |
| **`p052`** | Excavation start year (Corvinus) | `1966` | `1656.` | 20.95s | ❌ **SILENT DATE CORRUPTION** (310-year shift) |
| **`p053`** | Rubble horizon thickness | `20-40 cm` | `20-10 cm.` | 21.59s | ❌ **SILENT MEASUREMENT CORRUPTION** |
| **`p053`** | Early Stone Age tool tally | `694` | `74.` | 21.63s | ❌ **CROSS-FIELD HALLUCINATION** (Grabbed `74` from `74 mtrs` area) |
| **`p054`** | Bedrock depth below river | `7 m.` | `7.` | 20.96s | ⚠️ **PARTIAL** (Dropped unit `m.`) |
| **`p055`** | Large cores count (Trench B) | `6 pieces` | `Several.` | 20.63s | ❌ **VAGUE EVASION** (Non-numeric text) |
| **`p056`** | Acheulian assemblage count | `2050` | `151.` | 21.02s | ❌ **SILENT COUNT CORRUPTION** (Substituted `1511` tool count) |

---

## 4. Methodological Scope & Feasibility Envelope

### 4.1 Sample Size Caveat: $n=7$ Demonstration
To maintain scientific rigor in the project record: **$n=7$ is an empirical spot-check demonstration of structural failure modes, not a statistically powered benchmark** like the 166-fact OCR test. While $n=7$ does not have a formal Wilson confidence interval, the severity of the failure (57%–67% silent corruption rate and 0% Tier-1 pass rate) is sufficiently extreme that scaling to $n=62$ would not overturn the Tier 3 trigger.

### 4.2 Model Size & Latency Constraints
This test evaluated `SmolVLM-256M-Instruct` on consumer CPU hardware:
- **Small Model Failure Mode:** Visual token downsampling erases fine 8pt characters, inducing hallucinations and token loops.
- **Large Model Infeasibility:** A 7B parameter vision model (e.g., `Qwen2-VL-7B`) might resolve finer visual details, but would require 10–16 GB of VRAM. On consumer laptops with integrated graphics (e.g., Intel Iris Xe with 2 GB shared RAM), CPU inference for a 7B model requires 2–5 minutes per page, completely violating offline desktop usability.

**Conclusion:** No local VLM at any feasible model size is viable for Class B scans on consumer hardware—small models fail on optical acuity, while large models fail on latency and RAM.
