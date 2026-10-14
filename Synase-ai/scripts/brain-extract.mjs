import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

/** Recursively collects files under a repo-relative directory. */
async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(new URL(dir, root), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "dist") continue;
    const path = `${dir}${entry.name}`;
    if (entry.isDirectory()) await walk(`${path}/`, out);
    else out.push(path);
  }
  return out;
}

/** Top-level architecture layer a source file belongs to. */
const layerOf = (path) => {
  if (path.startsWith("test/")) return "test";
  if (path.startsWith("src/")) {
    const top = path.slice(4).split("/")[0];
    return top;
  }
  return "root";
};

async function main() {
  const sourceFiles = [
    ...(await walk("src/")).filter((path) => /\.(js|css|d\.ts)$/.test(path)).sort(),
    ...(await walk("test/")).filter((path) => path.endsWith(".mjs")).sort()
  ];

  const [pkgText, indexHtml, appHtml, landingHtml, buildScript, serveScript] = await Promise.all([
    read("package.json"),
    read("index.html"),
    read("app.html"),
    read("landing.html"),
    read("scripts/build.mjs"),
    read("scripts/serve.mjs")
  ]);

  const lineCount = (source) => source.split(/\r?\n/).length;
  const typeNames = (source) =>
    [...source.matchAll(/^export (?:interface|type) ([A-Za-z0-9_]+)/gm)].map((match) => match[1]);
  const countTests = (source) => (source.match(/\btest\(/g) || []).length;

  const files = {};
  const typeNamesByFile = {};
  for (const path of sourceFiles) {
    const source = await read(path);
    const isType = path.endsWith(".d.ts");
    const isTest = path.startsWith("test/");
    files[path] = {
      layer: layerOf(path),
      lines: lineCount(source),
      bytes: Buffer.byteLength(source),
      ...(isType ? { exports: typeNames(source).length } : {}),
      ...(isTest ? { tests: countTests(source) } : {})
    };
    if (isType) typeNamesByFile[path] = typeNames(source);
  }

  /* db collection keys live in the shared fixture store */
  const dbModule = "src/shared/api/db.js";
  const dbSource = files[dbModule] ? await read(dbModule) : "";
  const dbKeys = (() => {
    const lines = dbSource.split(/\r?\n/);
    const start = lines.findIndex((line) => line.includes("const db = {"));
    if (start < 0) return [];
    let end = -1;
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^\};?\s*$/.test(lines[i])) { end = i; break; }
    }
    const keys = [];
    for (let i = start + 1; i < end; i += 1) {
      const match = lines[i].match(/^ {2}([A-Za-z0-9_]+):/);
      if (match) keys.push(match[1]);
    }
    return keys;
  })();

  /* dependency edges, so the graph can reflect the enforced direction */
  const dependencies = {};
  for (const path of sourceFiles.filter((p) => p.endsWith(".js"))) {
    const source = await read(path);
    const targets = [...source.matchAll(/from "(\.\.?\/[^"]+)"/g)].map((match) => match[1]);
    if (targets.length) dependencies[path] = targets;
  }

  const facts = {
    generatedAt: new Date().toISOString(),
    product: JSON.parse(pkgText),
    files,
    typeNames: typeNamesByFile,
    dbModule,
    dbKeys,
    scripts: JSON.parse(pkgText).scripts,
    dependencies,
    layers: [...new Set(sourceFiles.map(layerOf))].sort(),
    buildAssets: [...buildScript.matchAll(/"(src\/[^"]+|index\.html|app\.html|landing\.html)"/g)].map((match) => match[1]),
    entryPoints: {
      index: [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]),
      app: [...appHtml.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]),
      landing: [...landingHtml.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1])
    },
    serveTargets: /dist\//.test(serveScript) ? "dist/" : "src/"
  };

  await mkdir(new URL("brain/", root), { recursive: true });
  await writeFile(new URL("brain/facts.json", root), `${JSON.stringify(facts, null, 2)}\n`);

  const testCount = Object.values(files).reduce((sum, file) => sum + (file.tests || 0), 0);
  console.log(
    `Wrote brain/facts.json (${Object.keys(files).length} files, ${dbKeys.length} db keys, ${testCount} tests, ${facts.layers.length} layers)`
  );
}

await main();