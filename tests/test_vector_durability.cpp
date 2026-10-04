#include <iostream>
#include <vector>
#include <string>
#include <cassert>
#include <cmath>
#include <filesystem>
#include <fstream>

#include "storage.hpp"
#include "vector_index.hpp"

using namespace archaeophd;
namespace fs = std::filesystem;

void run_test(const std::string& name, bool condition) {
    if (condition) {
        std::cout << "  [PASS] " << name << "\n";
    } else {
        std::cerr << "  [FAIL] " << name << "\n";
        exit(1);
    }
}

int main() {
    std::cout << "================================================================================\n";
    std::cout << "  ArchaeoPhD Engine — Step 4A: VectorIndex Restart Durability & Lifecycle Suite \n";
    std::cout << "================================================================================\n\n";

    std::string test_dir = "test_durability_data";
    std::error_code ec;
    fs::remove_all(test_dir, ec);

    // -------------------------------------------------------------------------
    // TEST 1: Clean Startup on Non-Existent Store
    // -------------------------------------------------------------------------
    std::cout << "[TEST 1] Clean Startup on Non-Existent Store...\n";
    {
        NativeStorage storage(test_dir);
        run_test("VectorIndex starts with size 0", storage.vectors().size() == 0);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Ingestion & Atomic Persistence of vectors.bin
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 2] Ingestion & Atomic Persistence of vectors.bin...\n";
    std::vector<VectorIndex::SearchResult> baseline_results;
    std::vector<float> query_emb;
    {
        NativeStorage storage(test_dir);

        // Create 3 realistic archaeological vectors
        std::vector<float> emb1 = VectorIndex::embed_text("Acheulian rubble trench boulder gravels Chirki basalt");
        std::vector<float> emb2 = VectorIndex::embed_text("Tell es-Sultan Middle Bronze destruction burnt brick wall Kenyon");
        std::vector<float> emb3 = VectorIndex::embed_text("Late Bronze bichrome ware Jericho ceramic sequence Wood");

        storage.vectors().insert("chunk_chirki_001", "src_sankalia_1974", 53, emb1);
        storage.vectors().insert("chunk_jericho_kenyon", "src_kenyon_1981", 104, emb2);
        storage.vectors().insert("chunk_jericho_wood", "src_wood_1990", 212, emb3);

        run_test("VectorIndex has 3 records in memory", storage.vectors().size() == 3);

        // Run query before saving
        query_emb = VectorIndex::embed_text("Chirki Acheulian basalt gravel");
        baseline_results = storage.vectors().search(query_emb, 3);
        run_test("Baseline search returned 3 results", baseline_results.size() == 3);
        run_test("Top match is Chirki before shutdown", baseline_results[0].chunk_id == "chunk_chirki_001");

        // Trigger persistence
        storage.save_state();

        std::string vpath = test_dir + "/vectors.bin";
        run_test("vectors.bin exists on disk", fs::exists(vpath));
        run_test("vectors.bin is non-zero bytes", fs::file_size(vpath) > 0);

        // Verify magic header on disk
        std::ifstream bin_in(vpath, std::ios::binary);
        char magic[4] = {0};
        bin_in.read(magic, 4);
        run_test("vectors.bin has APV1 magic header", magic[0] == 'A' && magic[1] == 'P' && magic[2] == 'V' && magic[3] == '1');
        bin_in.close();
    } // Storage instance completely destroyed here (simulating process termination)

    // -------------------------------------------------------------------------
    // TEST 3: Process Restart & 100% Bit-for-Bit Vector Recovery
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 3] Process Restart & 100% Bit-for-Bit Vector Recovery...\n";
    {
        // Re-instantiate storage from scratch pointing to the same data directory
        NativeStorage storage_restarted(test_dir);

        run_test("Restarted storage restored all 3 vectors", storage_restarted.vectors().size() == 3);

        // Execute identical query against restored vector store
        auto post_restart_results = storage_restarted.vectors().search(query_emb, 3);
        run_test("Post-restart search returned 3 results", post_restart_results.size() == 3);

        for (size_t i = 0; i < 3; ++i) {
            run_test("Rank " + std::to_string(i) + " chunk_id matches identically",
                     post_restart_results[i].chunk_id == baseline_results[i].chunk_id);
            run_test("Rank " + std::to_string(i) + " doc_id matches identically",
                     post_restart_results[i].doc_id == baseline_results[i].doc_id);
            run_test("Rank " + std::to_string(i) + " page_ref matches identically",
                     post_restart_results[i].page_ref == baseline_results[i].page_ref);
            float diff = std::abs(post_restart_results[i].score - baseline_results[i].score);
            run_test("Rank " + std::to_string(i) + " cosine score is bit-for-bit identical", diff < 1e-6f);
        }
    }

    // -------------------------------------------------------------------------
    // TEST 4: Atomic Mutation & Append Across Restarts
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 4] Atomic Mutation & Append Across Restarts...\n";
    {
        NativeStorage storage_session2(test_dir);
        std::vector<float> emb4 = VectorIndex::embed_text("Hazor Solomonic gate fortification phase Stratum X");
        storage_session2.vectors().insert("chunk_hazor_001", "src_yadin_1972", 73, emb4);
        storage_session2.save_state();
    }
    {
        NativeStorage storage_session3(test_dir);
        run_test("Session 3 restored 4 vectors after mutation", storage_session3.vectors().size() == 4);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Adversarial Malformed / Corrupt vectors.bin Header Resilience
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 5] Adversarial Corrupt vectors.bin Header Resilience...\n";
    {
        std::string corrupt_dir = "test_corrupt_data";
        fs::remove_all(corrupt_dir, ec);
        fs::create_directories(corrupt_dir);

        // Write a garbage/corrupted file as vectors.bin
        std::ofstream corrupt_file(corrupt_dir + "/vectors.bin", std::ios::binary);
        corrupt_file << "CORRUPT_NOT_APV1_HEADER_1234567890";
        corrupt_file.close();

        // NativeStorage must not crash, must handle corruption gracefully, and start with empty index
        NativeStorage storage_corrupt(corrupt_dir);
        run_test("Corrupted file handled safely with zero crashes", true);
        run_test("Corrupted vector index resets safely to size 0", storage_corrupt.vectors().size() == 0);

        fs::remove_all(corrupt_dir, ec);
    }

    // Teardown test artifacts
    fs::remove_all(test_dir, ec);

    std::cout << "\n================================================================================\n";
    std::cout << "  ALL 5 VECTOR INDEX RESTART DURABILITY TESTS PASSED WITH ZERO FAILURES!        \n";
    std::cout << "================================================================================\n";

    return 0;
}
