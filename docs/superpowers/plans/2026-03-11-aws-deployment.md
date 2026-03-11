# AWS デプロイ実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** mail-dispatcher を AWS（App Runner + RDS PostgreSQL + SES）へ本番デプロイし、main ブランチ push で GitHub Actions が自動ビルド・デプロイする CI/CD を構築する。

**Architecture:** GitHub Actions が npm test → docker build → ECR push → App Runner デプロイを自動実行。アプリは App Runner 上のコンテナで動作し、VPC Connector 経由でプライベートサブネットの RDS PostgreSQL に接続。メール送信は Amazon SES SMTP を使用。

**Tech Stack:** Next.js 16, Prisma 7 (PostgreSQL), Amazon App Runner, Amazon RDS (PostgreSQL 16), Amazon SES, Amazon ECR, GitHub Actions, AWS Secrets Manager

---

## Chunk 1: PostgreSQL 移行（アプリコード変更）

### Task 1: ローカル開発用 PostgreSQL 環境を作成する

**Files:**
- Create: `docker-compose.dev.yml`
- Create: `.env.example`

- [ ] **Step 1: docker-compose.dev.yml を作成する**

```yaml
# docker-compose.dev.yml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: maildispatcher
      POSTGRES_PASSWORD: localpass
      POSTGRES_DB: maildispatcher
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 2: .env.example を作成する**

```bash
# .env.example

# ─── Database ───────────────────────────────
DATABASE_URL="postgresql://maildispatcher:localpass@localhost:5432/maildispatcher"

# ─── Auth ───────────────────────────────────
SESSION_SECRET="change-me-in-production-32chars+"

# ─── Email ──────────────────────────────────
# ローカル開発は console モード
EMAIL_MODE=console
DEMO_MODE=false
NEXT_PUBLIC_DEMO_MODE=false

# 本番(SES) は smtp モードに切り替え
# EMAIL_MODE=smtp
# SMTP_HOST=email-smtp.ap-northeast-1.amazonaws.com
# SMTP_PORT=587
# SMTP_USER=AKIAxxx          # SES SMTP ユーザー名
# SMTP_PASS=xxx              # SES SMTP パスワード
# MAIL_FROM=noreply@yourdomain.com
```

- [ ] **Step 3: .env.example を git に追加する（.env は追加しない）**

`.gitignore` に `.env` が入っていることを確認してから:
```bash
git add docker-compose.dev.yml .env.example
git commit -m "chore: add docker-compose.dev.yml and .env.example for PostgreSQL dev setup"
```

---

### Task 2: Prisma スキーマを PostgreSQL に変更する

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: datasource を sqlite から postgresql に変更する**

`prisma/schema.prisma` の datasource ブロックを以下に置き換える:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

（変更前: `provider = "sqlite"` で `url` フィールドなし）

- [ ] **Step 2: ローカル PostgreSQL を起動して migrate する**

```bash
docker compose -f docker-compose.dev.yml up -d
```

`.env` に DATABASE_URL を設定してから:
```bash
DATABASE_URL="postgresql://maildispatcher:localpass@localhost:5432/maildispatcher" \
  npx prisma migrate dev --name switch-to-postgresql
```

期待: マイグレーションが成功して `prisma/migrations/` にファイルが作成される。

- [ ] **Step 3: Prisma クライアントを再生成する**

```bash
DATABASE_URL="postgresql://maildispatcher:localpass@localhost:5432/maildispatcher" \
  npx prisma generate
```

期待: エラーなく完了。

- [ ] **Step 4: コミットする**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: migrate Prisma schema from SQLite to PostgreSQL"
```

---

### Task 3: prisma.ts から better-sqlite3 アダプターを削除する

**Files:**
- Modify: `src/lib/prisma.ts`

- [ ] **Step 1: prisma.ts を書き換える**

現在: better-sqlite3 アダプターを使用している。PostgreSQL では不要なので標準クライアントに変更する。

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: テストを実行して既存テストが壊れていないことを確認する**

```bash
npm test
```

期待: 47 tests passed（prisma はモックされているので DB 接続不要）

- [ ] **Step 3: コミットする**

```bash
git add src/lib/prisma.ts
git commit -m "refactor: remove better-sqlite3 adapter, use standard PrismaClient for PostgreSQL"
```

---

### Task 4: better-sqlite3 パッケージを削除し Dockerfile を更新する

**Files:**
- Modify: `package.json`
- Modify: `Dockerfile`

- [ ] **Step 1: better-sqlite3 関連パッケージをアンインストールする**

```bash
npm uninstall @prisma/adapter-better-sqlite3 better-sqlite3
```

期待: package.json の dependencies から削除される。

- [ ] **Step 2: Dockerfile を更新する（ネイティブビルドツール不要になる）**

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production PORT=3000

# seed:demo は本番では実行しない（DEMO_MODE=false）
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

（変更点: `python3 make g++` のインストール行を削除、CMD から `seed:demo` を削除）

- [ ] **Step 3: docker build がローカルで通ることを確認する**

```bash
docker build -t mail-dispatcher:test .
```

期待: エラーなくビルド完了。

- [ ] **Step 4: コミットする**

```bash
git add package.json package-lock.json Dockerfile
git commit -m "chore: remove better-sqlite3, simplify Dockerfile for PostgreSQL"
```

---

## Chunk 2: SES SMTP 有効化・GitHub Actions 作成

### Task 5: SES SMTP を有効化する

**Files:**
- Modify: `src/lib/email/index.ts`

- [ ] **Step 1: index.ts のコメントアウトを外す**

現在 `sendEmailSMTP` の import と呼び出しがコメントアウトされている。以下に書き換える:

```typescript
// src/lib/email/index.ts
import { SendEmailArgs, SendEmailResult } from "./types";
import { sendEmailConsole } from "./sender.console";
import { sendEmailSMTP } from "./sender.smtp";

const MODE =
  process.env.DEMO_MODE === "true" ? "console" : (process.env.EMAIL_MODE ?? "console");

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  if (MODE === "smtp") {
    return sendEmailSMTP(args);
  }
  return sendEmailConsole(args);
}
```

- [ ] **Step 2: テストを実行する（sendEmail は vi.mock されているので影響なし）**

```bash
npm test
```

期待: 47 tests passed

- [ ] **Step 3: コミットする**

```bash
git add src/lib/email/index.ts
git commit -m "feat: enable SES SMTP mode in email sender"
```

---

### Task 6: GitHub Actions CI/CD ワークフローを作成する

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: ワークフローファイルを作成する**

```yaml
# .github/workflows/deploy.yml
name: Test, Build, Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          SESSION_SECRET: test-secret-for-ci

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image to ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
            $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Deploy to App Runner
        env:
          APP_RUNNER_SERVICE_ARN: ${{ secrets.APP_RUNNER_SERVICE_ARN }}
        run: |
          aws apprunner start-deployment \
            --service-arn $APP_RUNNER_SERVICE_ARN
```

- [ ] **Step 2: コミットしてプッシュする（この時点では AWS Secrets 未設定なのでデプロイステップは失敗するが、テストとビルドが通ることを確認）**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for test, build, deploy to AWS"
git push origin main
```

- [ ] **Step 3: GitHub Actions の結果を確認する**

GitHub リポジトリの Actions タブを開き:
- `Run tests` ステップが PASS していること
- AWS credentials ステップで失敗していること（Secrets 未設定のため、これは正常）

---

## Chunk 3: AWS インフラ構築（手動手順）

> **前提:** AWS CLI がインストール・設定済みであること。`aws configure` で ap-northeast-1 リージョンが設定されていること。

### Task 7: ECR リポジトリを作成する

- [ ] **Step 1: ECR リポジトリを作成する**

```bash
aws ecr create-repository \
  --repository-name mail-dispatcher \
  --region ap-northeast-1
```

期待: レスポンスの `repositoryUri`（例: `123456789.dkr.ecr.ap-northeast-1.amazonaws.com/mail-dispatcher`）をメモする。

- [ ] **Step 2: GitHub Secrets に ECR 情報を登録する**

GitHub リポジトリ → Settings → Secrets and variables → Actions → New repository secret:

| Secret 名 | 値 |
|---|---|
| `AWS_REGION` | `ap-northeast-1` |
| `ECR_REPOSITORY` | `mail-dispatcher`（リポジトリ名のみ） |

---

### Task 8: VPC・サブネット・RDS を構築する

- [ ] **Step 1: 既存 VPC の ID を確認する（デフォルト VPC を使用）**

```bash
aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query "Vpcs[0].VpcId" --output text
```

メモ: `vpc-xxxxxxxxx`

- [ ] **Step 2: プライベートサブネットを2つ作成する（RDS の Multi-AZ 要件）**

```bash
# AZ: ap-northeast-1a
aws ec2 create-subnet \
  --vpc-id <VPC_ID> \
  --cidr-block 10.0.10.0/24 \
  --availability-zone ap-northeast-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=mail-dispatcher-private-1a}]'

# AZ: ap-northeast-1c
aws ec2 create-subnet \
  --vpc-id <VPC_ID> \
  --cidr-block 10.0.11.0/24 \
  --availability-zone ap-northeast-1c \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=mail-dispatcher-private-1c}]'
```

両方のサブネット ID をメモする。

- [ ] **Step 3: RDS 用セキュリティグループを作成する**

```bash
aws ec2 create-security-group \
  --group-name mail-dispatcher-rds-sg \
  --description "RDS PostgreSQL for mail-dispatcher" \
  --vpc-id <VPC_ID>
```

セキュリティグループ ID をメモ: `sg-xxxxxxxxx`

```bash
# App Runner からのポート 5432 を許可（後で App Runner SG の ID に変更）
aws ec2 authorize-security-group-ingress \
  --group-id <RDS_SG_ID> \
  --protocol tcp \
  --port 5432 \
  --cidr 10.0.0.0/8
```

- [ ] **Step 4: RDS サブネットグループを作成する**

```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name mail-dispatcher-subnet-group \
  --db-subnet-group-description "mail-dispatcher RDS subnet group" \
  --subnet-ids <SUBNET_ID_1A> <SUBNET_ID_1C>
```

- [ ] **Step 5: RDS PostgreSQL インスタンスを作成する**

```bash
aws rds create-db-instance \
  --db-instance-identifier mail-dispatcher-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username maildispatcher \
  --master-user-password <DB_PASSWORD> \
  --db-name maildispatcher \
  --db-subnet-group-name mail-dispatcher-subnet-group \
  --vpc-security-group-ids <RDS_SG_ID> \
  --no-publicly-accessible \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --no-multi-az
```

期待: ステータスが `creating` → `available` になるまで約10分待つ。

```bash
aws rds describe-db-instances \
  --db-instance-identifier mail-dispatcher-db \
  --query "DBInstances[0].Endpoint.Address" --output text
```

RDS エンドポイント（例: `mail-dispatcher-db.xxxx.ap-northeast-1.rds.amazonaws.com`）をメモする。

---

### Task 9: Amazon SES を設定する

- [ ] **Step 1: 送信元メールアドレス（またはドメイン）を検証する**

AWS コンソール → SES → Verified identities → Create identity

メールアドレス検証の場合:
```bash
aws ses verify-email-identity \
  --email-address noreply@yourdomain.com \
  --region ap-northeast-1
```

検証メールが届いたらリンクをクリックする。

- [ ] **Step 2: SES SMTP 認証情報を作成する**

AWS コンソール → SES → SMTP settings → Create SMTP credentials

または IAM ユーザー経由で作成:
```bash
aws iam create-user --user-name mail-dispatcher-ses-smtp

aws iam attach-user-policy \
  --user-name mail-dispatcher-ses-smtp \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

aws iam create-access-key --user-name mail-dispatcher-ses-smtp
```

AccessKeyId と SecretAccessKey を SES SMTP 形式に変換（AWS コンソールの SMTP settings ページで案内される）。SMTP ユーザー名とパスワードをメモする。

---

### Task 10: Secrets Manager にシークレットを登録する

- [ ] **Step 1: DATABASE_URL を登録する**

```bash
aws secretsmanager create-secret \
  --name mail-dispatcher/DATABASE_URL \
  --secret-string "postgresql://maildispatcher:<DB_PASSWORD>@<RDS_ENDPOINT>:5432/maildispatcher" \
  --region ap-northeast-1
```

- [ ] **Step 2: SESSION_SECRET を登録する**

```bash
aws secretsmanager create-secret \
  --name mail-dispatcher/SESSION_SECRET \
  --secret-string "$(openssl rand -base64 32)" \
  --region ap-northeast-1
```

- [ ] **Step 3: SES SMTP 認証情報を登録する**

```bash
aws secretsmanager create-secret \
  --name mail-dispatcher/SMTP_USER \
  --secret-string "<SES_SMTP_USERNAME>" \
  --region ap-northeast-1

aws secretsmanager create-secret \
  --name mail-dispatcher/SMTP_PASS \
  --secret-string "<SES_SMTP_PASSWORD>" \
  --region ap-northeast-1
```

4つのシークレット ARN をメモする。

---

### Task 11: IAM ロール・ユーザーを作成する

- [ ] **Step 1: App Runner インスタンスロールを作成する**

```bash
# 信頼ポリシー
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "tasks.apprunner.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
  --role-name mail-dispatcher-apprunner-instance \
  --assume-role-policy-document file://trust-policy.json
```

- [ ] **Step 2: インスタンスロールに権限ポリシーをアタッチする**

```bash
# Secrets Manager 読み取りポリシー
cat > secrets-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "secretsmanager:GetSecretValue",
    "Resource": [
      "arn:aws:secretsmanager:ap-northeast-1:<ACCOUNT_ID>:secret:mail-dispatcher/*"
    ]
  }]
}
EOF

aws iam put-role-policy \
  --role-name mail-dispatcher-apprunner-instance \
  --policy-name SecretsManagerAccess \
  --policy-document file://secrets-policy.json
```

- [ ] **Step 3: GitHub Actions デプロイ用 IAM ユーザーを作成する**

```bash
aws iam create-user --user-name mail-dispatcher-github-actions

cat > deploy-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:ap-northeast-1:<ACCOUNT_ID>:repository/mail-dispatcher"
    },
    {
      "Effect": "Allow",
      "Action": ["apprunner:StartDeployment"],
      "Resource": "<APP_RUNNER_SERVICE_ARN>"
    }
  ]
}
EOF

aws iam put-user-policy \
  --user-name mail-dispatcher-github-actions \
  --policy-name DeployPolicy \
  --policy-document file://deploy-policy.json

aws iam create-access-key --user-name mail-dispatcher-github-actions
```

AccessKeyId と SecretAccessKey をメモする（次の Task で GitHub Secrets に登録）。

---

### Task 12: App Runner サービスを作成する

- [ ] **Step 1: VPC Connector を作成する（App Runner → RDS 接続用）**

```bash
aws apprunner create-vpc-connector \
  --vpc-connector-name mail-dispatcher-vpc-connector \
  --subnets <SUBNET_ID_1A> <SUBNET_ID_1C> \
  --security-groups <RDS_SG_ID>
```

VPC Connector ARN をメモする。

- [ ] **Step 2: App Runner サービス定義 JSON を作成する**

```bash
cat > apprunner-service.json << 'EOF'
{
  "ServiceName": "mail-dispatcher",
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "<ECR_REGISTRY>/mail-dispatcher:latest",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "EMAIL_MODE": "smtp",
          "DEMO_MODE": "false",
          "NEXT_PUBLIC_DEMO_MODE": "false",
          "SMTP_HOST": "email-smtp.ap-northeast-1.amazonaws.com",
          "SMTP_PORT": "587",
          "MAIL_FROM": "noreply@yourdomain.com"
        },
        "RuntimeEnvironmentSecrets": {
          "DATABASE_URL": "arn:aws:secretsmanager:ap-northeast-1:<ACCOUNT_ID>:secret:mail-dispatcher/DATABASE_URL-xxxx",
          "SESSION_SECRET": "arn:aws:secretsmanager:ap-northeast-1:<ACCOUNT_ID>:secret:mail-dispatcher/SESSION_SECRET-xxxx",
          "SMTP_USER": "arn:aws:secretsmanager:ap-northeast-1:<ACCOUNT_ID>:secret:mail-dispatcher/SMTP_USER-xxxx",
          "SMTP_PASS": "arn:aws:secretsmanager:ap-northeast-1:<ACCOUNT_ID>:secret:mail-dispatcher/SMTP_PASS-xxxx"
        }
      },
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": false
  },
  "InstanceConfiguration": {
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB",
    "InstanceRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/mail-dispatcher-apprunner-instance"
  },
  "NetworkConfiguration": {
    "EgressConfiguration": {
      "EgressType": "VPC",
      "VpcConnectorArn": "<VPC_CONNECTOR_ARN>"
    }
  },
  "HealthCheckConfiguration": {
    "Protocol": "HTTP",
    "Path": "/",
    "Interval": 20,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }
}
EOF
```

- [ ] **Step 3: 初回デプロイ前に ECR に最初のイメージを手動プッシュする**

```bash
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <ECR_REGISTRY>

docker build -t mail-dispatcher .
docker tag mail-dispatcher:latest <ECR_REGISTRY>/mail-dispatcher:latest
docker push <ECR_REGISTRY>/mail-dispatcher:latest
```

- [ ] **Step 4: App Runner サービスを作成する**

```bash
aws apprunner create-service \
  --cli-input-json file://apprunner-service.json
```

期待: `Status: OPERATION_IN_PROGRESS` → 数分後に `RUNNING` になる。

```bash
aws apprunner describe-service \
  --service-arn <SERVICE_ARN> \
  --query "Service.ServiceUrl" --output text
```

表示された URL（例: `xxxxx.ap-northeast-1.awsapprunner.com`）をブラウザで開いてログイン画面が表示されることを確認する。

---

### Task 13: GitHub Secrets を登録して CI/CD を完成させる

- [ ] **Step 1: 残りの GitHub Secrets を登録する**

GitHub リポジトリ → Settings → Secrets and variables → Actions:

| Secret 名 | 値 |
|---|---|
| `AWS_ACCESS_KEY_ID` | Task 11 で作成した IAM ユーザーのキー |
| `AWS_SECRET_ACCESS_KEY` | 同上 |
| `APP_RUNNER_SERVICE_ARN` | Task 12 の App Runner サービス ARN |

- [ ] **Step 2: main に空コミットをプッシュして CI/CD をテストする**

```bash
git commit --allow-empty -m "ci: trigger initial GitHub Actions deploy test"
git push origin main
```

- [ ] **Step 3: GitHub Actions の全ステップが成功することを確認する**

GitHub リポジトリの Actions タブで:
- `Run tests` → ✅ PASS
- `Build and push Docker image to ECR` → ✅ PASS
- `Deploy to App Runner` → ✅ PASS

- [ ] **Step 4: App Runner の URL でアプリが動作することを最終確認する**

1. ログイン画面が表示される
2. デモシードを手動実行: App Runner コンソール → サービス → ログ → または初回のみ `seed:demo` を手動実行
3. ログインしてダッシュボード・連絡先・テンプレートが表示される
4. テストメール送信が SES 経由で届く

---

## 完了条件

- [ ] `git push origin main` で GitHub Actions が自動実行される
- [ ] テストが失敗した場合はデプロイが止まる
- [ ] App Runner の URL でアプリが HTTPS でアクセスできる
- [ ] RDS PostgreSQL にデータが保存される
- [ ] SES 経由でメールが送信される
- [ ] Secrets Manager で機密情報が管理されている
