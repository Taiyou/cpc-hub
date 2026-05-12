#!/usr/bin/env node
/**
 * fetch-arxiv.mjs
 *
 * Polls arXiv for new papers matching ARXIV_QUERIES and pushes them
 * into the Notion "CPC Papers" database with status=pending.
 *
 * - Dedupes against the DB on arXiv ID (skips anything already present).
 * - Respects LOOKBACK_DAYS so we don't re-import the entire history.
 * - Rate-limited per arXiv guidelines (1 request / 3 sec).
 *
 * Env vars required:
 *   NOTION_TOKEN   — Internal Integration secret (ntn_...)
 *   NOTION_DB_ID   — Database ID for "CPC Papers"
 *
 * Usage:
 *   pnpm fetch:arxiv
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@notionhq/client';
import {
  ARXIV_QUERIES,
  ARXIV_CATEGORIES,
  LOOKBACK_DAYS,
  MAX_RESULTS_PER_QUERY,
} from './arxiv-queries.mjs';

// --- minimal .env loader (mirrors scripts/fetch-youtube.mjs) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_FILE = resolve(__dirname, '..', '.env');
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

const ARXIV_API = 'https://export.arxiv.org/api/query';
const SLEEP_MS = 3500; // arXiv asks for >= 3s between calls
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- arXiv ----------

/** Strip the version suffix from a full arXiv ID (`2401.12345v2` → `2401.12345`). */
function normalizeArxivId(id) {
  return id.replace(/v\d+$/, '');
}

/**
 * Very small Atom XML parser tailored to the arXiv response shape.
 * Avoids pulling in an XML lib for this single use.
 */
function parseAtomFeed(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRegex.exec(xml)) !== null) {
    const body = m[1];
    const pick = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
      const mm = body.match(r);
      return mm ? mm[1].trim().replace(/\s+/g, ' ') : '';
    };
    const idUrl = pick('id'); // e.g. http://arxiv.org/abs/2401.12345v2
    const arxivIdRaw = idUrl.split('/abs/')[1] ?? '';
    const arxivId = normalizeArxivId(arxivIdRaw);

    const authors = [];
    const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>/g;
    let am;
    while ((am = authorRegex.exec(body)) !== null) {
      authors.push(am[1].trim());
    }

    const categories = [];
    const catRegex = /<category[^>]*term="([^"]+)"/g;
    let cm;
    while ((cm = catRegex.exec(body)) !== null) {
      categories.push(cm[1]);
    }

    entries.push({
      arxivId,
      title: pick('title'),
      summary: pick('summary'),
      published: pick('published'),
      updated: pick('updated'),
      authors,
      categories,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
      absUrl: `https://arxiv.org/abs/${arxivId}`,
    });
  }
  return entries;
}

async function queryArxiv(searchQuery, attempt = 1) {
  const params = new URLSearchParams({
    search_query: searchQuery,
    start: '0',
    max_results: String(MAX_RESULTS_PER_QUERY),
    sortBy: 'submittedDate',
    sortOrder: 'descending',
  });
  const url = `${ARXIV_API}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'cpc-hub-bot/1.0 (+https://github.com/)' },
  });
  if (res.status === 429 || res.status >= 500) {
    if (attempt < 4) {
      const backoff = 5000 * Math.pow(2, attempt - 1); // 5s, 10s, 20s
      console.log(`  ↻ ${res.status} — backing off ${backoff}ms (attempt ${attempt}/3)`);
      await sleep(backoff);
      return queryArxiv(searchQuery, attempt + 1);
    }
  }
  if (!res.ok) {
    throw new Error(`arXiv ${res.status} for query: ${searchQuery}`);
  }
  const xml = await res.text();
  return parseAtomFeed(xml);
}

// ---------- Notion ----------

async function fetchExistingArxivIds() {
  const seen = new Set();
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: NOTION_DB_ID,
      start_cursor: cursor,
      page_size: 100,
      filter: {
        property: 'arXiv ID',
        rich_text: { is_not_empty: true },
      },
    });
    for (const page of res.results) {
      const prop = page.properties?.['arXiv ID'];
      const txt = prop?.rich_text?.map((t) => t.plain_text).join('').trim();
      if (txt) seen.add(normalizeArxivId(txt));
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return seen;
}

/** Limit a string to Notion's per-rich_text 2000-char cap, preserving end. */
function clampRichText(s, max = 1900) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function richText(s) {
  const text = clampRichText(s);
  return text ? [{ type: 'text', text: { content: text } }] : [];
}

async function createNotionPage(entry) {
  // Authors → multi-select; cap to 25 to stay under Notion limits and trim names
  const authorOptions = entry.authors
    .slice(0, 25)
    .map((name) => ({ name: name.replace(/,/g, '').slice(0, 100) }));

  // Year: prefer published date
  const year = (() => {
    const d = entry.published || entry.updated;
    if (!d) return null;
    const y = new Date(d).getUTCFullYear();
    return Number.isFinite(y) ? y : null;
  })();

  const properties = {
    Title: { title: [{ type: 'text', text: { content: clampRichText(entry.title, 200) } }] },
    'arXiv ID': { rich_text: richText(entry.arxivId) },
    Authors: { multi_select: authorOptions },
    'Abstract (EN)': { rich_text: richText(entry.summary) },
    URL: { url: entry.absUrl },
    Status: { select: { name: 'pending' } },
    'Date Added': { date: { start: new Date().toISOString().slice(0, 10) } },
  };
  if (year) properties.Year = { number: year };
  if (entry.categories?.length) {
    properties.Categories = {
      multi_select: entry.categories.slice(0, 20).map((c) => ({ name: c })),
    };
  }

  await notion.pages.create({
    parent: { database_id: NOTION_DB_ID },
    properties,
  });
}

// ---------- main ----------

async function main() {
  const lookbackCutoff = new Date(Date.now() - LOOKBACK_DAYS * 86400_000);
  console.log(`[fetch-arxiv] queries=${ARXIV_QUERIES.length} lookback=${LOOKBACK_DAYS}d`);

  console.log('[fetch-arxiv] loading existing arXiv IDs from Notion…');
  const existing = await fetchExistingArxivIds();
  console.log(`[fetch-arxiv] found ${existing.size} existing entries`);

  const collected = new Map(); // arxivId → entry
  for (const q of ARXIV_QUERIES) {
    console.log(`[arxiv] ${q}`);
    try {
      const entries = await queryArxiv(q);
      for (const e of entries) {
        if (!e.arxivId) continue;
        if (existing.has(e.arxivId)) continue;
        if (collected.has(e.arxivId)) continue;
        const published = e.published ? new Date(e.published) : null;
        if (published && published < lookbackCutoff) continue;
        if (
          ARXIV_CATEGORIES.length > 0 &&
          !e.categories.some((c) => ARXIV_CATEGORIES.includes(c))
        ) {
          continue;
        }
        collected.set(e.arxivId, e);
      }
    } catch (err) {
      console.error(`[arxiv] error on query "${q}": ${err.message}`);
    }
    await sleep(SLEEP_MS);
  }

  console.log(`[fetch-arxiv] new papers to import: ${collected.size}`);

  let ok = 0;
  let fail = 0;
  for (const entry of collected.values()) {
    try {
      await createNotionPage(entry);
      console.log(`  + ${entry.arxivId}  ${entry.title}`);
      ok++;
    } catch (err) {
      console.error(`  ! ${entry.arxivId}  ${err.message}`);
      fail++;
    }
    // gentle pacing on Notion side
    await sleep(350);
  }
  console.log(`[fetch-arxiv] done. created=${ok} failed=${fail}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
