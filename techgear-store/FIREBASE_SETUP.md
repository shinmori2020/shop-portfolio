# Firebase セットアップガイド

## 概要
このプロジェクトはFirebase（Sparkプラン）を使用して、セキュリティ強化と在庫管理機能を実装しています。

## 実装済みのセキュリティ機能

### 1. Firestore Security Rules
- 価格改ざん防止のための検証ルール
- ユーザー認証の確認
- 注文データの整合性チェック

### 2. クライアント側の価格検証
- サーバー価格との照合
- 在庫チェック機能
- 注文時の再計算

### 3. 在庫管理
- リアルタイム在庫チェック
- 在庫不足時のエラー表示
- 在庫数の自動更新

## Firebase設定手順

### 前提条件
- Node.js 18以上
- npmまたはyarn
- Firebaseプロジェクト作成済み

### 1. Firebase CLIのインストール
```bash
npm install -g firebase-tools
```

### 2. Firebaseにログイン
```bash
firebase login
```

### 3. プロジェクトの選択
```bash
firebase use techgear-store-v2
```
または、.firebasercファイルで設定済みの場合は自動的に選択されます。

### 4. Security Rulesのデプロイ
```bash
firebase deploy --only firestore:rules
```

### 5. インデックスのデプロイ（必要に応じて）
```bash
firebase deploy --only firestore:indexes
```

## 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=techgear-store-v2
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 在庫初期化

商品に在庫フィールドを追加するには、以下のコードを実行します：

```javascript
// src/utils/initializeStock.ts の initializeProductStock() を実行
import { initializeProductStock } from './utils/initializeStock';

// 一度だけ実行
initializeProductStock();
```

## テスト方法

### 1. 価格改ざんテスト
1. 商品をカートに追加
2. ブラウザのDevToolsで価格を変更しても、注文時にサーバー価格で再計算される

### 2. 在庫チェックテスト
1. 在庫切れ商品をカートに追加しようとする
2. エラーメッセージが表示される

### 3. Security Rulesテスト
1. Firebaseコンソールで「ルールプレイグラウンド」を使用
2. 各種操作をシミュレート

## トラブルシューティング

### Firebase CLIがインストールできない
```bash
# 管理者権限で実行
sudo npm install -g firebase-tools
```

### ログインできない
```bash
# ブラウザが開かない場合
firebase login --no-localhost
```

### Security Rulesのエラー
- Firebaseコンソールでルールを直接編集して確認
- `firebase deploy --debug`でデバッグ情報を確認

## 制限事項（Sparkプラン）

### 実装できない機能
- Firebase Functions（サーバー側処理）
- 外部API連携（Stripe本番決済など）
- 高度なサーバー側検証

### 回避策
- Firestore Security Rulesで基本的な検証
- クライアント側での追加検証
- Blazeプランへのアップグレード検討

## Blazeプランへの移行時

Blazeプラン（従量課金）にアップグレードすると以下が可能になります：

1. **Firebase Functions**
   - サーバー側での価格検証
   - Stripe決済統合
   - メール送信機能

2. **実装手順**
   ```bash
   # Functionsの初期化
   firebase init functions

   # Functionsのデプロイ
   firebase deploy --only functions
   ```

## セキュリティベストプラクティス

1. **環境変数の管理**
   - `.env`ファイルを.gitignoreに追加
   - 本番環境では環境変数を別途管理

2. **定期的な監査**
   - Firestore Security Rulesの定期的なレビュー
   - 依存関係の更新

3. **モニタリング**
   - Firebaseコンソールで使用状況を監視
   - 異常なアクセスパターンの検出

## サポート

問題が発生した場合は、以下を確認してください：

1. [Firebase公式ドキュメント](https://firebase.google.com/docs)
2. [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
3. プロジェクトのissueページ