import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const graph = JSON.parse(await readFile(new URL("brain/graph.json", root), "utf8"));

const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
const out = new Map();
for (const node of nodes.values()) out.set(node.id, []);
for (const edge of graph.edges) out.get(edge.from)?.push(edge);

const [command, ...args] = process.argv.slice(2);

function breadcrumb(id) {
  const node = nodes.get(id);
  if (!node) return id;
  const parent = graph.edges.find((edge) => edge.to === id && ["has-layer", "implemented-by", "routes-to", "exposes", "declares", "resolved-by", "unblocks", "resolves"].includes(edge.rel));
  const chain = parent ? `${breadcrumb(parent.from)} > ${node.label}` : node.label;
  return chain.includes("SYNASE AI >") ? chain.replace("SYNASE AI > ", "") : chain;
}

function neighbors(id, depth = 1, seen = new Set()) {
  const rows = [];
  for (const edge of out.get(id) || []) {
    if (seen.has(edge.to)) continue;
    seen.add(edge.to);
    const target = nodes.get(edge.to);
    rows.push({ rel: edge.rel, node: target });
    if (depth > 1) rows.push(...neighbors(edge.to, depth - 1, seen));
  }
  return rows;
}

function line(value = "") { console.log(value); }

switch (command) {
  case "stats": {
    line(`SYNASE AI ${graph.facts.version} — ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
    line(`source ${graph.facts.sourceLines} lines · tests ${graph.facts.testLines} lines · ${graph.facts.contractTests} contract tests`);
    line(`routes ${graph.facts.routes} · services ${graph.nodes.filter((n) => n.kind === "service").length} · methods ${graph.facts.serviceMethods} · entities ${graph.nodes.filter((n) => n.kind === "entity").length} (+${graph.nodes.filter((n) => n.kind === "entity-untyped").length} untyped)`);
    line(`invariants ${graph.facts.invariants} · gaps ${graph.facts.gaps} · risks ${graph.facts.risks} · shipped phases ${graph.nodes.filter((n) => n.kind === "phase").length} · planned ${graph.nodes.filter((n) => n.kind === "phase-planned").length}`);
    break;
  }
  case "route": {
    const wanted = args[0];
    const matches = graph.nodes.filter((node) => node.kind === "route" && (node.path.includes(wanted) || node.id === wanted));
    if (!matches.length) { line(`No route matches "${wanted}".`); process.exitCode = 1; break; }
    for (const node of matches) {
      line(`${node.label}  [phase ${node.phase}, ${node.status}]`);
      line(`  view      ${node.view} (${node.module})`);
      line(`  match     ${node.match}`);
      if (node.navLabel) line(`  nav       ${node.navLabel} in ${node.navSection}`);
      line(`  service   ${breadcrumb(graph.edges.find((edge) => edge.from === node.id && edge.rel === "reads-from")?.to)}`);
      const tabs = graph.nodes.filter((other) => other.within === node.id);
      if (tabs.length) line(`  tabs      ${tabs.map((tab) => `${tab.state.replace("state.", "")}=${tab.values.join("|")}`).join("  ")}`);
    }
    break;
  }
  case "entity": {
    const wanted = args[0].toLowerCase();
    const matches = graph.nodes.filter((node) => ["entity", "entity-untyped"].includes(node.kind) && node.label.toLowerCase().includes(wanted));
    if (!matches.length) { line(`No entity matches "${args[0]}".`); process.exitCode = 1; break; }
    for (const node of matches) {
      line(`${node.label}${node.kind === "entity-untyped" ? "  [UNTYPED]" : ""}`);
      line(`  fixture   ${node.fixture}`);
      line(`  declared  ${node.declaredIn || "none — see gap-02"}`);
      line(`  methods   ${node.methods.join(", ")}`);
      line(`  views     ${node.renderedBy.join(", ")}`);
      if (node.divergence) line(`  caveat    ${node.divergence}`);
      if (node.gap) line(`  gap       ${node.gap}`);
    }
    break;
  }
  case "trace": {
    const start = args[0];
    if (!nodes.has(start)) { line(`Unknown node "${start}".`); process.exitCode = 1; break; }
    line(`Downstream of ${breadcrumb(start)}`);
    for (const { rel, node } of neighbors(start, Number(args[1] || 2))) line(`  ${rel.padEnd(18)} ${node.id}  ${node.label}`);
    break;
  }
  case "risk": {
    const order = { high: 0, medium: 1, low: 2 };
    graph.nodes.filter((node) => node.kind === "risk").sort((a, b) => order[a.severity] - order[b.severity]).forEach((node) => {
      line(`[${node.severity}] ${node.id} ${node.label}`);
      line(`  ${node.detail}`);
      line(`  at ${node.where}`);
    });
    break;
  }
  case "gap": {
    for (const node of graph.nodes.filter((item) => item.kind === "gap")) {
      const planned = graph.edges.filter((edge) => edge.from === node.id && edge.rel === "resolves").map((edge) => `phase ${edge.to.replace("ph-", "")}`);
      line(`${node.id} ${node.label}`);
      line(`  ${node.detail}`);
      line(`  blocks ${node.blocks.join(", ")}${planned.length ? ` · planned by ${planned.join(", ")}` : " · unplanned"}`);
    }
    break;
  }
  case "invariant": {
    for (const node of graph.nodes.filter((item) => item.kind === "invariant")) {
      line(`${node.id} ${node.label}`);
      line(`  ${node.statement}`);
      line(`  enforced by ${node.enforcedBy.join(", ")}`);
    }
    break;
  }
  case "phase": {
    for (const node of graph.nodes.filter((item) => item.kind === "phase" || item.kind === "phase-planned")) {
      const routes = graph.edges.filter((edge) => edge.from === node.id && edge.rel === "surfaced-route").map((edge) => edge.to);
      line(`${node.label} — ${node.name}  [${node.status}]`);
      line(`  ${node.capability || node.rationale}`);
      if (routes.length) line(`  routes ${routes.map((id) => nodes.get(id).label).join(", ")}`);
      if (node.deliverables) node.deliverables.forEach((item) => line(`  → ${item}`));
    }
    break;
  }
  case "service": {
    for (const node of graph.nodes.filter((item) => item.kind === "service")) {
      line(`${node.label} (${node.module}) — ${node.methodCount} methods, phases ${node.phases}`);
      line(`  ${node.role}`);
      line(`  fixture ${node.fixture}`);
      line(`  helpers ${node.helpers.join(", ")}`);
      const risks = graph.nodes.filter((risk) => risk.kind === "risk" && risk.anchors === node.id);
      if (risks.length) risks.forEach((risk) => line(`  risk [${risk.severity}] ${risk.label}`));
    }
    break;
  }
  case "layer": {
    for (const node of graph.nodes.filter((item) => item.kind === "layer")) {
      const modules = graph.edges.filter((edge) => edge.from === node.id && edge.rel === "implemented-by").map((edge) => edge.to);
      line(`${node.label}`);
      line(`  ${node.responsibility}`);
      line(`  modules ${modules.join(", ") || "none — unresolved"}`);
    }
    break;
  }
  case "kind": {
    const counts = {};
    for (const node of graph.nodes) counts[node.kind] = (counts[node.kind] || 0) + 1;
    for (const [kind, total] of Object.entries(counts).sort((a, b) => b[1] - a[1])) line(`${String(total).padStart(4)}  ${kind}`);
    break;
  }
  default:
    line(`brain query — ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
    line("");
    line("  stats              graph size and totals");
    line("  kind               node counts per kind");
    line("  layer              architecture layers and their modules");
    line("  route <path>       route, view, matcher, service, tabs");
    line("  entity <name>      fixture, methods, views, caveats");
    line("  service            service surfaces, fixtures, risks");
    line("  trace <node> [d]   downstream impact of a change to a node");
    line("  invariant          the 18 safety guarantees");
    line("  gap                the 12 unresolved contracts and who plans them");
    line("  risk               the 10 risks, most severe first");
    line("  phase              shipped and planned phases");
}