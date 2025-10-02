import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const VERSION = "15.19.1";
const DDragonListUrl = `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/en_US/champion.json`;
const OPGG_BASE = `https://opgg-static.akamaized.net/meta/images/lol/${VERSION}/champion`; // {Name}.png
const OUT_DIR = path.resolve(process.cwd(), "public/hero");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function downloadToFile(url, filePath, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(filePath, buf);
      return { ok: true };
    } catch (err) {
      if (attempt === retries) return { ok: false, error: err };
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
}

async function main() {
  console.log(`Fetching champion list for version ${VERSION}...`);
  const data = await fetchJson(DDragonListUrl);
  const names = Object.keys(data?.data ?? {}); // e.g., ["Aatrox", "Ahri", "Belveth", ...]

  console.log(
    `Found ${names.length} champions. Creating output dir: ${OUT_DIR}`
  );
  await ensureDir(OUT_DIR);

  // Concurrency limiter
  const concurrency = Math.max(4, Math.min(16, os.cpus().length));
  let index = 0;
  let success = 0;
  let fail = 0;

  async function worker(id) {
    while (true) {
      const i = index++;
      if (i >= names.length) return;
      const name = names[i];
      const url = `${OPGG_BASE}/${name}.png`;
      const outFile = path.join(OUT_DIR, `${name}.png`);
      const result = await downloadToFile(url, outFile);
      if (result.ok) {
        success++;
        if ((success + fail) % 10 === 0)
          console.log(`Progress: ${success + fail}/${names.length}`);
      } else {
        fail++;
        console.warn(
          `Failed: ${name} -> ${url} (${result.error?.message || result.error})`
        );
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));
  console.log(`Done. Success: ${success}, Failed: ${fail}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
