/**
 * arXiv search queries used by scripts/fetch-arxiv.mjs.
 *
 * Each entry becomes one arXiv API call. Keep them focused — the script
 * de-duplicates across all queries by arXiv ID, so overlap is fine.
 *
 * Query syntax (arXiv API):
 *   ti:"..."   → title contains
 *   abs:"..."  → abstract contains
 *   all:"..."  → any field
 *   au:"..."   → author
 *   cat:cs.AI  → category
 *   AND / OR / ANDNOT / parentheses for grouping
 *
 * Docs: https://info.arxiv.org/help/api/user-manual.html#query_details
 *
 * EDIT THIS FILE to add / remove / refine search terms.
 * Commit changes — the GitHub Actions cron will pick them up automatically.
 */

export const ARXIV_QUERIES = [
  // Core CPC terminology
  'ti:"collective predictive coding" OR abs:"collective predictive coding"',
  'ti:"CPC hypothesis" OR abs:"CPC hypothesis"',

  // Symbol emergence
  'ti:"symbol emergence" OR abs:"symbol emergence"',
  'ti:"記号創発" OR abs:"記号創発"',

  // MHNG / naming game
  'ti:"Metropolis-Hastings naming game" OR abs:"Metropolis-Hastings naming game"',
  'ti:"MHNG" AND (abs:"naming game" OR abs:"symbol emergence")',

  // Active inference + language / emergence
  '(ti:"active inference" OR abs:"active inference") AND (abs:"language emergence" OR abs:"symbol emergence" OR abs:"naming game")',

  // Emergent communication (filtered to multi-agent)
  '(ti:"emergent communication" OR abs:"emergent communication") AND (abs:"multi-agent" OR abs:"reinforcement learning" OR abs:"language emergence")',

  // World models + multi-agent
  '(ti:"world model" OR abs:"world model") AND (abs:"multi-agent" OR abs:"decentralized" OR abs:"collective")',
];

/**
 * Filter results by these arXiv categories (whitelist).
 * Empty array = no category filter.
 */
export const ARXIV_CATEGORIES = [
  'cs.AI',
  'cs.CL',
  'cs.LG',
  'cs.MA',  // multi-agent systems
  'cs.NE',
  'cs.RO',
  'q-bio.NC',
  'stat.ML',
];

/**
 * How far back to look for *new* entries on each run (days).
 * Anything older is ignored even if it matches a query.
 * Set generously for the initial backfill, then lower for the daily cron.
 */
export const LOOKBACK_DAYS = 14;

/**
 * Maximum results to request per query (arXiv API max is 2000).
 * 50 is plenty for daily runs.
 */
export const MAX_RESULTS_PER_QUERY = 50;
