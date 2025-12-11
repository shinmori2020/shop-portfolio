# 【第5段階】リリース準備
# 9. デプロイ手順書

---

## 📋 ドキュメント情報

- **作成日**: 2025年10月2日
- **ドキュメント番号**: 09
- **ステータス**: 作成中
- **作成順序**: 9/12

---

## 🎯 このドキュメントの目的

このドキュメントでは、TechGear Storeを**本番環境にデプロイする手順**を記載します。

**開発環境、ステージング環境、本番環境それぞれのデプロイ方法を明確にします。**

---

## 🌍 環境構成

### 環境の種類

```
開発環境 (Development)
├─ ローカル開発サーバー
├─ URL: http://localhost:5173
└─ 用途: 開発・デバッグ

ステージング環境 (Staging)
├─ テスト用本番環境
├─ URL: https://staging.techgearstore.com
└─ 用途: 本番デプロイ前の最終確認

本番環境 (Production)
├─ 実際のユーザーがアクセスする環境
├─ URL: https://www.techgearstore.com
└─ 用途: 本番運用
```

---

## 🔧 使用サービス

### フロントエンド
- **ホスティング**: Vercel（推奨）または Netlify
- **CDN**: 自動設定
- **SSL**: 自動設定

### バックエンド
- **Firebase**
  - Authentication
  - Firestore Database
  - Storage
  - Hosting（オプション）

### 決済
- **Stripe**
  - テストモード → 本番モード

### ドメイン
- **ドメイン登録**: お名前.com、Google Domains等
- **DNS**: Vercel/Netlifyが自動設定

---

## 📦 1. Vercelへのデプロイ

### 1.1 前提条件

#### 必要なもの
- [ ] GitHubアカウント
- [ ] Vercelアカウント（GitHubでサインアップ推奨）
- [ ] プロジェクトがGitHubにプッシュ済み
- [ ] 本番用の環境変数を準備

---

### 1.2 Vercelアカウント作成

#### ステップ1: サインアップ

```
1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択
4. GitHubで認証
```

#### ステップ2: チーム作成（オプション）

```
個人用: Personal Account
チーム用: Create Team
```

---

### 1.3 プロジェクトのインポート

#### ステップ1: 新規プロジェクト作成

```
1. Vercelダッシュボードで「Add New...」→「Project」
2. GitHubリポジトリから「techgear-store」を選択
3. 「Import」をクリック
```

#### ステップ2: プロジェクト設定

```yaml
Project Name: techgear-store
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

### 1.4 環境変数の設定

#### 必要な環境変数

```bash
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# その他
VITE_API_URL=https://api.techgearstore.com
VITE_ENV=production
```

#### 設定方法

```
1. Project Settings → Environment Variables
2. Name: VITE_FIREBASE_API_KEY
3. Value: （値を入力）
4. Environment: Production（本番用）
5. 「Save」をクリック
6. すべての環境変数を登録
```

#### 環境別設定

```
Development:   開発用の値
Preview:       ステージング用の値
Production:    本番用の値
```

---

### 1.5 デプロイ実行

#### 初回デプロイ

```
1. 「Deploy」ボタンをクリック
2. ビルドが開始される
3. 数分で完了（初回は長め）
4. デプロイ完了！
```

#### デプロイURL

```
自動生成URL: https://techgear-store-xxxxx.vercel.app
カスタムドメイン: https://www.techgearstore.com（後で設定）
```

---

### 1.6 自動デプロイ設定

#### main ブランチ → 本番環境

```yaml
1. GitHubのmainブランチにpush
2. Vercelが自動でビルド＆デプロイ
3. 本番環境に反映
```

#### その他のブランチ → プレビュー環境

```yaml
1. feature/xxxブランチにpush
2. Vercelがプレビュー環境を自動生成
3. PRにプレビューURLがコメントされる
```

---

### 1.7 カスタムドメイン設定

#### ステップ1: ドメイン追加

```
1. Project Settings → Domains
2. 「Add」をクリック
3. ドメイン名を入力: www.techgearstore.com
4. 「Add」をクリック
```

#### ステップ2: DNS設定

```
ドメイン登録業者（お名前.com等）で以下を設定:

レコードタイプ: CNAME
ホスト名: www
値: cname.vercel-dns.com
TTL: 3600
```

#### ステップ3: SSL証明書

```
Vercelが自動でLet's EncryptのSSL証明書を発行
数分～数時間で有効化
```

#### ステップ4: リダイレクト設定

```
techgearstore.com → www.techgearstore.com
自動でリダイレクト設定される
```

---

## 🔥 2. Firebaseの本番設定

### 2.1 本番用Firebaseプロジェクト作成

#### ステップ1: 新規プロジェクト作成

```
1. https://console.firebase.google.com にアクセス
2. 「プロジェクトを追加」
3. プロジェクト名: techgear-store-prod
4. Google Analyticsを有効化（推奨）
5. 「プロジェクトを作成」
```

---

### 2.2 Firebase Authentication設定

#### ステップ1: 認証方法を有効化

```
1. Authentication → Sign-in method
2. メール/パスワード → 有効にする
3. Google → 有効にする
   - プロジェクト名: TechGear Store
   - サポートメール: support@techgearstore.com
   - 承認済みドメイン: www.techgearstore.com を追加
```

#### ステップ2: 承認済みドメイン追加

```
1. Authentication → Settings → Authorized domains
2. 「ドメインを追加」
3. www.techgearstore.com
4. staging.techgearstore.com（ステージング用）
```

---

### 2.3 Firestore Database設定

#### ステップ1: データベース作成

```
1. Firestore Database → Create database
2. 本番モードで開始
3. ロケーション: asia-northeast1（東京）
4. 「有効にする」
```

#### ステップ2: セキュリティルール設定

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ユーザーコレクション
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 商品コレクション（全員読み取り可、管理者のみ書き込み可）
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 注文コレクション（自分の注文のみ閲覧可）
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // レビューコレクション
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (resource.data.userId == request.auth.uid || 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

#### ステップ3: インデックス作成

```
必要に応じて複合インデックスを作成:

コレクション: products
フィールド: category (Ascending), createdAt (Descending)

コレクション: orders
フィールド: userId (Ascending), createdAt (Descending)
```

---

### 2.4 Firebase Storage設定

#### ステップ1: Storage有効化

```
1. Storage → Get started
2. 本番モードで開始
3. ロケーション: asia-northeast1（東京）
```

#### ステップ2: セキュリティルール設定

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // 商品画像（管理者のみアップロード可、全員読み取り可）
    match /products/{productId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ユーザープロフィール画像（本人のみ）
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // レビュー画像
    match /reviews/{reviewId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### ステップ3: CORSの設定

```json
[
  {
    "origin": ["https://www.techgearstore.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

```bash
# Google Cloud SDKで設定
gsutil cors set cors.json gs://your-bucket-name.appspot.com
```

---

### 2.5 初期データのインポート

#### 商品データのインポート

```typescript
// scripts/import-products.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import productsData from './products.json';

const firebaseConfig = {
  // 本番用の設定
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importProducts() {
  for (const product of productsData) {
    await setDoc(doc(db, 'products', product.id), product);
    console.log(`Imported: ${product.name}`);
  }
  console.log('Import complete!');
}

importProducts();
```

```bash
# 実行
npm run import-products
```

---

## 💳 3. Stripeの本番設定

### 3.1 本番モードへの切り替え

#### ステップ1: アカウント情報の確認

```
1. Stripe Dashboard → Settings → Account details
2. 会社情報を入力
   - 会社名
   - 住所
   - 電話番号
   - サポートメール
3. 保存
```

#### ステップ2: 本番モードを有効化

```
1. 左上の「テストモード」トグルをOFF
2. 本番モードに切り替わる
3. 本番用APIキーが表示される
```

---

### 3.2 本番用APIキーの取得

#### APIキーの種類

```
公開可能キー (Publishable Key)
├─ フロントエンドで使用
├─ 公開しても安全
└─ pk_live_xxxxx

秘密キー (Secret Key)
├─ バックエンドで使用
├─ 絶対に公開しない
└─ sk_live_xxxxx
```

#### 取得方法

```
1. Developers → API keys
2. Publishable key をコピー → Vercelの環境変数に設定
3. Secret key をコピー → Firebaseの環境変数に設定（Cloud Functions使用時）
```

---

### 3.3 Webhook設定

#### ステップ1: Webhookエンドポイント作成

```
本番用URL: https://www.techgearstore.com/api/stripe-webhook
```

#### ステップ2: Webhookの登録

```
1. Developers → Webhooks
2. 「Add endpoint」
3. Endpoint URL: https://www.techgearstore.com/api/stripe-webhook
4. Events to send:
   ☑ payment_intent.succeeded
   ☑ payment_intent.payment_failed
   ☑ charge.refunded
5. 「Add endpoint」
```

#### ステップ3: Signing secretの保存

```
Webhook signing secret: whsec_xxxxx
→ Vercelの環境変数に設定: STRIPE_WEBHOOK_SECRET
```

---

### 3.4 決済方法の設定

#### 有効化する決済方法

```
1. Settings → Payment methods
2. 以下を有効化:
   ☑ カード
   ☑ Apple Pay
   ☑ Google Pay
   ☑ コンビニ決済（日本）
   ☑ 銀行振込（日本）
```

#### 通貨設定

```
Primary currency: JPY（日本円）
```

---

### 3.5 テスト決済の実施

#### テストカード（本番モードでも使用可）

```
カード番号: 4242 4242 4242 4242
有効期限: 12/25（未来の日付）
CVC: 123
郵便番号: 12345
```

#### 確認事項

- [ ] 決済が正常に完了する
- [ ] Webhookが正しく受信される
- [ ] 注文がFirestoreに保存される
- [ ] 確認メールが送信される（設定済みの場合）

---

## 🌐 4. DNS・ドメイン設定

### 4.1 ドメイン取得

#### 推奨レジストラ

```
- Google Domains
- お名前.com
- Cloudflare Registrar
```

#### ドメイン例

```
メインドメイン: techgearstore.com
WWW: www.techgearstore.com
ステージング: staging.techgearstore.com
API: api.techgearstore.com（必要に応じて）
```

---

### 4.2 DNS設定

#### Vercel用のDNS設定

```
レコードタイプ: CNAME
ホスト名: www
値: cname.vercel-dns.com
TTL: 3600

レコードタイプ: A
ホスト名: @
値: 76.76.21.21
TTL: 3600
```

#### ステージング環境用

```
レコードタイプ: CNAME
ホスト名: staging
値: cname.vercel-dns.com
TTL: 3600
```

---

### 4.3 SSL証明書

#### Vercelの自動SSL

```
✅ Vercelが自動でLet's EncryptのSSL証明書を発行
✅ 自動更新
✅ 追加設定不要
```

#### 確認方法

```
1. ブラウザでhttps://www.techgearstore.com にアクセス
2. アドレスバーの鍵マークをクリック
3. 証明書が有効か確認
```

---

## 🤖 5. CI/CD設定（GitHub Actions）

### 5.1 ワークフロー作成

#### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:ci
      
      - name: Run build
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

### 5.2 デプロイワークフロー

#### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### 5.3 GitHub Secretsの設定

```
1. GitHubリポジトリ → Settings → Secrets and variables → Actions
2. 「New repository secret」
3. 以下のシークレットを追加:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_STRIPE_PUBLISHABLE_KEY
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
```

---

## ✅ 6. デプロイチェックリスト

### 本番デプロイ前の確認

#### コード品質

- [ ] すべてのテストがパスする
- [ ] Lintエラーがない
- [ ] TypeScriptのエラーがない
- [ ] ビルドが成功する
- [ ] 未使用のコードを削除済み

#### 環境設定

- [ ] 本番用環境変数を設定済み
- [ ] FirebaseのセキュリティルールをReview済み
- [ ] Stripeの本番モードに切り替え済み
- [ ] Webhookの設定が完了

#### 機能確認

- [ ] 商品一覧・詳細が表示される
- [ ] カートが機能する
- [ ] ユーザー登録・ログインが機能する
- [ ] 決済が完了する
- [ ] 注文履歴が表示される
- [ ] 管理画面が機能する

#### パフォーマンス

- [ ] Lighthouseスコアが90以上
- [ ] 画像が最適化されている
- [ ] 不要なJSが削除されている
- [ ] キャッシュが設定されている

#### SEO

- [ ] メタタグが設定されている
- [ ] OGP画像が設定されている
- [ ] サイトマップが生成されている
- [ ] robots.txtが設定されている

#### セキュリティ

- [ ] HTTPS接続
- [ ] 環境変数が安全に管理されている
- [ ] APIキーがコードに含まれていない
- [ ] CORS設定が適切

---

## 🚨 7. トラブルシューティング

### ビルドエラー

#### エラー: "Module not found"

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### エラー: "Type error"

```bash
# TypeScriptの型チェック
npm run type-check

# エラー箇所を修正
```

---

### デプロイエラー

#### Vercelでビルドが失敗

```
1. Vercelのビルドログを確認
2. ローカルで npm run build が成功するか確認
3. 環境変数が正しく設定されているか確認
```

#### 環境変数が反映されない

```
1. Vercel → Project Settings → Environment Variables
2. 環境変数を再度確認・保存
3. 再デプロイ
```

---

### Firebase接続エラー

#### エラー: "Permission denied"

```
1. Firestoreのセキュリティルールを確認
2. 認証状態を確認
3. ユーザーの権限を確認
```

#### エラー: "Quota exceeded"

```
1. Firebaseコンソールで使用量を確認
2. 必要に応じてプランをアップグレード
3. インデックスを最適化
```

---

### Stripe決済エラー

#### テストカードが使えない

```
1. Stripeが本番モードになっていないか確認
2. テストモードに切り替え
3. 正しいテストカード番号を使用
```

#### Webhookが受信されない

```
1. Webhook URLが正しいか確認
2. Stripeダッシュボードでイベントログを確認
3. Signing secretが正しく設定されているか確認
```

---

## 📊 8. モニタリング設定

### Vercel Analytics

```
1. Vercel Dashboard → Project → Analytics
2. 「Enable Analytics」
3. ページビュー、パフォーマンスを確認
```

### Firebase Performance Monitoring

```
1. Firebaseコンソール → Performance
2. 「Get started」
3. SDKを追加（自動で追加される場合あり）
```

### Sentry（エラートラッキング）

```bash
# インストール
npm install @sentry/react

# 設定
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxxxx@sentry.io/xxxxx",
  environment: "production",
});
```

---

## 📝 9. デプロイ後の確認

### 本番環境での最終チェック

- [ ] https://www.techgearstore.com にアクセスできる
- [ ] すべてのページが正常に表示される
- [ ] 商品検索が機能する
- [ ] カートが機能する
- [ ] ユーザー登録・ログインが機能する
- [ ] テスト決済が成功する（小額で）
- [ ] モバイルで正常に表示される
- [ ] Lighthouseスコアが目標値を達成
- [ ] SSL証明書が有効
- [ ] 404ページが表示される
- [ ] リダイレクトが機能する

---

## 📚 関連ドキュメント

- **前のドキュメント**: `08_test-plan.md`（テスト計画）
- **次のドキュメント**: `10_operations-plan.md`（運用・保守計画）
- **参考ドキュメント**: 
  - `03_setup-guide.md`（開発環境のセットアップ）

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|----------|--------|
| 1.0 | 2025/10/02 | 初版作成 | _____ |
| _____ | _____ | _____ | _____ |

---

## 💭 メモ・調整案

**（デプロイ手順に関する自由記入欄）**

```
実際のデプロイで気づいたこと、追加手順、注意点などをメモしてください。









```

---

**デプロイ手順書が完成しました！次は運用・保守計画です！** 🚀
