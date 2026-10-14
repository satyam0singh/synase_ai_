/* SYNASE AI landing page behaviour.
   Extracted verbatim from the inline <script> in landing.html. The former
   inline onclick/onsubmit attributes were replaced by data-auth* attributes
   handled by the delegated listener at the bottom of this file. */
import { initTheme } from "../../shared/services/theme.js";
import { initGradientWaves } from "./gradientWaves.js";
import { initLogoLoop } from "./logoLoop.js";
import { initBlobCursor } from "./blobCursor.js";
import { initContactForm } from "./contactForm.js";

/* ── AUTH ──────────────────────────────────────────── */
function openAuth() {
  document.getElementById('auth-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('login-email')?.focus();
}
function closeAuth() {
  document.getElementById('auth-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
function switchAuthTab(tab, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('auth-panel-' + tab).classList.add('active');
}
function switchAuthTabByName(tab) {
  const btns = document.querySelectorAll('.auth-tab');
  const idx = tab === 'login' ? 0 : 1;
  switchAuthTab(tab, btns[idx]);
}
document.getElementById('auth-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeAuth();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAuth();
});

/* ── FORM HANDLING (calls mock API, then redirects to app) ── */
async function handleAuth(event, kind) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('.auth-submit');
  const errorEl = document.getElementById(kind + '-error');
  btn.disabled = true;
  btn.textContent = kind === 'login' ? 'Signing in…' : 'Creating account…';
  errorEl.classList.remove('show');
  try {
    const body = {};
    new FormData(form).forEach((v, k) => body[k] = v);
    body.idempotencyKey = 'ik_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const res = await fetch('/api/v1/auth/' + kind, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      closeAuth();
      window.location.href = 'app.html#/app/chat';
    } else if (res.status === 404 || res.status === 0) {
      /* Dev: mock adapter not connected — go straight to app */
      closeAuth();
      window.location.href = 'app.html#/app/chat';
    } else {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error?.message || (kind === 'login' ? 'Invalid credentials.' : 'Registration failed.'));
    }
  } catch(e) {
    if (e.message && !e.message.includes('fetch') && !e.message.includes('Failed')) {
      errorEl.textContent = e.message; errorEl.classList.add('show');
    } else {
      /* Network down / local dev — fall through to app */
      closeAuth();
      window.location.href = 'app.html#/app/chat';
    }
  } finally {
    btn.disabled = false;
    btn.textContent = kind === 'login' ? 'Sign in' : 'Create account';
  }
}

/* ── NAV BUTTONS ──────────────────────────────────── */
document.getElementById('login-btn').addEventListener('click', openAuth);
document.getElementById('start-now-btn').addEventListener('click', () => {
  window.location.href = 'app.html#/app/chat';
});
document.getElementById('hero-start-btn').addEventListener('click', () => {
  window.location.href = 'app.html#/app/chat';
});

// Auto-open login if route or hash specifies auth
if (window.location.hash === '#login' || new URLSearchParams(window.location.search).get('route')?.includes('login')) {
  openAuth();
}

/* ── SCROLL REVEAL ────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── BENTO CARD GLOW FOLLOW ───────────────────────── */
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ── ACTIVE NAV HIGHLIGHT ─────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => navObserver.observe(s));

/* ── INITIALIZE LANDING PAGE SPECIFIC EFFECTS (ISOLATED) ── */
// These effects mount ONLY on the public landing page and clean up on unload
const wavesContainer = document.getElementById('gradient-waves-root');
const wavesInstance = wavesContainer ? initGradientWaves(wavesContainer) : null;

const logoLoopContainer = document.getElementById('logo-loop-root');
const logoLoopInstance = logoLoopContainer ? initLogoLoop(logoLoopContainer) : null;

const blobCursorContainer = document.getElementById('blob-cursor-root');
const blobCursorInstance = blobCursorContainer ? initBlobCursor(blobCursorContainer) : null;

const contactFormEl = /** @type {HTMLFormElement|null} */ (document.getElementById('contact-form'));
const contactFormInstance = contactFormEl ? initContactForm(contactFormEl, { destinationEmail: 'satyam8076singh@gmail.com' }) : null;

/* ── CONTACT TOPICS & INQUIRY SYNC ──────────────────── */
const topicCards = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.contact-topic'));
const inquirySelectEl = /** @type {HTMLSelectElement|null} */ (document.getElementById('contact-inquiry-type'));

function activateTopic(card, syncDropdown = true) {
  if (!card) return;
  topicCards.forEach(x => {
    x.classList.remove('active');
    x.setAttribute('aria-checked', 'false');
  });
  card.classList.add('active');
  card.setAttribute('aria-checked', 'true');

  if (syncDropdown && contactFormInstance) {
    const topicTitle = card.getAttribute('data-topic') || card.querySelector('h4')?.textContent?.trim() || '';
    if (topicTitle) {
      contactFormInstance.setTopic(topicTitle);
    }
  }
}

topicCards.forEach(card => {
  card.addEventListener('click', () => {
    activateTopic(card, true);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateTopic(card, true);
    }
  });
});

if (inquirySelectEl) {
  inquirySelectEl.addEventListener('change', () => {
    const val = inquirySelectEl.value.trim().toLowerCase();
    let matchedCard = null;
    topicCards.forEach(card => {
      const topic = (card.getAttribute('data-topic') || card.querySelector('h4')?.textContent || '').trim().toLowerCase();
      if (topic && (topic === val || topic.includes(val) || val.includes(topic))) {
        matchedCard = card;
      }
    });

    if (matchedCard) {
      activateTopic(matchedCard, false);
    } else {
      // Selected "Other" or an option without an explicit card
      topicCards.forEach(x => {
        x.classList.remove('active');
        x.setAttribute('aria-checked', 'false');
      });
    }
  });
}

// Ensure active card is in sync with dropdown on initialization
const initialActiveCard = document.querySelector('.contact-topic.active');
if (initialActiveCard instanceof HTMLElement) {
  activateTopic(initialActiveCard, true);
}

// Sync back to default card on form reset
contactFormEl?.addEventListener('reset', () => {
  setTimeout(() => {
    const firstCard = topicCards[0];
    if (firstCard) activateTopic(firstCard, true);
  }, 0);
});

/* ── SMOOTH SCROLLING FOR IN-PAGE NAV ──────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', href);
    }
  });
});

/* ── MOBILE NAV TOGGLE & ACCESSIBILITY ─────────────── */
const mobileToggle = document.querySelector('.nav-mobile-toggle');
const navLinksEl = document.querySelector('.nav-links');
const navBackdropEl = document.getElementById('nav-backdrop');

function closeMobileNav() {
  if (mobileToggle && navLinksEl) {
    mobileToggle.setAttribute('aria-expanded', 'false');
    navLinksEl.classList.remove('mobile-open');
    navBackdropEl?.classList.remove('active');
  }
}

function openMobileNav() {
  if (mobileToggle && navLinksEl) {
    mobileToggle.setAttribute('aria-expanded', 'true');
    navLinksEl.classList.add('mobile-open');
    navBackdropEl?.classList.add('active');
  }
}

if (mobileToggle && navLinksEl) {
  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  navLinksEl.querySelectorAll('a, button').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  navBackdropEl?.addEventListener('click', closeMobileNav);

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof Element && !target.closest('#main-nav') && !target.closest('#nav-backdrop')) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      closeMobileNav();
    }
  });
}

/* ── delegated replacements for the former inline handlers ───────── */
document.addEventListener("click", (event) => {
  /* Password visibility toggle */
  const toggleBtn = event.target instanceof Element
    ? event.target.closest("[data-toggle-password]")
    : null;
  if (toggleBtn) {
    const inputId = toggleBtn.getAttribute("data-toggle-password");
    const input = inputId ? /** @type {HTMLInputElement|null} */ (document.getElementById(inputId)) : null;
    if (input) {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      const eyeShow = /** @type {HTMLElement|null} */ (toggleBtn.querySelector(".eye-show"));
      const eyeHide = /** @type {HTMLElement|null} */ (toggleBtn.querySelector(".eye-hide"));
      if (eyeShow && eyeHide) {
        eyeShow.style.display = isPassword ? "none" : "block";
        eyeHide.style.display = isPassword ? "block" : "none";
      }
      toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    }
    return;
  }

  /* SSO Buttons */
  const ssoBtn = event.target instanceof Element ? event.target.closest("[data-sso]") : null;
  if (ssoBtn) {
    closeAuth();
    window.location.href = 'app.html#/app/chat';
    return;
  }

  const target = event.target instanceof Element
    ? event.target.closest("[data-auth],[data-auth-tab],[data-auth-tab-name],[data-route-to]")
    : null;
  if (!target) return;
  const to = target.getAttribute("data-route-to");
  if (to) { window.location.href = to; return; }
  const tab = target.getAttribute("data-auth-tab");
  if (tab) { switchAuthTab(tab, target); return; }
  const tabName = target.getAttribute("data-auth-tab-name");
  if (tabName) { switchAuthTabByName(tabName); return; }
  const action = target.getAttribute("data-auth");
  if (action === "open") { event.preventDefault(); openAuth(); return; }
  if (action === "close") { event.preventDefault(); closeAuth(); }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLElement)) return;

  // Let contact-form be handled exclusively by its dedicated FormSubmit listener in initContactForm
  if (form.id === "contact-form") return;

  const kind = form.getAttribute("data-auth-submit");
  if (!kind) return;
  event.preventDefault();
  handleAuth(event, kind);
});

// Resource cleanup to ensure zero leak if navigated away
window.addEventListener('pagehide', () => {
  wavesInstance?.destroy();
  logoLoopInstance?.destroy();
  blobCursorInstance?.destroy();
  contactFormInstance?.destroy();
});

initTheme();


