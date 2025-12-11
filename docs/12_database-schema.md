# 【補足ドキュメント】
# 12. データベース設計（オプション）

---

## 📋 ドキュメント情報

- **作成日**: 2025年10月2日
- **ドキュメント番号**: 12
- **ステータス**: 作成中
- **作成順序**: 12/12（最終）

---

## 🎯 このドキュメントの目的

このドキュメントでは、TechGear Storeの**Firestoreデータベース設計**を定義します。

**コレクション構造、フィールド定義、リレーション、インデックスを明確にします。**

---

## 🔥 Firebase Firestoreについて

### NoSQLデータベース

Firestoreは**ドキュメント指向NoSQLデータベース**です。

```
コレクション
└─ ドキュメント
   └─ フィールド
   └─ サブコレクション（オプション）
```

### 特徴

- **スケーラブル**: 自動スケーリング
- **リアルタイム**: リアルタイム同期
- **オフライン対応**: オフラインキャッシュ
- **セキュリティ**: セキュリティルール
- **料金**: 読み取り・書き込みごとの従量課金

---

## 📊 データベース全体構造

```
techgear-store (Firestore Database)
├─ users/                    # ユーザー情報
├─ products/                 # 商品情報
├─ categories/               # カテゴリー情報
├─ orders/                   # 注文情報
├─ reviews/                  # レビュー情報
├─ cart/ (optional)          # カート情報（ローカルストレージ推奨）
└─ settings/                 # サイト設定
```

---

## 👤 1. users コレクション

### 説明
ユーザーのプロフィール情報を保存

### ドキュメントID
Firebase Authentication の UID

### フィールド定義

```typescript
interface User {
  uid: string;              // Firebase Auth UID
  email: string;            // メールアドレス
  name: string;             // 名前
  photoURL?: string;        // プロフィール画像URL
  phone?: string;           // 電話番号
  role: 'customer' | 'admin';  // 役割
  
  // 配送先住所（デフォルト）
  defaultAddress?: {
    postalCode: string;     // 郵便番号
    prefecture: string;     // 都道府県
    city: string;           // 市区町村
    address: string;        // 番地
    building?: string;      // 建物名・部屋番号
  };
  
  // メタデータ
  createdAt: Timestamp;     // 作成日時
  updatedAt: Timestamp;     // 更新日時
  lastLoginAt?: Timestamp;  // 最終ログイン日時
}
```

### サンプルデータ

```json
{
  "uid": "abc123xyz",
  "email": "tanaka@example.com",
  "name": "田中太郎",
  "photoURL": "https://...",
  "phone": "090-1234-5678",
  "role": "customer",
  "defaultAddress": {
    "postalCode": "150-0043",
    "prefecture": "東京都",
    "city": "渋谷区",
    "address": "道玄坂1-2-3",
    "building": "ABCビル 4F"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:45:00Z",
  "lastLoginAt": "2025-01-20T14:45:00Z"
}
```

### インデックス

```
単一フィールドインデックス（自動）:
- email
- role
- createdAt

複合インデックス:
不要
```

---

## 📦 2. products コレクション

### 説明
商品情報を保存

### ドキュメントID
自動生成

### フィールド定義

```typescript
interface Product {
  id: string;               // ドキュメントID
  name: string;             // 商品名
  description: string;      // 商品説明
  price: number;            // 価格（円）
  salePrice?: number;       // セール価格（オプション）
  
  category: string;         // カテゴリー
  brand?: string;           // ブランド
  sku: string;              // 商品コード
  
  images: string[];         // 画像URL配列
  mainImage: string;        // メイン画像URL
  
  stock: number;            // 在庫数
  sold: number;             // 販売数
  
  // 評価
  rating: number;           // 平均評価（0-5）
  reviewCount: number;      // レビュー数
  
  // 仕様
  specifications?: {
    [key: string]: string;  // 仕様項目（動的）
  };
  
  // SEO
  metaTitle?: string;       // メタタイトル
  metaDescription?: string; // メタディスクリプション
  
  // ステータス
  status: 'draft' | 'published' | 'archived';  // 公開状態
  featured: boolean;        // 注目商品
  isNew: boolean;          // 新商品
  onSale: boolean;         // セール中
  
  // メタデータ
  createdAt: Timestamp;     // 作成日時
  updatedAt: Timestamp;     // 更新日時
  publishedAt?: Timestamp;  // 公開日時
}
```

### サンプルデータ

```json
{
  "id": "prod_001",
  "name": "ノイズキャンセリング ワイヤレスイヤホン",
  "description": "高音質で快適な装着感。最大30時間のバッテリー持続時間。",
  "price": 15800,
  "salePrice": null,
  "category": "ワイヤレスイヤホン",
  "brand": "TechAudio",
  "sku": "ELEC-WE-001",
  "images": [
    "https://storage.../image1.jpg",
    "https://storage.../image2.jpg",
    "https://storage.../image3.jpg"
  ],
  "mainImage": "https://storage.../image1.jpg",
  "stock": 50,
  "sold": 128,
  "rating": 4.5,
  "reviewCount": 42,
  "specifications": {
    "接続方式": "Bluetooth 5.3",
    "バッテリー持続時間": "最大30時間",
    "充電時間": "約2時間",
    "重量": "50g",
    "防水性能": "IPX4"
  },
  "metaTitle": "ノイズキャンセリング ワイヤレスイヤホン | TechGear Store",
  "metaDescription": "高音質で快適な装着感のワイヤレスイヤホン。最大30時間のバッテリー。",
  "status": "published",
  "featured": true,
  "isNew": true,
  "onSale": false,
  "createdAt": "2025-01-10T09:00:00Z",
  "updatedAt": "2025-01-15T11:30:00Z",
  "publishedAt": "2025-01-10T10:00:00Z"
}
```

### インデックス

```
単一フィールドインデックス（自動）:
- category
- price
- rating
- createdAt
- status

複合インデックス（要作成）:
1. category (Ascending), createdAt (Descending)
2. category (Ascending), price (Ascending)
3. category (Ascending), rating (Descending)
4. status (Ascending), createdAt (Descending)
5. featured (Ascending), createdAt (Descending)
```

---

## 🏷️ 3. categories コレクション

### 説明
商品カテゴリー情報

### ドキュメントID
カテゴリー名（slug形式）

### フィールド定義

```typescript
interface Category {
  id: string;               // カテゴリーID（slug）
  name: string;             // カテゴリー名
  description?: string;     // 説明
  image?: string;           // カテゴリー画像URL
  productCount: number;     // 商品数
  order: number;            // 表示順序
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### サンプルデータ

```json
{
  "id": "wireless-earphones",
  "name": "ワイヤレスイヤホン",
  "description": "Bluetooth対応のワイヤレスイヤホン",
  "image": "https://storage.../category-wireless.jpg",
  "productCount": 24,
  "order": 1,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

## 🛒 4. orders コレクション

### 説明
注文情報を保存

### ドキュメントID
自動生成

### フィールド定義

```typescript
interface Order {
  id: string;                   // 注文ID
  orderNumber: string;          // 注文番号（ORD-YYYYMMDD-XXXX）
  
  // ユーザー情報
  userId: string;               // ユーザーID
  customerEmail: string;        // 顧客メールアドレス
  customerName: string;         // 顧客名
  customerPhone: string;        // 電話番号
  
  // 注文商品
  items: OrderItem[];
  
  // 配送先
  shippingAddress: {
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
  };
  
  deliveryNote?: string;        // 配送メモ
  
  // 金額
  subtotal: number;             // 小計
  shipping: number;             // 送料
  tax: number;                  // 税金
  discount: number;             // 割引額
  total: number;                // 合計
  
  // 決済
  paymentMethod: 'card' | 'bank' | 'convenience';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;     // Stripe PaymentIntent ID
  
  // 注文ステータス
  orderStatus: 
    | 'pending'       // 処理待ち
    | 'confirmed'     // 注文確定
    | 'processing'    // 準備中
    | 'shipped'       // 発送済み
    | 'delivered'     // 配達完了
    | 'cancelled';    // キャンセル
  
  // 配送情報
  trackingNumber?: string;      // 追跡番号
  carrier?: string;             // 配送業者
  shippedAt?: Timestamp;        // 発送日時
  deliveredAt?: Timestamp;      // 配達日時
  
  // メタデータ
  createdAt: Timestamp;         // 注文日時
  updatedAt: Timestamp;         // 更新日時
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}
```

### サンプルデータ

```json
{
  "id": "order_abc123",
  "orderNumber": "ORD-20250115-0001",
  "userId": "user_xyz789",
  "customerEmail": "tanaka@example.com",
  "customerName": "田中太郎",
  "customerPhone": "090-1234-5678",
  "items": [
    {
      "productId": "prod_001",
      "productName": "ワイヤレスイヤホン",
      "productImage": "https://...",
      "price": 15800,
      "quantity": 1,
      "subtotal": 15800
    },
    {
      "productId": "prod_002",
      "productName": "スマホケース",
      "productImage": "https://...",
      "price": 2980,
      "quantity": 2,
      "subtotal": 5960
    }
  ],
  "shippingAddress": {
    "postalCode": "150-0043",
    "prefecture": "東京都",
    "city": "渋谷区",
    "address": "道玄坂1-2-3",
    "building": "ABCビル 4F"
  },
  "deliveryNote": "午前中配送希望",
  "subtotal": 21760,
  "shipping": 0,
  "tax": 2176,
  "discount": 0,
  "total": 23936,
  "paymentMethod": "card",
  "paymentStatus": "paid",
  "paymentIntentId": "pi_xxx",
  "orderStatus": "shipped",
  "trackingNumber": "1234-5678-9012",
  "carrier": "ヤマト運輸",
  "shippedAt": "2025-01-16T10:00:00Z",
  "deliveredAt": null,
  "createdAt": "2025-01-15T14:30:00Z",
  "updatedAt": "2025-01-16T10:00:00Z"
}
```

### インデックス

```
単一フィールドインデックス（自動）:
- userId
- orderStatus
- paymentStatus
- createdAt

複合インデックス（要作成）:
1. userId (Ascending), createdAt (Descending)
2. userId (Ascending), orderStatus (Ascending), createdAt (Descending)
3. orderStatus (Ascending), createdAt (Descending)
4. paymentStatus (Ascending), createdAt (Descending)
```

---

## ⭐ 5. reviews コレクション

### 説明
商品レビュー情報

### ドキュメントID
自動生成

### フィールド定義

```typescript
interface Review {
  id: string;               // レビューID
  productId: string;        // 商品ID
  userId: string;           // ユーザーID
  userName: string;         // ユーザー名
  userPhoto?: string;       // ユーザー写真
  
  rating: number;           // 評価（1-5）
  title?: string;           // レビュータイトル
  comment: string;          // コメント
  images?: string[];        // レビュー画像
  
  helpful: number;          // 役に立った数
  
  // ステータス
  status: 'pending' | 'approved' | 'rejected';
  
  // メタデータ
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### サンプルデータ

```json
{
  "id": "review_001",
  "productId": "prod_001",
  "userId": "user_xyz789",
  "userName": "田中太郎",
  "userPhoto": "https://...",
  "rating": 5,
  "title": "音質が素晴らしい！",
  "comment": "ノイズキャンセリングも効果的で、通勤時に重宝しています。",
  "images": ["https://..."],
  "helpful": 12,
  "status": "approved",
  "createdAt": "2025-01-16T09:00:00Z",
  "updatedAt": "2025-01-16T10:00:00Z"
}
```

### インデックス

```
単一フィールドインデックス（自動）:
- productId
- userId
- rating
- createdAt

複合インデックス（要作成）:
1. productId (Ascending), createdAt (Descending)
2. productId (Ascending), rating (Descending)
3. productId (Ascending), helpful (Descending)
4. userId (Ascending), createdAt (Descending)
5. status (Ascending), createdAt (Descending)
```

---

## 🛍️ 6. cart コレクション（オプション）

### 説明
カート情報（ローカルストレージ推奨だが、サーバー側保存も可能）

### ドキュメントID
ユーザーID

### フィールド定義

```typescript
interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Timestamp;
}

interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Timestamp;
}
```

### 推奨事項

```
カート情報はローカルストレージに保存することを推奨

理由:
- 読み取り・書き込みコストの削減
- オフライン対応
- レスポンスの高速化

ただし、以下の場合はFirestoreに保存:
- デバイス間でカート同期が必要
- カート放棄率の分析が必要
```

---

## ⚙️ 7. settings コレクション

### 説明
サイト全体の設定

### ドキュメントID
固定（'site'）

### フィールド定義

```typescript
interface Settings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  
  // 配送設定
  freeShippingThreshold: number;  // 送料無料の閾値
  shippingFee: number;            // 送料
  
  // 税率
  taxRate: number;                // 税率（0.1 = 10%）
  
  // メンテナンスモード
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  
  // SNS
  social: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  
  updatedAt: Timestamp;
}
```

### サンプルデータ

```json
{
  "siteName": "TechGear Store",
  "siteDescription": "最新ガジェットのオンラインストア",
  "logo": "https://...",
  "favicon": "https://...",
  "freeShippingThreshold": 5000,
  "shippingFee": 500,
  "taxRate": 0.1,
  "maintenanceMode": false,
  "social": {
    "twitter": "https://twitter.com/techgearstore",
    "facebook": "https://facebook.com/techgearstore",
    "instagram": "https://instagram.com/techgearstore"
  },
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

## 🔗 リレーション設計

### 1対多のリレーション

```
users (1) ←→ (多) orders
users (1) ←→ (多) reviews
products (1) ←→ (多) reviews
products (1) ←→ (多) orders.items
```

### リレーションの実装

Firestoreでは外部キー制約がないため、アプリケーション側で管理

```typescript
// 例: 注文から商品情報を取得
async function getOrderWithProducts(orderId: string) {
  const orderDoc = await getDoc(doc(db, 'orders', orderId));
  const order = orderDoc.data();
  
  // 各商品の最新情報を取得
  const productsPromises = order.items.map(item => 
    getDoc(doc(db, 'products', item.productId))
  );
  
  const productsSnapshots = await Promise.all(productsPromises);
  const products = productsSnapshots.map(snap => snap.data());
  
  return {
    ...order,
    items: order.items.map((item, index) => ({
      ...item,
      product: products[index]
    }))
  };
}
```

---

## 📈 データの非正規化

### なぜ非正規化するのか

Firestoreでは**読み取りコストが重要**なため、結合クエリを避けるために非正規化を行います。

### 非正規化の例

#### 商品の評価情報

```typescript
// 悪い例: 毎回レビューを集計
const reviews = await getDocs(
  query(collection(db, 'reviews'), where('productId', '==', productId))
);
const avgRating = calculateAverage(reviews);

// 良い例: 商品ドキュメントに評価を保存
interface Product {
  // ...
  rating: number;        // 平均評価（非正規化）
  reviewCount: number;   // レビュー数（非正規化）
}
```

#### 注文の商品情報

```typescript
// 商品情報を注文に埋め込む
interface OrderItem {
  productId: string;
  productName: string;      // 非正規化
  productImage: string;     // 非正規化
  price: number;            // 非正規化（注文時の価格）
  quantity: number;
}
```

### 非正規化データの更新

```typescript
// レビュー投稿時に商品の評価を更新
async function createReview(reviewData: ReviewData) {
  const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);
  
  // 商品の評価を再計算して更新
  const productRef = doc(db, 'products', reviewData.productId);
  const reviews = await getDocs(
    query(collection(db, 'reviews'), where('productId', '==', reviewData.productId))
  );
  
  const avgRating = calculateAverage(reviews);
  
  await updateDoc(productRef, {
    rating: avgRating,
    reviewCount: reviews.size,
  });
}
```

---

## 🔐 セキュリティルール

セキュリティルールは **09_deployment-guide.md** に詳細あり

### 基本原則

```
1. デフォルトは拒否
2. 認証ユーザーのみアクセス可
3. 自分のデータのみアクセス可
4. 管理者のみ書き込み可（商品など）
```

---

## 📊 インデックス一覧

### 必須の複合インデックス

```javascript
// products
collection: products
fields: category (Ascending), createdAt (Descending)

collection: products
fields: category (Ascending), price (Ascending)

collection: products
fields: status (Ascending), createdAt (Descending)

// orders
collection: orders
fields: userId (Ascending), createdAt (Descending)

collection: orders
fields: userId (Ascending), orderStatus (Ascending), createdAt (Descending)

// reviews
collection: reviews
fields: productId (Ascending), createdAt (Descending)

collection: reviews
fields: productId (Ascending), helpful (Descending)
```

### インデックスの作成方法

```bash
# Firebase CLIを使用
firebase deploy --only firestore:indexes

# または Firebaseコンソールから手動作成
1. Firestoreコンソール → インデックス
2. 「複合」タブ → 「インデックスを作成」
3. コレクション、フィールド、順序を指定
4. 「作成」
```

---

## 🎯 クエリの最適化

### 効率的なクエリ

```typescript
// 良い例: インデックスを活用
const q = query(
  collection(db, 'products'),
  where('category', '==', 'wireless-earphones'),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// 悪い例: 全件取得してフィルター
const allProducts = await getDocs(collection(db, 'products'));
const filtered = allProducts.docs.filter(/* ... */);
```

### ページネーション

```typescript
// カーソルベースのページネーション
async function getProductsPage(lastVisible: DocumentSnapshot | null = null) {
  let q = query(
    collection(db, 'products'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }
  
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  
  return { products, lastDoc };
}
```

---

## 💾 バックアップ戦略

**09_deployment-guide.md** と **10_operations-plan.md** に詳細あり

### 定期バックアップ

```
頻度: 毎日
保管期間: 30日
```

---

## 📚 関連ドキュメント

- **前のドキュメント**: `11_api-design.md`（API設計）
- **参考ドキュメント**: 
  - `ecommerce-project-specification.md`（全体仕様書）
  - `09_deployment-guide.md`（デプロイ手順書）

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|----------|--------|
| 1.0 | 2025/10/02 | 初版作成 | _____ |
| _____ | _____ | _____ | _____ |

---

## 💭 メモ・調整案

**（データベース設計に関する自由記入欄）**

```
追加コレクション、フィールド変更、インデックス追加などをメモしてください。









```

---

**🎉 全12個のドキュメントが完成しました！おめでとうございます！** 🎊
