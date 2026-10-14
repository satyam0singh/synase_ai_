// @ts-check
/**
 * React Bits Logo Loop — Continuous Engineering Ecosystem Marquee
 * Reference: https://reactbits.dev/animations/logo-loop
 * 
 * Features:
 * - Sub-pixel continuous translation loop with smooth rAF delta timing
 * - Dynamic copy count calculation based on container and sequence width
 * - Exponential deceleration easing on hover pause
 * - Authentic SVG brand icons for GitHub, GitLab, Jira, Linear, Kubernetes, Docker, Bitbucket, Notion
 * - Full reduced-motion and theme compliance
 */

export const INTEGRATION_LOGOS = [
  {
    name: 'GitHub',
    category: 'Source Control & CI',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`
  },
  {
    name: 'GitLab',
    category: 'DevOps Platform',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M22.65 14.39L20.6 8.08c-.12-.38-.4-.68-.77-.82-.37-.14-.78-.11-1.12.09l-6.71 4.03-6.71-4.03c-.34-.2-.75-.23-1.12-.09-.37.14-.65.44-.77.82L3.12 14.39c-.19.57.01 1.2.49 1.56l8.03 6.02c.22.17.49.26.77.26s.55-.09.77-.26l8.03-6.02c.48-.36.68-.99.49-1.56z"/></svg>`
  },
  {
    name: 'Jira',
    category: 'Issue Tracking',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M11.53 2c0 2.4 1.97 4.35 4.38 4.35h3.74v-4.35h-8.12zm-4.38 5.8c0 2.4 1.96 4.35 4.38 4.35h3.74V7.8H7.15zm-4.38 5.8c0 2.4 1.96 4.35 4.38 4.35h3.74V13.6H2.77z"/></svg>`
  },
  {
    name: 'Linear',
    category: 'Product Cycles',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3.24 7.27a9.96 9.96 0 0113.49-4.03l-12.7 12.7a9.92 9.92 0 01-.79-8.67zm2.08 11.49l12.7-12.7a9.96 9.96 0 01-12.7 12.7zm15.44-5.26a9.96 9.96 0 01-13.49 4.03l12.7-12.7c.62 2.68.91 5.61.79 8.67z"/></svg>`
  },
  {
    name: 'Kubernetes',
    category: 'Container Orchestration',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2.5l7.79 4.5v9L12 20.5 4.21 16v-9L12 2.5zm0 2.1L5.94 8.1v6.8L12 18.4l6.06-3.5V8.1L12 4.6zm-1.05 4.7h2.1v2.15l1.86-1.07 1.05 1.82-1.86 1.07 1.86 1.07-1.05 1.82-1.86-1.07v2.15h-2.1v-2.15l-1.86 1.07-1.05-1.82 1.86-1.07-1.86-1.07 1.05-1.82 1.86 1.07V9.3z"/></svg>`
  },
  {
    name: 'Docker',
    category: 'Containerization',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.98 10.05h1.96V8.09h-1.96v1.96zm-2.45 0h1.96V8.09h-1.96v1.96zm-2.45 0h1.96V8.09H9.08v1.96zm-2.45 0h1.96V8.09H6.63v1.96zm4.9-2.45h1.96V5.64h-1.96v1.96zm-2.45 0h1.96V5.64H9.08v1.96zm7.35 2.45h1.96V8.09h-1.96v1.96zm6.81 2.21c-.44-.33-1.42-.44-2.18-.34-.22-.76-.76-1.42-1.63-1.85-.33-.16-.65-.16-.98 0-.54.33-.87.98-.98 1.63H2.05c-.22 1.2.22 2.4 1.09 3.27 1.09 1.09 2.72 1.63 4.9 1.63 4.9 0 8.71-2.07 9.8-5.34.65.11 1.42-.11 1.85-.54.44-.33.65-.87.54-1.42-.22-.11-.43-.11-.65 0z"/></svg>`
  },
  {
    name: 'Bitbucket',
    category: 'Repository Mesh',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M2.61 3h18.78c.36 0 .68.24.78.59l2.77 15.68a.8.8 0 01-.78.94H4.84a.8.8 0 01-.78-.66L1.83 3.59A.8.8 0 012.61 3zm11.75 11.23h-4.72l-.95-4.22h6.62l-.95 4.22z"/></svg>`
  },
  {
    name: 'Notion',
    category: 'Product Specs & PRDs',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l12.425-.746c1.12-.093 1.399-.373 1.399-1.213L20.618 2H3.992l.467 2.208zm-.933 1.68L1.752 20.824c-.094.653.28 1.12 1.12 1.12l15.316-.933c1.026-.094 1.493-.747 1.493-1.494L20.805 5.888H3.526zm12.328 11.859l-2.054-.187-4.11-6.91v6.35l2.055.187v.747h-5.044v-.747l2.055-.187V9.718L6.7 9.531v-.747h3.736l4.296 6.91V9.718l-1.868-.187v-.747h4.95v.747l-1.96.187v7.954z"/></svg>`
  }
];

/**
 * Initializes the React Bits Logo Loop inside a container element.
 * @param {HTMLElement} container
 * @param {Object} [options]
 * @returns {{ destroy: () => void }}
 */
export function initLogoLoop(container, options = {}) {
  if (!container || typeof window === 'undefined') {
    return { destroy: () => {} };
  }

  const speed = options.speed ?? 42; // px per second
  const gap = options.gap ?? 16;
  const logos = options.logos || INTEGRATION_LOGOS;
  const pauseOnHover = options.pauseOnHover !== false;

  container.innerHTML = `
    <div class="logoloop logoloop--fade" role="region" aria-label="Built to connect with engineering stack">
      <div class="logoloop__track" style="will-change: transform;"></div>
    </div>
  `;

  const loopEl = container.querySelector('.logoloop');
  const track = container.querySelector('.logoloop__track');
  if (!loopEl || !track) return { destroy: () => {} };

  /**
   * Generates a single sequence list of pills.
   * @param {number} copyIndex
   */
  function createList(copyIndex) {
    const ul = document.createElement('ul');
    ul.className = 'logoloop__list';
    ul.setAttribute('role', 'list');
    if (copyIndex > 0) ul.setAttribute('aria-hidden', 'true');

    logos.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'logoloop__item';
      li.setAttribute('role', 'listitem');
      li.innerHTML = `
        <div class="logoloop__pill" title="${item.name} · ${item.category}">
          <span class="logoloop__icon">${item.svg}</span>
          <span class="logoloop__name">${item.name}</span>
        </div>
      `;
      ul.appendChild(li);
    });

    return ul;
  }

  // Initial seed with two copies
  track.appendChild(createList(0));
  track.appendChild(createList(1));

  let offset = 0;
  let targetVelocity = speed;
  let currentVelocity = speed;
  let lastTimestamp = null;
  let rafId = null;
  let isHovered = false;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  function updateCopies() {
    const firstList = track.firstElementChild;
    if (!firstList) return;
    const seqWidth = firstList.getBoundingClientRect().width;
    const containerWidth = container.clientWidth || window.innerWidth;

    if (seqWidth > 0) {
      const neededCopies = Math.max(2, Math.ceil(containerWidth / seqWidth) + 1);
      while (track.children.length < neededCopies) {
        track.appendChild(createList(track.children.length));
      }
    }
  }

  const resizeObserver = new ResizeObserver(updateCopies);
  resizeObserver.observe(container);
  updateCopies();

  if (pauseOnHover) {
    track.addEventListener('mouseenter', () => { isHovered = true; });
    track.addEventListener('mouseleave', () => { isHovered = false; });
  }

  function animate(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    if (!reducedMotion) {
      const target = isHovered ? 0 : targetVelocity;
      // Exponential velocity easing
      const easing = 1 - Math.exp(-dt / 0.22);
      currentVelocity += (target - currentVelocity) * easing;

      const firstList = track.firstElementChild;
      const seqWidth = firstList ? firstList.getBoundingClientRect().width : 0;

      if (seqWidth > 0) {
        offset = (offset + currentVelocity * dt) % seqWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
    }

    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);

  return {
    destroy: () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.innerHTML = '';
    }
  };
}
