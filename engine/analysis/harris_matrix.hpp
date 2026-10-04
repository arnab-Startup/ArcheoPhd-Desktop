#pragma once

#include <vector>
#include <string>
#include <map>
#include <set>
#include <queue>
#include <algorithm>
#include <iostream>
#include "models.hpp"

namespace archaeophd {

// =============================================================================
// Stratigraphic DAG & Harris Matrix Engine
// =============================================================================
// Implements archaeological stratigraphic logic based on Edward C. Harris (1979):
// - "Principles of Archaeological Stratigraphy"
// 
// Mathematical Foundations:
// 1. Stratigraphic Sequence as Directed Acyclic Graph (DAG)
//    - Vertices: Stratigraphic Units / Strata
//    - Directed Edges: Temporal order (Older -> Younger)
//      * u is below v  => u is older than v (u -> v)
//      * v is above u  => u is older than v (u -> v)
//      * v cuts u      => u is older than v (u -> v)
// 2. Cycle Detection:
//    - Physical impossibility loops (e.g. A > B > C > A) detected via Tarjan's SCC.
// 3. Topological Sort (Kahn's Algorithm):
//    - Computes valid chronological sequence from oldest bedrock to youngest surface.
// 4. Stratigraphic Level Assignment:
//    - Computes vertical phase level for Harris Matrix diagram layout.
// 5. Law of Superposition & Radiometric Date Inversion Validator:
//    - Verifies that upper strata / samples are not dated earlier than lower strata.
// =============================================================================

struct StratigraphicInversion {
    std::string upper_stratum_id;
    std::string upper_stratum_name;
    int upper_date_bce = 0;
    std::string lower_stratum_id;
    std::string lower_stratum_name;
    int lower_date_bce = 0;
    std::string reason;
};

struct HarrisMatrixResult {
    bool is_valid_dag = true;
    std::vector<std::string> chronological_sequence; // From oldest (earliest) to newest (latest)
    std::vector<std::vector<std::string>> cycles;     // Impossible paradox cycles (if any)
    std::vector<StratigraphicInversion> inversions;   // Law of Superposition date inversions
    std::map<std::string, int> stratigraphic_levels;  // Vertical phase depth (0 = earliest basal deposit)
    std::map<std::string, std::vector<std::string>> direct_older_than; // Edges: u -> {younger units}
    std::map<std::string, std::vector<std::string>> direct_younger_than;// Edges: v -> {older units}
};

class HarrisMatrixEngine {
private:
    // Tarjan's Strongly Connected Components algorithm for DAG cycle detection
    struct TarjanState {
        int index = 0;
        std::map<std::string, int> indices;
        std::map<std::string, int> lowlinks;
        std::vector<std::string> stack;
        std::set<std::string> on_stack;
        std::vector<std::vector<std::string>> sccs;
    };

    static void tarjan_connect(
        const std::string& u,
        const std::map<std::string, std::set<std::string>>& adj,
        TarjanState& state
    ) {
        state.indices[u] = state.index;
        state.lowlinks[u] = state.index;
        state.index++;
        state.stack.push_back(u);
        state.on_stack.insert(u);

        auto it = adj.find(u);
        if (it != adj.end()) {
            for (const auto& v : it->second) {
                if (state.indices.find(v) == state.indices.end()) {
                    tarjan_connect(v, adj, state);
                    state.lowlinks[u] = std::min(state.lowlinks[u], state.lowlinks[v]);
                } else if (state.on_stack.count(v)) {
                    state.lowlinks[u] = std::min(state.lowlinks[u], state.indices[v]);
                }
            }
        }

        if (state.lowlinks[u] == state.indices[u]) {
            std::vector<std::string> component;
            while (true) {
                std::string w = state.stack.back();
                state.stack.pop_back();
                state.on_stack.erase(w);
                component.push_back(w);
                if (w == u) break;
            }
            if (component.size() > 1) {
                state.sccs.push_back(std::move(component));
            }
        }
    }

public:
    static HarrisMatrixResult build_matrix(
        const std::vector<Stratum>& strata,
        const std::vector<Sample>& samples = {}
    ) {
        HarrisMatrixResult result;
        if (strata.empty()) return result;

        std::map<std::string, Stratum> stratum_map;
        for (const auto& s : strata) stratum_map[s.id] = s;

        // Build directed adjacency graph: Older -> Younger
        std::map<std::string, std::set<std::string>> older_to_younger;
        std::map<std::string, std::set<std::string>> younger_to_older;
        std::set<std::string> all_nodes;

        for (const auto& s : strata) {
            all_nodes.insert(s.id);

            // If unit B is listed in s.harris_above, then s is below B, so s is older than B: s -> B
            for (const auto& above_id : s.harris_above) {
                if (stratum_map.find(above_id) != stratum_map.end()) {
                    older_to_younger[s.id].insert(above_id);
                    younger_to_older[above_id].insert(s.id);
                }
            }

            // If unit C is listed in s.harris_below, then C is below s, so C is older than s: C -> s
            for (const auto& below_id : s.harris_below) {
                if (stratum_map.find(below_id) != stratum_map.end()) {
                    older_to_younger[below_id].insert(s.id);
                    younger_to_older[s.id].insert(below_id);
                }
            }

            // If unit D is listed in s.harris_cut_by, then D cuts s, so s was deposited before D: s -> D
            for (const auto& cut_id : s.harris_cut_by) {
                if (stratum_map.find(cut_id) != stratum_map.end()) {
                    older_to_younger[s.id].insert(cut_id);
                    younger_to_older[cut_id].insert(s.id);
                }
            }
        }

        // 1. Detect Stratigraphic Cycles (Physical Impossibility Loops)
        TarjanState t_state;
        for (const auto& node : all_nodes) {
            if (t_state.indices.find(node) == t_state.indices.end()) {
                tarjan_connect(node, older_to_younger, t_state);
            }
        }

        if (!t_state.sccs.empty()) {
            result.is_valid_dag = false;
            result.cycles = std::move(t_state.sccs);
            // Cycle detected: impossible stratigraphic loop
            return result;
        }

        result.is_valid_dag = true;

        // 2. Kahn's Algorithm for Topological Sorting (Oldest -> Youngest)
        std::map<std::string, int> in_degree;
        for (const auto& node : all_nodes) in_degree[node] = 0;

        for (const auto& [u, targets] : older_to_younger) {
            for (const auto& v : targets) {
                in_degree[v]++;
            }
        }

        std::queue<std::string> q;
        for (const auto& node : all_nodes) {
            if (in_degree[node] == 0) {
                q.push(node);
                result.stratigraphic_levels[node] = 0; // Basal layer (level 0)
            }
        }

        while (!q.empty()) {
            std::string curr = q.front();
            q.pop();
            result.chronological_sequence.push_back(curr);

            int current_level = result.stratigraphic_levels[curr];

            auto it = older_to_younger.find(curr);
            if (it != older_to_younger.end()) {
                for (const auto& nxt : it->second) {
                    // Stratigraphic phase level is max depth from basal deposits
                    result.stratigraphic_levels[nxt] = std::max(
                        result.stratigraphic_levels[nxt],
                        current_level + 1
                    );

                    in_degree[nxt]--;
                    if (in_degree[nxt] == 0) {
                        q.push(nxt);
                    }
                }
            }
        }

        // Store direct adjacency for diagram rendering
        for (const auto& [u, targets] : older_to_younger) {
            result.direct_older_than[u] = std::vector<std::string>(targets.begin(), targets.end());
        }
        for (const auto& [v, sources] : younger_to_older) {
            result.direct_younger_than[v] = std::vector<std::string>(sources.begin(), sources.end());
        }

        // 3. Law of Superposition & Chronological Date Inversion Validation
        // For edge u -> v (u is older, below v; v is younger, above u):
        // In BCE calendar: larger number = older date (e.g. 2000 BCE is older than 1500 BCE).
        // If lower unit u has date_end_bce < upper unit v has date_start_bce,
        // then upper unit v is dated older than the unit beneath it -> Inversion!
        for (const auto& [u_id, targets] : older_to_younger) {
            const auto& u = stratum_map[u_id];
            for (const auto& v_id : targets) {
                const auto& v = stratum_map[v_id];

                // Check BCE dates if both are populated
                if (u.date_start_bce > 0 && v.date_start_bce > 0) {
                    // u is below v (older). Therefore u's date should be >= v's date.
                    // If u is dated younger than v (e.g., u = 1400 BCE, v = 1800 BCE):
                    if (u.date_start_bce < v.date_end_bce) {
                        StratigraphicInversion inv;
                        inv.upper_stratum_id = v.id;
                        inv.upper_stratum_name = v.stratum_name;
                        inv.upper_date_bce = v.date_start_bce;
                        inv.lower_stratum_id = u.id;
                        inv.lower_stratum_name = u.stratum_name;
                        inv.lower_date_bce = u.date_start_bce;
                        inv.reason = "Law of Superposition Inversion: Upper stratum '" + v.stratum_name + 
                                     "' (" + std::to_string(v.date_start_bce) + " BCE) is dated older than " +
                                     "underlying stratum '" + u.stratum_name + "' (" + 
                                     std::to_string(u.date_start_bce) + " BCE).";
                        result.inversions.push_back(inv);
                    }
                }
            }
        }

        // 4. Sample C-14 Radiometric Inversion Cross-Check
        if (!samples.empty()) {
            std::map<std::string, std::vector<Sample>> stratum_samples;
            for (const auto& smp : samples) {
                if (!smp.stratum_id.empty()) {
                    stratum_samples[smp.stratum_id].push_back(smp);
                }
            }

            for (const auto& [u_id, targets] : older_to_younger) {
                const auto& u = stratum_map[u_id];
                auto u_samples_it = stratum_samples.find(u_id);
                if (u_samples_it == stratum_samples.end()) continue;

                for (const auto& v_id : targets) {
                    const auto& v = stratum_map[v_id];
                    auto v_samples_it = stratum_samples.find(v_id);
                    if (v_samples_it == stratum_samples.end()) continue;

                    for (const auto& s_lower : u_samples_it->second) {
                        for (const auto& s_upper : v_samples_it->second) {
                            if (s_lower.date_cal_start_bce > 0 && s_upper.date_cal_end_bce > 0) {
                                // s_lower is below s_upper, so s_lower should be >= s_upper in BCE
                                if (s_lower.date_cal_start_bce < s_upper.date_cal_end_bce) {
                                    StratigraphicInversion inv;
                                    inv.upper_stratum_id = v.id;
                                    inv.upper_stratum_name = v.stratum_name + " (Sample " + s_upper.lab_code + ")";
                                    inv.upper_date_bce = s_upper.date_cal_start_bce;
                                    inv.lower_stratum_id = u.id;
                                    inv.lower_stratum_name = u.stratum_name + " (Sample " + s_lower.lab_code + ")";
                                    inv.lower_date_bce = s_lower.date_cal_start_bce;
                                    inv.reason = "Radiometric C-14 Inversion: Sample " + s_upper.lab_code +
                                                 " (" + s_upper.cal_range_2sigma + ") in upper stratum is older than " +
                                                 "sample " + s_lower.lab_code + " (" + s_lower.cal_range_2sigma + 
                                                 ") in underlying stratum.";
                                    result.inversions.push_back(inv);
                                }
                            }
                        }
                    }
                }
            }
        }

        return result;
    }
};

} // namespace archaeophd
