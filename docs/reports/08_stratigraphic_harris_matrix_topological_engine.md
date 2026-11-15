# Issue Report 08: Absence of Native Stratigraphic Harris Matrix Topological Engine

**Severity**: High  
**Category**: Archaeological Domain Visualization & Stratigraphic Modeling  
**Status**: Open / Architectural Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

In archaeological fieldwork and post-excavation analysis, physical stratigraphy is the empirical foundation of all historical inference. Currently, ArchaeoPhD substitutes stratigraphic modeling with a flat horizontal chronological timeline ("Chronology" view) and generic entity counts.

A horizontal chronological timeline cannot represent physical stratigraphic superposition, intrusive cuts (pits, ring-wells, robber trenches), or contemporary surfaces. By failing to implement an Edward Harris (1979) Stratigraphic Matrix (a Directed Acyclic Graph with transitive reduction), the workstation cannot detect stratigraphic inversions, physical layer sequences, or taphonomic disturbances common to complex multi-period excavations like Chandraketugarh.

---

## 2. Archaeological Epistemological Breakdown

### 2.1 The Law of Superposition vs. Flat Timelines
In any excavation, physical deposits are stratified in reverse chronological order:
1. **Stratigraphic Unit (US - Unité Stratigraphique)**: Every deposit, wall, pit cut, or floor level is an indivisible unit of stratification.
2. **Topological Relations**:
   - $US_A$ is superimposed upon $US_B$ ($US_A > US_B$).
   - $US_A$ cuts through $US_B$ (Intrusive relation).
   - $US_A$ is contemporary with $US_B$ ($US_A \equiv US_B$).

A flat timeline reduces these 3D physical interactions to abstract calendar ranges, obscuring when a younger artifact is found physically below an older layer due to taphonomic intrusion.

### 2.2 The Bengal Terracotta Ring-Well Intrusion Problem
At **Chandraketugarh** (Mound of Khana-Mihir and Noongola), archaeologists routinely excavate terracotta ring-wells and drainage shafts. A typical ring-well constructed during the Kushana or Gupta period (c. 100–400 CE) was dug 8 to 14 feet vertically downward, cutting through:
- Stratum 3 (Sunga period, c. 185–73 BCE)
- Stratum 4 (Maurya period, c. 322–185 BCE)
- Stratum 5 (Pre-Mauryan / NBPW horizon, c. 600–300 BCE)

When the shaft fills with collapse debris, Kushana Rouletted Ware and cast copper coins become deposited at the physical depth of pre-Mauryan layers.
* **Without a Harris Matrix Engine**: The workstation treats finds at depth $Z = -3.8\text{m}$ as pre-Mauryan, producing false chronological anomalies.
* **With a Harris Matrix Engine**: The ring-well cut is modeled as a negative stratigraphic unit that truncates layers 3, 4, and 5, immediately explaining the apparent inversion.

---

## 3. Technical Requirements for Resolution

1. **DAG Topological Reduction**:
   Implement transitive reduction algorithms to strip redundant relationships:
   $$\text{If } A \succ B \text{ and } B \succ C, \text{ the direct link } A \succ C \text{ is suppressed in the visual matrix.}$$
2. **Stratigraphic Node Typing**:
   - **Positive Units**: Layers, fills, architectural walls, floor pavings.
   - **Negative Units**: Trench cuts, pit intrusions, foundation trenches, robber cuts, ring-well shafts.
   - **Interfaces**: Disconformities, erosion surfaces, abandonment horizons.
3. **Interactive Matrix Canvas**:
   Replace the horizontal bar chart with a vertically flowing DAG canvas where nodes represent numbered Stratigraphic Units grouped into phased cultural periods.
