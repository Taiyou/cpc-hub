# CPC Hub

Collective Predictive Coding（CPC・集合的予測符号化）研究のためのバイリンガル（日本語 / 英語）ハブサイト。
Astro による静的サイトで、論文・研究室・イベント・YouTube 動画を横断的にキュレーションする。

> A bilingual hub for Collective Predictive Coding research — papers, labs, events, and curated YouTube videos.

## 主な機能

- **論文 / 研究室 / イベント** — Markdown frontmatter で管理（[`content/`](content/)）
- **YouTube 動画** — `Collective Predictive Coding` / `記号創発` / `CPC仮説` を含む直近 10 件を YouTube Data API v3 から自動取得（1 時間ごと）
- **note 記事** — [note.com/symbol_emerg](https://note.com/symbol_emerg) の RSS から直近 10 件を取得（1 時間ごと）
- **クライアント全文検索** — 論文・研究室・イベント・動画・記事を横断検索
- **CPC ダイナミクス可視化** — トップページに 3 エージェント間の予測信号交換 + 創発記号の SVG アニメーション
- **完全バイリンガル** — `/ja/` と `/en/` 配下に独立したルート、言語スイッチャー付き
- **静的生成** — ビルド成果物は CDN にそのまま配置可能

## 技術スタック

- [Astro 5](https://astro.build/) — Content Collections + i18n
- [Tailwind CSS 3](https://tailwindcss.com/)
- [pnpm](https://pnpm.io/) （`npm` でも可）
- Node 18+ （fetch / ESM 利用のため）

## セットアップ

```sh
# 依存インストール
pnpm install   # または npm install

# YouTube API キーを設定
cp .env.example .env
# .env を編集して YOUTUBE_API_KEY=<your_key> を記入
```

YouTube API キーは [Google Cloud Console](https://console.cloud.google.com/) で発行し、**YouTube Data API v3** に制限を設定してください。

## 開発・ビルド

```sh
pnpm dev              # 開発サーバ http://localhost:4321
pnpm build            # 静的サイトを dist/ に生成
pnpm preview          # ビルド成果物のプレビュー
pnpm fetch:youtube    # YouTube 直近 10 件を取得して src/data/videos.json に保存
pnpm fetch:note       # note 直近 10 件を取得して src/data/notes.json に保存
pnpm fetch:all        # YouTube + note を両方取得
pnpm update:content   # fetch:all + build を一括実行
```

## 1 時間ごとの自動更新（macOS / launchd）

[`scripts/com.cpchub.fetch-youtube.plist`](scripts/com.cpchub.fetch-youtube.plist) を `~/Library/LaunchAgents/` に配置すると、1 時間おきに動画を再取得してビルドし直します。詳細は [`scripts/README.md`](scripts/README.md) を参照。

YouTube API クォータ: 3 キーワード × 100 units × 24 回/日 = 7,200 units/日（無料枠 10,000 units 内）。

## ディレクトリ構成

```
.
├── content/                    # 論文・研究室・イベントの Markdown
│   ├── papers/
│   ├── labs/
│   └── events/
├── scripts/                    # YouTube / note 取得スクリプト + launchd 設定
│   ├── fetch-youtube.mjs
│   ├── fetch-note.mjs
│   └── com.cpchub.fetch-youtube.plist
├── src/
│   ├── components/             # UI コンポーネント
│   ├── content/config.ts       # Content Collections スキーマ
│   ├── data/videos.json        # YouTube 取得結果のキャッシュ
│   ├── data/notes.json         # note 取得結果のキャッシュ
│   ├── i18n/                   # ja.json / en.json / index.ts
│   ├── pages/                  # /ja/* /en/* ルート
│   └── styles/global.css
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## コンテンツの追加

新しい論文を追加する例:

```md
---
# content/papers/my-new-paper.md
title: "Paper title"
authors: ["Author A.", "Author B."]
year: 2026
venue: "Conference"
url: "https://arxiv.org/abs/..."
abstract_en: "..."
summary_ja: "..."
schools: ["Symbol Emergence", "Active Inference"]
date_added: 2026-05-11
---
```

スキーマの完全な定義は [`src/content/config.ts`](src/content/config.ts) を参照。

## ライセンス

[CC BY-NC 4.0](LICENSE)（クリエイティブ・コモンズ 表示-非営利 4.0 国際）

- ✅ 共有・改変・再配布可能
- ✅ クレジット表示が必要
- ❌ 商用利用は不可

商用利用を希望される場合はメンテナまでご連絡ください。
