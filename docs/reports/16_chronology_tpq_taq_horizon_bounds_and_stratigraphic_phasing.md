# Issue Report 16: Chronology Engine TPQ/TAQ Horizon Bounds and Stratigraphic Phasing Deficit

**Severity**: High  
**Category**: Visualization Dashboard & Chronological Epistemology  
**Status**: Architectural Analysis & Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

The Chronology Engine (`/chronology` / `Chronology-CSm9kFUB.js`) visualizes temporal ranges for archaeological sites and artifacts. However, its current implementation represents time as **flat, continuous horizontal Gantt bars** computed by simple regex matching of year strings:

```javascript
// Excerpt from Chronology-CSm9kFUB.js:
const d = [...l.replace(/–|—/g, "-").matchAll(/(\d{1,4})\s*(BCE|CE|BC|AD)?/gi)];
// ...
const M = h(Math.min(a.range.start, a.range.end)),
      _ = Math.max(2, h(Math.abs(a.range.end - a.range.start)));
return t.jsx("button", {
  className: "absolute top-1 h-5 rounded group",
  style: { left: `${M}%`, width: `${_}%`, background: "hsl(var(--accent))" }
});
```

In archaeological science, continuous rectangular bars misrepresent how dates are derived. Archaeological time is established through **Terminus Post Quem (TPQ)**, **Terminus Ante Quem (TAQ)**, and **Stratigraphic Horizons**.

---

## 2. Archaeological Epistemological Failure Modes

1. **The Fallacy of Uniform Bar Spans**:
   A bar stretching from 300 BCE to 100 CE falsely implies that an artifact or site existed uniformly across those 400 years with equal probability. In reality, a coin of Chandragupta II found in Stratum III provides only a **Terminus Post Quem** (the deposit cannot be older than the coin's minting, ~375 CE), while a sealed flood deposit dated to 500 CE provides a **Terminus Ante Quem**. The true date is an asymmetrical bounded probability distribution, not a solid rectangle.

2. **Absence of Phase Horizon Dividers**:
   Excavations are structured around discrete cultural phases (e.g. at Chandraketugarh: *Phase I: Pre-NBPW, Phase II: Northern Black Polished Ware / Maurya, Phase III: Sunga-Kushana, Phase IV: Gupta, Phase V: Post-Gupta*). The chronology view currently lists sites and artifacts as disconnected rows without grouping them under overarching stratigraphic phase horizons.

3. **Inability to Model Overlapping Disputed Datings**:
   When two authorities disagree (e.g., Goswami 1966 dating Period III to 200 BCE–50 CE vs. Chakrabarti 2001 dating it to 100 BCE–200 CE), the engine renders overlapping colored boxes that obscure each other rather than displaying a side-by-side comparative bracket or divergent timeline lane.

---

## 3. Proposed Architectural Resolution

1. **TPQ / TAQ Asymmetrical Arrow Notation**:
   Replace uniform solid rectangles with bounded chronological markers:
   - **Terminus Post Quem (TPQ)**: Left boundary marked by a rigid vertical bracket `|---▶`, indicating open-ended upper bounds.
   - **Terminus Ante Quem (TAQ)**: Right boundary marked by a terminating vertical bracket `◀---|`, indicating open-ended lower bounds.
   - **Sealed Horizon Interval**: Shaded gradient box anchored between verified stratigraphic anchors.

2. **Stratigraphic Phasing Hierarchy**:
   Group chronological items hierarchically by Cultural Period:
   ```
   [Phase II: Maurya-Sunga Horizon (c. 300 BCE – 100 BCE)]
     ├── Coin: Punch-Marked Silver Karshapana (TPQ: 320 BCE)
     ├── Ceramic: Rouletted Ware Sherds (300 BCE – 100 CE)
     └── Stratum: Sealed rammed-earth rampart (TAQ: 100 BCE)
   ```

3. **Integration with Harris Matrix Chronological Constraints**:
   Topologically link chronological bars to the Harris Matrix DAG so that if Stratum IV is physically below Stratum III, the UI visually flags any proposed date for Stratum IV that is younger than Stratum III as a **Topological Chronological Violation**.
