// @ts-check
/**
 * React Bits Blob Cursor — Theme-Aware Pointer Effect
 * Reference: https://reactbits.dev/animations/blob-cursor?size=24&morphSpeed=0&lag=0&stretch=0&trail=0&goo=0.45&shine=0&splashSize=0.3&wobble=0&hideCursor=false&regrow=1&color=A855F7
 * 
 * Features:
 * - Fluid SVG metaball filter (#blob-goo-filter) with high-contrast alpha threshold
 * - High-speed physics spring tracking with velocity-oriented stretch
 * - Interactive target hover reaction (subtle scale swell over buttons/links)
 * - Click droplet splash with particle decay
 * - Theme-aware coloration (#A855F7 in dark theme, #7C3AED in light theme)
 * - Native pointer preservation (hideNativeCursor = false)
 * - Zero pointer blocking (pointer-events: none)
 * - Strictly isolated to the public landing page with automatic resource cleanup
 */

const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, label, [role="button"], .nav-brand';

/**
 * Initializes the Blob Cursor on the page.
 * @param {HTMLElement} [mountTarget=document.body]
 * @param {Object} [options]
 * @returns {{ destroy: () => void, updateTheme: (theme: string) => void }}
 */
export function initBlobCursor(mountTarget = document.body, options = {}) {
  if (typeof window === 'undefined') {
    return { destroy: () => {}, updateTheme: () => {} };
  }

  // Skip on touch devices or reduced motion
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches;
  const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || isReducedMotion) {
    return { destroy: () => {}, updateTheme: () => {} };
  }

  const baseSize = options.size ?? 24;
  const darkColor = options.darkColor || '#A855F7';
  const lightColor = options.lightColor || '#7C3AED';

  // Create wrapper and SVG filter definition
  const cursorWrap = document.createElement('div');
  cursorWrap.className = 'blob-cursor-wrap';
  cursorWrap.setAttribute('aria-hidden', 'true');

  cursorWrap.innerHTML = `
    <svg class="blob-cursor-svg-defs" aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
      <defs>
        <filter id="blob-goo-filter" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 28 -10
          " result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
    <div class="blob-cursor-stage">
      <div class="blob-cursor-core"></div>
      <div class="blob-cursor-droplet droplet-1"></div>
      <div class="blob-cursor-droplet droplet-2"></div>
      <div class="blob-cursor-splash-zone"></div>
    </div>
  `;

  mountTarget.appendChild(cursorWrap);

  const stage = cursorWrap.querySelector('.blob-cursor-stage');
  const core = cursorWrap.querySelector('.blob-cursor-core');
  const drop1 = cursorWrap.querySelector('.droplet-1');
  const drop2 = cursorWrap.querySelector('.droplet-2');
  const splashZone = cursorWrap.querySelector('.blob-cursor-splash-zone');

  if (!stage || !core || !drop1 || !drop2 || !splashZone) {
    return { destroy: () => { cursorWrap.remove(); }, updateTheme: () => {} };
  }

  // Color application
  function applyColor(theme) {
    const isDark = theme === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark';
    const activeColor = isDark ? darkColor : lightColor;
    cursorWrap.style.setProperty('--blob-color', activeColor);
  }
  applyColor(document.documentElement.getAttribute('data-theme') || 'dark');

  // Physics state
  let mouseX = -100;
  let mouseY = -100;
  let posX = -100;
  let posY = -100;
  let vx = 0;
  let vy = 0;
  let d1X = -100;
  let d1Y = -100;
  let d2X = -100;
  let d2Y = -100;

  let isHovering = false;
  let isDown = false;
  let isVisible = false;
  let rafId = null;

  // Active droplets array for splashes
  /** @type {Array<{ el: HTMLElement, x: number, y: number, vx: number, vy: number, life: number }>} */
  const splashes = [];

  function onPointerMove(e) {
    if (!isVisible) {
      isVisible = true;
      cursorWrap.classList.add('active');
      posX = e.clientX;
      posY = e.clientY;
      d1X = e.clientX;
      d1Y = e.clientY;
      d2X = e.clientX;
      d2Y = e.clientY;
    }
    mouseX = e.clientX;
    mouseY = e.clientY;

    const target = e.target instanceof Element ? e.target.closest(INTERACTIVE_SELECTOR) : null;
    isHovering = !!target;
  }

  function onPointerDown(e) {
    isDown = true;
    createSplash(e.clientX, e.clientY);
  }

  function onPointerUp() {
    isDown = false;
  }

  function onPointerLeave() {
    isVisible = false;
    cursorWrap.classList.remove('active');
  }

  function createSplash(x, y) {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2.5 + Math.random() * 3.5;
      const splashDot = document.createElement('div');
      splashDot.className = 'blob-splash-dot';
      splashZone?.appendChild(splashDot);

      splashes.push({
        el: splashDot,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0
      });
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);

  const themeObserver = new MutationObserver(() => {
    applyColor(document.documentElement.getAttribute('data-theme') || 'dark');
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // Animation loop
  function loop() {
    // Spring tracking for main core
    const stiffness = 0.32;
    const damping = 0.72;

    const ax = (mouseX - posX) * stiffness;
    const ay = (mouseY - posY) * stiffness;
    vx = (vx + ax) * damping;
    vy = (vy + ay) * damping;
    posX += vx;
    posY += vy;

    // Follower droplets with lagged organic inertia
    d1X += (posX - d1X) * 0.45;
    d1Y += (posY - d1Y) * 0.45;
    d2X += (d1X - d2X) * 0.38;
    d2Y += (d1Y - d2Y) * 0.38;

    // Stretch orientation based on velocity
    const speed = Math.hypot(vx, vy);
    const angle = Math.atan2(vy, vx);
    const stretchFactor = Math.min(1.4, 1 + speed * 0.025);
    const scale = isHovering ? 1.45 : isDown ? 0.8 : 1.0;

    // Render core & droplets
    core.style.transform = `translate3d(${posX - baseSize / 2}px, ${posY - baseSize / 2}px, 0) rotate(${angle}rad) scale(${stretchFactor * scale}, ${scale / Math.sqrt(stretchFactor)})`;
    drop1.style.transform = `translate3d(${d1X - baseSize * 0.38}px, ${d1Y - baseSize * 0.38}px, 0)`;
    drop2.style.transform = `translate3d(${d2X - baseSize * 0.28}px, ${d2Y - baseSize * 0.28}px, 0)`;

    // Process splashes
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.life -= 0.045;
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.94;
      s.vy *= 0.94;

      if (s.life <= 0) {
        s.el.remove();
        splashes.splice(i, 1);
      } else {
        const rad = baseSize * 0.28 * s.life;
        s.el.style.transform = `translate3d(${s.x - rad}px, ${s.y - rad}px, 0) scale(${s.life})`;
        s.el.style.opacity = String(s.life);
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);

  return {
    destroy: () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointerleave', onPointerLeave);
      themeObserver.disconnect();
      cursorWrap.remove();
    },
    updateTheme: (theme) => applyColor(theme)
  };
}
