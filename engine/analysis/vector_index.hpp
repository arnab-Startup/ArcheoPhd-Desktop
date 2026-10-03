#pragma once

#include <vector>
#include <string>
#include <algorithm>
#include <iostream>
#include <cmath>
#define WIN32_LEAN_AND_MEAN
#include <windows.h>

namespace archaeophd {

struct NativeMutex {
    CRITICAL_SECTION cs;
    NativeMutex() { InitializeCriticalSection(&cs); }
    ~NativeMutex() { DeleteCriticalSection(&cs); }
    void lock() { EnterCriticalSection(&cs); }
    void unlock() { LeaveCriticalSection(&cs); }
};

struct NativeGuard {
    NativeMutex& m;
    NativeGuard(NativeMutex& mtx) : m(mtx) { m.lock(); }
    ~NativeGuard() { m.unlock(); }
};

constexpr size_t VECTOR_DIM = 128; // Matryoshka truncated dimension

struct VectorRecord {
    std::string chunk_id;
    std::string doc_id;
    int page_ref;
    std::vector<float> embedding; // 128-dim normalized vector
};

class VectorIndex {
private:
    std::vector<VectorRecord> records_;
    mutable NativeMutex mutex_;

    static float dot_product(const std::vector<float>& a, const std::vector<float>& b) {
        float sum = 0.0f;
        size_t n = std::min({a.size(), b.size(), VECTOR_DIM});
        for (size_t i = 0; i < n; ++i) {
            sum += a[i] * b[i];
        }
        return sum;
    }

public:
    struct SearchResult {
        std::string chunk_id;
        std::string doc_id;
        int page_ref;
        float score;
    };

    static void l2_normalize(std::vector<float>& vec) {
        float norm = 0.0f;
        for (float v : vec) norm += v * v;
        norm = std::sqrt(norm);
        if (norm > 1e-9f) {
            for (float& v : vec) v /= norm;
        }
    }

    void insert(const std::string& chunk_id, const std::string& doc_id, int page_ref, std::vector<float> embedding) {
        NativeGuard lock(mutex_);
        if (embedding.size() > VECTOR_DIM) {
            embedding.resize(VECTOR_DIM); // Matryoshka truncation
        }
        l2_normalize(embedding);
        records_.push_back({chunk_id, doc_id, page_ref, std::move(embedding)});
    }

    std::vector<SearchResult> search(std::vector<float> query_vec, size_t top_k = 5) const {
        NativeGuard lock(mutex_);
        if (query_vec.size() > VECTOR_DIM) {
            query_vec.resize(VECTOR_DIM);
        }
        l2_normalize(query_vec);

        std::vector<SearchResult> results;
        results.reserve(records_.size());

        for (const auto& rec : records_) {
            float sim = dot_product(query_vec, rec.embedding);
            results.push_back({rec.chunk_id, rec.doc_id, rec.page_ref, sim});
        }

        std::partial_sort(
            results.begin(),
            results.begin() + std::min(top_k, results.size()),
            results.end(),
            [](const SearchResult& a, const SearchResult& b) {
                return a.score > b.score;
            }
        );

        if (results.size() > top_k) {
            results.resize(top_k);
        }
        return results;
    }

    static std::vector<float> embed_text(const std::string& text) {
        std::vector<float> vec(VECTOR_DIM, 0.0f);
        for (size_t i = 0; i < text.size(); ++i) {
            uint8_t c = static_cast<uint8_t>(text[i]);
            vec[c % VECTOR_DIM] += 1.0f;
        }
        l2_normalize(vec);
        return vec;
    }

    size_t size() const {
        NativeGuard lock(mutex_);
        return records_.size();
    }
};

} // namespace archaeophd
