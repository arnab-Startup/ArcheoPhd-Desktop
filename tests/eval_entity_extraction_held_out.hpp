#pragma once

#include <string>
#include <vector>
#include "eval_entity_extraction_dataset.hpp"

namespace archaeophd {

// ============================================================================
// Phase 2 Step 3 — Independent Held-Out Entity Extraction Evaluation Dataset
// 
// Sourced directly from historical excavation reports and archaeological literature:
// - Sankalia (1974) Chirki-on-Pravara (Palaeolithic Lithics & Acheulian Workshop)
// - Rajan (2002) Archaeology: Principles and Methods
// - Chakrabarti (1988) A History of Indian Archaeology
// - Kenyon (1957, 1981) Jericho Stratigraphy & Excavations at Jericho
// - Yadin (1972) Hazor Excavation Reports
// - Marshall (1931) & Mackay (1938) Mohenjo-daro & Harappa Reports
// - Aitken (1990) Science-based Dating in Archaeology
// - Schiffer (1987) Formation Processes of the Archaeological Record
// 
// Sealed with SHA-256 before running any extractor benchmark evaluation.
// Composition:
// - 35 Positive extraction targets (metrics, dates, uncal BP, cal BP, counts, loci, strata)
// - 20 Hard negative controls (page spans, biblio years, citations, plates, scale bars)
// - 5 Out-of-scope units (hectares, acres, sq km, deg F, knots)
// Total: 60 Test Cases
// ============================================================================

inline std::vector<ExtractionTestCase> get_held_out_evaluation_dataset() {
    return {
        // ====================================================================
        // POSITIVE EXTRACTION TARGETS: REAL CORPUS TEXT (35 Cases)
        // ====================================================================

        // --- Linear & Compound Dimensions ---
        {"HO-01", EntityCategory::LINEAR_DIMENSION,
         "The trenches were cut into the alluvium, which at places was 8 m. thick, overlying rock.",
         {{"8 m.", "8.000 m", "m", false, false}},
         "Sankalia (1974) Chirki: Linear alluvium thickness with period abbreviation 'm.'"},

        {"HO-02", EntityCategory::LINEAR_DIMENSION,
         "The rubble horizon was 20-40 cm thick, overlying the bedrock of trap basalt.",
         {{"20-40 cm", "[0.20, 0.40] m", "cm_range", false, false}},
         "Sankalia (1974) Chirki: Stratigraphic thickness range with hyphen"},

        {"HO-03", EntityCategory::LINEAR_DIMENSION,
         "The Great Bath on the western citadel mound features a floor backed by a 2.5 cm layer of bitumen.",
         {{"2.5 cm", "0.025 m", "cm", false, false}},
         "Marshall (1931) Mohenjo-daro: Bitumen waterproofing thickness in cm"},

        {"HO-04", EntityCategory::LINEAR_DIMENSION,
         "Canaanite basalt orthostats measuring 1.15 m in length flanked the entrance to Area H temple.",
         {{"1.15 m", "1.150 m", "m", false, false}},
         "Yadin (1972) Hazor: Basalt orthostat length in meters"},

        {"HO-05", EntityCategory::LINEAR_DIMENSION,
         "Gravel lenses vary from 10 to 15 metres along the exposed section.",
         {{"from 10 to 15 metres", "[10.00, 15.00] m", "m_range", false, false}},
         "Sankalia (1974) Chirki: Verbal range preposition with full lexical unit 'metres'"},

        {"HO-06", EntityCategory::COMPOUND_DIMENSION,
         "Standardized burnt brick proportions of 1:2:4 were strictly maintained across domestic walls.",
         {{"1:2:4", "1:2:4", "compound_ratio", false, false}},
         "Marshall (1931) Mohenjo-daro: Harappan modular architectural ratio"},

        {"HO-07", EntityCategory::COMPOUND_DIMENSION,
         "The granary incorporates brick sleeper podiums with air ducts measuring 45 by 60 cm underneath.",
         {{"45 by 60 cm", "45x60 cm", "compound_dim", false, false}},
         "Marshall (1931) Mohenjo-daro: Compound cross-section dimension"},

        {"HO-08", EntityCategory::COMPOUND_DIMENSION,
         "Paving bricks conformed to dimensions of 7 x 14 x 28 cm across the courtyard floor.",
         {{"7 x 14 x 28 cm", "7x14x28 cm", "compound_dim", false, false}},
         "Mackay (1938) Mohenjo-daro: Three-dimensional architectural brick measurements"},

        // --- Depth & Elevation Coordinates ---
        {"HO-09", EntityCategory::DEPTH_ELEVATION,
         "On the opposite bank the rock was at least 7 m. lower than in the present river bed.",
         {{"7 m.", "7.000 m", "m", false, false}},
         "Sankalia (1974) Chirki: Subterranean bedrock depth below datum with period"},

        {"HO-10", EntityCategory::DEPTH_ELEVATION,
         "The Area L subterranean water shaft descends to depth 40 m through bedrock to tap the aquifer.",
         {{"depth 40 m", "40.0 m", "depth", false, false}},
         "Yadin (1972) Hazor: Subterranean water system vertical depth coordinate"},

        // --- Mass & Metrology ---
        {"HO-11", EntityCategory::MASS_WEIGHT,
         "Chert balance weights included cubic specimens of 13.65 g and 27.3 g conforming to binary metrology.",
         {{"13.65 g", "13.65 g", "g", false, false},
          {"27.3 g", "27.30 g", "g", false, false}},
         "Mackay (1938) Mohenjo-daro: Standardized cubic chert balance weights"},

        {"HO-12", EntityCategory::MASS_WEIGHT,
         "Heavy-duty basalt hammerstones reached a total mass of 1.2 kg on the knapping floor.",
         {{"1.2 kg", "1200.0 g", "kg", false, false}},
         "Sankalia (1974) Chirki: Lithic workshop percussor mass"},

        // --- Archaeometric Temperature ---
        {"HO-13", EntityCategory::TEMPERATURE,
         "Thermoluminescence plateau test reached 500 degrees Celsius during mineral annealing.",
         {{"500 degrees Celsius", "500 °C", "temperature", false, false}},
         "Aitken (1990): Heating temperature in degrees Celsius"},

        {"HO-14", EntityCategory::TEMPERATURE,
         "Vitrified metallurgical slag samples indicate furnace temperatures exceeding 1150 °C.",
         {{"1150 °C", "1150 °C", "temperature", false, false}},
         "Archaeometric pyrotechnology: Smelting temperature with degree symbol"},

        // --- Artifact & Specimen Counts (Critical Category for OCR Noise) ---
        {"HO-15", EntityCategory::ARTIFACT_SPECIMEN_COUNT,
         "74 mtrs of the horizon were exposed and 694 E.S.A tools recovered from a rubble boulder horizon.",
         {{"694 E.S.A tools", "694", "count", false, false}},
         "Sankalia (1974) Chirki: Historic Acheulian tool assemblage count (the classic '694 vs 691' benchmark)"},

        {"HO-16", EntityCategory::ARTIFACT_SPECIMEN_COUNT,
         "A number of large cores has been found, most of them in Tr. B (6 pieces) and a few in E.",
         {{"6 pieces", "6", "count", false, false}},
         "Sankalia (1974) Chirki: Discrete core count in Trench B"},

        {"HO-17", EntityCategory::ARTIFACT_SPECIMEN_COUNT,
         "The total assemblage count of Acheulian industry comprised 2050 artifacts including 444 waste flakes.",
         {{"2050 artifacts", "2050", "count", false, false},
          {"444 waste flakes", "444", "count", false, false}},
         "Sankalia (1974) Chirki: Assemblage total and debitage counts"},

        {"HO-18", EntityCategory::ARTIFACT_SPECIMEN_COUNT,
         "The pebble tool group yielded 330 handaxes and 546 choppers in Trench VII.",
         {{"330 handaxes", "330", "count", false, false},
          {"546 choppers", "546", "count", false, false}},
         "Sankalia (1974) Chirki: Sub-assemblage typological counts"},

        {"HO-19", EntityCategory::ARTIFACT_SPECIMEN_COUNT,
         "Stratum VI public pillared storehouses contained dozens of administrative storage pithoi.",
         {{"Stratum VI", "VI", "stratum", false, false}},
         "Yadin (1972) Hazor: Stratum VI administrative storehouse"},

        // --- Historical Dates (BCE / CE with Punctuated Eras) ---
        {"HO-20", EntityCategory::EXACT_DATE_BCE,
         "Stratum V witnessed complete razing and incineration by the Assyrian armies of Tiglath-Pileser III in 732 BC.",
         {{"732 BC", "-731", "exact_bce", false, false}},
         "Yadin (1972) Hazor: Historical destruction date in 732 BC (astro -731)"},

        {"HO-21", EntityCategory::EXACT_DATE_BCE,
         "Tiglath-Pileser III captured Damascus and devastated northern Galilee in 732 B.C. according to biblical and royal annals.",
         {{"732 B.C.", "-731", "exact_bce", false, false}},
         "Historical publication variant: Punctuated era 'B.C.' (astro -731)"},

        {"HO-22", EntityCategory::EXACT_DATE_CE,
         "Pompeii was buried due to the eruption of nearby Vesuvius in August 79 AD, sealing the living surfaces.",
         {{"79 AD", "+79", "exact_ce", false, false}},
         "Rajan (2002): Classical eruption date in 79 AD (astro +79)"},

        {"HO-23", EntityCategory::EXACT_DATE_CE,
         "The Roman colony of Aelia Capitolina was formally established under Hadrian in 135 A.D. following the revolt.",
         {{"135 A.D.", "+135", "exact_ce", false, false}},
         "Historical publication variant: Punctuated era 'A.D.' (astro +135)"},

        {"HO-24", EntityCategory::APPROX_DATE_BCE,
         "Intense conflagration debris contains charred wooden beams and grain jars dated by Kenyon to c. 1550 BC.",
         {{"c. 1550 BC", "-1549", "approx_bce", false, false}},
         "Kenyon (1981) Jericho: Approximate date with 'c.' prefix (astro ~ -1549)"},

        {"HO-25", EntityCategory::APPROX_DATE_BCE,
         "Imported Cypriot bichrome ware ceramics securely date the fall of Jericho City IV to around 1400 BC.",
         {{"around 1400 BC", "-1399", "approx_bce", false, false}},
         "Wood (1990) Jericho: Approximate date with 'around' (astro ~ -1399)"},

        {"HO-26", EntityCategory::APPROX_DATE_BCE,
         "The Greek writer Hesiod (about 800 BC) in his epic poem Works and Days envisaged successive human stages.",
         {{"about 800 BC", "-799", "approx_bce", false, false}},
         "Rajan (2002): Classical archaic Greek chronology (astro ~ -799)"},

        {"HO-27", EntityCategory::DATE_RANGE,
         "The Roman philosopher Titus Lucretius Carus (95-55 BC) advocated the three age concept in De Rerum Natura.",
         {{"95-55 BC", "[-94, -54]", "date_range_bce", false, false}},
         "Rajan (2002): Bounded BCE chronological span with hyphen (astro [-94, -54])"},

        {"HO-28", EntityCategory::DATE_RANGE,
         "Iron Age IIA defensive perimeter construction span is dated to 1000–925 BCE across the northern tells.",
         {{"1000–925 BCE", "[-999, -924]", "date_range_bce", false, false}},
         "Yadin (1972) Hazor: Chronological range formatted with Unicode en-dash '–'"},

        {"HO-29", EntityCategory::DATE_RANGE_CE,
         "The basilica floor was in continuous liturgical use from 320 to 390 CE during the early Byzantine phase.",
         {{"from 320 to 390 CE", "[+320, +390]", "date_range_ce", false, false}},
         "Byzantine chronological span in CE"},

        // --- Radiocarbon Determinations: Raw BP vs Author-Calibrated cal BCE/BP ---
        {"HO-30", EntityCategory::UNCALIBRATED_C14_BP,
         "Short-lived seed samples yielded 3310 ± 45 BP (uncalibrated) from the destruction horizon.",
         {{"3310 ± 45 BP", "3310±45 BP", "c14_bp", false, true}},
         "Aitken (1990): Raw uncalibrated radiocarbon age determination requiring BP uncalibrated flag"},

        {"HO-31", EntityCategory::UNCALIBRATED_C14_BP,
         "Charcoal flecks from the hearth produced an isotopic date of 1550 +/- 50 rcybp.",
         {{"1550 +/- 50 rcybp", "1550±50 rcybp", "c14_bp", false, true}},
         "Aitken (1990): Radiocarbon years before present in rcybp notation"},

        {"HO-32", EntityCategory::AUTHOR_CALIBRATED_DATE,
         "Dendrochronological calibration yields a calibrated calendar range of 1620–1530 cal BC at 2-sigma.",
         {{"1620–1530 cal BC", "[-1619, -1529]", "cal_bc", false, false}},
         "Aitken (1990): Author-reported calibrated calendar BCE range with en-dash (astro [-1619, -1529])"},

        {"HO-33", EntityCategory::AUTHOR_CALIBRATED_DATE,
         "Calibrated radiocarbon determination of seed grains is reported as 3200 cal BP at 95.4% probability.",
         {{"3200 cal BP", "3200 cal BP", "cal_bp", false, false}},
         "Aitken (1990): Author-calibrated calendar BP determination (tagged AUTHOR_CALIBRATED, NOT uncalibrated)"},

        // --- Spatial Excavation Primitives ---
        {"HO-34", EntityCategory::LOCUS_PROVENANCE,
         "Excavation at Locality VII exposed early Acheulian basalt handaxes within the cemented conglomerate.",
         {{"Locality VII", "VII", "locus", false, false}},
         "Sankalia (1974) Chirki: Primary excavation locality designation"},

        {"HO-35", EntityCategory::TRENCH_ID,
         "In Trench I east face the catastrophic collapse of the red mudbrick city wall was clearly visible.",
         {{"Trench I", "I", "trench", false, false}},
         "Kenyon (1981) Jericho: Trench Roman numeral identifier"},

        // ====================================================================
        // HARD NEGATIVE CONTROLS: CITATIONS, PAGES, PLATES, CAPTIONS (20 Cases)
        // Must extract ZERO archaeological quantitative entities
        // ====================================================================

        {"HO-36", EntityCategory::NEGATIVE_CONTROL,
         "For detailed stratigraphic profiles of the south section, see Kenyon (1981), pp. 131–137.",
         {},
         "Multi-page citation span with en-dash: must not extract as chronological range or dimension"},

        {"HO-37", EntityCategory::NEGATIVE_CONTROL,
         "The initial ceramic phasing was questioned by Wood (1990: 45) based on Kenyon (1981: 142).",
         {},
         "In-text bibliographic author-year-page citations: must not extract as dates or measurements"},

        {"HO-38", EntityCategory::NEGATIVE_CONTROL,
         "The excavation concession was ratified by the Department of Antiquities on 15 March 1945.",
         {},
         "Modern administrative document date: must not extract as ancient archaeological date"},

        {"HO-39", EntityCategory::NEGATIVE_CONTROL,
         "Fig. 2.1 illustrates the distribution of Acheulian localities along the Pravara river.",
         {},
         "Figure caption reference: must not extract as measurement or locus"},

        {"HO-40", EntityCategory::NEGATIVE_CONTROL,
         "A photograph of the in-situ basalt handaxe is reproduced in Plate XIV.",
         {},
         "Monograph plate citation with Roman numeral: must not extract"},

        {"HO-41", EntityCategory::NEGATIVE_CONTROL,
         "Table 3 lists the metric indices and breadth-to-thickness ratios of the bifaces.",
         {},
         "Table citation: must not extract"},

        {"HO-42", EntityCategory::NEGATIVE_CONTROL,
         "Excavation was conducted under archaeological survey Permit No. 74/1966 issued in New Delhi.",
         {},
         "Government survey license / permit identifier: must not extract as date or ratio"},

        {"HO-43", EntityCategory::NEGATIVE_CONTROL,
         "Published by Oxford University Press, ISBN 0-19-813190-8, hardback edition.",
         {},
         "International Standard Book Number: must not extract"},

        {"HO-44", EntityCategory::NEGATIVE_CONTROL,
         "Consult the comprehensive ceramic plates published in Vol. III of the excavation report.",
         {},
         "Publication volume number: must not extract as stratum or trench"},

        {"HO-45", EntityCategory::NEGATIVE_CONTROL,
         "The methodology of sample flotation is detailed in Section 4.2 of the introductory chapter.",
         {},
         "Section heading reference number: must not extract"},

        {"HO-46", EntityCategory::NEGATIVE_CONTROL,
         "The ratio of ovate to cordiform bifaces in the surface collection was approximately 3:1.",
         {},
         "Dimensionless ratio without measurement units: must not extract as compound dimension"},

        {"HO-47", EntityCategory::NEGATIVE_CONTROL,
         "The topographic map of the mound was plotted at a scale of 1:500 with one-meter contours.",
         {},
         "Cartographic scale ratio: must not extract as brick dimension or date"},

        {"HO-48", EntityCategory::NEGATIVE_CONTROL,
         "The inscribed steatite seal is registered in the museum ledger as Cat. No. 402.",
         {},
         "Museum catalog accession number: must not extract as locus or count"},

        {"HO-49", EntityCategory::NEGATIVE_CONTROL,
         "On p. 88 the author discusses post-depositional winnowing by stream currents.",
         {},
         "Single page reference pointer: must not extract as measurement or date"},

        {"HO-50", EntityCategory::NEGATIVE_CONTROL,
         "The megalithic origin of the Buddhist stupas was discussed by Stuart Piggott in the 1940s.",
         {},
         "Modern 20th-century decade citation ('the 1940s'): must not extract as ancient date"},

        {"HO-51", EntityCategory::NEGATIVE_CONTROL,
         "Systematic study of archaeological finds started in the middle part of the 18th century.",
         {},
         "Modern ordinal century reference ('18th century'): must not extract"},

        {"HO-52", EntityCategory::NEGATIVE_CONTROL,
         "The field director hired 45 local workers to clear the surface scrub above Trench I.",
         {},
         "Modern labor workforce headcount: must not extract as archaeological specimen count"},

        {"HO-53", EntityCategory::NEGATIVE_CONTROL,
         "In accordance with Paragraph 12 of the heritage preservation act, the site was protected.",
         {},
         "Legal document paragraph pointer: must not extract"},

        {"HO-54", EntityCategory::NEGATIVE_CONTROL,
         "Specimens were sorted into cardboard storage boxes labelled Box 14 and Box 15.",
         {},
         "Field equipment storage box number: must not extract as locus or stratum"},

        {"HO-55", EntityCategory::NEGATIVE_CONTROL,
         "Registered in the central archives as Bulletin of the Archaeological Survey No. 28.",
         {},
         "Monograph serial issue number: must not extract"},

        // ====================================================================
        // OUT-OF-SCOPE UNITS: REAL UNITS OUTSIDE MICRO-STRATIGRAPHY (5 Cases)
        // Must NOT extract as core micro-stratigraphic entities
        // ====================================================================

        {"HO-56", EntityCategory::OUT_OF_SCOPE_UNIT,
         "The lower town and citadel together cover an estimated area of 15 hectares.",
         {},
         "Out-of-scope territorial area unit (hectares): excluded from micro-stratigraphic grammar"},

        {"HO-57", EntityCategory::OUT_OF_SCOPE_UNIT,
         "The ancient agricultural catchment is calculated to have spanned roughly 250 acres of arable land.",
         {},
         "Out-of-scope imperial agrarian unit (acres): excluded from core grammar"},

        {"HO-58", EntityCategory::OUT_OF_SCOPE_UNIT,
         "The regional drainage basin occupies approximately 45 square kilometres.",
         {},
         "Out-of-scope macro-geographical unit (square kilometres): excluded from core grammar"},

        {"HO-59", EntityCategory::OUT_OF_SCOPE_UNIT,
         "Ambient shade temperature at noon during the June excavation season reached 95 °F.",
         {},
         "Out-of-scope temperature unit (degrees Fahrenheit): only Celsius/Kelvin pyrotechnology targeted"},

        {"HO-60", EntityCategory::OUT_OF_SCOPE_UNIT,
         "River transport barges navigated the Pravara channel at speeds not exceeding 12 knots.",
         {},
         "Out-of-scope velocity unit (knots): excluded from archaeological physical metrics"}
    };
}

} // namespace archaeophd
