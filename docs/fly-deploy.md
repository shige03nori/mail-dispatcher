# Fly.io デプロイ手順書

## 概要

mail-dispatcher を Fly.io でデモ公開する手順と、ハマりポイントのまとめ。

- SQLite（better-sqlite3）をそのまま使用
- メールは console モード（ログ出力のみ）
- DEMO_MODE=true でワンクリックログイン対応

---

## 作成・変更したファイル

### `.dockerignore`

```
.git
.gitignore
.next
node_modules
prisma/*.db
prisma/*.db-journal
.env
.env.local
*.log
```

### `Dockerfile`

```dockerfile
FROM node:20-slim

# better-sqlite3 のネイティブビルドに必要
RUN apt-get update && apt-get install -y \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

# NEXT_PUBLIC_ 変数はビルド時に埋め込まれるため build の前に設定
ENV NEXT_PUBLIC_DEMO_MODE=true
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production PORT=3000

# 起動時にマイグレーション→シード→アプリ起動を順番に実行
# seed は冪等（upsert）なので毎回実行しても問題なし
# || echo で seed 失敗時もアプリが起動するようにする
CMD ["sh", "-c", "npx prisma migrate deploy && (npm run seed:demo || echo 'seed skipped') && npm start"]
```

### `fly.toml`

```toml
app = 'mail-dispatcher-demo'
primary_region = 'nrt'

[build]

[deploy]
  # SQLite ボリュームは同時に1台しかマウントできないため
  # rolling 戦略は使えない → immediate で旧マシンを即停止
  strategy = "immediate"

[env]
  PORT = "3000"
  NODE_ENV = "production"
  DATABASE_URL = "file:/data/prod.db"   # 絶対パスで指定
  EMAIL_MODE = "console"
  DEMO_MODE = "true"
  NEXT_PUBLIC_DEMO_MODE = "true"        # ビルド時変数（Dockerfile でも設定）

[[mounts]]
  source = "sqlite_data"
  destination = "/data"
  initial_size = "1gb"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 1              # デモのため常時1台維持

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

### `package.json`（変更箇所）

```json
"start": "next start -H 0.0.0.0"
```

> `-H 0.0.0.0` がないと Next.js が localhost のみでリッスンし、
> Fly.io のプロキシから到達できない。

### `tsconfig.json`（追加箇所）

```json
{
  "ts-node": {
    "compilerOptions": {
      "module": "CommonJS",
      "moduleResolution": "node"
    }
  },
  "compilerOptions": {
    ...
  }
}
```

> `tsconfig.json` の `"module": "esnext"` のままだと ts-node が ESM として動き、
> seed スクリプトが `Unknown file extension ".ts"` で失敗する。
> ts-node 用に CommonJS を上書き設定することで解決。

---

## デプロイ手順

### 前提

```bash
fly version   # flyctl がインストール済みであること
fly auth login
```

### Step 1: アプリ作成

```bash
fly apps create mail-dispatcher-demo
# 名前が被る場合は別名を使う（Fly.io 全体でユニーク）
```

### Step 2: SQLite 永続ボリューム作成

```bash
fly volumes create sqlite_data --region nrt --size 1 --app mail-dispatcher-demo
# "Do you still want to use the volumes feature?" → y
```

### Step 3: シークレット設定

PowerShell の場合（openssl が使えないため）:

```powershell
$secret = -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
fly secrets set SESSION_SECRET=$secret APP_URL=https://mail-dispatcher-demo.fly.dev --app mail-dispatcher-demo
```

### Step 4: デプロイ

```bash
fly deploy --app mail-dispatcher-demo
```

初回デプロイ時は自動的に:
1. `npx prisma migrate deploy`（DBマイグレーション）
2. `npm run seed:demo`（デモデータ投入）
3. `npm start`（アプリ起動）

が順番に実行される。起動まで約 30 秒。

### Step 5: 確認

```bash
fly open --app mail-dispatcher-demo
fly logs --app mail-dispatcher-demo
```

ログに以下が出ていれば成功:

```
🎉 Demo seeding completed!
✓ Ready in 5s
```

---

## デモアカウント

| ロール | メール | パスワード |
|---|---|---|
| ADMIN | admin@demo.example | demo1234 |
| EDITOR | editor@demo.example | demo1234 |
| VIEWER | viewer@demo.example | demo1234 |

---

## ハマりポイントと対処法

### 1. `release_command` はボリュームにアクセスできない

Fly.io の `release_command` は一時マシンで動くため、永続ボリューム（`/data`）がマウントされない。
マイグレーションやシードを `release_command` で実行しても本番 DB に反映されない。

**対処**: `CMD` でマイグレーション・シードを実行する。

### 2. rolling デプロイが SQLite ボリュームと相性が悪い

ローリングデプロイは新旧マシンが重複する期間があるが、SQLite ボリュームは同時に1台しかマウントできない。その間「healthy instance なし」でルーティング不能になる。

**対処**: `fly.toml` に `strategy = "immediate"` を設定。

### 3. 明示的ヘルスチェックがルーティングをブロックする

`[[http_service.checks]]` に `grace_period` を設定すると、その間マシンがルーティングプールに入らない。チェック自体が失敗し続けると永久にルーティングされない。

**対処**: `[[http_service.checks]]` を削除し、Fly.io のデフォルト動作に任せる。

### 4. Windows で `fly ssh console` が使えない

`fly ssh issue` が Windows のパスを正しく扱えず SSH 鍵の設定に失敗する。

**対処**: SSH を使わず、起動 CMD にシードコマンドを含めて `fly logs` で結果を確認する。

### 5. `NEXT_PUBLIC_` 変数はビルド時に埋め込まれる

`fly.toml` の `[env]` は実行時環境変数のため、`NEXT_PUBLIC_` 変数はビルド時に反映されない。

**対処**: `Dockerfile` の `RUN npm run build` の前に `ENV NEXT_PUBLIC_DEMO_MODE=true` を記述する。

---

## 再デプロイ時の注意

```bash
fly deploy --app mail-dispatcher-demo
```

- `immediate` 戦略のため、旧マシン停止〜新マシン起動の約 30 秒間はダウンタイムが発生する
- シードは毎回実行されるが `upsert` で冪等なためデータの重複は起きない
