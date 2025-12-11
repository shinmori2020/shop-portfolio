# 【補足ドキュメント】
# 11. API設計（オプション）

---

## 📋 ドキュメント情報

- **作成日**: 2025年10月2日
- **ドキュメント番号**: 11
- **ステータス**: 作成中
- **作成順序**: 11/12

---

## 🎯 このドキュメントの目的

このドキュメントでは、TechGear Storeの**API設計**を定義します。

**FirebaseとStripeのAPI使用方法、カスタムCloud Functionsの設計を明確にします。**

---

## 📝 注意事項

このプロジェクトは**Firebase**をバックエンドとして使用するため、従来のREST APIサーバーは不要です。

ただし、以下の場合にカスタムAPIが必要になります：

1. **Stripe Webhookの処理**
2. **複雑なビジネスロジック**
3. **外部サービスとの連携**
4. **メール送信**
5. **バッチ処理**

これらは**Firebase Cloud Functions**で実装します。

---

## 🔥 1. Firebase APIの使用

### 1.1 認証API（Firebase Authentication）

#### ユーザー登録

```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

async function registerUser(email: string, password: string, name: string) {
  try {
    // Firebase Authenticationでユーザー作成
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    const user = userCredential.user;
    
    // Firestoreにユーザー情報を保存
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      name: name,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}
```

---

#### ログイン

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';

async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

---

#### Googleログイン

```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // 初回ログイン時はFirestoreにユーザー情報を保存
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        role: 'customer',
        createdAt: new Date(),
      });
    }
    
    return user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}
```

---

#### ログアウト

```typescript
import { signOut } from 'firebase/auth';

async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}
```

---

### 1.2 データベースAPI（Firestore）

#### 商品取得

```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// 商品一覧取得
async function getProducts(
  category?: string,
  sortBy: string = 'createdAt',
  limitNum: number = 20
) {
  try {
    let q = query(collection(db, 'products'));
    
    // カテゴリーフィルター
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    // 並び替え
    q = query(q, orderBy(sortBy, 'desc'));
    
    // 件数制限
    q = query(q, limit(limitNum));
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return products;
  } catch (error) {
    console.error('Get products error:', error);
    throw error;
  }
}

// 商品詳細取得
async function getProduct(productId: string) {
  try {
    const docSnap = await getDoc(doc(db, 'products', productId));
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
}

// 商品検索
async function searchProducts(searchQuery: string) {
  try {
    // Firestoreは全文検索に対応していないため、
    // Algoliaなどの検索サービスを使用するか、
    // クライアント側でフィルタリングする
    
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return products;
  } catch (error) {
    console.error('Search products error:', error);
    throw error;
  }
}
```

---

#### 注文作成

```typescript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

async function createOrder(orderData: OrderData) {
  try {
    const order = {
      userId: orderData.userId,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      total: orderData.total,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'orders'), order);
    
    return {
      id: docRef.id,
      ...order
    };
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
}
```

---

#### 注文履歴取得

```typescript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

async function getUserOrders(userId: string) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return orders;
  } catch (error) {
    console.error('Get user orders error:', error);
    throw error;
  }
}
```

---

#### レビュー投稿

```typescript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

async function createReview(reviewData: ReviewData) {
  try {
    const review = {
      productId: reviewData.productId,
      userId: reviewData.userId,
      userName: reviewData.userName,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      helpful: 0,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'reviews'), review);
    
    return {
      id: docRef.id,
      ...review
    };
  } catch (error) {
    console.error('Create review error:', error);
    throw error;
  }
}
```

---

### 1.3 ストレージAPI（Firebase Storage）

#### 画像アップロード

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadImage(file: File, path: string) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
}

// 使用例
async function uploadProductImage(productId: string, file: File) {
  const path = `products/${productId}/${Date.now()}_${file.name}`;
  return await uploadImage(file, path);
}
```

---

#### 画像削除

```typescript
import { ref, deleteObject } from 'firebase/storage';

async function deleteImage(imageUrl: string) {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Delete image error:', error);
    throw error;
  }
}
```

---

## 💳 2. Stripe API

### 2.1 決済処理

#### Payment Intent作成

```typescript
import { loadStripe } from '@stripe/stripe-js';
import { 
  PaymentElement, 
  Elements, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY!);

// Cloud Functionでクライアントシークレットを取得
async function createPaymentIntent(amount: number) {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  
  const { clientSecret } = await response.json();
  return clientSecret;
}

// チェックアウトコンポーネント
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://www.techgearstore.com/order-complete',
      },
    });
    
    if (error) {
      console.error('Payment error:', error);
      // エラー処理
    }
    
    setLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? '処理中...' : '注文を確定する'}
      </button>
    </form>
  );
}
```

---

### 2.2 返金処理

```typescript
// Cloud Functionで実装
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const refundPayment = functions.https.onCall(async (data, context) => {
  // 管理者チェック
  if (!context.auth || !isAdmin(context.auth.uid)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }
  
  try {
    const refund = await stripe.refunds.create({
      payment_intent: data.paymentIntentId,
      amount: data.amount, // 部分返金の場合は金額を指定
    });
    
    return { success: true, refund };
  } catch (error) {
    console.error('Refund error:', error);
    throw new functions.https.HttpsError('internal', 'Refund failed');
  }
});
```

---

## ☁️ 3. Firebase Cloud Functions

### 3.1 Stripe Webhook処理

```typescript
import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const db = getFirestore();

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // イベント処理
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;
      
    case 'charge.refunded':
      const refund = event.data.object as Stripe.Charge;
      await handleRefund(refund);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  // 注文ステータスを更新
  await db.collection('orders').doc(orderId).update({
    paymentStatus: 'paid',
    orderStatus: 'processing',
    paymentIntentId: paymentIntent.id,
    updatedAt: new Date(),
  });
  
  // 在庫を減らす
  // メール送信
  // など
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  await db.collection('orders').doc(orderId).update({
    paymentStatus: 'failed',
    orderStatus: 'cancelled',
    updatedAt: new Date(),
  });
}

async function handleRefund(charge: Stripe.Charge) {
  // 返金処理
}
```

---

### 3.2 メール送信

```typescript
import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOrderConfirmationEmail = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;
    
    const mailOptions = {
      from: 'TechGear Store <noreply@techgearstore.com>',
      to: order.customerEmail,
      subject: `ご注文ありがとうございます（注文番号: ${orderId}）`,
      html: `
        <h1>ご注文ありがとうございます</h1>
        <p>注文番号: ${orderId}</p>
        <p>合計金額: ¥${order.total.toLocaleString()}</p>
        <p>配送先: ${order.shippingAddress.address}</p>
        <p>商品は3-5営業日でお届けします。</p>
      `,
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Email send error:', error);
    }
  });
```

---

### 3.3 在庫管理

```typescript
import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export const updateStock = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }
  
  const { productId, quantity } = data;
  
  try {
    const productRef = db.collection('products').doc(productId);
    
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists) {
        throw new Error('Product not found');
      }
      
      const currentStock = productDoc.data()!.stock;
      
      if (currentStock < quantity) {
        throw new Error('Insufficient stock');
      }
      
      transaction.update(productRef, {
        stock: FieldValue.increment(-quantity),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    
    return { success: true };
  } catch (error) {
    console.error('Update stock error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

---

### 3.4 管理者権限チェック

```typescript
import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

async function isAdmin(uid: string): Promise<boolean> {
  const userDoc = await db.collection('users').doc(uid).get();
  return userDoc.exists && userDoc.data()?.role === 'admin';
}

export const addProduct = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }
  
  // 管理者チェック
  if (!await isAdmin(context.auth.uid)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }
  
  // 商品追加処理
  try {
    const productRef = await db.collection('products').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { success: true, productId: productRef.id };
  } catch (error) {
    console.error('Add product error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to add product');
  }
});
```

---

## 📊 4. API レート制限

### 4.1 Firebaseのクォータ

```
Spark（無料プラン）:
- Firestore 読み取り: 50,000/日
- Firestore 書き込み: 20,000/日
- Storage ダウンロード: 1GB/日
- Storage アップロード: 10GB/月

Blaze（従量課金）:
- 制限なし（料金が発生）
```

### 4.2 レート制限の実装

```typescript
// Cloud Functionでレート制限
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const rateLimitedFunction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const userId = context.auth.uid;
  const rateLimitRef = db.collection('rateLimits').doc(userId);
  
  const rateLimitDoc = await rateLimitRef.get();
  const now = Date.now();
  
  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data()!;
    const count = data.count;
    const resetTime = data.resetTime;
    
    // 1分間に10リクエストまで
    if (count >= 10 && now < resetTime) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Rate limit exceeded. Try again later.'
      );
    }
    
    // リセット時間を過ぎていればカウントをリセット
    if (now >= resetTime) {
      await rateLimitRef.set({
        count: 1,
        resetTime: now + 60000, // 1分後
      });
    } else {
      await rateLimitRef.update({
        count: admin.firestore.FieldValue.increment(1),
      });
    }
  } else {
    // 初回アクセス
    await rateLimitRef.set({
      count: 1,
      resetTime: now + 60000,
    });
  }
  
  // メイン処理
  return { success: true };
});
```

---

## 🔒 5. セキュリティ

### 5.1 Firestore セキュリティルール

セキュリティルールは **09_deployment-guide.md** に記載済み

### 5.2 API認証

```typescript
// すべてのCloud Functionで認証チェック
export const secureFunction = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }
  
  // IDトークンの検証は自動で行われる
  const uid = context.auth.uid;
  
  // メイン処理
  return { success: true };
});
```

---

## 📝 6. エラーハンドリング

### 6.1 標準エラーコード

```typescript
// Firebase Cloud Functions標準エラー
'ok'
'cancelled'
'unknown'
'invalid-argument'
'deadline-exceeded'
'not-found'
'already-exists'
'permission-denied'
'resource-exhausted'
'failed-precondition'
'aborted'
'out-of-range'
'unimplemented'
'internal'
'unavailable'
'data-loss'
'unauthenticated'
```

### 6.2 エラーハンドリング例

```typescript
export const safeFunction = functions.https.onCall(async (data, context) => {
  try {
    // メイン処理
    return { success: true };
  } catch (error) {
    console.error('Function error:', error);
    
    if (error.code === 'permission-denied') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Access denied'
      );
    } else if (error.code === 'not-found') {
      throw new functions.https.HttpsError(
        'not-found',
        'Resource not found'
      );
    } else {
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred'
      );
    }
  }
});
```

---

## 📚 関連ドキュメント

- **前のドキュメント**: `10_operations-plan.md`（運用・保守計画）
- **次のドキュメント**: `12_database-schema.md`（データベース設計）
- **参考ドキュメント**: 
  - `ecommerce-project-specification.md`（全体仕様書）

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|----------|--------|
| 1.0 | 2025/10/02 | 初版作成 | _____ |
| _____ | _____ | _____ | _____ |

---

## 💭 メモ・調整案

**（API設計に関する自由記入欄）**

```
追加API、エンドポイント変更、セキュリティ強化などをメモしてください。









```

---

**API設計が完成しました！最後にデータベース設計です！** 🚀
