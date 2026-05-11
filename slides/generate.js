// CPC Hub 構成設計の概要 — slide deck generator
// Run: node generate.js
// Output: ./CPC-Hub-構成設計.pptx
//
// 2026-05 更新: 実装の進捗（YouTube / note 取り込み、launchd 自動化、
// 5 コレクション化、CPC アニメーション、X CTA、ホームナビ）を反映。

import PptxGenJS from "pptxgenjs";

const pres = new PptxGenJS();
pres.defineLayout({ name: "STD", width: 10, height: 5.625 });
pres.layout = "STD";

const FONT = "Meiryo";
const ACCENT = "2B579A";
const ACCENT_RED = "C0392B";
const INK = "333333";
const MUTED = "888888";
const FAINT = "AAAAAA";

const SLIDE_W = 10;
const SLIDE_H = 5.625;
const MARGIN_X = 0.6;

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------
function addPageHeader(slide, title, slideNumber) {
  slide.background = { color: "FFFFFF" };
  slide.addText(title, {
    x: MARGIN_X, y: 0.25, w: SLIDE_W - MARGIN_X * 2, h: 0.6,
    fontSize: 26, fontFace: FONT, bold: true, color: INK, margin: 0,
  });
  slide.addShape(pres.shapes.LINE, {
    x: MARGIN_X, y: 0.9, w: SLIDE_W - MARGIN_X * 2, h: 0,
    line: { color: ACCENT, width: 2 },
  });
  if (slideNumber !== undefined) {
    slide.addText(String(slideNumber), {
      x: SLIDE_W - 0.7, y: SLIDE_H - 0.4, w: 0.5, h: 0.3,
      fontSize: 10, fontFace: FONT, color: FAINT, align: "right",
    });
  }
}

function bulletItems(items, opts = {}) {
  const fontSize = opts.fontSize ?? 16;
  const color = opts.color ?? INK;
  const paraSpaceAfter = opts.paraSpaceAfter ?? 8;
  return items.map((it, i) => ({
    text: typeof it === "string" ? it : it.text,
    options: {
      fontSize,
      fontFace: FONT,
      color: typeof it === "object" && it.color ? it.color : color,
      bold: typeof it === "object" && it.bold ? it.bold : false,
      bullet: opts.bullet ?? { code: "25A0" },
      indentLevel: typeof it === "object" && it.indent ? it.indent : 0,
      breakLine: i < items.length - 1,
      paraSpaceAfter,
    },
  }));
}

// =============================================================================
// SLIDE 1: Title
// =============================================================================
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  s.addText("CPC Hub", {
    x: MARGIN_X, y: 1.6, w: SLIDE_W - MARGIN_X * 2, h: 0.9,
    fontSize: 48, fontFace: FONT, bold: true, color: INK, align: "center",
  });

  s.addText("構成設計の概要", {
    x: MARGIN_X, y: 2.55, w: SLIDE_W - MARGIN_X * 2, h: 0.5,
    fontSize: 22, fontFace: FONT, color: INK, align: "center",
  });

  s.addShape(pres.shapes.LINE, {
    x: SLIDE_W / 2 - 1.5, y: 3.15, w: 3.0, h: 0,
    line: { color: ACCENT, width: 2 },
  });

  s.addText("Collective Predictive Coding 研究のためのバイリンガル・ハブ", {
    x: MARGIN_X, y: 3.3, w: SLIDE_W - MARGIN_X * 2, h: 0.4,
    fontSize: 14, fontFace: FONT, color: MUTED, align: "center", italic: true,
  });

  s.addText("実装レビュー  /  2026-05", {
    x: MARGIN_X, y: SLIDE_H - 0.7, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 11, fontFace: FONT, color: MUTED, align: "center",
  });
}

// =============================================================================
// SLIDE 2: Table of Contents
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "目次", 2);

  const sections = [
    "1.   背景と現状",
    "2.   技術スタック",
    "3.   データモデル（5 コレクション）",
    "4.   サイト構造と機能",
    "5.   コンテンツフロー（手動 + 自動取り込み）",
    "6.   自動化（launchd / fetch スクリプト）",
  ];

  const items = sections.map((sec, i) => ({
    text: sec,
    options: {
      fontSize: 18, fontFace: FONT, color: INK,
      breakLine: i < sections.length - 1,
      paraSpaceAfter: 14,
    },
  }));

  s.addText(items, {
    x: 1.2, y: 1.3, w: 8.0, h: 4.0, valign: "top",
  });
}

// =============================================================================
// SLIDE 3: Overview (4-column architecture flowchart) — UPDATED
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "全体アーキテクチャ", 3);

  const cols = [
    { label: "INPUT",   x: 0.4 },
    { label: "STORAGE", x: 2.85 },
    { label: "BUILD",   x: 5.30 },
    { label: "OUTPUT",  x: 7.75 },
  ];

  const COL_W = 2.05;
  const HEADER_Y = 1.1;

  cols.forEach((c) => {
    s.addText(c.label, {
      x: c.x, y: HEADER_Y, w: COL_W, h: 0.3,
      fontSize: 10, fontFace: FONT, bold: true, color: ACCENT, align: "center",
      charSpacing: 2,
    });
  });

  const BOX_H = 0.55;
  const Y_BASE = 1.55;
  const Y_GAP = 0.7;

  const drawBox = (x, y, w, h, label, opts = {}) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h,
      fill: { color: opts.fill ?? "FFFFFF" },
      line: { color: opts.border ?? ACCENT, width: 1.25 },
      rectRadius: 0.06,
    });
    s.addText(label, {
      x, y, w, h,
      fontSize: opts.fontSize ?? 11,
      fontFace: FONT,
      bold: opts.bold ?? false,
      color: opts.color ?? INK,
      align: "center", valign: "middle",
    });
  };

  // INPUT column (UPDATED: actual sources)
  const inputs = [
    "Markdown 編集\n(手動)",
    "YouTube API v3\n(自動)",
    "note RSS\n(自動)",
  ];
  inputs.forEach((label, i) => {
    drawBox(cols[0].x, Y_BASE + i * Y_GAP, COL_W, BOX_H, label, { fontSize: 10 });
  });

  // STORAGE column (UPDATED: content/*.md + src/data/*.json)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: cols[1].x, y: Y_BASE, w: COL_W, h: Y_GAP * 2 + BOX_H,
    fill: { color: ACCENT },
    line: { color: ACCENT },
    rectRadius: 0.06,
  });
  s.addText([
    { text: "content/*.md\n", options: { fontSize: 12, bold: true, color: "FFFFFF", fontFace: FONT, breakLine: true } },
    { text: "papers / labs / events\n", options: { fontSize: 9, color: "E8EEF7", fontFace: FONT, breakLine: true } },
    { text: "\nsrc/data/*.json\n", options: { fontSize: 12, bold: true, color: "FFFFFF", fontFace: FONT, breakLine: true } },
    { text: "videos / notes", options: { fontSize: 9, color: "E8EEF7", fontFace: FONT } },
  ], {
    x: cols[1].x, y: Y_BASE, w: COL_W, h: Y_GAP * 2 + BOX_H,
    align: "center", valign: "middle",
  });

  // BUILD column (same)
  const builds = ["Astro 5\n(SSG)", "Tailwind\n+ i18n", "全文検索\n(クライアント)"];
  builds.forEach((label, i) => {
    drawBox(cols[2].x, Y_BASE + i * Y_GAP, COL_W, BOX_H, label, { fontSize: 10 });
  });

  // OUTPUT column (UPDATED: X CTA, no auto post yet)
  const outputs = [
    { label: "/en/  /ja/\n(GitHub Private)", emphasize: true },
    { label: "共有ボタン\n(訪問者起点)", emphasize: false },
    { label: "X CTA カード\n(タイムライン)", emphasize: false },
  ];
  outputs.forEach((o, i) => {
    drawBox(cols[3].x, Y_BASE + i * Y_GAP, COL_W, BOX_H, o.label, {
      fontSize: 10,
      fill: o.emphasize ? "F0F4FA" : "FFFFFF",
      border: ACCENT,
    });
  });

  // arrows: input → storage (3 arrows converge)
  for (let i = 0; i < 3; i++) {
    const fromX = cols[0].x + COL_W;
    const fromY = Y_BASE + i * Y_GAP + BOX_H / 2;
    const toX = cols[1].x;
    const toY = Y_BASE + Y_GAP + BOX_H / 2;
    s.addShape(pres.shapes.LINE, {
      x: fromX, y: fromY, w: toX - fromX, h: toY - fromY,
      line: { color: MUTED, width: 1.25, endArrowType: "arrow" },
    });
  }

  // arrow: storage → build (single)
  s.addShape(pres.shapes.LINE, {
    x: cols[1].x + COL_W, y: Y_BASE + Y_GAP + BOX_H / 2,
    w: cols[2].x - (cols[1].x + COL_W), h: 0,
    line: { color: MUTED, width: 1.25, endArrowType: "arrow" },
  });

  // arrows: build → output (3 fan out)
  for (let i = 0; i < 3; i++) {
    const fromX = cols[2].x + COL_W;
    const fromY = Y_BASE + Y_GAP + BOX_H / 2;
    const toX = cols[3].x;
    const toY = Y_BASE + i * Y_GAP + BOX_H / 2;
    s.addShape(pres.shapes.LINE, {
      x: fromX, y: fromY, w: toX - fromX, h: toY - fromY,
      line: { color: MUTED, width: 1.25, endArrowType: "arrow" },
    });
  }

  s.addText(
    "Markdown + JSON を一次データに据え、手動編集と外部 API 取り込みを統合する「ハブ」構造",
    {
      x: MARGIN_X, y: 4.55, w: SLIDE_W - MARGIN_X * 2, h: 0.4,
      fontSize: 13, fontFace: FONT, color: ACCENT, italic: true, align: "center",
    }
  );

  s.addText("各レイヤーの詳細は 4 枚目以降", {
    x: MARGIN_X, y: 5.0, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 10, fontFace: FONT, color: MUTED, align: "center",
  });
}

// =============================================================================
// SLIDE 4: §1 背景と現状
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§1  背景と現状", 4);

  const COL_Y = 1.2;
  const COL_W = 4.4;

  // 左: 課題
  s.addShape(pres.shapes.RECTANGLE, {
    x: MARGIN_X, y: COL_Y, w: COL_W, h: 0.45,
    fill: { color: "F4F4F4" }, line: { color: "F4F4F4" },
  });
  s.addText("現状の課題", {
    x: MARGIN_X, y: COL_Y, w: COL_W, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
    align: "center", valign: "middle",
  });
  s.addText(bulletItems([
    "CPC 関連情報が論文・SNS・動画・解説記事に散在",
    "arXiv / 個人 blog / YouTube / note をまたぐ追跡コスト",
    "日本語と英語のリソース連携が弱い",
    "新規参入者が最初の足場を見つけにくい",
  ], { fontSize: 14 }), {
    x: MARGIN_X + 0.2, y: COL_Y + 0.65, w: COL_W - 0.2, h: 3.5, valign: "top",
  });

  // 右: 現状（実装済み）
  const RIGHT_X = MARGIN_X + COL_W + 0.4;
  s.addShape(pres.shapes.RECTANGLE, {
    x: RIGHT_X, y: COL_Y, w: COL_W, h: 0.45,
    fill: { color: ACCENT }, line: { color: ACCENT },
  });
  s.addText("現状（実装済み）", {
    x: RIGHT_X, y: COL_Y, w: COL_W, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });
  s.addText(bulletItems([
    "1 箇所に集約された 5 系統のリソース",
    "EN / JA バイリンガル対応",
    "YouTube・note の自動取り込み（1 時間毎）",
    "CPC ダイナミクスの SVG アニメーション",
    "5 種すべてを横断する全文検索",
    "GitHub Private で運営、CC BY-NC 4.0",
  ], { fontSize: 14 }), {
    x: RIGHT_X + 0.2, y: COL_Y + 0.65, w: COL_W - 0.2, h: 3.5, valign: "top",
  });
}

// =============================================================================
// SLIDE 5: 実装スコープ
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§1  実装スコープ", 5);

  const COL_Y = 1.15;
  const COL_W = 4.4;

  // 左: 実装済み
  s.addShape(pres.shapes.RECTANGLE, {
    x: MARGIN_X, y: COL_Y, w: COL_W, h: 0.45,
    fill: { color: ACCENT }, line: { color: ACCENT },
  });
  s.addText("✓ 実装済み", {
    x: MARGIN_X, y: COL_Y, w: COL_W, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });
  s.addText(bulletItems([
    "5 コレクション一覧 + 詳細ページ",
    "EN / JA 両言語切替（ホームナビ含む）",
    "クライアントサイド全文検索（5 種対応）",
    "YouTube Data API v3 → videos.json",
    "note RSS → notes.json",
    "launchd で 1 時間ごと自動再ビルド",
    "X CTA カード（サイドバー）",
    "CPC SVG ダイナミクスアニメーション",
    "共有ボタン（X / Bluesky / コピー）",
  ], { fontSize: 12, paraSpaceAfter: 4 }), {
    x: MARGIN_X + 0.2, y: COL_Y + 0.65, w: COL_W - 0.2, h: 4.0, valign: "top",
  });

  // 右: 未実装 / 将来
  const RIGHT_X = MARGIN_X + COL_W + 0.4;
  s.addShape(pres.shapes.RECTANGLE, {
    x: RIGHT_X, y: COL_Y, w: COL_W, h: 0.45,
    fill: { color: ACCENT_RED }, line: { color: ACCENT_RED },
  });
  s.addText("◯ 未実装 / 将来検討", {
    x: RIGHT_X, y: COL_Y, w: COL_W, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });
  s.addText(bulletItems([
    "Notion DB → Markdown 同期（将来）",
    "arXiv 自動発見・Issue 化（将来）",
    "Issue Form での外部貢献受付",
    "Vercel / Cloudflare Pages デプロイ",
    "アクセス解析（Cloudflare Web Analytics 等）",
    "認証・ユーザー管理（不要の方針）",
    "全文翻訳の自動化",
    "Pagefind 高度検索（コレクション増加時）",
    "X タイムライン埋め込み（X 側仕様で断念）",
  ], { fontSize: 12, paraSpaceAfter: 4 }), {
    x: RIGHT_X + 0.2, y: COL_Y + 0.65, w: COL_W - 0.2, h: 4.0, valign: "top",
  });
}

// =============================================================================
// SLIDE 6: §2 技術スタック
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§2  技術スタック", 6);

  const rows = [
    ["レイヤー", "採用技術", "選定理由 / 現状"],
    ["サイト",       "Astro 5 (SSG) + Tailwind CSS 3", "高速・SEO 良・i18n 標準対応"],
    ["コンテンツ",   "Markdown + Astro Content Collections",  "papers / labs / events を git 管理"],
    ["外部取り込み", "Node + fetch (YouTube API v3 / note RSS)", "src/data/videos.json と notes.json に保存"],
    ["i18n",         "Astro 標準 i18n (en / ja)",         "prefixDefaultLocale: true"],
    ["自動化",       "macOS launchd (1 時間 cron)",        "fetch + astro build を定期実行"],
    ["可視化",       "Pure SVG + SMIL + CSS",              "CPC ダイナミクスのヒーロー、依存ゼロ"],
    ["ホスティング", "GitHub Private (将来 Vercel)",       "現状はローカルビルド + 手動配布"],
    ["検索",         "クライアントサイド全文検索",         "5 種対応、< 100 件で十分動作"],
    ["ライセンス",   "CC BY-NC 4.0",                       "非営利での利用・改変・再配布を許可"],
  ];

  const tableRows = rows.map((row, ri) =>
    row.map((cell) => ({
      text: cell,
      options: {
        fontSize: 10,
        fontFace: FONT,
        bold: ri === 0,
        color: ri === 0 ? "FFFFFF" : INK,
        fill: { color: ri === 0 ? ACCENT : ri % 2 === 0 ? "F8F8F8" : "FFFFFF" },
        align: "left",
        valign: "middle",
      },
    }))
  );

  s.addTable(tableRows, {
    x: MARGIN_X, y: 1.1, w: SLIDE_W - MARGIN_X * 2,
    colW: [1.5, 3.3, 4.0],
    rowH: 0.38,
    border: { type: "solid", pt: 0.5, color: "DDDDDD" },
  });
}

// =============================================================================
// SLIDE 7: §3 データモデル
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§3  データモデル ─ 5 つの一次データ", 7);

  s.addText(
    "Content Collections（手動編集）と src/data/*.json（外部取り込み）の 2 系統。"
    + "前者は Zod スキーマで型検証、後者は fetch スクリプトが書き込む。",
    {
      x: MARGIN_X, y: 1.0, w: SLIDE_W - MARGIN_X * 2, h: 0.5,
      fontSize: 11, fontFace: FONT, color: MUTED, italic: true,
    }
  );

  // 上段: Content Collections (3)
  s.addText("Content Collections（content/*.md・手動編集）", {
    x: MARGIN_X, y: 1.55, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: ACCENT,
  });

  const topCols = [
    { x: 0.5,  title: "papers", subtitle: "論文",     fields: ["title", "authors[]", "year", "venue", "arxiv_id?", "url", "abstract_en", "summary_ja?", "schools[] ★", "methods[]?"] },
    { x: 3.55, title: "labs",   subtitle: "研究室",   fields: ["name_en", "name_ja?", "pi", "institution", "country", "homepage", "description_en", "description_ja?", "focus_areas[]"] },
    { x: 6.6,  title: "events", subtitle: "イベント", fields: ["title_en", "title_ja?", "type ★", "date_start", "date_end", "language ★", "location", "url", "description_en"] },
  ];
  const TOP_Y = 1.9;
  const TOP_H = 1.8;
  const COL_W = 2.85;

  topCols.forEach((p) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: p.x, y: TOP_Y, w: COL_W, h: 0.4,
      fill: { color: ACCENT }, line: { color: ACCENT }, rectRadius: 0.06,
    });
    s.addText([
      { text: p.title + "  ", options: { fontSize: 12, fontFace: FONT, bold: true, color: "FFFFFF" } },
      { text: p.subtitle, options: { fontSize: 9, fontFace: FONT, color: "E8EEF7" } },
    ], {
      x: p.x, y: TOP_Y, w: COL_W, h: 0.4,
      align: "center", valign: "middle",
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: p.x, y: TOP_Y + 0.4, w: COL_W, h: TOP_H - 0.4,
      fill: { color: "FAFAFA" }, line: { color: "DDDDDD", pt: 0.5 },
    });
    s.addText(p.fields.map((f, i) => ({
      text: f,
      options: {
        fontSize: 9, fontFace: "Menlo",
        color: f.includes("★") ? ACCENT_RED : INK,
        breakLine: i < p.fields.length - 1, paraSpaceAfter: 2,
      },
    })), {
      x: p.x + 0.15, y: TOP_Y + 0.5, w: COL_W - 0.3, h: TOP_H - 0.5, valign: "top",
    });
  });

  // 下段: src/data/*.json (2 — auto fetched)
  const MID_Y = 3.85;
  s.addText("src/data/*.json（外部 API から自動取得）", {
    x: MARGIN_X, y: MID_Y, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: ACCENT_RED,
  });

  const bottomCols = [
    { x: 1.5, title: "videos.json", subtitle: "YouTube Data API v3",
      fields: ["videoId", "title", "channelTitle", "publishedAt", "thumbnail", "matchedQueries[]"],
      source: "Collective Predictive Coding / 記号創発 / CPC仮説" },
    { x: 5.5, title: "notes.json",  subtitle: "note.com RSS",
      fields: ["id", "url", "title", "author", "publishedAt", "excerpt", "thumbnail"],
      source: "note.com/symbol_emerg/rss" },
  ];
  const BOT_W = 3.0;
  const BOT_H = 1.3;

  bottomCols.forEach((p) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: p.x, y: MID_Y + 0.35, w: BOT_W, h: 0.4,
      fill: { color: ACCENT_RED }, line: { color: ACCENT_RED }, rectRadius: 0.06,
    });
    s.addText([
      { text: p.title + "  ", options: { fontSize: 12, fontFace: FONT, bold: true, color: "FFFFFF" } },
      { text: p.subtitle, options: { fontSize: 9, fontFace: FONT, color: "FCE5E2" } },
    ], {
      x: p.x, y: MID_Y + 0.35, w: BOT_W, h: 0.4,
      align: "center", valign: "middle",
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: p.x, y: MID_Y + 0.75, w: BOT_W, h: BOT_H - 0.4,
      fill: { color: "FAFAFA" }, line: { color: "DDDDDD", pt: 0.5 },
    });
    s.addText(p.fields.join(" · "), {
      x: p.x + 0.15, y: MID_Y + 0.85, w: BOT_W - 0.3, h: BOT_H - 0.7,
      fontSize: 9, fontFace: "Menlo", color: INK, valign: "top",
    });
    s.addText("src: " + p.source, {
      x: p.x + 0.15, y: MID_Y + 1.4, w: BOT_W - 0.3, h: 0.3,
      fontSize: 8, fontFace: FONT, color: MUTED, italic: true,
    });
  });

  // legend
  s.addText("?  = optional      ★ = enum 制約 (Zod で固定)", {
    x: MARGIN_X, y: SLIDE_H - 0.4, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 9, fontFace: FONT, color: MUTED, italic: true, align: "center",
  });
}

// =============================================================================
// SLIDE 8: §4 サイト構造と i18n
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§4  サイト構造と i18n", 8);

  const treeLines = [
    "/                        → /en/ にリダイレクト",
    "/en/                     ホーム（CPC SVG + X CTA サイドバー）",
    "  /en/papers/            一覧 + /en/papers/{slug}/",
    "  /en/labs/              一覧 + /en/labs/{slug}/",
    "  /en/events/            一覧（Upcoming / Past）+ 詳細",
    "  /en/videos/            一覧（YouTube から自動取得）",
    "  /en/articles/          一覧（note から自動取得）",
    "  /en/search/            全 5 種を横断する全文検索",
    "/ja/  ...                同じ構造で日本語版",
  ];

  s.addText("URL 構造", {
    x: MARGIN_X, y: 1.1, w: 5.5, h: 0.35,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
  });

  s.addText(treeLines.map((line, i) => ({
    text: line,
    options: {
      fontSize: 10, fontFace: "Menlo", color: INK,
      breakLine: i < treeLines.length - 1, paraSpaceAfter: 3,
    },
  })), {
    x: MARGIN_X + 0.1, y: 1.5, w: 5.5, h: 3.2, valign: "top",
  });

  const RIGHT_X = 6.4;
  s.addText("i18n 戦略", {
    x: RIGHT_X, y: 1.1, w: 3.0, h: 0.35,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
  });

  s.addText(bulletItems([
    "英語が一次、日本語は補助",
    "summary_ja などが空なら英語版にフォールバック",
    "「（英語のみ）」ラベルを薄く表示",
    "Astro 標準 i18n (prefixDefaultLocale: true)",
    "ヘッダー右の EN / JA で同パスの別言語版へ",
    "ナビ: ホーム → 論文 → 研究室 → イベント → 動画 → 記事",
  ], { fontSize: 11, paraSpaceAfter: 6 }), {
    x: RIGHT_X, y: 1.5, w: 3.2, h: 3.5, valign: "top",
  });
}

// =============================================================================
// SLIDE 9: §4 検索と共有
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§4  検索と共有", 9);

  s.addText("全文検索", {
    x: MARGIN_X, y: 1.1, w: 4.4, h: 0.35,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
  });
  s.addText(bulletItems([
    "クライアントサイド substring 一致",
    "5 種すべて対応（papers / labs / events / videos / articles）",
    "タイトル / 著者 / タグ / 要約 / 場所 / 抜粋を対象",
    "フィルター: All / Papers / Labs / Events / Videos / Articles",
    "?q= 付き URL で共有 / ブックマーク可能",
    "日本語も substring で動作（normalize 済み）",
    "件数増加時は Pagefind に置換可能",
  ], { fontSize: 11, paraSpaceAfter: 5 }), {
    x: MARGIN_X, y: 1.5, w: 4.4, h: 3.5, valign: "top",
  });

  const RIGHT_X = 5.4;
  s.addText("共有 / 外部誘導", {
    x: RIGHT_X, y: 1.1, w: 4.0, h: 0.35,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
  });
  s.addText(bulletItems([
    "詳細ページに X / Bluesky 共有ボタン",
    "リンクをコピー（Clipboard API + フォールバック）",
    "ホーム右サイドバーに X CTA カード",
    "  → タイムライン埋め込みは X 仕様で不安定なため断念",
    "  → 直接 X で見るボタンを優先",
    "動画カード → YouTube 元動画へ",
    "記事カード → note 元記事へ",
  ], { fontSize: 11, paraSpaceAfter: 5 }), {
    x: RIGHT_X, y: 1.5, w: 4.2, h: 3.5, valign: "top",
  });

  s.addText(
    "認証もバックエンドも持たず、外部に誘導することで運用負荷を最小化",
    {
      x: MARGIN_X, y: 5.0, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
      fontSize: 11, fontFace: FONT, color: ACCENT, italic: true, align: "center",
    }
  );
}

// =============================================================================
// SLIDE 10: §5 コンテンツフロー
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§5  コンテンツフロー", 10);

  s.addText("3 系統の入力 → 一次データ → Astro でレンダリング", {
    x: MARGIN_X, y: 1.0, w: SLIDE_W - MARGIN_X * 2, h: 0.4,
    fontSize: 12, fontFace: FONT, color: MUTED, italic: true,
  });

  const ROW_Y = [1.65, 2.55, 3.45];
  const ROW_H = 0.6;
  const SRC_X = 0.6, SRC_W = 2.6;
  const MID_X = 4.1, MID_W = 2.0;
  const DST_X = 6.7, DST_W = 2.7;

  const drawSourceBox = (y, label, color) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: SRC_X, y, w: SRC_W, h: ROW_H,
      fill: { color: "FFFFFF" }, line: { color, width: 1.5 },
      rectRadius: 0.06,
    });
    s.addText(label, {
      x: SRC_X, y, w: SRC_W, h: ROW_H,
      fontSize: 10, fontFace: FONT, color: INK, align: "center", valign: "middle",
    });
  };

  const drawMidBox = (y, label, color) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: MID_X, y, w: MID_W, h: ROW_H,
      fill: { color }, line: { color },
    });
    s.addText(label, {
      x: MID_X, y, w: MID_W, h: ROW_H,
      fontSize: 9, fontFace: FONT, color: "FFFFFF", bold: true,
      align: "center", valign: "middle",
    });
  };

  const drawArrow = (fromX, fromY, toX, toY) => {
    s.addShape(pres.shapes.LINE, {
      x: fromX, y: fromY, w: toX - fromX, h: toY - fromY,
      line: { color: MUTED, width: 1.25, endArrowType: "arrow" },
    });
  };

  // Row 1: 手動 Markdown 編集
  drawSourceBox(ROW_Y[0], "Markdown 編集（手動）\npapers / labs / events", ACCENT);
  drawMidBox(ROW_Y[0], "Zod スキーマ検証\n+ git commit", ACCENT);

  // Row 2: YouTube
  drawSourceBox(ROW_Y[1], "YouTube Data API v3\n3 キーワード検索", ACCENT_RED);
  drawMidBox(ROW_Y[1], "fetch-youtube.mjs\nlaunchd 1 時間毎", ACCENT_RED);

  // Row 3: note
  drawSourceBox(ROW_Y[2], "note.com RSS\n@symbol_emerg", ACCENT_RED);
  drawMidBox(ROW_Y[2], "fetch-note.mjs\nlaunchd 1 時間毎", ACCENT_RED);

  for (let i = 0; i < 3; i++) {
    drawArrow(SRC_X + SRC_W, ROW_Y[i] + ROW_H / 2, MID_X, ROW_Y[i] + ROW_H / 2);
  }

  const DEST_Y = ROW_Y[0];
  const DEST_H = ROW_Y[2] + ROW_H - DEST_Y;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: DST_X, y: DEST_Y, w: DST_W, h: DEST_H,
    fill: { color: ACCENT }, line: { color: ACCENT }, rectRadius: 0.06,
  });
  s.addText([
    { text: "一次データ\n", options: { fontSize: 13, bold: true, color: "FFFFFF", fontFace: FONT, breakLine: true } },
    { text: "content/*.md\n", options: { fontSize: 10, color: "E8EEF7", italic: true, fontFace: FONT, breakLine: true } },
    { text: "src/data/*.json\n\n", options: { fontSize: 10, color: "E8EEF7", italic: true, fontFace: FONT, breakLine: true } },
    { text: "→ Astro build\n→ dist/", options: { fontSize: 10, color: "E8EEF7", fontFace: FONT } },
  ], {
    x: DST_X, y: DEST_Y, w: DST_W, h: DEST_H,
    align: "center", valign: "middle",
  });

  for (let i = 0; i < 3; i++) {
    drawArrow(MID_X + MID_W, ROW_Y[i] + ROW_H / 2, DST_X, ROW_Y[1] + ROW_H / 2);
  }

  s.addText(
    "手動編集（青）と自動取り込み（赤）を分離し、運用負荷と更新頻度のバランスを取る。",
    {
      x: MARGIN_X, y: 4.55, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
      fontSize: 10, fontFace: FONT, color: ACCENT, italic: true, align: "center",
    }
  );
}

// =============================================================================
// SLIDE 11: §6 自動化と承認モデル
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§6  自動化と承認モデル", 11);

  const rows = [
    [
      { text: "スクリプト / 操作", options: { fontSize: 11, bold: true, color: "FFFFFF", fontFace: FONT, fill: { color: ACCENT }, align: "left", valign: "middle" } },
      { text: "頻度", options: { fontSize: 11, bold: true, color: "FFFFFF", fontFace: FONT, fill: { color: ACCENT }, align: "left", valign: "middle" } },
      { text: "出力", options: { fontSize: 11, bold: true, color: "FFFFFF", fontFace: FONT, fill: { color: ACCENT }, align: "left", valign: "middle" } },
      { text: "状態", options: { fontSize: 11, bold: true, color: "FFFFFF", fontFace: FONT, fill: { color: ACCENT }, align: "left", valign: "middle" } },
    ],
    ["fetch-youtube.mjs", "1 時間 (launchd)", "src/data/videos.json", "✓ 稼働中"],
    ["fetch-note.mjs",    "1 時間 (launchd)", "src/data/notes.json",  "✓ 稼働中"],
    ["update:content",    "1 時間 (launchd)", "dist/ 再ビルド",         "✓ 稼働中"],
    ["Markdown 編集",     "随時 (手動)",      "papers/labs/events/*.md", "✓ 運用中"],
    ["notion_sync.py",    "将来",             "content/*.md 同期",       "◯ 未実装"],
    ["arxiv_monitor.py",  "将来",             "新着論文 → Issue",        "◯ 未実装"],
    ["x_post.py",         "将来",             "X 草稿（人が承認）",      "◯ 未実装"],
  ];

  const tableRows = rows.map((row, ri) => {
    if (ri === 0) return row;
    return row.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: 10, fontFace: ci === 0 ? "Menlo" : FONT,
        color: cell.startsWith("◯") ? MUTED : INK,
        fill: { color: ri % 2 === 0 ? "F8F8F8" : "FFFFFF" },
        align: "left", valign: "middle",
      },
    }));
  });

  s.addTable(tableRows, {
    x: MARGIN_X, y: 1.1, w: SLIDE_W - MARGIN_X * 2,
    colW: [2.5, 1.6, 2.7, 2.0],
    rowH: 0.36,
    border: { type: "solid", pt: 0.5, color: "DDDDDD" },
  });

  s.addText("承認モデル", {
    x: MARGIN_X, y: 4.3, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 13, fontFace: FONT, bold: true, color: INK,
  });
  s.addText(bulletItems([
    "外部 API からの取り込みは自動、人手では介入しない（誤情報リスクは元ソースに帰着）",
    "手動 Markdown は Tier 1 のレビュー後にコミット",
    "将来：Notion / Issue Form / X 自動投稿を段階的に追加（人手承認は維持）",
  ], { fontSize: 11, paraSpaceAfter: 4 }), {
    x: MARGIN_X + 0.1, y: 4.6, w: SLIDE_W - MARGIN_X * 2, h: 1.0, valign: "top",
  });
}

// =============================================================================
// SLIDE 12: Take-home Message
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "Take-home Message", 12);

  const messages = [
    "Markdown + JSON の一次データを Astro でビルドする「ハブ構造」を最小実装で達成",
    "5 つのコレクション（papers / labs / events / videos / articles）を横断する全文検索 + バイリンガル",
    "YouTube API と note RSS を 1 時間毎に取り込み、手動編集とのハイブリッドで運用",
    "次のフェーズ：Notion 連携、arXiv 監視、X 自動投稿、Cloudflare/Vercel デプロイへ段階的に拡張",
  ];

  const items = messages.map((msg, i) => ({
    text: `${i + 1}.  ${msg}`,
    options: {
      fontSize: 15, fontFace: FONT, color: INK,
      breakLine: true, paraSpaceAfter: 14,
    },
  }));

  s.addText(items, {
    x: 0.9, y: 1.3, w: 8.4, h: 4.0, valign: "top",
  });
}

// =============================================================================
// SLIDE 13: References / リソース
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "参考リソース", 13);

  s.addText("CPC の学術的背景", {
    x: MARGIN_X, y: 1.1, w: SLIDE_W - MARGIN_X * 2, h: 0.35,
    fontSize: 13, fontFace: FONT, bold: true, color: INK,
  });

  const paperRef = [
    { text: "Taniguchi, T., Yoshida, M., Matsui, Y., Le, N. C., Ueda, K., Hagiwara, Y., & Taniguchi, A. (2024). Collective predictive coding hypothesis: Symbol emergence as decentralized Bayesian inference. ", options: { fontSize: 11, fontFace: FONT, color: INK } },
    { text: "Frontiers in Robotics and AI", options: { fontSize: 11, fontFace: FONT, color: INK, italic: true } },
    { text: ", 11. ", options: { fontSize: 11, fontFace: FONT, color: INK } },
    { text: "https://doi.org/10.3389/frobt.2024.1353870", options: { fontSize: 11, fontFace: FONT, color: ACCENT, breakLine: true, paraSpaceAfter: 6 } },
  ];

  s.addText(paperRef, {
    x: MARGIN_X + 0.2, y: 1.5, w: SLIDE_W - MARGIN_X * 2 - 0.2, h: 0.9, valign: "top",
  });

  s.addText("技術リソース", {
    x: MARGIN_X, y: 2.6, w: SLIDE_W - MARGIN_X * 2, h: 0.35,
    fontSize: 13, fontFace: FONT, bold: true, color: INK,
  });

  const techLinks = [
    "Astro 5 — https://docs.astro.build/",
    "Astro Content Collections — https://docs.astro.build/en/guides/content-collections/",
    "Tailwind CSS 3 — https://tailwindcss.com/docs",
    "YouTube Data API v3 — https://developers.google.com/youtube/v3",
    "note RSS — https://note.com/{username}/rss",
    "launchd (macOS) — https://www.launchd.info/",
    "Pagefind（将来の検索）— https://pagefind.app/",
  ];

  s.addText(techLinks.map((line, i) => ({
    text: line,
    options: {
      fontSize: 11, fontFace: FONT, color: INK,
      breakLine: i < techLinks.length - 1, paraSpaceAfter: 4,
    },
  })), {
    x: MARGIN_X + 0.2, y: 3.0, w: SLIDE_W - MARGIN_X * 2 - 0.2, h: 2.0, valign: "top",
  });

  s.addText("リポジトリ: github.com/Taiyou/cpc-hub  /  ライセンス: CC BY-NC 4.0", {
    x: MARGIN_X, y: SLIDE_H - 0.65, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 10, fontFace: FONT, color: MUTED, italic: true,
  });
}

// =============================================================================
// Save
// =============================================================================
const outPath = "./CPC-Hub-構成設計.pptx";
await pres.writeFile({ fileName: outPath });
console.log(`✓ Generated: ${outPath}`);
