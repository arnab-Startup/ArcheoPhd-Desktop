# Issue Report 02: Stratigraphic & Data Contamination Across Project Boundaries

**Severity**: Critical  
**Category**: Data Integrity & Archaeological Epistemology  
**Status**: Open / In Review  
**Date**: November 2026  

---

## 1. Executive Summary

A critical vulnerability was identified in the database entity filtering implementation within the client storage layer (`desktop/dist/index.html`). When queries filter entities by `project_id`, the filtering logic includes an unconditional fallback:

```javascript
if (query.project_id) {
  items = items.filter(function(x) {
    return x.project_id === query.project_id || x.project_id === 'default';
  });
}
```

Because `x.project_id === 'default'` is permitted to leak into every query, any entity created in or defaulted to the `default` workspace automatically pollutes all other projects, including doctoral demonstration datasets and specialized regional excavation archives.

---

## 2. Archaeological Impact: Taphonomic & Chronological Violation

In archaeological science, intermixing datasets across disparate geographic or temporal contexts is fatal to empirical analysis:

1. **Stratigraphic Incoherence**:
   - If an artifact from a generic or test project (e.g., Bronze Age Tell es-Sultan or Chalcolithic Deccan) leaks into an Early Historic Bengal project (Chandraketugarh, 600 BCE – 1250 CE), automated Harris Matrix generation will attempt to reconcile incompatible stratum depths and layers.
   - A layer 4 Kushana Rouletted Ware bowl would be evaluated alongside unrelated strata, producing invalid topological sort orders.

2. **False Contradiction Triggers**:
   - The native contradiction engine relies on claim-to-evidence bipartite graphs. Leaked evidence records generate synthetic contradictions that do not exist in the published excavation reports.
   - Radiocarbon ranges (OxCal / IntCal20) from disparate cultural horizons become entangled.

3. **Academic Non-Reproducibility**:
   - A doctoral thesis defended using contaminated evidence graph outputs fails peer review and academic reproducibility criteria.

---

## 3. Technical Root Cause Analysis

### 3.1 Hardcoded Fallback in LocalStorage Proxy
In `desktop/dist/index.html` lines 156-160:

```javascript
filter: async function(query, sort, limit) {
  var items = getAll();
  query = query || {};
  if (query.project_id) {
    items = items.filter(function(x) {
      return x.project_id === query.project_id || x.project_id === 'default';
    });
  }
  // ...
}
```

This fallback was originally added during early prototyping to allow "starter" data to be visible before project creation. In a production multi-project workstation, it acts as an active data leak between separate project stores.

### 3.2 Key Mapping Inconsistencies
In the entity name resolution map:
```javascript
var keyMap = {
  Project: 'projects',
  Claim: 'claims',
  Evidence: 'evidence',
  Source: 'sources',
  Note: 'notes',
  ChatMessage: 'messages'
};
var entityKey = keyMap[entityName] || (entityName.toLowerCase() + 's');
```
Because `ResearchProject` was omitted from `keyMap`, project metadata was stored under `archaeophd_local_researchprojects` while legacy code queried `archaeophd_local_projects`, leading to desynchronization in project listings.

---

## 4. Remediation Plan

1. **Eliminate the `default` Fallback**:
   Enforce strict isolation:
   ```javascript
   if (query.project_id) {
     items = items.filter(function(x) {
       return x.project_id === query.project_id;
     });
   }
   ```

2. **Explicit Project Migration Utility**:
   If an archaeologist explicitly wants to duplicate or import reference sources from a personal library into a project, this must be an intentional action (`Import to Project`), not an implicit database bleed-through.

3. **Unified Key Resolution**:
   Ensure all entity keys (`ResearchProject`, `Project`) resolve strictly to `projects`.
