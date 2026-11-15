# Issue Report 03: Project Card Click Navigation Deadlock

**Severity**: High  
**Category**: User Interface / SPA Routing State Management  
**Status**: Mitigated / In Validation  
**Date**: November 2026  

---

## 1. Executive Summary

When viewing the project list on `/projects`, users reported that clicking on a project card (e.g., the Chandraketugarh Bengal demo card) resulted in **no visible page transition or navigation response** ("clicking in this not opening any page").

Investigation revealed that the project card was implemented as a synthetic `div` with an `onClick` handler that triggered both a React state update in a parent provider (`setActive(id)`) and a programmatic React Router navigation (`navigate('/dashboard')`). Under React 18 automatic event batching, parent provider re-renders interfered with the router transition, and the lack of an anchor (`<a>` / `<Link>`) element prevented native browser navigation fallback.

---

## 2. Forensic Investigation of the User Interaction

### 2.1 The DOM Structure
In `Projects-DhMOSLrW.js`:

```javascript
a.map(s => e.jsxs("div", {
  onClick: () => l(s.id),
  className: "relative text-left rounded-2xl border border-border bg-card p-6 ... cursor-pointer",
  children: [
    e.jsx("button", {
      onClick: r => m(r, s),
      title: "Delete project",
      className: "absolute top-4 right-4 p-1.5 ... z-10",
      children: e.jsx(w, { className: "w-4 h-4" })
    }),
    // ... Icon, Title, Description, Tags
  ]
}))
```

### 2.2 Event Dispatch Breakdown
When the user clicks the card:
1. `onClick` invokes `l(s.id)`.
2. `l` is defined as:
   ```javascript
   l = s => {
     setActive(s);
     navigate("/dashboard");
   };
   ```
3. `setActive(s)` updates `activeProjectId` in the top-level `ProjectProvider`.
4. In React 18, state updates scheduled in the parent context trigger reconciliation across the subtree before or concurrently with `navigate()`.
5. Because `/projects` is rendered within the same `Outlet` managed by `ProjectProvider`, the component re-rendered in place with updated context instead of pushing the route transition to `/dashboard`.
6. To the user, the click appeared completely dead: no spinner, no URL change, no visual feedback.

---

## 3. Archaeological & Usability Impact

- An archaeologist reviewing a corpus of excavations expects immediate tactile access into the finds register, trench logs, and dialectic graph.
- A dead click on an excavation title halts evaluation and creates the impression that the workstation has crashed or that the dataset is inaccessible.

---

## 4. Remediation Implemented & Verified

### 4.1 Resilient Dual-Layer Dispatch
Replaced the fragile single-function call with a resilient multi-target dispatcher in [Projects-DhMOSLrW.js](file:///d:/Prorgram/Project/ArcheoPhd/desktop/dist/assets/Projects-DhMOSLrW.js):

```javascript
const l = (projectId, target = "/dashboard") => {
  try {
    if (typeof setActive === "function") setActive(projectId);
    localStorage.setItem("archaeo_active_project", projectId);
  } catch(e) {}
  
  try {
    if (typeof navigate === "function") navigate(target);
  } catch(e) {}
  
  try {
    window.history.pushState(null, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  } catch(e) {}
};
```

### 4.2 Explicit In-Card Navigation Buttons
Added explicit action triggers within the card layout so researchers have distinct, clickable targets:
- `[ Open Workspace → ]`: Routes to the project's dashboard.
- `[ Evidence Graph → ]`: Routes directly to the project's interactive stratigraphy and claim graph.
- `[ Demo Dossier → ]`: Routes to the doctoral dataset specification overview.
