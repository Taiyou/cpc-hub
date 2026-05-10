// CPC Hub 構成設計の概要 — slide deck generator
// Run: node generate.js
// Output: ./CPC-Hub-構成設計.pptx

import PptxGenJS from "pptxgenjs";

const pres = new PptxGenJS();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 (default LAYOUT_16x9 is 10x5.625; WIDE is 13.333x7.5)
// Actually use the default 10x5.625 to keep math simpler with skill examples
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
      bullet: opts.bullet ?? { code: "25A0" }, // small black square
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

  // accent line
  s.addShape(pres.shapes.LINE, {
    x: SLIDE_W / 2 - 1.5, y: 3.15, w: 3.0, h: 0,
    line: { color: ACCENT, width: 2 },
  });

  s.addText("Collective Predictive Coding 研究のためのバイリンガル・ハブ", {
    x: MARGIN_X, y: 3.3, w: SLIDE_W - MARGIN_X * 2, h: 0.4,
    fontSize: 14, fontFace: FONT, color: MUTED, align: "center", italic: true,
  });

  s.addText("PoC 設計レビュー  /  2026-05", {
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
    "1.   背景と PoC のゴール",
    "2.   技術スタック",
    "3.   データモデル",
    "4.   サイト構造と機能",
    "5.   コンテンツフロー",
    "6.   自動化と次のステップ",
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
// SLIDE 3: Overview (4-column architecture flowchart)
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "全体アーキテクチャ", 3);

  // Column headers
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

  // Boxes per column
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

  // INPUT column
  const inputs = ["Notion DB\n(編集者)", "arxiv_monitor\n(自動発見)", "Issue Form\n(外部貢献)"];
  inputs.forEach((label, i) => {
    drawBox(cols[0].x, Y_BASE + i * Y_GAP, COL_W, BOX_H, label, { fontSize: 10 });
  });

  // STORAGE column (single emphasized box)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: cols[1].x, y: Y_BASE, w: COL_W, h: Y_GAP * 2 + BOX_H,
    fill: { color: ACCENT },
    line: { color: ACCENT },
    rectRadius: 0.06,
  });
  s.addText([
    { text: "content/*.md\n", options: { fontSize: 13, bold: true, color: "FFFFFF", fontFace: FONT, breakLine: true } },
    { text: "papers / labs / events\n\n", options: { fontSize: 10, color: "E8EEF7", fontFace: FONT, breakLine: true } },
    { text: "(一次データ)", options: { fontSize: 9, color: "E8EEF7", italic: true, fontFace: FONT } },
  ], {
    x: cols[1].x, y: Y_BASE, w: COL_W, h: Y_GAP * 2 + BOX_H,
    align: "center", valign: "middle",
  });

  // BUILD column
  const builds = ["Astro 5\n(SSG)", "Tailwind\n+ i18n", "全文検索\n(クライアント)"];
  builds.forEach((label, i) => {
    drawBox(cols[2].x, Y_BASE + i * Y_GAP, COL_W, BOX_H, label, { fontSize: 10 });
  });

  // OUTPUT column
  const outputs = [
    { label: "/en/  /ja/\n(Vercel)", emphasize: true },
    { label: "共有ボタン\n(訪問者起点)", emphasize: false },
    { label: "X 半自動投稿\n(週次)", emphasize: false },
  ];
  outputs.forEach((o, i) => {
    drawBox(cols[3].x, Y_BASE + i * Y_GAP, COL_W, BOX_H, o.label, {
      fontSize: 10,
      fill: o.emphasize ? "F0F4FA" : "FFFFFF",
      border: o.emphasize ? ACCENT : ACCENT,
    });
  });

  // arrows: input → storage (3 arrows converge)
  for (let i = 0; i < 3; i++) {
    const fromX = cols[0].x + COL_W;
    const fromY = Y_BASE + i * Y_GAP + BOX_H / 2;
    const toX = cols[1].x;
    const toY = Y_BASE + Y_GAP + BOX_H / 2; // center of storage
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

  // bottom message
  s.addText(
    "Markdown を一次データに据え、複数の入力源と複数の出力先をつなぐ「ハブ」構造",
    {
      x: MARGIN_X, y: 4.55, w: SLIDE_W - MARGIN_X * 2, h: 0.4,
      fontSize: 13, fontFace: FONT, color: ACCENT, italic: true, align: "center",
    }
  );

  // small note
  s.addText("各レイヤーの詳細は 4 枚目以降", {
    x: MARGIN_X, y: 5.0, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 10, fontFace: FONT, color: MUTED, align: "center",
  });
}

// =============================================================================
// SLIDE 4: §1 背景と PoC のゴール
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§1  背景と PoC のゴール", 4);

  // Two columns: 課題 / ゴール
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
    "CPC 関連の論文・ラボ情報が散在",
    "arxiv / 個別サイト / blog をまたぐ追跡コスト",
    "日本語と英語のリソース連携が弱い",
    "新規参入者が最初の足場を見つけにくい",
  ], { fontSize: 14 }), {
    x: MARGIN_X + 0.2, y: COL_Y + 0.65, w: COL_W - 0.2, h: 3.5, valign: "top",
  });

  // 右: ゴール
  const RIGHT_X = MARGIN_X + COL_W + 0.4;
  s.addShape(pres.shapes.RECTANGLE, {
    x: RIGHT_X, y: COL_Y, w: COL_W, h: 0.45,
    fill: { color: ACCENT }, line: { color: ACCENT },
  });
  s.addText("PoC のゴール", {
    x: RIGHT_X, y: COL_Y, w: COL_W, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });
  s.addText(bulletItems([
    "1 箇所に集約された CPC リソース",
    "EN / JA のバイリンガル提供",
    "新着論文を継続的にキャプチャ",
    "コミュニティ駆動 (OSS、Markdown 一次)",
    "「最小構成で全体が動く」ことを実証する",
  ], { fontSize: 14 }), {
    x: RIGHT_X + 0.2, y: COL_Y + 0.65, w: COL_W - 0.2, h: 3.5, valign: "top",
  });
}

// =============================================================================
// SLIDE 5: PoC スコープ (やる / やらない)
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§1  PoC のスコープ", 5);

  const COL_Y = 1.15;
  const COL_W = 4.4;

  // 左: やること
  s.addShape(pres.shapes.RECTANGLE, {
    x: MARGIN_X, y: COL_Y, w: COL_W, h: 0.45,
    fill: { color: ACCENT }, line: { color: ACCENT },
  });
  s.addText("✓ やること", {
    x: MARGIN_X, y: COL_Y, w: COL_W, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });
  s.addText(bulletItems([
    "論文 / ラボ / イベントの一覧 + 詳細ページ",
    "EN / JA 両言語切替",
    "クライアントサイド全文検索",
    "arxiv 新着の自動発見 → GitHub Issue 化",
    "Notion DB → Markdown 同期",
    "X 共有ボタン",
    "X / Bluesky への半自動投稿 (草稿生成)",
  ], { fontSize: 13 }), {
    x: MARGIN_X + 0.2, y: COL_Y + 0.65, w: COL_W - 0.2, h: 4.0, valign: "top",
  });

  // 右: やらないこと
  const RIGHT_X = MARGIN_X + COL_W + 0.4;
  s.addShape(pres.shapes.RECTANGLE, {
    x: RIGHT_X, y: COL_Y, w: COL_W, h: 0.45,
    fill: { color: ACCENT_RED }, line: { color: ACCENT_RED },
  });
  s.addText("✗ やらないこと  (PoC スコープ外)", {
    x: RIGHT_X, y: COL_Y, w: COL_W, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });
  s.addText(bulletItems([
    "認証・ユーザー管理",
    "全文翻訳の自動化",
    "カスタムビジュアルデザイン",
    "アクセス解析・SEO 最適化",
    "自動テスト",
    "ニュースレター / X の完全自動配信",
    "実コンテンツの大量投入 (Phase 後半)",
  ], { fontSize: 13 }), {
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
    ["レイヤー", "採用技術", "選定理由"],
    ["サイト",       "Astro 5 (SSG) + Tailwind CSS 3", "高速・SEO 良・i18n 標準対応"],
    ["コンテンツ",   "Markdown + Astro Content Collections (glob loader)", "ベンダーロックなし、git 管理"],
    ["i18n",         "Astro 標準 i18n (en / ja)",        "prefixDefaultLocale で両言語明示"],
    ["編集 UI",      "Notion DB → sync スクリプト",       "編集摩擦最小、multi-select で typed"],
    ["ホスティング", "Vercel (無料枠)",                   "Astro 公式 preset、ゼロ設定で自動デプロイ"],
    ["自動化",       "Python 3.11 + GitHub Actions cron", "Issue / コミット を Action に集約"],
    ["検索",         "クライアントサイド全文検索 (PoC)",   "<100 件は十分。後で Pagefind に置換"],
  ];

  const tableRows = rows.map((row, ri) =>
    row.map((cell) => ({
      text: cell,
      options: {
        fontSize: ri === 0 ? 11 : 11,
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
    x: MARGIN_X, y: 1.15, w: SLIDE_W - MARGIN_X * 2,
    colW: [1.5, 3.5, 3.8],
    rowH: 0.45,
    border: { type: "solid", pt: 0.5, color: "DDDDDD" },
  });
}

// =============================================================================
// SLIDE 7: §3 データモデル
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§3  データモデル ─ 3 つの Content Collection", 7);

  s.addText(
    "英語が一次データ、日本語は補助フィールド (summary_ja / name_ja / description_ja)。"
    + "全フィールドが Zod スキーマで型検証される。",
    {
      x: MARGIN_X, y: 1.05, w: SLIDE_W - MARGIN_X * 2, h: 0.4,
      fontSize: 12, fontFace: FONT, color: MUTED, italic: true,
    }
  );

  const COL_W = 2.85;
  const COL_Y = 1.6;
  const COL_H = 3.6;
  const positions = [
    { x: 0.5,  title: "papers", subtitle: "論文" },
    { x: 3.55, title: "labs",   subtitle: "研究室" },
    { x: 6.6,  title: "events", subtitle: "イベント" },
  ];

  const fields = {
    papers: [
      "title", "authors[]", "year", "venue",
      "arxiv_id?", "doi?", "url", "abstract_en",
      "summary_ja?", "schools[] ★", "methods[]?",
      "date_added", "contributor?", "featured",
    ],
    labs: [
      "name_en", "name_ja?", "pi", "institution",
      "country", "homepage", "description_en",
      "description_ja?", "focus_areas[]", "date_added",
    ],
    events: [
      "title_en", "title_ja?", "type ★", "date_start",
      "date_end", "language ★", "location", "url",
      "description_en", "description_ja?", "date_added",
    ],
  };

  positions.forEach((p) => {
    // Header
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: p.x, y: COL_Y, w: COL_W, h: 0.55,
      fill: { color: ACCENT },
      line: { color: ACCENT },
      rectRadius: 0.06,
    });
    s.addText([
      { text: p.title + "\n", options: { fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF", breakLine: true } },
      { text: p.subtitle, options: { fontSize: 10, fontFace: FONT, color: "E8EEF7" } },
    ], {
      x: p.x, y: COL_Y, w: COL_W, h: 0.55,
      align: "center", valign: "middle",
    });

    // Field box
    s.addShape(pres.shapes.RECTANGLE, {
      x: p.x, y: COL_Y + 0.55, w: COL_W, h: COL_H,
      fill: { color: "FAFAFA" }, line: { color: "DDDDDD", pt: 0.5 },
    });

    const fieldList = fields[p.title];
    s.addText(fieldList.map((f, i) => ({
      text: f,
      options: {
        fontSize: 11, fontFace: "Menlo",
        color: f.includes("★") ? ACCENT_RED : INK,
        breakLine: i < fieldList.length - 1,
        paraSpaceAfter: 4,
      },
    })), {
      x: p.x + 0.2, y: COL_Y + 0.7, w: COL_W - 0.4, h: COL_H - 0.3, valign: "top",
    });
  });

  // legend
  s.addText("?  = optional      ★ = enum 制約 (Zod で固定)", {
    x: MARGIN_X, y: COL_Y + COL_H + 0.7, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
    fontSize: 10, fontFace: FONT, color: MUTED, italic: true, align: "center",
  });
}

// =============================================================================
// SLIDE 8: §4 サイト構造と i18n
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§4  サイト構造と i18n", 8);

  // URL tree on left
  const treeLines = [
    "/                        → /en/ にリダイレクト",
    "/en/                     トップ (英語)",
    "  /en/papers/            一覧",
    "  /en/papers/{slug}/     詳細",
    "  /en/labs/              一覧",
    "  /en/labs/{slug}/       詳細",
    "  /en/events/            一覧 (Upcoming / Past)",
    "  /en/events/{slug}/     詳細",
    "  /en/search/            全文検索",
    "/ja/  ...                同じ構造で日本語版",
  ];

  s.addText("URL 構造", {
    x: MARGIN_X, y: 1.1, w: 5.5, h: 0.35,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
  });

  s.addText(treeLines.map((line, i) => ({
    text: line,
    options: {
      fontSize: 11, fontFace: "Menlo", color: INK,
      breakLine: i < treeLines.length - 1, paraSpaceAfter: 3,
    },
  })), {
    x: MARGIN_X + 0.1, y: 1.5, w: 5.5, h: 3.2, valign: "top",
  });

  // i18n strategy on right
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
    "ヘッダー右の EN / JA で同パスの別言語版に飛ぶ",
  ], { fontSize: 12, paraSpaceAfter: 6 }), {
    x: RIGHT_X, y: 1.5, w: 3.2, h: 3.2, valign: "top",
  });
}

// =============================================================================
// SLIDE 9: §4 検索と共有機能
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§4  検索と共有", 9);

  // Left: search
  s.addText("全文検索 (PoC)", {
    x: MARGIN_X, y: 1.1, w: 4.4, h: 0.35,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
  });
  s.addText(bulletItems([
    "クライアントサイド substring 一致",
    "対象: タイトル / 著者 / タグ / 要約 / 場所など",
    "Type フィルター (All / Papers / Labs / Events)",
    "?q= 付き URL で共有 / ブックマーク可能",
    "日本語も substring で動作",
    "100 件超えたら Pagefind に置換予定",
  ], { fontSize: 12, paraSpaceAfter: 6 }), {
    x: MARGIN_X, y: 1.5, w: 4.4, h: 3.5, valign: "top",
  });

  // Right: share
  const RIGHT_X = 5.4;
  s.addText("共有ボタン (詳細ページ)", {
    x: RIGHT_X, y: 1.1, w: 4.0, h: 0.35,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
  });
  s.addText(bulletItems([
    "X (twitter intent URL)",
    "Bluesky (compose intent URL)",
    "リンクをコピー (Clipboard API + フォールバック)",
    "認証不要 / バックエンド不要",
    "プリフィル文: タイトル + 著者 + 年 + via @cpchub",
  ], { fontSize: 12, paraSpaceAfter: 6 }), {
    x: RIGHT_X, y: 1.5, w: 4.2, h: 3.5, valign: "top",
  });

  s.addText(
    "→ 訪問者起点の拡散 (共有ボタン) と運営起点の拡散 (X 自動投稿) を分離",
    {
      x: MARGIN_X, y: 5.0, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
      fontSize: 12, fontFace: FONT, color: ACCENT, italic: true, align: "center",
    }
  );
}

// =============================================================================
// SLIDE 10: §5 コンテンツフロー
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§5  コンテンツフロー", 10);

  s.addText("3 系統の入力 → 単一の Markdown ストア → Astro でレンダリング", {
    x: MARGIN_X, y: 1.0, w: SLIDE_W - MARGIN_X * 2, h: 0.4,
    fontSize: 13, fontFace: FONT, color: MUTED, italic: true,
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
      fontSize: 11, fontFace: FONT, color: INK, align: "center", valign: "middle",
    });
  };

  const drawMidBox = (y, label, color) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: MID_X, y, w: MID_W, h: ROW_H,
      fill: { color }, line: { color },
    });
    s.addText(label, {
      x: MID_X, y, w: MID_W, h: ROW_H,
      fontSize: 10, fontFace: FONT, color: "FFFFFF", bold: true,
      align: "center", valign: "middle",
    });
  };

  const drawArrow = (fromX, fromY, toX, toY) => {
    s.addShape(pres.shapes.LINE, {
      x: fromX, y: fromY, w: toX - fromX, h: toY - fromY,
      line: { color: MUTED, width: 1.25, endArrowType: "arrow" },
    });
  };

  // Row 1: Notion DB → notion_sync.py → content/*.md
  drawSourceBox(ROW_Y[0], "Notion DB\n(編集者が日常的に追加)", ACCENT);
  drawMidBox(ROW_Y[0], "notion_sync.py\n(GitHub Actions cron)", ACCENT);

  // Row 2: arxiv_monitor → GitHub Issue → 人がレビュー
  drawSourceBox(ROW_Y[1], "arXiv API\n(自動キャプチャ)", "888888");
  drawMidBox(ROW_Y[1], "arxiv_monitor.py\n→ Issue 起票 → 人レビュー", "888888");

  // Row 3: Issue Form → Auto PR → マージ
  drawSourceBox(ROW_Y[2], "Issue Form\n(外部貢献者)", "888888");
  drawMidBox(ROW_Y[2], "Auto PR\n→ レビュー → マージ", "888888");

  // arrows: source → mid
  for (let i = 0; i < 3; i++) {
    drawArrow(SRC_X + SRC_W, ROW_Y[i] + ROW_H / 2, MID_X, ROW_Y[i] + ROW_H / 2);
  }

  // Single big "content/*.md" box on the right spanning 3 rows
  const DEST_Y = ROW_Y[0];
  const DEST_H = ROW_Y[2] + ROW_H - DEST_Y;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: DST_X, y: DEST_Y, w: DST_W, h: DEST_H,
    fill: { color: ACCENT }, line: { color: ACCENT }, rectRadius: 0.06,
  });
  s.addText([
    { text: "content/*.md\n", options: { fontSize: 14, bold: true, color: "FFFFFF", fontFace: FONT, breakLine: true } },
    { text: "(一次データ)\n\n", options: { fontSize: 10, color: "E8EEF7", italic: true, fontFace: FONT, breakLine: true } },
    { text: "→ Astro build\n→ Vercel deploy", options: { fontSize: 11, color: "E8EEF7", fontFace: FONT } },
  ], {
    x: DST_X, y: DEST_Y, w: DST_W, h: DEST_H,
    align: "center", valign: "middle",
  });

  // arrows: mid → content
  for (let i = 0; i < 3; i++) {
    drawArrow(MID_X + MID_W, ROW_Y[i] + ROW_H / 2, DST_X, ROW_Y[1] + ROW_H / 2);
  }

  s.addText(
    "Notion を主軸とした人手投入。arxiv 自動発見と Issue Form は補助系統。",
    {
      x: MARGIN_X, y: 4.55, w: SLIDE_W - MARGIN_X * 2, h: 0.3,
      fontSize: 11, fontFace: FONT, color: ACCENT, italic: true, align: "center",
    }
  );
}

// =============================================================================
// SLIDE 11: §6 自動化と承認モデル
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "§6  自動化と承認モデル", 11);

  // Top: 4 scripts table
  const rows = [
    [
      { text: "スクリプト", options: { fontSize: 11, bold: true, color: "FFFFFF", fontFace: FONT, fill: { color: ACCENT }, align: "left", valign: "middle" } },
      { text: "頻度", options: { fontSize: 11, bold: true, color: "FFFFFF", fontFace: FONT, fill: { color: ACCENT }, align: "left", valign: "middle" } },
      { text: "出力", options: { fontSize: 11, bold: true, color: "FFFFFF", fontFace: FONT, fill: { color: ACCENT }, align: "left", valign: "middle" } },
      { text: "承認", options: { fontSize: 11, bold: true, color: "FFFFFF", fontFace: FONT, fill: { color: ACCENT }, align: "left", valign: "middle" } },
    ],
    ["arxiv_monitor.py", "日次 cron", "GitHub Issue", "人レビュー → 採否"],
    ["link_checker.py", "週次 cron", "GitHub Issue", "メンテナで対応"],
    ["newsletter_draft.py", "月次 manual", "drafts/newsletter/*.md", "編集者が編集後配信"],
    ["x_post.py", "週次 cron", "草稿 + (承認後) X 投稿", "Issue で人が ✓ → 投稿"],
    ["notion_sync.py", "日次 cron", "content/*.md", "Notion 側 Status=Published"],
  ];

  const tableRows = rows.map((row, ri) => {
    if (ri === 0) return row;
    return row.map((cell) => ({
      text: cell,
      options: {
        fontSize: 11, fontFace: ri === 1 ? "Menlo" : FONT, color: INK,
        fill: { color: ri % 2 === 0 ? "F8F8F8" : "FFFFFF" },
        align: "left", valign: "middle",
      },
    }));
  });

  s.addTable(tableRows, {
    x: MARGIN_X, y: 1.1, w: SLIDE_W - MARGIN_X * 2,
    colW: [2.5, 1.6, 2.4, 2.3],
    rowH: 0.4,
    border: { type: "solid", pt: 0.5, color: "DDDDDD" },
  });

  // Bottom: 承認フローの原則
  s.addText("承認モデル: ヒューマン・イン・ザ・ループ", {
    x: MARGIN_X, y: 4.05, w: SLIDE_W - MARGIN_X * 2, h: 0.35,
    fontSize: 13, fontFace: FONT, bold: true, color: INK,
  });
  s.addText(bulletItems([
    "完全自動化は採用しない (誤情報リスク)",
    "発見 / 草稿生成は自動、最終発信は人が承認",
    "承認 UI は GitHub Issue / Notion Status / Discord リアクション",
  ], { fontSize: 12, paraSpaceAfter: 4 }), {
    x: MARGIN_X + 0.1, y: 4.4, w: SLIDE_W - MARGIN_X * 2, h: 1.0, valign: "top",
  });
}

// =============================================================================
// SLIDE 12: Take-home Message
// =============================================================================
{
  const s = pres.addSlide();
  addPageHeader(s, "Take-home Message", 12);

  const messages = [
    "Markdown を一次データに据え、複数の入力源と複数の出力先をつなぐ「ハブ構造」を最小実装",
    "英語一次 + 日本語補助 + フォールバック表示で、執筆コストを抑えつつバイリンガル化",
    "Notion 編集 + arxiv 自動発見 + 半自動 X 投稿で、研究者の発見 → 共有のサイクルを短縮",
    "PoC スコープを明示し、認証 / 検索高度化 / 全文翻訳などは段階的に追加する設計",
  ];

  const items = messages.map((msg, i) => ({
    text: `${i + 1}.  ${msg}`,
    options: {
      fontSize: 16, fontFace: FONT, color: INK,
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

  // Section A: 学術的背景 (CPC paper)
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

  // Section B: 技術リソース
  s.addText("技術リソース", {
    x: MARGIN_X, y: 2.6, w: SLIDE_W - MARGIN_X * 2, h: 0.35,
    fontSize: 13, fontFace: FONT, bold: true, color: INK,
  });

  const techLinks = [
    "Astro 5 — https://docs.astro.build/",
    "Astro Content Collections (glob loader) — https://docs.astro.build/en/guides/content-collections/",
    "Tailwind CSS 3 — https://tailwindcss.com/docs",
    "Notion API — https://developers.notion.com/",
    "arXiv API — https://info.arxiv.org/help/api/",
    "Pagefind (将来の検索) — https://pagefind.app/",
    "Vercel — https://vercel.com/docs/frameworks/astro",
  ];

  s.addText(techLinks.map((line, i) => ({
    text: line,
    options: {
      fontSize: 11, fontFace: FONT, color: INK,
      breakLine: i < techLinks.length - 1, paraSpaceAfter: 4,
    },
  })), {
    x: MARGIN_X + 0.2, y: 3.0, w: SLIDE_W - MARGIN_X * 2 - 0.2, h: 2.2, valign: "top",
  });

  // Footer
  s.addText("プロジェクト設計書: DESIGN.md (リポジトリ root)", {
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
