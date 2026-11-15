# Issue Report 07: Offline Native Model Inference & IPC Concurrency

**Severity**: Medium  
**Category**: Native C++ Engine, Performance & Thread Concurrency  
**Status**: Open / In Optimization  
**Date**: November 2026  

---

## 1. Executive Summary

ArchaeoPhD runs fully offline on Windows via an embedded WebView2 UI backed by a statically linked MinGW C++20 engine (`desktop/release/ArchaeoPhD.exe`). The native backend manages embedded vector search (HNSW/Cosine), Harris Matrix topological DAG analysis, and offline GGUF LLM inference (`Qwen2.5-7B-Instruct-Q4_K_M.gguf` via `llama.cpp`).

During heavy local AI query processing (e.g., Evidence Mode synthesis across 70+ claims or multi-document OCR extraction), synchronous message dispatching across the Win32 message loop can introduce UI latency or sluggish window responsiveness if background threads contend for the shared native bridge.

---

## 2. Technical Analysis

### 2.1 The Native Win32 / WebView2 Architecture
In `desktop/src/main.cpp`:
- The main thread handles the Win32 message pump (`GetMessageW`, `TranslateMessage`, `DispatchMessageW`).
- WebView2 communicates with C++ via `window.chrome.webview.postMessage` and `add_WebMessageReceived`.
- The native bridge dispatches requests to engines (`contradiction_engine`, `vector_search`, `harris_matrix`, `rag_pipeline`).

### 2.2 Potential Bottlenecks
1. **Llama.cpp Thread Contention**:
   CPU-based quantization inference consumes multiple worker threads. If thread affinity is unconstrained, UI rendering in WebView2's GPU/render processes experiences frame drops during token generation.
2. **Synchronous JSON Serialization**:
   Passing large stratigraphic corpora or multi-megabyte PDF extracted text as single-shot JSON strings through `WebMessageAsJson` incurs string copy overhead across the process boundary.

---

## 3. Archaeological Impact

- Doctoral researchers working in field locations or remote museum archives rely on low-latency local interactions without network access.
- Lagging responsiveness during evidence graph navigation or claim synthesis degrades the feeling of an agile, real-time research workbench.

---

## 4. Remediation Strategy

1. **Thread Pool Isolation**:
   Cap `llama.cpp` inference threads to `std::thread::hardware_concurrency() - 2`, guaranteeing that the Win32 message pump and WebView2 compositor always have dedicated CPU headroom.
2. **Chunked Streaming Responses**:
   Stream LLM response tokens and vector search batches iteratively via lightweight `ui_test_step` style IPC packets rather than buffering massive multi-paragraph JSON objects.
3. **Optimized Memory-Mapped Storage**:
   Employ memory-mapped files (`CreateFileMappingW`) for large archaeological vector index structures to eliminate redundant memory allocations during startup.
