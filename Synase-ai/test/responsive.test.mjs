import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("PWA web app manifest meets standard criteria and security hygiene", () => {
  const manifestPath = path.join(rootDir, "manifest.webmanifest");
  assert.ok(fs.existsSync(manifestPath), "manifest.webmanifest must exist at project root");

  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw);

  assert.ok(manifest.name.includes("SYNASE AI"), "Manifest name must contain SYNASE AI");
  assert.ok(manifest.short_name.includes("SYNASE"), "Manifest short_name must contain SYNASE");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.start_url.includes("landing.html"), "start_url must point to landing page");
  assert.ok(manifest.theme_color, "theme_color must be defined");
  assert.ok(manifest.background_color, "background_color must be defined");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, "Manifest must provide app icons");

  for (const icon of manifest.icons) {
    assert.ok(icon.src, "Icon must have src");
    assert.ok(icon.sizes, "Icon must have sizes");
    assert.ok(icon.type, "Icon must have MIME type");
  }
});

test("Service worker implements stale-while-revalidate shell caching and network-only API policy", () => {
  const swPath = path.join(rootDir, "sw.js");
  assert.ok(fs.existsSync(swPath), "sw.js must exist at project root");

  const swContent = fs.readFileSync(swPath, "utf8");

  // Cache versioning and installation
  assert.ok(swContent.includes("CACHE_NAME ="), "Service worker must define versioned cache name");
  assert.ok(swContent.includes("STATIC_PRECACHE ="), "Service worker must declare precached shell assets");
  assert.ok(swContent.includes("landing.html"), "Shell assets must include landing page");
  assert.ok(swContent.includes("app.html"), "Shell assets must include app shell");

  // Invariant: Never cache sensitive API routes or credentials
  assert.ok(swContent.includes("/api/v1/"), "Service worker must explicitly check for API routes");
  assert.ok(swContent.includes("fetch(request)"), "API requests must be routed directly to network");

  // Offline fallback
  assert.ok(swContent.includes("Fallback to app shell") || swContent.includes("Resource unavailable offline"), "Service worker must provide offline fallback response");
});

test("HTML entrypoints declare responsive viewport, PWA manifest, and theme color", () => {
  const landingHtml = fs.readFileSync(path.join(rootDir, "landing.html"), "utf8");
  const appHtml = fs.readFileSync(path.join(rootDir, "app.html"), "utf8");

  for (const [name, html] of [["landing.html", landingHtml], ["app.html", appHtml]]) {
    assert.ok(
      html.includes('name="viewport" content="width=device-width, initial-scale=1'),
      `${name} must specify responsive viewport meta tag`
    );
    assert.ok(
      html.includes('rel="manifest"') && html.includes("manifest.webmanifest"),
      `${name} must link to web app manifest`
    );
    assert.ok(
      html.includes('name="theme-color"'),
      `${name} must declare theme-color`
    );
    assert.ok(
      html.includes("navigator.serviceWorker.register"),
      `${name} must register service worker`
    );
  }
});

test("Landing page stylesheet provides comprehensive responsive rules and touch targets", () => {
  const css = fs.readFileSync(path.join(rootDir, "src/styles/landing/landing.css"), "utf8");

  // Responsive breakpoints
  assert.ok(css.includes("@media (max-width: 1024px)"), "Must support tablet landscape breakpoint");
  assert.ok(css.includes("@media (max-width: 860px)"), "Must support tablet portrait / mobile nav breakpoint");
  assert.ok(css.includes("@media (max-width: 640px)"), "Must support smartphone breakpoint");
  assert.ok(css.includes("@media (max-width: 540px)"), "Must support compact smartphone breakpoint");
  assert.ok(css.includes("@media (max-width: 360px)"), "Must support small mobile (320px-360px) viewport");

  // Navigation drawer and backdrop scrim
  assert.ok(css.includes(".nav-backdrop"), "Must define backdrop scrim for mobile menu");
  assert.ok(css.includes(".nav-mobile-btn-primary"), "Must style mobile drawer call-to-actions");

  // Responsive typography
  assert.ok(css.includes("clamp("), "Must use fluid clamp typography for scalable headings");
});

test("Console shell stylesheet prevents mobile height overflow locks and styles sidebars", () => {
  const css = fs.readFileSync(path.join(rootDir, "src/styles/app.css"), "utf8");

  // Mobile auth unlocked scrolling fix
  assert.ok(
    css.includes("@media (max-width: 960px), (max-height: 740px)"),
    "Auth layout must unlock vertical scroll on mobile viewports and short screens"
  );

  // Shell sidebar backdrop scrim
  assert.ok(css.includes(".sidebar-backdrop"), "Must define sidebar backdrop for mobile navigation");

  // Topbar actions preservation
  assert.ok(!css.includes(".topbar-actions .icon-btn:not(.theme-toggle) {\n    display: none;"), "Must not hide user profile/notifications on mobile");

  // Table horizontal scrolling containment
  assert.ok(css.includes(".table-wrap"), "Must support horizontal scroll containment for data tables");
});

test("Settings stylesheet implements sliding drawer and mobile section picker", () => {
  const css = fs.readFileSync(path.join(rootDir, "src/styles/settings/settings.css"), "utf8");

  assert.ok(css.includes("@media (max-width: 960px)"), "Settings must collapse sidebar on <=960px");
  assert.ok(css.includes(".settings-sidebar-backdrop"), "Settings must provide backdrop scrim");
  assert.ok(css.includes(".settings-mobile-nav"), "Settings must support native mobile section selector");
  assert.ok(css.includes(".settings-mobile-select"), "Settings mobile dropdown must be styled");
});

test("Chat & Work surface provides mobile session rail drawer and responsive composer", () => {
  const css = fs.readFileSync(path.join(rootDir, "src/styles/work/work.css"), "utf8");

  assert.ok(css.includes("@media (max-width: 860px)"), "Work surface must collapse session rail on <=860px");
  assert.ok(css.includes(".chat-rail-toggle"), "Must provide session rail toggle button");
  assert.ok(css.includes(".chat-rail-backdrop"), "Must provide session rail backdrop scrim");
  assert.ok(css.includes(".chat-rail-close"), "Must provide session rail close button");
  assert.ok(css.includes("@media (max-width: 480px)"), "Must support compact mobile composer");
});

test("Landing page visual effects respect prefers-reduced-motion and touch device safety", () => {
  const blobCursor = fs.readFileSync(path.join(rootDir, "src/home/landing/blobCursor.js"), "utf8");
  const logoLoop = fs.readFileSync(path.join(rootDir, "src/home/landing/logoLoop.js"), "utf8");

  assert.ok(
    blobCursor.includes("prefers-reduced-motion"),
    "Blob cursor must inspect prefers-reduced-motion"
  );
  assert.ok(
    blobCursor.includes("maxTouchPoints") || blobCursor.includes("pointer: coarse"),
    "Blob cursor must detect touch devices"
  );
  assert.ok(
    logoLoop.includes("prefers-reduced-motion"),
    "Logo loop must respect prefers-reduced-motion"
  );
});
