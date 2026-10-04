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

All **25 automated graph and matrix assertions** passed with zero regressions across the existing 72 Phase 1 assertions.

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

The dedicated Phase 2 test suite was compiled and executed:

```text
================================================================================
  ArchaeoPhD Engine — Phase 2: Stratigraphic DAG & Harris Matrix Suite          
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

[TEST 2] Stratigraphic Cycle & Impossible Paradox Detection...
  [PASS] Cyclic sequence identified as NOT a valid DAG
  [PASS] At least 1 cycle isolated by Tarjan SCC
  [PASS] Cycle contains 3 vertices

[TEST 3] Law of Superposition Date Inversion Detection...
  [PASS] Matrix is structurally a DAG
  [PASS] Inversion detected
  [PASS] Inversion flags upper stratum correctly
  [PASS] Inversion flags lower stratum correctly
  [PASS] Inversion reason cites Law of Superposition

[TEST 4] Radiometric C-14 Sample Inversion Cross-Check...
  [PASS] Radiometric inversion detected
  [PASS] Inversion cites C-14 lab code OXA-4022

[TEST 5] Relational Cross-Referencing in NativeStorage...
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

[TEST 6] IPC Dispatcher Phase 2 Graph Endpoints...
  [PASS] IPC build_harris_matrix response has no error
  [PASS] IPC build_harris_matrix is_valid_dag == true
  [PASS] IPC build_harris_matrix sequence length == 2
  [PASS] IPC build_harris_matrix earliest is Stratum X
  [PASS] IPC get_entity_subgraph response has no error
  [PASS] IPC get_entity_subgraph contains stratum
  [PASS] IPC get_entity_subgraph returned correct stratum name
  [PASS] IPC query_knowledge_graph response has no error
  [PASS] IPC query_knowledge_graph result contains passages and claims

================================================================================
  ALL 25 STRATIGRAPHIC DAG & KNOWLEDGE GRAPH TESTS PASSED WITH ZERO FAILURES!   
================================================================================
```

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
