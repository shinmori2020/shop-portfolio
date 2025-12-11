# 【第1段階】プロジェクトの基盤を固める
# 3. 開発環境のセットアップ

---

## 📋 ドキュメント情報

- **作成日**: 2025年10月2日
- **ドキュメント番号**: 03
- **ステータス**: 作成中
- **作成順序**: 3/12

---

## 🎯 このドキュメントの目的

このドキュメントでは、TechGear Storeの開発環境を構築します。

**このガイドに従えば、誰でも同じ環境を構築できます。**

---

## 📋 前提条件チェックリスト

開始前に以下を確認してください：

- [ ] **01番**: プロジェクト概要を確認済み
- [ ] **02番**: 技術スタックを決定済み
- [ ] インターネット接続あり
- [ ] 約1-2時間の作業時間を確保

---

## 💻 必要なソフトウェア

### 1. Node.js（必須）

#### バージョン要件
- **推奨**: Node.js 18.x 以上
- **最低**: Node.js 16.x

#### インストール方法

**Windows/Mac**:
1. [Node.js公式サイト](https://nodejs.org/)にアクセス
2. **LTS版**（推奨版）をダウンロード
3. インストーラーを実行
4. インストール完了後、ターミナルで確認：

```bash
node --version
# v18.19.1 以上が表示されればOK

npm --version
# 9.x.x 以上が表示されればOK
```

**Macの場合（Homebrewを使用）**:
```bash
brew install node
```

---

### 2. Git（必須）

#### インストール方法

**Windows**:
1. [Git公式サイト](https://git-scm.com/)からダウンロード
2. インストーラーを実行（デフォルト設定でOK）

**Mac**:
```bash
# Homebrewでインストール
brew install git

# または Xcode Command Line Tools
xcode-select --install
```

#### 確認
```bash
git --version
# git version 2.x.x が表示されればOK
```

---

### 3. VS Code（推奨）

#### インストール
1. [VS Code公式サイト](https://code.visualstudio.com/)からダウンロード
2. インストール

#### 推奨拡張機能

```
必須:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier - Code formatter

推奨:
- Auto Rename Tag
- Auto Close Tag
- Path Intellisense
- GitLens
- Material Icon Theme
```

#### VS Code拡張機能のインストール方法
1. VS Codeを開く
2. 左サイドバーの拡張機能アイコンをクリック（または Ctrl+Shift+X）
3. 検索して「インストール」をクリック

---

## 🔐 アカウント作成

### 1. GitHubアカウント（必須）

#### 新規作成
1. [GitHub](https://github.com/)にアクセス
2. 「Sign up」をクリック
3. メールアドレス、パスワードを設定
4. メール認証を完了

#### Git設定
```bash
# ユーザー名とメールアドレスを設定
git config --global user.name "あなたの名前"
git config --global user.email "your-email@example.com"

# 確認
git config --global user.name
git config --global user.email
```

---

### 2. Firebaseアカウント（必須）

#### アカウント作成
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. Googleアカウントでログイン
3. 「プロジェクトを追加」をクリック

#### プロジェクト作成
```
1. プロジェクト名を入力
   → 例: techgear-store

2. Google アナリティクス
   → 「今は設定しない」でOK（後で追加可能）

3. 「プロジェクトを作成」をクリック
   → 完了まで約30秒

4. 「続行」をクリック
```

#### Firebase設定

**Authentication（認証）を有効化**:
```
1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」を選択
4. 「有効にする」をONにする
5. 「保存」をクリック
```

**Firestore（データベース）を有効化**:
```
1. 左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. セキュリティルール: 「テストモードで始める」を選択
   （※後で本番用に変更します）
4. ロケーション: 「asia-northeast1（東京）」を選択
5. 「有効にする」をクリック
```

**Storage（ストレージ）を有効化**:
```
1. 左メニューから「Storage」を選択
2. 「始める」をクリック
3. セキュリティルール: 「テストモードで始める」を選択
4. ロケーション: 「asia-northeast1（東京）」を選択
5. 「完了」をクリック
```

#### Firebase設定情報の取得

```
1. 左メニュー上部の歯車アイコン → 「プロジェクトの設定」
2. 下にスクロールして「マイアプリ」セクション
3. 「</> Web」アイコンをクリック
4. アプリのニックネーム: 「techgear-store-web」
5. 「アプリを登録」をクリック
6. 「Firebase SDK」の構成オブジェクトが表示される
   → この情報を後で使用するのでコピーしておく

例:
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "techgear-store.firebaseapp.com",
  projectId: "techgear-store",
  storageBucket: "techgear-store.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

### 3. Stripeアカウント（必須）

#### アカウント作成
1. [Stripe](https://stripe.com/jp)にアクセス
2. 「今すぐ始める」をクリック
3. メールアドレス、名前、パスワードを設定
4. メール認証を完了

#### テストモードの確認
```
1. Stripeダッシュボードにログイン
2. 左上に「テストモード」と表示されていることを確認
   （表示されていない場合は、トグルで切り替え）
```

#### APIキーの取得
```
1. 左メニューから「開発者」→「APIキー」を選択
2. 以下の2つのキーをコピー:

   ✅ 公開可能キー（Publishable key）
      → pk_test_... で始まる
      → フロントエンドで使用

   ✅ シークレットキー（Secret key）
      → sk_test_... で始まる
      → バックエンド（Firebase Functions）で使用
      → 絶対に公開しない！
```

**重要**: シークレットキーは絶対にGitHubにpushしないこと！

---

### 4. Vercelアカウント（必須）

#### アカウント作成
1. [Vercel](https://vercel.com/)にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択（推奨）
4. GitHubアカウントで認証

#### 初期設定
```
1. チーム名を設定（個人なら自分の名前でOK）
2. 用途を選択: 「Personal」
3. 完了
```

---

## 🚀 プロジェクト作成

### ステップ1: プロジェクトの初期化

#### 1. 作業ディレクトリに移動
```bash
# 任意の場所でOK（例: Documentsフォルダ）
cd ~/Documents

# または Windowsの場合
cd C:\Users\YourName\Documents
```

#### 2. Vite + Reactプロジェクトを作成
```bash
npm create vite@latest techgear-store -- --template react

# 以下のように表示される:
# Scaffolding project in /path/to/techgear-store...
# Done. Now run:
#   cd techgear-store
#   npm install
#   npm run dev
```

#### 3. プロジェクトディレクトリに移動
```bash
cd techgear-store
```

#### 4. 依存関係をインストール
```bash
npm install
```

#### 5. 開発サーバーを起動（動作確認）
```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス
→ Viteのデフォルトページが表示されればOK ✅

**Ctrl+C** で開発サーバーを停止

---

### ステップ2: 必要なパッケージのインストール

#### 1. ルーティング（React Router）
```bash
npm install react-router-dom
```

#### 2. 状態管理（Zustand）
```bash
npm install zustand
```

#### 3. Firebase
```bash
npm install firebase
```

#### 4. Stripe
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### 5. Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 6. フォーム管理
```bash
npm install react-hook-form zod @hookform/resolvers
```

#### 7. UIライブラリ
```bash
npm install lucide-react react-hot-toast date-fns react-dropzone
```

#### 8. チャート（管理画面用）
```bash
npm install recharts
```

#### 9. 開発ツール
```bash
npm install -D eslint prettier eslint-config-prettier
```

---

### ステップ3: Tailwind CSSの設定

#### 1. tailwind.config.js を編集

`tailwind.config.js` ファイルを開いて以下のように編集：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#1E293B',
        accent: '#10B981',
      },
    },
  },
  plugins: [],
}
```

#### 2. src/index.css を編集

`src/index.css` の内容を以下に置き換え：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* カスタムスタイル */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

### ステップ4: プロジェクト構造の作成

#### ディレクトリ構造を作成

```bash
# Windowsの場合
mkdir src\components src\pages src\lib src\store src\hooks src\utils src\assets\images

# Mac/Linuxの場合
mkdir -p src/components src/pages src/lib src/store src/hooks src/utils src/assets/images
```

#### 最終的なディレクトリ構造

```
techgear-store/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/      # 共通コンポーネント
│   │   ├── layout/      # Header, Footer など
│   │   ├── ui/          # Button, Input など
│   │   └── ...
│   ├── pages/           # ページコンポーネント
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   └── ...
│   ├── lib/             # 外部ライブラリ設定
│   │   ├── firebase.js
│   │   └── stripe.js
│   ├── store/           # Zustand ストア
│   │   ├── cartStore.js
│   │   └── authStore.js
│   ├── hooks/           # カスタムフック
│   ├── utils/           # ユーティリティ関数
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.local           # 環境変数（後で作成）
├── .gitignore
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🔐 環境変数の設定

### ステップ1: .env.local ファイルを作成

プロジェクトルート（techgear-store/）に `.env.local` ファイルを作成：

```bash
# Windowsの場合（メモ帳で作成）
notepad .env.local

# Mac/Linuxの場合
touch .env.local
```

### ステップ2: 環境変数を記入

`.env.local` に以下を記入（**実際の値に置き換える**）：

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...（Firebaseから取得した値）
VITE_FIREBASE_AUTH_DOMAIN=techgear-store.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=techgear-store
VITE_FIREBASE_STORAGE_BUCKET=techgear-store.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_...（Stripeから取得した公開可能キー）
```

**重要な注意事項**:
- Viteでは環境変数は `VITE_` で始める必要がある
- Stripeのシークレットキーはここに書かない（Firebase Functionsで使用）
- このファイルは`.gitignore`に含まれている（自動的にGitから除外される）

### ステップ3: .gitignore の確認

`.gitignore` ファイルに以下が含まれていることを確認：

```
# dependencies
node_modules

# environment variables
.env.local
.env

# build
dist
build

# misc
.DS_Store
*.log
```

---

## 🔧 Firebase初期設定ファイルの作成

### src/lib/firebase.js を作成

```javascript
// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// サービスのエクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

---

## 💳 Stripe初期設定ファイルの作成

### src/lib/stripe.js を作成

```javascript
// src/lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Stripeの初期化（公開可能キーを使用）
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY
);
```

---

## 🧪 動作確認

### ステップ1: 簡単なテストページを作成

#### src/App.jsx を編集

```jsx
// src/App.jsx
import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { stripePromise } from './lib/stripe';

function App() {
  const [firebaseStatus, setFirebaseStatus] = useState('確認中...');
  const [stripeStatus, setStripeStatus] = useState('確認中...');

  useEffect(() => {
    // Firebase接続確認
    try {
      if (auth && db) {
        setFirebaseStatus('✅ 接続成功');
      }
    } catch (error) {
      setFirebaseStatus('❌ 接続失敗: ' + error.message);
    }

    // Stripe接続確認
    stripePromise
      .then((stripe) => {
        if (stripe) {
          setStripeStatus('✅ 接続成功');
        }
      })
      .catch((error) => {
        setStripeStatus('❌ 接続失敗: ' + error.message);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary mb-6">
          TechGear Store
        </h1>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">環境構築チェック</h2>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Firebase:</span>
            <span>{firebaseStatus}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Stripe:</span>
            <span>{stripeStatus}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Tailwind CSS:</span>
            <span className="text-primary">✅ 正常動作</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded">
          <p className="text-sm text-green-800">
            すべて✅なら環境構築完了です！
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
```

### ステップ2: 開発サーバーを起動

```bash
npm run dev
```

### ステップ3: ブラウザで確認

`http://localhost:5173` にアクセス

**以下が表示されればOK**:
```
TechGear Store

環境構築チェック
Firebase: ✅ 接続成功
Stripe: ✅ 接続成功
Tailwind CSS: ✅ 正常動作

すべて✅なら環境構築完了です！
```

---

## 🐙 GitHubリポジトリの作成

### ステップ1: GitHubでリポジトリ作成

1. [GitHub](https://github.com/)にログイン
2. 右上の「+」→「New repository」をクリック
3. 設定:
   - Repository name: `techgear-store`
   - Description: `Modern e-commerce site built with React, Firebase, and Stripe`
   - Public または Private（お好みで）
   - **「Add a README file」はチェックしない**
   - 「Create repository」をクリック

### ステップ2: ローカルリポジトリを初期化

```bash
# Gitの初期化（まだの場合）
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Project setup"

# メインブランチ名を設定
git branch -M main

# リモートリポジトリを追加（URLは自分のものに変更）
git remote add origin https://github.com/yourusername/techgear-store.git

# プッシュ
git push -u origin main
```

**重要**: `.env.local` は `.gitignore` に含まれているため、Gitにプッシュされません ✅

---

## 🌐 Vercelへのデプロイ（オプション）

### 今すぐデプロイする場合

#### ステップ1: Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. 「Import Git Repository」でGitHubリポジトリを選択
4. 「Import」をクリック

#### ステップ2: 環境変数を設定

1. 「Environment Variables」セクションで以下を追加:

```
Name: VITE_FIREBASE_API_KEY
Value: （実際の値）

Name: VITE_FIREBASE_AUTH_DOMAIN
Value: （実際の値）

Name: VITE_FIREBASE_PROJECT_ID
Value: （実際の値）

Name: VITE_FIREBASE_STORAGE_BUCKET
Value: （実際の値）

Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: （実際の値）

Name: VITE_FIREBASE_APP_ID
Value: （実際の値）

Name: VITE_STRIPE_PUBLIC_KEY
Value: （実際の値）
```

#### ステップ3: デプロイ

1. 「Deploy」をクリック
2. 約1-2分でデプロイ完了
3. 表示されたURLをクリックして確認

---

## ✅ セットアップ完了チェックリスト

すべてチェックできたら、環境構築完了です！

### ソフトウェア
- [ ] Node.js 18.x以上がインストール済み
- [ ] Git がインストール済み
- [ ] VS Code がインストール済み
- [ ] VS Code 拡張機能をインストール済み

### アカウント
- [ ] GitHubアカウント作成済み
- [ ] Firebaseプロジェクト作成済み
- [ ] Firebase Authentication有効化済み
- [ ] Firebase Firestore有効化済み
- [ ] Firebase Storage有効化済み
- [ ] Firebase設定情報取得済み
- [ ] Stripeアカウント作成済み
- [ ] Stripe APIキー取得済み
- [ ] Vercelアカウント作成済み

### プロジェクト
- [ ] Reactプロジェクト作成済み
- [ ] 必要なパッケージインストール済み
- [ ] Tailwind CSS設定済み
- [ ] プロジェクト構造作成済み
- [ ] .env.local作成・設定済み
- [ ] Firebase初期化ファイル作成済み
- [ ] Stripe初期化ファイル作成済み
- [ ] 動作確認ページで全て✅
- [ ] GitHubリポジトリ作成・プッシュ済み
- [ ] Vercelデプロイ済み（オプション）

---

## 🚀 次のステップ

### このドキュメント完成後にやること

1. **[ ] 開発開始！**
   - Phase 1の実装開始
   - ホームページ・商品一覧ページの作成

2. **[ ] デザインガイドラインの確認**
   - 次のドキュメント: `06_design-guideline.md`（後で作成）
   - カラー、タイポグラフィの確認

3. **[ ] コンポーネント設計の確認**
   - 次のドキュメント: `08_component-design.md`（後で作成）
   - 共通コンポーネントの設計

---

## 🔧 トラブルシューティング

### よくあるエラーと解決法

#### エラー1: npm install が失敗する

**症状**:
```
npm ERR! code ENOENT
```

**解決法**:
```bash
# Node.jsのバージョン確認
node --version

# 16.x以上でない場合は、Node.jsを再インストール
# npmのキャッシュをクリア
npm cache clean --force

# 再度インストール
npm install
```

---

#### エラー2: Firebase接続失敗

**症状**:
```
Firebase: Error (auth/invalid-api-key)
```

**解決法**:
1. `.env.local` のAPIキーが正しいか確認
2. Firebaseコンソールで取得した値と一致するか確認
3. `VITE_` プレフィックスがついているか確認
4. 開発サーバーを再起動（環境変数の変更後は必須）

```bash
# Ctrl+C で停止
# 再起動
npm run dev
```

---

#### エラー3: Stripe接続失敗

**症状**:
```
IntegrationError: Invalid value for publishableKey
```

**解決法**:
1. `.env.local` のStripeキーが正しいか確認
2. `pk_test_` で始まる公開可能キーを使用しているか確認
3. `sk_test_` （シークレットキー）を使用していないか確認
4. 開発サーバーを再起動

---

#### エラー4: Tailwind CSSが効かない

**症状**:
- スタイルが適用されない
- `className` が無視される

**解決法**:
1. `tailwind.config.js` の `content` 設定を確認
2. `src/index.css` で `@tailwind` ディレクティブが記述されているか確認
3. `main.jsx` で `index.css` がインポートされているか確認
4. 開発サーバーを再起動

---

#### エラー5: ポート3000が使用中

**症状**:
```
Port 5173 is already in use
```

**解決法**:
```bash
# 別のポートで起動
npm run dev -- --port 3000

# または、使用中のプロセスを終了
# Windowsの場合
netstat -ano | findstr :5173
taskkill /PID <プロセスID> /F

# Mac/Linuxの場合
lsof -ti:5173 | xargs kill
```

---

## 📚 関連ドキュメント

- **前のドキュメント**: `02_tech-stack-decision.md`（技術選定）
- **次のドキュメント**: Phase 1実装開始、または `06_design-guideline.md`（デザインガイドライン）
- **参考ドキュメント**: 
  - `ecommerce-project-specification.md`（全体仕様書）
  - `recommended-workflow.md`（推奨作業順序）

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|----------|--------|
| 1.0 | 2025/10/02 | 初版作成 | _____ |
| _____ | _____ | _____ | _____ |

---

## 💭 メモ・その他

**（環境構築に関する自由記入欄）**

```
環境構築で困ったこと、エラーが出た場合の対処法、参考になったリンクなどをメモしてください。









```

---

**環境構築が完了したら、いよいよ開発開始です！** 🎉🚀
