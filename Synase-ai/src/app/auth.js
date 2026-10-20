// @ts-check
/* Authentication screens (login / register / recover)
   Redesigned using React Bits Pro Auth 4 (Split sign-in with Orbital Trust Ring). */
import { routes } from "./paths.js";
import { brandMarkSvg } from "../shared/components/ui.js";
import { escapeHtml } from "../shared/utils/format.js";
import { themeToggleMarkup } from "../shared/services/theme.js";

export function authPage(kind = "login") {
  const config = {
    login: {
      eyebrow: "SECURE WORKSPACE ACCESS",
      title: "Welcome back",
      copy: "Sign in to access your projects and decision intelligence workspace.",
      button: "Sign in to Workspace →"
    },
    register: {
      eyebrow: "CREATE ENTERPRISE ACCOUNT",
      title: "Create your account",
      copy: "Set up multi-agent decision reviews and repository intelligence.",
      button: "Create Workspace Account →"
    },
    forgot: {
      eyebrow: "ACCOUNT RECOVERY",
      title: "Recover access",
      copy: "Enter your work email and we will dispatch recovery instructions.",
      button: "Send Recovery Instructions →"
    }
  }[kind] || {
    eyebrow: "SECURE WORKSPACE ACCESS",
    title: "Welcome back",
    copy: "Sign in to access your projects and decision intelligence workspace.",
    button: "Sign in to Workspace →"
  };

  return `<div class="auth-layout" id="auth-root">
    <!-- LEFT PANEL: Brand Narrative, Orbital Integration Constellation & Capabilities (Image 1 Proposed) -->
    <section class="auth-art" aria-label="Synase AI Platform Overview">
      <div class="auth-art-header">
        <a class="brand" href="landing.html" aria-label="Return to Synase AI Home">
          <span class="brand-mark">${brandMarkSvg()}</span>
          <span class="brand-copy"><strong>SYNASE AI</strong><span>DECISION INTELLIGENCE</span></span>
        </a>
        <div class="auth-header-actions">
          ${themeToggleMarkup("auth-theme-toggle")}
          <a href="landing.html" class="auth-back-link" aria-label="Back to Synase AI home page">
            <span aria-hidden="true">←</span> Back to Home
          </a>
        </div>
      </div>

      <!-- MAIN LEFT CONTENT WRAPPER -->
      <div class="auth-main-content">
        <!-- TOP SPLIT ROW: Headline & Pills on Left, Orbital Constellation on Right -->
        <div class="auth-hero-split">
          <div class="auth-hero-text">
            <div class="eyebrow" style="color:var(--cyan); letter-spacing:0.12em;">ENTERPRISE DECISION PLATFORM</div>
            <h1 class="auth-headline">Clear engineering<br>decisions from idea<br>to <span>production.</span></h1>
            <p class="auth-description">
              Connect your repositories, project specifications, and team priorities. SYNASE AI evaluates architecture, spots deployment risks, and provides verified decisions before you ship.
            </p>

            <!-- 3 Trust Security Badges (Matching Image 1) -->
            <div class="auth-trust-pills">
              <div class="auth-trust-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>SOC 2 Type II</span>
              </div>
              <div class="auth-trust-pill" title="Enterprise Grade · 99.99% SLA">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Enterprise Grade</span>
                <span class="sr-only">99.99% SLA</span>
              </div>
              <div class="auth-trust-pill" title="Private & Encrypted · Zero Retention">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                <span>Private &amp; Encrypted</span>
                <span class="sr-only">Zero Retention</span>
              </div>
            </div>
          </div>

          <!-- ORBITAL INTEGRATION CONSTELLATION (Right side of hero split) -->
          <div class="auth-orbital-container" aria-hidden="true">
            <div class="orbital-stage">
              <!-- Background Concentric SVG Orbit Rings and Constellation Trail -->
              <svg class="orbital-paths-svg" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="orbitalCoreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.55" />
                    <stop offset="55%" stop-color="#3279f9" stop-opacity="0.22" />
                    <stop offset="100%" stop-color="#08090d" stop-opacity="0" />
                  </radialGradient>
                  <linearGradient id="orbitalRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#a855f7" stop-opacity="0.8" />
                    <stop offset="50%" stop-color="#3279f9" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#a855f7" stop-opacity="0.8" />
                  </linearGradient>
                  <linearGradient id="orbitalRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#3279f9" stop-opacity="0.75" />
                    <stop offset="50%" stop-color="#a855f7" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.75" />
                  </linearGradient>
                </defs>

                <!-- Core Ambient Luminous Glow -->
                <circle cx="190" cy="190" r="165" fill="url(#orbitalCoreGlow)" />

                <!-- 3 Concentric Orbit Rings -->
                <circle cx="190" cy="190" r="162" stroke="url(#orbitalRingGrad1)" stroke-width="1.2" stroke-dasharray="4 6" opacity="0.65" />
                <circle cx="190" cy="190" r="118" stroke="url(#orbitalRingGrad2)" stroke-width="1.2" stroke-dasharray="6 5" opacity="0.8" />
                <circle cx="190" cy="190" r="74" stroke="rgba(168, 85, 247, 0.45)" stroke-width="1" />

                <!-- Connecting Trail to Headline with Luminous Energy Dots -->
                <path d="M 0 80 Q 95 110 190 190" stroke="rgba(168, 85, 247, 0.45)" stroke-width="1.2" stroke-dasharray="3 4" />
                
                <!-- Glowing Energy Nodes on Orbits -->
                <circle cx="8" cy="80" r="4.5" fill="#c084fc" filter="drop-shadow(0 0 8px #a855f7)" />
                <circle cx="150" cy="74" r="3.5" fill="#60a5fa" filter="drop-shadow(0 0 6px #3b82f6)" />
                <circle cx="308" cy="190" r="4" fill="#c084fc" filter="drop-shadow(0 0 7px #a855f7)" />
                <circle cx="270" cy="280" r="3.5" fill="#38bdf8" filter="drop-shadow(0 0 6px #0ea5e9)" />
                <circle cx="105" cy="272" r="3.5" fill="#a855f7" filter="drop-shadow(0 0 6px #a855f7)" />
              </svg>

              <!-- Center Core Disc with Trusted Engineering Intelligence -->
              <div class="orbital-core">
                <div class="orbital-core-pulse"></div>
                <div class="orbital-core-mark">
                  ${brandMarkSvg()}
                </div>
                <div class="orbital-core-copy">
                  <span>TRUSTED</span>
                  <span>ENGINEERING</span>
                  <span>INTELLIGENCE</span>
                </div>
              </div>

              <!-- 6 Orbiting Integration Nodes (Directly Positioned Matching Image 1) -->
              <!-- GitHub: Code & PRs (Top) -->
              <div class="orbital-node node-github">
                <span class="orbital-node-icon icon-github">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </span>
                <div class="orbital-node-info">
                  <span class="orbital-node-name">GitHub</span>
                  <span class="orbital-node-meta">Code &amp; PRs</span>
                </div>
              </div>

              <!-- Kubernetes: Deployments (Upper-Right) -->
              <div class="orbital-node node-k8s">
                <span class="orbital-node-icon icon-k8s">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#326ce5"><circle cx="12" cy="12" r="9" fill="none" stroke="#326ce5" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#326ce5"/><line x1="12" y1="3" x2="12" y2="9" stroke="#326ce5" stroke-width="2"/><line x1="12" y1="15" x2="12" y2="21" stroke="#326ce5" stroke-width="2"/><line x1="3" y1="12" x2="9" y2="12" stroke="#326ce5" stroke-width="2"/><line x1="15" y1="12" x2="21" y2="12" stroke="#326ce5" stroke-width="2"/></svg>
                </span>
                <div class="orbital-node-info">
                  <span class="orbital-node-name">Kubernetes</span>
                  <span class="orbital-node-meta">Deployments</span>
                </div>
              </div>

              <!-- Docker: Infrastructure (Middle-Right) -->
              <div class="orbital-node node-docker">
                <span class="orbital-node-icon icon-docker">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#0db7ed"><rect x="4" y="10" width="2.5" height="2.5" rx="0.5"/><rect x="7.5" y="10" width="2.5" height="2.5" rx="0.5"/><rect x="11" y="10" width="2.5" height="2.5" rx="0.5"/><rect x="7.5" y="7" width="2.5" height="2.5" rx="0.5"/><rect x="11" y="7" width="2.5" height="2.5" rx="0.5"/><path d="M2 13.5c1 3.5 4 5.5 8.5 5.5 6 0 9.5-3.5 10-5.5H2z"/></svg>
                </span>
                <div class="orbital-node-info">
                  <span class="orbital-node-name">Docker</span>
                  <span class="orbital-node-meta">Infrastructure</span>
                </div>
              </div>

              <!-- Linear: Product & Roadmap (Bottom) -->
              <div class="orbital-node node-linear">
                <span class="orbital-node-icon icon-linear">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 13l6-6M9 16l8-8M12 18l5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </span>
                <div class="orbital-node-info">
                  <span class="orbital-node-name">Linear</span>
                  <span class="orbital-node-meta">Product &amp; Roadmap</span>
                </div>
              </div>

              <!-- Notion: Docs & Specs (Lower-Left) -->
              <div class="orbital-node node-notion">
                <span class="orbital-node-icon icon-notion">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 6v12l4-8v8l6-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <div class="orbital-node-info">
                  <span class="orbital-node-name">Notion</span>
                  <span class="orbital-node-meta">Docs &amp; Specs</span>
                </div>
              </div>

              <!-- Jira: Issues & Tasks (Upper-Left) -->
              <div class="orbital-node node-jira">
                <span class="orbital-node-icon icon-jira">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#0052cc"><path d="M11.5 2L3 10.5l4 4L15.5 6l-4-4zm1 5.5l-4 4 4 4 4-4-4-4zm4 4l-4 4 4 4 4-4-4-4z"/></svg>
                </span>
                <div class="orbital-node-info">
                  <span class="orbital-node-name">Jira</span>
                  <span class="orbital-node-meta">Issues &amp; Tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3 NUMBERED CAPABILITY CARDS (01, 02, 03 - Matching Image 1) -->
        <div class="auth-how-grid">
          <div class="auth-capability-card">
            <div class="capability-step-num step-cyan">01</div>
            <div class="capability-card-row">
              <div class="capability-icon-box icon-cyan" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <div class="capability-content">
                <div class="capability-title">Code &amp; Specs</div>
                <div class="capability-desc">Securely inspect code repositories, PRDs, and task lists.</div>
                <div class="capability-status status-cyan">● Code Sync: Ready</div>
              </div>
            </div>
          </div>

          <div class="auth-capability-card">
            <div class="capability-step-num step-purple">02</div>
            <div class="capability-card-row">
              <div class="capability-icon-box icon-purple" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div class="capability-content">
                <div class="capability-title">Smart Review</div>
                <div class="capability-desc">Evaluates architecture, dependencies, and coverage.</div>
                <div class="capability-status status-purple">● Analysis: Active</div>
              </div>
            </div>
          </div>

          <div class="auth-capability-card">
            <div class="capability-step-num step-green">03</div>
            <div class="capability-card-row">
              <div class="capability-icon-box icon-green" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>
              <div class="capability-content">
                <div class="capability-title">Verified Action</div>
                <div class="capability-desc">Recommendations, risk alerts, and ready-to-use rollout plans.</div>
                <div class="capability-status status-green">● Security: Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RIGHT PANEL: Auth 4 Structured Authentication Form (Image 1 Proposed) -->
    <main class="auth-panel" aria-label="Sign in to Synase AI">
      <section class="auth-card" id="auth-card-block">
        <!-- Mobile brand badge -->
        <div class="auth-card-brand-mobile">
          <div class="auth-card-brand-mark">${brandMarkSvg()}</div>
          <span class="auth-card-brand-text">SYNASE AI</span>
        </div>

        <div class="eyebrow" style="color:var(--cyan); margin-bottom:5px;">${config.eyebrow}</div>
        <h2 class="auth-title">${config.title}</h2>
        <p class="auth-subtitle">${config.copy}</p>

        <!-- Segmented Tab Switcher (Image 1 style) -->
        ${kind !== "forgot" ? `
          <div class="auth-tab-switcher" role="tablist" aria-label="Authentication mode selection">
            <a href="#/auth/login" class="auth-tab-btn ${kind === "login" ? "active" : ""}" role="tab" aria-selected="${kind === "login"}">Sign in</a>
            <a href="#/auth/register" class="auth-tab-btn ${kind === "register" ? "active" : ""}" role="tab" aria-selected="${kind === "register"}">Create account</a>
          </div>
        ` : ""}

        <!-- Social / Enterprise OAuth Providers -->
        ${kind !== "forgot" ? `
          <div class="auth-sso-group">
            <button type="button" class="sso-btn" data-sso="github" aria-label="Continue with GitHub">
              <svg class="sso-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
            <button type="button" class="sso-btn" data-sso="google" aria-label="Continue with Google Workspace">
              <svg class="sso-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google SSO</span>
            </button>
          </div>
          <div class="auth-divider">
            <span>or continue with work email</span>
          </div>
        ` : ""}

        <!-- Credentials Form -->
        <form id="auth-form" data-kind="${kind}" novalidate>
          ${kind === "register" ? `
            <div class="field">
              <label for="auth-name">Full name <span class="req">*</span></label>
              <div class="input-with-icon">
                <svg class="field-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input id="auth-name" name="name" autocomplete="name" required placeholder="Alex Turner" />
              </div>
            </div>
          ` : ""}

          <div class="field">
            <label for="auth-email">Work email <span class="req">*</span></label>
            <div class="input-with-icon">
              <svg class="field-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input id="auth-email" name="email" type="email" autocomplete="email" placeholder="alex@company.com" required />
            </div>
          </div>

          ${kind === "register" ? `
            <div class="field">
              <label for="auth-phone">Phone number <span class="req">*</span></label>
              <div class="input-with-icon">
                <input id="auth-phone" name="phoneNo" type="tel" inputmode="numeric" autocomplete="tel" pattern="[0-9]{10}" minlength="10" maxlength="10" required placeholder="10-digit phone number" />
              </div>
            </div>
          ` : ""}

          ${kind !== "forgot" ? `
            <div class="field">
              <div class="field-label-row">
                <label for="auth-password">Password <span class="req">*</span></label>
                ${kind === "login" ? `<a href="#/auth/forgot-password" class="field-link">Forgot password?</a>` : ""}
              </div>
              <div class="password-input-wrap input-with-icon">
                <svg class="field-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="auth-password" name="password" type="password" autocomplete="${kind === "login" ? "current-password" : "new-password"}" minlength="8" required placeholder="Enter your password" />
                <button type="button" class="password-toggle-btn" aria-label="Toggle password visibility" data-toggle-password="auth-password">
                  <svg class="eye-icon eye-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg class="eye-icon eye-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none;">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>
          ` : ""}

          ${kind === "login" ? `
            <div class="auth-remember-row">
              <label class="remember-label">
                <input type="checkbox" name="remember" checked />
                <span>Keep me signed in on this workstation</span>
              </label>
            </div>
          ` : ""}

          <div id="auth-message" role="status" aria-live="polite"></div>

          <!-- High-Contrast Clean Submit Button (Image 1) -->
          <button class="button primary auth-submit-btn" type="submit">
            ${config.button}
          </button>
        </form>

        <!-- Direct Demo Entry (Safe Sandbox Access with Play Icon) -->
        ${kind === "login" ? `
          <div class="auth-divider demo-divider">
            <span>or instant sandbox entry</span>
          </div>
          <button type="button" class="button auth-demo-btn" data-action="demo-login" aria-label="Enter platform demo workspace">
            <span class="demo-btn-left">
              <svg class="demo-btn-play" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><polygon points="6 4 18 12 6 20 6 4"/></svg>
              <span class="demo-btn-text">Direct Demo Workspace Entry (ABESIT / Platform Prj)</span>
            </span>
            <span class="demo-btn-arrow" aria-hidden="true">→</span>
          </button>
        ` : ""}

        <!-- Secondary Bottom Navigation Row (Matching Image 1) -->
        <div class="auth-bottom-nav">
          ${kind !== "login" ? `<a href="#/auth/login" class="auth-sub-link">Already registered? Sign in</a>` : `<div class="auth-bottom-left">Need an account? <a href="#/auth/register" class="auth-sub-link">Create one</a></div>`}
          <a href="landing.html#contact" class="auth-sub-link">Contact Architecture Desk</a>
        </div>
      </section>
    </main>
  </div>`;
}

