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

console.log('| # | Fact ID | Page ID | Print Class & Type | Ground Truth | Extracted (Tess / Win) | Audited Category | Description & Clausal Analysis |');
console.log('| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :--- |');

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

  // Sanitize Markdown pipes
  const desc = (item.description || '').replace(/\|/g, '-');
  const analysis = (audit.analysis || '').replace(/\|/g, '-');

  console.log(`| **${index++}** | **#${item.id}** | \`${item.page_id}\` | ${item.class}, ${item.type} | \`${item.true_value}\` | \`${candStr}\` | \`${cat}\` | **${desc}.** ${analysis} |`);
}
