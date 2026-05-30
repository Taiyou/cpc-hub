# symbol-emergence hub — Claude Code PoC 設計書 (v2)

> **このドキュメントの目的**: Claude Code（CLI）にこのファイルを渡して、symbol-emergence hub プロジェクトの PoC を自律的に実装させるための完全な設計書。本書をリポジトリ root に `DESIGN.md` として配置し、`claude` コマンドから参照させる。

---

## 変更履歴 (v1 → v2)

v1 のレビューで判明した齟齬・古い API を反映:

- **§3**: リポジトリ配置を「現在の作業ディレクトリ直下 = プロジェクトルート」に確定（`cpc-hub/` サブディレクトリは作らない）。
- **§4.4**: Content Collections の API を Astro 5 標準の `glob()` loader 方式に更新（v1 の `type: 'content'` は Astro 4 系の書き方で非推奨）。
- **§5.2 / §5.3**: `prefixDefaultLocale: true` 設定下では `/` → `/en/` のリダイレクトが自動生成されないため、`src/pages/index.astro` に明示的なリダイレクトを書く手順を追加。
- **§7.1**: arxiv_monitor が `seen_arxiv_ids.json` を main に直接 push する前提を明文化（PoC では main にブランチ保護を**かけない**）。
- **§8 (Phase 1) / §8 (Phase 5)**: Phase 1 の完成基準は「ローカルで `pnpm build` / `pnpm dev` が通る」までに絞る。Vercel への実デプロイは Phase 5 のみ（v1 の文言曖昧さを解消）。
- **§9.5 (新設)**: 「Pre-Phase 1 セットアップ」を新設（GitHub リポジトリ作成・Vercel アカウント準備）。

---

## 0. ドキュメント構造

```
リポジトリ root/
├── DESIGN.md          # 本書（設計書全体）
├── CLAUDE.md          # Claude Code 用の規約・コーディングガイド
├── README.md          # 一般向けプロジェクト紹介
└── docs/              # 詳細ドキュメント（後で分割する場合）
```

Claude Code は次の順で読み込む想定:
1. `CLAUDE.md`（プロジェクト全体のルール）
2. `DESIGN.md`（このドキュメント。実装仕様）
3. 必要に応じて各サブセクション

---

## 1. PoC のゴール

PoC（Proof of Concept）は **「最小構成で全体が動くこと」** を示すのが目的。本物のローンチ可能版ではない。

### 1.1 完成定義（Definition of Done）

以下がすべて満たされたら PoC 完成:

- [ ] Astro サイトが Vercel にデプロイされている（仮ドメイン）
- [ ] `/en/` と `/ja/` で同じコンテンツが両言語切替で表示される
- [ ] `/papers`, `/labs`, `/events` の3つのリストページが動作
- [ ] 各カテゴリに最低 5 件のサンプルデータが入っている
- [ ] `arxiv_monitor.py` を手動実行すると、新着論文が GitHub Issue として作成される
- [ ] GitHub Actions の cron で `arxiv_monitor.py` が日次実行される設定がある
- [ ] `link_checker.py` を手動実行すると、リンク切れが報告される
- [ ] `newsletter_draft.py` を手動実行すると、Markdown 草稿が生成される
- [ ] `x_post.py` を手動実行すると、投稿スレッド草稿が生成される
- [ ] `README.md`、`CONTRIBUTING.md`、Issue Template がある

### 1.2 PoC で **やらない** こと

明示的にスコープ外。やらないことを書いておくのが大事:

- 認証・ユーザー管理
- 検索機能（最初は無し、HTML の `<details>` でフィルタする程度）
- 全文翻訳の自動化
- カスタムデザイン（Tailwind デフォルト + 最小カスタマイズで十分）
- アクセス解析・SEO 最適化（メタタグだけ）
- 自動テスト（手動の動作確認で十分）
- ニュースレター・X ポストの実配信（草稿生成のみ）
- Airtable 連携（PoC は Markdown 一次管理）

---

## 2. 技術スタック（確定）

| 領域 | 採用技術 | バージョン | 補足 |
|---|---|---|---|
| サイトフレームワーク | **Astro** | 5.x 最新 | SSG モード |
| スタイリング | **Tailwind CSS** | 3.x 最新 | `@astrojs/tailwind` 経由 |
| コンテンツ管理 | **Astro Content Collections** | 標準 (Astro 5 の `glob` loader) | TypeScript 型安全 |
| i18n | **Astro 標準 i18n** | 標準 | `astro.config.mjs` で設定 |
| ホスティング | **Vercel** | — | 無料枠 |
| 自動化言語 | **Python** | 3.11+ | uv または venv |
| 自動化実行 | **GitHub Actions** | — | cron スケジュール |
| パッケージマネージャ | **pnpm** | latest | npm/yarn より速い |
| Node | Node.js | 20.x LTS | Astro 5 の要件 |

### 2.1 Python 依存ライブラリ

```
arxiv >= 2.1.0          # arxiv API クライアント
requests >= 2.31.0      # HTTP（リンクチェッカー）
python-frontmatter      # Markdown frontmatter 解析
PyYAML                  # frontmatter 出力
python-dateutil         # 日付パース
```

`scripts/requirements.txt` に固定する。

### 2.2 Node 依存ライブラリ（主要のみ）

```
astro                   # 本体
@astrojs/tailwind       # Tailwind 統合
@astrojs/sitemap        # sitemap 生成
tailwindcss             # CSS
```

---

## 3. リポジトリ構造

**配置の確定方針**: 現在の作業ディレクトリ（`CPCメディアアーキテクト/`）をそのままプロジェクトルートにする。`cpc-hub/` サブディレクトリは作らない。GitHub リポジトリ名は `cpc-hub` とするが、ローカルのフォルダ名は変更不要。

```
CPCメディアアーキテクト/             # = git ルート / Vercel ルート
├── DESIGN.md                       # 本書
├── CLAUDE.md                       # Claude Code 規約
├── README.md                       # プロジェクト紹介
├── CONTRIBUTING.md                 # 貢献ガイド
├── LICENSE                         # MIT (コード) + CC BY-SA 4.0 (コンテンツ) を併記
├── .github/
│   ├── workflows/
│   │   ├── arxiv_monitor.yml       # 日次 cron
│   │   ├── link_checker.yml        # 週次 cron
│   │   └── deploy.yml              # main push で Vercel デプロイ（Vercel 連携で自動なら不要）
│   └── ISSUE_TEMPLATE/
│       ├── new_paper.yml
│       ├── new_lab.yml
│       └── new_event.yml
├── src/                            # Astro サイト
│   ├── pages/
│   │   ├── index.astro             # `/` → `/en/` リダイレクト（§5.3 参照）
│   │   ├── en/
│   │   │   ├── index.astro
│   │   │   ├── papers/
│   │   │   │   ├── index.astro
│   │   │   │   └── [slug].astro
│   │   │   ├── labs/
│   │   │   │   ├── index.astro
│   │   │   │   └── [slug].astro
│   │   │   └── events/
│   │   │       ├── index.astro
│   │   │       └── [slug].astro
│   │   └── ja/                     # en と同じ構造
│   ├── content/
│   │   └── config.ts               # Content Collections 定義（schema のみ、データは外）
│   ├── components/
│   │   ├── Layout.astro
│   │   ├── Header.astro
│   │   ├── LangSwitcher.astro
│   │   ├── PaperCard.astro
│   │   ├── LabCard.astro
│   │   └── EventCard.astro
│   ├── i18n/
│   │   ├── en.json
│   │   └── ja.json
│   └── styles/
│       └── global.css
├── content/                        # Markdown データ（glob loader でロード）
│   ├── papers/                     # 1 paper = 1 .md
│   ├── labs/
│   ├── events/
│   └── posts/                      # ニュースレター・記事（PoC では空でOK）
├── scripts/                        # Python 自動化
│   ├── requirements.txt
│   ├── arxiv_monitor.py
│   ├── link_checker.py
│   ├── newsletter_draft.py
│   ├── x_post.py
│   └── _common.py                  # 共通ユーティリティ
├── data/                           # スクリプト用永続データ
│   └── seen_arxiv_ids.json         # 既知の論文 ID キャッシュ
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── .gitignore
```

---

## 4. データモデル（Markdown frontmatter スキーマ）

すべて `content/{collection}/{slug}.md` の形で保存。**英語が一次データ、日本語は補助フィールド**（バイリンガル方針）。

### 4.1 Papers

ファイル名: `content/papers/{arxiv_id_or_slug}.md`

```yaml
---
title: "Decentralized Collective World Model for Emergent Communication"
authors:
  - Ebara, T.
  - Inoue, R.
  - Taniguchi, T.
year: 2025
venue: "arXiv preprint"
arxiv_id: "2504.03353"
doi: ""                      # optional
url: "https://arxiv.org/abs/2504.03353"
abstract_en: |
  We propose a collective world model that...
summary_ja: |
  分散的な集合的世界モデルを提案し、Emergent Communication の協調を改善する。  # optional
schools:                     # multi-tag
  - Symbol Emergence
  - World Model
methods:                     # multi-tag
  - Bayesian
  - Multi-agent RL
date_added: 2025-09-15
contributor: "@username"     # GitHub username
featured: false
---
<!-- 本文は省略可。あれば追加コメント・関連論文への links など -->
```

#### 必須フィールド
`title`, `authors`, `year`, `venue`, `url`, `abstract_en`, `schools`, `date_added`

#### 受け入れ可能な `schools` 値（PoC）
```
Symbol Emergence | Active Inference | MHNG |
Emergent Communication | Predictive Coding |
CPC-MS | World Model | Multi-agent
```
これは `src/content/config.ts` で TypeScript Enum として制約する。

### 4.2 Labs

ファイル名: `content/labs/{lab-slug}.md`

```yaml
---
name_en: "Taniguchi Lab"
name_ja: "谷口研究室"
pi: "Tadahiro Taniguchi"
institution: "Kyoto University"
country: "Japan"
homepage: "https://example.com"
description_en: |
  Research on symbol emergence systems and...
description_ja: |
  記号創発システム、CPC理論... # optional
focus_areas:
  - Symbol Emergence
  - CPC
date_added: 2025-09-01
---
```

### 4.3 Events

ファイル名: `content/events/{event-slug}.md`

```yaml
---
title_en: "Symbol Emergence in Robotics Workshop 2026"
title_ja: "" # 任意
type: "Workshop"             # Workshop | Conference | Seminar | Reading group
date_start: 2026-06-15
date_end: 2026-06-17         # 単日なら start と同じ
language: "EN"               # EN | JA | Mixed
location: "Online"           # 都市名 or "Online"
url: "https://example.com"
description_en: |
  ...
description_ja: |
  ... # optional
date_added: 2025-09-10
---
```

### 4.4 Content Collections 定義（`src/content/config.ts`）

**Astro 5 では `glob()` loader を使う**（v1 の `type: 'content'` は Astro 4 系で非推奨）。データは `src/content/` ではなくリポジトリ root の `content/` に置けるのが利点。

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const SCHOOLS = [
  'Symbol Emergence',
  'Active Inference',
  'MHNG',
  'Emergent Communication',
  'Predictive Coding',
  'CPC-MS',
  'World Model',
  'Multi-agent',
] as const;

const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/papers' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    year: z.number().int().min(2000).max(2100),
    venue: z.string(),
    arxiv_id: z.string().optional(),
    doi: z.string().optional(),
    url: z.string().url(),
    abstract_en: z.string(),
    summary_ja: z.string().optional(),
    schools: z.array(z.enum(SCHOOLS)).min(1),
    methods: z.array(z.string()).optional(),
    date_added: z.date(),
    contributor: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const labs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/labs' }),
  schema: z.object({
    name_en: z.string(),
    name_ja: z.string().optional(),
    pi: z.string(),
    institution: z.string(),
    country: z.string(),
    homepage: z.string().url(),
    description_en: z.string(),
    description_ja: z.string().optional(),
    focus_areas: z.array(z.string()).min(1),
    date_added: z.date(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/events' }),
  schema: z.object({
    title_en: z.string(),
    title_ja: z.string().optional(),
    type: z.enum(['Workshop', 'Conference', 'Seminar', 'Reading group']),
    date_start: z.date(),
    date_end: z.date(),
    language: z.enum(['EN', 'JA', 'Mixed']),
    location: z.string(),
    url: z.string().url(),
    description_en: z.string(),
    description_ja: z.string().optional(),
    date_added: z.date(),
  }),
});

export const collections = { papers, labs, events };
```

> **note (Astro 5 の挙動)**: `glob` loader でロードしたエントリの ID はファイル名（拡張子なし）になる。`getCollection('papers')` で取得した各エントリには `id`, `data`, `body` が入り、`render()` で `<Content />` を返す。Astro 4 の `slug` プロパティは廃止され、`id` が slug を兼ねる。

---

## 5. サイトのルーティングと i18n

### 5.1 URL 構造

```
/                       → /en/ にリダイレクト（明示的に実装、§5.3 参照）
/en/                    → トップページ（英語）
/en/papers/             → 論文一覧
/en/papers/{slug}/      → 論文詳細
/en/labs/
/en/labs/{slug}/
/en/events/
/en/events/{slug}/
/en/about/
/ja/                    → トップページ（日本語）
/ja/papers/
...
```

### 5.2 i18n 設定（`astro.config.mjs`）

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cpc-hub.example.org',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: {
      prefixDefaultLocale: true,  // /en/ も明示
    },
  },
  integrations: [tailwind(), sitemap()],
});
```

> **重要**: `prefixDefaultLocale: true` の場合、Astro は `/` ルートを自動生成しない。アクセスすると 404 になる。`src/pages/index.astro` に明示的にリダイレクトを書く必要がある（§5.3）。

### 5.3 言語切替の方針

- ヘッダーに `EN | JA` トグル
- 同じコンテンツの別言語ルートに移動する仕組み
- データに `summary_ja` などが無い場合は英語版でフォールバック表示し、`(English only)` のラベルを薄く表示
- UI 文字列は `src/i18n/en.json` と `src/i18n/ja.json` で管理

#### `/` のリダイレクト実装（`src/pages/index.astro`）

```astro
---
return Astro.redirect('/en/');
---
```

将来 Accept-Language で自動判定したくなったらここに分岐を入れる。PoC では英語固定でよい。

#### `src/i18n/ja.json` 例
```json
{
  "nav.papers": "論文",
  "nav.labs": "研究室",
  "nav.events": "イベント",
  "nav.about": "このサイトについて",
  "papers.heading": "論文",
  "papers.intro": "CPC関連論文の体系的キュレーション",
  "labs.heading": "研究室",
  "events.heading": "イベント",
  "common.read_more": "詳細を見る",
  "common.english_only": "（英語のみ）"
}
```

---

## 6. 自動化スクリプトの仕様

すべてのスクリプトは:
- `scripts/` 配下に配置
- `python scripts/{name}.py` で単独実行可能
- 引数なしで動作するデフォルト動作を持つ
- `--dry-run` フラグで副作用を出さずに動作確認できる
- 環境変数で挙動を切り替え可能

### 6.1 `arxiv_monitor.py`

#### 目的
arXiv で CPC関連論文の新着を毎日チェックし、新規発見論文を GitHub Issue として作成する。

#### 入出力
```
入力:
  - arxiv API（外部）
  - data/seen_arxiv_ids.json（既出論文のキャッシュ）
  - 環境変数 GITHUB_TOKEN（Issue 作成用）
  - 環境変数 GITHUB_REPO（例: "username/cpc-hub"）

出力:
  - GitHub Issue（per new paper）
  - data/seen_arxiv_ids.json の更新
  - stdout: 処理サマリー
```

#### 検索条件（PoC 初期値）
```python
ARXIV_CATEGORIES = ["cs.MA", "cs.CL", "cs.LG", "q-bio.NC"]
KEYWORDS = [
    "collective predictive coding",
    "symbol emergence",
    "Metropolis-Hastings naming game",
    "MHNG",
    "active inference",
    "emergent communication",
]
LOOKBACK_DAYS = 1   # 1日分（cronで毎日動かすため）
```
ヒット条件: タイトル or アブストラクトにキーワードのいずれかを含む AND カテゴリが指定リストに含まれる。

#### Issue フォーマット
```
Title: [arxiv] {paper_title}
Body:
  - **Authors**: {authors}
  - **arxiv ID**: {arxiv_id}
  - **Categories**: {primary_category}, {others}
  - **Published**: {date}
  - **Match**: "{matched_keyword}"
  - **URL**: {abs_url}
  - **PDF**: {pdf_url}
  ---
  ### Abstract
  {abstract}
  ---
  ### Action needed
  - [ ] CPC領域として採否判断
  - [ ] 採用する場合は `content/papers/{arxiv_id}.md` を PR で追加
  - [ ] 不採用なら本 Issue をクローズ

Labels: ["arxiv-auto", "needs-review"]
Assignees: papers-team の代表者（環境変数で指定可能、未指定なら無し）
```

#### 重複チェック
`data/seen_arxiv_ids.json` に過去に Issue 化した arxiv_id を保存。再実行時は既出 ID をスキップ。

#### `--dry-run`
Issue を作成せず、何が作成されるかを stdout に出力。

#### 失敗時の挙動
- arxiv API 失敗 → リトライ3回、それでも失敗ならエラー終了（exit 1）
- GitHub API 失敗 → そのIssueはスキップして次へ、最後にサマリーで失敗数を報告

### 6.2 `link_checker.py`

#### 目的
リポジトリ内の全 Markdown ファイルから URL を抽出し、404・5xx・タイムアウトしているリンクを検出。週次で GitHub Issue として報告。

#### 処理フロー
```
1. content/**/*.md を walk
2. 各ファイルから:
   - frontmatter の url, homepage フィールド
   - 本文の Markdown リンク [text](url)
3. 重複排除した URL リスト
4. 各 URL に HEAD リクエスト（10秒タイムアウト、HEAD不可なら GET）
5. ステータスコード分類:
   - 2xx → OK
   - 3xx → Redirect（追跡してOK扱い）
   - 4xx → Broken
   - 5xx → Server error（一時的かもなので警告のみ）
   - timeout / DNS失敗 → Broken
6. Broken が1件以上あれば GitHub Issue を作成
```

#### 出力 Issue
```
Title: [link-check] {N} broken links found ({date})
Body:
  | File | URL | Status |
  |------|-----|--------|
  | content/labs/foo.md | https://... | 404 |
  | content/papers/bar.md | https://... | timeout |

  Action: 各リンクを修正、または該当エントリを更新する。

Labels: ["maintenance", "broken-links"]
```

#### 環境変数
- `GITHUB_TOKEN`, `GITHUB_REPO`: Issue 作成用
- `LINK_CHECK_TIMEOUT`: HTTP タイムアウト秒（デフォルト 10）

### 6.3 `newsletter_draft.py`

#### 目的
過去30日間に追加された論文・近日のイベントから、月次ニュースレターの **Markdown 草稿** を生成する。実配信はしない。

#### 処理フロー
```
1. 引数で対象月を取得（デフォルト: 先月）
2. content/papers/*.md から date_added が対象月内のものを抽出
3. content/events/*.md から date_start が「対象月終わり〜+60日」のものを抽出
4. テンプレートに流し込んで Markdown 生成
5. drafts/newsletter/{YYYY-MM}.md として保存
```

#### テンプレート構造（日英両言語）
```markdown
# symbol-emergence hub Newsletter — {month_name} {year}

## 📚 New Papers This Month / 今月の新着論文

### 1. {paper_title_en}
{authors}, {year}, {venue}

{abstract first 2 sentences}

[Read more]({url})

### 2. ...

## 📅 Upcoming Events / 今後のイベント

### {event_title_en} / {event_title_ja}
**Date**: {date}  **Location**: {location}  **Language**: {language}

{description first sentence}

[Details]({url})

## 💬 Community Notes / コミュニティから

(編集者が手書きで追加するセクション)

---
Subscribe / 購読: ...
```

論文が10件超なら最初の10件 + 「他N件」、イベントが5件超なら同様。

### 6.4 `x_post.py`

#### 目的
週次で「今週の注目論文」「来週のイベント」を X（Twitter）スレッドの草稿として生成。Discord の運営チャンネルに投稿する想定（PoC では Markdown ファイル出力）。

#### 処理フロー
```
1. content/papers/*.md から date_added が過去7日内のものを取得
2. featured: true を優先、なければ最新3件
3. content/events/*.md から date_start が今後14日以内のものを取得
4. X の投稿として整形（各ポスト 280 文字以内）
5. drafts/x_posts/{YYYY-MM-DD}.md にスレッド形式で保存
```

#### 出力例
```markdown
# X post draft — 2025-09-15

## Thread 1: This week in CPC research

### Post 1/4
🧠 This week's CPC papers (3 new):
🧵👇

### Post 2/4
1/ "Decentralized Collective World Model" by Ebara et al.
A new approach to emergent communication using shared world models.
arxiv.org/abs/2504.03353

### Post 3/4
2/ ...

### Post 4/4
3/ ...

Follow @cpchub for weekly updates.

---

## Thread 2: Upcoming events
...
```

文字数チェック関数を内部で持ち、超過時は短縮または切り捨て。

### 6.5 `_common.py`（共通ユーティリティ）

```python
# 提供する関数
def load_frontmatter(path: Path) -> dict
def list_content(collection: str) -> list[Path]
def gh_create_issue(title: str, body: str, labels: list[str]) -> dict
def gh_search_issues(query: str) -> list[dict]
def safe_request(url: str, timeout: int = 10) -> requests.Response | None
def truncate_for_x(text: str, max_chars: int = 280) -> str
```

GitHub API は `requests` で直接叩く（PyGithub は依存を増やしたくないので不採用）。

---

## 7. GitHub Actions ワークフロー

> **前提**: PoC 期間中は main ブランチに**保護をかけない**。理由は §7.1 の `seen_arxiv_ids.json` を bot が直接 push する設計のため。本番運用に移行するタイミングで「Bot 用ブランチ + 自動 PR」方式へ切り替える。

### 7.1 `arxiv_monitor.yml`

```yaml
name: arxiv monitor
on:
  schedule:
    - cron: '0 21 * * *'  # 毎日 06:00 JST = 21:00 UTC
  workflow_dispatch:       # 手動実行可

jobs:
  monitor:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: write       # seen_arxiv_ids.json をコミットするため
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r scripts/requirements.txt
      - run: python scripts/arxiv_monitor.py
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
      - name: Commit seen IDs
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/seen_arxiv_ids.json
          git diff --quiet --staged || git commit -m "chore: update seen arxiv ids"
          git push
```

> 上記 `git push` は main への直接 push になる。main にブランチ保護を入れている場合は失敗するので、PoC では保護を入れないこと（`Settings > Branches` を空のまま）。

### 7.2 `link_checker.yml`

```yaml
name: link checker
on:
  schedule:
    - cron: '0 0 * * 1'   # 毎週月曜 09:00 JST
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r scripts/requirements.txt
      - run: python scripts/link_checker.py
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
```

### 7.3 ニュースレター・X ポストは手動実行
PoCでは `workflow_dispatch` のみ用意（人間が起動して中身を確認するフロー）。本番運用後に cron 化を検討。

---

## 8. 実装フェーズ（Claude Code に投げる順序）

各フェーズは独立した PR にする想定。Claude Code には1フェーズずつ依頼する。

### Phase 0: 事前準備（人間が実行、所要 10–20 分）

§9.5 を参照。GitHub リポジトリ作成・Vercel アカウント連携など、Claude Code に投げる前にやっておくこと。

### Phase 1: Astroサイトのスケルトン（推定 2-4時間）
```
依頼例: "symbol-emergence hub の Phase 1 を実装して。DESIGN.md の §3 と §5 を参照。
        Astro 5 で i18n 対応のサイト雛形を作り、ローカルで pnpm dev / pnpm build が
        通る状態にする。コンテンツは空でOK。Vercel への実デプロイは Phase 5 で行う。"
```
タスク:
1. `pnpm create astro@latest` でプロジェクト初期化
2. `@astrojs/tailwind`, `@astrojs/sitemap` を追加
3. `astro.config.mjs` に i18n 設定を入れる
4. `src/content/config.ts` で papers/labs/events の Content Collection を **glob loader で** 定義（§4.4）
5. `src/pages/index.astro` で `/` → `/en/` リダイレクト（§5.3）
6. Layout, Header, LangSwitcher コンポーネントを作る
7. `/en/`, `/ja/` のトップページ
8. `/en/papers`, `/en/labs`, `/en/events` の空のリストページ
9. ビルドが通る、ローカルで動く

完了基準: `pnpm build` がエラーなく完了し、`pnpm dev` でブラウザに表示される。**Vercel デプロイは Phase 5 まで延期**。

### Phase 2: コンテンツ表示と詳細ページ（推定 2-3時間）
```
依頼例: "Phase 2: コンテンツ表示を実装。DESIGN.md §4 のフロントマター
        スキーマに従って、各カテゴリの一覧と詳細ページを作る。
        サンプルデータも 5 件ずつ作る。"
```
タスク:
1. `content/papers/`, `content/labs/`, `content/events/` にサンプル Markdown を 5 件ずつ作る（実在のCPC論文・研究室・イベントを使う）
2. `[slug].astro` で詳細ページを作る（`getStaticPaths` で `getCollection()` を回す）
3. リストページに PaperCard / LabCard / EventCard コンポーネントを配置
4. 日本語版で `summary_ja` が無い場合のフォールバック表示
5. `nav.papers` などの i18n 文字列を `en.json` / `ja.json` に追加

完了基準: ローカルで両言語でリスト・詳細が見られる。

### Phase 3: arxiv モニターのPython実装（推定 2-3時間）
```
依頼例: "Phase 3: scripts/arxiv_monitor.py を DESIGN.md §6.1 通りに実装。
        --dry-run で動作確認できるようにし、GitHub Actions のワークフローも作る。"
```
タスク:
1. `scripts/requirements.txt` を作る
2. `scripts/_common.py` の共通関数
3. `scripts/arxiv_monitor.py` 実装
4. `--dry-run` で実行 → 期待通りの Issue 文面が出ることを確認
5. `.github/workflows/arxiv_monitor.yml` を作る
6. ローカルで `GITHUB_TOKEN` を渡して実 Issue が立つことを1回確認

完了基準: dry-run で正しい出力、Actions 上で1回手動実行して Issue が立つ。

### Phase 4: 残り3スクリプト + Issue Templates（推定 3-4時間）
```
依頼例: "Phase 4: link_checker.py / newsletter_draft.py / x_post.py を
        DESIGN.md §6.2-6.4 通りに実装。Issue Templates も作る。"
```
タスク:
1. `link_checker.py` 実装 + Workflow
2. `newsletter_draft.py` 実装（出力先 `drafts/newsletter/`）
3. `x_post.py` 実装（出力先 `drafts/x_posts/`）
4. `.github/ISSUE_TEMPLATE/new_paper.yml`, `new_lab.yml`, `new_event.yml`
5. README.md, CONTRIBUTING.md

完了基準: 各スクリプトが手動実行で期待出力を出す。

### Phase 5: スタイル仕上げ + Vercel 実デプロイ（推定 1-2時間）
```
依頼例: "Phase 5: Tailwindで最低限のクリーンなデザインを当て、Vercelに**実デプロイ**する。
        DESIGN.md §1.1 の完成定義をすべて満たすこと。"
```
タスク:
1. Tailwind でカード・タイポグラフィを整える（AISafety.com 風のミニマル）
2. ヘッダーの言語切替を仕上げる
3. **Vercel に接続して実デプロイ**（§11 の手順）
4. デプロイ URL を README に記載
5. §1.1 の完成定義チェックリストを最後に確認

---

## 9. 受け入れ基準（PoC全体）

PR レビュー時に確認するチェックリスト。

### 9.1 サイト
- [ ] `pnpm build` がエラーなく完了
- [ ] `/en/papers/` で5件以上の論文がカード表示
- [ ] `/en/papers/{slug}/` で詳細が表示
- [ ] `/ja/papers/` で同じ論文の日本語版が表示
- [ ] `summary_ja` が無い論文では英語フォールバック + ラベル
- [ ] ヘッダーの EN/JA 切替で同じパスの別言語版に飛ぶ
- [ ] `/` にアクセスすると `/en/` にリダイレクトされる
- [ ] Lighthouse Performance スコア 80+ （PoC基準）
- [ ] Vercel にデプロイされ public URL が存在する

### 9.2 自動化スクリプト
- [ ] `python scripts/arxiv_monitor.py --dry-run` で正しい Issue 文面が出る
- [ ] GitHub Actions の手動実行（workflow_dispatch）で arxiv_monitor が成功
- [ ] `python scripts/link_checker.py` で意図的に壊したリンクを検出できる
- [ ] `python scripts/newsletter_draft.py` で `drafts/newsletter/{YYYY-MM}.md` が生成
- [ ] `python scripts/x_post.py` で `drafts/x_posts/{YYYY-MM-DD}.md` が生成
- [ ] 各スクリプトのポストはX 280 文字制限を守っている

### 9.3 ドキュメント
- [ ] `README.md` でサイトの概要・ローカル起動方法・デプロイ URL が分かる
- [ ] `CONTRIBUTING.md` で論文を追加する手順がフロー図入りで書かれている
- [ ] Issue Template が3種類動作する

### 9.4 リポジトリ運用
- [ ] main にブランチ保護がかかっていない（PoC 期間中の前提）
- [ ] `.gitignore` に `node_modules/`, `dist/`, `.venv/`, `drafts/` が含まれている
- [ ] LICENSE が MIT + CC BY-SA 4.0 の併記で配置されている

### 9.5 Pre-Phase 1 セットアップ（人間が事前にやること）

Claude Code に Phase 1 を投げる前に、以下を済ませておく:

1. **GitHub リポジトリの作成**
   - リポジトリ名: `cpc-hub`（推奨）
   - 公開/非公開: 公開を推奨（PoC でも OSS 前提のため）
   - README は GitHub 側で作らない（Phase 4 で書く）
   - Initial commit は空でよい
   - main ブランチに**保護をかけない**（§7 参照）

2. **ローカルと GitHub をリンク**
   ```bash
   cd "/Users/.../CPCメディアアーキテクト"
   git init
   git remote add origin git@github.com:{username}/cpc-hub.git
   ```

3. **Vercel アカウントの準備**（Phase 5 で使う）
   - vercel.com に GitHub アカウントでサインアップ
   - GitHub リポジトリへのアクセス許可を与えておく
   - 実デプロイは Phase 5 で行うので、Phase 1 段階では「準備のみ」

4. **Node / pnpm / Python の確認**
   ```bash
   node --version    # v20.x 以上
   pnpm --version    # 8.x 以上、なければ `npm install -g pnpm`
   python3 --version # 3.11 以上
   ```

5. **GitHub Personal Access Token (Phase 3 のローカル動作確認用)**
   - `repo` スコープ付きのトークンを発行
   - `~/.zshrc` などに `export GITHUB_TOKEN=...` を入れておくか、`.env.local` で管理（コミットしない）

これらが揃ったら Phase 1 を Claude Code に投げる。

---

## 10. ローカル開発セットアップ手順

`README.md` に転記する内容:

```bash
# 必要なもの
node 20+, pnpm, python 3.11+

# 初回セットアップ
git clone {repo}
cd cpc-hub
pnpm install
python -m venv .venv && source .venv/bin/activate
pip install -r scripts/requirements.txt

# サイトを起動
pnpm dev          # http://localhost:4321

# ビルド
pnpm build
pnpm preview

# スクリプトを動かす（dry-run推奨）
GITHUB_TOKEN=... GITHUB_REPO=user/repo \
  python scripts/arxiv_monitor.py --dry-run
```

---

## 11. デプロイ（Vercel）

PoC は GitHub と Vercel を連携させて自動デプロイにする:

1. Vercel ダッシュボードで GitHub リポジトリをインポート
2. Framework preset: **Astro** を選択
3. Build command: `pnpm build`
4. Output directory: `dist`
5. Environment variables は不要（PoCではビルド時に必要なシークレット無し）
6. main ブランチへの push で自動デプロイ

`.github/workflows/deploy.yml` は不要（Vercel が処理）。

---

## 12. CLAUDE.md の中身（Claude Code 用規約）

リポジトリ root に `CLAUDE.md` を置き、以下を記述:

```markdown
# Claude Code Conventions for symbol-emergence hub

## Project context
This is a content hub for Collective Predictive Coding research.
See DESIGN.md for full specification.

## Tech stack hard rules
- Astro 5.x (no Astro 4 syntax — use `glob()` loader for Content Collections)
- Tailwind CSS via @astrojs/tailwind
- Python 3.11+ for scripts
- pnpm for package management (no npm install)

## Coding conventions
- TypeScript: strict mode, explicit types on Astro Content schemas
- Python: type hints on all functions, dataclasses for structured data
- Markdown content: kebab-case slugs, ISO 8601 dates
- Commit messages: conventional commits (feat:, fix:, chore:, docs:)

## Don't do
- Don't add dependencies without justification
- Don't write inline styles in Astro components — use Tailwind classes
- Don't use Astro 4 Content Collections API (`type: 'content'`) — use `glob()` loader
- Don't use Astro 4 i18n patterns — use Astro 5 standard i18n
- Don't fetch from external APIs at build time without caching
- Don't reformat content/*.md files (humans edit these)
- Don't enable branch protection on main during PoC (arxiv_monitor pushes directly)

## File location rules
- Site components → src/components/
- Page templates → src/pages/{en,ja}/
- Content data → content/{papers,labs,events}/  (NOT src/content/)
- Schema definitions → src/content/config.ts
- Python scripts → scripts/
- Persistent script state → data/
- Generated drafts → drafts/  (gitignored)

## How to verify your work
After implementing a phase, run:
1. pnpm build  (must succeed)
2. pnpm dev    (manually verify in browser)
3. python scripts/{name}.py --dry-run  (for script changes)

## When stuck
- Re-read DESIGN.md §{relevant section}
- Check existing similar code in the repo
- Ask clarifying questions instead of guessing
```

---

## 13. PoC 完了後の次ステップ（参考、本書のスコープ外）

PoC が動いたら次に検討すること:

- 実コンテンツの投入（30件以上を目標）
- ドメイン取得と切替（cpc-hub.org など）
- 谷口先生・関連ラボにアドバイザー記載許諾の依頼
- ロゴ・ブランディング
- ニュースレターの実配信（Substack 連携）
- X ポストの自動投稿（X API v2）
- Discord サーバー立ち上げと運営
- 検索機能（Pagefind が Astro と相性◎）
- 引用ネットワーク可視化
- 月次ふりかえりの仕組み
- **main にブランチ保護をかける** + arxiv_monitor を bot ブランチ + 自動 PR 方式に切り替え

---

## Appendix A: サンプル frontmatter（コピペ用）

### Paper
```yaml
---
title: "Collective Predictive Coding Hypothesis: Symbol Emergence as Decentralized Bayesian Inference"
authors:
  - Taniguchi, T.
  - Yoshida, M.
  - Matsui, Y.
  - Le, N. C.
  - Ueda, K.
  - Hagiwara, Y.
  - Taniguchi, A.
year: 2024
venue: "Frontiers in Robotics and AI"
arxiv_id: "2402.00712"
doi: "10.3389/frobt.2024.1353870"
url: "https://www.frontiersin.org/articles/10.3389/frobt.2024.1353870"
abstract_en: |
  Understanding the emergence of symbol systems, especially language,
  requires the construction of a computational model that reproduces
  both the developmental learning process in everyday life and the
  evolutionary dynamics of symbol emergence throughout history.
summary_ja: |
  記号創発を分散ベイズ推論として定式化するCPC仮説の提案。MHNGによる
  実装と、自由エネルギー原理との関係を議論。
schools:
  - Symbol Emergence
  - CPC-MS
  - MHNG
methods:
  - Bayesian
  - MHNG
date_added: 2025-09-01
contributor: "@founder"
featured: true
---
```

### Lab
```yaml
---
name_en: "Taniguchi Lab — Symbol Emergence Systems"
name_ja: "谷口研究室 — 記号創発システム研究室"
pi: "Tadahiro Taniguchi"
institution: "Kyoto University / Ritsumeikan University"
country: "Japan"
homepage: "https://example.com/taniguchi-lab"
description_en: |
  Research focused on symbol emergence, multimodal robotics, and
  collective predictive coding theory.
description_ja: |
  記号創発、マルチモーダルロボティクス、CPC理論に関する研究を行う。
focus_areas:
  - Symbol Emergence
  - CPC
  - Multimodal Learning
date_added: 2025-09-01
---
```

### Event
```yaml
---
title_en: "International Symposium on Symbol Emergence in Robotics 2026"
title_ja: "記号創発ロボティクス国際シンポジウム 2026"
type: "Conference"
date_start: 2026-09-12
date_end: 2026-09-14
language: "EN"
location: "Kyoto, Japan"
url: "https://example.com/iser2026"
description_en: |
  Annual symposium on symbol emergence systems, covering theoretical
  and applied research in cognitive robotics.
description_ja: |
  認知ロボティクスにおける記号創発システムの年次シンポジウム。
date_added: 2025-09-10
---
```

---

## Appendix B: 想定スケジュール

| フェーズ | 推定時間 | Claude Code セッション数 |
|---------|---------|------------------------|
| Phase 0 | 10-20min | 0（人間作業）          |
| Phase 1 | 2-4h    | 1                      |
| Phase 2 | 2-3h    | 1                      |
| Phase 3 | 2-3h    | 1                      |
| Phase 4 | 3-4h    | 1-2                    |
| Phase 5 | 1-2h    | 1                      |
| **合計**| **10-16h** | **5-6セッション**     |

1セッション = 1〜3時間の集中作業。1日1フェーズずつ進める想定。

---

**End of DESIGN.md**

実装に着手する前に、Phase 1 を Claude Code に投げてみて、最初のセッションで詰まるポイントがあれば本書に反映する。
