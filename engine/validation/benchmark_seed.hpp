#pragma once

#include "storage.hpp"

namespace archaeophd {

inline void seed_benchmark_corpus(NativeStorage& storage, const std::string& project_id = "default") {
    // -------------------------------------------------------------
    // Layer A: Sites (Tell es-Sultan, Megiddo, Hazor)
    // -------------------------------------------------------------
    Site jericho;
    jericho.id = "site-jericho";
    jericho.project_id = project_id;
    jericho.site_name = "Tell es-Sultan (Jericho)";
    jericho.country = "Palestine";
    jericho.region = "Jordan Valley / Southern Levant";
    jericho.latitude = 31.871;
    jericho.longitude = 35.444;
    jericho.elevation = -258.0;
    jericho.period = "Middle Bronze Age IIB / Late Bronze";
    jericho.site_type = "Fortified Tell Settlement";
    jericho.excavation_history = "Garstang (1930–1936), Kenyon (1952–1958), Marchetti & Nigro (1997–present)";
    jericho.aliases = {"Jericho", "Tell es-Sultan", "Ariha", "Ancient Jericho"};
    storage.put_site(jericho);

    Site megiddo;
    megiddo.id = "site-megiddo";
    megiddo.project_id = project_id;
    megiddo.site_name = "Megiddo (Tel Megiddo)";
    megiddo.country = "Israel";
    megiddo.region = "Jezreel Valley";
    megiddo.latitude = 32.585;
    megiddo.longitude = 35.184;
    megiddo.period = "Middle Bronze / Late Bronze";
    megiddo.site_type = "Royal City Mound";
    storage.put_site(megiddo);

    Site hazor;
    hazor.id = "site-hazor";
    hazor.project_id = project_id;
    hazor.site_name = "Hazor (Tel Hazor)";
    hazor.country = "Israel";
    hazor.region = "Upper Galilee";
    hazor.latitude = 33.017;
    hazor.longitude = 35.568;
    hazor.period = "Bronze Age / Iron Age";
    hazor.site_type = "Upper and Lower City";
    storage.put_site(hazor);

    // -------------------------------------------------------------
    // Layer A: Strata (Including Stratigraphic Units 402 & 317)
    // -------------------------------------------------------------
    Stratum ivb;
    ivb.id = "stratum-jericho-ivb";
    ivb.project_id = project_id;
    ivb.site_id = "site-jericho";
    ivb.stratum_name = "Stratum IV, Phase b (Destruction Horizon)";
    ivb.locus_numbers = {"Locus 402", "Trench C Unit 17"};
    ivb.sediment_type = "Dense ash layer, 0.4m depth, collapsed mudbrick";
    ivb.chronological_bounds = "1550–1400 BCE (Contested)";
    ivb.date_start_bce = -1550;
    ivb.date_end_bce = -1400;
    storage.put_stratum(ivb);

    Stratum u402;
    u402.id = "unit-402";
    u402.project_id = project_id;
    u402.site_id = "site-jericho";
    u402.stratum_name = "Stratigraphic Unit 402 (Destruction Rubble)";
    u402.harris_above = {"unit-317"}; // Report A: 402 is above 317
    storage.put_stratum(u402);

    Stratum u317;
    u317.id = "unit-317";
    u317.project_id = project_id;
    u317.site_id = "site-jericho";
    u317.stratum_name = "Stratigraphic Unit 317 (Floor Matrix)";
    u317.harris_above = {"unit-402"}; // Report B: 317 is above 402 -> Cycle!
    storage.put_stratum(u317);

    // -------------------------------------------------------------
    // Layer A: Samples & Artifacts
    // -------------------------------------------------------------
    Sample seeds;
    seeds.id = "sample-charred-seeds";
    seeds.project_id = project_id;
    seeds.site_id = "site-jericho";
    seeds.stratum_id = "stratum-jericho-ivb";
    seeds.lab_code = "GrN-18540";
    seeds.material = "Charred cereal grains (Hordeum vulgare), Trench B, Stratum IV";
    seeds.method = "C-14";
    seeds.cal_range_2sigma = "1562–1527 BCE (2σ IntCal20)";
    seeds.date_cal_start_bce = -1562;
    seeds.date_cal_end_bce = -1527;
    storage.put_sample(seeds);

    Artifact pottery;
    pottery.id = "artifact-mb2b-pottery";
    pottery.project_id = project_id;
    pottery.artifact_name = "Wheel-made burnished red slip pottery assemblage";
    pottery.category = "Ceramic";
    pottery.site_ids = {"site-jericho"};
    pottery.stratum_id = "stratum-jericho-ivb";
    pottery.locus_findspot = "Locus 402, Layer IVb";
    pottery.typology = "Middle Bronze IIB termination ceramic marker";
    storage.put_artifact(pottery);

    // -------------------------------------------------------------
    // Sources
    // -------------------------------------------------------------
    Source s_kenyon;
    s_kenyon.id = "src-kenyon-1978";
    s_kenyon.project_id = project_id;
    s_kenyon.title = "The Bible and Recent Archaeology";
    s_kenyon.author = "Kenyon, Kathleen M.";
    s_kenyon.year = "1978";
    s_kenyon.publication = "British Museum Publications";
    s_kenyon.pages = "47–53";
    s_kenyon.degradation_class = "CLASS_B";
    s_kenyon.ingestion_status = "UNVERIFIED_ROUGH_SCAN";
    storage.put_source(s_kenyon);

    Source s_wood;
    s_wood.id = "src-wood-1990";
    s_wood.project_id = project_id;
    s_wood.title = "Did the Israelites Conquer Jericho? A New Look at the Archaeological Evidence";
    s_wood.author = "Wood, Bryant G.";
    s_wood.year = "1990";
    s_wood.journal = "Biblical Archaeology Review";
    s_wood.pages = "44–58";
    s_wood.degradation_class = "CLASS_A";
    s_wood.confirmed_clean_offset = true;
    s_wood.ingestion_status = "VERIFIED";
    storage.put_source(s_wood);

    // -------------------------------------------------------------
    // Layer B: Claims
    // -------------------------------------------------------------
    Claim c_kenyon;
    c_kenyon.id = "claim-kenyon-date";
    c_kenyon.project_id = project_id;
    c_kenyon.claim_text = "Tell es-Sultan Stratum IV was destroyed by fire around 1550 BCE at the end of MB IIB.";
    c_kenyon.scholar_name = "Kenyon (1978)";
    c_kenyon.source_id = "src-kenyon-1978";
    c_kenyon.publication_year = "1978";
    c_kenyon.page_ref = "p. 47";
    c_kenyon.topic = "Chronology";
    c_kenyon.status = "Contested";
    c_kenyon.chapter = "Chapter 3: Regional Chronologies";
    c_kenyon.site_ids = {"site-jericho"};
    c_kenyon.strata_ids = {"stratum-jericho-ivb"};
    storage.put_claim(c_kenyon);

    Claim c_wood;
    c_wood.id = "claim-wood-date";
    c_wood.project_id = project_id;
    c_wood.claim_text = "Tell es-Sultan Stratum IV was destroyed in 1400 BCE at the end of Late Bronze I.";
    c_wood.scholar_name = "Wood (1990)";
    c_wood.source_id = "src-wood-1990";
    c_wood.publication_year = "1990";
    c_wood.page_ref = "p. 52";
    c_wood.topic = "Chronology";
    c_wood.status = "Contested";
    c_wood.chapter = "Chapter 3: Regional Chronologies";
    c_wood.site_ids = {"site-jericho"};
    c_wood.strata_ids = {"stratum-jericho-ivb"};
    storage.put_claim(c_wood);

    Claim c_seeds_dom;
    c_seeds_dom.id = "claim-seeds-domestic";
    c_seeds_dom.project_id = project_id;
    c_seeds_dom.claim_text = "Charred cereal seeds in Trench B represent domestic cooking hearth discard.";
    c_seeds_dom.scholar_name = "Kenyon (1978)";
    c_seeds_dom.source_id = "src-kenyon-1978";
    c_seeds_dom.topic = "Function";
    c_seeds_dom.status = "Contested";
    c_seeds_dom.chapter = "Chapter 4: Site Function & Material Culture";
    c_seeds_dom.site_ids = {"site-jericho"};
    storage.put_claim(c_seeds_dom);

    Claim c_seeds_sg;
    c_seeds_sg.id = "claim-seeds-siege";
    c_seeds_sg.project_id = project_id;
    c_seeds_sg.claim_text = "Charred seeds represent massive stored grain supplies burned during an intense siege conflagration.";
    c_seeds_sg.scholar_name = "Wood (1990)";
    c_seeds_sg.source_id = "src-wood-1990";
    c_seeds_sg.topic = "Warfare";
    c_seeds_sg.status = "Contested";
    c_seeds_sg.chapter = "Chapter 4: Site Function & Material Culture";
    c_seeds_sg.site_ids = {"site-jericho"};
    storage.put_claim(c_seeds_sg);

    Claim c_regional;
    c_regional.id = "claim-regional-collapse";
    c_regional.project_id = project_id;
    c_regional.claim_text = "Evidence demonstrates a simultaneous regional collapse across the Southern Levant ca. 1200 BCE triggered by external warfare.";
    c_regional.scholar_name = "Doctoral Candidate Thesis Statement";
    c_regional.topic = "Warfare";
    c_regional.status = "Speculative";
    c_regional.chapter = "Chapter 3: Regional Chronologies";
    c_regional.site_ids = {"site-jericho", "site-megiddo", "site-hazor"};
    storage.put_claim(c_regional);

    // Chirki on Pravara - Real scanned OCR anomaly benchmark case
    Claim c_corvinus;
    c_corvinus.id = "claim-chirki-corvinus";
    c_corvinus.project_id = project_id;
    c_corvinus.claim_text = "Rubble boulder horizon resting on trap bedrock measured 20 to 40 cm in thickness.";
    c_corvinus.scholar_name = "Corvinus (1968)";
    c_corvinus.source_id = "src-corvinus-1968";
    c_corvinus.topic = "Stratigraphy";
    c_corvinus.status = "Verified";
    c_corvinus.chapter = "Chapter 2: Lower Palaeolithic Stratigraphy";
    c_corvinus.strata_ids = {"stratum-chirki-rubble"};
    c_corvinus.origin_type = "digital_stream";
    c_corvinus.verification_status = "VERIFIED";
    storage.put_claim(c_corvinus);

    Claim c_sankalia;
    c_sankalia.id = "claim-chirki-sankalia";
    c_sankalia.project_id = project_id;
    c_sankalia.claim_text = "The rubble horizon was 2040 cm thick, overlying the bedrock of trap basalt.";
    c_sankalia.scholar_name = "Sankalia (1974 Monograph Scan)";
    c_sankalia.source_id = "src-sankalia-1974";
    c_sankalia.topic = "Stratigraphy";
    c_sankalia.status = "Contested";
    c_sankalia.chapter = "Chapter 2: Lower Palaeolithic Stratigraphy";
    c_sankalia.strata_ids = {"stratum-chirki-rubble"};
    c_sankalia.origin_type = "scanned_ocr";
    c_sankalia.verification_status = "PENDING_VERIFICATION";
    c_sankalia.is_quantitative = true;
    c_sankalia.anomaly_flag = true;
    c_sankalia.anomaly_reason = "Outlier: 2040 cm (20.4 m) exceeds typical Acheulian gravel deposit by ~70x. Scan optical hyphen omitted.";
    c_sankalia.optical_crop_path = "/crops/crop_2040_raw.png";
    c_sankalia.ocr_confidence = 0.64;
    storage.put_claim(c_sankalia);

    // -------------------------------------------------------------
    // Layer C: Evidence Links
    // -------------------------------------------------------------
    EvidenceLink ev_ash;
    ev_ash.id = "ev-ash-layer";
    ev_ash.project_id = project_id;
    ev_ash.claim_id = "claim-kenyon-date";
    ev_ash.evidence_text = "Ash layer 0.4m thick, colluvial debris over mudbrick wall, burnt pottery assemblage";
    ev_ash.evidence_type = "supporting";
    ev_ash.physical_entity_type = "stratum";
    ev_ash.physical_entity_id = "stratum-jericho-ivb";
    ev_ash.source_ids = {"src-kenyon-1978"};
    ev_ash.date_info = "1550 BCE marker";
    storage.put_evidence(ev_ash);

    EvidenceLink ev_s_sup;
    ev_s_sup.id = "ev-seeds-sup";
    ev_s_sup.project_id = project_id;
    ev_s_sup.claim_id = "claim-seeds-domestic";
    ev_s_sup.evidence_text = "Seeds located adjacent to domestic hearth structure without ritual paraphernalia";
    ev_s_sup.evidence_type = "supporting";
    ev_s_sup.physical_entity_type = "sample";
    ev_s_sup.physical_entity_id = "sample-charred-seeds";
    ev_s_sup.source_ids = {"src-kenyon-1978"};
    storage.put_evidence(ev_s_sup);

    EvidenceLink ev_s_con;
    ev_s_con.id = "ev-seeds-con";
    ev_s_con.project_id = project_id;
    ev_s_con.claim_id = "claim-seeds-domestic";
    ev_s_con.evidence_text = "Seed density is uniformly distributed across storage jars, far exceeding domestic refuse density";
    ev_s_con.evidence_type = "contradicting";
    ev_s_con.physical_entity_type = "sample";
    ev_s_con.physical_entity_id = "sample-charred-seeds";
    ev_s_con.source_ids = {"src-wood-1990"};
    storage.put_evidence(ev_s_con);

    // -------------------------------------------------------------
    // Layer D: Discrepancy Verification Items (Optical Anti-Anchoring)
    // -------------------------------------------------------------
    VerificationItem v1;
    v1.id = "vitem-chirki-rubble";
    v1.project_id = project_id;
    v1.source_id = "src-sankalia-1974";
    v1.page_number = 42;
    v1.field_type = "measurement";
    v1.context_text = "The rubble horizon was 2040 cm thick, overlying the bedrock of trap basalt.";
    v1.crop_image_path = "/crops/crop_2040_raw.png";
    v1.candidate_a = "2040 cm";
    v1.candidate_b = "20-40 cm";
    v1.status = "PENDING";
    v1.audit_note = "Engines disagreed: Windows OCR = '2040 cm' vs VLM = '20-40 cm'. Hyphen broken in letterpress lead slug.";
    v1.created_date = "1727740800";
    storage.put_verification_item(v1);

    VerificationItem v2;
    v2.id = "vitem-jericho-catalogue";
    v2.project_id = project_id;
    v2.source_id = "src-kenyon-1978";
    v2.page_number = 51;
    v2.field_type = "catalogue_id";
    v2.context_text = "Registration catalogue index 694 recorded in locus B";
    v2.crop_image_path = "/crops/crop_694_raw.png";
    v2.candidate_a = "694";
    v2.candidate_b = "69-4";
    v2.status = "PENDING";
    v2.audit_note = "Catalogue sub-index hyphen split across damaged lead slug.";
    v2.created_date = "1727740800";
    storage.put_verification_item(v2);

    VerificationItem v3;
    v3.id = "vitem-hazor-unlinked";
    v3.project_id = project_id;
    v3.source_id = "src-kenyon-1978";
    v3.page_number = 73;
    v3.field_type = "chronology";
    v3.context_text = "Fortification phase attributed to Solomonic stratum XA vs XB";
    v3.crop_image_path = ""; // Deliberately missing crop: demonstrates Anti-Anchoring Lockout!
    v3.candidate_a = "Stratum XA";
    v3.candidate_b = "Stratum XB";
    v3.status = "PENDING";
    v3.audit_note = "Optical scan crop unlinked. Resolution locked to prevent cognitive bias.";
    v3.created_date = "1727740800";
    storage.put_verification_item(v3);

    storage.save_state();
}

} // namespace archaeophd
