# ArchaeoPhD — Backend Build Plan

> **Rule:** One step at a time. Finish → verify → next.  
> **Stack:** Local only. No cloud DB, no cloud AI.

---

## Master Status Table

| # | Feature | Experiment | MVP | Optimization |
|---|---------|:----------:|:---:|:------------:|
| F1 | Data Storage & Compression | ✅ DONE | ✅ DONE | 🔜 NEXT |
| F2 | PDF Ingestion | 🔜 NEXT | ⏳ | ⏳ |
| F3 | Text Chunking | ⏳ | ⏳ | ⏳ |
| F4 | Vector Embeddings | ⏳ | ⏳ | ⏳ |
| F5 | Semantic Search | ⏳ | ⏳ | ⏳ |
| F6 | Local AI / RAG | ⏳ | ⏳ | ⏳ |
| F7 | Contradiction Detection | ⏳ | ⏳ | ⏳ |
| F8 | Harris Matrix & Stratigraphy | ⏳ | ⏳ | ⏳ |
| F9 | Chronology Engine | ⏳ | ⏳ | ⏳ |
| F10 | Geographic & Map | ⏳ | ⏳ | ⏳ |
| F11 | Evidence & Literature Graph | ⏳ | ⏳ | ⏳ |
| F12 | Thesis Writing Assistant | ⏳ | ⏳ | ⏳ |
| F13 | Export Engine | ⏳ | ⏳ | ⏳ |
| F14 | Research Analytics | ⏳ | ⏳ | ⏳ |
| F15 | Auth, Projects & Settings | ⏳ | ⏳ | ⏳ |

---

## Core Architecture: User-Chosen Data Root System

> **Philosophy:** One user-chosen root folder — nothing hard-restricted. Researchers choose where models and multi-GB libraries live (NVMe, D:\, external SSD).

### 1. Data Root Hierarchy
```text
[User-chosen Data Root — e.g. D:\ArchaeoPhD-Data, or external SSD]
ArchaeoPhD-Data/
  ├── models/
  │     ├── embedding/nomic-embed-text-v1.5.gguf
  │     └── llm/llama-3-8b-instruct-q4_k_m.gguf
  ├── config.json
  ├── logs/
  └── libraries/
        └── <Library Name>/
              ├── library.lancedb/
              ├── archives/
              │     ├── batch_2026-01-05.zip
              │     └── index.db
              └── library-manifest.json
```

### 2. First-Launch Flow
1. **Suggest Default**: Prompt with standard OS path (`%LOCALAPPDATA%\ArchaeoPhD\data`), allowing casual users to 1-click proceed.
2. **Free Choice**: Allow picking any directory/drive (D:\, secondary NVMe, external portable SSD).
3. **OS Pointer**: The app writes a single tiny JSON file at the fixed OS location (`%LOCALAPPDATA%\ArchaeoPhD\settings.json`):
   ```json
   { "data_root": "D:\\ArchaeoPhD-Data" }
   ```

### 3. Critical Safeguards & Resilience
* **Cloud-Sync Leakage Warning**: Check the chosen path against known cloud sync roots (OneDrive, Dropbox, iCloud Drive, Google Drive). If detected, display a prominent warning to protect research privacy and avoid silent multi-GB uploads.
* **Missing Root Detection**: If an external SSD is unplugged, detect the missing root on launch and display a clean reconnect prompt instead of crashing or writing to a fallback drive.

---

## F1 — Data Storage & Compression

| Phase | Step | Technique | Goal | Status |
|-------|------|-----------|------|:------:|
| Experiment | 1.1.1 | zlib / gzip | Compress text — measure ratio + speed | ✅ DONE (96.6% ratio) |
| Experiment | 1.1.2 | LZ4 | Fastest decompress, lower ratio | ✅ DONE (0.12ms decompress) |
| Experiment | 1.1.3 | Zstandard (zstd) | Best balance across levels 1, 3, 7 | ✅ DONE (97.3% ratio) |
| Experiment | 1.1.4 | Float16 quantization | Shrink float32 vectors to float16 | ✅ DONE (50% RAM savings, 100% recall) |
| Experiment | 1.1.5 | Int8 quantization | Shrink vectors to int8, measure accuracy loss | ✅ DONE (74.7% RAM savings, 100% recall) |
| Experiment | 1.1.6 | Product Quantization (PQ) | 8–32× smaller vectors (FAISS-style) | ✅ DONE (98.9% RAM savings) |
| Experiment | 1.1.7 | **Pick winner** | Best per data type: text vs vectors | ✅ **DECIDED (Text: Zstd L3; Vec: Int8)** |
| MVP | 1.2.1 | Text storage | Compressed local file store for text chunks (`.zst`) | ✅ DONE |
| MVP | 1.2.2 | Vector storage | Compressed vector file store (`.qvec`) | ✅ DONE |
| MVP | 1.2.3 | Read/write API | Transparent compress/decompress layer | ✅ DONE |
| Optimization | 1.3.1 | Memory-mapped files | Zero-copy reads | ⏳ |
| Optimization | 1.3.2 | Append-only writes | No full rewrite on update | ⏳ |
| Optimization | 1.3.3 | Benchmarks | Size, RAM, read speed final report | ⏳ |

---

## F2 — PDF Ingestion

| Phase | Step | Technique | Goal | Status |
|-------|------|-----------|------|--------|
| Experiment | 2.1.1 | pdfplumber | Tables, text layout, page detection | ⏳ |
| Experiment | 2.1.2 | PyMuPDF (fitz) | Speed, annotations, edge cases | ⏳ |
| Experiment | 2.1.3 | pdfminer.six | Layout accuracy, footnotes | ⏳ |
| Experiment | 2.1.4 | Tesseract OCR | Scanned old excavation reports | ⏳ |
| Experiment | 2.1.5 | **Pick winner** | Best on real archaeology PDFs | ⏳ |
| MVP | 2.2.1 | Upload pipeline | Lossless PDF preservation (.pdf.zst, reversible) → extract chunks | ✅ DONE |
| MVP | 2.2.2 | Page tracking | Page number & count per document | ✅ DONE |
| MVP | 2.2.3 | Multi-language | German, French, Arabic documents | ⏳ |
| Optimization | 2.3.1 | Async processing | Don't block UI on large PDFs | ⏳ |
| Optimization | 2.3.2 | Table extraction | Tables → structured data | ⏳ |
| Optimization | 2.3.3 | Caption extraction | Figure/image captions | ⏳ |

---

## F3 — Text Chunking

| Phase | Step | Strategy | Goal | Status |
|-------|------|----------|------|--------|
| Experiment | 3.1.1 | Fixed-size (256/512/1024 tokens) | Simple baseline | ⏳ |
| Experiment | 3.1.2 | Sentence-aware with overlap | Better semantic boundaries | ⏳ |
| Experiment | 3.1.3 | Paragraph-based | Natural document structure | ⏳ |
| Experiment | 3.1.4 | Semantic chunking | Split at topic changes | ⏳ |
| Experiment | 3.1.5 | **Pick winner** | Best retrieval accuracy | ⏳ |
| MVP | 3.2.1 | Chunker module | Text → chunks + (page, position, doc_id) | ⏳ |
| MVP | 3.2.2 | Compressed storage | Chunks stored with source reference | ⏳ |
| Optimization | 3.3.1 | Deduplication | Remove duplicate chunks | ⏳ |
| Optimization | 3.3.2 | Per-type tuning | Different chunk size per document type | ⏳ |

---

## F4 — Vector Embeddings

| Phase | Step | Model | Size | Goal | Status |
|-------|------|-------|------|------|--------|
| Experiment | 4.1.1 | all-MiniLM-L6-v2 | 22 MB | Tiny, fast baseline | ⏳ |
| Experiment | 4.1.2 | all-mpnet-base-v2 | 420 MB | Higher quality | ⏳ |
| Experiment | 4.1.3 | multilingual-e5-small | 118 MB | Non-English docs | ⏳ |
| Experiment | 4.1.4 | nomic-embed-text | ~270 MB | Strong, Ollama-compatible | ⏳ |
| Experiment | 4.1.5 | **Pick winner** | RAM vs accuracy for archaeology | ⏳ |
| MVP | 4.2.1 | Embed on ingest | Chunks → vectors on upload | ⏳ |
| MVP | 4.2.2 | Compressed storage | Use F1 winner format | ⏳ |
| MVP | 4.2.3 | Persistent model | Load once, stay in memory | ⏳ |
| Optimization | 4.3.1 | Batch embedding | Speed up large document sets | ⏳ |
| Optimization | 4.3.2 | Embedding cache | Skip already-embedded chunks | ⏳ |
| Optimization | 4.3.3 | Quantize | Apply F1 vector quantization | ⏳ |

---

## F5 — Semantic Search (Vector Search)

| Phase | Step | Technique | Goal | Status |
|-------|------|-----------|------|--------|
| Experiment | 5.1.1 | Brute-force cosine | Exact baseline | ⏳ |
| Experiment | 5.1.2 | FAISS Flat | Fast exact search | ⏳ |
| Experiment | 5.1.3 | FAISS IVF | Approximate, good for 10k+ chunks | ⏳ |
| Experiment | 5.1.4 | FAISS HNSW | Best speed/accuracy tradeoff | ⏳ |
| Experiment | 5.1.5 | **Pick winner** | Based on expected dataset size | ⏳ |
| MVP | 5.2.1 | Query endpoint | Text → top-K chunks + source metadata | ⏳ |
| MVP | 5.2.2 | Persist index | No re-index on restart | ⏳ |
| MVP | 5.2.3 | Project scope | Search only within active project | ⏳ |
| Optimization | 5.3.1 | Hybrid search | Vector + BM25 keyword combined | ⏳ |
| Optimization | 5.3.2 | Re-ranking | Improve top-K quality | ⏳ |

---

## F6 — Local AI / RAG (Grounded Answers)

| Phase | Step | Model | RAM | Goal | Status |
|-------|------|-------|-----|------|--------|
| Experiment | 6.1.1 | Ollama + Llama 3.2 (3B) | ~2 GB | Fastest, CPU-friendly | ⏳ |
| Experiment | 6.1.2 | Ollama + Llama 3.1 (8B) | ~5 GB | Better reasoning | ⏳ |
| Experiment | 6.1.3 | Ollama + Mistral (7B) | ~4 GB | Strong for academic text | ⏳ |
| Experiment | 6.1.4 | Ollama + Phi-3 Mini | ~2 GB | Tiny + smart | ⏳ |
| Experiment | 6.1.5 | Grounding prompt | — | Zero-hallucination prompt design | ⏳ |
| Experiment | 6.1.6 | **Pick winner** | — | Best accuracy vs RAM | ⏳ |
| MVP | 6.2.1 | RAG pipeline | Query → chunks → prompt → LLM → answer | ⏳ |
| MVP | 6.2.2 | Citations | Every answer: source title + page number | ⏳ |
| MVP | 6.2.3 | No-context guard | "Cannot answer from your sources" fallback | ⏳ |
| Optimization | 6.3.1 | Conversation memory | Multi-turn Q&A | ⏳ |
| Optimization | 6.3.2 | Confidence scoring | Score per answer | ⏳ |
| Optimization | 6.3.3 | Hallucination guard | Verify citations exist before returning | ⏳ |

---

## F7 — Contradiction Detection

| Phase | Step | Technique | Goal | Status |
|-------|------|-----------|------|--------|
| Experiment | 7.1.1 | Semantic similarity | Low similarity on same topic = contradiction | ⏳ |
| Experiment | 7.1.2 | NLI model | Entails / Neutral / Contradicts classifier | ⏳ |
| Experiment | 7.1.3 | Date/number extraction | Compare dates for same site across sources | ⏳ |
| Experiment | 7.1.4 | LLM judge | "Do these passages contradict? Yes/No + why" | ⏳ |
| Experiment | 7.1.5 | **Pick winner** | Accuracy vs speed | ⏳ |
| MVP | 7.2.1 | Type 1: Chronological | Date conflicts across sources | ⏳ |
| MVP | 7.2.2 | Type 2: Interpretive | Different scholarly interpretations | ⏳ |
| MVP | 7.2.3 | Type 3: Stratigraphic | Layer sequence conflicts | ⏳ |
| MVP | 7.2.4 | Type 4: Cross-site | Contradictions between sites | ⏳ |
| MVP | 7.2.5 | Contradiction report | Claim A vs B, both cited | ⏳ |
| Optimization | 7.3.1 | Severity scoring | CRITICAL / HIGH / MEDIUM / LOW | ⏳ |
| Optimization | 7.3.2 | Resolution guidance | Suggest how to resolve each conflict | ⏳ |

---

## F8 — Harris Matrix & Stratigraphy

| Phase | Step | Goal | Status |
|-------|------|------|--------|
| Experiment | 8.1.1 | DAG algorithm for layer ordering | ⏳ |
| Experiment | 8.1.2 | Cycle detection (impossible stratigraphy) | ⏳ |
| Experiment | 8.1.3 | Topological sort for correct layer sequence | ⏳ |
| MVP | 8.2.1 | Create/edit strata with harris_above/below | ⏳ |
| MVP | 8.2.2 | Validation: no cycles, no orphans | ⏳ |
| MVP | 8.2.3 | API: Harris matrix as graph (nodes + edges) | ⏳ |
| MVP | 8.2.4 | Connect to ArchaeologicalMatrix.jsx | ⏳ |
| Optimization | 8.3.1 | Auto-detect stratigraphic contradictions | ⏳ |
| Optimization | 8.3.2 | Export Harris Matrix as SVG/PDF | ⏳ |
| Optimization | 8.3.3 | Phase grouping visualization | ⏳ |

---

## F9 — Chronology Engine

| Phase | Step | Goal | Status |
|-------|------|------|--------|
| Experiment | 9.1.1 | Date representation: BCE/CE + fuzzy dates | ⏳ |
| Experiment | 9.1.2 | C-14 calibration range (2-sigma) | ⏳ |
| Experiment | 9.1.3 | Conflict detection algorithm | ⏳ |
| MVP | 9.2.1 | Date ranges per entity (site, stratum, artifact, sample, claim) | ⏳ |
| MVP | 9.2.2 | Chronological contradiction feed → F7 | ⏳ |
| MVP | 9.2.3 | API: timeline data for Chronology.jsx | ⏳ |
| Optimization | 9.3.1 | Multi-site chronology comparison | ⏳ |
| Optimization | 9.3.2 | Bayesian date modeling | ⏳ |

---

## F10 — Geographic & Map

| Phase | Step | Goal | Status |
|-------|------|------|--------|
| Experiment | 10.1.1 | GeoJSON format for site locations | ⏳ |
| Experiment | 10.1.2 | Offline map tiles (OpenStreetMap, no Google) | ⏳ |
| Experiment | 10.1.3 | Leaflet.js + local tile cache test | ⏳ |
| MVP | 10.2.1 | API: sites as GeoJSON | ⏳ |
| MVP | 10.2.2 | Map clustering for dense sites | ⏳ |
| MVP | 10.2.3 | Connect to ResearchMap.jsx | ⏳ |
| Optimization | 10.3.1 | Excavation trench boundary polygons | ⏳ |
| Optimization | 10.3.2 | Offline tile caching | ⏳ |
| Optimization | 10.3.3 | Spatial search: "sites within 50km" | ⏳ |

---

## F11 — Evidence & Literature Graph

| Phase | Step | Goal | Status |
|-------|------|------|--------|
| Experiment | 11.1.1 | Graph data format: nodes + edges | ⏳ |
| Experiment | 11.1.2 | Isolated claim detection (no evidence) | ⏳ |
| MVP | 11.2.1 | API: Claims → Evidence → Sources → Sites graph | ⏳ |
| MVP | 11.2.2 | Evidence link strength scoring | ⏳ |
| MVP | 11.2.3 | Connect to EvidenceGraph.jsx + LiteratureGraph.jsx | ⏳ |
| Optimization | 11.3.1 | Cluster analysis | ⏳ |
| Optimization | 11.3.2 | Gap detection: claims with no evidence | ⏳ |

---

## F12 — Thesis Writing Assistant

| Phase | Step | Goal | Status |
|-------|------|------|--------|
| Experiment | 12.1.1 | Thesis audit logic (extends C++ thesis_audit.hpp) | ⏳ |
| Experiment | 12.1.2 | Chapter structure analysis | ⏳ |
| MVP | 12.2.1 | Thesis audit API: score per chapter | ⏳ |
| MVP | 12.2.2 | Unsupported claim detection | ⏳ |
| MVP | 12.2.3 | Unresolved contradiction warnings | ⏳ |
| MVP | 12.2.4 | Connect to Thesis.jsx + ArgumentBuilder.jsx | ⏳ |
| Optimization | 12.3.1 | Suggested citations for unsupported claims | ⏳ |
| Optimization | 12.3.2 | Defense preparation report | ⏳ |

---

## F13 — Export Engine

| Phase | Step | Format | Goal | Status |
|-------|------|--------|------|--------|
| Experiment | 13.1.1 | reportlab | PDF generation test | ⏳ |
| Experiment | 13.1.2 | python-docx | Word .docx generation test | ⏳ |
| Experiment | 13.1.3 | Citation formats | Chicago / APA / MLA | ⏳ |
| MVP | 13.2.1 | PDF export | Formatted report with citations | ⏳ |
| MVP | 13.2.2 | Word export | .docx with evidence chains as footnotes | ⏳ |
| MVP | 13.2.3 | BibTeX export | Bibliography only | ⏳ |
| MVP | 13.2.4 | JSON export | Raw data backup | ⏳ |
| MVP | 13.2.5 | Connect to ExportCenter.jsx | ⏳ |
| Optimization | 13.3.1 | Custom templates per institution | ⏳ |
| Optimization | 13.3.2 | Thesis-ready chapter format | ⏳ |

---

## F14 — Research Analytics

| Phase | Step | Goal | Status |
|-------|------|------|--------|
| MVP | 14.1.1 | Dashboard counts: claims, sources, sites, contradictions | ⏳ |
| MVP | 14.1.2 | Activity log: recent actions | ⏳ |
| MVP | 14.1.3 | Research gap detection: topics with few sources | ⏳ |
| MVP | 14.1.4 | Connect to Dashboard.jsx, ResearchAnalytics.jsx, ActivitySummary.jsx, ResearchInbox.jsx, Notifications.jsx | ⏳ |
| Optimization | 14.2.1 | Progress tracking over time | ⏳ |
| Optimization | 14.2.2 | Coverage heatmap (well-researched periods) | ⏳ |

---

## F15 — Data Root, Projects & Settings

| Phase | Step | Goal | Status |
|-------|------|------|:------:|
| MVP | 15.1.1 | First-launch Data Root picker: suggest default (`%LOCALAPPDATA%`), allow any custom/external drive | ✅ DONE |
| MVP | 15.1.2 | OS pointer file: write `{ "data_root": "..." }` to `%LOCALAPPDATA%\ArchaeoPhD\settings.json` | ✅ DONE |
| MVP | 15.1.3 | Cloud-sync detector: inspect chosen path for OneDrive / Dropbox / iCloud / GDrive and warn | ✅ DONE |
| MVP | 15.1.4 | External drive disconnect check: show reconnect prompt if Data Root is unmounted | ✅ DONE |
| MVP | 15.1.5 | Projects: create, list, switch, delete within chosen Data Root | ⏳ |
| MVP | 15.1.6 | Settings UI: switch Data Root, view storage breakdown, relocate libraries | ✅ DONE |
| Optimization | 15.2.1 | Multi-root support: Steam-style multi-library folders across fast SSD and archive HDDs | ⏳ |
| Optimization | 15.2.2 | Shared project export/import (air-gapped USB transfer between researchers) | ⏳ |
| Optimization | 15.2.3 | Onboarding wizard + Seed benchmark demo project | ⏳ |

---

## Page Coverage Map

| Frontend Page | Feature |
|---------------|---------|
| Login.jsx / Register.jsx / ForgotPassword.jsx / ResetPassword.jsx | F15 |
| Projects.jsx / CreateProject.jsx / OAuthConsent.jsx | F15 |
| Settings.jsx / SecurityPrivacy.jsx | F15 |
| Dashboard.jsx | F14 |
| Library.jsx / SourceReader.jsx | F2 |
| Claims.jsx / ClaimDetail.jsx | F7 + F11 |
| Sites.jsx / SiteDetail.jsx / SiteComparison.jsx | F10 |
| Artifacts.jsx | F9 + F10 |
| Chronology.jsx | F9 |
| ArchaeologicalMatrix.jsx | F8 |
| ContradictionDetector.jsx | F7 |
| EvidenceGraph.jsx | F11 |
| LiteratureGraph.jsx | F11 |
| AIResearch.jsx | F6 |
| Thesis.jsx / ArgumentBuilder.jsx | F12 |
| ExportCenter.jsx | F13 |
| ResearchAnalytics.jsx / ActivitySummary.jsx | F14 |
| ResearchGapExplorer.jsx / ResearchInbox.jsx / Notifications.jsx | F14 |
| ResearchMap.jsx | F10 |
| Notes.jsx | F15 |
| VisualizationCenter.jsx | F8 + F10 + F11 |
| Onboarding.jsx / DemoProject.jsx | F15 |
| Blog.jsx / BlogPost.jsx / HelpCenter.jsx | Static content |
| Landing.jsx | Static content |
