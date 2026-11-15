# Issue Report 05: Destructive Legacy Cleanup Scripts in HTML Head

**Severity**: Critical  
**Category**: Data Persistence & Migration Safeguards  
**Status**: Resolved / Fixed  
**Date**: November 2026  

---

## 1. Executive Summary

During investigation of project persistence issues, a legacy inline `<script>` was discovered inside `<head>` of `desktop/dist/index.html`. This script executed synchronously on every page load and route reload, parsing `localStorage.getItem('archaeophd_local_projects')` and actively purging any project where `p.is_demo` was true or whose title contained `"Bengal"` or `"Demo"`.

As a consequence, immediately after the application initialized the Chandraketugarh Bengal demo project, any subsequent navigation or refresh stripped the project from local storage and forcefully reset `archaeo_active_project` back to `"default"`.

---

## 2. Root Cause Analysis

### 2.1 Artifact of Previous Data Sanitization
Earlier in the development lifecycle, when fictitious or test datasets (such as fictional Southern Levant records) were scrubbed from the codebase, a cleanup routine was injected directly into `<head>`:

```javascript
// Destructive snippet from desktop/dist/index.html (lines 32-50)
var projs = JSON.parse(projStr);
if (Array.isArray(projs)) {
  var filtered = projs.filter(function(p) {
    var t = (p.title || '') + ' ' + (p.name || '');
    return !p.is_demo && !p.is_system_demo &&
           t.indexOf('Southern Levant') === -1 &&
           t.indexOf('Bengal') === -1 &&
           t.indexOf('Demo') === -1;
  });
  if (filtered.length !== projs.length) {
    localStorage.setItem('archaeophd_local_projects', JSON.stringify(filtered));
    var active = localStorage.getItem('archaeo_active_project');
    var exists = filtered.some(function(p) { return p.id === active; });
    if (!exists) {
      if (filtered.length > 0) {
        localStorage.setItem('archaeo_active_project', filtered[0].id);
      } else {
        localStorage.removeItem('archaeo_active_project');
      }
    }
  }
}
```

### 2.2 Mechanism of Failure
1. The user clicks "Initialize Demo Project" on `/demo`.
2. The demo dataset seeds and sets `archaeo_active_project` to `proj_chandraketugarh_demo`.
3. The user navigates to `/projects` or refreshes the window.
4. The inline `<head>` script executes prior to React DOM mounting.
5. It inspects `archaeophd_local_projects`, detects `"Bengal"` in the project title, and deletes the record.
6. It detects that `archaeo_active_project` (`proj_chandraketugarh_demo`) no longer exists in the filtered array and overwrites it with `default`.
7. React mounts: the demo project has vanished or reverted to empty state.

---

## 3. Archaeological Impact

- In archaeology, **data loss or silent deletion is the ultimate violation of archival stewardship**.
- Having an automated script silently delete excavation datasets based on hardcoded geographic string matches (`"Bengal"`) breaks fundamental scientific data durability requirements.

---

## 4. Resolution Applied & Verified

1. **Purged Hardcoded Geographic & Demo Filters**:
   Updated `index.html` across all build targets (`desktop/dist`, `desktop/release/dist`, `experimental/dist`):
   ```javascript
   var projs = JSON.parse(projStr);
   if (Array.isArray(projs)) {
     var filtered = projs.filter(function(p) {
       var t = (p.title || '') + ' ' + (p.name || '');
       return t.indexOf('Southern Levant') === -1;
     });
     if (filtered.length !== projs.length) {
       localStorage.setItem('archaeophd_local_projects', JSON.stringify(filtered));
     }
   }
   ```
2. **Removed Forced Active Project Overwrites**:
   The active project key is no longer forcefully deleted when legitimate demo or regional projects are active.
3. **Committed & Tested**:
   Verified across restarts that `archaeo_active_project` and `archaeophd_local_projects` persist intact with the Chandraketugarh corpus.
