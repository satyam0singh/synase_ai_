import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(new URL("../src/", import.meta.url), new URL("../dist/src/", import.meta.url), { recursive: true });
await cp(new URL("../index.html", import.meta.url), new URL("../dist/index.html", import.meta.url));
await cp(new URL("../landing.html", import.meta.url), new URL("../dist/landing.html", import.meta.url));
await cp(new URL("../app.html", import.meta.url), new URL("../dist/app.html", import.meta.url));
await cp(new URL("../manifest.webmanifest", import.meta.url), new URL("../dist/manifest.webmanifest", import.meta.url));
await cp(new URL("../sw.js", import.meta.url), new URL("../dist/sw.js", import.meta.url));
try {
  await cp(new URL("../LOGO/", import.meta.url), new URL("../dist/LOGO/", import.meta.url), { recursive: true });
  await cp(new URL("../src/assets/favicon.svg", import.meta.url), new URL("../dist/favicon.svg", import.meta.url));
} catch {}

const files = [
  "index.html", "landing.html", "app.html", "manifest.webmanifest", "sw.js",
  "src/app/main.js", "src/app/router.js", "src/app/shell.js", "src/app/paths.js",
  "src/app/auth.js", "src/app/actions/work.js",
  "src/shared/api/index.js", "src/shared/api/mock.js", "src/shared/api/db.js",
  "src/shared/api/errors.js", "src/shared/api/live.js",
  "src/shared/api/idempotency.js", "src/shared/api/redaction.js",
  "src/shared/components/ui.js", "src/shared/components/icons.js", "src/shared/state/store.js",
  "src/shared/services/theme.js", "src/shared/utils/format.js",
  "src/shared/types/types.d.ts", "src/assets/lucide.min.js",
  "src/home/landing/landing.js", "src/home/landing/gradientWaves.js",
  "src/home/landing/logoLoop.js", "src/home/landing/blobCursor.js", "src/home/landing/contactForm.js",
  "src/home/workspace/api/index.js",
  "src/product/api/index.js", "src/devops/api/index.js", "src/mcp/api/index.js",
  "src/context/api/index.js", "src/outputs/api/index.js",
  "src/work/api/index.js", "src/work/constants.js", "src/work/pages/index.js",
  "src/work/components/index.js",
  "src/settings/api/index.js", "src/settings/engine/registry.js", "src/settings/engine/scopeResolver.js",
  "src/settings/components/index.js", "src/settings/components/settingsSidebar.js",
  "src/settings/components/settingsHeader.js", "src/settings/components/settingRow.js",
  "src/settings/components/settingsInspector.js",
  "src/settings/components/modals.js", "src/settings/pages/index.js",
  "src/integrations/api/client.js", "src/integrations/api/types.d.ts",
  "src/home/workspace/dashboard/api.js", "src/home/workspace/dashboard/types.d.ts",
  "src/styles/app.css", "src/styles/home/dashboard.css",
  "src/styles/integrations/integrations.css", "src/styles/landing/landing.css",
  "src/styles/work/work.css", "src/styles/product/product.css", "src/styles/settings/settings.css"
];
const manifest = {};
for (const file of files) {
  const body = await readFile(new URL(`../dist/${file}`, import.meta.url));
  manifest[file] = { bytes: body.byteLength, sha256: createHash("sha256").update(body).digest("hex") };
}
await writeFile(new URL("../dist/build-manifest.json", import.meta.url), JSON.stringify({
  product: "SYNASE AI",
  phases: ["Phase 0", "Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 9", "Phase 10", "Phase 11", "Phase 12"],
  generatedAt: new Date().toISOString(), files: manifest
}, null, 2));

const pub = new URL("../public/", import.meta.url);
await rm(pub, { recursive: true, force: true });
await cp(dist, pub, { recursive: true });

console.log(`Built SYNASE AI frontend (${Object.keys(manifest).length} assets) → dist/ & public/`);

