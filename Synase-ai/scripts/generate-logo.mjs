import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Mathematically precise Penrose Triangle (Impossible Tribar)
// ViewBox: 0 0 100 90
const penroseTriangleSvg = `<svg class="brand-mark-svg" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pGradA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="pGradB" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="pGradC" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
    <filter id="penroseGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#22d3ee" flood-opacity="0.45"/>
    </filter>
  </defs>
  <g class="penrose-tribar" stroke-linejoin="round" stroke-linecap="round">
    <!-- Top-Right face -->
    <path d="M50 6 L92 78 L76 78 L42 20 L50 6 Z" fill="url(#pGradA)" fill-opacity="0.25" stroke="#38bdf8" stroke-width="2.2" />
    <!-- Bottom face -->
    <path d="M92 78 L8 78 L16 64 L76 64 L76 78 Z" fill="url(#pGradB)" fill-opacity="0.28" stroke="#22d3ee" stroke-width="2.2" />
    <!-- Left-Inner face completing the impossible loop -->
    <path d="M8 78 L50 6 L58 20 L24 78 L8 78 Z" fill="url(#pGradC)" fill-opacity="0.22" stroke="#818cf8" stroke-width="2.2" />
    <!-- Inner optical illusion contours -->
    <path d="M42 20 L58 20 L30 68 L74 68 L66 54 L38 54 L50 34" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6" fill="none" />
  </g>
</svg>`;

const logoFullSvg = `<svg class="brand-full-logo" viewBox="0 0 380 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="aGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <!-- SYN -->
  <text x="0" y="44" font-family="'Outfit', 'Inter', system-ui, sans-serif" font-weight="800" font-size="42" letter-spacing="3" fill="url(#wordGrad)">SYN</text>
  <!-- Impossible Triangle replacing the 'A' -->
  <g transform="translate(132, 6) scale(0.48)">
    <path d="M50 6 L92 78 L76 78 L42 20 L50 6 Z" fill="url(#aGlow)" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3" stroke-linejoin="round" />
    <path d="M92 78 L8 78 L16 64 L76 64 L76 78 Z" fill="url(#aGlow)" fill-opacity="0.25" stroke="#22d3ee" stroke-width="3" stroke-linejoin="round" />
    <path d="M8 78 L50 6 L58 20 L24 78 L8 78 Z" fill="url(#aGlow)" fill-opacity="0.3" stroke="#818cf8" stroke-width="3" stroke-linejoin="round" />
    <path d="M42 20 L58 20 L30 68 L74 68 L66 54 L38 54 L50 34" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.75" fill="none" stroke-linejoin="round" />
  </g>
  <!-- SE AI -->
  <text x="188" y="44" font-family="'Outfit', 'Inter', system-ui, sans-serif" font-weight="800" font-size="42" letter-spacing="3" fill="url(#wordGrad)">SE</text>
  <text x="272" y="44" font-family="'Outfit', 'Inter', system-ui, sans-serif" font-weight="800" font-size="42" letter-spacing="4" fill="url(#wordGrad)">AI</text>
</svg>`;

await writeFile(resolve("src/assets/logo-mark.svg"), penroseTriangleSvg, "utf8");
await writeFile(resolve("src/assets/logo-full.svg"), logoFullSvg, "utf8");
await writeFile(resolve("src/assets/favicon.svg"), penroseTriangleSvg, "utf8");
console.log("Updated SVG assets in src/assets");
