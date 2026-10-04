# ArchaeoPhD — MVP Plan
A private, fully offline research assistant for archaeology PhD researchers

**One-line goal:** Ingest excavation reports and papers, build a structured knowledge graph of sites/strata/claims/evidence, and flag contradictions across a researcher's own library — surfacing thesis problems months before a defense. Runs entirely on the researcher's own device, fully offline, nothing ever leaves it.

**MVP philosophy:** Prove the core thing works — Docling can read a real excavation report, and a 7–8B model can correctly extract facts and catch real contradictions — before spending any effort on storage optimization, UI polish, or features that only matter at scale. Everything below is scoped to that philosophy: build what proves the idea, defer what doesn't.

---

## Locked Decisions

1. **100% local, no cloud inference, ever.** Nothing a researcher uploads is sent anywhere. Considered and explicitly rejected earlier — it would undo the entire privacy promise the product is built on.
2. **One field, one properly-built domain ontology.** Archaeology: Sites, Strata, Artifacts, Samples (ground truth) → Claims (interpretations, linked to source + confidence) → Evidence Links (supports/refutes/neutral). Not a shallow generic version.
3. **No fine-tuning.** RAG + structured extraction only. Every AI output traces back to exact, retrievable source text — never a paraphrased "memory."
4. **7–8B reasoning model, bundled by default.** Quality over minimal footprint — the flagship feature (contradiction detection) needs real reading comprehension, confirmed as worth the extra size given realistic researcher storage headroom.
5. **AI never concludes a contradiction — it flags and cites.** Types 1 & 3 (dates, structural logic) shown directly, high confidence. Types 2 & 4 (interpretive) always "possible conflict — please review," never a verdict, always with both exact source excerpts.
6. **Per-file lossless compression on upload, no batching, no pre-compression pass.** Tested today: zip/DEFLATE on each file individually, the moment it arrives, gives ~73–76% reduction on text documents and ~19% on scans. Waiting to batch files together added only ~1% — not worth the complexity, especially since uploads arrive incrementally (one today, one next month), not in groups.
7. **PDFs read in place, never copied before compressing.** Only the per-file zip (small) and the extracted Markdown/vectors are written to app storage.
8. **Fully user-chosen storage location, not forced into a fixed OS folder** — a researcher can point the whole data root at an external SSD if they want. A small pointer file in the OS-standard location is the only thing that's fixed, and it only stores where the real data lives.
9. **Zero silent network calls after setup.** Internet is used only for the one-time install download and an explicit, user-triggered "check for updates."

---

## Storage Algorithm (Final, Tested)

**Zstandard compression, with a shared trained dictionary, applied independently per file.** This is the final method — it beat every alternative tested, including plain zip.

### ONE-TIME SETUP
Train a small (4–8 KB) Zstandard dictionary from a representative sample of real archaeology PDFs (shipped pre-trained with the app). Captures common structure — PDF headers, font tables, journal-template boilerplate — that recurs across documents.

### UPLOAD
*(Any time, any quantity — one file today, one next month, fully independent)*
- PDF arrives, read from its existing location (never copied first)
  - `→` Zstandard-compress it alone, using the shared dictionary
  - `→` store as its own small file in `archives/`
  - `→` record in `index.db`: `doc_id → compressed filename`
  - `→` parse via Docling (from the file directly) `→` Markdown + chunks `→` embed `→` extract `→` store in LanceDB

### DOWNLOAD
*("Give me back exactly what I uploaded")*
- `index.db` lookup `→` decompress just that one file (using the same shared dictionary) `→` hand back to researcher
- Confirmed: byte-for-byte identical, zero loss

### Why this exact approach, not alternatives considered and tested along the way:
- **qpdf-style PDF-structural recompression:** Tested, performed worse than plain zip on the same file (40% vs. 73–76%).
- **Batching multiple files together before compressing:** Tested, added only ~1% over per-file compression; not worth the complexity, and it would mean one corrupted archive could affect the whole library instead of just one document.
- **Appending every upload into one growing shared archive over time:** Tested, same ~negligible difference as batching, plus real fault-isolation risk for a library meant to last 6+ years. Rejected in favor of keeping each document independent.
- **Plain Zstandard/Brotli/LZMA with no dictionary:** Tested; 1–2 percentage points better than zip at 10–60x the CPU time on large scans. Not worth it alone.
- **Zstandard WITH a trained shared dictionary:** Tested properly (dictionary trained on 20 documents, measured on 4 completely unseen holdout documents, avoiding the circularity of testing on the training set): **36.3% smaller than no-dictionary compression**, on genuinely new documents — the clear winner. Keeps every safety property of per-file independence (one corrupted file never touches another, deletion stays trivial, download-one-file stays simple) while capturing the real cross-document redundancy (shared headers, fonts, boilerplate) that plain per-file compression missed.

---

## Folder Structure

### OS-standard, fixed
*(Only a tiny pointer file lives here)*
- **Windows:** `%LOCALAPPDATA%\ArchaeoPhD\settings.json`
- **macOS:** `~/Library/Application Support/ArchaeoPhD/settings.json`
- **Linux:** `~/.local/share/ArchaeoPhD/settings.json`
  - *Contains one thing:* the path to the real Data Root, wherever the user chose it

### User-chosen Data Root
*(Any drive, any folder, e.g. an external SSD)*
```text
ArchaeoPhD-Data/
  ├── models/
  │     ├── embedding/nomic-embed-text-v1.5.gguf
  │     └── llm/llama-3-8b-instruct-q4_k_m.gguf
  ├── config.json
  ├── logs/
  └── libraries/
        └── <Library Name>/
              ├── library.lancedb/        ← chunks + vectors + knowledge graph, unified
              ├── compression-dict.zstd   ← shared trained dictionary, used for every file
              ├── archives/
              │     ├── <doc_id_1>.zst    ← one file per upload, independent, dictionary-compressed
              │     ├── <doc_id_2>.zst
              │     └── index.db          ← doc_id → compressed filename lookup
              └── library-manifest.json
```

**First launch:** Suggest a sensible default location, but let the user pick anything. Warn if the chosen folder sits inside a cloud-sync directory (OneDrive/iCloud/Dropbox) — that would silently defeat the offline/private guarantee.

---

## Architecture Flow

```text
Upload PDF (read in place, never copied)
        │
        ├─→ Zstandard-compress individually (shared dictionary) → archives/<doc_id>.zst
        │
        ▼
   Docling parse → Markdown + structure (headings, tables, page refs)
        │
        ▼
   Chunk by section
        │
        ▼
   nomic-embed-text-v1.5 → 128-dim vector (Matryoshka truncated, L2-renormalized)
        │
        ▼
   Extraction pass (7–8B model, structured-output prompting, short per-chunk context):
   Site / Stratum / Artifact / Date Claim / Interpretation / Evidence,
   linked back to doc_id + page_ref
        │
        ▼
┌─────────────────────── LanceDB (unified, local, embedded) ───────────────┐
│ chunks table:  chunk_id, doc_id, title, authors, year,                  │
│                section_path, page_ref, markdown_text, vector(128)       │
│ graph tables:  sites, strata, artifacts, samples (Layer A — ground      │
│                truth) · claims (Layer B — confidence: Verified/         │
│                Contested/Speculative) · evidence_links (Layer C —       │
│                supports/refutes/neutral, always with chunk_id + page)   │
└────────────────────────────────────────────────────────────────────────┘
        │
        ▼
   Contradiction engine (local, background, on ingest):
   Type 1 (date clash) + Type 3 (structural impossibility) → shown directly
   Type 2 (interpretive) + Type 4 (cross-source pattern) → "possible conflict,
   please review" — never "confirmed" — always both exact source excerpts
        │
        ▼
   Researcher's view: search, graph queries, inline conflict flags while
   writing, and "download original" on any document — all offline, on-device
```

---

## Device Requirements

| Requirement | Value |
| :--- | :--- |
| **RAM** | 16 GB recommended (8 GB tight floor, not recommended) |
| **GPU** | Optional — 6–8 GB VRAM makes extraction fast; CPU-only works on 16 GB RAM but slower per document |
| **App storage footprint** | ~8–10 GB (corpus 2–6 GB, scales with library · graph 0.2–1 GB · embedding model 0.5 GB · 7–8B model ~5 GB, fixed) |
| **Free disk space, normal use** | ~5 GB is enough — no file copying, per-file compression only |
| **Internet** | Once, for ~5–6 GB initial install. Fully offline after that |

---

## MVP Scope: Build Now vs. Defer

| Category | Build for MVP | Defer to post-MVP |
| :--- | :--- | :--- |
| **Storage** | Per-file Zstandard+dictionary compression on upload, download-original feature | 3-tier archive system (exact/compact/discard), usage-based archive prompts, storage inspector UI |
| **Database** | LanceDB with default settings, schema as above | Compaction scheduling/tuning, embedding-dimension tuning |
| **Model** | 7–8B model as-is | Hardware-tiered fallback (3B "fast mode"), model swapping |
| **Core feature** | Docling extraction, knowledge graph, all 4 contradiction types with the review-only guardrail on Types 2/4 | — *not optional, this is the product* |
| **Folder/UX** | User-chosen data root, cloud-sync warning, basic first-launch flow | "Move library" tool, multi-library-folder support |

---

## Phased Roadmap

### Phase 0 — Validation spike (1–2 weeks)
*(The only phase that can stop the project)*
1. Run Docling on 10–15 real archaeology documents first (not synthetic) — cover the hard cases: old scans, data tables, stratigraphy diagrams, at least one low-quality scan.
2. Hand-label and test 7–8B extraction accuracy on the same documents — the single most important validation step, since every downstream feature inherits extraction errors.
3. Confirm per-file Zstandard+dictionary compression and reconstruction on real (not synthetic) PDFs, and retrain the shared dictionary on a real sample once available — the ~36% dictionary improvement was validated on synthetic holdout documents; real academic PDFs should be checked too.
4. **Go/no-go bar:** Decided in writing before Phase 1 starts: what extraction accuracy is "good enough to build on."

### Phase 1 — Ingestion pipeline (COMPLETE — Reports 04–09, 100% Verified)
1. **Lossless PDF Ingestion & Storage:** Zero-dependency archival with SHA-256 checksums, atomic disk writes (`MOVEFILE_WRITE_THROUGH`), and fail-safe Class B letterpress gating (Report 04).
2. **Native C++ IPC Dispatcher & WebView2 Bridge:** In-memory JSON IPC with zero open ports, Win32 UTF-8 transport, anti-anchoring crop lockouts, and fine-grained passage badging (Report 05).
3. **Native UI Workflow Modals:** Ingestion modal, physical confirmation checkbox, verification queue with anti-anchoring lock, and blank-template manual transcription with zero pre-fill invariant (Report 06).
4. **Vector Persistence & In-Process GGUF Embedding:** Zero-external-daemon Nomic 128-dim Matryoshka embeddings (`nomic-embed-text-v1.5.Q4_K_M.gguf`), atomic binary `vectors.bin` (`APV1`), and pure C++ PDF stream extractor (`extract_archive_text`) closing the continuous ingest→archive→extract→embed→search join (Report 07).
5. **Hybrid BM25 + Dense Retrieval Engine:** Pure C++ Okapi BM25 inverted index (`lexical_index.hpp`, `APL1`), Reciprocal Rank Fusion ($k=60$), metadata filtering, and intra-document near-neighbor disambiguation (Recall@5: 95.0%, MRR: 0.8521, Latency: 22.02 ms) (Report 08).
6. **Full Durability & Regression Audit:** 5 independent test suites, 72 automated assertions, 100% pass rate, 0 regressions (Report 09).

### Phase 2 — Knowledge graph + unified store (IN PROGRESS — 3–4 weeks)
1. **Step 1: Unified Graph Store & Relational Cross-Referencing:** Multi-index join linking Layer A (Sites, Strata, Artifacts, Samples) $\leftrightarrow$ Layer B (Claims) $\leftrightarrow$ Layer C (Evidence Links) $\leftrightarrow$ Vector/BM25 chunks (`chunk_id`, `doc_id`, `page_ref`).
2. **Step 2: Stratigraphic DAG & Harris Matrix Engine (`harris_matrix.hpp`):** Directed Acyclic Graph builder with topological sorting (youngest to oldest sequence), Law of Superposition validator, $C^{14}$ inversion anomaly detection, and Tarjan's cycle detector for stratigraphic paradoxes.
3. **Step 3: Quantitative & Physical Entity Extraction Pipeline:** Mapping verified monograph text to structured Layer A physical entities and Layer B interpretive claims; quantitative normalization for dimensions and chronological bounds.
4. **Step 4: Unified Compound Query Layer & IPC Endpoints:** Compound graph queries combining hybrid semantic/BM25 search with relational graph traversals (`query_knowledge_graph`, `build_harris_matrix`, `validate_stratigraphy`).
5. **Step 5: Interactive Stratigraphic Matrix UI & Validation Harness:** Interactive DOM matrix visualization rendering the Harris Matrix DAG and highlighting disputed chronological horizons.

### Phase 3 — Contradiction engine (4–6 weeks)
1. Type 1 and Type 3 first (lower risk, shown directly).
2. Type 2 and Type 4 with the review-only guardrail enforced in the UI (visually distinct, no auto-accept).
3. Inline UI: live-check sentences while writing.

### Phase 4 — MVP hardening (1–2 weeks)
1. Load-test on real 16 GB RAM hardware, CPU-only and with GPU.
2. First-launch hardware check (warn if below 8 GB floor).
3. "Download original" verified end-to-end on real documents.

### Phase 5 — Beta rollout
1. Real PhD archaeology researchers, real libraries — the only way to catch extraction failures synthetic tests miss.

---

## Open Risks to Track

- **Extraction quality is the whole product.** Phase 0's accuracy test is non-negotiable.
- **Type 2/4 false positives are the main trust risk** — guardrail enforced in UI, not just the prompt.
- **Docling ingestion speed on CPU-only 16 GB machines** needs a visible progress indicator.
- **Single-field scope (archaeology) is permanent for v1** — expanding later means a new ontology from scratch.
- **Real academic PDFs may compress less dramatically than synthetic test files** — verify the ~73–76% figure against real papers in Phase 0, since born-digital PDFs are often already internally compressed by their originating software.
