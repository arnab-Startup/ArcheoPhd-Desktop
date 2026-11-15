# Issue Report 13: WebView2 SPA Subroute Reload Failure in Virtual Host Mapping (Blank White Screen)

**Severity**: Critical  
**Category**: Native Desktop Runtime & WebView2 Integration  
**Status**: Mitigated / Resolved  
**Date**: November 2026  

---

## 1. Executive Summary

When updating or reloading the desktop client from sub-routes (such as `/projects`, `/dashboard`, or `/evidence-graph`), the application window rendered a blank white screen with no interactive UI and no error dialog.

This was caused by an architectural incompatibility between **Microsoft Edge WebView2 Virtual Host Mapping** (`SetVirtualHostNameToFolderMapping`) and **Single Page Application (SPA) HTML5 History Routing**. When an update or reload executed `window.location.reload()`, WebView2 attempted to open the virtual sub-path (e.g. `https://appassets.example/projects`) directly against the filesystem. Because `projects` does not exist as a physical file on disk, WebView2 returned an internal `ERR_ACCESS_DENIED` / 404, causing the webview document to become completely empty.

---

## 2. Technical Root Cause

### 2.1 Virtual Host Name to Folder Mapping Mechanics
In `desktop/src/main.cpp`:
```cpp
wv3->SetVirtualHostNameToFolderMapping(
    L"appassets.example",
    targetFolder.c_str(),
    COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW
);
```
Unlike a standard production web server (e.g. Nginx, Apache, or Vercel), WebView2's virtual host mapper has no built-in URL rewrite rules. It maps incoming HTTP requests strictly to physical filesystem paths:
- Request `https://appassets.example/index.html` $\rightarrow$ serves `dist\index.html` (Success)
- Request `https://appassets.example/assets/index.js` $\rightarrow$ serves `dist\assets\index.js` (Success)
- Request `https://appassets.example/projects` $\rightarrow$ checks `dist\projects` (Directory or non-existent file $\rightarrow$ `ERR_ACCESS_DENIED`)

### 2.2 Trigger in Auto-Updater Completion Script
In `desktop/dist/modules/auto-updater/index.js`:
```javascript
// DEFECTIVE IMPLEMENTATION:
showToast('Updated to latest version. Restarting...');
setTimeout(function () {
  window.location.reload(); // Reloads https://appassets.example/projects -> Blank White Screen!
}, 900);
```

---

## 3. Resolution & Verification

1. **Safe SPA Navigation**:
   Replaced `window.location.reload()` with explicit index navigation:
   ```javascript
   var base = (typeof window !== 'undefined' && window.location && window.location.origin)
     ? window.location.origin
     : '';
   window.location.assign((base ? base : '') + '/index.html');
   ```
2. **Animated Progress Modal**:
   Integrated `APD_UPDATER_MODAL.showProgressModal(targetVer)` to display an active 4-step progress animation with live percentage updates, providing continuous visual feedback while preventing unhandled reloads.
3. **Verified Behavior**:
   Clicking **Update** in the desktop client now animates through all 4 verification steps and transitions into `/index.html` without triggering a blank white screen.
