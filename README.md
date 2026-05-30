# symbol-emergence hub

Collective Predictive Coding（CPC・集合的予測符号化）研究のためのバイリンガル（日本語 / 英語）ハブサイト。
Astro による静的サイトで、論文・研究室・イベント・YouTube 動画を横断的にキュレーションする。

> A bilingual hub for Collective Predictive Coding research — papers, labs, events, and curated YouTube videos.

<img width="1056" height="1040" alt="スクリーンショット 2026-05-12 14 12 57" src="https://github.com/user-attachments/assets/22a6a98c-e476-4fd8-9aca-d890b45ae128" />


## 主な機能

- **論文 / 研究室 / イベント** — Markdown frontmatter で管理（[`content/`](content/)）
- **論文の自動収集 (arXiv → Notion → サイト)** — arXiv を定期検索し、新着論文を Notion DB に `pending` で投入。Notion 上でレビュー・要約付与した上で `approved` に切り替えると、自動的にサイトへ反映される。GitHub Actions cron で毎日自動実行（→ 詳細は [Notion 連携](#notion-連携による論文の自動収集--キュレーション)）
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

# 環境変数を設定
cp .env.example .env
# .env を編集して以下を記入:
#   YOUTUBE_API_KEY=<your_key>          ← YouTube 取得用
#   NOTION_TOKEN=<ntn_...>              ← Notion 連携用 (任意)
#   NOTION_DB_ID=<32-char hex>          ← Notion 連携用 (任意)
```

- **YouTube API キー**: [Google Cloud Console](https://console.cloud.google.com/) で発行し、**YouTube Data API v3** に制限を設定。
- **Notion トークン / DB ID**: 論文の Notion 連携を使う場合のみ必要。詳細は [Notion 連携](#notion-連携による論文の自動収集--キュレーション)。

## 開発・ビルド

```sh
pnpm dev              # 開発サーバ http://localhost:4321
pnpm build            # 静的サイトを dist/ に生成
pnpm preview          # ビルド成果物のプレビュー
pnpm fetch:youtube    # YouTube 直近 10 件を取得して src/data/videos.json に保存
pnpm fetch:note       # note 直近 10 件を取得して src/data/notes.json に保存
pnpm fetch:arxiv      # arXiv 検索 → Notion DB に新規論文を pending で投入
pnpm sync:papers      # Notion (status=approved) → content/papers/*.md を生成
pnpm papers:pipeline  # fetch:arxiv + sync:papers を順に実行
pnpm fetch:all        # YouTube + note を両方取得
pnpm update:content   # fetch:all + papers:pipeline + build を一括実行
```

## 1 時間ごとの自動更新（macOS / launchd）

[`scripts/com.cpchub.fetch-youtube.plist`](scripts/com.cpchub.fetch-youtube.plist) を `~/Library/LaunchAgents/` に配置すると、1 時間おきに動画を再取得してビルドし直します。詳細は [`scripts/README.md`](scripts/README.md) を参照。

YouTube API クォータ: 3 キーワード × 100 units × 24 回/日 = 7,200 units/日（無料枠 10,000 units 内）。

## Notion 連携による論文の自動収集 / キュレーション

論文の取得・レビュー・公開を **arXiv → Notion → サイト** の 3 層パイプラインで自動化している。

### アーキテクチャ

```
┌──────────┐   ┌─────────────────────┐   ┌────────────────────┐   ┌──────────┐
│  arXiv   │──▶│  fetch:arxiv (cron) │──▶│ Notion DB          │──▶│ Astro    │
│  Atom    │   │  scripts/           │   │ "CPC Papers"       │   │ static   │
│  API     │   │  fetch-arxiv.mjs    │   │ status: pending /  │   │ site     │
└──────────┘   └─────────────────────┘   │         approved / │   └──────────┘
                                          │         rejected   │        ▲
                                          └────────────────────┘        │
                                                    │                   │
                                                    │ sync:papers       │
                                                    └───────────────────┘
                                          (Notion → content/papers/*.md)
```

### 流れ

1. **arXiv 検索 (毎日 12:17 JST)** — GitHub Actions cron が [`scripts/fetch-arxiv.mjs`](scripts/fetch-arxiv.mjs) を実行。[`scripts/arxiv-queries.mjs`](scripts/arxiv-queries.mjs) の各クエリで arXiv Atom API を叩き、過去 `LOOKBACK_DAYS` 日以内・指定カテゴリ内の新規論文を抽出。arXiv ID で重複を除外し、Notion DB に **`Status = pending`** で投入する。
2. **Notion 上でレビュー** — Notion DB を開き、`pending` 行を確認。採用する論文には：
   - **`Schools`** を 1 つ以上選択（必須・SCHOOLS 列挙体に準拠）
   - **`Summary (JA)`** に日本語要約を追記（任意）
   - 必要に応じて `Methods` / `Tags` / `Venue` / `DOI` を追加
   - **`Status`** を `approved` に切替
3. **サイト反映 (同 cron / 手動)** — [`scripts/sync-papers-from-notion.mjs`](scripts/sync-papers-from-notion.mjs) が Notion から `approved` 行を取得し、[`content/papers/*.md`](content/papers/) に生成。Astro ビルドで静的サイトに反映される。

### 検索クエリの編集

[`scripts/arxiv-queries.mjs`](scripts/arxiv-queries.mjs) を編集して commit すれば、次回 cron が拾う。クエリ構文（arXiv API）:

| 演算子 | 意味 | 例 |
|---|---|---|
| `ti:"..."` | タイトル一致 | `ti:"symbol emergence"` |
| `abs:"..."` | 要旨一致 | `abs:"MHNG"` |
| `au:"..."` | 著者一致 | `au:"Taniguchi"` |
| `cat:X` | カテゴリ | `cat:cs.AI` |
| `AND` / `OR` / `ANDNOT` | 論理結合 | `(ti:"X" OR abs:"X") AND cat:cs.LG` |

カテゴリ・遡及日数・最大取得件数も同ファイルで調整可能。

### Notion DB スキーマ

| プロパティ | 型 | 用途 |
|---|---|---|
| `Title` | title | 論文タイトル |
| `arXiv ID` | rich_text | 例: `2401.12345` |
| `Authors` | multi_select | 著者リスト |
| `Year` | number | 発表年（arXiv 提出年から自動） |
| `Venue` | rich_text | 会議・誌名（手動補完） |
| `URL` | url | arXiv 等のリンク |
| `DOI` | rich_text | DOI |
| `Abstract (EN)` | rich_text | arXiv abstract（自動） |
| `Summary (JA)` | rich_text | **手動追記** |
| `Schools` | multi_select | Symbol Emergence / Active Inference / MHNG / Emergent Communication / Predictive Coding / CPC-MS / World Model / Multi-agent |
| `Methods` | multi_select | 手法タグ |
| `Tags` | multi_select | 自由タグ |
| `Categories` | multi_select | arXiv カテゴリ（自動） |
| `Status` | select | `pending` / `approved` / `rejected` |
| `Date Added` | date | 自動 |
| `Featured` | checkbox | 注目論文フラグ |
| `Contributor` | rich_text | 起票者 |

### 環境変数

ローカル実行・GitHub Actions の両方で以下を設定する。

| 変数 | 取得元 |
|---|---|
| `NOTION_TOKEN` | [Notion Integrations](https://www.notion.so/profile/integrations) で **Internal Integration** を作成し、生成された Secret（`ntn_...` で始まる）をコピー。Integration の **Associated workspace** は DB が置かれているワークスペースと一致させる必要がある。 |
| `NOTION_DB_ID` | Notion で「CPC Papers」DB を開き、Share → Copy link で取得。URL の `?v=...` より前の 32 文字 hex がそれ。 |

**重要**: Notion 側で DB（または親ページ）に Integration を「Connection」として追加しないと、API はアクセスできない（`object_not_found` エラー）。ページ右上 `…` → **Connections** → **+ Add connections** → 作成した Integration を選択。

### GitHub Actions secrets

リポジトリの Settings → Secrets and variables → Actions に以下を登録：

| Secret | 値 |
|---|---|
| `NOTION_TOKEN` | `ntn_...`（ローカルの `.env` と同じ） |
| `NOTION_DB_ID` | 32 文字 hex |

ワークフロー定義は [`.github/workflows/papers.yml`](.github/workflows/papers.yml)。`workflow_dispatch` で手動実行も可能（`skip_fetch=true` を渡せば Notion → サイトの同期だけ実行）。

### 安全機構: `notion_synced` マーカー

同期で生成されたファイルにはフロントマターに `notion_synced: true` が書き込まれる。`sync:papers` が「Notion で `approved` でなくなったファイル」を削除する際、**このマーカー付きファイルのみが対象**になる。

つまり：
- ✅ Notion 経由で作成された論文は、Notion 側で `rejected` / 削除されるとサイトからも消える
- ✅ 手動キュレーションした `content/papers/*.md`（マーカー無し）は **絶対に削除されない**

スキーマ定義は [`src/content/config.ts`](src/content/config.ts) の `papers` コレクション参照。

### 手動実行

```sh
# arXiv → Notion （新規論文を pending で追加）
pnpm fetch:arxiv

# Notion → content/papers/*.md （approved 行を反映）
pnpm sync:papers

# 2 つを順に実行
pnpm papers:pipeline
```

### トラブルシューティング

| 症状 | 原因 / 対処 |
|---|---|
| `object_not_found ... shared with your integration` | DB / 親ページに Integration が Connection 追加されていない。Notion UI で追加。 |
| `arXiv 429 ...` | レート超過。スクリプトは指数バックオフで自動リトライ（最大 3 回）。残りは次回 cron で拾う。 |
| `data does not match collection schema` | Notion 行の必須項目（特に `Schools`）が未設定。`approved` 行に最低 1 つの School を設定。 |
| Cron が動かない | `NOTION_TOKEN` / `NOTION_DB_ID` を GitHub Secrets に登録したか確認。Actions タブで `workflow_dispatch` 手動実行で疎通確認。 |

## ディレクトリ構成

```
.
├── content/                    # 論文・研究室・イベントの Markdown
│   ├── papers/
│   ├── labs/
│   └── events/
├── .github/workflows/
│   └── papers.yml              # arXiv → Notion → サイト の毎日 cron
├── scripts/                    # 取得スクリプト群 + launchd 設定
│   ├── fetch-youtube.mjs
│   ├── fetch-note.mjs
│   ├── fetch-arxiv.mjs         # arXiv → Notion
│   ├── sync-papers-from-notion.mjs  # Notion → content/papers/*.md
│   ├── arxiv-queries.mjs       # 検索クエリ・カテゴリ・遡及日数 (編集可)
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
