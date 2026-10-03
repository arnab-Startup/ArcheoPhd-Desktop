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

### UPLOAD
*(Any time, any quantity — one file today, one next month, fully independent)*
- PDF arrives, read from its existing location (never copied first)
  - `→` zip-compress it alone, immediately, DEFLATE level 6 (fast, same ratio as level 9 on real files)
  - `→` store as its own small `.zip` in `archives/`
  - `→` record in `index.db`: `doc_id → zip filename`
  - `→` parse via Docling (from the file directly) `→` Markdown + chunks `→` embed `→` extract `→` store in LanceDB

### DOWNLOAD
*("Give me back exactly what I uploaded")*
- `index.db` lookup `→` unzip just that one file `→` hand back to researcher
- Confirmed today: byte-for-byte identical (SHA-256 hash match), zero loss

### Why this exact approach, not alternatives considered and rejected:
- **qpdf-style PDF-structural recompression:** Tested, performed worse than plain zip on the same file (40% vs. 73–76%).
- **Batching multiple files together before zipping:** Tested, added only ~1% over per-file compression; not worth the added complexity given incremental upload patterns.
- **Newer algorithms (Zstandard, Brotli, LZMA):** Tested; 1–2 percentage points better at 10–60x the CPU time on large scans. Not worth it for MVP. Zstandard at a fast/low level is a cheap future upgrade if ingestion speed ever becomes a bottleneck — same ratio as zip, ~17x faster — worth remembering, not needed now.

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
              ├── archives/
              │     ├── <doc_id_1>.zip    ← one file per upload, independent
              │     ├── <doc_id_2>.zip
              │     └── index.db          ← doc_id → zip filename lookup
              └── library-manifest.json
```

**First launch:** Suggest a sensible default location, but let the user pick anything. Warn if the chosen folder sits inside a cloud-sync directory (OneDrive/iCloud/Dropbox) — that would silently defeat the offline/private guarantee.

---

## Architecture Flow

```text
Upload PDF (read in place, never copied)
        │
        ├─→ zip-compress individually, immediately → archives/<doc_id>.zip
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
| **Storage** | Per-file lossless zip on upload, download-original feature | 3-tier archive system (exact/compact/discard), usage-based archive prompts, storage inspector UI |
| **Database** | LanceDB with default settings, schema as above | Compaction scheduling/tuning, embedding-dimension tuning |
| **Model** | 7–8B model as-is | Hardware-tiered fallback (3B "fast mode"), model swapping |
| **Core feature** | Docling extraction, knowledge graph, all 4 contradiction types with review-only guardrail on Types 2/4 | — *not optional, this is the product* |
| **Folder/UX** | User-chosen data root, cloud-sync warning, basic first-launch flow | "Move library" tool, multi-library-folder support |

---

## Phased Roadmap

### Phase 0 — Validation spike (1–2 weeks)
*(The only phase that can stop the project)*
1. Run Docling on 10–15 real archaeology documents first (not synthetic) — cover the hard cases: old scans, data tables, stratigraphy diagrams, at least one low-quality scan.
2. Hand-label and test 7–8B extraction accuracy on the same documents — the single most important validation step, since every downstream feature inherits extraction errors.
3. Confirm per-file zip compression and reconstruction on real (not synthetic) PDFs.
4. **Go/no-go bar:** Decided in writing before Phase 1 starts: what extraction accuracy is "good enough to build on."

### Phase 1 — Ingestion pipeline (4–5 weeks)
1. Docling behind a background job queue, reading files in place; PyMuPDF fallback for parse failures.
2. Per-file zip compression + `index.db`, exactly as tested.
3. Chunk by section; extraction pass with structured-output prompting (fixed schema).
4. First-launch flow: data root selection, cloud-sync warning, model download.

### Phase 2 — Knowledge graph + unified store (3–4 weeks)
1. LanceDB chunks + graph tables (Layer A/B/C), cross-referenced by `chunk_id`/`doc_id`/`page_ref`.
2. Query layer: semantic search + structured graph queries.

### Phase 3 — Contradiction engine (4–6 weeks)
1. Type 1 and Type 3 first (lower risk, shown directly).
2. Type 2 and Type 4 with review-only guardrail enforced in UI (visually distinct, no auto-accept).
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
- **Real academic PDFs may compress less dramatically than synthetic test files** — verify the ~73–76% figure against real papers in Phase 0.
