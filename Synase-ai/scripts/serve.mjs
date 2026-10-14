import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = fileURLToPath(new URL("../dist", import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || "127.0.0.1";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".ts": "text/plain; charset=utf-8"
};

const server = createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || HOST}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Prevent directory traversal
    const safePath = normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
    let filePath = join(distDir, safePath);

    if (existsSync(filePath)) {
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        filePath = join(filePath, "index.html");
      }
    }

    if (!existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = await readFile(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": content.byteLength,
      "Cache-Control": "no-cache"
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`500 Internal Server Error: ${err.message}`);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  [Error] Port ${PORT} is already in use.`);
    console.error(`  To use another port, run: PORT=${PORT + 1} npm run dev\n`);
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`\n  SYNASE AI Prototype`);
  console.log(`  > Landing:   http://${HOST}:${PORT}/landing.html`);
  console.log(`  > App:       http://${HOST}:${PORT}/app.html#/app/dashboard`);
  console.log(`  > Root:      http://${HOST}:${PORT}/  (redirects to landing)\n`);
});

