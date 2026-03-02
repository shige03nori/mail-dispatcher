# CLAUDE.md — mail-dispatcher プロジェクト

## プロジェクト概要

Next.js 16 (App Router) + Prisma (SQLite) + Nodemailer で構築したメール配信管理アプリ。

---

## 技術スタック

| 項目 | 詳細 |
|---|---|
| フレームワーク | Next.js 16.1.6 (App Router) |
| 言語 | TypeScript |
| ORM | Prisma 7 (better-sqlite3) |
| DB | SQLite (`prisma/dev.db`) |
| メール | Nodemailer |
| スタイル | Tailwind CSS v4 + カスタム CSS (`src/app/styles/`) |
| ランタイム | Node.js |

---

## よく使うコマンド

```bash
npm run dev            # 開発サーバー起動
npm run build          # ビルド
npm run prisma:migrate # DB マイグレーション実行
npm run prisma:generate # Prisma クライアント再生成
npm run dev:full       # .next 削除 + migrate + generate + dev（スキーマ変更後に使う）
```

> **スキーマ変更後は必ず `prisma:generate` → 開発サーバー再起動が必要。**

---

## ディレクトリ構成

```
src/
  app/
    api/           # API Routes
    dashboard/     # ダッシュボード画面群
    login/         # ログイン画面
    styles/        # グローバル CSS（button.css など）
    globals.css    # Tailwind + styles インポート
    layout.tsx
  lib/
    auth/          # セッション・パスワード管理
    email/         # Nodemailer ラッパー
    ui/            # tableStyle, formStyle など共通スタイルオブジェクト
    prisma.ts      # Prisma クライアントシングルトン
prisma/
  schema.prisma
  dev.db
  migrations/
```

---

## 認証・権限

- セッションは Cookie ベース（`src/lib/auth/session.ts`）
- ロール：`ADMIN` / `EDITOR` / `VIEWER`
- `VIEWER` は GET のみ、作成・更新・削除不可
- `ADMIN` のみユーザー管理画面にアクセス可能

---

## スタイルのルール

### ボタン
- **必ず `btn-custom01` クラスを使う**（3D プッシュボタンデザイン）
- ボタン要素の中に `<span className="btn-custom01-front">ラベル</span>` を必ず入れる
- カラーバリエーションは親要素に追加クラスを付与する

```tsx
// 基本（黄色）
<button className="btn-custom01">
  <span className="btn-custom01-front">ラベル</span>
</button>

// 主操作（オレンジ）
<button className="btn-custom01 btn-custom01-primary">
  <span className="btn-custom01-front">作成</span>
</button>

// 危険（赤）
<button className="btn-custom01 btn-custom01-danger">
  <span className="btn-custom01-front">削除</span>
</button>

// 復元（緑）
<button className="btn-custom01 btn-custom01-success">
  <span className="btn-custom01-front">復元</span>
</button>

// ネイビー
<button className="btn-custom01 btn-custom01-navy">
  <span className="btn-custom01-front">ユーザー管理</span>
</button>

// 控えめ（白）
<button className="btn-custom01 btn-custom01-secondary">
  <span className="btn-custom01-front">キャンセル</span>
</button>
```

- `<Link>` も同じパターンで使用する
- `style={{...buttonStyle.base}}` / `buttonStyle.primary` は**使わない**（廃止）
- `className="btn"` / `"btn btn-primary"` 等の旧クラスも**使わない**（廃止）

### フォーム入力
- `formStyle.input` / `formStyle.select` / `formStyle.textarea`（`src/lib/ui/formStyle.ts`）

### テーブル
- `tableStyle.table` / `tableStyle.th` / `tableStyle.td`（`src/lib/ui/tableStyle.ts`）

---

## DB・API のルール

- **全 API は org スコープ必須**（`organizationId: session.organizationId`）
- Contact の `groups` フィールドは JSON 文字列（`string[]` の UUID 配列）
  - 読み取り時: `JSON.parse(c.groups)` → `string[]`
  - 書き込み時: `JSON.stringify(groupIds)`
- ネストした `<form>` は HTML 仕様違反。グループ作成など form 内での送信は `type="button"` + `onClick` で実装する

---

## 注意事項

- PowerShell でスクリプトが実行できない場合は実行ポリシーを確認すること
- Windows 環境のため、Claude Code のシェルは bash（Git Bash）を使用
- コミットは明示的に指示があった場合のみ行う
