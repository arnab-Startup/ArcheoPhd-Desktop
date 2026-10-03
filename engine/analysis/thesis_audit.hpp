#pragma once

#include <vector>
#include <string>
#include <map>
#include <set>
#include <algorithm>
#include <json.hpp>
#include "models.hpp"
#include "storage.hpp"
#include "contradictions.hpp"

namespace archaeophd {

class NativeThesisAuditor {
private:
    const NativeStorage& storage_;
    const NativeContradictionEngine& contradiction_engine_;

public:
    NativeThesisAuditor(const NativeStorage& storage, const NativeContradictionEngine& ce)
        : storage_(storage), contradiction_engine_(ce) {}

    json run_audit(const std::string& project_id = "default") const {
        auto claims = storage_.get_claims(project_id);
        auto evidence = storage_.get_evidence(project_id);
        auto conflicts = contradiction_engine_.run_all(project_id);

        std::map<std::string, std::vector<EvidenceLink>> ev_map;
        for (const auto& ev : evidence) {
            ev_map[ev.claim_id].push_back(ev);
        }

        std::set<std::string> affected_chapters;
        json findings = json::array();
        int unsupported_count = 0;
        int verified_count = 0;
        int contested_count = 0;

        for (const auto& c : claims) {
            std::string ch = c.chapter.empty() ? "Unassigned" : c.chapter;
            if (c.status == "Verified") verified_count++;
            else contested_count++;

            const auto& c_ev = ev_map[c.id];
            int sup = 0, con = 0;
            for (const auto& e : c_ev) {
                if (e.evidence_type == "supporting") sup++;
                else if (e.evidence_type == "contradicting") con++;
            }

            if (sup == 0) {
                unsupported_count++;
                affected_chapters.insert(ch);
                findings.push_back({
                    {"severity", "HIGH"},
                    {"category", "Unsupported Claim"},
                    {"chapter", ch},
                    {"claim_id", c.id},
                    {"claim_text", c.claim_text},
                    {"issue", "Zero direct supporting empirical evidence recorded in Layer C."},
                    {"recommendation", "Link primary excavation records/artifacts or reframe statement as hypothesis."}
                });
            }

            if (con > 0) {
                affected_chapters.insert(ch);
                findings.push_back({
                    {"severity", con >= 2 ? "CRITICAL" : "HIGH"},
                    {"category", "Contradicted Claim"},
                    {"chapter", ch},
                    {"claim_id", c.id},
                    {"claim_text", c.claim_text},
                    {"issue", std::to_string(con) + " refuting empirical observation(s) exist in your library."},
                    {"recommendation", "Must acknowledge conflicting evidence in chapter text or footnotes to withstand viva examination."}
                });
            }
        }

        for (const auto& cf : conflicts) {
            std::string ent = cf.entity_name;
            std::transform(ent.begin(), ent.end(), ent.begin(), ::tolower);
            for (const auto& c : claims) {
                std::string cl = c.claim_text;
                std::transform(cl.begin(), cl.end(), cl.begin(), ::tolower);
                if (!ent.empty() && cl.find(ent) != std::string::npos) {
                    affected_chapters.insert(c.chapter.empty() ? "Unassigned" : c.chapter);
                }
            }
        }

        int total = static_cast<int>(claims.size());
        int score = 100;
        if (total > 0) {
            int penalty = (unsupported_count * 12) + (static_cast<int>(conflicts.size()) * 15);
            score = std::max(25, 100 - penalty);
        }

        json res;
        res["project_id"] = project_id;
        res["total_claims"] = total;
        res["verified_claims_count"] = verified_count;
        res["contested_claims_count"] = contested_count;
        res["unsupported_claims_count"] = unsupported_count;
        res["total_conflicts_detected"] = conflicts.size();
        res["affected_chapters"] = std::vector<std::string>(affected_chapters.begin(), affected_chapters.end());
        res["defense_readiness_score"] = score;
        res["conflicts"] = json::array();
        for (const auto& cf : conflicts) {
            res["conflicts"].push_back(cf);
        }
        res["findings"] = findings;
        res["summary"] = "Pre-Submission Thesis Audit complete: " + std::to_string(conflicts.size()) +
                         " conflict(s) detected across " + std::to_string(affected_chapters.size()) +
                         " chapter(s). Defense readiness: " + std::to_string(score) + "%.";

        return res;
    }
};

} // namespace archaeophd
