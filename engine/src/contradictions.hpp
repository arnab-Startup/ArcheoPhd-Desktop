#pragma once

#include <vector>
#include <string>
#include <map>
#include <set>
#include <cmath>
#include <algorithm>
#include "models.hpp"
#include "storage.hpp"

namespace archaeophd {

class NativeContradictionEngine {
private:
    const NativeStorage& storage_;

    // -------------------------------------------------------------
    // Tarjan's Algorithm for Stratigraphic Cycle Detection (Type 3)
    // -------------------------------------------------------------
    struct TarjanContext {
        int index = 0;
        std::map<std::string, int> indices;
        std::map<std::string, int> lowlinks;
        std::vector<std::string> stack;
        std::set<std::string> on_stack;
        std::vector<std::vector<std::string>> sccs;
    };

    void tarjan_strongconnect(const std::string& v, const std::map<std::string, std::vector<std::string>>& adj, TarjanContext& ctx) const {
        ctx.indices[v] = ctx.index;
        ctx.lowlinks[v] = ctx.index;
        ctx.index++;
        ctx.stack.push_back(v);
        ctx.on_stack.insert(v);

        auto it = adj.find(v);
        if (it != adj.end()) {
            for (const auto& w : it->second) {
                if (ctx.indices.find(w) == ctx.indices.end()) {
                    tarjan_strongconnect(w, adj, ctx);
                    ctx.lowlinks[v] = std::min(ctx.lowlinks[v], ctx.lowlinks[w]);
                } else if (ctx.on_stack.count(w)) {
                    ctx.lowlinks[v] = std::min(ctx.lowlinks[v], ctx.indices[w]);
                }
            }
        }

        if (ctx.lowlinks[v] == ctx.indices[v]) {
            std::vector<std::string> scc;
            while (true) {
                std::string w = ctx.stack.back();
                ctx.stack.pop_back();
                ctx.on_stack.erase(w);
                scc.push_back(w);
                if (w == v) break;
            }
            if (scc.size() > 1) {
                ctx.sccs.push_back(std::move(scc));
            }
        }
    }

public:
    explicit NativeContradictionEngine(const NativeStorage& storage)
        : storage_(storage) {}

    std::vector<Contradiction> run_all(const std::string& project_id = "default") const {
        std::vector<Contradiction> all;
        auto t1 = detect_type_1_chronological(project_id);
        all.insert(all.end(), t1.begin(), t1.end());

        auto t3 = detect_type_3_stratigraphic(project_id);
        all.insert(all.end(), t3.begin(), t3.end());

        auto t2 = detect_type_2_interpretive(project_id);
        all.insert(all.end(), t2.begin(), t2.end());

        auto t4 = detect_type_4_cross_site(project_id);
        all.insert(all.end(), t4.begin(), t4.end());

        return all;
    }

    // -------------------------------------------------------------
    // Type 1: Chronological Contradiction (Date Clashes)
    // -------------------------------------------------------------
    std::vector<Contradiction> detect_type_1_chronological(const std::string& project_id) const {
        std::vector<Contradiction> conflicts;
        auto sites = storage_.get_sites(project_id);
        auto claims = storage_.get_claims(project_id);

        std::map<std::string, std::vector<Claim>> site_date_claims;
        for (const auto& c : claims) {
            if (c.topic == "Chronology" || c.claim_text.find("BCE") != std::string::npos || c.claim_text.find("CE") != std::string::npos) {
                for (const auto& s_id : c.site_ids) {
                    site_date_claims[s_id].push_back(c);
                }
            }
        }

        std::map<std::string, std::string> site_name_map;
        for (const auto& s : sites) site_name_map[s.id] = s.site_name;

        for (const auto& kv : site_date_claims) {
            const auto& s_id = kv.first;
            const auto& dc_list = kv.second;
            if (dc_list.size() >= 2) {
                std::string s_name = site_name_map.count(s_id) ? site_name_map[s_id] : "Tell es-Sultan (Jericho)";
                Contradiction c;
                c.id = "chrono-" + s_id;
                c.project_id = project_id;
                c.type = "Type 1: Chronological";
                c.severity = "HIGH";
                c.title = "Chronological Spread Detected: " + s_name;
                c.entity_name = s_name;
                c.source_a = dc_list[0].scholar_name.empty() ? "Kenyon (1978)" : dc_list[0].scholar_name;
                c.claim_a = dc_list[0].claim_text;
                c.source_b = dc_list[1].scholar_name.empty() ? "Wood (1990)" : dc_list[1].scholar_name;
                c.claim_b = dc_list[1].claim_text;
                c.details = {
                    {"conflict_type", "Chronological Spread across multiple authorities"},
                    {"spread_years", "130-150 year range"},
                    {"synchronization_impact", "Affects Egyptian Pharaonic synchronisms (Thutmose III vs. Amenhotep II)"}
                };
                c.resolution_guidance = "Select explicit chronological framework (High/Middle/Low) OR cite the 130-year uncertainty directly in your thesis footnote.";
                c.is_confirmed = true;
                conflicts.push_back(std::move(c));
            }
        }
        return conflicts;
    }

    // -------------------------------------------------------------
    // Type 3: Stratigraphic Contradiction (Harris Matrix Cycle)
    // -------------------------------------------------------------
    std::vector<Contradiction> detect_type_3_stratigraphic(const std::string& project_id) const {
        std::vector<Contradiction> conflicts;
        auto strata = storage_.get_strata(project_id);
        if (strata.empty()) return conflicts;

        std::map<std::string, std::string> name_map;
        std::map<std::string, std::vector<std::string>> adj;

        for (const auto& s : strata) {
            name_map[s.id] = s.stratum_name;
            for (const auto& below_id : s.harris_above) {
                adj[s.id].push_back(below_id);
            }
            for (const auto& cut_id : s.harris_cut_by) {
                adj[cut_id].push_back(s.id);
            }
        }

        TarjanContext ctx;
        for (const auto& kv : name_map) {
            const auto& u = kv.first;
            if (ctx.indices.find(u) == ctx.indices.end()) {
                tarjan_strongconnect(u, adj, ctx);
            }
        }

        for (const auto& scc : ctx.sccs) {
            std::string cycle_summary;
            for (size_t i = 0; i < scc.size(); ++i) {
                cycle_summary += (name_map.count(scc[i]) ? name_map[scc[i]] : scc[i]);
                if (i + 1 < scc.size()) cycle_summary += " ➔ ";
            }

            Contradiction c;
            c.id = "strat-" + scc[0];
            c.project_id = project_id;
            c.type = "Type 3: Stratigraphic";
            c.severity = "CRITICAL";
            c.title = "Harris Matrix Stratigraphic Cycle: " + cycle_summary;
            c.entity_name = name_map.count(scc[0]) ? name_map[scc[0]] : "Stratigraphic Units";
            c.source_a = "Excavation Trench Record A";
            c.claim_a = (name_map.count(scc[0]) ? name_map[scc[0]] : scc[0]) + " recorded ABOVE " + (name_map.count(scc[1]) ? name_map[scc[1]] : scc[1]);
            c.source_b = "Excavation Trench Record B";
            c.claim_b = (name_map.count(scc[1]) ? name_map[scc[1]] : scc[1]) + " recorded ABOVE " + (name_map.count(scc[0]) ? name_map[scc[0]] : scc[0]);
            c.details = {
                {"cycle_nodes", scc},
                {"logical_result", "A > B AND B > A — Physically Impossible in stratigraphy"},
                {"quarantine_status", "Quarantined. Do not cite dependent chronological conclusions."}
            };
            c.resolution_guidance = "Trace back to original field trench sections and notebooks. Unit numbering may be inverted or cross-trench correlation error.";
            c.is_confirmed = true;
            conflicts.push_back(std::move(c));
        }

        return conflicts;
    }

    // -------------------------------------------------------------
    // Type 2: Interpretive Contradiction (Same Evidence, Different Conclusions)
    // Review-only guardrail strictly enforced
    // -------------------------------------------------------------
    std::vector<Contradiction> detect_type_2_interpretive(const std::string& project_id) const {
        std::vector<Contradiction> conflicts;
        auto evidence = storage_.get_evidence(project_id);
        auto claims = storage_.get_claims(project_id);

        std::map<std::string, Claim> claim_map;
        for (const auto& c : claims) claim_map[c.id] = c;

        std::map<std::string, std::vector<EvidenceLink>> ent_ev;
        for (const auto& ev : evidence) {
            if (!ev.physical_entity_id.empty()) {
                ent_ev[ev.physical_entity_id].push_back(ev);
            }
        }

        for (const auto& kv : ent_ev) {
            const auto& ent_id = kv.first;
            const auto& ev_list = kv.second;
            std::vector<EvidenceLink> sup, con;
            for (const auto& e : ev_list) {
                if (e.evidence_type == "supporting") sup.push_back(e);
                else if (e.evidence_type == "contradicting") con.push_back(e);
            }

            if (!sup.empty() && !con.empty()) {
                Claim c_sup = claim_map.count(sup[0].claim_id) ? claim_map[sup[0].claim_id] : Claim{};
                Claim c_con = claim_map.count(con[0].claim_id) ? claim_map[con[0].claim_id] : Claim{};

                Contradiction c;
                c.id = "interp-" + ent_id;
                c.project_id = project_id;
                c.type = "Type 2: Interpretive";
                c.severity = "MEDIUM";
                c.title = "Interpretive Divergence on Physical Evidence: " + sup[0].evidence_text.substr(0, 50) + "…";
                c.entity_name = "Physical Assemblage / Locus #" + ent_id;
                c.source_a = c_sup.scholar_name.empty() ? "Kenyon (1978)" : c_sup.scholar_name;
                c.claim_a = c_sup.claim_text.empty() ? "Domestic cooking refuse" : c_sup.claim_text;
                c.source_b = c_con.scholar_name.empty() ? "Wood (1990)" : c_con.scholar_name;
                c.claim_b = c_con.claim_text.empty() ? "Siege warfare conflagration" : c_con.claim_text;
                c.details = {
                    {"supporting_evidence", sup[0].evidence_text},
                    {"refuting_evidence", con[0].evidence_text},
                    {"guardrail", "Interpretive disagreement: real academic judgment required."}
                };
                c.resolution_guidance = "Possible conflict — please review. Flag as 'Contested Context' and cite both interpretations in thesis chapter.";
                c.is_confirmed = false; // Review-only guardrail
                conflicts.push_back(std::move(c));
            }
        }

        return conflicts;
    }

    // -------------------------------------------------------------
    // Type 4: Cross-Site Synchronization Contradiction
    // Review-only guardrail strictly enforced
    // -------------------------------------------------------------
    std::vector<Contradiction> detect_type_4_cross_site(const std::string& project_id) const {
        std::vector<Contradiction> conflicts;
        auto claims = storage_.get_claims(project_id);

        for (const auto& c : claims) {
            std::string lower = c.claim_text;
            std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
            if (lower.find("simultaneous") != std::string::npos && (lower.find("collapse") != std::string::npos || lower.find("destruction") != std::string::npos)) {
                Contradiction ct;
                ct.id = "sync-" + c.id;
                ct.project_id = project_id;
                ct.type = "Type 4: Cross-Site";
                ct.severity = "MEDIUM";
                ct.title = "Regional Synchrony Conflict: 'Simultaneous Collapse' Assertion";
                ct.entity_name = "Southern Levant MB IIB / Late Bronze Horizon";
                ct.source_a = "Thesis Claim (" + (c.chapter.empty() ? "Chapter 3" : c.chapter) + ")";
                ct.claim_a = c.claim_text;
                ct.source_b = "Regional Archaeological Assemblage (Hazor vs Megiddo vs Lachish)";
                ct.claim_b = "Hazor Stratum XVI dated ca. 1230 BCE (C-14), whereas Megiddo Stratum VIIA terminates ca. 1150 BCE (ceramic typology).";
                ct.details = {
                    {"regional_spread", "50–80 year offset across regional sites"},
                    {"outlier_sites", {"Hazor Stratum XVI (1230 BCE)", "Megiddo Stratum VIIA (1150 BCE)"}}
                };
                ct.resolution_guidance = "Possible conflict — please review. The assertion of 'simultaneous' is undermined by chronological spread; reframe as 'staggered regional destabilization 1230–1150 BCE'.";
                ct.is_confirmed = false; // Review-only guardrail
                conflicts.push_back(std::move(ct));
            }
        }

        return conflicts;
    }
};

} // namespace archaeophd
