// ArchaeoPhD AI - Workstation Welcome Portal
// High-fidelity implementation with clean, text-free background scenery

(function () {
  'use strict';

  function injectStyles() {
    if (document.getElementById('apd-welcome-styles')) return;

    const style = document.createElement('style');
    style.id = 'apd-welcome-styles';
    style.textContent = `
      #apd-welcome-screen {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: #0b0807;
        background-image: 
          radial-gradient(ellipse at 50% 45%, rgba(16, 11, 9, 0.55) 0%, rgba(12, 8, 7, 0.78) 60%, rgba(8, 6, 5, 0.94) 100%),
          url('/assets/welcome-clean-bg.jpg');
        background-size: cover;
        background-position: center bottom;
        background-repeat: no-repeat;
        color: #f5f0e8;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        overflow-y: auto;
        overflow-x: hidden;
        user-select: none;
        -webkit-user-select: none;
        transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s ease;
      }

      #apd-welcome-screen.hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      /* Top Title Bar */
      .apd-w-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 32px;
        background: rgba(12, 8, 7, 0.65);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(212, 163, 89, 0.16);
      }
      .apd-w-brand-pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 13.5px;
        letter-spacing: 0.02em;
        color: #f5f0e8;
      }
      .apd-w-brand-pill svg {
        width: 22px;
        height: 22px;
      }
      .apd-w-version {
        color: #d4a359;
        font-size: 11.5px;
        font-weight: 600;
        margin-left: 6px;
        letter-spacing: 0.04em;
        opacity: 0.9;
      }
      .apd-w-skip-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(212, 163, 89, 0.35);
        color: #f5f0e8;
        padding: 6px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .apd-w-skip-btn:hover {
        background: rgba(212, 163, 89, 0.22);
        border-color: #d4a359;
        color: #ffffff;
      }

      /* Center Hero Container */
      .apd-w-center {
        max-width: 1040px;
        width: 100%;
        margin: 0 auto;
        padding: 16px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      /* Hero Emblem */
      .apd-w-emblem-wrap {
        width: 68px;
        height: 68px;
        margin-bottom: 6px;
        filter: drop-shadow(0 6px 18px rgba(163, 51, 32, 0.5));
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
      }
      .apd-w-emblem-wrap:hover {
        transform: scale(1.08);
      }

      /* Brand Titles */
      .apd-w-brand-title {
        font-family: Georgia, "Times New Roman", Garamond, serif;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: #ffffff;
        margin: 0;
        line-height: 1.15;
      }
      .apd-w-brand-title span.gold-ai {
        background: linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-style: italic;
        margin-left: 6px;
      }
      .apd-w-tagline {
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: #d4a359;
        margin-top: 5px;
        margin-bottom: 22px;
        opacity: 0.95;
      }

      /* Main Heading */
      .apd-w-main-heading {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 40px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 10px 0;
        text-shadow: 0 2px 14px rgba(0, 0, 0, 0.85);
        letter-spacing: 0.01em;
      }
      .apd-w-main-heading span.gold-ai-heading {
        background: linear-gradient(135deg, #fef08a 0%, #f59e0b 60%, #b45309 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-style: italic;
        margin-left: 8px;
      }
      .apd-w-sub-desc {
        font-size: 15px;
        line-height: 1.5;
        color: #e5ded4;
        max-width: 640px;
        margin: 0 0 34px 0;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.85);
      }

      /* Four Action Cards */
      .apd-w-cards-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        width: 100%;
        max-width: 980px;
        margin-bottom: 30px;
      }
      @media (max-width: 860px) {
        .apd-w-cards-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .apd-w-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 24px 18px;
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        text-decoration: none;
        color: inherit;
        position: relative;
        overflow: hidden;
      }

      /* Standard Glass Card */
      .apd-w-card-glass {
        background: rgba(22, 16, 14, 0.78);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(212, 163, 89, 0.24);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
      }
      .apd-w-card-glass:hover {
        background: rgba(36, 26, 23, 0.92);
        border-color: rgba(212, 163, 89, 0.7);
        transform: translateY(-3px);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 163, 89, 0.25);
      }

      /* Featured Active Card (Explore Demo) */
      .apd-w-card-featured {
        background: linear-gradient(145deg, #7b1827 0%, #460d16 100%);
        border: 1px solid rgba(245, 190, 100, 0.7);
        box-shadow: 0 8px 26px -2px rgba(123, 24, 39, 0.55), 0 0 18px rgba(212, 163, 89, 0.35);
      }
      .apd-w-card-featured:hover {
        background: linear-gradient(145deg, #911e2f 0%, #520f1a 100%);
        border-color: #fcd34d;
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 12px 34px rgba(123, 24, 39, 0.75), 0 0 24px rgba(245, 190, 100, 0.5);
      }

      .apd-w-card-icon-wrap {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        color: #fef08a;
      }
      .apd-w-card-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 6px;
        letter-spacing: 0.01em;
      }
      .apd-w-card-desc {
        font-size: 12.5px;
        line-height: 1.4;
        color: #d1c7bc;
        opacity: 0.92;
      }
      .apd-w-card-featured .apd-w-card-desc {
        color: #fae8d4;
      }

      /* Feature Ribbon */
      .apd-w-ribbon-wrap {
        width: 100%;
        max-width: 980px;
        margin-bottom: 24px;
        position: relative;
        padding-top: 18px;
        border-top: 1px solid rgba(212, 163, 89, 0.28);
      }
      .apd-w-ribbon-node {
        position: absolute;
        top: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 9px;
        height: 9px;
        background: #d4a359;
        box-shadow: 0 0 8px #d4a359;
      }
      .apd-w-ribbon-items {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .apd-w-ribbon-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 8px;
        background: transparent;
        border: none;
        color: #e5ded5;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
      }
      .apd-w-ribbon-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fef08a;
        transform: translateY(-2px);
      }
      .apd-w-ribbon-btn svg {
        width: 22px;
        height: 22px;
        color: #d4a359;
        transition: transform 0.2s ease;
      }
      .apd-w-ribbon-btn:hover svg {
        transform: scale(1.12);
        color: #fef08a;
      }
      .apd-w-ribbon-btn span {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.02em;
      }

      /* Trust Badges Bar */
      .apd-w-trust-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 40px;
        flex-wrap: wrap;
        padding: 14px 24px 26px 24px;
        color: #cfc6b8;
      }
      .apd-w-trust-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
      }
      .apd-w-trust-item svg {
        width: 18px;
        height: 18px;
        color: #d4a359;
      }
      .apd-w-trust-title {
        font-weight: 600;
        color: #f5f0e8;
      }
      .apd-w-trust-sub {
        font-size: 11.5px;
        color: #a89f92;
        margin-left: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  // Create the Welcome Screen DOM
  function createWelcomeScreen() {
    if (document.getElementById('apd-welcome-screen')) return;

    injectStyles();

    const screen = document.createElement('div');
    screen.id = 'apd-welcome-screen';

    screen.innerHTML = `
      <!-- Top Titlebar -->
      <div class="apd-w-topbar">
        <div class="apd-w-brand-pill">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="18" r="8.5" fill="#f59e0b"/>
            <path d="M50 20 L86 92 L66 92 L50 58 L34 92 L14 92 Z" fill="#9e2a18"/>
            <path d="M28 66 C42 58 58 58 72 66 L75 72 C59 64 41 64 25 72 Z" fill="#ffffff"/>
          </svg>
          <span style="font-family: Georgia, serif; font-weight: 600;">ArchaeoPhD <span style="color:#d4a359; font-style:italic;">AI</span></span>
          <span class="apd-w-version">v1.0.0</span>
        </div>
        <div>
          <button class="apd-w-skip-btn" id="apd-w-enter-workspace">
            Open Workspace &rarr;
          </button>
        </div>
      </div>

      <!-- Center Hero -->
      <div class="apd-w-center">
        <!-- Pure Transparent Vector Emblem -->
        <div class="apd-w-emblem-wrap" id="apd-w-emblem">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
            <!-- Golden Glow -->
            <circle cx="50" cy="18" r="14" fill="url(#goldGlow)" opacity="0.35"/>
            <!-- Sun Disc -->
            <circle cx="50" cy="18" r="8.5" fill="url(#sunGrad)"/>
            <!-- Terracotta 'A' Arch -->
            <path d="M50 20 L86 92 L66 92 L50 58 L34 92 L14 92 Z" fill="url(#terraGrad)"/>
            <!-- Contour Wave Ribbon -->
            <path d="M28 66 C42 58 58 58 72 66 L75 72 C59 64 41 64 25 72 Z" fill="#ffffff" opacity="0.95"/>
            <path d="M32 75 C43 69 57 69 68 75 L70 80 C58 74 44 74 30 80 Z" fill="#ffffff" opacity="0.85"/>
            <defs>
              <linearGradient id="terraGrad" x1="14" y1="20" x2="86" y2="92" gradientUnits="userSpaceOnUse">
                <stop stop-color="#b83820"/>
                <stop offset="0.5" stop-color="#932b1a"/>
                <stop offset="1" stop-color="#67190c"/>
              </linearGradient>
              <radialGradient id="sunGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(48 16) scale(10)">
                <stop stop-color="#fef08a"/>
                <stop offset="0.6" stop-color="#f59e0b"/>
                <stop offset="1" stop-color="#b45309"/>
              </radialGradient>
              <radialGradient id="goldGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 18) scale(14)">
                <stop stop-color="#fde047"/>
                <stop offset="1" stop-color="#d97706" stop-opacity="0"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        <h2 class="apd-w-brand-title">ArchaeoPhD<span class="gold-ai">AI</span></h2>
        <div class="apd-w-tagline">AI-Powered Archaeological Research Workspace</div>

        <h1 class="apd-w-main-heading">Welcome to ArchaeoPhD<span class="gold-ai-heading">AI</span></h1>
        <p class="apd-w-sub-desc">
          Your intelligent companion for archaeological research, evidence analysis and scholarly writing.
        </p>

        <!-- Four Action Cards -->
        <div class="apd-w-cards-grid">
          <!-- Card 1: Explore Demo (Active/Featured) -->
          <div class="apd-w-card apd-w-card-featured" id="apd-card-demo">
            <div class="apd-w-card-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:26px; height:26px;">
                <polygon points="5 3 19 12 5 21 5 3" fill="rgba(255,255,255,0.2)"></polygon>
              </svg>
            </div>
            <div class="apd-w-card-title">Explore Demo</div>
            <div class="apd-w-card-desc">Try a sample research project with real data</div>
          </div>

          <!-- Card 2: Get Started -->
          <div class="apd-w-card apd-w-card-glass" id="apd-card-start">
            <div class="apd-w-card-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px; height:24px; color:#d4a359;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <div class="apd-w-card-title">Get Started</div>
            <div class="apd-w-card-desc">Create a new account and set up your workspace</div>
          </div>

          <!-- Card 3: Open Workspace -->
          <div class="apd-w-card apd-w-card-glass" id="apd-card-workspace">
            <div class="apd-w-card-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px; height:24px; color:#d4a359;">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
              </svg>
            </div>
            <div class="apd-w-card-title">Open Workspace</div>
            <div class="apd-w-card-desc">Continue with your existing projects</div>
          </div>

          <!-- Card 4: Sign In -->
          <div class="apd-w-card apd-w-card-glass" id="apd-card-signin">
            <div class="apd-w-card-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px; height:24px; color:#d4a359;">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="apd-w-card-title">Sign In</div>
            <div class="apd-w-card-desc">Access your account and research data.</div>
          </div>
        </div>

        <!-- Middle Feature Ribbon -->
        <div class="apd-w-ribbon-wrap">
          <div class="apd-w-ribbon-node"></div>
          <div class="apd-w-ribbon-items">
            <!-- 1. AI Research -->
            <button class="apd-w-ribbon-btn" data-route="/ai-research">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4c0 .7-.2 1.4-.5 2H18a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5.3.8.4 1.6.3 2.5a4 4 0 0 1-4 4h-2a2 2 0 0 1-2-2v-4"></path>
                <path d="M12 2a4 4 0 0 0-4 4c0 .7.2 1.4.5 2H6a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5-.3.8-.4 1.6-.3 2.5a4 4 0 0 0 4 4h2a2 2 0 0 0 2-2v-4"></path>
              </svg>
              <span>AI Research</span>
            </button>

            <!-- 2. Evidence & Argumentation -->
            <button class="apd-w-ribbon-btn" data-route="/evidence-graph">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="6" r="3"></circle>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="18" cy="18" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <line x1="8.5" y1="7.5" x2="15.5" y2="16.5"></line>
                <line x1="8.5" y1="16.5" x2="15.5" y2="7.5"></line>
              </svg>
              <span>Evidence & Argumentation</span>
            </button>

            <!-- 3. Artifacts & Sites -->
            <button class="apd-w-ribbon-btn" data-route="/sites">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Artifacts & Sites</span>
            </button>

            <!-- 4. Chronology -->
            <button class="apd-w-ribbon-btn" data-route="/chronology">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Chronology</span>
            </button>

            <!-- 5. Literature Graph -->
            <button class="apd-w-ribbon-btn" data-route="/literature-graph">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="5" r="3"></circle>
                <circle cx="5" cy="19" r="3"></circle>
                <circle cx="19" cy="19" r="3"></circle>
                <line x1="10" y1="7.5" x2="6.5" y2="16.5"></line>
                <line x1="14" y1="7.5" x2="17.5" y2="16.5"></line>
              </svg>
              <span>Literature Graph</span>
            </button>

            <!-- 6. Thesis & Writing -->
            <button class="apd-w-ribbon-btn" data-route="/thesis">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Thesis & Writing</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Trust Badges -->
      <div class="apd-w-trust-bar">
        <div class="apd-w-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          <div>
            <span class="apd-w-trust-title">Offline Mode</span>
            <span class="apd-w-trust-sub">(No Internet Required)</span>
          </div>
        </div>

        <div class="apd-w-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
            <path d="M3 12A9 3 0 0 0 21 12"></path>
          </svg>
          <div>
            <span class="apd-w-trust-title">Local Database</span>
            <span class="apd-w-trust-sub">(Your Data Stays on Your PC)</span>
          </div>
        </div>

        <div class="apd-w-trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          <div>
            <span class="apd-w-trust-title">Privacy First</span>
            <span class="apd-w-trust-sub">(No Data Upload)</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(screen);
    attachEvents();
  }

  // Navigate to React route
  function navigateTo(path) {
    const screen = document.getElementById('apd-welcome-screen');
    if (screen) {
      screen.classList.add('hidden');
    }
    try {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (e) {
      window.location.href = path;
    }
  }

  // Show Welcome Screen
  function showWelcome() {
    createWelcomeScreen();
    const screen = document.getElementById('apd-welcome-screen');
    if (screen) {
      screen.classList.remove('hidden');
    }
  }

  // Hide Welcome Screen
  function hideWelcome() {
    const screen = document.getElementById('apd-welcome-screen');
    if (screen) {
      screen.classList.add('hidden');
    }
  }

  // Attach button click events
  function attachEvents() {
    const btnEnter = document.getElementById('apd-w-enter-workspace');
    if (btnEnter) {
      btnEnter.onclick = () => navigateTo('/dashboard');
    }

    const emblem = document.getElementById('apd-w-emblem');
    if (emblem) {
      emblem.onclick = () => navigateTo('/dashboard');
    }

    const cardDemo = document.getElementById('apd-card-demo');
    if (cardDemo) {
      cardDemo.onclick = () => navigateTo('/demo');
    }

    const cardStart = document.getElementById('apd-card-start');
    if (cardStart) {
      cardStart.onclick = () => navigateTo('/projects/new');
    }

    const cardWorkspace = document.getElementById('apd-card-workspace');
    if (cardWorkspace) {
      cardWorkspace.onclick = () => navigateTo('/dashboard');
    }

    const cardSignin = document.getElementById('apd-card-signin');
    if (cardSignin) {
      cardSignin.onclick = () => navigateTo('/dashboard');
    }

    const ribbonBtns = document.querySelectorAll('.apd-w-ribbon-btn');
    ribbonBtns.forEach(btn => {
      btn.onclick = () => {
        const route = btn.getAttribute('data-route') || '/dashboard';
        navigateTo(route);
      };
    });
  }

  function checkRoute() {
    const p = window.location.pathname;
    const isWelcome = (p === '/' || p === '/welcome' || p === '/index.html' || p.endsWith('/index.html'));
    
    if (isWelcome) {
      showWelcome();
    } else {
      hideWelcome();
    }
  }

  function setupRouteListeners() {
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('pushstate', checkRoute);

    document.addEventListener('click', function (e) {
      const logoLink = e.target.closest('a[href="/"], .apd-nav-welcome');
      if (logoLink) {
        e.preventDefault();
        window.history.pushState(null, '', '/');
        showWelcome();
      }
    });

    checkRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createWelcomeScreen();
      setupRouteListeners();
    });
  } else {
    createWelcomeScreen();
    setupRouteListeners();
  }

  window.archaeophdWelcome = {
    show: showWelcome,
    hide: hideWelcome,
    navigate: navigateTo
  };

})();
