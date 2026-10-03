#include <iostream>
#include <iomanip>
#include "extraction/document_extractor.hpp"

using namespace archaeophd;

int main() {
    std::cout << "============================================================\n";
    std::cout << "  ArchaeoPhD Engine — Document Extractor Test Suite         \n";
    std::cout << "  Evaluation against Ground-Truth Excavation Reports        \n";
    std::cout << "============================================================\n\n";

    std::cout << "[INFO] Loading canonical excavation documents...\n";
    auto corpus = DocumentExtractor::GetCanonicalArchaeologyCorpus();
    std::cout << "[SUCCESS] Loaded " << corpus.size() << " excavation reports.\n\n";

    std::cout << "------------------------------------------------------------\n";
    std::cout << "  RUNNING EXTRACTION & GROUNDING SUITE\n";
    std::cout << "------------------------------------------------------------\n";

    auto report = DocumentExtractor::RunExtractionEvaluation();

    for (size_t i = 0; i < report.document_results.size(); ++i) {
        const auto& docRes = report.document_results[i];
        const auto& docSample = corpus[i];

        std::cout << "\n[" << (i + 1) << "/" << report.document_results.size() << "] "
                  << docSample.title << " (" << docSample.year << ")\n";
        std::cout << "    Author: " << docSample.author << "\n";
        std::cout << "    Type:   " << docSample.document_type << "\n";
        std::cout << "    Words:  " << docRes.word_count << " | Execution Time: " 
                  << std::fixed << std::setprecision(2) << docRes.extraction_duration_ms << " ms\n";
        
        std::cout << "    Extracted Sites:     ";
        for (const auto& s : docRes.extracted_sites) std::cout << "[" << s << "] ";
        std::cout << "\n";

        std::cout << "    Extracted Strata:    ";
        for (const auto& s : docRes.extracted_strata) std::cout << "[" << s << "] ";
        std::cout << "\n";

        std::cout << "    Extracted Loci:      ";
        for (const auto& l : docRes.extracted_loci) std::cout << "[" << l << "] ";
        std::cout << "\n";

        std::cout << "    Extracted Artifacts: ";
        for (const auto& a : docRes.extracted_artifacts) std::cout << "[" << a << "] ";
        std::cout << "\n";

        std::cout << "    Extracted Dates:     ";
        for (const auto& d : docRes.extracted_date_claims) std::cout << "[" << d << "] ";
        std::cout << "\n";

        std::cout << "    Precision: " << std::fixed << std::setprecision(1) << (docRes.entity_precision * 100.0) << "%"
                  << " | Recall: " << (docRes.entity_recall * 100.0) << "%"
                  << " | Hallucinations: " << docRes.hallucinated_claims << "\n";
        std::cout << "    Citation Grounding: " << (docRes.citation_grounded ? "VERIFIED (100% Verbatim Substrings)" : "FAILED") << "\n";
    }

    std::cout << "\n------------------------------------------------------------\n";
    std::cout << "  DOCUMENT EXTRACTOR METRICS SUMMARY\n";
    std::cout << "------------------------------------------------------------\n";
    std::cout << "  Documents Processed:               " << report.documents_processed << "\n";
    std::cout << "  Total Words Analyzed:              " << report.total_words_analyzed << "\n";
    std::cout << "  Overall Entity Precision:          " << std::fixed << std::setprecision(1) 
              << (report.overall_precision * 100.0) << "% (Threshold >= " << (report.minimum_precision_threshold * 100.0) << "%)\n";
    std::cout << "  Overall Entity Recall:             " << (report.overall_recall * 100.0) << "%\n";
    std::cout << "  Hallucination Rate:                " << (report.hallucination_rate * 100.0) << "% (Target: 0.0%)\n";
    std::cout << "  BCE/CE Chronological Fidelity:     " << (report.bce_ce_chronological_fidelity * 100.0) << "%\n";
    std::cout << "  Lossless Archival (SHA-256):       " << (report.compression_sha256_lossless ? "VERIFIED (Byte-for-byte exact)" : "FAILED") << "\n";
    std::cout << "  Zstd+Dict Compression Ratio:       " << (report.avg_compression_ratio * 100.0) << "% reduction\n";
    std::cout << "  Type 1 Date Clashes Detected:      " << report.type1_date_clashes_detected << " (Kenyon 1550 BCE vs Garstang/Wood 1400 BCE)\n";
    std::cout << "  Type 3 Stratigraphic Cycles:       " << report.type3_stratigraphic_cycles_caught << " (Tarjan SCC verified)\n";
    std::cout << "  Review Guardrail Enforced:         " << (report.review_guardrail_enforced ? "YES (Types 2/4 never verdict)" : "NO") << "\n";

    std::cout << "\n============================================================\n";
    std::cout << "  QUALITY GATE EVALUATION RESULT\n";
    std::cout << "============================================================\n";
    std::cout << "  STATUS:  " << report.status_verdict << "\n";
    std::cout << "  DETAILS: " << report.evaluation_summary << "\n";
    std::cout << "============================================================\n";

    return report.passed_quality_gate ? 0 : 1;
}
