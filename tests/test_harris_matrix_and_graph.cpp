#include <iostream>
#include <vector>
#include <string>
#include <cassert>
#include <filesystem>
#include <fstream>
#include <json.hpp>

#include "storage.hpp"
#include "analysis/harris_matrix.hpp"
#include "ipc/native_ipc_dispatcher.hpp"

using namespace archaeophd;
using json = nlohmann::json;
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
    std::cout << "  ArchaeoPhD Engine — Phase 2: Stratigraphic DAG & Harris Matrix Suite          \n";
    std::cout << "================================================================================\n\n";

#ifdef ARCHAEOPHD_ENABLE_TEST_STUB
    EmbeddingEngine::instance().enable_test_mock_mode(true);
#endif

    std::string test_dir = "test_graph_data";
    std::error_code ec;
    fs::remove_all(test_dir, ec);

    // -------------------------------------------------------------------------
    // TEST 1: Normal Stratigraphic Sequence & Harris Matrix DAG
    // -------------------------------------------------------------------------
    std::cout << "[TEST 1] Stratigraphic DAG Construction & Topological Sequence...\n";
    {
        std::vector<Stratum> strata;
        
        Stratum s_bedrock;
        s_bedrock.id = "strat_bedrock";
        s_bedrock.stratum_name = "Bedrock & PPNA Tower";
        s_bedrock.site_id = "site_jericho";
        s_bedrock.date_start_bce = 8500;
        s_bedrock.date_end_bce = 7500;
        s_bedrock.harris_above = {"strat_ppnb"};
        strata.push_back(s_bedrock);

        Stratum s_ppnb;
        s_ppnb.id = "strat_ppnb";
        s_ppnb.stratum_name = "PPNB Plastered Skull Domestic Floors";
        s_ppnb.site_id = "site_jericho";
        s_ppnb.date_start_bce = 7500;
        s_ppnb.date_end_bce = 6000;
        s_ppnb.harris_above = {"strat_mba_city_iv"};
        s_ppnb.harris_below = {"strat_bedrock"};
        strata.push_back(s_ppnb);

        Stratum s_mba;
        s_mba.id = "strat_mba_city_iv";
        s_mba.stratum_name = "Middle Bronze Age City IV Domestic & Fortification";
        s_mba.site_id = "site_jericho";
        s_mba.date_start_bce = 1650;
        s_mba.date_end_bce = 1550;
        s_mba.harris_above = {"strat_lba_burn"};
        s_mba.harris_below = {"strat_ppnb"};
        strata.push_back(s_mba);

        Stratum s_lba;
        s_lba.id = "strat_lba_burn";
        s_lba.stratum_name = "Late Bronze Age Terminal Conflagration Horizon";
        s_lba.site_id = "site_jericho";
        s_lba.date_start_bce = 1450;
        s_lba.date_end_bce = 1400;
        s_lba.harris_below = {"strat_mba_city_iv"};
        strata.push_back(s_lba);

        auto matrix = HarrisMatrixEngine::build_matrix(strata);
        run_test("Matrix is a valid DAG (no cycles)", matrix.is_valid_dag);
        run_test("Topological sequence has 4 elements", matrix.chronological_sequence.size() == 4);
        run_test("First in sequence is earliest (strat_bedrock)", matrix.chronological_sequence[0] == "strat_bedrock");
        run_test("Second in sequence is strat_ppnb", matrix.chronological_sequence[1] == "strat_ppnb");
        run_test("Third in sequence is strat_mba_city_iv", matrix.chronological_sequence[2] == "strat_mba_city_iv");
        run_test("Fourth in sequence is latest (strat_lba_burn)", matrix.chronological_sequence[3] == "strat_lba_burn");

        run_test("Bedrock level is 0", matrix.stratigraphic_levels["strat_bedrock"] == 0);
        run_test("PPNB level is 1", matrix.stratigraphic_levels["strat_ppnb"] == 1);
        run_test("MBA level is 2", matrix.stratigraphic_levels["strat_mba_city_iv"] == 2);
        run_test("LBA level is 3", matrix.stratigraphic_levels["strat_lba_burn"] == 3);
        run_test("Zero inversions in coherent sequence", matrix.inversions.empty());
    }

    // -------------------------------------------------------------------------
    // TEST 2: Stratigraphic Paradox / Impossible Cycle Detection
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 2] Stratigraphic Cycle & Impossible Paradox Detection...\n";
    {
        std::vector<Stratum> strata;
        
        Stratum s1;
        s1.id = "strat_A";
        s1.stratum_name = "Deposit A";
        s1.harris_above = {"strat_B"};
        strata.push_back(s1);

        Stratum s2;
        s2.id = "strat_B";
        s2.stratum_name = "Deposit B";
        s2.harris_above = {"strat_C"};
        strata.push_back(s2);

        Stratum s3;
        s3.id = "strat_C";
        s3.stratum_name = "Deposit C";
        s3.harris_above = {"strat_A"}; // Impossible cycle: A -> B -> C -> A
        strata.push_back(s3);

        auto matrix = HarrisMatrixEngine::build_matrix(strata);
        run_test("Cyclic sequence identified as NOT a valid DAG", !matrix.is_valid_dag);
        run_test("At least 1 cycle isolated by Tarjan SCC", !matrix.cycles.empty());
        run_test("Cycle contains 3 vertices", matrix.cycles[0].size() == 3);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Law of Superposition & Chronological Date Inversion
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 3] Law of Superposition Date Inversion Detection...\n";
    {
        std::vector<Stratum> strata;

        Stratum s_lower;
        s_lower.id = "strat_lower";
        s_lower.stratum_name = "Lower Level Trench VI";
        s_lower.date_start_bce = 1400; // Claimed 1400 BCE
        s_lower.date_end_bce = 1350;
        s_lower.harris_above = {"strat_upper"};
        strata.push_back(s_lower);

        Stratum s_upper;
        s_upper.id = "strat_upper";
        s_upper.stratum_name = "Upper Level Trench VI";
        s_upper.date_start_bce = 1800; // Paradox: Upper layer claimed 1800 BCE (400 years older than lower layer!)
        s_upper.date_end_bce = 1750;
        strata.push_back(s_upper);

        auto matrix = HarrisMatrixEngine::build_matrix(strata);
        run_test("Matrix is structurally a DAG", matrix.is_valid_dag);
        run_test("Inversion detected", matrix.inversions.size() == 1);
        run_test("Inversion flags upper stratum correctly", matrix.inversions[0].upper_stratum_id == "strat_upper");
        run_test("Inversion flags lower stratum correctly", matrix.inversions[0].lower_stratum_id == "strat_lower");
        run_test("Inversion reason cites Law of Superposition", matrix.inversions[0].reason.find("Law of Superposition") != std::string::npos);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Radiometric C-14 Inversion Cross-Check
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 4] Radiometric C-14 Sample Inversion Cross-Check...\n";
    {
        std::vector<Stratum> strata;

        Stratum s_base;
        s_base.id = "strat_base";
        s_base.stratum_name = "Basal Silts";
        s_base.harris_above = {"strat_top"};
        strata.push_back(s_base);

        Stratum s_top;
        s_top.id = "strat_top";
        s_top.stratum_name = "Surface Fill";
        strata.push_back(s_top);

        std::vector<Sample> samples;

        // Sample in lower stratum: 1500 BCE
        Sample smp_lower;
        smp_lower.id = "smp_01";
        smp_lower.lab_code = "OXA-4021";
        smp_lower.stratum_id = "strat_base";
        smp_lower.date_cal_start_bce = 1500;
        smp_lower.date_cal_end_bce = 1450;
        smp_lower.cal_range_2sigma = "1500-1450 cal BCE";
        samples.push_back(smp_lower);

        // Sample in upper stratum: 2200 BCE (older than the layer beneath it!)
        Sample smp_upper;
        smp_upper.id = "smp_02";
        smp_upper.lab_code = "OXA-4022";
        smp_upper.stratum_id = "strat_top";
        smp_upper.date_cal_start_bce = 2200;
        smp_upper.date_cal_end_bce = 2100;
        smp_upper.cal_range_2sigma = "2200-2100 cal BCE";
        samples.push_back(smp_upper);

        auto matrix = HarrisMatrixEngine::build_matrix(strata, samples);
        run_test("Radiometric inversion detected", matrix.inversions.size() == 1);
        run_test("Inversion cites C-14 lab code OXA-4022", matrix.inversions[0].reason.find("OXA-4022") != std::string::npos);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Relational Cross-Referencing in NativeStorage
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 5] Relational Cross-Referencing in NativeStorage...\n";
    {
        NativeStorage storage(test_dir);

        Site site;
        site.id = "site_jericho_01";
        site.site_name = "Tell es-Sultan (Jericho)";
        storage.put_site(site);

        Stratum st;
        st.id = "strat_jericho_city_iv";
        st.site_id = "site_jericho_01";
        st.stratum_name = "City IV Destruction Layer";
        storage.put_stratum(st);

        Artifact art;
        art.id = "art_bichrome_01";
        art.stratum_id = "strat_jericho_city_iv";
        art.artifact_name = "Cypriot Bichrome Wheel-made Jug";
        storage.put_artifact(art);

        Sample smp;
        smp.id = "smp_cereal_01";
        smp.stratum_id = "strat_jericho_city_iv";
        smp.lab_code = "RT-1340";
        storage.put_sample(smp);

        Claim c1;
        c1.id = "claim_wood_1990_01";
        c1.site_ids = {"site_jericho_01"};
        c1.strata_ids = {"strat_jericho_city_iv"};
        c1.claim_text = "City IV collapsed in Late Bronze I (ca. 1400 BC) based on Cypriot imports.";
        c1.scholar_name = "Bryant Wood";
        storage.put_claim(c1);

        EvidenceLink ev;
        ev.id = "ev_01";
        ev.claim_id = "claim_wood_1990_01";
        ev.physical_entity_type = "Artifact";
        ev.physical_entity_id = "art_bichrome_01";
        storage.put_evidence(ev);

        // Test cross-referencing getters
        auto claimsSite = storage.get_claims_by_site("site_jericho_01");
        run_test("get_claims_by_site returned 1 claim", claimsSite.size() == 1);
        run_test("Returned claim is claim_wood_1990_01", claimsSite[0].id == "claim_wood_1990_01");

        auto claimsStratum = storage.get_claims_by_stratum("strat_jericho_city_iv");
        run_test("get_claims_by_stratum returned 1 claim", claimsStratum.size() == 1);

        auto strataSite = storage.get_strata_by_site("site_jericho_01");
        run_test("get_strata_by_site returned 1 stratum", strataSite.size() == 1);

        auto artifactsStratum = storage.get_artifacts_by_stratum("strat_jericho_city_iv");
        run_test("get_artifacts_by_stratum returned 1 artifact", artifactsStratum.size() == 1);

        auto samplesStratum = storage.get_samples_by_stratum("strat_jericho_city_iv");
        run_test("get_samples_by_stratum returned 1 sample", samplesStratum.size() == 1);

        auto evidenceClaim = storage.get_evidence_by_claim("claim_wood_1990_01");
        run_test("get_evidence_by_claim returned 1 evidence link", evidenceClaim.size() == 1);

        // Subgraph extraction
        auto subSite = storage.get_entity_subgraph("site", "site_jericho_01");
        run_test("Site subgraph contains site record", subSite.contains("site"));
        run_test("Site subgraph contains strata array", subSite["strata"].is_array() && subSite["strata"].size() == 1);
        run_test("Site subgraph contains claims array", subSite["claims"].is_array() && subSite["claims"].size() == 1);

        auto subStratum = storage.get_entity_subgraph("stratum", "strat_jericho_city_iv");
        run_test("Stratum subgraph contains stratum record", subStratum.contains("stratum"));
        run_test("Stratum subgraph contains parent site", subStratum.contains("site"));
        run_test("Stratum subgraph contains artifacts array", subStratum["artifacts"].is_array() && subStratum["artifacts"].size() == 1);
        run_test("Stratum subgraph contains samples array", subStratum["samples"].is_array() && subStratum["samples"].size() == 1);
    }

    // -------------------------------------------------------------------------
    // TEST 6: IPC Dispatcher Phase 2 Graph Endpoints
    // -------------------------------------------------------------------------
    std::cout << "\n[TEST 6] IPC Dispatcher Phase 2 Graph Endpoints...\n";
    {
        NativeStorage storage(test_dir);
        NativeIpcDispatcher dispatcher(&storage, nullptr, nullptr, test_dir);

        // Add 2 strata for site_hazor
        Stratum h1;
        h1.id = "strat_hazor_x";
        h1.site_id = "site_hazor";
        h1.stratum_name = "Stratum X (Solomonic Six-Chamber Gate)";
        h1.harris_above = {"strat_hazor_ix"};
        storage.put_stratum(h1);

        Stratum h2;
        h2.id = "strat_hazor_ix";
        h2.site_id = "site_hazor";
        h2.stratum_name = "Stratum IX (Ahab Casemate Reconstruction)";
        storage.put_stratum(h2);

        // Test build_harris_matrix over IPC
        json reqMatrix = {
            {"id", "req-hm-01"},
            {"action", "build_harris_matrix"},
            {"payload", {{"site_id", "site_hazor"}}}
        };
        std::string resMatrixStr = dispatcher.dispatch(reqMatrix.dump());
        json resMatrix = json::parse(resMatrixStr);
        run_test("IPC build_harris_matrix response has no error", !resMatrix.contains("error"));
        run_test("IPC build_harris_matrix is_valid_dag == true", resMatrix["result"]["is_valid_dag"] == true);
        run_test("IPC build_harris_matrix sequence length == 2", resMatrix["result"]["chronological_sequence"].size() == 2);
        run_test("IPC build_harris_matrix earliest is Stratum X", resMatrix["result"]["chronological_sequence"][0] == "strat_hazor_x");

        // Test get_entity_subgraph over IPC
        json reqSub = {
            {"id", "req-sub-01"},
            {"action", "get_entity_subgraph"},
            {"payload", {{"entity_type", "stratum"}, {"entity_id", "strat_hazor_x"}}}
        };
        std::string resSubStr = dispatcher.dispatch(reqSub.dump());
        json resSub = json::parse(resSubStr);
        run_test("IPC get_entity_subgraph response has no error", !resSub.contains("error"));
        run_test("IPC get_entity_subgraph contains stratum", resSub["result"].contains("stratum"));
        run_test("IPC get_entity_subgraph returned correct stratum name", resSub["result"]["stratum"]["stratum_name"] == "Stratum X (Solomonic Six-Chamber Gate)");

        // Test query_knowledge_graph over IPC
        json reqQuery = {
            {"id", "req-qkg-01"},
            {"action", "query_knowledge_graph"},
            {"payload", {{"query", "Solomonic gate architecture"}, {"site_id", "site_hazor"}}}
        };
        std::string resQueryStr = dispatcher.dispatch(reqQuery.dump());
        json resQuery = json::parse(resQueryStr);
        run_test("IPC query_knowledge_graph response has no error", !resQuery.contains("error"));
        run_test("IPC query_knowledge_graph result contains passages and claims", resQuery["result"].contains("passages") && resQuery["result"].contains("claims"));
    }

    fs::remove_all(test_dir, ec);

    std::cout << "\n================================================================================\n";
    std::cout << "  ALL 25 STRATIGRAPHIC DAG & KNOWLEDGE GRAPH TESTS PASSED WITH ZERO FAILURES!   \n";
    std::cout << "================================================================================\n";

    return 0;
}
