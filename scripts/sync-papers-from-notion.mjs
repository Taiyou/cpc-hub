#!/usr/bin/env node
/**
 * sync-papers-from-notion.mjs
 *
 * Pulls all rows with Status="approved" from the Notion "CPC Papers" DB
 * and materializes them as markdown files in content/papers/.
 *
 * - Filename: <arxiv-id>-<slug>.md (or <slug>.md if no arxiv_id)
 * - Frontmatter matches src/content/config.ts (papers schema)
 * - Removes local files whose source row was deleted / un-approved
 *
 * Env vars:
 *   NOTION_TOKEN
 *   NOTION_DB_ID
 *
 * Usage:
 *   pnpm sync:papers
 */

import { Client } from '@notionhq/client';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readdir, writeFile, unlink, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const PAPERS_DIR = join(REPO_ROOT, 'content', 'papers');
const ENV_FILE = join(REPO_ROOT, '.env');

// --- minimal .env loader (mirrors scripts/fetch-youtube.mjs) ---
function loadEnv() {
  if (!existsSync(ENV_FILE)) return;
  const raw = readFileSync(ENV_FILE, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    if (process.env[m[1]] === undefined) {
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  }
}
loadEnv();

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;

if (!NOTION_TOKEN || !NOTION_DB_ID) {
  console.error('Missing NOTION_TOKEN or NOTION_DB_ID in environment.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// Must match SCHOOLS enum in src/content/config.ts
const VALID_SCHOOLS = new Set([
  'Symbol Emergence',
  'Active Inference',
  'MHNG',
  'Emergent Communication',
  'Predictive Coding',
  'CPC-MS',
  'World Model',
  'Multi-agent',
]);

// ---------- helpers ----------

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function plain(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title.map((t) => t.plain_text).join('').trim();
  if (prop.type === 'rich_text') return prop.rich_text.map((t) => t.plain_text).join('').trim();
  if (prop.type === 'url') return prop.url || '';
  if (prop.type === 'number') return prop.number;
  if (prop.type === 'select') return prop.select?.name ?? '';
  if (prop.type === 'multi_select') return prop.multi_select.map((o) => o.name);
  if (prop.type === 'date') return prop.date?.start || '';
  if (prop.type === 'checkbox') return prop.checkbox;
  if (prop.type === 'people') return prop.people.map((p) => p.name || p.id);
  return '';
}

/** YAML-escape a single-line string for frontmatter scalars. */
function yamlString(s) {
  if (s == null) return '""';
  const str = String(s);
  // Quote anything that YAML 1.1/1.2 would parse as a non-string scalar:
  //   numbers, booleans, null, infinity, NaN, dates, octal, hex, etc.
  // Also quote anything containing structural characters or leading/trailing
  // whitespace.
  const looksNumeric    = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(str);
  const looksSpecial    = /^(true|false|yes|no|on|off|null|~|\.inf|\.nan)$/i.test(str);
  const hasStructural   = /[:\-#&*!|>'"%@`{}\[\],\n]/.test(str);
  const hasEdgeWS       = str.trim() !== str;
  if (str === '' || looksNumeric || looksSpecial || hasStructural || hasEdgeWS) {
    return JSON.stringify(str);
  }
  return str;
}

/** Render a multiline block as YAML literal `|` scalar. */
function yamlBlock(s) {
  const text = String(s ?? '').trim();
  if (!text) return '""';
  const indented = text.split(/\r?\n/).map((l) => `  ${l}`).join('\n');
  return `|\n${indented}`;
}

function renderFrontmatter(p) {
  const lines = [];
  lines.push('---');
  lines.push(`title: ${yamlString(p.title)}`);
  lines.push('authors:');
  for (const a of p.authors) lines.push(`  - ${yamlString(a)}`);
  lines.push(`year: ${p.year}`);
  lines.push(`venue: ${yamlString(p.venue || 'arXiv')}`);
  if (p.arxiv_id) lines.push(`arxiv_id: ${yamlString(p.arxiv_id)}`);
  if (p.doi) lines.push(`doi: ${yamlString(p.doi)}`);
  lines.push(`url: ${yamlString(p.url)}`);
  lines.push(`abstract_en: ${yamlBlock(p.abstract_en)}`);
  if (p.summary_ja) lines.push(`summary_ja: ${yamlBlock(p.summary_ja)}`);
  lines.push('schools:');
  for (const s of p.schools) lines.push(`  - ${yamlString(s)}`);
  if (p.methods?.length) {
    lines.push('methods:');
    for (const m of p.methods) lines.push(`  - ${yamlString(m)}`);
  }
  lines.push(`date_added: ${p.date_added}`);
  if (p.contributor) lines.push(`contributor: ${yamlString(p.contributor)}`);
  if (p.featured) lines.push(`featured: true`);
  // Marker — only files with this flag are eligible for auto-deletion by
  // a future sync run. Hand-curated papers must NOT have this set.
  lines.push(`notion_synced: true`);
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

function filenameFor(p) {
  const slug = slugify(p.title) || 'paper';
  return p.arxiv_id ? `${p.arxiv_id}-${slug}.md` : `${slug}.md`;
}

// ---------- Notion query ----------

async function fetchApprovedPapers() {
  const out = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: NOTION_DB_ID,
      start_cursor: cursor,
      page_size: 100,
      filter: {
        property: 'Status',
        select: { equals: 'approved' },
      },
    });
    for (const page of res.results) {
      const p = page.properties;
      const title = plain(p.Title || p.Name);
      if (!title) continue;

      const schoolsRaw = plain(p.Schools) || [];
      const schools = (Array.isArray(schoolsRaw) ? schoolsRaw : [schoolsRaw])
        .filter((s) => VALID_SCHOOLS.has(s));
      if (schools.length === 0) {
        console.warn(`  ! skipping "${title}" — no valid Schools (set at least one of: ${[...VALID_SCHOOLS].join(', ')})`);
        continue;
      }

      const year = plain(p.Year) || new Date().getUTCFullYear();
      const arxivId = plain(p['arXiv ID']) || '';
      const url = plain(p.URL) || (arxivId ? `https://arxiv.org/abs/${arxivId}` : '');
      if (!url) {
        console.warn(`  ! skipping "${title}" — no URL`);
        continue;
      }

      out.push({
        title,
        authors: plain(p.Authors) || [],
        year,
        venue: plain(p.Venue) || 'arXiv',
        arxiv_id: arxivId || undefined,
        doi: plain(p.DOI) || undefined,
        url,
        abstract_en: plain(p['Abstract (EN)']) || '(abstract not available)',
        summary_ja: plain(p['Summary (JA)']) || undefined,
        schools,
        methods: plain(p.Methods) || [],
        date_added: plain(p['Date Added']) || new Date().toISOString().slice(0, 10),
        contributor: plain(p.Contributor) || undefined,
        featured: !!plain(p.Featured),
      });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

// ---------- main ----------

async function main() {
  await mkdir(PAPERS_DIR, { recursive: true });

  console.log('[sync] querying Notion for approved papers…');
  const papers = await fetchApprovedPapers();
  console.log(`[sync] approved papers: ${papers.length}`);

  const desiredFiles = new Set();
  let written = 0;
  let unchanged = 0;

  for (const p of papers) {
    const filename = filenameFor(p);
    desiredFiles.add(filename);
    const fullPath = join(PAPERS_DIR, filename);
    const content = renderFrontmatter(p);

    let prev = null;
    try {
      prev = await readFile(fullPath, 'utf8');
    } catch {
      /* new file */
    }
    if (prev === content) {
      unchanged++;
      continue;
    }
    await writeFile(fullPath, content, 'utf8');
    console.log(`  ~ ${filename}`);
    written++;
  }

  // Prune local files that are no longer approved in Notion.
  // SAFETY: only delete files that explicitly carry `notion_synced: true` in
  // their frontmatter — i.e. files that this script wrote on a previous run.
  // Hand-curated papers will NEVER be touched.
  const existing = await readdir(PAPERS_DIR);
  let removed = 0;
  for (const f of existing) {
    if (!f.endsWith('.md')) continue;
    if (desiredFiles.has(f)) continue;
    const full = join(PAPERS_DIR, f);
    const body = await readFile(full, 'utf8').catch(() => '');
    // Match only inside the frontmatter block (between first two `---`).
    const fm = body.match(/^---\n([\s\S]*?)\n---/);
    const isSynced = fm ? /^\s*notion_synced:\s*true\s*$/m.test(fm[1]) : false;
    if (!isSynced) continue;
    await unlink(full);
    console.log(`  - removed (no longer approved): ${f}`);
    removed++;
  }

  console.log(`[sync] done. written=${written} unchanged=${unchanged} removed=${removed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
