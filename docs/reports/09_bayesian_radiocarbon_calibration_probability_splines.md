# Issue Report 09: Absence of Bayesian Radiocarbon Calibration & Gaussian Probability Density Splines

**Severity**: High  
**Category**: Chronological Methodology & Scientific Dating  
**Status**: Open / Architectural Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

ArchaeoPhD advertises an "IntCal20 Radiocarbon Calibration Engine", but the visualization layer represents radiocarbon dates as static integer years or flat rectangular duration chips (e.g., `300 BCE – 100 BCE`).

In modern scientific archaeology, a raw radiocarbon determination (e.g., $2140 \pm 35\text{ BP}$) cannot be accurately understood as a flat date or uniform box. Atmospheric $^{14}\text{C}$ fluctuations produce complex non-linear calibration curves (IntCal20 / SHCal20). The true calibrated date is a multi-peaked probability density function (PDF). Displaying flat intervals discards 90% of the statistical information needed to resolve dating disputes.

---

## 2. Archaeological Epistemological Breakdown

### 2.1 The Hallstatt Plateau & Atmospheric Wiggle Anomalies
Between roughly 750 BCE and 400 BCE (the **Hallstatt Plateau**), the atmospheric $^{14}\text{C}$ calibration curve is nearly flat. A charcoal sample dating to this era produces wide, multi-modal probability spreads spanning over 350 calendar years.
* In lower Bengal archaeology, this plateau directly intersects the crucial transition between **Pre-NBPW (Black-and-Red Ware)** and early **Northern Black Polished Ware (NBPW)**.
* Excavation reports often cite contradictory dates (e.g., Roy 2016 vs. Sharma 2022 on Mangalkot and Chandraketugarh) precisely because different scholars picked different intercept peaks on the same probability curve.

### 2.2 Visualizing $1\sigma$ and $2\sigma$ Confidence Intervals
Standard archaeological consensus (Aitken 1990; Bronk Ramsey 2009; Reimer et al. 2020) requires displaying:
1. **The IntCal20 Curve Spline**: Showing the $1\sigma$ calibration envelope across the calendar axis (cal BCE / cal CE).
2. **The Gaussian Radiocarbon PDF**: The normal distribution curve on the vertical BP axis projected horizontally against the calibration curve.
3. **The Resulting Calibrated Probability Envelopes**:
   - $1\sigma$ envelope (68.2% highest posterior density interval).
   - $2\sigma$ envelope (95.4% highest posterior density interval).

---

## 3. Current Limitations in the Codebase

1. In `Chronology-CSm9kFUB.js`, dates are plotted along a uniform Gantt-style timeline without probability peaks or curve intercepts.
2. The user cannot see whether a date range represents a narrow single-peaked intercept ($R^2 > 0.95$) or a fragmented multi-peaked distribution caused by an atmospheric plateau.
3. Bayesian prior constraints (e.g., Stratum $A$ is physically above Stratum $B$, therefore $Date(A) \ge Date(B)$) cannot be modeled or visualized.

---

## 4. Technical Requirements for Resolution

1. **Probability Curve Generator**:
   Render the full calibrated posterior probability density curve $P(t | \text{BP}, \sigma)$ as an SVG path alongside the IntCal20 spline.
2. **Confidence Range Highlighting**:
   Visually shade the $1\sigma$ (68.2%) and $2\sigma$ (95.4%) intervals with clear callouts for multi-modal intercepts.
3. **Bayesian Stratigraphic Boundary Modeling**:
   Allow linking Harris Matrix stratigraphy to radiocarbon samples so that OxCal-style Phase and Sequence priors constrain overlapping probability densities.
