#pragma once

#include <string>
#include <vector>
#include <map>
#include <chrono>
#include <json.hpp>

using json = nlohmann::json;

namespace archaeophd {

// -------------------------------------------------------------
// Layer A: Physical World Layer (The Ground Truth - Immutable)
// -------------------------------------------------------------

struct Site {
    std::string id;
    std::string project_id = "default";
    std::string site_name;
    std::string country;
    std::string region;
    double latitude = 0.0;
    double longitude = 0.0;
    double elevation = 0.0;
    std::string period;
    std::string site_type;
    std::string excavation_history;
    std::vector<std::string> aliases;
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(Site, id, project_id, site_name, country, region, latitude, longitude, elevation, period, site_type, excavation_history, aliases, created_date)
};

struct Stratum {
    std::string id;
    std::string project_id = "default";
    std::string site_id;
    std::string stratum_name;
    std::string phase;
    std::vector<std::string> locus_numbers;
    std::string sediment_type;
    std::string chronological_bounds;
    int date_start_bce = 0;
    int date_end_bce = 0;
    std::vector<std::string> harris_above;   // Units directly above (younger)
    std::vector<std::string> harris_below;   // Units directly below (older)
    std::vector<std::string> harris_cut_by;  // Units cutting this feature
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(Stratum, id, project_id, site_id, stratum_name, phase, locus_numbers, sediment_type, chronological_bounds, date_start_bce, date_end_bce, harris_above, harris_below, harris_cut_by, created_date)
};

struct Artifact {
    std::string id;
    std::string project_id = "default";
    std::string artifact_name;
    std::string category = "Ceramic";
    std::string material;
    std::string period;
    std::string date_range;
    std::vector<std::string> site_ids;
    std::string stratum_id;
    std::string locus_findspot;
    std::string typology;
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(Artifact, id, project_id, artifact_name, category, material, period, date_range, site_ids, stratum_id, locus_findspot, typology, created_date)
};

struct Sample {
    std::string id;
    std::string project_id = "default";
    std::string site_id;
    std::string stratum_id;
    std::string lab_code;
    std::string material;
    std::string method = "C-14";
    std::string cal_range_2sigma;
    int date_cal_start_bce = 0;
    int date_cal_end_bce = 0;
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(Sample, id, project_id, site_id, stratum_id, lab_code, material, method, cal_range_2sigma, date_cal_start_bce, date_cal_end_bce, created_date)
};

// -------------------------------------------------------------
// Layer B: The Claims Layer (The Interpretive World)
// -------------------------------------------------------------

struct Claim {
    std::string id;
    std::string project_id = "default";
    std::string claim_text;
    std::string scholar_name;
    std::string source_id;
    std::string publication_year;
    std::string page_ref;
    std::string chapter;
    std::string status = "Contested"; // Verified, Contested, Speculative
    std::string topic;               // Chronology, Warfare, Trade, Function
    std::vector<std::string> site_ids;
    std::vector<std::string> strata_ids;
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(Claim, id, project_id, claim_text, scholar_name, source_id, publication_year, page_ref, chapter, status, topic, site_ids, strata_ids, created_date)
};

// -------------------------------------------------------------
// Layer C: The Evidence Layer (The Bridge)
// -------------------------------------------------------------

struct EvidenceLink {
    std::string id;
    std::string project_id = "default";
    std::string claim_id;
    std::string evidence_text;
    std::string evidence_type = "supporting"; // supporting, contradicting, neutral
    std::string physical_entity_type;
    std::string physical_entity_id;
    std::vector<std::string> source_ids;
    std::string date_info;
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(EvidenceLink, id, project_id, claim_id, evidence_text, evidence_type, physical_entity_type, physical_entity_id, source_ids, date_info, created_date)
};

struct Source {
    std::string id;
    std::string project_id = "default";
    std::string title;
    std::string author;
    std::string year;
    std::string publication;
    std::string journal;
    std::string pages;
    std::string source_type = "Monograph";
    std::string file_path;
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(Source, id, project_id, title, author, year, publication, journal, pages, source_type, file_path, created_date)
};

struct Note {
    std::string id;
    std::string project_id = "default";
    std::string title;
    std::string content;
    std::vector<std::string> tags;
    std::string updated_date;
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(Note, id, project_id, title, content, tags, updated_date, created_date)
};

// -------------------------------------------------------------
// Contradiction & Thesis Audit Types
// -------------------------------------------------------------

struct Contradiction {
    std::string id;
    std::string project_id = "default";
    std::string type;       // Type 1: Chronological, Type 2: Interpretive, Type 3: Stratigraphic, Type 4: Cross-Site
    std::string severity;   // CRITICAL, HIGH, MEDIUM, LOW
    std::string title;
    std::string entity_name;
    std::string source_a;
    std::string claim_a;
    std::string source_b;
    std::string claim_b;
    json details;
    std::string resolution_guidance;
    bool is_confirmed = false;
    std::string created_date;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE_WITH_DEFAULT(Contradiction, id, project_id, type, severity, title, entity_name, source_a, claim_a, source_b, claim_b, details, resolution_guidance, is_confirmed, created_date)
};

} // namespace archaeophd
