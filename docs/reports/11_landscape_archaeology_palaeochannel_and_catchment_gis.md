# Issue Report 11: Static Geographic Mapping vs. Dynamic Landscape Geomorphology (Palaeochannels & Catchments)

**Severity**: Medium  
**Category**: Spatial Archaeology & Geomorphological GIS  
**Status**: Open / Architectural Roadmap  
**Date**: November 2026  

---

## 1. Executive Summary

In `ResearchMap-BTAiZ-3T.js`, ArchaeoPhD plots archaeological sites as static GPS pins on modern satellite/topographic base maps.

In riverine, deltaic, and coastal archaeology, human settlement patterns were determined by ancient geomorphology that has since undergone severe hydrological change. Plotting ancient sites on modern maps creates anachronistic misunderstandings: sites that were once prosperous deep-water riverine ports now appear stranded inland in dried fields or along minor silted creeks.

---

## 2. Archaeological Epistemological Breakdown

### 2.1 The Shifting Deltaic River System of Lower Bengal
Lower Bengal is one of the most dynamic deltaic landscapes in the world. Between 600 BCE and the present day:
- **The Vidyadhari River**:
  - In antiquity (c. 300 BCE – 400 CE), the Vidyadhari was a major tidal arm of the Bhagirathi-Hooghly estuary, accommodating large ocean-going vessels (*nau*) travelling between Chandraketugarh and the Bay of Bengal.
  - Today, the Vidyadhari is an extinct, heavily silted canal completely disconnected from active maritime navigation.
- **The Rupnarayan-Ganga Confluence at Tamralipta (Tamluk)**:
  - Ancient Tamralipta (the premier port of Eastern India visited by Fa-Hien and Xuanzang) was a deep coastal-estuarine harbour. Modern Tamluk lies over 60 miles inland from the active Bay of Bengal shoreline due to deltaic progradation.

### 2.2 Site Catchment & Spatial Hierarchy Analysis
Archaeologists analyze settlement patterns through:
1. **Site Catchment Analysis (Vita-Finzi & Higgs 1970)**: Modeling 1-hour and 2-hour walking catchments, as well as 6-hour tidal drift radii for cargo boats.
2. **Central Place Settlement Hierarchy**: Distinguishing primary fortified emporia (e.g. Chandraketugarh mound, 1.2 sq km) from satellite production hamlets (Hadipur, Noongola) and coastal transshipment forts (Harinarayanpur).

---

## 3. Current Limitations in the Codebase

1. In `ResearchMap-BTAiZ-3T.js`, sites are drawn as identical round markers with zero hierarchy distinction (citadel vs. hamlet vs. landing ghat).
2. Modern river vectors are shown, but there are no historical palaeochannel vector layers or sedimentological elevation rasters.
3. There are no tidal reach isochrones or transport network connections between linked ports.

---

## 4. Technical Requirements for Resolution

1. **Palaeochannel Vector Layer**:
   Support historical hydrographic GeoJSON vector overlays reconstructing ancient river courses (e.g., Ancient Vidyadhari, Saraswati, Adi Ganga).
2. **Tidal Catchment & Transport Networks**:
   Render directed riverine transport routes connecting inland production centers to open-sea maritime corridors.
3. **Hierarchical Settlement Symbology**:
   Differentiate sites visually by tier (Primary Fortified Port, Secondary Production Settlement, Epigraphic/Shrine Locality).
