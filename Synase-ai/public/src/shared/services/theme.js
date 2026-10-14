/* Light/dark theme switching, shared by the console and the landing page.
   The <head> inline script in each HTML file sets data-theme before first
   paint; this module wires the toggles and keeps their labels in sync. */

import { lucideIcon } from '../components/icons.js';

const KEY = 'synase-theme';
const DARK = 'dark';

export function currentTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === DARK
    ? DARK
    : 'light';
}

export function setTheme(theme) {
  const next = theme === DARK ? DARK : 'light';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode: the attribute still applies for this page view */
    }
    syncToggles();
  }
  return next;
}

export function toggleTheme() {
  return setTheme(currentTheme() === DARK ? 'light' : DARK);
}

/* Buttons are re-rendered by the console on every state change, so labels
   and Lucide icon SVGs are refreshed here rather than baked into static unicode. */
export function syncToggles() {
  if (typeof document === 'undefined') return;
  const dark = currentTheme() === DARK;
  for (const button of document.querySelectorAll('[data-theme-toggle]')) {
    const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('aria-pressed', String(dark));
    const glyph = button.querySelector('[data-theme-glyph]');
    if (glyph) {
      glyph.innerHTML = dark ? lucideIcon('sun', { size: 16 }) : lucideIcon('moon', { size: 16 });
    }
  }
}

export function initTheme() {
  if (!document.documentElement.hasAttribute('data-theme')) {
    setTheme(
      window.matchMedia?.('(prefers-color-scheme: dark)').matches ? DARK : 'light',
    );
  }
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme-toggle]');
    if (!button) return;
    event.preventDefault();
    toggleTheme();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === KEY && event.newValue) {
      setTheme(event.newValue);
    }
  });
  syncToggles();
}

/* Markup shared by both surfaces. */
export function themeToggleMarkup(className = 'theme-toggle') {
  const dark = currentTheme() === DARK;
  const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
  const icon = dark ? lucideIcon('sun', { size: 16 }) : lucideIcon('moon', { size: 16 });
  return `<button class="icon-btn ${className}" type="button" data-theme-toggle aria-label="${label}" title="${label}" aria-pressed="${dark}"><span class="theme-toggle-glyph" data-theme-glyph aria-hidden="true">${icon}</span></button>`;
}