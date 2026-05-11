#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'src/data/notes.json');

const USERNAME = 'symbol_emerg';
const RSS_URL = `https://note.com/${USERNAME}/rss`;
const TOP_N = 10;
const EXCERPT_LIMIT = 220;

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');

const stripHtml = (s) =>
  decode(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const escapeTag = (tag) => tag.replace(/:/g, '\\:');

const getTag = (block, tag) => {
  const re = new RegExp(
    `<${escapeTag(tag)}[^>]*>([\\s\\S]*?)<\\/${escapeTag(tag)}>`,
    'i',
  );
  const m = block.match(re);
  return m ? m[1].trim() : '';
};

async function main() {
  console.log(`Fetching ${RSS_URL}...`);
  const res = await fetch(RSS_URL, {
    headers: { 'User-Agent': 'cpc-hub-note-fetch/1.0' },
  });
  if (!res.ok) {
    throw new Error(`note RSS ${res.status}: ${res.statusText}`);
  }
  const xml = await res.text();
  const itemBlocks = xml
    .split(/<item>/)
    .slice(1)
    .map((s) => s.split(/<\/item>/)[0]);

  const items = itemBlocks
    .map((block) => {
      const link = decode(getTag(block, 'link'));
      const title = decode(getTag(block, 'title'));
      const pubDate = getTag(block, 'pubDate');
      const descRaw = getTag(block, 'description');
      const author =
        decode(getTag(block, 'note:creatorName')) ||
        decode(getTag(block, 'dc:creator')) ||
        USERNAME;
      const thumbnail = getTag(block, 'media:thumbnail') || null;
      const guid = decode(getTag(block, 'guid'));

      const excerpt = stripHtml(descRaw)
        .replace(/続きをみる\s*$/, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, EXCERPT_LIMIT);

      return {
        id: guid || link,
        url: link,
        title,
        author,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
        excerpt,
        thumbnail,
      };
    })
    .filter((i) => i.url && i.title);

  const sorted = items
    .sort(
      (a, b) => +new Date(b.publishedAt || 0) - +new Date(a.publishedAt || 0),
    )
    .slice(0, TOP_N);

  const payload = {
    fetchedAt: new Date().toISOString(),
    source: RSS_URL,
    username: USERNAME,
    items: sorted,
  };

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${sorted.length} articles → ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
