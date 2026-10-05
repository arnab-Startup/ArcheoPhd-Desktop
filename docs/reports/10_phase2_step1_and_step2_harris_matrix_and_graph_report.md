# Report 10 — Phase 2 Steps 1 & 2: Stratigraphic DAG, Harris Matrix Engine & Knowledge Graph Store

**Date:** October 4, 2026  
**Status:** Complete & Fully Verified  
**Milestone:** Phase 2 (Knowledge Graph & Unified Store) — Steps 1 & 2  
**Binary Deliverable:** `release/ArchaeoPhD.exe` (9,656,832 bytes, standalone Win32 executable)  

---

## Executive Summary

Following the formal closure of Phase 1 ([Report 09](09_phase1_final_signoff_report.md)), development has transitioned into **Phase 2: Knowledge Graph & Unified Store**. 

Phase 2, Steps 1 and 2 deliver the core archaeological graph reasoning layer:
1. **Unified Graph Store & Relational Cross-Referencing:** Multi-index join connecting Layer A (Physical Sites, Strata, Artifacts, Samples) $\leftrightarrow$ Layer B (Interpretive Claims) $\leftrightarrow$ Layer C (Evidence Links) $\leftrightarrow$ Vector/BM25 chunks (`chunk_id`, `doc_id`, `page_ref`).
2. **Stratigraphic DAG & Harris Matrix Engine ([`harris_matrix.hpp`](../../engine/analysis/harris_matrix.hpp)):** Pure C++ Directed Acyclic Graph builder implementing Edward C. Harris's *Principles of Archaeological Stratigraphy* (1979).

All **83 automated graph and matrix assertions across 15 sub-suites** passed with zero regressions across the existing 72 Phase 1 assertions.

---

## 1. Architectural Implementation

### 1.1 Stratigraphic DAG & Harris Matrix Engine (`harris_matrix.hpp`)
Implemented in `desktop/engine/analysis/harris_matrix.hpp`:
- **Stratigraphic Temporal Ordering:** Directed edges $u \to v$ represent temporal succession where deposit $u$ was formed prior to deposit $v$ ($u$ is older than $v$). Edges are derived from:
  - $v \in \text{harris\_above}(u) \implies u \to v$
  - $u \in \text{harris\_below}(v) \implies u \to v$
  - $v \in \text{harris\_cut\_by}(u) \implies u \to v$ (intrusive cut features post-date the strata they cut)
- **Tarjan's SCC Cycle Detection:** Identifies physical impossibility paradoxes (e.g. $A > B > C > A$) in $O(V + E)$ time complexity.
- **Topological Sorting (Kahn's Algorithm):** Computes the linear or phased chronological sequence from earliest basal deposits (level 0) to terminal surface horizons.
- **Stratigraphic Level Assignment:** Assigns vertical phase depths to vertices to drive visual DAG rendering in the desktop UI.
- **Law of Superposition Validator:** Verifies that overlying strata are not chronologically older than underlying strata. Evaluates both:
  1. Stratum chronological bounds (BCE/CE calendar dates).
  2. Associated radiometric $C^{14}$ calibrated sample ranges ($2\sigma$).

### 1.2 Knowledge Graph Relational Store (`storage.hpp`)
Added relational cross-referencing accessors to `NativeStorage`:
- `get_claims_by_site(site_id)`
- `get_claims_by_stratum(stratum_id)`
- `get_strata_by_site(site_id)`
- `get_artifacts_by_stratum(stratum_id)`
- `get_samples_by_stratum(stratum_id)`
- `get_evidence_by_claim(claim_id)`
- `get_claims_by_source(source_id)`
- `get_entity_subgraph(entity_type, entity_id)`: Extracts a complete recursive entity subgraph (site, strata, artifacts, samples, claims, evidence links) formatted for UI rendering.

### 1.3 IPC Bridge Endpoints (`native_ipc_dispatcher.hpp`)
Exposed new native graph actions over the in-memory WebView2 bridge:
- `build_harris_matrix`: Computes the Harris Matrix, detects cycles, and flags date inversions for a given site.
- `get_entity_subgraph`: Returns full relational neighborhood for a physical entity or claim.
- `query_knowledge_graph`: Compound query combining hybrid vector/BM25 passage retrieval with structured relational entity filtering.

---

## 2. Verification & Test Results (`test_harris_matrix_and_graph.exe`)

The hardened Phase 2 test suite was compiled and executed (commit `3706bae`):

```text
================================================================================
  ArchaeoPhD Engine — Hardened Phase 2 Stratigraphic DAG & Graph Suite          
================================================================================

[TEST 1] Stratigraphic DAG Construction & Topological Sequence...
  [PASS] Matrix is a valid DAG (no cycles)
  [PASS] Topological sequence has 4 elements
  [PASS] First in sequence is earliest (strat_bedrock)
  [PASS] Second in sequence is strat_ppnb
  [PASS] Third in sequence is strat_mba_city_iv
  [PASS] Fourth in sequence is latest (strat_lba_burn)
  [PASS] Bedrock level is 0
  [PASS] PPNB level is 1
  [PASS] MBA level is 2
  [PASS] LBA level is 3
  [PASS] Zero inversions in coherent sequence

[TEST 2A] Length-3 Cycle Detection (A -> B -> C -> A)...
  [PASS] Length-3 cyclic sequence identified as NOT a valid DAG
  [PASS] At least 1 cycle isolated by Tarjan SCC
  [PASS] Cycle contains 3 vertices
  [PASS] Topological sequence is strictly empty on cycle

[TEST 2B] Length-1 Self-Loop Detection (A -> A) & Downstream Abort...
  [PASS] Self-loop identified as NOT a valid DAG
  [PASS] Self-loop cycle isolated in cycles array
  [PASS] Self-loop component contains exactly strat_self
  [PASS] Downstream Kahn topological sort did NOT produce partial sequence

[TEST 2C] Length-2 Mutual Cycle Detection (A <-> B)...
  [PASS] Length-2 mutual cycle identified as NOT a valid DAG
  [PASS] Cycle isolated contains 2 vertices
  [PASS] Topological sequence is empty

[TEST 2D] Multiple Disconnected Independent Cycles...
  [PASS] Disconnected multi-cycle graph identified as NOT valid DAG
  [PASS] Both independent cycles isolated by Tarjan SCC
  [PASS] Topological sequence is empty

[TEST 3A] Classical BCE Law of Superposition Inversion...
  [PASS] DAG topology remains structurally valid
  [PASS] Inversion detected
  [PASS] Inversion is marked as advisory review
  [PASS] Inversion flags upper stratum correctly
  [PASS] Inversion flags lower stratum correctly
  [PASS] Reason cites Stratigraphic date discrepancy

[TEST 3B] Astronomical Year 1 BCE / 1 CE Boundary Test (Zero-Year Trap Defense)...
  [PASS] 1 BCE below 1 CE is a valid sequence
  [PASS] No inversion on 1 BCE -> 1 CE boundary (astro 0 <= 1)
  [PASS] 1 BCE below 2 BCE correctly flags boundary inversion
  [PASS] Upper stratum flagged as 2 BCE
  [PASS] Lower stratum flagged as 1 BCE

[TEST 3C] Common Era (CE) Superposition Inversion...
  [PASS] CE date inversion detected
  [PASS] Flags early Roman as upper inverted stratum

[TEST 4A] C-14 Overlapping 2-Sigma Range (Valid Stratigraphic Prior)...
  [PASS] Overlapping 2-sigma calibrated ranges do NOT produce false positive inversion

[TEST 4B] C-14 Strict Non-Overlap (Advisory Review Flag)...
  [PASS] Strict non-overlap triggers inversion entry
  [PASS] Inversion is marked as advisory (is_advisory == true)
  [PASS] Cites upper lab code OXA-4022
  [PASS] Cites lower lab code OXA-4021
  [PASS] Reason contains 'Possible redeposition or context error — please review'
  [PASS] DAG topology remains valid despite advisory C-14 inversion

[TEST 5A] Relational Cross-Referencing in NativeStorage...
  [PASS] get_claims_by_site returned 1 claim
  [PASS] Returned claim is claim_wood_1990_01
  [PASS] get_claims_by_stratum returned 1 claim
  [PASS] get_strata_by_site returned 1 stratum
  [PASS] get_artifacts_by_stratum returned 1 artifact
  [PASS] get_samples_by_stratum returned 1 sample
  [PASS] get_evidence_by_claim returned 1 evidence link
  [PASS] Site subgraph contains site record
  [PASS] Site subgraph contains strata array
  [PASS] Site subgraph contains claims array
  [PASS] Stratum subgraph contains stratum record
  [PASS] Stratum subgraph contains parent site
  [PASS] Stratum subgraph contains artifacts array
  [PASS] Stratum subgraph contains samples array

[TEST 5B] Schema Migration & Backward Compatibility (Legacy State Without CE Fields)...
  [PASS] Legacy state loaded successfully
  [PASS] Legacy stratum name preserved
  [PASS] Legacy BCE date preserved
  [PASS] New date_start_ce defaulted safely to 0
  [PASS] New date_end_ce defaulted safely to 0
  [PASS] Legacy sample loaded successfully
  [PASS] New date_cal_start_ce defaulted safely to 0
  [PASS] Round-trip save/load preserves legacy record
  [PASS] Round-trip preserves BCE date

[TEST 6A] IPC build_harris_matrix & get_entity_subgraph Endpoints...
  [PASS] IPC build_harris_matrix response has no error
  [PASS] IPC build_harris_matrix is_valid_dag == true
  [PASS] IPC build_harris_matrix sequence length == 2
  [PASS] IPC build_harris_matrix earliest is Stratum X
  [PASS] IPC get_entity_subgraph response has no error
  [PASS] IPC get_entity_subgraph contains stratum
  [PASS] IPC get_entity_subgraph returned correct stratum name

[TEST 6B] IPC query_knowledge_graph Uninitialized Model Failure Path...
  [PASS] IPC query_knowledge_graph surfaces error when model uninitialized
  [PASS] IPC query_knowledge_graph returns error_code == 'MODEL_NOT_INITIALIZED'
  [PASS] Error message explains weights not loaded

[TEST 6C] IPC query_knowledge_graph Compound Join & Site/Stratum Filtering...
  [PASS] Compound query has no error when embedding ready
  [PASS] Compound query returns passages array
  [PASS] Compound query filtered claims to exactly site_hazor
  [PASS] Returned claim is claim_hazor_gate
  [PASS] Querying unrelated site returns zero claims

================================================================================
  ALL HARDENED STRATIGRAPHIC DAG & KNOWLEDGE GRAPH TESTS PASSED (100%)!         
================================================================================
```

### Breakdown of Assertions by Sub-Suite (83 Total)

| Suite | Assertions | Focus Area |
| :--- | :---: | :--- |
| **TEST 1** | 11 | Stratigraphic DAG Construction & Kahn Topological Sequence |
| **TEST 2A** | 4 | Length-3 Cycle Detection (Tarjan SCC) |
| **TEST 2B** | 4 | Length-1 Self-Loop Detection ($A \to A$) & Kahn Abort |
| **TEST 2C** | 3 | Length-2 Mutual Cycle Detection ($A \leftrightarrow B$) |
| **TEST 2D** | 3 | Disconnected Multi-Cycle Isolation |
| **TEST 3A** | 6 | BCE Law of Superposition Inversion (Advisory Warning) |
| **TEST 3B** | 5 | Astronomical Year $1\text{ BCE} / 1\text{ CE}$ Boundary (Zero-Year Trap Defense) |
| **TEST 3C** | 2 | Common Era (CE) Superposition Inversion |
| **TEST 4A** | 1 | Radiometric $C^{14}$ Overlapping $2\sigma$ Calibration Range (No False Positive) |
| **TEST 4B** | 6 | Radiometric $C^{14}$ Strict Non-Overlap (Advisory Review Flag) |
| **TEST 5A** | 14 | Relational Cross-Referencing & Subgraph Assembly |
| **TEST 5B** | 9 | Schema Migration & Backward Compatibility (Legacy State Without CE) |
| **TEST 6A** | 7 | IPC `build_harris_matrix` & `get_entity_subgraph` Bridge Contracts |
| **TEST 6B** | 3 | IPC `query_knowledge_graph` Uninitialized Model Guard (`MODEL_NOT_INITIALIZED`) |
| **TEST 6C** | 5 | IPC `query_knowledge_graph` Compound Join & Site Filtering |
| **Total** | **83** | **15 Sub-Suites, 83 Assertions (100% Pass Rate)** |

---

## 3. Regression Safeguard Audit

1. **Live DOM In-Process UI Test:** `release/ArchaeoPhD.exe --test-ui-live` executed with **9/9 checks PASSED (100%)**.
2. **Binary Footprint:** Statically linked standalone binary size is **9.65 MB**.
3. **Offline Invariant:** Zero external databases, zero background daemons, zero network ports.

---

## 4. Next Steps in Phase 2

- **Step 3:** Quantitative Entity Extraction & Physical Measurement Normalizer.
- **Step 4:** Compound Graph Queries with Locus and Period Filtering in the Desktop UI.
- **Step 5:** Interactive Harris Matrix DAG visualizer in the WebView2 DOM.
