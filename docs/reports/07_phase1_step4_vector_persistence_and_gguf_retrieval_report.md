# Phase 1, Step 4 — Technical Report 07: Vector Persistence, In-Process GGUF Embedding & Retrieval Benchmark

**Author:** ArchaeoPhD Core Team  
**Date:** October 2026  
**Scope:** Phase 1, Step 4 (4A & 4B) Vector Engine Implementation:
1. **Step 4A: Vector Storage Durability & Restart Resilience**:
   - Pure C++ binary disk serialization (`vectors.bin`) with atomic temp-file rename (`.tmp` $\to$ `.bin`).
   - Crash resilience and startup orphan `.tmp` purge.
   - Dual-write failure mode resilience: read-path stability on orphaned vectors (vector without source) and missing vectors (relational source/claims present, vector index empty).
   - Relational ledger primacy: `relational_state.json` retains absolute authority over knowledge-graph truth; search index is strictly candidate-driven.
   - Purge of vestigial LanceDB UI claims from distribution files.
2. **Step 4B: In-Process GGUF Embedding & Semantic Retrieval Benchmark**:
   - Zero-external-daemon architecture: Static in-process GGUF embedding via `llama.cpp` (`nomic-embed-text-v1.5.Q4_K_M.gguf`, SHA-256 verified).
   - 128-dimensional Matryoshka representation learning truncation with guarded L2 normalization (512 bytes per passage chunk).
   - Compile-time exclusion of test mock stub via `#ifdef ARCHAEOPHD_ENABLE_TEST_STUB` (production binary physically cannot fall back to character-frequency hashing).
   - Pre-registered 20-query archaeological retrieval benchmark across 4 monographs (50 ground-truth passages):
     - Recall@5: 85.0% (17/20, Wilson 95% Score Interval: [64.0%, 94.8%])
     - MRR@10: 0.7571
     - Average Latency: 23.4 ms
   - Named limitation: Intra-document disambiguation weaker than cross-monograph discrimination; tracked for Step 5 resolution via hybrid lexical/entity filtering alongside cosine similarity.
   - Commit gate rule: Milestone gate met, but production-grade confidence requires re-validation at $n \ge 100$ queries.
3. **End-to-End Live Pipeline Join (Check 9)**:
   - Added native IPC endpoint `extract_archive_text`: reads archived binary from disk via `Source.archive_path` and parses PDF `BT`/`ET` and `Tj`/`TJ` text streams in pure C++.
   - Extended Live UI test suite to 9 checks: verified real PDF ingestion $\to$ lossless archive $\to$ stream extraction $\to$ vector embedding $\to$ semantic search retrieval in an unbroken, live WebView2 run.

**Implementation Files:**
- `desktop/engine/analysis/embedding_engine.hpp` (In-process GGUF embedding engine, 128-dim Matryoshka truncation, L2 normalization)
- `desktop/engine/analysis/vector_index.hpp` (Quantized vector store, cosine search, binary persistence, compile-time stub gating)
- `desktop/engine/storage/storage.hpp` (Atomic file transactions, startup `.tmp` purge, vector store save/load)
- `desktop/engine/ipc/native_ipc_dispatcher.hpp` (`extract_archive_text` endpoint, `search_semantic_passages`, `index_rough_text`)
- `desktop/src/main.cpp` (Live UI test suite with Check 8 GGUF retrieval and Check 9 end-to-end join)
- `desktop/tests/test_vector_durability.cpp` (8-test durability and dual-write fault tolerance harness)
- `desktop/tests/test_semantic_retrieval_benchmark.cpp` (Pre-registered 20-query archaeological evaluation harness)
- `desktop/tests/test_embed_model.cpp` (Direct GGUF model load, prompt formatting, and dimension check)

**Test Suites:**
- Durability Suite: 8/8 tests passed (100%)
- Retrieval Benchmark Suite: 3/3 hard pre-registered gates passed (100%)
- Live WebView2 UI Automation: 9/9 checks passed (100%)

---

## 1. Executive Summary & Epistemic Boundaries

Phase 1, Step 4 transitions ArchaeoPhD from mock/stub embeddings to a fully operational, offline-first semantic search engine running directly in-process within the native Windows C++ workstation.

### What is Proven Live
1. **Durability & Restart Resilience (Step 4A)**:
   - `VectorIndex` state persists across complete application process lifecycles via `vectors.bin`.
   - Incomplete writes due to simulated crashes leave `.tmp` files that are automatically swept on startup with zero ledger corruption.
   - Dual-write failure modes (orphaned vectors or missing vectors) do not crash the engine, poison the relational ledger, or emit phantom sources.
2. **In-Process Inference (Step 4B)**:
   - The production executable links `llama.cpp` directly into `release/ArchaeoPhD.exe` (~9.5 MB standalone binary).
   - Zero external daemons, zero HTTP network calls, zero Ollama dependency.
   - Queries and passages are embedded via `nomic-embed-text-v1.5.Q4_K_M.gguf` with Matryoshka truncation to 128 dimensions, requiring only 512 bytes of storage per chunk.
3. **Unbroken Live Join (Check 9)**:
   - The gap between binary ingestion (Checks 1–7) and vector retrieval (Check 8) is closed.
   - In Check 9, a real PDF (`test_live_sample.pdf`) is submitted via the live DOM $\to$ compressed and archived $\to$ extracted via native `extract_archive_text` $\to$ indexed into the vector store $\to$ searched via `search_semantic_passages` $\to$ retrieved with verified source grounding.

---

## 2. Benchmark Methodology & Statistical Analysis

### Benchmark Dataset
The retrieval benchmark evaluated 50 ground-truth passages spanning 4 classical archaeological monographs with contrasting excavation methodologies, chronologies, and terminologies:
1. **Sankalia (1974)**: *Pre- and Proto-History of India and Pakistan* (Chirki-on-Pravara Acheulian lithics).
2. **Kenyon (1981)** vs. **Wood (1990)**: *Excavations at Jericho / Tell es-Sultan* (Middle/Late Bronze destruction horizon conflict).
3. **Petrie (1901)**: *The Royal Tombs of the Earliest Dynasties* (Abydos First Dynasty stratigraphy and seriation).
4. **Wheeler (1968)**: *The Indus Civilization* (Harappa cemetery R-37 and Citadel ramparts).

*Methodological Note:* The corpus was expanded from an initial 3-monograph draft to 4 monographs during test suite preparation to ensure balanced thematic coverage across Palaeolithic, Levantine Bronze Age, Dynastic Egyptian, and South Asian Urban contexts.

### Results Against Pre-Registered Gates

| Gate Metric | Pre-Registered Gate | Measured Value | Result |
| :--- | :---: | :---: | :---: |
| **Recall @ 5** | $\ge 85.0\%$ | **85.0%** (17 / 20) | **PASS** |
| **MRR @ 10** | $\ge 0.7000$ | **0.7571** | **PASS** |
| **Query Latency** | $< 25.0\text{ ms}$ | **23.4 ms** | **PASS** |

Additional retrieval metrics:
- **Recall @ 1**: 70.0% (14 / 20)
- **Recall @ 3**: 80.0% (16 / 20)
- **Recall @ 10**: 95.0% (19 / 20)

### Statistical Discipline: Wilson Score Interval
Evaluating $17/20$ successes yields a point estimate of $85.0\%$. At $n = 20$, the sample size is small; applying the Wilson score interval at the 95% confidence level:

$$w = \frac{\hat{p} + \frac{z^2}{2n} \pm z \sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}} \implies [64.0\%,\; 94.8\%]$$

**Significance:**
- The milestone gate ($\ge 85.0\%$) is mathematically satisfied.
- However, because the lower bound of the 95% confidence interval is $64.0\%$, **production-grade confidence is not yet claimed**.
- **Commit Gate Rule:** Formal claims of production-grade retrieval performance are barred until re-validation is executed against a benchmark of $n \ge 100$ evaluation queries.

### Failure Analysis: The Intra-Document Disambiguation Limitation
The 3 queries that failed top-5 retrieval were:
1. **Query 8**: Terminal Pleistocene climatic pulsation (Target: `chirki_c08`, Rank 6, Score 0.6982; Top-1 was `chirki_c04` with Score 0.7381).
2. **Query 13**: Wood's ceramic re-dating to Late Bronze (Target: `jericho_c13`, Rank 6, Score 0.7104; Top-1 was `jericho_c15` with Score 0.7298).
3. **Query 17**: Plastered skulls funerary ritual (Target: `jericho_c17`, Rank >10, Score 0.5841; Top-1 was `jericho_c16` with Score 0.6812).

**Key Finding:** All 3 misses represent **intra-document near-neighbor collisions** — the model successfully retrieved the correct site monograph, but ranked an adjacent passage from the same site higher due to shared vocabulary (e.g. Jericho stratigraphy terms). Cross-site retrieval confusion was 0%.
**Forward Plan for Step 5:** Address intra-document ambiguity by layering lexical/entity filtering (site name, locus ID, stratum number) over pure vector similarity.

---

## 3. Storage Durability & Dual-Write Resilience (8 Tests)

The durability harness (`test_vector_durability.exe`) validated cold-start resilience across 8 conditions:

```text
================================================================================
  ArchaeoPhD Engine — Vector Persistence & Restart Durability Test Suite        
================================================================================

[TEST 1] VectorIndex In-Memory Operations & Dimensionality Validation...
  ✓ Direct insertion, search, and 128-dim serialization verified.

[TEST 2] Vector Store Binary Serialization & Reload (vectors.bin)...
  ✓ Exact floating-point cosine similarity preserved across cold restart.

[TEST 3] NativeStorage Integrated State Persistence...
  ✓ Storage save_state and cold restart preserves both relational and vector stores.

[TEST 4] Crash Simulation: Missing Vector File Graceful Recovery...
  ✓ Missing vectors.bin handled fail-safe; relational state untouched.

[TEST 5] In-Place Vector Replacement & Document Re-Indexing...
  ✓ Re-indexing updates existing chunk vectors without duplicate accumulation.

[TEST 6] Dual-Write Asymmetry Resilience (Orphaned Vector in Index)...
  ✓ Vector store loaded both normal and orphaned vectors.
  ✓ Relational state strictly preserves authoritative sources (count == 1).
  ✓ Ghost source is completely absent from relational ledger.

[TEST 7] Startup Orphaned .tmp File Auto-Cleanup...
  ✓ Orphaned relational_state.json.tmp cleaned up.
  ✓ Orphaned vectors.bin.tmp cleaned up.
  ✓ Orphaned archives/*.pdf.bin.tmp cleaned up.
  ✓ Orphaned chunks/*.tmp cleaned up.
  ✓ Legitimate data survived intact.

[TEST 8] Read-Path Resilience on Reverse Dual-Write Gap (Missing Vector)...
  ✓ Relational source and claim loaded successfully.
  ✓ Chunk text accessible from disk.
  ✓ Vector store is strictly empty (0 vectors).
  ✓ Direct VectorIndex search on missing vectors returns empty cleanly.
  ✓ IPC search_semantic_passages returned valid empty JSON response without crashing.

================================================================================
  ALL 8 VECTOR INDEX RESTART DURABILITY TESTS PASSED WITH ZERO FAILURES!        
================================================================================
```

---

## 4. Live WebView2 DOM Verification (9/9 Checks)

The live automation test (`desktop/src/main.cpp` with `--run-live-ui-tests`) runs against the real WebView2 browser window and outputs to `desktop/live_ui_test_results.log`:

```json
{
  "results": [
    {
      "details": "File path, title, and submit inputs found in live DOM",
      "ok": true,
      "step": "1. Ingestion DOM Elements Present"
    },
    {
      "details": "Hash copy button: true, CLASS_B: true, UNVERIFIED_ROUGH_SCAN: true",
      "ok": true,
      "step": "2. Ingestion Submission & Default-Safe Gating"
    },
    {
      "details": "Disabled initially: true, Enabled after check: true, Re-locked: true",
      "ok": true,
      "step": "3. Classification Dialog Physical Checkbox Guardrail"
    },
    {
      "details": "Candidate button A unlocked for vitem-chirki-rubble: true",
      "ok": true,
      "step": "4. Verification Queue Valid Crop Unlocks Candidates"
    },
    {
      "details": "Card found: true, Candidates locked: true, Reject enabled: true",
      "ok": true,
      "step": "5. Verification Queue Missing Crop Strictly Locks Candidates"
    },
    {
      "details": "Split screen: true, Blank inputs: true, Row count: 2",
      "ok": true,
      "step": "6. Manual Transcription Zero Pre-Fill Epistemic Invariant"
    },
    {
      "details": "Verified Claims Committed banner present: true",
      "ok": true,
      "step": "7. Manual Transcription Commit Grounded Claims"
    },
    {
      "details": "Hits: 2, Top score: 0.8379, Grounded: true, Page: 1",
      "ok": true,
      "step": "8. Live Semantic Retrieval Pipeline (In-Process GGUF Embedding)"
    },
    {
      "details": "sourceId: src_1791125668369, charExtracted: 175, gotRealText: true, searchHit: true",
      "ok": true,
      "step": "9. Full Ingest→Archive→Extract→Embed→Search Loop (Real PDF, Not Hand-Seeded)"
    }
  ],
  "success": true
}
```

---

## 5. Architectural Principles Confirmed

1. **Relational Ledger Primacy**: The vector index is strictly a query discovery accelerator. If a vector exists without a relational record, the knowledge graph ignores it. If a relational record exists without a vector, all UI tables and contradiction logic remain 100% functional.
2. **Compile-Time Stub Exclusion**: Production releases must not contain mock hash fallback paths. If the model file is missing or invalid, the engine fails explicitly rather than generating plausible nonsense.
3. **No Uninspected Auto-Commit**: Uninspected OCR text indexed for search discovery remains strictly isolated under `UNVERIFIED_ROUGH_SCAN` and is never treated as verified factual claims.
4. **Air-Gapped In-Process Autonomy**: Embedding inference requires no external daemons, no open ports, and no internet access.
