import { readFile, writeFile } from "node:fs/promises";
import {
  ROUTES, NAV, TABS, LAYERS, TYPES, SERVICES, ENTITY_MAP, UNTYPED_FIXTURES,
  INVARIANTS, GAPS, RISKS, DECISIONS, PHASES, ROADMAP
} from "./brain-data.mjs";

const root = new URL("../", import.meta.url);
const facts = JSON.parse(await readFile(new URL("brain/facts.json", root), "utf8"));

const nodes = [];
const edges = [];
const add = (node) => { nodes.push(node); return node.id; };
const link = (from, to, rel, note) => { edges.push({ from, to, rel, ...(note ? { note } : {}) }); };

add({
  id: "synase-ai",
  kind: "product",
  label: "SYNASE AI",
  version: facts.product.version,
  tagline: "Decision intelligence for product and DevOps engineering decisions",
  runtime: "static dependency-free frontend over deterministic mock domain services",
  backendConnected: false
});

for (const [path, detail] of Object.entries(facts.files)) {
  add({
    id: path,
    kind: path.endsWith(".d.ts") ? "type-module" : path.startsWith("test/") ? "test-file" : "source-file",
    label: path.split("/").pop(),
    layer: detail.layer,
    lines: detail.lines,
    ...(detail.exports !== undefined ? { exports: detail.exports } : {}),
    ...(detail.tests !== undefined ? { contractTests: detail.tests } : {})
  });
}

for (const layer of LAYERS) {
  add({ id: layer.id, kind: "layer", label: `L${layer.ordinal} ${layer.label}`, ordinal: layer.ordinal, responsibility: layer.owns });
  link("synase-ai", layer.id, "has-layer");
  for (const module of layer.modules) link(layer.id, module, "implemented-by");
  if (layer.ordinal > 0) link(layer.id, LAYERS[layer.ordinal - 1].id, "calls-into");
}

for (const service of SERVICES) {
  const methodList = service.methods.split(",");
  add({
    id: service.id,
    kind: "service",
    label: service.label,
    module: service.module,
    phases: service.phases,
    role: service.role,
    fixture: service.fixture,
    methodCount: methodList.length,
    methods: methodList,
    helpers: service.helpers.split(",")
  });
  link(service.module, service.id, "exports");
  for (const method of methodList) {
    const id = `${service.id}.${method}`;
    add({
      id,
      kind: "service-method",
      label: method,
      service: service.id,
      module: service.module,
      mutation: !/^(list|get|search|login|register|recover|nextMock|advance|runProductMock|runDevOpsMock|runContextMock)/.test(method),
      requiresIdempotencyKey: /^(create|update|delete|connect|disconnect|sync|check|post|initiate|complete|add|cancel|control|generate|publish|export|decide|advance|discover|run|import|invite|nextMock)/.test(method)
    });
    link(service.id, id, "exposes-method");
  }
}

for (const declaration of TYPES) link(declaration.id, "l2-service", "declares-for");

const emitted = new Set();
for (const entry of ENTITY_MAP) {
  const scope = entry.fixture.includes("integrations/api/client.js")
    ? "p11"
    : entry.fixture.includes("dashboard/api.js")
      ? "p12"
      : entry.fixture.includes("settings")
        ? "settings"
        : "core";
  const id = `ent-${scope}-${entry.name.toLowerCase()}`;
  if (emitted.has(id)) continue;
  emitted.add(id);
  const declaration =
    scope === "p11"
      ? "src/integrations/api/types.d.ts"
      : scope === "p12"
        ? "src/home/workspace/dashboard/types.d.ts"
        : scope === "settings"
          ? "src/settings/types.d.ts"
          : "src/shared/types/types.d.ts";
  add({
    id,
    kind: "entity",
    label: entry.name,
    fixture: entry.fixture,
    service: entry.service,
    methods: entry.methods.split(","),
    renderedBy: entry.views.split(",").map((value) => value.trim()),
    declaredIn: declaration,
    divergence: entry.note
  });
  link(declaration, id, "declares");
  link(entry.service, id, "exposes");
  for (const method of entry.methods.split(",")) link(id, `${entry.service}.${method.trim()}`, "read-via");
}

for (const fixture of UNTYPED_FIXTURES) {
  const id = `ent-untyped-${fixture.key}`;
  const service =
    fixture.module === "src/shared/api/db.js" ? "svc-mock" : "svc-p11";
  add({
    id,
    kind: "entity-untyped",
    label: fixture.entity,
    fixture: `${fixture.module} db.${fixture.key}`,
    service,
    methods: fixture.methods.split(","),
    renderedBy: fixture.views.split(","),
    gap: "No interface exists in any .d.ts file. Frontend and backend will drift silently."
  });
  link(service, id, "exposes");
  for (const method of fixture.methods.split(",")) link(id, `${service}.${method.trim()}`, "read-via");
  link(id, "gap-02", "blocked-by");
}

for (const route of ROUTES) {
  add({
    id: route.id,
    kind: "route",
    label: `#${route.path}`,
    path: route.path,
    match: route.match,
    view: route.view,
    module: route.module,
    phase: route.phase,
    navSection: route.section,
    shellWrapped: route.shell,
    status: route.status,
    backendSupported: false
  });
  link(route.module, route.id, "routes-to");
  const service = route.phase === 11 ? "svc-p11" : route.phase === 12 ? "svc-p12" : route.phase === 15 ? "svc-settings" : "svc-mock";
  link(route.id, service, "reads-from");
}

for (const group of NAV) {
  const id = `nav-${group.section.toLowerCase().replace(/\s+/g, "-")}`;
  add({ id, kind: "nav-section", label: group.section, module: group.module, items: group.items.length });
  link(group.module, id, "renders-nav");
  for (const [href, label, routeId, , disabled] of group.items) {
    link(id, routeId, "links-to", disabled ? `Rendered aria-disabled in ${group.module}` : undefined);
    const node = nodes.find((item) => item.id === routeId);
    node.navLabel = label;
    node.navHref = href;
  }
}

for (const tab of TABS) {
  add({ id: tab.id, kind: "in-page-tab", label: tab.state, state: tab.state, param: tab.param, values: tab.values, within: tab.route });
  link(tab.module, tab.id, "declares-tab");
  link(tab.route, tab.id, "contains-tab");
}

for (const invariant of INVARIANTS) {
  add({
    id: invariant.id,
    kind: "invariant",
    label: invariant.label,
    statement: invariant.statement,
    enforcedBy: invariant.enforcedBy.split(",").map((value) => value.trim()),
    layer: invariant.layer
  });
  link(invariant.id, invariant.layer, "governs");
  link("synase-ai", invariant.id, "guarantees");
}

for (const gap of GAPS) {
  add({ id: gap.id, kind: "gap", label: gap.label, detail: gap.detail, blocks: gap.blocks });
  link("synase-ai", gap.id, "has-gap");
  for (const target of gap.blocks) link(gap.id, target, "blocks");
}

for (const risk of RISKS) {
  add({ id: risk.id, kind: "risk", label: risk.label, severity: risk.severity, detail: risk.detail, where: risk.where, anchors: risk.graph });
  link("synase-ai", risk.id, "has-risk");
  if (nodes.some((node) => node.id === risk.graph)) link(risk.id, risk.graph, "observed-on");
}

for (const decision of DECISIONS) {
  add({ id: decision.id, kind: "decision", label: decision.label, decision: decision.decision, consequence: decision.consequence, status: decision.status });
  link("synase-ai", decision.id, "decided");
}

for (const phase of PHASES) {
  const id = `ph-${phase.n}`;
  add({ id, kind: "phase", label: `Phase ${phase.n}`, number: phase.n, name: phase.label, status: phase.status, capability: phase.capability });
  link("synase-ai", id, "delivered-phase");
  for (const route of ROUTES.filter((item) => item.phase === phase.n)) link(id, route.id, "surfaced-route");
}

for (const phase of ROADMAP) {
  const id = `ph-${phase.n}`;
  add({
    id,
    kind: "phase-planned",
    label: `Phase ${phase.n}`,
    number: phase.n,
    name: phase.label,
    status: "planned",
    prereq: phase.prereq === "none" ? null : `ph-${phase.prereq}`,
    rationale: phase.rationale,
    deliverables: phase.deliverables,
    resolves: phase.blocks
  });
  if (phase.prereq !== "none") link(`ph-${phase.prereq}`, id, "unblocks");
  for (const gap of phase.blocks) link(id, gap, "resolves");
  link(`ph-${PHASES[PHASES.length - 1].n}`, id, "precedes");
}

const FILE_ROLES = {
  "index.html": { role: "Static application entry", detail: "Redirects to landing.html" },
  "app.html": { role: "Console entry", detail: "Loads app.css, dashboard.css, integrations.css and one module: src/app/main.js" },
  "landing.html": { role: "Marketing entry", detail: "Loads landing.css and src/home/landing/landing.js" },
  "src/styles/app.css": { role: "Core design system", detail: "Light and dark theme tokens, shell, cards, tables, forms, status pills" },
  "src/styles/home/dashboard.css": { role: "Dashboard component styles", detail: "Dashboard metrics, attention queue, readiness, safety panel" },
  "src/styles/integrations/integrations.css": { role: "Integrations component styles", detail: "Integration, activity, and audit layouts" },
  "src/styles/settings/settings.css": { role: "Settings Control Plane styles", detail: "Clean white canvas layout, sidebar, modals, form controls, and status pills" },
  "src/styles/landing/landing.css": { role: "Landing page styles", detail: "Extracted from the former inline style block" }
};
for (const asset of facts.buildAssets) {
  if (!nodes.some((node) => node.id === asset)) add({ id: asset, kind: "source-file", label: asset.split("/").pop(), ...(FILE_ROLES[asset] || { role: "Bundled asset" }) });
  link("scr-build", asset, "bundles");
}

add({ id: "scr-build", kind: "script", label: "build.mjs", role: "Recreates dist/, copies src/, writes SHA-256 manifest", assets: facts.buildAssets.length, command: facts.scripts.build });
add({ id: "scr-serve", kind: "script", label: "serve.mjs", role: `Static server over ${facts.serveTargets} with path-traversal guard`, command: facts.scripts.dev });
add({ id: "scr-test", kind: "script", label: "node --test", role: "Contract suite", command: facts.scripts.test, cases: Object.values(facts.files).reduce((sum, file) => sum + (file.tests || 0), 0) });
add({ id: "scr-brain", kind: "script", label: "brain-extract.mjs + brain.mjs", role: "Regenerates this graph from source by walking src/ and test/", command: "npm run brain" });
for (const script of ["scr-build", "scr-serve", "scr-test", "scr-brain"]) link("synase-ai", script, "built-by");
link("scr-test", "svc-mock", "covers");
link("scr-test", "svc-p11", "covers");
link("scr-test", "svc-p12", "covers");
link("scr-test", "svc-settings", "covers");
for (const testFile of Object.keys(facts.files).filter((path) => path.startsWith("test/"))) link("scr-test", testFile, "runs");

/* architecture layers discovered on disk, so a new folder shows up immediately */
for (const layer of facts.layers) {
  const id = `arch-${layer}`;
  if (nodes.some((node) => node.id === id)) continue;
  const owned = Object.keys(facts.files).filter((path) => path.startsWith(`src/${layer}/`) || (layer === "test" && path.startsWith("test/")));
  add({
    id,
    kind: "architecture-layer",
    label: `src/${layer}`,
    files: owned.length,
    lines: owned.reduce((sum, path) => sum + facts.files[path].lines, 0),
    importsNothingOutsideShared: layer === "shared"
  });
  link("synase-ai", id, "organised-as");
  for (const path of owned) link(id, path, "contains");
}

const graph = {
  $schema: "brain/graph.schema.md",
  generator: "scripts/brain.mjs",
  regeneratedBy: "npm run brain",
  facts: {
    generatedAt: facts.generatedAt,
    version: facts.product.version,
    sourceLines: Object.entries(facts.files).filter(([path]) => !path.startsWith("test/")).reduce((sum, [, detail]) => sum + detail.lines, 0),
    testLines: Object.entries(facts.files).filter(([path]) => path.startsWith("test/")).reduce((sum, [, detail]) => sum + detail.lines, 0),
    trackedFiles: Object.keys(facts.files).length,
    architectureLayers: facts.layers.length,
    contractTests: Object.values(facts.files).reduce((sum, file) => sum + (file.tests || 0), 0),
    typeExports: TYPES.reduce((sum, declaration) => sum + declaration.exports, 0),
    dbCollections: facts.dbKeys.length,
    routes: ROUTES.length,
    serviceMethods: SERVICES.reduce((sum, service) => sum + service.methods.split(",").length, 0),
    invariants: INVARIANTS.length,
    gaps: GAPS.length,
    risks: RISKS.length,
    openRisks: RISKS.filter((risk) => risk.severity !== "resolved").length,
    resolvedRisks: RISKS.filter((risk) => risk.severity === "resolved").length
  },
  nodes,
  edges
};

await writeFile(new URL("brain/graph.json", root), `${JSON.stringify(graph, null, 2)}\n`);

const count = (kind) => nodes.filter((node) => node.kind === kind).length;
console.log(`Wrote brain/graph.json — ${nodes.length} nodes, ${edges.length} edges`);
console.log(`  routes=${count("route")} entities=${count("entity")} untyped=${count("entity-untyped")} invariants=${count("invariant")} gaps=${count("gap")} risks=${count("risk")} shipped-phases=${count("phase")} planned-phases=${count("phase-planned")}`);
