# AWS デプロイ設計書

**プロジェクト**: mail-dispatcher
**作成日**: 2026-03-11
**ステータス**: 承認済み

---

## 1. 概要

mail-dispatcher を AWS 上で本番運用する。小規模（ユーザー数十名・連絡先数百件・月数千通）を想定し、運用コスト最小・シンプルな構成を優先する。

---

## 2. 全体アーキテクチャ

```
GitHub (main push)
    │
    ▼
GitHub Actions
    ├─ npm test（テスト）
    ├─ docker build (linux/amd64)
    └─ ECR push → App Runner デプロイトリガー
                        │
                        ▼
                   App Runner
                   (コンテナ実行 / HTTPS / オートスケール)
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
         RDS PostgreSQL       Amazon SES
         (VPCプライベート)    (トランザクションメール)
```

### コンポーネント一覧

| コンポーネント | 用途 | 備考 |
|---|---|---|
| ECR | Docker イメージレジストリ | タグ: latest + Git SHA |
| App Runner | コンテナ実行・HTTPS・オートスケール | VPC Connector 経由で RDS に接続 |
| RDS PostgreSQL | 本番DB | db.t3.micro、シングルAZ |
| Amazon SES | メール送信 | EMAIL_MODE=smtp に変更 |
| Secrets Manager | 機密情報管理 | DB接続文字列・SES認証情報等 |
| GitHub Actions | CI/CD自動化 | main push 時に自動実行 |

### 月額コスト目安

| サービス | 月額 |
|---|---|
| App Runner | ~$15〜25 |
| RDS t3.micro | ~$14 |
| SES・ECR・Secrets Manager | ~$2 |
| **合計** | **~$30〜40** |

---

## 3. CI/CD フロー（GitHub Actions）

```yaml
# トリガー: main ブランチへの push
on:
  push:
    branches: [main]

# ステップ:
# 1. npm test → 失敗時はデプロイ停止
# 2. docker build (linux/amd64)
# 3. ECR へ push (latest + SHA タグ)
# 4. App Runner デプロイ開始
```

### GitHub Secrets

| Secret 名 | 内容 |
|---|---|
| `AWS_ACCESS_KEY_ID` | デプロイ用 IAM ユーザーキー |
| `AWS_SECRET_ACCESS_KEY` | 同上 |
| `AWS_REGION` | `ap-northeast-1` |
| `ECR_REPOSITORY` | ECR リポジトリ URI |
| `APP_RUNNER_SERVICE_ARN` | App Runner サービス ARN |

---

## 4. データベース移行（SQLite → PostgreSQL）

### スキーマ変更

```diff
# prisma/schema.prisma
- provider = "sqlite"
+ provider = "postgresql"
```

長文・JSONフィールドに `@db.Text` アノテーションを追加。

### 接続文字列

```
DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/maildispatcher"
```

Secrets Manager に保存し App Runner から参照する。

### マイグレーション戦略

| フェーズ | 方法 |
|---|---|
| ローカル開発 | `.env` に PostgreSQL（Docker）を設定 |
| GitHub Actions CI | PostgreSQL サービスコンテナを起動してテスト |
| 本番デプロイ | コンテナ起動時に `prisma migrate deploy` を自動実行 |

初回データは `seed:demo` で投入。既存データ移行は不要。

---

## 5. 環境変数・Secrets・IAM

### 環境変数管理方針

| 種別 | 変数名 | 管理場所 |
|---|---|---|
| 機密 | `DATABASE_URL` | Secrets Manager |
| 機密 | `SESSION_SECRET` | Secrets Manager |
| 機密 | `SES_SMTP_USER` | Secrets Manager |
| 機密 | `SES_SMTP_PASS` | Secrets Manager |
| 非機密 | `NODE_ENV=production` | App Runner 環境変数 |
| 非機密 | `EMAIL_MODE=smtp` | App Runner 環境変数 |
| 非機密 | `DEMO_MODE=false` | App Runner 環境変数 |
| 非機密 | `PORT=3000` | App Runner 環境変数 |

### IAM ロール（最小権限）

| ロール | 権限 |
|---|---|
| App Runner インスタンスロール | `secretsmanager:GetSecretValue`（指定シークレットのみ）、`ses:SendEmail` |
| GitHub Actions デプロイ IAM ユーザー | `ecr:*`（自リポジトリのみ）、`apprunner:StartDeployment` |

### ネットワーク

- RDS は VPC プライベートサブネット（外部から直接アクセス不可）
- App Runner → RDS は **VPC Connector** 経由で接続
- App Runner → SES はパブリックエンドポイント経由（VPC不要）

---

## 6. 非機能要件

| 項目 | 方針 |
|---|---|
| HTTPS | App Runner が自動提供（証明書管理不要）|
| スケーリング | App Runner オートスケール（最小1インスタンス）|
| バックアップ | RDS 自動バックアップ（7日間保持）|
| ログ | App Runner → CloudWatch Logs に自動転送 |
| ヘルスチェック | App Runner デフォルト（`/` への HTTP チェック）|

---

## 7. 実装スコープ外

- カスタムドメイン設定（後から追加可能）
- マルチAZ・リードレプリカ（小規模のため不要）
- Lambda によるスケジューラー分離（シンプル優先）
- WAF・Shield（コスト対効果で後回し）
