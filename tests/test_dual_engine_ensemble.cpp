#include <iostream>
#include <cassert>
#include "extraction/dual_engine_ensemble.hpp"

using namespace archaeophd;

int main() {
    std::cout << "============================================================\n";
    std::cout << "  ArchaeoPhD — Dual-Engine Disagreement Ensemble Test Suite \n";
    std::cout << "============================================================\n\n";

    // Test Case 1: Modern/Clean Document (Rajan / Chakrabarti class)
    {
        std::cout << "[TEST 1] Testing Modern/Clean Scan (Rajan Class)...\n";
        std::vector<ExtractedFact> facts = {
            {
                "f1", "rajan_p016", "date", "Publication Year", "Text...",
                "1949", "1949", "", FactVerificationStatus::FLAGGED_DISAGREEMENT, 0.0, ""
            },
            {
                "f2", "rajan_p020", "date", "Winckelmann Art Year", "Text...",
                "1764", "1764", "", FactVerificationStatus::FLAGGED_DISAGREEMENT, 0.0, ""
            },
            {
                "f3", "rajan_p024", "date", "Lubbock Lifespan", "Text...",
                "1834-1913", "1834-1913", "", FactVerificationStatus::FLAGGED_DISAGREEMENT, 0.0, ""
            },
            {
                // Disagreement case: Windows dropped or corrupted
                "f4", "rajan_p110", "measurement", "K-Ar Date Range", "Table...",
                "10.000 - 20,000.000", "10,000", "", FactVerificationStatus::FLAGGED_DISAGREEMENT, 0.0, ""
            }
        };

        auto res = DualEngineEnsembleRouter::ProcessDocument(
            "doc-rajan-2002",
            DocumentDegradationClass::MODERN_CLEAN,
            facts
        );

        assert(res.automated_ingestion_permitted == true);
        assert(res.facts_auto_accepted == 3);
        assert(res.facts_routed_to_verification_queue == 1);
        assert(res.facts[0].status == FactVerificationStatus::AUTO_ACCEPTED_CONSENSUS);
        assert(res.facts[3].status == FactVerificationStatus::FLAGGED_DISAGREEMENT);
        std::cout << "  ✓ Modern Clean Policy: 3 facts auto-accepted, 1 disagreement routed to queue.\n";
    }

    // Test Case 2: Degraded Letterpress Document (Sankalia class)
    {
        std::cout << "\n[TEST 2] Testing Porous Bleed-Through Scan (Sankalia Class)...\n";
        std::vector<ExtractedFact> facts = {
            {
                "f1", "sankalia_p052", "date", "Chirki Discovery Year", "Text...",
                "", "1063", "", FactVerificationStatus::FLAGGED_DISAGREEMENT, 0.0, ""
            },
            {
                "f2", "sankalia_p053", "count", "ESA Tools Recovered", "Text...",
                "69.", "694", "", FactVerificationStatus::FLAGGED_DISAGREEMENT, 0.0, ""
            },
            {
                // Both happened to get this right, BUT policy mandates hard gating on degraded paper
                "f3", "sankalia_p053", "measurement", "Rubble Thickness", "Text...",
                "20-40 cm", "20-40 cm", "", FactVerificationStatus::FLAGGED_DISAGREEMENT, 0.0, ""
            }
        };

        auto res = DualEngineEnsembleRouter::ProcessDocument(
            "doc-sankalia-1974",
            DocumentDegradationClass::POROUS_BLEEDTHROUGH,
            facts
        );

        assert(res.automated_ingestion_permitted == false);
        assert(res.facts_auto_accepted == 0);
        assert(res.facts_gated_for_manual_review == 3);
        assert(res.facts[0].status == FactVerificationStatus::GATED_MANUAL_REVIEW_REQUIRED);
        assert(res.facts[2].status == FactVerificationStatus::GATED_MANUAL_REVIEW_REQUIRED);
        std::cout << "  ✓ Degraded Gating Policy: 100% hard-gated. Zero facts auto-ingested.\n";
    }

    std::cout << "\n============================================================\n";
    std::cout << "  ALL ENSEMBLE ROUTER TESTS PASSED SUCCESSFULLY!            \n";
    std::cout << "============================================================\n";
    return 0;
}
