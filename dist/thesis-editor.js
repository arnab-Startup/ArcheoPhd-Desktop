/**
 * ArchaeoPhD — Google Docs & Microsoft Word-Style Academic Dissertation Studio
 * 
 * Authentic academic word processor for archaeology PhD researchers:
 * - Google Docs ribbon toolbar with grouped icon controls and dividers.
 * - Multi-font typography: Garamond, Times New Roman, Georgia, Computer Modern, Modern Sans, and Monospace.
 * - Font size stepper (- 12 pt +) and line-spacing (1.0, 1.15, 1.5, 2.0 double spaced).
 * - Text color and highlighter pen markers.
 * - Image & archaeological plate insertion with captions and alignment.
 * - Interactive horizontal document ruler with inch marks and margin stops.
 * - Academic tables, footnotes, horizontal dividers, indent/outdent, and clear formatting.
 * - Floating selection AI toolbar (Polish, Cite, Defend, Condense, Expand).
 * - Inline "Help Me Write" copilot (Ctrl+J) grounded in project monographs and claims.
 * - Continuous live writing inspector checking tone, dates, and stratigraphic contradictions.
 * - Complete export to Academic LaTeX (.tex), Markdown (.md), and Print to PDF.
 * - Strict zero-emoji design (100% SVG vector paths).
 */

(function () {
  'use strict';

  var DEFAULT_CHAPTERS = [
    'Introduction',
    'Literature Review',
    'Methodology',
    'Chapter 1',
    'Chapter 2',
    'Chapter 3',
    'Discussion',
    'Conclusion'
  ];

  var APD_ICONS = {
    book: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 2v20"/></svg>',
    pen: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    sparkles: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    shieldCheck: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    layers: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    bookmark: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
    copy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    checkCircle: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    alert: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
    refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>',
    x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>',
    minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>',
    chevronRight: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    chevronDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    arrowLeft: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    quote: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>',
    list: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
    listOrdered: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
    bold: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/><path d="M6 12h9"/></svg>',
    italic: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
    underline: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" x2="20" y1="21" y2="21"/></svg>',
    strikethrough: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>',
    alignLeft: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',
    alignCenter: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="18" x2="6" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>',
    alignRight: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>',
    alignJustify: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>',
    table: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
    printer: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>',
    superscript: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 19 6-6"/><path d="m4 13 6 6"/><path d="M20 9h-4c0-1 1-2 2-3s1-1.5 0-2-2 0-2 1"/></svg>',
    subscript: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 5 6 6"/><path d="m4 11 6-6"/><path d="M20 19h-4c0-1 1-2 2-3s1-1.5 0-2-2 0-2 1"/></svg>',
    undo: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
    redo: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>',
    fileText: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>',
    image: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    link: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    indent: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8 7 12 3 16"/><line x1="21" x2="11" y1="12" y2="12"/><line x1="21" x2="11" y1="6" y2="6"/><line x1="21" x2="11" y1="18" y2="18"/></svg>',
    outdent: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 8 3 12 7 16"/><line x1="21" x2="11" y1="12" y2="12"/><line x1="21" x2="11" y1="6" y2="6"/><line x1="21" x2="11" y1="18" y2="18"/></svg>',
    textColor: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',
    highlighter: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h3l6-6"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>',
    clearFormatting: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4 8 20"/><line x1="15" x2="22" y1="15" y2="22"/><line x1="22" x2="15" y1="15" y2="22"/></svg>',
    horizontalRule: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>'
  };

  function injectStyles() {
    if (document.getElementById('apd-thesis-editor-styles')) return;
    var style = document.createElement('style');
    style.id = 'apd-thesis-editor-styles';
    style.textContent = `
      .apd-te-container {
        font-family: var(--font-body, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        color: hsl(var(--foreground, 30 10% 12%));
      }
      
      /* Google Docs Ribbon & Toolbar */
      .apd-gdocs-ribbon {
        background: hsl(var(--card, 38 28% 97%));
        border: 1px solid hsl(var(--border, 36 16% 87%));
        border-radius: 10px;
        box-shadow: 0 2px 8px -1px rgba(0,0,0,0.06);
      }
      .apd-gdocs-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 28px;
        min-width: 28px;
        padding: 0 6px;
        border-radius: 5px;
        color: hsl(var(--foreground, 30 10% 12%));
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        transition: background 0.12s ease, border-color 0.12s ease;
      }
      .apd-gdocs-btn:hover {
        background: hsl(var(--muted, 36 20% 93%));
        border-color: hsl(var(--border, 36 16% 87%));
      }
      .apd-gdocs-btn:active, .apd-gdocs-btn.active {
        background: hsl(var(--primary, 24 75% 42%) / 0.15);
        color: hsl(var(--primary, 24 75% 42%));
      }

      /* Authentic Document Ruler Bar */
      .apd-doc-ruler {
        width: 100%;
        max-width: 820px;
        height: 18px;
        background: hsl(var(--muted, 36 20% 93%) / 0.85);
        border: 1px solid rgba(0,0,0,0.1);
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        display: flex;
        align-items: flex-end;
        position: relative;
        user-select: none;
        box-sizing: border-box;
      }
      .apd-ruler-tick {
        position: absolute;
        bottom: 0;
        height: 6px;
        border-left: 1px solid rgba(0,0,0,0.3);
        font-size: 8.5px;
        line-height: 1;
        padding-left: 2px;
        color: rgba(0,0,0,0.6);
      }
      .apd-ruler-subtick {
        position: absolute;
        bottom: 0;
        height: 3px;
        border-left: 1px solid rgba(0,0,0,0.18);
      }
      .dark .apd-doc-ruler {
        background: #232220;
        border-color: rgba(255,255,255,0.1);
      }
      .dark .apd-ruler-tick {
        border-left-color: rgba(255,255,255,0.3);
        color: rgba(255,255,255,0.6);
      }
      
      /* Google Docs-style Academic Page Canvas */
      .apd-te-page-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: hsl(var(--muted, 36 20% 93%) / 0.45);
        padding: 20px 16px 64px;
        min-height: calc(100vh - 220px);
        overflow-y: auto;
      }
      
      .apd-te-page-sheet {
        width: 100%;
        max-width: 820px;
        min-height: 1080px;
        background: #ffffff;
        color: #1a1a1a;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 0 0 4px 4px;
        padding: 64px 76px;
        outline: none;
        box-sizing: border-box;
        position: relative;
        font-family: "Garamond", "Georgia", "Cambria", "Times New Roman", serif;
        font-size: 15px;
        line-height: 1.65;
        letter-spacing: 0.01em;
        transition: font-size 0.1s ease;
      }
      
      .dark .apd-te-page-sheet {
        background: #181715;
        color: #e6e3df;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.4);
      }
      
      .apd-te-page-sheet:focus { outline: none; }
      
      /* Typographic Fonts */
      .apd-te-page-sheet[data-font="garamond"] { font-family: "Garamond", "Georgia", serif; }
      .apd-te-page-sheet[data-font="times"] { font-family: "Times New Roman", "Times", serif; }
      .apd-te-page-sheet[data-font="georgia"] { font-family: "Georgia", "Garamond", serif; }
      .apd-te-page-sheet[data-font="modern"] { font-family: "Computer Modern", "Latin Modern Roman", serif; }
      .apd-te-page-sheet[data-font="sans"] { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .apd-te-page-sheet[data-font="mono"] { font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace; }

      /* Dynamic Font Size */
      .apd-te-page-sheet[data-size="11"] { font-size: 13.5px; }
      .apd-te-page-sheet[data-size="12"] { font-size: 15px; }
      .apd-te-page-sheet[data-size="14"] { font-size: 17px; }
      .apd-te-page-sheet[data-size="16"] { font-size: 19px; }
      .apd-te-page-sheet[data-size="18"] { font-size: 21px; }

      /* Spacing */
      .apd-te-page-sheet[data-spacing="1.0"] { line-height: 1.25; }
      .apd-te-page-sheet[data-spacing="1.15"] { line-height: 1.4; }
      .apd-te-page-sheet[data-spacing="1.5"] { line-height: 1.7; }
      .apd-te-page-sheet[data-spacing="2.0"] { line-height: 2.15; }

      /* Academic Sheet Elements */
      .apd-te-page-sheet h1 {
        font-size: 26px;
        font-weight: 700;
        margin-top: 0;
        margin-bottom: 22px;
        line-height: 1.25;
        border-bottom: 1px solid rgba(0,0,0,0.12);
        padding-bottom: 10px;
      }
      .dark .apd-te-page-sheet h1 { border-bottom-color: rgba(255,255,255,0.12); }
      .apd-te-page-sheet h2 {
        font-size: 20px;
        font-weight: 700;
        margin-top: 28px;
        margin-bottom: 12px;
      }
      .apd-te-page-sheet h3 {
        font-size: 16.5px;
        font-weight: 600;
        margin-top: 20px;
        margin-bottom: 8px;
      }
      .apd-te-page-sheet p {
        margin-top: 0;
        margin-bottom: 14px;
        text-align: justify;
        text-justify: inter-word;
      }
      .apd-te-page-sheet blockquote {
        margin: 18px 0;
        padding: 8px 20px;
        border-left: 3px solid hsl(var(--primary, 24 75% 42%));
        background: rgba(140, 130, 115, 0.06);
        font-style: italic;
        color: inherit;
        opacity: 0.92;
      }
      .apd-te-page-sheet table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 13.5px;
      }
      .apd-te-page-sheet th, .apd-te-page-sheet td {
        border: 1px solid rgba(140, 130, 115, 0.25);
        padding: 8px 12px;
        text-align: left;
      }
      .apd-te-page-sheet th {
        background: rgba(140, 130, 115, 0.1);
        font-weight: 600;
      }
      
      /* Figures & Plates */
      .apd-doc-figure {
        margin: 24px auto;
        padding: 10px;
        background: rgba(140, 130, 115, 0.04);
        border: 1px solid rgba(140, 130, 115, 0.2);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 90%;
      }
      .apd-doc-figure img {
        max-width: 100%;
        max-height: 480px;
        height: auto;
        border-radius: 4px;
        display: block;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .apd-doc-figure figcaption {
        font-size: 12.5px;
        font-style: italic;
        color: hsl(var(--muted-foreground, 30 8% 46%));
        margin-top: 8px;
        text-align: center;
        outline: none;
        width: 100%;
      }
      
      /* Horizontal Page Break Line */
      .apd-te-page-sheet hr {
        border: none;
        border-top: 1px solid rgba(140, 130, 115, 0.3);
        margin: 28px 0;
      }
      
      /* Floating Inline AI Toolbar */
      #apd-te-floating-ai-bar {
        position: absolute;
        z-index: 9999;
        display: none;
        background: hsl(var(--card, 38 28% 97%));
        border: 1px solid hsl(var(--primary, 24 75% 42%) / 0.4);
        border-radius: 8px;
        padding: 4px 6px;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.18), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* Inline Help Me Write Bar */
      .apd-inline-prompt-box {
        margin: 16px 0;
        border: 1px solid hsl(var(--primary, 24 75% 42%) / 0.35);
        background: hsl(var(--primary, 24 75% 42%) / 0.04);
        border-radius: 8px;
        padding: 12px 14px;
        font-family: var(--font-body, sans-serif);
      }

      .apd-te-pulse {
        animation: apdTePulse 1.5s infinite ease-in-out;
      }
      @keyframes apdTePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @media print {
        body * { visibility: hidden; }
        #apd-te-doc-sheet, #apd-te-doc-sheet * { visibility: visible; }
        #apd-te-doc-sheet {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getActiveProjectId() {
    return localStorage.getItem('archaeo_active_project') || 'default';
  }

  function getActiveProjectTitle() {
    try {
      var projs = JSON.parse(localStorage.getItem('archaeophd_local_projects') || '[]');
      var curId = getActiveProjectId();
      var found = projs.find(function(p) { return p.id === curId; });
      if (found && (found.title || found.name)) return found.title || found.name;
    } catch(e) {}
    return "Dissertation Workspace";
  }

  var DraftStore = {
    getChapters: function(projectId) {
      try {
        var saved = localStorage.getItem('archaeophd_thesis_chapters_' + projectId);
        if (saved) {
          var arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length > 0) return arr;
        }
      } catch(e) {}
      return DEFAULT_CHAPTERS.slice();
    },
    saveChapters: function(projectId, chapters) {
      try {
        localStorage.setItem('archaeophd_thesis_chapters_' + projectId, JSON.stringify(chapters));
      } catch(e) {}
    },
    getDraft: function(projectId, chapter) {
      try {
        return localStorage.getItem('archaeophd_thesis_draft_' + projectId + '_' + encodeURIComponent(chapter)) || '';
      } catch(e) {
        return '';
      }
    },
    saveDraft: function(projectId, chapter, content) {
      try {
        localStorage.setItem('archaeophd_thesis_draft_' + projectId + '_' + encodeURIComponent(chapter), content);
      } catch(e) {}
    },
    getStatus: function(projectId, chapter) {
      try {
        return localStorage.getItem('archaeophd_thesis_status_' + projectId + '_' + encodeURIComponent(chapter)) || 'drafting';
      } catch(e) {
        return 'drafting';
      }
    },
    saveStatus: function(projectId, chapter, status) {
      try {
        localStorage.setItem('archaeophd_thesis_status_' + projectId + '_' + encodeURIComponent(chapter), status);
      } catch(e) {}
    }
  };

  function textToHtml(text, chapter) {
    if (!text || !text.trim()) {
      return '<h1>' + chapter + '</h1><p>Begin drafting your archaeological analysis, stratigraphy, locus calibrations, and empirical discussion here...</p>';
    }
    if (text.indexOf('<p>') !== -1 || text.indexOf('<h1>') !== -1 || text.indexOf('<div>') !== -1 || text.indexOf('<figure>') !== -1) {
      return text;
    }
    var lines = text.split('\n');
    var html = '';
    var inList = false;
    lines.forEach(function(l) {
      var trimmed = l.trim();
      if (!trimmed) {
        if (inList) { html += '</ul>'; inList = false; }
        return;
      }
      if (trimmed.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<h1>' + trimmed.slice(2) + '</h1>';
      } else if (trimmed.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<h2>' + trimmed.slice(3) + '</h2>';
      } else if (trimmed.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<h3>' + trimmed.slice(4) + '</h3>';
      } else if (trimmed.startsWith('> ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<blockquote>' + trimmed.slice(2) + '</blockquote>';
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + trimmed.slice(2) + '</li>';
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<p>' + trimmed + '</p>';
      }
    });
    if (inList) html += '</ul>';
    return html;
  }

  function htmlToMarkdown(html) {
    var temp = document.createElement('div');
    temp.innerHTML = html;
    var md = '';
    for (var i = 0; i < temp.childNodes.length; i++) {
      var node = temp.childNodes[i];
      var tag = node.nodeName.toLowerCase();
      if (tag === 'h1') md += '# ' + node.textContent.trim() + '\n\n';
      else if (tag === 'h2') md += '## ' + node.textContent.trim() + '\n\n';
      else if (tag === 'h3') md += '### ' + node.textContent.trim() + '\n\n';
      else if (tag === 'p') md += node.textContent.trim() + '\n\n';
      else if (tag === 'blockquote') md += '> ' + node.textContent.trim() + '\n\n';
      else if (tag === 'figure') {
        var img = node.querySelector('img');
        var cap = node.querySelector('figcaption');
        var capText = cap ? cap.textContent.trim() : 'Archaeological Plate';
        var src = img ? img.getAttribute('src') : '';
        md += '![' + capText + '](' + src + ')\n*' + capText + '*\n\n';
      } else if (tag === 'ul') {
        var lis = node.querySelectorAll('li');
        lis.forEach(function(li) { md += '- ' + li.textContent.trim() + '\n'; });
        md += '\n';
      } else if (tag === 'ol') {
        var ols = node.querySelectorAll('li');
        ols.forEach(function(li, idx) { md += (idx + 1) + '. ' + li.textContent.trim() + '\n'; });
        md += '\n';
      } else if (node.textContent.trim()) {
        md += node.textContent.trim() + '\n\n';
      }
    }
    return md.trim();
  }

  function htmlToLatex(html, chapterTitle) {
    var md = htmlToMarkdown(html);
    var body = md
      .replace(/^# (.*$)/gim, '\\chapter{$1}')
      .replace(/^## (.*$)/gim, '\\section{$1}')
      .replace(/^### (.*$)/gim, '\\subsection{$1}')
      .replace(/> (.*$)/gim, '\\begin{quote}\n$1\n\\end{quote}')
      .replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}')
      .replace(/\*(.*?)\*/g, '\\textit{$1}')
      .replace(/_(.*?)_/g, '\\textit{$1}')
      .replace(/\[\^(.*?)\]/g, '\\footnote{$1}');

    return `\\documentclass[12pt,a4paper,oneside]{report}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{setspace}
\\usepackage{booktabs}
\\usepackage{graphicx}
\\usepackage{natbib}
\\usepackage{microtype}
\\doublespacing

\\title{${chapterTitle}}
\\author{PhD Researcher}
\\date{\\today}

\\begin{document}
\\maketitle

${body}

\\end{document}`;
  }

  var ThesisStudio = {
    viewMode: 'workspace', // 'workspace' | 'chapter' | 'audit'
    activeChapter: DEFAULT_CHAPTERS[0],
    activeRightTab: 'ai',   // 'ai' | 'inspector' | 'claims' | 'sources'
    checkingChapter: null,
    isAiLoading: false,
    auditData: null,
    sources: [],
    claims: [],
    evidence: [],
    contradictions: [],
    artifacts: [],
    liveFixes: [],
    savedFont: 'garamond',
    savedFontSize: '12',
    savedSpacing: '1.5',

    init: function () {
      injectStyles();
      this.attachNavigationListener();
    },

    attachNavigationListener: function () {
      var self = this;
      function checkPath() {
        var path = window.location.pathname;
        if (path === '/thesis' || path.endsWith('/thesis') || window.location.hash === '#/thesis') {
          self.mountIfPresent();
        }
      }
      window.addEventListener('popstate', checkPath);
      setInterval(checkPath, 600);
    },

    mountIfPresent: function () {
      var root = document.getElementById('root');
      if (!root) return;
      var existingStudio = document.getElementById('apd-thesis-studio-mount');
      if (existingStudio && existingStudio.children.length > 0) return;

      var pageTitle = document.querySelector('h1, h2, h3');
      var isThesisPage = window.location.pathname.indexOf('/thesis') !== -1 || (pageTitle && pageTitle.innerText.indexOf('Thesis') !== -1);
      if (!isThesisPage) return;

      this.loadProjectData();
    },

    loadProjectData: async function () {
      var projectId = getActiveProjectId();

      var bridge = window.nativeBridge;
      if (bridge && typeof bridge.call === 'function') {
        try {
          var s = await bridge.call('get_sources', {}, projectId);
          if (Array.isArray(s)) this.sources = s;
        } catch(e) {}
        try {
          var c = await bridge.call('get_claims', {}, projectId);
          if (Array.isArray(c)) this.claims = c;
        } catch(e) {}
        try {
          var ev = await bridge.call('get_evidence', {}, projectId);
          if (Array.isArray(ev)) this.evidence = ev;
        } catch(e) {}
        try {
          var con = await bridge.call('get_contradictions', {}, projectId);
          if (Array.isArray(con)) this.contradictions = con;
        } catch(e) {}
        try {
          var art = await bridge.call('get_artifacts', {}, projectId);
          if (Array.isArray(art)) this.artifacts = art;
        } catch(e) {}
        try {
          var a = await bridge.call('get_thesis_audit', {}, projectId);
          if (a) this.auditData = a;
        } catch(e) {}
      }
      this.render();
    },

    render: function () {
      var container = document.getElementById('apd-thesis-studio-mount');
      if (!container) {
        container = document.createElement('div');
        container.id = 'apd-thesis-studio-mount';
        container.className = 'apd-te-container space-y-4 p-2';

        var root = document.getElementById('root');
        var mainContent = root ? root.querySelector('main, .p-6, .space-y-6, div > div') : null;
        if (mainContent) {
          mainContent.innerHTML = '';
          mainContent.appendChild(container);
        } else if (root) {
          root.innerHTML = '';
          root.appendChild(container);
        }
      }

      var projectId = getActiveProjectId();
      var projectTitle = getActiveProjectTitle();
      var chapters = DraftStore.getChapters(projectId);

      if (this.viewMode === 'chapter') {
        container.innerHTML = this.renderGoogleDocsChapterStudio(chapters, projectId, projectTitle);
      } else if (this.viewMode === 'audit') {
        container.innerHTML = this.renderAuditHeader(projectTitle) + this.renderAuditView(chapters, projectId);
      } else {
        container.innerHTML = this.renderWorkspaceOverview(chapters, projectId, projectTitle);
      }

      this.bindEvents(container, projectId);
    },

    renderWorkspaceOverview: function (chapters, projectId, projectTitle) {
      var self = this;

      return `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.book}</span>
              <div>
                <h1 class="text-2xl font-bold font-display text-foreground tracking-tight">Thesis Workspace & Chapters</h1>
                <p class="text-xs text-muted-foreground">${projectTitle} • Click any chapter to launch full academic word processor</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border shrink-0 self-start md:self-center">
            <button id="apd-te-tab-workspace" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card text-foreground shadow-sm border border-border font-bold">
              ${APD_ICONS.layers} All Chapters (${chapters.length})
            </button>
            <button id="apd-te-tab-audit" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground">
              ${APD_ICONS.shieldCheck} Defense Audit
              ${this.auditData ? `<span class="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">${this.auditData.defense_readiness_score || 85}%</span>` : ''}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${chapters.map(function (ch, idx) {
            var cl = (self.claims || []).filter(function (c) {
              return (c.chapter || '').toLowerCase() === ch.toLowerCase();
            });
            var draft = DraftStore.getDraft(projectId, ch);
            var cleanText = draft.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            var words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
            var pages = Math.max(1, Math.ceil(words / 250));
            var status = DraftStore.getStatus(projectId, ch);

            return `
              <div data-open-chapter="${encodeURIComponent(ch)}" class="rounded-xl border border-border bg-card p-4 flex flex-col justify-between space-y-3 shadow-sm hover:border-primary/50 transition-all cursor-pointer">
                <div>
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <span class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        ${idx + 1}
                      </span>
                      <div>
                        <h3 class="font-display text-base font-bold text-foreground hover:text-primary transition-colors">${ch}</h3>
                        <p class="text-xs text-muted-foreground mt-0.5">
                          ${cl.length} claim${cl.length !== 1 ? 's' : ''} • ${words} words (~${pages} page${pages !== 1 ? 's' : ''})
                        </p>
                      </div>
                    </div>

                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status === 'ready' ? 'bg-accent/15 text-accent' : status === 'review' ? 'bg-chart-4/15 text-chart-4' : 'bg-muted text-muted-foreground'}">
                      ${status === 'ready' ? 'Defense Ready' : status === 'review' ? 'In Review' : 'Drafting'}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span class="text-[11px] text-muted-foreground flex items-center gap-1">
                    ${words > 0 ? `${APD_ICONS.checkCircle} ${words} words drafted` : `${APD_ICONS.pen} Empty chapter`}
                  </span>
                  <span class="text-xs font-semibold text-primary flex items-center gap-1">
                    Open Word Studio ${APD_ICONS.chevronRight}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    /**
     * View 2: Full Google Docs / Microsoft Word-Grade Single Chapter Studio
     */
    renderGoogleDocsChapterStudio: function (chapters, projectId, projectTitle) {
      var self = this;
      var ch = this.activeChapter;
      var rawDraft = DraftStore.getDraft(projectId, ch);
      var initialHtml = textToHtml(rawDraft, ch);
      var status = DraftStore.getStatus(projectId, ch);

      var chapterClaims = (this.claims || []).filter(function (c) {
        return (c.chapter || '').toLowerCase() === ch.toLowerCase();
      });

      return `
        <!-- Top File Ribbon & Chapter Metadata -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border">
          <div class="flex items-center gap-3">
            <button id="apd-te-back-to-workspace" class="apd-gdocs-btn px-2.5 h-8 border border-border bg-card text-xs font-semibold flex items-center gap-1.5 text-foreground shadow-sm">
              ${APD_ICONS.arrowLeft} Chapters
            </button>
            <div class="h-4 w-px bg-border"></div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold text-primary uppercase tracking-wider">Document:</span>
                <h1 class="text-base font-bold font-display text-foreground">${ch}</h1>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <!-- Proofreading Live Status Pill -->
            <button id="apd-te-trigger-inspector" class="apd-gdocs-btn px-2.5 h-7 border border-accent/40 bg-accent/5 text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <span class="text-accent">${APD_ICONS.sparkles}</span>
              <span id="apd-te-live-status-badge">AI Proofreading Active</span>
            </button>

            <!-- Status Dropdown -->
            <select id="apd-te-single-status" class="h-7 px-2 rounded-md bg-card border border-border text-xs font-medium text-foreground outline-none cursor-pointer">
              <option value="drafting" ${status === 'drafting' ? 'selected' : ''}>Status: Drafting</option>
              <option value="review" ${status === 'review' ? 'selected' : ''}>Status: In Review</option>
              <option value="ready" ${status === 'ready' ? 'selected' : ''}>Status: Defense Ready</option>
            </select>

            <!-- Export Dropdown -->
            <div class="relative inline-block">
              <button id="apd-te-export-menu-btn" class="apd-gdocs-btn h-7 px-2.5 border border-border bg-card text-xs font-medium flex items-center gap-1.5">
                ${APD_ICONS.download} Export
              </button>
              <div id="apd-te-export-dropdown" class="hidden absolute right-0 mt-1 w-44 rounded-lg border border-border bg-card shadow-lg z-50 py-1 text-xs">
                <button id="apd-te-export-tex" class="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2">
                  ${APD_ICONS.fileText} LaTeX (.tex)
                </button>
                <button id="apd-te-export-md" class="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2">
                  ${APD_ICONS.copy} Markdown (.md)
                </button>
                <button id="apd-te-print-pdf" class="w-full text-left px-3 py-1.5 hover:bg-muted flex items-center gap-2">
                  ${APD_ICONS.printer} Print / PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 1-Click Chapter Switcher Ribbon -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">Switch:</span>
          ${chapters.map(function (c, idx) {
            var isSelected = c === ch;
            var cClaims = (self.claims || []).filter(function(clm) { return (clm.chapter || '').toLowerCase() === c.toLowerCase(); });
            return `
              <button data-switch-to="${encodeURIComponent(c)}" class="px-2.5 py-0.5 rounded-md text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${isSelected ? 'bg-primary text-white border-primary shadow-sm font-bold' : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'}">
                <span class="text-[10px] opacity-75">${idx + 1}.</span>
                <span>${c}</span>
                ${cClaims.length > 0 ? `<span class="text-[9px] px-1 py-0.1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}">${cClaims.length}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Main Workspace: Google Docs Ribbon + Canvas + Side Intelligence -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          <!-- LEFT: Word Processor & Authentic Sheet (8 cols) -->
          <div class="lg:col-span-8 flex flex-col space-y-2">
            
            <!-- GOOGLE DOCS / MICROSOFT WORD STYLE ICON TOOLBAR RIBBON -->
            <div class="apd-gdocs-ribbon p-1.5 flex flex-wrap items-center gap-1 text-xs select-none sticky top-0 z-20">
              
              <!-- Undo / Redo / Print -->
              <button data-doc-cmd="undo" class="apd-gdocs-btn" title="Undo (Ctrl+Z)">${APD_ICONS.undo}</button>
              <button data-doc-cmd="redo" class="apd-gdocs-btn" title="Redo (Ctrl+Y)">${APD_ICONS.redo}</button>
              <button id="apd-te-ribbon-print" class="apd-gdocs-btn" title="Print (Ctrl+P)">${APD_ICONS.printer}</button>
              <div class="h-4 w-px bg-border mx-0.5"></div>

              <!-- Paragraph Hierarchy (Normal, H1, H2, H3, Blockquote) -->
              <select id="apd-te-format-block" class="h-7 bg-card border border-border text-[11px] rounded px-2 text-foreground outline-none cursor-pointer">
                <option value="p">Normal text</option>
                <option value="h1">Heading 1 (Chapter)</option>
                <option value="h2">Heading 2 (Section)</option>
                <option value="h3">Heading 3 (Sub-section)</option>
                <option value="blockquote">Blockquote (Excerpt)</option>
              </select>

              <!-- 5 Authentic Typefaces / Font Styles -->
              <select id="apd-te-font-family" class="h-7 bg-card border border-border text-[11px] rounded px-2 text-foreground outline-none cursor-pointer font-serif">
                <option value="garamond">Garamond (Academic)</option>
                <option value="times">Times New Roman (Standard)</option>
                <option value="georgia">Georgia (Scholarly)</option>
                <option value="modern">Computer Modern (LaTeX)</option>
                <option value="sans">Modern Sans (Clean)</option>
                <option value="mono">JetBrains Mono (Data)</option>
              </select>

              <!-- Font Size Stepper (- 12 +) -->
              <div class="flex items-center border border-border rounded h-7 bg-card">
                <button id="apd-te-font-size-dec" class="px-1.5 h-full hover:bg-muted text-muted-foreground hover:text-foreground">${APD_ICONS.minus}</button>
                <span id="apd-te-font-size-val" class="px-1 text-[11.5px] font-bold text-foreground min-w-[20px] text-center">${self.savedFontSize}</span>
                <button id="apd-te-font-size-inc" class="px-1.5 h-full hover:bg-muted text-muted-foreground hover:text-foreground">${APD_ICONS.plus}</button>
              </div>
              <div class="h-4 w-px bg-border mx-0.5"></div>

              <!-- Basic Formatting: Bold, Italic, Underline, Strikethrough -->
              <button data-doc-cmd="bold" class="apd-gdocs-btn font-bold" title="Bold (Ctrl+B)">${APD_ICONS.bold}</button>
              <button data-doc-cmd="italic" class="apd-gdocs-btn" title="Italic (Ctrl+I)">${APD_ICONS.italic}</button>
              <button data-doc-cmd="underline" class="apd-gdocs-btn" title="Underline (Ctrl+U)">${APD_ICONS.underline}</button>
              <button data-doc-cmd="strikeThrough" class="apd-gdocs-btn" title="Strikethrough">${APD_ICONS.strikethrough}</button>
              <button data-doc-cmd="superscript" class="apd-gdocs-btn" title="Superscript / Footnote">${APD_ICONS.superscript}</button>
              <button data-doc-cmd="subscript" class="apd-gdocs-btn" title="Subscript">${APD_ICONS.subscript}</button>
              <div class="h-4 w-px bg-border mx-0.5"></div>

              <!-- Text Color Palette Dropdown -->
              <div class="relative inline-block">
                <button id="apd-te-text-color-btn" class="apd-gdocs-btn flex items-center gap-0.5" title="Text Color">
                  ${APD_ICONS.textColor} ${APD_ICONS.chevronDown}
                </button>
                <div id="apd-te-text-color-picker" class="hidden absolute top-full left-0 mt-1 p-2 rounded-lg border border-border bg-card shadow-lg z-50 grid grid-cols-4 gap-1.5">
                  <div data-color="#1a1a1a" class="w-5 h-5 rounded cursor-pointer border border-border" style="background: #1a1a1a" title="Black"></div>
                  <div data-color="#8c2d19" class="w-5 h-5 rounded cursor-pointer" style="background: #8c2d19" title="Terracotta"></div>
                  <div data-color="#1e40af" class="w-5 h-5 rounded cursor-pointer" style="background: #1e40af" title="Navy"></div>
                  <div data-color="#047857" class="w-5 h-5 rounded cursor-pointer" style="background: #047857" title="Forest"></div>
                  <div data-color="#b45309" class="w-5 h-5 rounded cursor-pointer" style="background: #b45309" title="Amber"></div>
                  <div data-color="#6b21a8" class="w-5 h-5 rounded cursor-pointer" style="background: #6b21a8" title="Purple"></div>
                  <div data-color="#be123c" class="w-5 h-5 rounded cursor-pointer" style="background: #be123c" title="Crimson"></div>
                  <div data-color="#4b5563" class="w-5 h-5 rounded cursor-pointer" style="background: #4b5563" title="Muted Slate"></div>
                </div>
              </div>

              <!-- Highlighter Color Palette Dropdown -->
              <div class="relative inline-block">
                <button id="apd-te-highlight-btn" class="apd-gdocs-btn flex items-center gap-0.5" title="Highlight Color">
                  ${APD_ICONS.highlighter} ${APD_ICONS.chevronDown}
                </button>
                <div id="apd-te-highlight-picker" class="hidden absolute top-full left-0 mt-1 p-2 rounded-lg border border-border bg-card shadow-lg z-50 grid grid-cols-4 gap-1.5">
                  <div data-bg="#fef08a" class="w-5 h-5 rounded cursor-pointer border border-border" style="background: #fef08a" title="Yellow"></div>
                  <div data-bg="#bbf7d0" class="w-5 h-5 rounded cursor-pointer" style="background: #bbf7d0" title="Green"></div>
                  <div data-bg="#bae6fd" class="w-5 h-5 rounded cursor-pointer" style="background: #bae6fd" title="Cyan"></div>
                  <div data-bg="#fbcfe8" class="w-5 h-5 rounded cursor-pointer" style="background: #fbcfe8" title="Pink"></div>
                  <div data-bg="#fed7aa" class="w-5 h-5 rounded cursor-pointer" style="background: #fed7aa" title="Orange"></div>
                  <div data-bg="#e9d5ff" class="w-5 h-5 rounded cursor-pointer" style="background: #e9d5ff" title="Lavender"></div>
                  <div data-bg="transparent" class="w-5 h-5 rounded cursor-pointer border border-border flex items-center justify-center text-[10px] text-muted-foreground" title="None">X</div>
                </div>
              </div>
              <div class="h-4 w-px bg-border mx-0.5"></div>

              <!-- Alignment: Left, Center, Right, Justify -->
              <button data-doc-cmd="justifyLeft" class="apd-gdocs-btn" title="Align Left">${APD_ICONS.alignLeft}</button>
              <button data-doc-cmd="justifyCenter" class="apd-gdocs-btn" title="Align Center">${APD_ICONS.alignCenter}</button>
              <button data-doc-cmd="justifyRight" class="apd-gdocs-btn" title="Align Right">${APD_ICONS.alignRight}</button>
              <button data-doc-cmd="justifyFull" class="apd-gdocs-btn active" title="Justify (Academic standard)">${APD_ICONS.alignJustify}</button>
              
              <!-- Line Spacing Dropdown -->
              <select id="apd-te-line-spacing" class="h-7 bg-card border border-border text-[11px] rounded px-1.5 text-foreground outline-none cursor-pointer">
                <option value="1.5">1.5 Spacing</option>
                <option value="2.0">2.0 Double</option>
                <option value="1.15">1.15 Spacing</option>
                <option value="1.0">1.0 Single</option>
              </select>
              <div class="h-4 w-px bg-border mx-0.5"></div>

              <!-- Lists, Indent, Outdent -->
              <button data-doc-cmd="insertUnorderedList" class="apd-gdocs-btn" title="Bullet List">${APD_ICONS.list}</button>
              <button data-doc-cmd="insertOrderedList" class="apd-gdocs-btn" title="Numbered List">${APD_ICONS.listOrdered}</button>
              <button id="apd-te-outdent-btn" class="apd-gdocs-btn" title="Decrease Indent">${APD_ICONS.outdent}</button>
              <button id="apd-te-indent-btn" class="apd-gdocs-btn" title="Increase Indent">${APD_ICONS.indent}</button>
              <div class="h-4 w-px bg-border mx-0.5"></div>

              <!-- Insert Image / Plate / Table / Divider / Clear Formatting -->
              <button id="apd-te-insert-img-btn" class="apd-gdocs-btn" title="Insert Image / Archaeological Plate">${APD_ICONS.image}</button>
              <input type="file" id="apd-te-hidden-file-inp" accept="image/*" class="hidden" />
              <button id="apd-te-insert-table-btn" class="apd-gdocs-btn" title="Insert Archaeological Data Table">${APD_ICONS.table}</button>
              <button id="apd-te-insert-hr-btn" class="apd-gdocs-btn" title="Insert Horizontal Page Divider">${APD_ICONS.horizontalRule}</button>
              <button data-doc-cmd="removeFormat" class="apd-gdocs-btn" title="Clear Formatting">${APD_ICONS.clearFormatting}</button>

              <!-- Inline Help Me Write Pill -->
              <button id="apd-te-inline-help-write-btn" class="px-2.5 h-7 rounded bg-primary text-white text-xs font-semibold hover:bg-primary/90 flex items-center gap-1 ml-auto shadow-sm" title="Invoke Inline AI Copilot (Ctrl+J)">
                ${APD_ICONS.sparkles} Help Me Write
              </button>
            </div>

            <!-- Page Canvas: Authentic Ruler + A4 Centered Sheet -->
            <div class="apd-te-page-wrapper">
              
              <!-- Document Ruler Bar with Inch Markings -->
              <div class="apd-doc-ruler">
                <span class="apd-ruler-tick" style="left: 0%">0</span>
                <span class="apd-ruler-subtick" style="left: 7.14%"></span>
                <span class="apd-ruler-tick" style="left: 14.28%">1</span>
                <span class="apd-ruler-subtick" style="left: 21.42%"></span>
                <span class="apd-ruler-tick" style="left: 28.56%">2</span>
                <span class="apd-ruler-subtick" style="left: 35.7%"></span>
                <span class="apd-ruler-tick" style="left: 42.84%">3</span>
                <span class="apd-ruler-subtick" style="left: 49.98%"></span>
                <span class="apd-ruler-tick" style="left: 57.12%">4</span>
                <span class="apd-ruler-subtick" style="left: 64.26%"></span>
                <span class="apd-ruler-tick" style="left: 71.4%">5</span>
                <span class="apd-ruler-subtick" style="left: 78.54%"></span>
                <span class="apd-ruler-tick" style="left: 85.68%">6</span>
                <span class="apd-ruler-subtick" style="left: 92.82%"></span>
                <span class="apd-ruler-tick" style="left: 99.5%">7</span>
              </div>

              <!-- The Pristine Academic Sheet -->
              <div id="apd-te-doc-sheet" contenteditable="true" spellcheck="true" class="apd-te-page-sheet" data-spacing="${self.savedSpacing}" data-font="${self.savedFont}" data-size="${self.savedFontSize}">
                ${initialHtml}
              </div>

            </div>

            <!-- Bottom Word, Character, and Page Status Bar -->
            <div class="p-2 border rounded-lg bg-card border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2 select-none shadow-sm">
              <div class="flex items-center gap-4">
                <span id="apd-te-word-stat" class="font-bold text-foreground">0 words</span>
                <span id="apd-te-char-stat">0 characters</span>
                <span id="apd-te-page-stat">~1 page</span>
                <span>A4 Standard Format</span>
              </div>
              <div class="flex items-center gap-2 text-[11px]">
                <span class="flex items-center gap-1 text-accent font-semibold">${APD_ICONS.checkCircle} Real-time autosave</span>
                <span>•</span>
                <span class="text-muted-foreground">Press Ctrl+J for inline AI</span>
              </div>
            </div>

          </div>

          <!-- RIGHT: Grounded Intelligence & Proofreading Drawer (4 cols) -->
          <div class="lg:col-span-4 rounded-xl border border-primary/25 bg-card p-3 shadow-sm space-y-3">
            
            <!-- Side Tabs -->
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <div class="flex items-center gap-1 p-0.5 bg-muted/60 rounded-lg border border-border">
                <button id="apd-te-right-tab-ai" class="px-2 py-0.5 rounded text-xs font-semibold transition-all ${this.activeRightTab === 'ai' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'}">
                  ${APD_ICONS.sparkles} Neural AI
                </button>
                <button id="apd-te-right-tab-inspector" class="px-2 py-0.5 rounded text-xs font-semibold transition-all ${this.activeRightTab === 'inspector' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'}">
                  ${APD_ICONS.shieldCheck} Inspector
                  <span id="apd-te-inspector-count" class="ml-1 px-1 py-0.1 rounded-full bg-accent/20 text-accent text-[9px] font-bold">0</span>
                </button>
                <button id="apd-te-right-tab-claims" class="px-2 py-0.5 rounded text-xs font-semibold transition-all ${this.activeRightTab === 'claims' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'}">
                  ${APD_ICONS.bookmark} Claims
                </button>
                <button id="apd-te-right-tab-sources" class="px-2 py-0.5 rounded text-xs font-semibold transition-all ${this.activeRightTab === 'sources' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'}">
                  ${APD_ICONS.book} Library
                </button>
              </div>
            </div>

            <!-- TAB 1: Neural AI Co-Writer -->
            ${this.activeRightTab === 'ai' ? `
              <div class="space-y-3">
                <div class="p-2 rounded-lg bg-muted/40 border border-border text-[11px] flex items-center justify-between">
                  <span class="text-muted-foreground text-[10px] uppercase font-bold">Library Grounding:</span>
                  <div class="flex items-center gap-1.5 font-bold text-primary text-[10.5px]">
                    <span>${this.sources.length} Monographs</span>
                    <span>•</span>
                    <span>${chapterClaims.length} Claims</span>
                    <span>•</span>
                    <span>${this.contradictions.length} Disputes</span>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select AI Writing Action:</span>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button data-ai-action="synthesize" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                      <span class="text-primary">${APD_ICONS.sparkles}</span>
                      <span>Synthesize Claims</span>
                    </button>
                    <button data-ai-action="citations" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                      <span class="text-accent">${APD_ICONS.book}</span>
                      <span>Suggest Citations</span>
                    </button>
                    <button data-ai-action="viva_check" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                      <span class="text-chart-4">${APD_ICONS.shieldCheck}</span>
                      <span>Viva Defense Check</span>
                    </button>
                    <button data-ai-action="expand" class="apd-te-ai-action-btn p-2 rounded-lg border border-border bg-card/60 hover:bg-muted text-left text-xs font-medium transition-colors flex items-center gap-1.5">
                      <span class="text-primary">${APD_ICONS.pen}</span>
                      <span>Continue Paragraph</span>
                    </button>
                  </div>
                </div>

                <div class="space-y-1.5 pt-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom Scholarly Inquiry:</span>
                  <div class="flex gap-2">
                    <input id="apd-te-custom-query" type="text" placeholder="e.g. Synthesize Trench B locus with Kenyon radiocarbon…" class="text-xs h-8 px-2.5 rounded-md border border-border bg-transparent flex-1 outline-none focus:border-primary" />
                    <button id="apd-te-query-btn" class="h-8 px-3 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1">
                      Generate
                    </button>
                  </div>
                </div>

                <div id="apd-te-ai-loading" class="hidden p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center space-y-1.5">
                  <span class="text-primary apd-te-pulse">${APD_ICONS.refresh}</span>
                  <p class="text-xs font-bold text-foreground">Evaluating library monographs & claims…</p>
                  <p class="text-[10px] text-muted-foreground">Synthesizing peer-reviewed prose with Qwen 2.5 7B</p>
                </div>

                <div id="apd-te-ai-output" class="hidden p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                  <div class="flex items-center justify-between text-xs pb-1 border-b border-primary/15">
                    <span class="font-bold text-primary text-[11px] flex items-center gap-1">
                      ${APD_ICONS.sparkles} Grounded Suggestion
                    </span>
                    <button id="apd-te-close-ai-output" class="text-muted-foreground hover:text-foreground">${APD_ICONS.x}</button>
                  </div>
                  <div id="apd-te-suggestion-body" class="text-xs font-serif leading-relaxed text-foreground/90 max-h-[200px] overflow-y-auto whitespace-pre-wrap p-2 rounded bg-card/80 border border-border"></div>
                  <div class="flex items-center justify-between pt-1">
                    <button id="apd-te-insert-ai-output" class="h-7 px-2.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 flex items-center gap-1">
                      ${APD_ICONS.pen} Insert in Document
                    </button>
                    <div class="flex gap-1.5">
                      <button id="apd-te-copy-ai-output" class="h-7 px-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground" title="Copy suggestion">
                        ${APD_ICONS.copy}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- TAB 2: Real-time Live Writing Inspector (Proofreading, Tone & Contradictions) -->
            ${this.activeRightTab === 'inspector' ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between text-xs pb-1 border-b border-border">
                  <span class="font-bold text-foreground flex items-center gap-1">
                    ${APD_ICONS.shieldCheck} Live Writing Inspector
                  </span>
                  <button id="apd-te-refresh-inspector" class="text-primary hover:underline text-[11px] flex items-center gap-1">
                    ${APD_ICONS.refresh} Re-analyze
                  </button>
                </div>

                <div id="apd-te-inspector-list" class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  <!-- Dynamically populated proofreading recommendations -->
                  <div class="p-3 rounded-lg bg-muted/40 border border-border text-center text-xs text-muted-foreground">
                    Analyzing document text in real time...
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- TAB 3: Chapter Claims Shelf -->
            ${this.activeRightTab === 'claims' ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between text-xs pb-1 border-b border-border">
                  <span class="font-bold text-foreground">Claims for this Chapter</span>
                  <span class="text-muted-foreground text-[11px]">${chapterClaims.length} allocated</span>
                </div>

                ${chapterClaims.length === 0 ? `
                  <div class="p-4 rounded-lg bg-muted/30 border border-border text-center text-xs text-muted-foreground">
                    No claims assigned to “${ch}” yet. You can assign claims in Claims Manager.
                  </div>
                ` : `
                  <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    ${chapterClaims.map(function(c) {
                      return `
                        <div class="p-2.5 rounded-lg border border-border bg-card/70 space-y-1.5 text-xs">
                          <div class="flex items-start justify-between gap-2">
                            <span class="font-medium text-foreground leading-snug flex-1">${c.claim_text}</span>
                            <button data-insert-claim-html="${encodeURIComponent(c.claim_text)}" class="apd-te-insert-claim-btn px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-[10px] shrink-0 transition-colors">
                              + Insert
                            </button>
                          </div>
                          <div class="text-[9.5px] text-muted-foreground font-normal">
                            Scholar: ${c.scholar_name || 'Recorded'} • Status: ${c.status || 'Active'}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            ` : ''}

            <!-- TAB 4: Project Library Monographs -->
            ${this.activeRightTab === 'sources' ? `
              <div class="space-y-3">
                <div class="flex items-center justify-between text-xs pb-1 border-b border-border">
                  <span class="font-bold text-foreground">Ingested Monographs</span>
                  <span class="text-muted-foreground text-[11px]">${this.sources.length} sources</span>
                </div>

                ${this.sources.length === 0 ? `
                  <div class="p-4 rounded-lg bg-muted/30 border border-border text-center text-xs text-muted-foreground">
                    No library monographs recorded yet.
                  </div>
                ` : `
                  <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    ${this.sources.map(function(s) {
                      return `
                        <div class="p-2.5 rounded-lg border border-border bg-card/70 flex items-center justify-between gap-2 text-xs">
                          <div class="truncate flex-1">
                            <span class="font-bold text-foreground">${s.author || 'Author'}</span> (${s.year || 'n.d.'}):
                            <span class="text-muted-foreground"> ${s.title}</span>
                          </div>
                          <button data-cite-src-author="${encodeURIComponent(s.author || 'Author')}" data-cite-src-year="${encodeURIComponent(s.year || 'n.d.')}" data-cite-src-pages="${encodeURIComponent(s.pages || 'XX')}" class="apd-te-cite-src-btn px-2 py-0.5 rounded bg-accent/15 text-accent hover:bg-accent hover:text-white font-semibold text-[10px] shrink-0 transition-colors">
                            + Cite
                          </button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            ` : ''}

          </div>

        </div>

        <!-- Floating Inline AI Bar (Pops up above text selection like Google Docs) -->
        <div id="apd-te-floating-ai-bar">
          <button id="apd-te-sel-polish" class="apd-gdocs-btn px-2 h-7 text-xs font-semibold flex items-center gap-1 text-foreground" title="Fix grammar, typos, and improve academic tone">
            <span class="text-primary">${APD_ICONS.sparkles}</span> Polish Phrasing
          </button>
          <div class="h-3.5 w-px bg-border"></div>
          <button id="apd-te-sel-cite" class="apd-gdocs-btn px-2 h-7 text-xs font-semibold flex items-center gap-1 text-foreground" title="Ground statement with project monographs">
            <span class="text-accent">${APD_ICONS.book}</span> Add Citation
          </button>
          <div class="h-3.5 w-px bg-border"></div>
          <button id="apd-te-sel-defend" class="apd-gdocs-btn px-2 h-7 text-xs font-semibold flex items-center gap-1 text-foreground" title="Add viva defense caveat against potential examiner objections">
            <span class="text-chart-4">${APD_ICONS.shieldCheck}</span> Add Caveat
          </button>
          <div class="h-3.5 w-px bg-border"></div>
          <button id="apd-te-sel-condense" class="apd-gdocs-btn px-2 h-7 text-xs font-semibold flex items-center gap-1 text-foreground" title="Make concise">
            Condense
          </button>
          <button id="apd-te-sel-expand" class="apd-gdocs-btn px-2 h-7 text-xs font-semibold flex items-center gap-1 text-foreground" title="Expand with archaeological context">
            Expand
          </button>
        </div>
      `;
    },

    renderAuditHeader: function (projectTitle) {
      return `
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">${APD_ICONS.shieldCheck}</span>
              <div>
                <h1 class="text-2xl font-bold font-display text-foreground tracking-tight">Pre-Submission Defense Audit</h1>
                <p class="text-xs text-muted-foreground">${projectTitle}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border shrink-0 self-start md:self-center">
            <button id="apd-te-tab-workspace" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground">
              ${APD_ICONS.layers} All Chapters
            </button>
            <button id="apd-te-tab-audit" class="apd-te-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card text-foreground shadow-sm border border-border font-bold">
              ${APD_ICONS.shieldCheck} Defense Audit
            </button>
          </div>
        </div>
      `;
    },

    renderAuditView: function (chapters, projectId) {
      var self = this;
      var score = (this.auditData && this.auditData.defense_readiness_score) || 85;

      return `
        <div class="space-y-6 pt-2">
          <div class="p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div class="space-y-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-primary">Dissertation Defense Readiness</span>
              <h2 class="text-3xl font-bold font-display text-foreground">${score}% Readiness Rating</h2>
              <p class="text-xs text-muted-foreground max-w-xl">
                Synthesized across all project monographs, empirical claims, and excavation reports.
              </p>
            </div>
            <button id="apd-te-run-audit-btn" class="h-10 px-5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-2 self-start md:self-center shadow-sm">
              ${APD_ICONS.refresh} Re-Analyze Dissertation Defense
            </button>
          </div>
        </div>
      `;
    },

    bindEvents: function (container, projectId) {
      var self = this;

      var tabWorkspace = container.querySelector('#apd-te-tab-workspace');
      var tabAudit = container.querySelector('#apd-te-tab-audit');
      if (tabWorkspace) tabWorkspace.onclick = function () { self.viewMode = 'workspace'; self.render(); };
      if (tabAudit) tabAudit.onclick = function () { self.viewMode = 'audit'; self.render(); };

      var backBtn = container.querySelector('#apd-te-back-to-workspace');
      if (backBtn) backBtn.onclick = function () { self.viewMode = 'workspace'; self.render(); };

      var chapterCards = container.querySelectorAll('[data-open-chapter]');
      chapterCards.forEach(function (card) {
        card.onclick = function () {
          var ch = decodeURIComponent(card.getAttribute('data-open-chapter'));
          self.activeChapter = ch;
          self.viewMode = 'chapter';
          self.render();
        };
      });

      var switchBtns = container.querySelectorAll('[data-switch-to]');
      switchBtns.forEach(function (btn) {
        btn.onclick = function () {
          var targetCh = decodeURIComponent(btn.getAttribute('data-switch-to'));
          self.activeChapter = targetCh;
          self.viewMode = 'chapter';
          self.render();
        };
      });

      var sheet = container.querySelector('#apd-te-doc-sheet');
      if (sheet) {
        self.bindDocumentCanvasEvents(sheet, container, projectId);
      }

      var tabAi = container.querySelector('#apd-te-right-tab-ai');
      var tabInsp = container.querySelector('#apd-te-right-tab-inspector');
      var tabClaims = container.querySelector('#apd-te-right-tab-claims');
      var tabSources = container.querySelector('#apd-te-right-tab-sources');
      if (tabAi) tabAi.onclick = function () { self.activeRightTab = 'ai'; self.render(); };
      if (tabInsp) tabInsp.onclick = function () { self.activeRightTab = 'inspector'; self.render(); self.runLiveProofreading(sheet); };
      if (tabClaims) tabClaims.onclick = function () { self.activeRightTab = 'claims'; self.render(); };
      if (tabSources) tabSources.onclick = function () { self.activeRightTab = 'sources'; self.render(); };

      var triggerInsp = container.querySelector('#apd-te-trigger-inspector');
      if (triggerInsp) triggerInsp.onclick = function () {
        self.activeRightTab = 'inspector';
        self.render();
        self.runLiveProofreading(sheet);
      };

      var exportMenuBtn = container.querySelector('#apd-te-export-menu-btn');
      var exportDropdown = container.querySelector('#apd-te-export-dropdown');
      if (exportMenuBtn && exportDropdown) {
        exportMenuBtn.onclick = function (e) {
          e.stopPropagation();
          exportDropdown.classList.toggle('hidden');
        };
        document.addEventListener('click', function () { exportDropdown.classList.add('hidden'); });
      }

      var exportTexBtn = container.querySelector('#apd-te-export-tex');
      if (exportTexBtn && sheet) {
        exportTexBtn.onclick = function () {
          var tex = htmlToLatex(sheet.innerHTML, self.activeChapter);
          var blob = new Blob([tex], { type: 'text/plain;charset=utf-8' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = self.activeChapter.replace(/\s+/g, '_') + '.tex';
          a.click();
          URL.revokeObjectURL(url);
        };
      }

      var exportMdBtn = container.querySelector('#apd-te-export-md');
      if (exportMdBtn && sheet) {
        exportMdBtn.onclick = function () {
          var md = htmlToMarkdown(sheet.innerHTML);
          var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = self.activeChapter.replace(/\s+/g, '_') + '.md';
          a.click();
          URL.revokeObjectURL(url);
        };
      }

      var printPdfBtn = container.querySelector('#apd-te-print-pdf');
      if (printPdfBtn) {
        printPdfBtn.onclick = function () { window.print(); };
      }

      var ribbonPrint = container.querySelector('#apd-te-ribbon-print');
      if (ribbonPrint) {
        ribbonPrint.onclick = function () { window.print(); };
      }

      var insertClaimBtns = container.querySelectorAll('button[data-insert-claim-html]');
      insertClaimBtns.forEach(function (btn) {
        btn.onclick = function () {
          var clm = decodeURIComponent(btn.getAttribute('data-insert-claim-html'));
          if (sheet) {
            sheet.focus();
            document.execCommand('insertHTML', false, '<p><strong>Claim:</strong> <em>“' + clm + '”</em></p>');
            self.triggerAutosave(sheet, projectId);
          }
        };
      });

      var citeSrcBtns = container.querySelectorAll('button[data-cite-src-author]');
      citeSrcBtns.forEach(function (btn) {
        btn.onclick = function () {
          var a = decodeURIComponent(btn.getAttribute('data-cite-src-author'));
          var y = decodeURIComponent(btn.getAttribute('data-cite-src-year'));
          var p = decodeURIComponent(btn.getAttribute('data-cite-src-pages'));
          if (sheet) {
            sheet.focus();
            document.execCommand('insertHTML', false, ' (' + a + ' ' + y + ': p. ' + p + ') ');
            self.triggerAutosave(sheet, projectId);
          }
        };
      });

      var aiActionBtns = container.querySelectorAll('.apd-te-ai-action-btn');
      aiActionBtns.forEach(function (btn) {
        btn.onclick = function () {
          var action = btn.getAttribute('data-ai-action');
          self.runAiQuery(self.activeChapter, action, '', sheet);
        };
      });

      var queryBtn = container.querySelector('#apd-te-query-btn');
      var customInp = container.querySelector('#apd-te-custom-query');
      if (queryBtn && customInp) {
        queryBtn.onclick = function () {
          var val = customInp.value.trim();
          if (val) self.runAiQuery(self.activeChapter, 'custom', val, sheet);
        };
      }

      var insertAiBtn = container.querySelector('#apd-te-insert-ai-output');
      if (insertAiBtn && sheet) {
        insertAiBtn.onclick = function () {
          var body = container.querySelector('#apd-te-suggestion-body');
          if (body) {
            sheet.focus();
            document.execCommand('insertHTML', false, '<p>' + body.innerText.replace(/\n\n/g, '</p><p>') + '</p>');
            self.triggerAutosave(sheet, projectId);
          }
        };
      }
    },

    bindDocumentCanvasEvents: function (sheet, container, projectId) {
      var self = this;
      var floatingBar = document.getElementById('apd-te-floating-ai-bar');

      var updateStats = function () {
        var text = sheet.innerText || '';
        var words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
        var chars = text.length;
        var pages = Math.max(1, Math.ceil(words / 250));

        var wEl = container.querySelector('#apd-te-word-stat');
        var cEl = container.querySelector('#apd-te-char-stat');
        var pEl = container.querySelector('#apd-te-page-stat');
        if (wEl) wEl.innerText = words + ' words';
        if (cEl) cEl.innerText = chars + ' characters';
        if (pEl) pEl.innerText = '~' + pages + ' page' + (pages !== 1 ? 's' : '');
      };
      updateStats();

      var saveTimeout = null;
      var proofreadTimeout = null;
      sheet.addEventListener('input', function () {
        updateStats();
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(function () {
          self.triggerAutosave(sheet, projectId);
        }, 300);

        clearTimeout(proofreadTimeout);
        proofreadTimeout = setTimeout(function () {
          self.runLiveProofreading(sheet);
        }, 1200);
      });

      sheet.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
          e.preventDefault();
          self.openInlineHelpMeWrite(sheet, projectId);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          document.execCommand(e.shiftKey ? 'outdent' : 'indent', false, null);
        }
      });

      var docCmdBtns = container.querySelectorAll('button[data-doc-cmd]');
      docCmdBtns.forEach(function (btn) {
        btn.onclick = function () {
          var cmd = btn.getAttribute('data-doc-cmd');
          document.execCommand(cmd, false, null);
          sheet.focus();
          self.triggerAutosave(sheet, projectId);
        };
      });

      // Indent & Outdent buttons
      var indentBtn = container.querySelector('#apd-te-indent-btn');
      var outdentBtn = container.querySelector('#apd-te-outdent-btn');
      if (indentBtn) indentBtn.onclick = function () { document.execCommand('indent', false, null); sheet.focus(); self.triggerAutosave(sheet, projectId); };
      if (outdentBtn) outdentBtn.onclick = function () { document.execCommand('outdent', false, null); sheet.focus(); self.triggerAutosave(sheet, projectId); };

      // Format Block
      var formatBlockSelect = container.querySelector('#apd-te-format-block');
      if (formatBlockSelect) {
        formatBlockSelect.onchange = function () {
          var val = formatBlockSelect.value;
          document.execCommand('formatBlock', false, val);
          sheet.focus();
          self.triggerAutosave(sheet, projectId);
        };
      }

      // Font Family Selector
      var fontSelect = container.querySelector('#apd-te-font-family');
      if (fontSelect) {
        fontSelect.value = self.savedFont;
        fontSelect.onchange = function () {
          self.savedFont = fontSelect.value;
          sheet.setAttribute('data-font', fontSelect.value);
        };
      }

      // Font Size Stepper (- 12 +)
      var sizeValEl = container.querySelector('#apd-te-font-size-val');
      var sizeDec = container.querySelector('#apd-te-font-size-dec');
      var sizeInc = container.querySelector('#apd-te-font-size-inc');
      var SIZES = ['11', '12', '14', '16', '18'];
      if (sizeDec && sizeInc && sizeValEl) {
        sizeDec.onclick = function () {
          var idx = SIZES.indexOf(self.savedFontSize);
          if (idx > 0) {
            self.savedFontSize = SIZES[idx - 1];
            sizeValEl.innerText = self.savedFontSize;
            sheet.setAttribute('data-size', self.savedFontSize);
          }
        };
        sizeInc.onclick = function () {
          var idx = SIZES.indexOf(self.savedFontSize);
          if (idx < SIZES.length - 1) {
            self.savedFontSize = SIZES[idx + 1];
            sizeValEl.innerText = self.savedFontSize;
            sheet.setAttribute('data-size', self.savedFontSize);
          }
        };
      }

      // Line Spacing
      var lineSpacingSelect = container.querySelector('#apd-te-line-spacing');
      if (lineSpacingSelect) {
        lineSpacingSelect.value = self.savedSpacing;
        lineSpacingSelect.onchange = function () {
          self.savedSpacing = lineSpacingSelect.value;
          sheet.setAttribute('data-spacing', lineSpacingSelect.value);
        };
      }

      // Text Color Dropdown
      var textColorBtn = container.querySelector('#apd-te-text-color-btn');
      var textColorPicker = container.querySelector('#apd-te-text-color-picker');
      if (textColorBtn && textColorPicker) {
        textColorBtn.onclick = function (e) {
          e.stopPropagation();
          textColorPicker.classList.toggle('hidden');
        };
        var colorSwatches = textColorPicker.querySelectorAll('[data-color]');
        colorSwatches.forEach(function (sw) {
          sw.onclick = function (e) {
            e.stopPropagation();
            var col = sw.getAttribute('data-color');
            document.execCommand('foreColor', false, col);
            textColorPicker.classList.add('hidden');
            sheet.focus();
            self.triggerAutosave(sheet, projectId);
          };
        });
      }

      // Highlighter Palette Dropdown
      var highlightBtn = container.querySelector('#apd-te-highlight-btn');
      var highlightPicker = container.querySelector('#apd-te-highlight-picker');
      if (highlightBtn && highlightPicker) {
        highlightBtn.onclick = function (e) {
          e.stopPropagation();
          highlightPicker.classList.toggle('hidden');
        };
        var bgSwatches = highlightPicker.querySelectorAll('[data-bg]');
        bgSwatches.forEach(function (sw) {
          sw.onclick = function (e) {
            e.stopPropagation();
            var bg = sw.getAttribute('data-bg');
            document.execCommand('hiliteColor', false, bg);
            highlightPicker.classList.add('hidden');
            sheet.focus();
            self.triggerAutosave(sheet, projectId);
          };
        });
      }

      document.addEventListener('click', function () {
        if (textColorPicker) textColorPicker.classList.add('hidden');
        if (highlightPicker) highlightPicker.classList.add('hidden');
      });

      // Insert Image / Plate Action (Native file upload to document)
      var insertImgBtn = container.querySelector('#apd-te-insert-img-btn');
      var hiddenFileInp = container.querySelector('#apd-te-hidden-file-inp');
      if (insertImgBtn && hiddenFileInp) {
        insertImgBtn.onclick = function () {
          hiddenFileInp.click();
        };
        hiddenFileInp.onchange = function () {
          var file = hiddenFileInp.files[0];
          if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var dataUrl = e.target.result;
              var figureHtml = `
                <figure class="apd-doc-figure" contenteditable="false">
                  <img src="${dataUrl}" alt="Archaeological Plate" />
                  <figcaption contenteditable="true">Figure: [Caption description - click to edit details and provenance]</figcaption>
                </figure>
                <p></p>
              `;
              sheet.focus();
              document.execCommand('insertHTML', false, figureHtml);
              self.triggerAutosave(sheet, projectId);
            };
            reader.readAsDataURL(file);
          }
        };
      }

      // Insert Archaeological Table
      var tableBtn = container.querySelector('#apd-te-insert-table-btn');
      if (tableBtn) {
        tableBtn.onclick = function () {
          sheet.focus();
          var tableHtml = `
            <table>
              <thead>
                <tr>
                  <th>Locus / Stratum</th>
                  <th>Period</th>
                  <th>Diagnostic Ceramic Ware</th>
                  <th>Radiocarbon Date (BP)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Locus 104 (Stratum IV)</td>
                  <td>Late Bronze IIB</td>
                  <td>Mycenaean IIIB Sherds, Collar-rim Jars</td>
                  <td>3210 ± 35 BP</td>
                </tr>
                <tr>
                  <td>Locus 105 (Stratum V)</td>
                  <td>Late Bronze IIA</td>
                  <td>Bichrome Wheel-made Ware</td>
                  <td>3350 ± 40 BP</td>
                </tr>
              </tbody>
            </table>
            <p></p>
          `;
          document.execCommand('insertHTML', false, tableHtml);
          self.triggerAutosave(sheet, projectId);
        };
      }

      // Insert Horizontal Divider
      var hrBtn = container.querySelector('#apd-te-insert-hr-btn');
      if (hrBtn) {
        hrBtn.onclick = function () {
          sheet.focus();
          document.execCommand('insertHorizontalRule', false, null);
          self.triggerAutosave(sheet, projectId);
        };
      }

      // Inline Help Me Write Button
      var inlineHelpBtn = container.querySelector('#apd-te-inline-help-write-btn');
      if (inlineHelpBtn) {
        inlineHelpBtn.onclick = function () {
          self.openInlineHelpMeWrite(sheet, projectId);
        };
      }

      // Floating Selection AI Toolbar
      document.addEventListener('selectionchange', function () {
        var sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sheet.contains(sel.anchorNode)) {
          if (floatingBar) floatingBar.style.display = 'none';
          return;
        }

        var text = sel.toString().trim();
        if (text.length < 3) {
          if (floatingBar) floatingBar.style.display = 'none';
          return;
        }

        var range = sel.getRangeAt(0);
        var rect = range.getBoundingClientRect();
        if (floatingBar) {
          floatingBar.style.display = 'flex';
          floatingBar.style.top = (window.scrollY + rect.top - 44) + 'px';
          floatingBar.style.left = Math.max(10, (window.scrollX + rect.left + (rect.width / 2) - 180)) + 'px';
        }
      });

      var selPolish = container.querySelector('#apd-te-sel-polish');
      if (selPolish) selPolish.onclick = function () { self.runSelectionAi('polish', sheet, projectId); };

      var selCite = container.querySelector('#apd-te-sel-cite');
      if (selCite) selCite.onclick = function () { self.runSelectionAi('cite', sheet, projectId); };

      var selDefend = container.querySelector('#apd-te-sel-defend');
      if (selDefend) selDefend.onclick = function () { self.runSelectionAi('defend', sheet, projectId); };

      var selCondense = container.querySelector('#apd-te-sel-condense');
      if (selCondense) selCondense.onclick = function () { self.runSelectionAi('condense', sheet, projectId); };

      var selExpand = container.querySelector('#apd-te-sel-expand');
      if (selExpand) selExpand.onclick = function () { self.runSelectionAi('expand', sheet, projectId); };

      self.runLiveProofreading(sheet);
    },

    triggerAutosave: function (sheet, projectId) {
      var html = sheet.innerHTML;
      DraftStore.saveDraft(projectId, this.activeChapter, html);
    },

    openInlineHelpMeWrite: function (sheet, projectId) {
      var self = this;
      var existing = document.querySelector('.apd-inline-prompt-box');
      if (existing) { existing.remove(); return; }

      var card = document.createElement('div');
      card.className = 'apd-inline-prompt-box';
      card.setAttribute('contenteditable', 'false');
      card.innerHTML = `
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-primary/20">
          <span class="text-xs font-bold text-primary flex items-center gap-1.5">
            ${APD_ICONS.sparkles} Help Me Write (Grounded Archaeological Copilot)
          </span>
          <button id="apd-inline-close-btn" class="text-muted-foreground hover:text-foreground text-xs">${APD_ICONS.x}</button>
        </div>
        <div class="flex gap-2">
          <input id="apd-inline-prompt-inp" type="text" placeholder="e.g. Synthesize radiocarbon determinations from Trench B with Kenyon 1957…" class="text-xs h-8 px-2.5 rounded border border-border bg-card flex-1 outline-none focus:border-primary text-foreground" />
          <button id="apd-inline-generate-btn" class="h-8 px-3 rounded bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1">
            ${APD_ICONS.sparkles} Generate
          </button>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-2">
          <button data-inline-preset="synthesize" class="px-2 py-0.5 rounded bg-muted hover:bg-card border border-border text-[10.5px] text-muted-foreground hover:text-foreground">
            + Synthesize chapter claims
          </button>
          <button data-inline-preset="expand" class="px-2 py-0.5 rounded bg-muted hover:bg-card border border-border text-[10.5px] text-muted-foreground hover:text-foreground">
            + Expand current paragraph
          </button>
          <button data-inline-preset="viva" class="px-2 py-0.5 rounded bg-muted hover:bg-card border border-border text-[10.5px] text-muted-foreground hover:text-foreground">
            + Add examiner defense caveat
          </button>
        </div>
        <div id="apd-inline-result-area" class="hidden mt-3 p-3 rounded bg-card border border-border text-xs font-serif leading-relaxed text-foreground">
          <div id="apd-inline-result-text" class="whitespace-pre-wrap"></div>
          <div class="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border font-sans">
            <button id="apd-inline-reject-btn" class="px-2.5 py-1 rounded border border-border text-xs font-medium hover:bg-muted">Discard</button>
            <button id="apd-inline-accept-btn" class="px-3 py-1 rounded bg-primary text-white text-xs font-bold hover:bg-primary/90">Insert in Paper</button>
          </div>
        </div>
      `;

      var sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        var range = sel.getRangeAt(0);
        range.insertNode(card);
      } else {
        sheet.appendChild(card);
      }

      var inp = card.querySelector('#apd-inline-prompt-inp');
      var genBtn = card.querySelector('#apd-inline-generate-btn');
      var closeBtn = card.querySelector('#apd-inline-close-btn');
      var resArea = card.querySelector('#apd-inline-result-area');
      var resText = card.querySelector('#apd-inline-result-text');
      var acceptBtn = card.querySelector('#apd-inline-accept-btn');
      var rejectBtn = card.querySelector('#apd-inline-reject-btn');

      if (inp) inp.focus();
      if (closeBtn) closeBtn.onclick = function () { card.remove(); };
      if (rejectBtn) rejectBtn.onclick = function () { card.remove(); };

      var runGen = async function (prompt) {
        if (!prompt) return;
        genBtn.innerText = 'Drafting…';
        genBtn.disabled = true;

        var fullContext = sheet.innerText.slice(-1200);
        var bridge = window.nativeBridge;
        var answer = "";
        try {
          if (bridge && typeof bridge.call === 'function') {
            var r = await bridge.call('invoke_llm', {
              prompt: "You are ArchaeoPhD AI drafting dissertation text. Ground your writing in active archaeological monographs and claims.\n" +
                      "Task: " + prompt + "\nContext before cursor:\n" + fullContext + "\nOutput scholarly peer-reviewed prose directly."
            }, projectId);
            answer = (r && r.answer) ? r.answer : (typeof r === 'string' ? r : JSON.stringify(r));
          }
        } catch(e) {
          answer = "Error generating prose: " + e.message;
        }

        genBtn.innerText = 'Generate';
        genBtn.disabled = false;

        resText.innerText = answer;
        resArea.classList.remove('hidden');

        acceptBtn.onclick = function () {
          var p = document.createElement('p');
          p.innerHTML = answer.replace(/\n\n/g, '</p><p>');
          card.parentNode.replaceChild(p, card);
          self.triggerAutosave(sheet, projectId);
        };
      };

      if (genBtn && inp) {
        genBtn.onclick = function () { runGen(inp.value.trim()); };
        inp.onkeydown = function (e) { if (e.key === 'Enter') runGen(inp.value.trim()); };
      }

      var presets = card.querySelectorAll('[data-inline-preset]');
      presets.forEach(function (btn) {
        btn.onclick = function () {
          var pType = btn.getAttribute('data-inline-preset');
          if (pType === 'synthesize') runGen("Synthesize all primary locus claims for this chapter into peer-reviewed prose.");
          else if (pType === 'expand') runGen("Expand the preceding paragraph with stratigraphic and ceramic analysis.");
          else if (pType === 'viva') runGen("Add an academic caveat anticipating examiner critique regarding radiocarbon calibration.");
        };
      });
    },

    runSelectionAi: async function (mode, sheet, projectId) {
      var self = this;
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      var selectedText = sel.toString().trim();
      var range = sel.getRangeAt(0);

      var floatingBar = document.getElementById('apd-te-floating-ai-bar');
      if (floatingBar) floatingBar.style.display = 'none';

      var prompt = "";
      if (mode === 'polish') {
        prompt = "Polish this archaeological thesis paragraph for academic tone, impeccable syntax, and active scholarly clarity without altering its factual claims:\n\"" + selectedText + "\"";
      } else if (mode === 'cite') {
        prompt = "Recommend and insert an inline academic monograph citation from the active library to ground this assertion:\n\"" + selectedText + "\"";
      } else if (mode === 'defend') {
        prompt = "Add a concise viva defense caveat addressing potential examiner skepticism to this paragraph:\n\"" + selectedText + "\"";
      } else if (mode === 'condense') {
        prompt = "Condense this text into concise, impactful peer-reviewed dissertation prose:\n\"" + selectedText + "\"";
      } else if (mode === 'expand') {
        prompt = "Elaborate upon this archaeological analysis, detailing stratigraphic provenance and locus methodology:\n\"" + selectedText + "\"";
      }

      var bridge = window.nativeBridge;
      var replacement = "";
      try {
        if (bridge && typeof bridge.call === 'function') {
          var r = await bridge.call('invoke_llm', { prompt: prompt }, projectId);
          replacement = (r && r.answer) ? r.answer : (typeof r === 'string' ? r : JSON.stringify(r));
        }
      } catch(e) {
        alert("AI error: " + e.message);
        return;
      }

      if (replacement) {
        range.deleteContents();
        var node = document.createElement('span');
        node.innerText = replacement;
        range.insertNode(node);
        self.triggerAutosave(sheet, projectId);
      }
    },

    runLiveProofreading: function (sheet) {
      if (!sheet) return;
      var text = sheet.innerText || '';
      var self = this;
      var fixes = [];

      var phrasingRules = [
        { bad: /\ba lot of\b/gi, fix: "a substantial corpus of", reason: "Informal quantifier in academic writing" },
        { bad: /\bbasically\b/gi, fix: "fundamentally", reason: "Colloquial filler word" },
        { bad: /\bproves that\b/gi, fix: "strongly substantiates that", reason: "Archaeological inference is empirical, rarely absolute proof" },
        { bad: /\bwe can see that\b/gi, fix: "the stratigraphic record demonstrates that", reason: "Prefer objective third-person analysis" },
        { bad: /\bobviously\b/gi, fix: "evidently", reason: "Avoid dismissive assertion" }
      ];

      phrasingRules.forEach(function (rule) {
        var match;
        while ((match = rule.bad.exec(text)) !== null) {
          fixes.push({
            type: 'style',
            matched: match[0],
            replacement: rule.fix,
            reason: rule.reason
          });
          if (fixes.length > 8) break;
        }
      });

      var yearMatch = text.match(/\b(1[0-9]{3}|20[0-2][0-9])\s*(BCE|BC|CE|AD)\b/gi);
      if (yearMatch && text.indexOf('(') === -1 && text.indexOf(')') === -1) {
        fixes.push({
          type: 'citation',
          matched: yearMatch[0],
          replacement: self.sources.length > 0 ? ' (' + (self.sources[0].author || 'Author') + ' ' + (self.sources[0].year || 'n.d.') + ')' : ' (Citation required)',
          reason: "Absolute chronometric dates require authoritative monograph citations"
        });
      }

      (self.contradictions || []).forEach(function (con) {
        var aInDoc = text.toLowerCase().indexOf((con.claim_a || '').slice(0, 20).toLowerCase()) !== -1;
        var bInDoc = text.toLowerCase().indexOf((con.claim_b || '').slice(0, 20).toLowerCase()) !== -1;
        if (aInDoc || bInDoc) {
          fixes.push({
            type: 'contradiction',
            matched: con.type || 'Stratigraphic Dispute',
            replacement: ' (See stratigraphic caveat: ' + (con.claim_b || con.claim_a) + ')',
            reason: 'Active project contradiction: ' + (con.anomaly_description || 'Disputed layer sequence')
          });
        }
      });

      this.liveFixes = fixes;

      var badge = document.getElementById('apd-te-live-status-badge');
      var countEl = document.getElementById('apd-te-inspector-count');
      if (badge) {
        badge.innerText = fixes.length === 0 ? 'Document Verified' : (fixes.length + ' Suggestions Available');
      }
      if (countEl) countEl.innerText = fixes.length;

      var listEl = document.getElementById('apd-te-inspector-list');
      if (listEl) {
        if (fixes.length === 0) {
          listEl.innerHTML = `
            <div class="p-3.5 rounded-lg bg-accent/5 border border-accent/20 text-center text-xs text-foreground/80 space-y-1">
              <span class="text-accent font-bold">${APD_ICONS.checkCircle} Clean Scholarly Prose</span>
              <p class="text-[11px] text-muted-foreground">Zero colloquialisms, unreferenced dates, or unhandled stratigraphic disputes detected.</p>
            </div>
          `;
        } else {
          listEl.innerHTML = fixes.map(function (f, idx) {
            return `
              <div class="p-2.5 rounded-lg border border-border bg-card text-xs space-y-1.5 shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${f.type === 'contradiction' ? 'bg-destructive/15 text-destructive' : f.type === 'citation' ? 'bg-accent/15 text-accent' : 'bg-chart-4/15 text-chart-4'}">
                    ${f.type === 'contradiction' ? 'Dispute Risk' : f.type === 'citation' ? 'Missing Citation' : 'Academic Style'}
                  </span>
                  <button data-apply-fix="${idx}" class="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-semibold hover:bg-primary/90 flex items-center gap-1">
                    Apply Fix
                  </button>
                </div>
                <div class="text-[11.5px] font-medium text-foreground">
                  Replace <code class="bg-muted px-1 py-0.2 rounded text-destructive">${f.matched}</code> with <code class="bg-muted px-1 py-0.2 rounded text-accent">${f.replacement}</code>
                </div>
                <div class="text-[10.5px] text-muted-foreground leading-snug">
                  ${f.reason}
                </div>
              </div>
            `;
          }).join('');

          var applyBtns = listEl.querySelectorAll('[data-apply-fix]');
          applyBtns.forEach(function (btn) {
            btn.onclick = function () {
              var fIdx = parseInt(btn.getAttribute('data-apply-fix'), 10);
              var fix = fixes[fIdx];
              if (fix && sheet) {
                var curHtml = sheet.innerHTML;
                var re = new RegExp(fix.matched, 'i');
                sheet.innerHTML = curHtml.replace(re, fix.replacement);
                self.triggerAutosave(sheet, getActiveProjectId());
                self.runLiveProofreading(sheet);
              }
            };
          });
        }
      }
    },

    runAiQuery: async function (chapter, mode, customQuery, sheet) {
      var projectId = getActiveProjectId();
      var bridge = window.nativeBridge;
      var loadingEl = document.getElementById('apd-te-ai-loading');
      var outputEl = document.getElementById('apd-te-ai-output');
      var bodyEl = document.getElementById('apd-te-suggestion-body');

      if (loadingEl) loadingEl.classList.remove('hidden');
      if (outputEl) outputEl.classList.add('hidden');

      var currentText = sheet ? sheet.innerText : '';
      var chapterClaims = (this.claims || []).filter(function (c) {
        return (c.chapter || '').toLowerCase() === chapter.toLowerCase();
      });

      var librarySources = (this.sources || []).slice(0, 15).map(function (s) {
        return '"' + s.title + '" by ' + (s.author || 'Author') + ' (' + (s.year || 'n.d.') + ')';
      });
      var verifiedClaims = chapterClaims.map(function (c) {
        return '- ' + c.claim_text + ' [' + (c.scholar_name || 'Recorded') + ']';
      });

      var instruction = "";
      if (mode === 'synthesize') {
        instruction = "Synthesize all empirical claims and excavation reports into a cohesive, academically rigorous thesis section for this chapter. Ground interpretations in primary stratigraphy and dates.";
      } else if (mode === 'citations') {
        instruction = "Examine the drafted text and recommend precise inline citations from the researcher's monograph library. Provide exact author names and years.";
      } else if (mode === 'viva_check') {
        instruction = "Conduct a viva examination counter-argument check. Examine whether any statement contradicts other monographs or radiocarbon calibrations in the library. Provide a defense footnote.";
      } else if (mode === 'expand') {
        instruction = "Generate the next logical academic paragraph continuing the current draft, advancing the archaeological analysis with empirical rigor.";
      } else if (customQuery) {
        instruction = "Researcher Custom Inquiry: " + customQuery;
      }

      var promptText = 
        "You are ArchaeoPhD AI, an expert archaeological research and dissertation writing workstation assistant.\n" +
        "Assisting researcher with Chapter: \"" + chapter + "\".\n\n" +
        "INGESTED PROJECT MONOGRAPHS:\n" + (librarySources.join('\n') || 'None recorded') + "\n\n" +
        "CLAIMS FOR THIS CHAPTER:\n" + (verifiedClaims.join('\n') || 'None assigned') + "\n\n" +
        "CURRENT CHAPTER DRAFT (End of text):\n\"\"\"\n" + (currentText.slice(-1500) || 'Blank') + "\n\"\"\"\n\n" +
        "TASK: " + instruction + "\n\n" +
        "Output peer-reviewed dissertation prose directly.";

      var resultText = "";
      try {
        if (bridge && typeof bridge.call === 'function') {
          var res = await bridge.call('invoke_llm', { prompt: promptText }, projectId);
          resultText = (res && res.answer) ? res.answer : (typeof res === 'string' ? res : JSON.stringify(res, null, 2));
        }
      } catch(err) {
        resultText = "Error during AI generation: " + err.message;
      }

      if (loadingEl) loadingEl.classList.add('hidden');
      if (bodyEl) bodyEl.innerText = resultText;
      if (outputEl) outputEl.classList.remove('hidden');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ThesisStudio.init(); });
  } else {
    ThesisStudio.init();
  }

  window.archaeophdThesis = ThesisStudio;

})();
