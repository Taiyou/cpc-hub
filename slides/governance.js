// symbol-emergence hub 運営体制の提案スライド
// 生成: node governance.js  →  CPC-Hub-運営体制.pptx
import PptxGenJS from "pptxgenjs";

const pres = new PptxGenJS();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inch
pres.defineLayout({ name: "WIDE16", width: 13.33, height: 7.5 });
pres.layout = "WIDE16";

const FONT = "Meiryo";
const INK = "333333";
const SUB = "666666";
const MUTED = "888888";
const ACCENT = "2B579A";
const ACCENT_LIGHT = "E8EEF7";
const ACCENT_DARK = "1F3F73";
const RED = "C0392B";

const W = 13.33;
const H = 7.5;

const slideTitle = (slide, title) => {
  slide.background = { color: "FFFFFF" };
  slide.addText(title, {
    x: 0.6, y: 0.35, w: W - 1.2, h: 0.7,
    fontSize: 28, fontFace: FONT, bold: true, color: INK, margin: 0,
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.6, y: 1.05, w: W - 1.2, h: 0,
    line: { color: ACCENT, width: 2 },
  });
};

const slideNumber = (slide, n) => {
  slide.addText(String(n), {
    x: W - 0.9, y: H - 0.5, w: 0.5, h: 0.3,
    fontSize: 10, fontFace: FONT, color: "AAAAAA", align: "right",
  });
};

// =====================================================
// Slide 1: タイトル
// =====================================================
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  s.addText("symbol-emergence hub 運営体制の提案", {
    x: 0.6, y: 2.4, w: W - 1.2, h: 1.0,
    fontSize: 40, fontFace: FONT, bold: true, color: INK, align: "center",
  });

  s.addText("持続的な情報集約のための 3 層構造", {
    x: 0.6, y: 3.5, w: W - 1.2, h: 0.6,
    fontSize: 22, fontFace: FONT, color: SUB, align: "center",
  });

  s.addShape(pres.shapes.LINE, {
    x: 4.2, y: 4.3, w: 4.9, h: 0,
    line: { color: ACCENT, width: 2 },
  });

  s.addText("symbol-emergence hub Maintainers", {
    x: 0.6, y: 4.6, w: W - 1.2, h: 0.4,
    fontSize: 14, fontFace: FONT, color: MUTED, align: "center",
  });

  s.addText("2026 年 5 月", {
    x: 0.6, y: 5.0, w: W - 1.2, h: 0.4,
    fontSize: 14, fontFace: FONT, color: MUTED, align: "center",
  });
}

// =====================================================
// Slide 2: 目次
// =====================================================
{
  const s = pres.addSlide();
  slideTitle(s, "目次");

  const sections = [
    "1.  目的とビジョン",
    "2.  全体構造の考え方",
    "3.  Tier 1：技術リード（コアチーム）",
    "4.  Tier 2：運用担当（有償）",
    "5.  Tier 3：貢献ボランティア",
    "6.  ツール・権限のマッピング",
    "7.  育成と昇格のパス",
    "8.  次のステップ（3 ヶ月ロードマップ）",
  ];

  const items = sections.map((sec, i) => ({
    text: sec,
    options: {
      fontSize: 18, fontFace: FONT, color: INK,
      breakLine: i < sections.length - 1,
      paraSpaceAfter: 12,
    },
  }));

  s.addText(items, {
    x: 1.2, y: 1.5, w: W - 2.4, h: 5.5, valign: "top",
  });

  slideNumber(s, 2);
}

// =====================================================
// Slide 3: 全体俯瞰（ピラミッド図）
// =====================================================
{
  const s = pres.addSlide();
  slideTitle(s, "全体俯瞰：3 層構造");

  // ピラミッドの座標
  // 中心 X = 6.66、頂点 Y = 1.4、底辺 Y = 6.0
  const CX = 6.66;
  const APEX_Y = 1.4;
  const BASE_Y = 6.0;

  // Tier 1: 上層（細い）
  const t1Top = APEX_Y;
  const t1Bot = 2.8;
  const t1TopW = 1.6;
  const t1BotW = 3.2;
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, {
    x: CX - t1BotW / 2, y: t1Top, w: t1BotW, h: t1Bot - t1Top,
    points: [
      { x: (t1BotW - t1TopW) / 2, y: 0 },
      { x: t1BotW - (t1BotW - t1TopW) / 2, y: 0 },
      { x: t1BotW, y: t1Bot - t1Top },
      { x: 0, y: t1Bot - t1Top },
      { x: (t1BotW - t1TopW) / 2, y: 0, close: true },
    ],
    fill: { color: ACCENT_DARK },
    line: { color: "FFFFFF", width: 1.5 },
  });
  s.addText("Tier 1\n技術リード", {
    x: CX - t1BotW / 2, y: t1Top, w: t1BotW, h: t1Bot - t1Top,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });

  // Tier 2: 中層
  const t2Top = 2.8;
  const t2Bot = 4.4;
  const t2TopW = 3.2;
  const t2BotW = 5.4;
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, {
    x: CX - t2BotW / 2, y: t2Top, w: t2BotW, h: t2Bot - t2Top,
    points: [
      { x: (t2BotW - t2TopW) / 2, y: 0 },
      { x: t2BotW - (t2BotW - t2TopW) / 2, y: 0 },
      { x: t2BotW, y: t2Bot - t2Top },
      { x: 0, y: t2Bot - t2Top },
      { x: (t2BotW - t2TopW) / 2, y: 0, close: true },
    ],
    fill: { color: ACCENT },
    line: { color: "FFFFFF", width: 1.5 },
  });
  s.addText("Tier 2\n運用担当（有償）", {
    x: CX - t2BotW / 2, y: t2Top, w: t2BotW, h: t2Bot - t2Top,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });

  // Tier 3: 底辺（広い）
  const t3Top = 4.4;
  const t3Bot = BASE_Y;
  const t3TopW = 5.4;
  const t3BotW = 8.0;
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, {
    x: CX - t3BotW / 2, y: t3Top, w: t3BotW, h: t3Bot - t3Top,
    points: [
      { x: (t3BotW - t3TopW) / 2, y: 0 },
      { x: t3BotW - (t3BotW - t3TopW) / 2, y: 0 },
      { x: t3BotW, y: t3Bot - t3Top },
      { x: 0, y: t3Bot - t3Top },
      { x: (t3BotW - t3TopW) / 2, y: 0, close: true },
    ],
    fill: { color: "7A9BC8" },
    line: { color: "FFFFFF", width: 1.5 },
  });
  s.addText("Tier 3\n貢献ボランティア", {
    x: CX - t3BotW / 2, y: t3Top, w: t3BotW, h: t3Bot - t3Top,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF",
    align: "center", valign: "middle",
  });

  // 左軸：信頼度・技術スキル
  s.addShape(pres.shapes.LINE, {
    x: CX - t3BotW / 2 - 0.4, y: APEX_Y, w: 0, h: BASE_Y - APEX_Y,
    line: { color: SUB, width: 1, endArrowType: "arrow" },
  });
  s.addText("信頼度・技術スキル", {
    x: CX - t3BotW / 2 - 2.7, y: (APEX_Y + BASE_Y) / 2 - 0.2, w: 2.2, h: 0.4,
    fontSize: 11, fontFace: FONT, color: SUB, align: "right", valign: "middle",
  });
  s.addText("高", {
    x: CX - t3BotW / 2 - 0.85, y: APEX_Y - 0.1, w: 0.4, h: 0.3,
    fontSize: 10, fontFace: FONT, color: SUB, align: "right",
  });
  s.addText("低", {
    x: CX - t3BotW / 2 - 0.85, y: BASE_Y - 0.1, w: 0.4, h: 0.3,
    fontSize: 10, fontFace: FONT, color: SUB, align: "right",
  });

  // 右軸：人数・関与の広さ
  s.addShape(pres.shapes.LINE, {
    x: CX + t3BotW / 2 + 0.4, y: APEX_Y, w: 0, h: BASE_Y - APEX_Y,
    line: { color: SUB, width: 1, beginArrowType: "arrow" },
  });
  s.addText("人数・関与の広さ", {
    x: CX + t3BotW / 2 + 0.5, y: (APEX_Y + BASE_Y) / 2 - 0.2, w: 2.4, h: 0.4,
    fontSize: 11, fontFace: FONT, color: SUB, align: "left", valign: "middle",
  });

  // 右側に各層の人数目安
  s.addText("2–3 名", {
    x: CX + t1BotW / 2 + 0.3, y: (t1Top + t1Bot) / 2 - 0.2, w: 1.5, h: 0.4,
    fontSize: 11, fontFace: FONT, color: ACCENT_DARK, bold: true, valign: "middle",
  });
  s.addText("数名（有償）", {
    x: CX + t2BotW / 2 + 0.3, y: (t2Top + t2Bot) / 2 - 0.2, w: 1.8, h: 0.4,
    fontSize: 11, fontFace: FONT, color: ACCENT, bold: true, valign: "middle",
  });
  s.addText("オープン", {
    x: CX + t3BotW / 2 + 0.3, y: (t3Top + t3Bot) / 2 - 0.2, w: 1.8, h: 0.4,
    fontSize: 11, fontFace: FONT, color: "5A7AAA", bold: true, valign: "middle",
  });

  // 図の下にメッセージ
  s.addText("信頼度・技術スキルが上に行くほど高く、人数は下に行くほど多い 3 層構造。", {
    x: 0.6, y: BASE_Y + 0.3, w: W - 1.2, h: 0.5,
    fontSize: 14, fontFace: FONT, color: SUB, align: "center", italic: true,
  });
  s.addText("各層は独立せず、Tier 3 → 2 → 1 への昇格パスを設けて持続性を担保する。", {
    x: 0.6, y: BASE_Y + 0.85, w: W - 1.2, h: 0.5,
    fontSize: 14, fontFace: FONT, color: SUB, align: "center", italic: true,
  });

  slideNumber(s, 3);
}

// =====================================================
// Slide 4: 1. 目的とビジョン
// =====================================================
{
  const s = pres.addSlide();
  slideTitle(s, "1.  目的とビジョン");

  s.addText("symbol-emergence hub に情報を集約し、研究コミュニティの「最初の入口」になる。", {
    x: 0.6, y: 1.35, w: W - 1.2, h: 0.6,
    fontSize: 20, fontFace: FONT, bold: true, color: ACCENT_DARK,
  });

  const pillars = [
    {
      title: "なぜ",
      body: "Collective Predictive Coding の関連情報が SNS・論文・動画に分散している。集約と日英双方向のキュレーションで、研究者・学生・実務家の探索コストを下げる。",
    },
    {
      title: "誰のために",
      body: "国内外の研究者、学際的に関心を持つ大学院生・学部生、産業界の応用研究者、報道・教育関係者。",
    },
    {
      title: "何を目指す",
      body: "更新が止まらないこと。1 人に依存せず、複数の役割が噛み合って自走するエコシステムを作る。",
    },
  ];

  const COL_W = (W - 1.6) / 3;
  pillars.forEach((p, i) => {
    const px = 0.6 + i * (COL_W + 0.2);
    s.addShape(pres.shapes.RECTANGLE, {
      x: px, y: 2.2, w: COL_W, h: 0.55,
      fill: { color: ACCENT }, line: { color: ACCENT },
    });
    s.addText(p.title, {
      x: px, y: 2.2, w: COL_W, h: 0.55,
      fontSize: 16, fontFace: FONT, bold: true, color: "FFFFFF", align: "center", valign: "middle",
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: px, y: 2.75, w: COL_W, h: 3.8,
      fill: { color: ACCENT_LIGHT }, line: { color: ACCENT_LIGHT },
    });
    s.addText(p.body, {
      x: px + 0.25, y: 2.95, w: COL_W - 0.5, h: 3.4,
      fontSize: 14, fontFace: FONT, color: INK, valign: "top",
      paraSpaceAfter: 6,
    });
  });

  slideNumber(s, 4);
}

// =====================================================
// Slide 5: 2. 全体構造の考え方
// =====================================================
{
  const s = pres.addSlide();
  slideTitle(s, "2.  全体構造の考え方");

  s.addText("3 つの軸でメンバーを区別する。",  {
    x: 0.6, y: 1.35, w: W - 1.2, h: 0.5,
    fontSize: 18, fontFace: FONT, color: INK,
  });

  const axes = [
    { title: "信頼度", body: "金銭・API キー・公開判断に関わる権限をどこまで委ねられるか。" },
    { title: "技術スキル", body: "Git / Markdown / API / Notion など、運用に必要な技術的素養。" },
    { title: "関与度", body: "週あたりにかけられる時間と継続性。短期スポットか、継続関与か。" },
  ];
  const AX_W = (W - 1.6) / 3;
  axes.forEach((a, i) => {
    const px = 0.6 + i * (AX_W + 0.2);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: px, y: 2.0, w: AX_W, h: 1.6,
      fill: { color: "FFFFFF" }, line: { color: ACCENT, width: 1.5 }, rectRadius: 0.08,
    });
    s.addText(a.title, {
      x: px, y: 2.1, w: AX_W, h: 0.5,
      fontSize: 16, fontFace: FONT, bold: true, color: ACCENT_DARK, align: "center",
    });
    s.addText(a.body, {
      x: px + 0.2, y: 2.65, w: AX_W - 0.4, h: 0.85,
      fontSize: 12, fontFace: FONT, color: INK, align: "left", valign: "top",
    });
  });

  s.addText("この 3 軸で分けることで、無理な権限委譲を避けつつ、多様な人が参加できる設計にする。", {
    x: 0.6, y: 3.85, w: W - 1.2, h: 0.5,
    fontSize: 13, fontFace: FONT, color: SUB, italic: true,
  });

  // 図：3 軸 → 3 層へのマッピング
  const mapY = 4.6;
  s.addText("具体的なマッピング", {
    x: 0.6, y: mapY, w: W - 1.2, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true, color: INK,
  });

  const rows = [
    { tier: "Tier 1", trust: "全権", skill: "高（コード書ける）", commit: "継続・コア", color: ACCENT_DARK },
    { tier: "Tier 2", trust: "重要運用", skill: "中（設定操作）", commit: "週数回・有償", color: ACCENT },
    { tier: "Tier 3", trust: "限定", skill: "不要", commit: "スポット OK", color: "7A9BC8" },
  ];
  const colXs = [0.6, 2.4, 5.6, 9.0];
  const colWs = [1.8, 3.2, 3.4, 3.0];
  const headers = ["", "信頼度", "技術スキル", "関与度"];
  headers.forEach((h, i) => {
    s.addText(h, {
      x: colXs[i], y: mapY + 0.45, w: colWs[i], h: 0.35,
      fontSize: 12, fontFace: FONT, bold: true, color: SUB,
    });
  });
  rows.forEach((r, ri) => {
    const ry = mapY + 0.85 + ri * 0.45;
    s.addShape(pres.shapes.RECTANGLE, {
      x: colXs[0], y: ry, w: 1.6, h: 0.36,
      fill: { color: r.color }, line: { color: r.color },
    });
    s.addText(r.tier, {
      x: colXs[0], y: ry, w: 1.6, h: 0.36,
      fontSize: 12, fontFace: FONT, bold: true, color: "FFFFFF", align: "center", valign: "middle",
    });
    [r.trust, r.skill, r.commit].forEach((v, vi) => {
      s.addText(v, {
        x: colXs[vi + 1], y: ry, w: colWs[vi + 1], h: 0.36,
        fontSize: 12, fontFace: FONT, color: INK, valign: "middle",
      });
    });
  });

  slideNumber(s, 5);
}

// =====================================================
// Tier 詳細スライドの共通レイアウト
// =====================================================
const renderTierSlide = (s, opts) => {
  slideTitle(s, opts.title);

  // 左上：タグ（Tier ラベル）
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.3, w: 1.6, h: 0.45,
    fill: { color: opts.color }, line: { color: opts.color }, rectRadius: 0.08,
  });
  s.addText(opts.tierLabel, {
    x: 0.6, y: 1.3, w: 1.6, h: 0.45,
    fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF", align: "center", valign: "middle",
  });

  // 一文要約
  s.addText(opts.summary, {
    x: 2.4, y: 1.3, w: W - 3.0, h: 0.45,
    fontSize: 16, fontFace: FONT, color: INK, valign: "middle",
  });

  // 4 つのブロック：役割 / 想定人材 / 必要スキル / 具体例
  const blocks = [
    { title: "主な役割", items: opts.role },
    { title: "想定する人材", items: opts.persona },
    { title: "必要スキル / 環境", items: opts.skills },
    { title: "具体的なタスク例", items: opts.examples },
  ];

  const blockTopY = 2.05;
  const blockH = 2.4;
  const colW = (W - 1.6) / 2;

  blocks.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = 0.6 + col * (colW + 0.2);
    const by = blockTopY + row * (blockH + 0.25);

    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: by, w: colW, h: 0.45,
      fill: { color: opts.color }, line: { color: opts.color },
    });
    s.addText(b.title, {
      x: bx + 0.2, y: by, w: colW - 0.2, h: 0.45,
      fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF", valign: "middle",
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: by + 0.45, w: colW, h: blockH - 0.45,
      fill: { color: "FAFAFA" }, line: { color: "DDDDDD", width: 0.75 },
    });
    const text = b.items.map((it, idx) => ({
      text: "・ " + it,
      options: {
        fontSize: 12, fontFace: FONT, color: INK,
        breakLine: idx < b.items.length - 1,
        paraSpaceAfter: 4,
      },
    }));
    s.addText(text, {
      x: bx + 0.25, y: by + 0.55, w: colW - 0.5, h: blockH - 0.6,
      valign: "top",
    });
  });
};

// =====================================================
// Slide 6: Tier 1 — 技術リード（コアチーム）
// =====================================================
{
  const s = pres.addSlide();
  renderTierSlide(s, {
    title: "3.  Tier 1：技術リード（コアチーム）",
    tierLabel: "Tier 1",
    color: ACCENT_DARK,
    summary: "サイト全体の設計・技術・運営方針に責任を持つ 2〜3 名の信頼チーム。",
    role: [
      "サイトのアーキテクチャと方針決定",
      "API キー / 支払い / 公開判断の最終責任",
      "Tier 2 のオンボーディング・サポート",
      "コードレビュー・リリース判断",
    ],
    persona: [
      "運営の中心となる信頼できるメンバー",
      "技術が分かる（フルスタック or インフラ寄り）",
      "長期的にコミットできる人",
      "想定：プロジェクト発起人・主要研究者",
    ],
    skills: [
      "Git / GitHub（書き込み・レビュー）",
      "Astro / TypeScript の編集ができる",
      "Notion / launchd / cron などの管理",
      "Google Cloud / 各種 API キー管理",
    ],
    examples: [
      "新しいコレクション（記事・動画）の追加",
      "ホームのレイアウト・デザイン変更",
      "API クォータ・支払いの監視",
      "セキュリティ対応（漏洩キー無効化など）",
    ],
  });
  slideNumber(s, 6);
}

// =====================================================
// Slide 7: Tier 2 — 運用担当（有償）
// =====================================================
{
  const s = pres.addSlide();
  renderTierSlide(s, {
    title: "4.  Tier 2：運用担当（有償）",
    tierLabel: "Tier 2",
    color: ACCENT,
    summary: "定常運用と重要な編集判断を担う。学生バイト・秘書・委託メンバーを想定。",
    role: [
      "論文の解説執筆・要約レビュー",
      "記事の公開・カテゴライズ",
      "YouTube 検索キーワードの調整",
      "支払い・経費の入力補助",
      "Tier 3 から提出された内容の検収",
    ],
    persona: [
      "アルバイト代が出る学生・秘書・委託",
      "週数時間から関与できる",
      "Notion の基本操作ができる",
      "将来的に Tier 1 候補を育てる枠",
    ],
    skills: [
      "Notion ページ編集・テンプレート活用",
      "Markdown の基本（見出し・リンク）",
      "簡単な YAML frontmatter 編集",
      "（必須ではない）Git の pull / commit",
    ],
    examples: [
      "新しい論文を papers/ に追加（Markdown）",
      "fetch:youtube のキーワードを微調整",
      "ボランティア提出フォームの内容を確認・公開",
      "月次の活動レポートを Notion に集計",
    ],
  });
  slideNumber(s, 7);
}

// =====================================================
// Slide 8: Tier 3 — 貢献ボランティア
// =====================================================
{
  const s = pres.addSlide();
  renderTierSlide(s, {
    title: "5.  Tier 3：貢献ボランティア",
    tierLabel: "Tier 3",
    color: "7A9BC8",
    summary: "技術知識ゼロでも参加できる。フォーム経由で情報提供する広いボランティア層。",
    role: [
      "イベントの追加申請",
      "研究室の追加申請",
      "誤字・誤情報の指摘",
      "翻訳・要約のレビュー（任意）",
    ],
    persona: [
      "ボランティアで関わる学生・研究者・実務家",
      "技術知識は不要",
      "スポット参加でも歓迎",
      "コミュニティを広げる主役",
    ],
    skills: [
      "Web フォームの入力ができれば十分",
      "Notion / GitHub のアカウント不要",
      "（任意）Notion ゲスト閲覧",
      "情報源 URL を添付できると望ましい",
    ],
    examples: [
      "「次回ワークショップ」のフォーム入力",
      "新設研究室の URL を提出",
      "リンク切れの報告",
      "学会発表の事前告知",
    ],
  });
  slideNumber(s, 8);
}

// =====================================================
// Slide 9: ツール・権限のマッピング
// =====================================================
{
  const s = pres.addSlide();
  slideTitle(s, "6.  ツール・権限のマッピング");

  // ヘッダ
  const tools = [
    { name: "GitHub", note: "コード・サイト本体" },
    { name: "Notion", note: "編集・運用 DB" },
    { name: "YouTube\nAPI", note: ".env / クォータ" },
    { name: "支払い\n（カード）", note: "経費・購読" },
    { name: "公開\nフォーム", note: "ボランティア入口" },
  ];
  const tierRows = [
    { label: "Tier 1", color: ACCENT_DARK, perms: ["Admin", "Owner", "Owner", "Owner", "—"] },
    { label: "Tier 2", color: ACCENT, perms: ["Write", "Editor", "—", "Submit", "Review"] },
    { label: "Tier 3", color: "7A9BC8", perms: ["—", "Guest (read)", "—", "—", "Submit"] },
  ];

  const headerY = 1.4;
  const rowH = 0.7;
  const cellH = 0.7;
  const labelW = 1.6;
  const toolW = (W - 1.6 - labelW) / tools.length;
  const tableX = 0.6;

  // 列ヘッダ
  tools.forEach((t, i) => {
    const cx = tableX + labelW + i * toolW;
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: headerY, w: toolW - 0.05, h: 0.85,
      fill: { color: ACCENT_LIGHT }, line: { color: ACCENT_LIGHT },
    });
    s.addText(t.name, {
      x: cx, y: headerY + 0.05, w: toolW - 0.05, h: 0.4,
      fontSize: 13, fontFace: FONT, bold: true, color: ACCENT_DARK, align: "center", valign: "middle",
    });
    s.addText(t.note, {
      x: cx, y: headerY + 0.45, w: toolW - 0.05, h: 0.4,
      fontSize: 10, fontFace: FONT, color: SUB, align: "center", valign: "middle",
    });
  });

  // 行
  tierRows.forEach((r, ri) => {
    const ry = headerY + 0.95 + ri * (cellH + 0.1);
    s.addShape(pres.shapes.RECTANGLE, {
      x: tableX, y: ry, w: labelW, h: cellH,
      fill: { color: r.color }, line: { color: r.color },
    });
    s.addText(r.label, {
      x: tableX, y: ry, w: labelW, h: cellH,
      fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF", align: "center", valign: "middle",
    });
    r.perms.forEach((p, ci) => {
      const cx = tableX + labelW + ci * toolW;
      const isDash = p === "—";
      s.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: ry, w: toolW - 0.05, h: cellH,
        fill: { color: isDash ? "F7F7F7" : "FFFFFF" },
        line: { color: "DDDDDD", width: 0.75 },
      });
      s.addText(p, {
        x: cx, y: ry, w: toolW - 0.05, h: cellH,
        fontSize: 12, fontFace: FONT, color: isDash ? MUTED : INK,
        bold: !isDash, align: "center", valign: "middle",
      });
    });
  });

  // 凡例
  s.addText("Admin/Owner = 完全管理権限、Write/Editor = 編集権限、Submit = 提出のみ、Review = 検収のみ、— = 権限なし", {
    x: 0.6, y: headerY + 0.95 + tierRows.length * (cellH + 0.1) + 0.3, w: W - 1.2, h: 0.45,
    fontSize: 11, fontFace: FONT, color: SUB, italic: true,
  });

  // 補足
  s.addText("API キー・支払い情報は Tier 1 のみ。Tier 2 は重要運用、Tier 3 はフォーム経由の入口のみ。", {
    x: 0.6, y: headerY + 0.95 + tierRows.length * (cellH + 0.1) + 0.95, w: W - 1.2, h: 0.5,
    fontSize: 13, fontFace: FONT, color: INK, bold: true,
  });

  slideNumber(s, 9);
}

// =====================================================
// Slide 10: 育成と昇格のパス
// =====================================================
{
  const s = pres.addSlide();
  slideTitle(s, "7.  育成と昇格のパス");

  s.addText("関与の継続と実績を可視化し、本人の希望に応じて段階的に責任を委譲する。", {
    x: 0.6, y: 1.35, w: W - 1.2, h: 0.5,
    fontSize: 16, fontFace: FONT, color: INK,
  });

  // 3 ボックス（Tier 3 → Tier 2 → Tier 1）と矢印
  const boxY = 2.2;
  const boxH = 2.4;
  const boxW = 3.6;
  const gap = 0.7;
  const startX = (W - (boxW * 3 + gap * 2)) / 2;

  const stages = [
    {
      label: "Tier 3",
      title: "貢献ボランティア",
      color: "7A9BC8",
      criteria: [
        "フォームから 3 件以上の提出",
        "やり取りが丁寧で信頼できる",
        "継続意思がある",
      ],
      next: "→ Tier 2 候補へ",
    },
    {
      label: "Tier 2",
      title: "運用担当（有償）",
      color: ACCENT,
      criteria: [
        "Notion 編集の習熟",
        "Markdown / frontmatter が書ける",
        "重要運用を 3 ヶ月以上継続",
      ],
      next: "→ Tier 1 候補へ（任意）",
    },
    {
      label: "Tier 1",
      title: "技術リード",
      color: ACCENT_DARK,
      criteria: [
        "Git / コード変更ができる",
        "Tier 1 全員の合意",
        "中長期コミットの意思",
      ],
      next: "コアチーム",
    },
  ];

  stages.forEach((st, i) => {
    const bx = startX + i * (boxW + gap);
    // タグ
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: bx, y: boxY, w: 1.5, h: 0.45,
      fill: { color: st.color }, line: { color: st.color }, rectRadius: 0.08,
    });
    s.addText(st.label, {
      x: bx, y: boxY, w: 1.5, h: 0.45,
      fontSize: 13, fontFace: FONT, bold: true, color: "FFFFFF", align: "center", valign: "middle",
    });
    s.addText(st.title, {
      x: bx + 1.55, y: boxY, w: boxW - 1.55, h: 0.45,
      fontSize: 13, fontFace: FONT, color: INK, valign: "middle",
    });
    // 箱
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: boxY + 0.55, w: boxW, h: boxH - 0.55,
      fill: { color: "FAFAFA" }, line: { color: "DDDDDD", width: 0.75 },
    });
    s.addText("昇格の目安", {
      x: bx + 0.2, y: boxY + 0.65, w: boxW - 0.4, h: 0.3,
      fontSize: 12, fontFace: FONT, bold: true, color: SUB,
    });
    const items = st.criteria.map((c, idx) => ({
      text: "・ " + c,
      options: {
        fontSize: 12, fontFace: FONT, color: INK,
        breakLine: idx < st.criteria.length - 1,
        paraSpaceAfter: 4,
      },
    }));
    s.addText(items, {
      x: bx + 0.2, y: boxY + 1.0, w: boxW - 0.4, h: 1.2, valign: "top",
    });
    s.addText(st.next, {
      x: bx + 0.2, y: boxY + boxH - 0.5, w: boxW - 0.4, h: 0.35,
      fontSize: 12, fontFace: FONT, color: st.color, bold: true, italic: true,
    });

    // 矢印
    if (i < stages.length - 1) {
      const ax = bx + boxW + 0.1;
      s.addShape(pres.shapes.LINE, {
        x: ax, y: boxY + boxH / 2, w: gap - 0.2, h: 0,
        line: { color: SUB, width: 2, endArrowType: "arrow" },
      });
    }
  });

  s.addText("評価は半年ごとに Tier 1 で実施し、本人と相談のうえ昇格・継続を決定する。", {
    x: 0.6, y: 5.5, w: W - 1.2, h: 0.5,
    fontSize: 14, fontFace: FONT, color: INK, italic: true, align: "center",
  });

  slideNumber(s, 10);
}

// =====================================================
// Slide 11: 次のステップ（3 ヶ月ロードマップ）
// =====================================================
{
  const s = pres.addSlide();
  slideTitle(s, "8.  次のステップ（3 ヶ月ロードマップ）");

  const months = [
    {
      label: "Month 1",
      title: "基盤を固める",
      tasks: [
        "Tier 1 の 2〜3 名を確定",
        "Notion ワークスペースの整備",
        "ボランティア用フォームを公開",
        "運用ルール・予算枠を Notion に明文化",
      ],
    },
    {
      label: "Month 2",
      title: "Tier 2 を募集・オンボード",
      tasks: [
        "Tier 2 の役割記述で公募（1〜2 名）",
        "オンボーディング資料を作成",
        "論文要約のテンプレートを定義",
        "支払いフロー（請求書・領収書）を確立",
      ],
    },
    {
      label: "Month 3",
      title: "Tier 3 のチャネルを開く",
      tasks: [
        "イベント・研究室の提出フォーム告知",
        "コミュニティ向けに最初の運用報告",
        "昇格基準の試運転（半期評価）",
        "次フェーズの改善点を抽出",
      ],
    },
  ];

  const monW = (W - 1.6) / 3;
  const monY = 1.35;
  const monH = 5.0;

  months.forEach((m, i) => {
    const mx = 0.6 + i * (monW + 0.2);
    // ラベル
    s.addShape(pres.shapes.RECTANGLE, {
      x: mx, y: monY, w: monW, h: 0.55,
      fill: { color: ACCENT }, line: { color: ACCENT },
    });
    s.addText(m.label, {
      x: mx + 0.2, y: monY, w: monW - 0.4, h: 0.55,
      fontSize: 14, fontFace: FONT, bold: true, color: "FFFFFF", valign: "middle",
    });
    // タイトル
    s.addShape(pres.shapes.RECTANGLE, {
      x: mx, y: monY + 0.55, w: monW, h: 0.5,
      fill: { color: ACCENT_LIGHT }, line: { color: ACCENT_LIGHT },
    });
    s.addText(m.title, {
      x: mx + 0.2, y: monY + 0.55, w: monW - 0.4, h: 0.5,
      fontSize: 14, fontFace: FONT, bold: true, color: ACCENT_DARK, valign: "middle",
    });
    // タスク
    s.addShape(pres.shapes.RECTANGLE, {
      x: mx, y: monY + 1.05, w: monW, h: monH - 1.05,
      fill: { color: "FAFAFA" }, line: { color: "DDDDDD", width: 0.75 },
    });
    const tasks = m.tasks.map((t, idx) => ({
      text: "☐ " + t,
      options: {
        fontSize: 13, fontFace: FONT, color: INK,
        breakLine: idx < m.tasks.length - 1,
        paraSpaceAfter: 10,
      },
    }));
    s.addText(tasks, {
      x: mx + 0.25, y: monY + 1.2, w: monW - 0.5, h: monH - 1.3, valign: "top",
    });
  });

  slideNumber(s, 11);
}

// =====================================================
// Slide 12: Take-home Message
// =====================================================
{
  const s = pres.addSlide();
  slideTitle(s, "Take-home Message");

  const messages = [
    "信頼度・技術スキル・関与度の 3 軸で 3 層に分け、無理のない権限委譲と参加のしやすさを両立する。",
    "Tier 1 が全権・最終責任、Tier 2 が定常運用と編集判断（有償）、Tier 3 はフォーム経由で誰でも貢献できる入口。",
    "Tier 3 → 2 → 1 の昇格パスを設けて、サイトの持続性とコミュニティの広がりを同時に実現する。",
  ];

  const items = messages.map((m, i) => ({
    text: `${i + 1}.  ${m}`,
    options: {
      fontSize: 20, fontFace: FONT, color: INK,
      breakLine: true, paraSpaceAfter: 18,
    },
  }));

  s.addText(items, {
    x: 1.0, y: 1.6, w: W - 2.0, h: 5.0, valign: "top",
  });

  slideNumber(s, 12);
}

// =====================================================
// 書き出し
// =====================================================
pres.writeFile({ fileName: "CPC-Hub-運営体制.pptx" })
  .then((name) => console.log("Wrote:", name));
