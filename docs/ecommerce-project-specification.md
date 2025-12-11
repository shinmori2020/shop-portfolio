# Reactとストライプを使ったWEBショッピングサイト 企画書

## 📋 プロジェクト概要

### 基本情報
- **商品タイプ**: 物理的な商品（配送が必要）
- **規模**: 小規模（10-50商品程度）
- **決済方法**: Stripe

---

## 🛠️ 技術スタック

### フロントエンド
- **React** - メインフレームワーク
- **React Router** - ページ遷移
- **Tailwind CSS** - スタイリング
- **Zustand or Redux** - 状態管理（カート、ユーザー情報など）

### 必要なnpmパッケージ

#### コア機能
```bash
# Reactプロジェクト作成（Vite使用）
npm create vite@latest my-shop -- --template react

# ルーティング
npm install react-router-dom

# 状態管理（どちらか選択）
npm install zustand              # シンプルで軽量（推奨）
npm install @reduxjs/toolkit react-redux  # 複雑な状態管理が必要な場合

# スタイリング
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Firebase使用の場合
```bash
npm install firebase
```

#### Supabase使用の場合
```bash
npm install @supabase/supabase-js
```

#### Stripe決済
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install stripe  # サーバーサイド用（Firebase Functionsなど）
```

#### UI/UX補助
```bash
# アイコン
npm install lucide-react

# フォーム管理
npm install react-hook-form

# バリデーション
npm install zod

# トースト通知
npm install react-hot-toast

# 日付処理
npm install date-fns

# 画像アップロード
npm install react-dropzone
```

#### 開発ツール
```bash
# ESLint & Prettier
npm install -D eslint prettier eslint-config-prettier

# 環境変数管理
npm install dotenv
```

### バックエンド＆インフラ（3つの選択肢）

#### Option A: Firebase + Stripe（推奨：最も簡単）
- **Firebase Authentication** - ユーザー認証
- **Firestore** - データベース（商品、注文、レビューなど）
- **Firebase Storage** - 商品画像保存
- **Firebase Functions** - Stripe決済の安全な処理
- **Stripe** - 決済処理

#### Option B: Supabase + Stripe（モダンで機能豊富）
- **Supabase Auth** - 認証
- **Supabase Database (PostgreSQL)** - より複雑なクエリに対応
- **Supabase Storage** - 画像保存
- **Supabase Edge Functions** - サーバーサイド処理
- **Stripe** - 決済処理

#### Option C: フルスタック（最も柔軟）
- **Node.js + Express** - 独自API
- **MongoDB or PostgreSQL** - データベース
- **Stripe** - 決済処理

### デプロイ
- **Vercel** - フロントエンド（無料枠あり、簡単）
- **Netlify** - 代替案
- バックエンドはFirebase/Supabaseなら不要、独自APIならRender/Railway

---

## 🔑 環境変数設定

### `.env.local` ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定します。

#### Firebase使用の場合
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Firebase Functions用（サーバーサイド）
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### Supabase使用の場合
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Supabase Edge Functions用（サーバーサイド）
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 環境変数の取得方法

#### Firebase
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを作成
3. プロジェクト設定 → 全般 → マイアプリ → SDK setup and configuration
4. 構成オブジェクトから各値をコピー

#### Supabase
1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. プロジェクトを作成
3. Settings → API → Project URL と anon public key をコピー

#### Stripe
1. [Stripe Dashboard](https://dashboard.stripe.com/)にアクセス
2. Developers → API keys
3. テストモードで Publishable key と Secret key を取得
4. Webhooks → Add endpoint でWebhook URLを設定し、Signing secretを取得

### セキュリティ注意事項
- `.env.local` は `.gitignore` に必ず追加する
- `VITE_` プレフィックスの変数のみフロントエンドで使用可能
- Secret keyは絶対にフロントエンドで使用しない
- 本番環境では必ず本番用のキーに切り替える

---

## 📊 データ構造

## 📊 データ構造

### データベーススキーマ詳細

#### Firestore使用の場合

```
📁 users (コレクション)
  └─ {userId} (ドキュメント)
      ├─ email: string
      ├─ name: string
      ├─ phone: string (optional)
      ├─ role: 'customer' | 'admin'
      ├─ createdAt: timestamp
      ├─ updatedAt: timestamp
      └─ 📁 addresses (サブコレクション)
          └─ {addressId}
              ├─ fullName: string
              ├─ postalCode: string
              ├─ prefecture: string
              ├─ city: string
              ├─ addressLine: string
              ├─ building: string (optional)
              ├─ phone: string
              └─ isDefault: boolean

📁 products (コレクション)
  └─ {productId} (ドキュメント)
      ├─ name: string
      ├─ description: string
      ├─ price: number
      ├─ category: string
      ├─ images: string[] (画像URL配列)
      ├─ stock: number
      ├─ sku: string
      ├─ isPublished: boolean
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp

📁 orders (コレクション)
  └─ {orderId} (ドキュメント)
      ├─ userId: string
      ├─ orderNumber: string (例: ORD-20250101-0001)
      ├─ items: array [
      │   {
      │     productId: string,
      │     productName: string,
      │     price: number,
      │     quantity: number,
      │     imageUrl: string
      │   }
      ├─ ]
      ├─ subtotal: number
      ├─ shippingFee: number
      ├─ totalAmount: number
      ├─ status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      ├─ shippingAddress: {
      │   fullName: string,
      │   postalCode: string,
      │   prefecture: string,
      │   city: string,
      │   addressLine: string,
      │   building: string,
      │   phone: string
      ├─ }
      ├─ stripePaymentId: string
      ├─ stripePaymentStatus: string
      ├─ trackingNumber: string (optional)
      ├─ carrier: string (optional)
      ├─ adminNotes: string (optional)
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp

📁 reviews (コレクション)
  └─ {reviewId} (ドキュメント)
      ├─ productId: string
      ├─ userId: string
      ├─ userName: string
      ├─ rating: number (1-5)
      ├─ comment: string
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
```

#### Supabase使用の場合（PostgreSQL）

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses Table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  prefecture VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  building VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  images TEXT[], -- 画像URL配列
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  items JSONB NOT NULL, -- 注文商品の配列
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB NOT NULL,
  stripe_payment_id VARCHAR(255),
  stripe_payment_status VARCHAR(50),
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- 1ユーザー1商品につき1レビューのみ
);

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

### Firestoreセキュリティルール例

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Users
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
      
      match /addresses/{addressId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Products
    match /products/{productId} {
      allow read: if true; // 誰でも閲覧可能
      allow create, update, delete: if isAdmin();
    }
    
    // Orders
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update, delete: if isOwner(resource.data.userId) || isAdmin();
    }
  }
}
```

### ローカルストレージ（カート）

```javascript
// localStorage に保存される構造
{
  "cart": [
    {
      "productId": "abc123",
      "productName": "商品名",
      "price": 2980,
      "quantity": 2,
      "imageUrl": "https://...",
      "stock": 10
    }
  ]
}
```

---

```
Users (ユーザー)
---

## 🔌 API設計

### REST API エンドポイント一覧

#### 認証関連（Firebase/Supabase Auth使用）
```
POST   /auth/register          # ユーザー登録
POST   /auth/login             # ログイン
POST   /auth/logout            # ログアウト
POST   /auth/reset-password    # パスワードリセット
GET    /auth/me                # 現在のユーザー情報取得
```

#### 商品関連
```
GET    /api/products                    # 商品一覧取得
GET    /api/products/:id                # 商品詳細取得
GET    /api/products/search?q=keyword   # 商品検索
GET    /api/products/category/:category # カテゴリー別商品取得
POST   /api/products                    # 商品作成（管理者のみ）
PUT    /api/products/:id                # 商品更新（管理者のみ）
DELETE /api/products/:id                # 商品削除（管理者のみ）
```

#### 注文関連
```
GET    /api/orders              # 注文一覧取得（ユーザー：自分の注文、管理者：全注文）
GET    /api/orders/:id          # 注文詳細取得
POST   /api/orders              # 注文作成
PUT    /api/orders/:id/status   # 注文ステータス更新（管理者のみ）
POST   /api/orders/:id/cancel   # 注文キャンセル
```

#### レビュー関連
```
GET    /api/reviews/product/:productId  # 商品のレビュー一覧取得
POST   /api/reviews                     # レビュー投稿
PUT    /api/reviews/:id                 # レビュー更新（本人のみ）
DELETE /api/reviews/:id                 # レビュー削除（本人または管理者）
```

#### 決済関連（Stripe）
```
POST   /api/payment/create-intent       # Payment Intent作成
POST   /api/payment/webhook             # Stripeからのwebhook受信
GET    /api/payment/status/:paymentId   # 決済ステータス確認
POST   /api/payment/refund              # 返金処理（管理者のみ）
```

#### 管理者関連
```
GET    /api/admin/dashboard             # ダッシュボード統計データ
GET    /api/admin/analytics             # 売上分析データ
GET    /api/admin/orders                # 注文管理（フィルター付き）
PUT    /api/admin/orders/:id            # 注文情報更新
```

### APIレスポンス形式

#### 成功時
```json
{
  "success": true,
  "data": {
    // データ本体
  },
  "message": "Success message"
}
```

#### エラー時
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

### 商品取得APIの例

**リクエスト:**
```
GET /api/products?page=1&limit=12&category=electronics&sort=price_asc
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "name": "商品名",
        "description": "商品説明",
        "price": 2980,
        "category": "electronics",
        "images": [
          "https://storage.example.com/image1.jpg"
        ],
        "stock": 50,
        "sku": "ELEC-001",
        "isPublished": true,
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-20T15:45:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 58,
      "itemsPerPage": 12
    }
  }
}
```

### 注文作成APIの例

**リクエスト:**
```
POST /api/orders
Content-Type: application/json
Authorization: Bearer {token}

{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "山田太郎",
    "postalCode": "123-4567",
    "prefecture": "東京都",
    "city": "渋谷区",
    "addressLine": "道玄坂1-2-3",
    "building": "ABCビル4F",
    "phone": "090-1234-5678"
  },
  "paymentMethodId": "pm_xxxxxxxxxxxxx"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_456",
    "orderNumber": "ORD-20250101-0001",
    "clientSecret": "pi_xxxxxxxxxxxxx_secret_yyyyyyyyyyy",
    "totalAmount": 5960
  },
  "message": "注文を作成しました"
}
```

---

## 💳 Stripe決済フロー詳細

### 1. フロントエンド実装

#### Stripeのセットアップ
```javascript
// src/lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
```

#### チェックアウトページでの決済処理
```javascript
// src/pages/Checkout.jsx
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import CheckoutForm from '../components/CheckoutForm';

function Checkout() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Payment Intentを作成
    fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        items: cartItems,
        amount: totalAmount 
      })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  const options = {
    clientSecret,
    appearance: { theme: 'stripe' }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}
```

#### 決済フォームコンポーネント
```javascript
// src/components/CheckoutForm.jsx
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-complete`,
      },
    });

    if (error) {
      console.error(error.message);
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      // 注文を確定
      await createOrder(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || isProcessing}>
        {isProcessing ? '処理中...' : '注文を確定する'}
      </button>
    </form>
  );
}
```

### 2. バックエンド実装（Firebase Functions例）

#### Payment Intent作成
```javascript
// functions/src/payment.js
const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret_key);

exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'ログインが必要です');
  }

  const { items, amount } = data;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // 円→銭に変換
      currency: 'jpy',
      metadata: {
        userId: context.auth.uid,
        items: JSON.stringify(items)
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

#### Webhook処理
```javascript
// functions/src/webhook.js
const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const admin = require('firebase-admin');

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // イベントタイプに応じて処理
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // 注文ステータスを更新
      await admin.firestore()
        .collection('orders')
        .where('stripePaymentId', '==', paymentIntent.id)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.update({
              stripePaymentStatus: 'succeeded',
              status: 'processing',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          });
        });
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      // エラー処理
      console.error('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
```

### 3. Webhook設定

1. Stripe Dashboard → Developers → Webhooks
2. 「Add endpoint」をクリック
3. Endpoint URL: `https://your-functions-url/stripeWebhook`
4. イベント選択:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Signing secretをコピーして環境変数に設定

### 4. エラーハンドリング

```javascript
// 決済エラーの処理
const handlePaymentError = (error) => {
  const errorMessages = {
    'card_declined': 'カードが拒否されました。別のカードをお試しください。',
    'insufficient_funds': '残高不足です。',
    'expired_card': 'カードの有効期限が切れています。',
    'incorrect_cvc': 'セキュリティコードが正しくありません。',
    'processing_error': '処理中にエラーが発生しました。もう一度お試しください。'
  };

  return errorMessages[error.code] || 'エラーが発生しました。';
};
```

### 5. テストモード

#### テスト用カード番号
```
成功: 4242 4242 4242 4242
3Dセキュア認証が必要: 4000 0025 0000 3155
残高不足: 4000 0000 0000 9995
カード拒否: 4000 0000 0000 0002

有効期限: 任意の未来の日付
CVC: 任意の3桁
郵便番号: 任意
```

---

## 📄 必要なページ一覧（全16-21ページ）

### 🛍️ 顧客向けページ（10ページ）

| # | ページ名 | パス | 主要機能 |
|---|---------|------|---------|
| 1 | ホームページ | `/` | ヒーローバナー、注目商品、カテゴリー |
| 2 | 商品一覧 | `/products` | 商品表示、検索・フィルター、並び替え |
| 3 | 商品詳細 | `/products/:id` | 商品情報、カートに追加、レビュー表示・投稿 |
| 4 | ショッピングカート | `/cart` | カート内容確認、数量変更、削除 |
| 5 | チェックアウト | `/checkout` | 配送先入力、Stripe決済 |
| 6 | 注文完了 | `/order-complete` | 注文確認、サンクスメッセージ |
| 7 | ユーザー登録 | `/register` | 新規アカウント作成 |
| 8 | ログイン | `/login` | ログイン認証 |
| 9 | マイページ | `/mypage` | ユーザー情報、注文履歴概要 |
| 10 | 注文履歴詳細 | `/orders/:id` | 個別注文の詳細確認 |

### 🔧 管理者向けページ（6ページ）

| # | ページ名 | パス | 主要機能 |
|---|---------|------|---------|
| 11 | 管理者ダッシュボード | `/admin` | 売上概要、統計、最近の注文 |
| 12 | 商品管理 | `/admin/products` | 商品一覧、検索・フィルター、編集・削除 |
| 13 | 商品追加/編集 | `/admin/products/new`<br>`/admin/products/edit/:id` | 商品情報入力、画像アップロード、在庫管理 |
| 14 | 注文管理 | `/admin/orders` | 注文一覧、ステータス管理、検索・フィルター |
| 15 | 注文詳細 | `/admin/orders/:id` | 注文詳細、ステータス変更、返金処理 |
| 16 | 売上分析 | `/admin/analytics` | グラフ、売上レポート、統計データ |

### 📄 その他ページ（5ページ - オプション）

| # | ページ名 | パス | 主要機能 |
|---|---------|------|---------|
| 17 | About/会社概要 | `/about` | 会社情報、ビジョン |
| 18 | お問い合わせ | `/contact` | お問い合わせフォーム |
| 19 | 利用規約 | `/terms` | 利用規約テキスト表示 |
| 20 | プライバシーポリシー | `/privacy` | プライバシーポリシーテキスト表示 |
| 21 | 404エラー | `/404` | エラーメッセージ、ホームへ戻る |

---

## ⚙️ 各ページの詳細機能

### 1. ホームページ (`/`)
**表示機能**
- ヒーローバナー/メインビジュアル
- 注目商品セクション（ピックアップ）
- カテゴリー一覧
- 新着商品表示

**ナビゲーション**
- ヘッダー（ロゴ、検索バー、カートアイコン、ログイン/マイページ）
- フッター（リンク集、SNS、著作権表示）

**その他**
- カートアイテム数バッジ表示

---

### 2. 商品一覧ページ (`/products`)
**表示機能**
- 商品グリッド表示（カード形式）
- 商品情報（画像、名前、価格、在庫状況）
- ページネーションまたは無限スクロール

**検索・フィルター機能**
- キーワード検索
- カテゴリーフィルター
- 価格帯フィルター
- 在庫ありのみ表示
- 並び替え（価格順、新着順、人気順）

**UI**
- フィルターサイドバーまたはドロップダウン
- 検索結果件数表示
- フィルタークリアボタン

---

### 3. 商品詳細ページ (`/products/:id`)
**商品情報表示**
- 商品画像ギャラリー（複数画像、拡大表示）
- 商品名
- 価格
- 商品説明
- SKU/商品コード
- 在庫状況表示
- カテゴリー表示

**購入機能**
- 数量選択（+/-ボタン）
- カートに追加ボタン
- 在庫数チェック
- 追加成功通知（トースト）

**レビュー機能**
- レビュー一覧表示
- 平均評価（星表示）
- レビュー投稿フォーム（ログインユーザーのみ）
- レビュー削除（自分のレビューのみ）

**その他**
- 関連商品表示
- パンくずリスト

---

### 4. ショッピングカートページ (`/cart`)
**カート内容表示**
- カート内商品リスト
- 商品画像、名前、価格、数量
- 小計（商品ごと）

**編集機能**
- 数量変更（+/-ボタン）
- 商品削除ボタン
- カート全削除ボタン

**計算表示**
- 小計金額
- 配送料（一律または条件付き無料）
- 合計金額

**ナビゲーション**
- お買い物を続けるボタン
- レジに進むボタン（チェックアウトへ）

**バリデーション**
- 在庫確認
- 空カート時のメッセージ

---

### 5. チェックアウトページ (`/checkout`)
**認証チェック**
- 未ログイン時はログインページへリダイレクト

**注文情報入力フォーム**
- 配送先情報（氏名、住所、郵便番号、電話番号）
- 既存住所の選択（保存済みの場合）
- メールアドレス確認

**注文内容確認**
- カート内商品一覧（読み取り専用）
- 各商品の小計
- 配送料
- 合計金額

**決済機能（Stripe）**
- Stripe Elements統合
- クレジットカード情報入力
- セキュリティコード入力

**注文確定**
- 利用規約同意チェックボックス
- 注文確定ボタン
- ローディング表示
- エラーハンドリング

**バリデーション**
- 入力必須チェック
- 郵便番号形式チェック
- 電話番号形式チェック

---

### 6. 注文完了ページ (`/order-complete`)
**表示機能**
- サンクスメッセージ
- 注文番号表示
- 注文内容サマリー
- 配送先情報
- 支払い金額
- 確認メール送信済み通知

**ナビゲーション**
- ホームに戻るボタン
- 注文履歴へのリンク
- 続けて買い物するボタン

---

### 7. ユーザー登録ページ (`/register`)
**登録フォーム**
- メールアドレス入力
- パスワード入力（確認用も）
- 氏名入力
- 電話番号入力（オプション）

**バリデーション**
- メール形式チェック
- パスワード強度チェック
- パスワード一致確認
- 重複アカウントチェック

**認証処理**
- Firebase/Supabase Auth連携
- 登録成功時の自動ログイン
- エラーメッセージ表示

**その他**
- ログインページへのリンク
- 利用規約・プライバシーポリシーへのリンク

---

### 8. ログインページ (`/login`)
**ログインフォーム**
- メールアドレス入力
- パスワード入力
- ログイン状態を保持するチェックボックス

**認証処理**
- Firebase/Supabase Auth連携
- ログイン成功時のリダイレクト
- エラーメッセージ表示

**その他機能**
- パスワードリセットリンク
- 新規登録へのリンク
- ソーシャルログイン（オプション：Google等）

---

### 9. マイページ (`/mypage`)
**ユーザー情報表示**
- プロフィール情報
- 登録メールアドレス
- 保存済み配送先住所

**編集機能**
- プロフィール編集ボタン
- パスワード変更
- 配送先住所の追加・編集・削除

**注文履歴セクション**
- 最近の注文一覧（簡易表示）
- 注文履歴ページへのリンク

**アカウント管理**
- ログアウトボタン
- アカウント削除（オプション）

---

### 10. 注文履歴詳細ページ (`/orders/:id`)
**注文情報表示**
- 注文番号
- 注文日時
- 注文ステータス（処理中、発送済み、配達完了など）
- ステータスタイムライン

**商品詳細**
- 注文商品一覧
- 各商品の画像、名前、数量、価格

**配送情報**
- 配送先住所
- 配送業者（発送後）
- 追跡番号（発送後）

**支払い情報**
- 小計
- 配送料
- 合計金額
- 支払い方法

**アクション**
- 領収書ダウンロード（PDF）
- 注文キャンセル（条件付き）
- レビュー投稿へのリンク

---

### 11. 管理者ダッシュボード (`/admin`)
**アクセス制御**
- 管理者権限チェック
- 非管理者は403エラー

**統計表示**
- 今日の売上
- 今月の売上
- 総注文数
- 処理待ち注文数
- 在庫切れ商品数

**グラフ・チャート**
- 売上推移グラフ（日別、月別）
- 人気商品ランキング
- カテゴリー別売上

**最近のアクティビティ**
- 最新注文リスト
- 最新レビュー
- 低在庫アラート

**クイックアクション**
- 商品追加ボタン
- 注文管理へのリンク

---

### 12. 商品管理ページ (`/admin/products`)
**商品一覧表示**
- テーブル形式（商品画像、名前、価格、在庫、カテゴリー、ステータス）
- ページネーション

**検索・フィルター**
- 商品名検索
- カテゴリーフィルター
- 在庫状況フィルター
- 公開/非公開フィルター

**一括操作**
- 複数選択チェックボックス
- 一括削除
- 一括公開/非公開切り替え

**個別操作**
- 編集ボタン
- 削除ボタン（確認ダイアログ）
- 複製ボタン
- プレビューボタン

**その他**
- 商品追加ボタン
- CSVエクスポート（オプション）
- CSVインポート（オプション）

---

### 13. 商品追加/編集ページ (`/admin/products/new`, `/admin/products/edit/:id`)
**基本情報入力**
- 商品名
- 商品説明（リッチテキストエディタ）
- 価格
- SKU/商品コード
- カテゴリー選択

**画像管理**
- 画像アップロード（複数対応）
- ドラッグ&ドロップ
- 画像プレビュー
- 画像削除
- メイン画像設定

**在庫管理**
- 在庫数入力
- 在庫追跡ON/OFF
- 在庫切れ時の表示設定

**公開設定**
- 公開/非公開切り替え
- 公開日時設定（オプション）

**SEO設定（オプション）**
- メタタイトル
- メタディスクリプション

**バリデーション**
- 必須項目チェック
- 価格の数値チェック
- 在庫の数値チェック

**アクション**
- 保存ボタン
- 保存して公開ボタン
- キャンセルボタン
- 削除ボタン（編集時のみ）

---

### 14. 注文管理ページ (`/admin/orders`)
**注文一覧表示**
- テーブル形式（注文番号、顧客名、日時、金額、ステータス）
- ページネーション

**検索・フィルター**
- 注文番号検索
- 顧客名検索
- 日付範囲フィルター
- ステータスフィルター
- 金額範囲フィルター

**ステータス管理**
- ステータス一括変更
- ステータスバッジ表示（色分け）

**エクスポート**
- CSVエクスポート
- 請求書一括発行（オプション）

**個別操作**
- 詳細表示ボタン
- ステータス変更ドロップダウン
- メモ追加

---

### 15. 注文詳細ページ (`/admin/orders/:id`)
**注文情報表示**
- 注文番号
- 注文日時
- 現在のステータス

**顧客情報**
- 顧客名
- メールアドレス
- 電話番号
- 配送先住所

**商品詳細**
- 注文商品リスト
- 各商品の画像、名前、数量、単価、小計

**金額情報**
- 小計
- 配送料
- 合計金額

**決済情報**
- Stripe決済ID
- 決済ステータス
- 決済日時

**ステータス管理**
- ステータス変更ドロップダウン
- ステータス変更履歴
- 配送業者・追跡番号入力

**アクション**
- 領収書発行
- 顧客にメール送信
- 注文キャンセル
- 返金処理（Stripe連携）

**メモ機能**
- 管理者メモ入力・表示
- メモ履歴

---

### 16. 売上分析ページ (`/admin/analytics`)
**期間選択**
- 日別、週別、月別、年別切り替え
- カスタム期間選択

**売上グラフ**
- 折れ線グラフ（売上推移）
- 棒グラフ（期間別比較）
- 前年同期比較

**統計データ**
- 総売上
- 平均注文額
- 注文件数
- コンバージョン率（訪問者数が取れる場合）

**商品分析**
- ベストセラー商品ランキング
- カテゴリー別売上
- 商品別利益率（原価設定がある場合）

**顧客分析**
- 新規顧客数
- リピート率
- 顧客生涯価値（LTV）

**エクスポート**
- レポートPDF出力
- データCSVダウンロード

---

### 17-21. その他ページ

**About/会社概要ページ (`/about`)**
- 会社情報テキスト表示
- ビジョン・ミッション
- チーム紹介（オプション）

**お問い合わせページ (`/contact`)**
- お問い合わせフォーム（名前、メール、件名、本文）
- フォーム送信機能
- 確認メッセージ

**利用規約ページ (`/terms`)**
- 利用規約テキスト表示
- スクロール可能な長文表示

**プライバシーポリシーページ (`/privacy`)**
- プライバシーポリシーテキスト表示
- Cookie使用に関する説明

**404エラーページ (`/404`)**
- エラーメッセージ
- ホームへ戻るボタン
- 商品検索機能

---

## 🎨 共通コンポーネント

### レイアウトコンポーネント
- **Header** - ロゴ、ナビゲーション、検索バー、カートアイコン、ユーザーメニュー
- **Footer** - サイトマップ、SNSリンク、著作権表示
- **Sidebar** - 管理画面用サイドメニュー

### UIコンポーネント
- **ProductCard** - 商品カード
- **Button** - 汎用ボタン
- **Input** - フォーム入力
- **Modal** - モーダルダイアログ
- **Toast** - 通知トースト
- **Loading** - ローディングスピナー
- **Pagination** - ページネーション
- **SearchBar** - 検索バー
- **FilterPanel** - フィルターパネル

### 機能コンポーネント
- **ProtectedRoute** - 認証保護
- **AdminRoute** - 管理者権限保護
- **CartProvider** - カート状態管理
- **AuthProvider** - 認証状態管理
- **StripeCheckout** - Stripe決済フォーム

---

## 🚀 開発フェーズ

### Phase 1: 基本機能（5ページ）
**対象ページ**
1. ホームページ
2. 商品一覧ページ
3. 商品詳細ページ
4. ショッピングカートページ
5. 404ページ

**実装内容**
- 商品表示機能
- カート機能（ローカルストレージ）
- 基本的なナビゲーション
- レスポンシブデザイン

---

### Phase 2: 認証＆決済（4ページ）
**対象ページ**
6. ログインページ
7. ユーザー登録ページ
8. チェックアウトページ
9. 注文完了ページ

**実装内容**
- Firebase/Supabase認証統合
- Stripe決済統合
- 注文データ保存
- メール通知

---

### Phase 3: ユーザー機能（2ページ）
**対象ページ**
10. マイページ
11. 注文履歴詳細ページ

**実装内容**
- ユーザープロフィール管理
- 注文履歴表示
- レビュー投稿機能
- 配送先住所管理

---

### Phase 4: 管理者機能（6ページ）
**対象ページ**
12. 管理者ダッシュボード
13. 商品管理ページ
14. 商品追加/編集ページ
15. 注文管理ページ
16. 注文詳細ページ
17. 売上分析ページ

**実装内容**
- 管理者権限チェック
- 商品CRUD操作
- 注文ステータス管理
- 売上グラフ・統計
- 画像アップロード機能

---

### Phase 5: 仕上げ（4ページ - オプション）
**対象ページ**
18. About/会社概要
19. お問い合わせ
20. 利用規約
21. プライバシーポリシー

**実装内容**
- 静的ページ作成
- お問い合わせフォーム
- SEO対応
- サイトマップ生成

---

## 📱 レスポンシブ対応

### ブレークポイント（Tailwind CSS）
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### 対応内容
- モバイルメニュー（ハンバーガーメニュー）
- グリッドレイアウトの調整
- タッチ操作対応
- 画像の最適化
- フォントサイズの調整

---

## 🔒 セキュリティ対策

### 認証・認可
- Firebase/Supabase Authによる安全な認証
- JWTトークン管理
- 管理者権限チェック
- Protected Routes実装
- セッション管理

### 決済セキュリティ
- Stripe Elementsによる安全な決済フォーム
- クレジットカード情報は直接扱わない
- サーバーサイドでの決済処理（Firebase Functions等）
- Webhook署名検証
- 3Dセキュア対応

### データ保護
- Firestoreセキュリティルール
- XSS対策（React標準）
- CSRF対策
- 環境変数による機密情報管理
- HTTPSの使用

---

## 📈 今後の拡張可能性

### 追加機能候補
- ウィッシュリスト
- クーポン・割引機能
- ポイントシステム
- 会員ランク
- メールマガジン
- 在庫アラート通知
- 商品比較機能
- おすすめ商品（AI）
- 多言語対応
- 複数配送先指定
- ギフトラッピング
- 定期購入

### 決済方法の追加
- PayPal
- Apple Pay / Google Pay
- コンビニ決済
- 銀行振込
- 後払い決済

### マーケティング機能
- クロスセル・アップセル
- 放棄カートリマインダー
- レコメンデーション
- A/Bテスト
- Google Analytics連携
- SNS連携

---

## ✅ 次のステップ

### 1. バックエンドの選択を決定
- [ ] Firebase（推奨：簡単、早い）
- [ ] Supabase（モダン、SQL）
- [ ] 独自API（自由度高い）

### 2. 開発開始フェーズの決定
- [ ] Phase 1から順番に開発
- [ ] 特定のページから優先的に開発
- [ ] プロトタイプを先に作成

### 3. デザインの方向性決定
- [ ] UI/UXの参考サイト選定
- [ ] カラースキーム決定
- [ ] ブランドイメージ確立
- [ ] ロゴデザイン

### 4. 環境構築
- [ ] Reactプロジェクト作成
- [ ] 必要なライブラリのインストール
- [ ] Firebase/Supabaseプロジェクト作成
- [ ] Stripeアカウント作成
- [ ] 環境変数の設定

### 5. 開発開始
- [ ] 基本レイアウト作成
- [ ] ルーティング設定
- [ ] 状態管理の実装
- [ ] APIの設計・実装

---

## 📝 メモ

### 開発時の注意点
- コンポーネントの再利用性を意識する
- 状態管理を適切に設計する
- エラーハンドリングを徹底する
- ユーザビリティを常に考慮する
- セキュリティを最優先にする
- パフォーマンスを最適化する

### テスト項目
- ユニットテスト
- 統合テスト
- E2Eテスト
- パフォーマンステスト
- セキュリティテスト
- ユーザビリティテスト

---

**準備が整いましたら、実装を開始しましょう！**
