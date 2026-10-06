// Script: generate_audit_table.cjs
// Purpose: Deterministically generate the 22-fact forensic audit Markdown table
// directly from evaluated_166.json (commit 17266e1) and hand_audit_22.json.
// Eliminates manual transcription and drift across reports.

const fs = require('fs');
const path = require('path');

const evPath = path.join(__dirname, 'evaluated_166.json');
const auditPath = path.join(__dirname, 'hand_audit_22.json');

const ev166 = JSON.parse(fs.readFileSync(evPath, 'utf8'));
const audit22 = JSON.parse(fs.readFileSync(auditPath, 'utf8'));

const evMap = {};
for (const item of ev166) {
  evMap[item.id] = item;
}

const auditIds = Object.keys(audit22).map(Number).sort((a, b) => a - b);

// Target expectations mapped directly to Step 4 Dev Set
const expectedOutputs = {
  37: {
    expected: "`EXTRACT_ATTRIBUTED`: `1947` (CE), subject `newspaper_report_date`",
    analysis: "Historical: Nearest-token picker captured adjacent 10,000 near 'brain surgery'. Generator must bind 1947 to date slot and suppress prehistoric 10,000."
  },
  51: {
    expected: "`EXTRACT_ATTRIBUTED`: `6 m`, subject `stratum_depth`",
    analysis: "Historical: Picker stripped unit 'm', emitting bare 6. Generator must strictly bind and preserve unit 'm'."
  },
  55: {
    expected: "`ROUTE_AMBIGUOUS_OR_UNANCHORED`: GT absent; duration `5` not a calendar date",
    analysis: "Historical: GT 415 A.D. absent from paragraph; picker captured regnal duration 5. Generator must route to queue as unanchored."
  },
  56: {
    expected: "`ROUTE_AMBIGUOUS_OR_UNANCHORED`: GT absent; duration `5` not a calendar date",
    analysis: "Historical: GT 428 A.D. absent from window; picker captured duration 5. Generator must route to queue as unanchored."
  },
  65: {
    expected: "`EXTRACT_ATTRIBUTED`: `1545-48` (CE range), subject `viceroy_office_tenure`",
    analysis: "Historical: Picker selected arrival year 1538. Generator must bind tenure slot to clausal range 1545-48."
  },
  73: {
    expected: "`ROUTE_AMBIGUOUS_OR_UNANCHORED`: GT absent; page `323-32` rejected (Rule 1)",
    analysis: "Historical: GT 1712 appears on next page; picker grabbed journal page citation 323-32. Generator must reject page numbers and route unanchored query."
  },
  84: {
    expected: "`EXTRACT_ATTRIBUTED`: `1780` (CE), subject `monograph_publication_year`",
    analysis: "Historical: Picker grabbed travel departure 1763. Generator must bind publication slot to 1780 in Amsterdam clause."
  },
  93: {
    expected: "`EXTRACT_ATTRIBUTED`: `40 miles`, subject `geographic_distance`",
    analysis: "Historical: Candidate picker stripped unit 'miles'. Generator must preserve physical unit 'miles'."
  },
  95: {
    expected: "`EXTRACT_ATTRIBUTED`: `1927` (CE), subject `revised_edition_date`",
    analysis: "Historical: Picker grabbed initial edition 1923. Generator must bind second edition slot to 1927."
  },
  97: {
    expected: "`EXTRACT_ATTRIBUTED`: `5199 BC` (-5198 astro), subject `clement_creation_estimate`",
    analysis: "Historical: Picker selected rabbinical 3700 BC. Generator must bind Clement estimate slot to 5199 BC."
  },
  117: {
    expected: "`EXTRACT_ATTRIBUTED`: `1816` (CE), subject `curator_appointment_year`",
    analysis: "Historical: Picker grabbed scholar lifespan 1788-1865. Generator must bind appointment slot to 1816."
  },
  119: {
    expected: "`EXTRACT_ATTRIBUTED`: `1839` (CE), subject `guidebook_publication_year`",
    analysis: "Historical: Picker grabbed museum opening 1819. Generator must bind guidebook release slot to 1839."
  },
  124: {
    expected: "`EXTRACT_ATTRIBUTED`: `1820-1903` (CE range), subject `spencer_lifespan`",
    analysis: "Historical: Picker grabbed book date 1859. Generator must bind Spencer lifespan slot to compound range 1820-1903."
  },
  135: {
    expected: "`EXTRACT_ATTRIBUTED`: `1870` (CE), subject `second_treatise_publication`",
    analysis: "Historical: Picker grabbed first treatise date 1865. Generator must bind second volume slot to 1870."
  },
  139: {
    expected: "`EXTRACT_ATTRIBUTED`: `1542` (CE), subject `xavier_mission_arrival`",
    analysis: "Historical: Picker grabbed lifespan 1506-1552. Generator must bind Goa arrival slot to 1542."
  },
  143: {
    expected: "`EXTRACT_ATTRIBUTED`: `1631-1641` (CE range), subject `dutch_trading_tenure`",
    analysis: "Historical: Picker truncated range to single number 1631. Generator must capture full lexical range '1631 to 1641'."
  },
  144: {
    expected: "`REJECT_NON_FINDING`: Suppress Rule 2 citation `(1956:81)`, emit NO candidate",
    analysis: "Historical: Picker extracted 1956 as partial read. Correct Rule 2 behavior: suppress entire author-date citation; emit zero finding candidates."
  },
  148: {
    expected: "`FLAG_AMBIGUOUS_MULTI_CANDIDATE`: Bundle competing candidates `[1952, 1954]`",
    analysis: "Historical: Scorer arbitrarily picked Wheeler 1954 over Kenyon 1952. Generator must flag clausal ambiguity and bundle both candidates for human review."
  },
  151: {
    expected: "`EXTRACT_ATTRIBUTED`: `30%`, subject `conservation_chemical_concentration`",
    analysis: "Historical: Picker dropped '%' symbol. Generator must strictly preserve physical unit '%'."
  },
  152: {
    expected: "`EXTRACT_ATTRIBUTED`: `2 hours`, subject `soaking_duration` (reject header 181)",
    analysis: "Historical: Scorer displaced to running header 181. Generator must reject folio numbers (Rule 1) and bind 2 hours."
  },
  153: {
    expected: "`EXTRACT_ATTRIBUTED`: `10%`, subject `reagent_concentration`",
    analysis: "Historical: Picker dropped '%' symbol. Generator must strictly preserve physical unit '%'."
  },
  154: {
    expected: "`FLAG_AMBIGUOUS_MULTI_CANDIDATE`: Bundle competing candidates `[10%, 3%]`",
    analysis: "Historical: Scorer arbitrarily picked 10% over 3% in same clause. Generator must flag clausal ambiguity and bundle both candidates for human review."
  }
};

console.log('| # | Fact ID | Page ID | Print Class & Type | Ground Truth | Extracted (Tess / Win) | Audited Category | Expected Step 4 Generator Output | Historical Diagnosis & Clausal Rationale |');
console.log('| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- | :--- |');

let index = 1;
for (const id of auditIds) {
  const item = evMap[id];
  const audit = audit22[id];
  if (!item || !audit) continue;

  const tess = item.tess_cand ? item.tess_cand.raw : 'N/A';
  const win = item.win_cand ? item.win_cand.raw : 'N/A';
  const candStr = (tess === win) ? tess : `${tess} / ${win}`;

  let cat = 'SCORER_TOKEN_DISPLACEMENT';
  if (audit.cat === 'unit or symbol dropped') {
    cat = 'UNIT_LOST';
  } else if (audit.cat === 'GT absent from window') {
    cat = 'AGREED_WRONG_CANDIDATE_GT_ABSENT';
  } else if (audit.cat === 'partial read') {
    if (id === 144) {
      cat = 'BIBLIO_CITATION_REJECTION';
    } else {
      cat = 'PARTIAL_RANGE_TRUNCATION';
    }
  }

  if (id === 148 || id === 154) {
    cat = 'AMBIGUOUS_MULTI_CANDIDATE';
  }

  const exp = expectedOutputs[id] || { expected: "N/A", analysis: audit.analysis };
  const sanitizedAnalysis = exp.analysis.replace(/\|/g, '-');

  console.log(`| **${index++}** | **#${item.id}** | \`${item.page_id}\` | ${item.class}, ${item.type} | \`${item.true_value}\` | \`${candStr}\` | \`${cat}\` | ${exp.expected} | ${sanitizedAnalysis} |`);
}
