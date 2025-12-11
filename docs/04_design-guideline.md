# 【第3段階】UI/UXの方向性を決める
# 4. デザインガイドライン

---

## 📋 ドキュメント情報

- **作成日**: 2025年10月2日
- **ドキュメント番号**: 04
- **ステータス**: 作成中
- **作成順序**: 4/12

---

## 🎯 このドキュメントの目的

このドキュメントでは、TechGear Storeの統一されたデザインシステムを定義します。

**すべてのページ・コンポーネントはこのガイドラインに従います。**

---

## 🎨 ブランドアイデンティティ

### ブランドコンセプト（再確認）

```
TechGear Store
"Your Tech, Your Style"

【コンセプト】
1. モダン・シンプル - 無駄のないクリーンなデザイン
2. テクノロジー志向 - 最新のガジェットに特化
3. 信頼性 - 安全で透明性の高いショッピング体験
4. スピード感 - 高速で効率的な操作性
5. プロフェッショナル - 質の高い商品とサービス
```

---

## 🎨 カラーパレット

### プライマリーカラー（メインカラー）

#### Blue - #2563EB
```
用途:
- メインボタン
- リンク
- アクティブな状態
- ブランドカラー

色相: 青
意味: テクノロジー、信頼性、プロフェッショナル
```

**バリエーション**:
```css
/* Tailwind CSS クラス */
bg-blue-600    #2563EB  (メイン)
bg-blue-700    #1D4ED8  (ホバー時)
bg-blue-500    #3B82F6  (明るいバージョン)
bg-blue-800    #1E40AF  (濃いバージョン)

/* 透明度バリエーション */
bg-blue-600/10  (10%透明度 - 背景)
bg-blue-600/20  (20%透明度 - ホバー背景)
```

**使用例**:
- プライマリーボタン: `bg-blue-600 hover:bg-blue-700`
- リンクテキスト: `text-blue-600 hover:text-blue-700`
- アクティブな状態: `border-blue-600`

---

### セカンダリーカラー（サブカラー）

#### Dark Gray - #1E293B
```
用途:
- ヘッダー背景
- フッター背景
- テキスト（見出し）
- セカンダリーボタン

色相: ダークグレー
意味: 洗練、プロフェッショナル、安定感
```

**バリエーション**:
```css
/* Tailwind CSS クラス */
bg-slate-800   #1E293B  (メイン)
bg-slate-900   #0F172A  (より濃い)
bg-slate-700   #334155  (やや明るい)
text-slate-800 #1E293B  (テキスト)
```

**使用例**:
- ヘッダー: `bg-slate-800 text-white`
- 見出し: `text-slate-800`
- セカンダリーボタン: `bg-slate-700 hover:bg-slate-800`

---

### アクセントカラー（強調色）

#### Green - #10B981
```
用途:
- 成功メッセージ
- 購入完了
- 在庫あり表示
- ポジティブなアクション

色相: 緑
意味: 成功、安全、GO
```

**バリエーション**:
```css
/* Tailwind CSS クラス */
bg-green-500   #10B981  (メイン)
bg-green-600   #059669  (濃い)
bg-green-400   #34D399  (明るい)
text-green-500 #10B981  (テキスト)
```

**使用例**:
- 成功メッセージ: `bg-green-50 border-green-500 text-green-700`
- カートに追加ボタン: `bg-green-500 hover:bg-green-600`
- 在庫表示: `text-green-500`

---

### システムカラー（状態表示）

#### Success（成功） - Green
```css
bg-green-500   #10B981
bg-green-50    #ECFDF5  (背景)
text-green-700 #047857  (テキスト)
```

#### Warning（警告） - Orange
```css
bg-orange-500  #F97316
bg-orange-50   #FFF7ED  (背景)
text-orange-700 #C2410C (テキスト)
```

#### Error（エラー） - Red
```css
bg-red-500     #EF4444
bg-red-50      #FEF2F2  (背景)
text-red-700   #B91C1C  (テキスト)
```

#### Info（情報） - Light Blue
```css
bg-sky-500     #0EA5E9
bg-sky-50      #F0F9FF  (背景)
text-sky-700   #0369A1  (テキスト)
```

---

### グレースケール（背景・テキスト）

```css
/* 背景色 */
bg-white       #FFFFFF  (メイン背景)
bg-gray-50     #F9FAFB  (セクション背景)
bg-gray-100    #F3F4F6  (カード背景)
bg-gray-200    #E5E7EB  (ボーダー、区切り線)

/* テキスト色 */
text-gray-900  #111827  (メインテキスト)
text-gray-700  #374151  (サブテキスト)
text-gray-500  #6B7280  (説明文、ヒント)
text-gray-400  #9CA3AF  (プレースホルダー)

/* ボーダー色 */
border-gray-200 #E5E7EB  (薄いボーダー)
border-gray-300 #D1D5DB  (標準ボーダー)
```

---

## 🔤 タイポグラフィ

### フォントファミリー

#### プライマリーフォント
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
  'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
  'Droid Sans', 'Helvetica Neue', sans-serif;
```

**特徴**:
- モダンで読みやすい
- 数字が見やすい（価格表示に最適）
- 日本語との相性も良い

**Google Fontsから読み込み**:
```html
<!-- index.html の <head> に追加 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

---

### フォントサイズ

#### 見出し（Headings）

```css
/* H1 - ページタイトル */
text-4xl      /* 36px / 2.25rem */
font-bold     /* 700 */
text-slate-800

例: "商品一覧"、"マイページ"

/* H2 - セクションタイトル */
text-3xl      /* 30px / 1.875rem */
font-bold     /* 700 */
text-slate-800

例: "注目商品"、"カテゴリー"

/* H3 - サブセクション */
text-2xl      /* 24px / 1.5rem */
font-semibold /* 600 */
text-slate-800

例: "商品詳細"、"配送情報"

/* H4 - カードタイトル */
text-xl       /* 20px / 1.25rem */
font-semibold /* 600 */
text-slate-800

例: 商品カードの商品名

/* H5 - 小見出し */
text-lg       /* 18px / 1.125rem */
font-medium   /* 500 */
text-slate-700

/* H6 - 最小見出し */
text-base     /* 16px / 1rem */
font-medium   /* 500 */
text-slate-700
```

---

#### 本文（Body Text）

```css
/* 大きめの本文 */
text-lg       /* 18px / 1.125rem */
font-normal   /* 400 */
text-gray-700

例: 商品説明（重要な部分）

/* 標準本文 */
text-base     /* 16px / 1rem */
font-normal   /* 400 */
text-gray-700

例: 通常のテキスト、商品説明

/* 小さめの本文 */
text-sm       /* 14px / 0.875rem */
font-normal   /* 400 */
text-gray-600

例: 補足情報、注記

/* 最小テキスト */
text-xs       /* 12px / 0.75rem */
font-normal   /* 400 */
text-gray-500

例: フッター、著作権表示、ヒント
```

---

#### 特殊テキスト

```css
/* 価格表示 */
text-2xl      /* 24px */
font-bold     /* 700 */
text-slate-900

例: ¥15,800

/* 割引価格 */
text-lg       /* 18px */
font-semibold /* 600 */
text-red-600

例: ¥12,800（セール価格）

/* ボタンテキスト */
text-sm       /* 14px */
font-medium   /* 500 */

/* バッジ・タグ */
text-xs       /* 12px */
font-semibold /* 600 */
uppercase     /* 大文字 */

例: NEW, SALE, 在庫わずか
```

---

### 行間（Line Height）

```css
/* 見出し */
leading-tight    /* 1.25 */

/* 本文 */
leading-normal   /* 1.5 */

/* 長文 */
leading-relaxed  /* 1.625 */

/* 説明文 */
leading-loose    /* 2 */
```

---

### 文字間隔（Letter Spacing）

```css
/* タイトル */
tracking-tight   /* -0.025em */

/* 通常 */
tracking-normal  /* 0 */

/* バッジ、タグ */
tracking-wide    /* 0.025em */

/* 大文字表記 */
tracking-wider   /* 0.05em */
uppercase
```

---

## 📐 スペーシング（余白）

### 基本単位

Tailwind CSSのスペーシングスケール（4px単位）を使用

```
1 = 4px
2 = 8px
3 = 12px
4 = 16px
5 = 20px
6 = 24px
8 = 32px
10 = 40px
12 = 48px
16 = 64px
20 = 80px
```

---

### コンポーネント内の余白

#### ボタン
```css
/* 小 */
px-3 py-1.5   /* 12px 6px */

/* 中（標準） */
px-4 py-2     /* 16px 8px */

/* 大 */
px-6 py-3     /* 24px 12px */

/* 特大 */
px-8 py-4     /* 32px 16px */
```

#### カード
```css
p-4   /* 16px - 小さいカード */
p-6   /* 24px - 標準カード */
p-8   /* 32px - 大きいカード */
```

#### インプットフィールド
```css
px-4 py-2.5   /* 16px 10px */
```

---

### セクション間の余白

```css
/* コンポーネント間 */
mb-4    /* 16px - 小 */
mb-6    /* 24px - 標準 */
mb-8    /* 32px - 大 */

/* セクション間 */
mb-12   /* 48px - セクション */
mb-16   /* 64px - 大セクション */
mb-20   /* 80px - ページセクション */

/* ページ上下余白 */
py-12   /* 48px - 標準 */
py-16   /* 64px - 大 */
py-20   /* 80px - 特大 */
```

---

### コンテナ最大幅

```css
/* 全体コンテナ */
max-w-7xl     /* 1280px - メインコンテンツ */
mx-auto       /* 中央寄せ */
px-4          /* 左右余白（モバイル） */
sm:px-6       /* 左右余白（タブレット） */
lg:px-8       /* 左右余白（デスクトップ） */

/* 狭いコンテナ（フォームなど） */
max-w-md      /* 448px */
max-w-lg      /* 512px */
max-w-xl      /* 576px */
max-w-2xl     /* 672px */
```

---

## 🎨 コンポーネントスタイル

### ボタン（Button）

#### プライマリーボタン
```css
bg-blue-600 
hover:bg-blue-700 
text-white 
font-medium 
px-4 py-2 
rounded-lg 
transition-colors 
duration-200
shadow-sm
hover:shadow-md
```

**使用例**: 「カートに追加」、「購入する」、「送信」

---

#### セカンダリーボタン
```css
bg-gray-200 
hover:bg-gray-300 
text-gray-800 
font-medium 
px-4 py-2 
rounded-lg 
transition-colors 
duration-200
```

**使用例**: 「キャンセル」、「戻る」

---

#### アウトラインボタン
```css
border-2 
border-blue-600 
text-blue-600 
hover:bg-blue-50 
font-medium 
px-4 py-2 
rounded-lg 
transition-colors 
duration-200
```

**使用例**: 「詳細を見る」、「もっと見る」

---

#### テキストボタン
```css
text-blue-600 
hover:text-blue-700 
hover:underline 
font-medium
transition-colors 
duration-200
```

**使用例**: 「ログイン」、「パスワードを忘れた」

---

#### 危険ボタン（Danger）
```css
bg-red-600 
hover:bg-red-700 
text-white 
font-medium 
px-4 py-2 
rounded-lg 
transition-colors 
duration-200
```

**使用例**: 「削除」、「キャンセル（注文）」

---

### インプットフィールド（Input）

#### テキストインプット
```css
w-full 
px-4 py-2.5 
border border-gray-300 
rounded-lg 
focus:ring-2 
focus:ring-blue-500 
focus:border-transparent 
transition-all 
duration-200
text-gray-900
placeholder:text-gray-400
```

#### エラー状態
```css
border-red-500 
focus:ring-red-500
text-red-900
```

#### 無効状態
```css
bg-gray-100 
cursor-not-allowed 
opacity-60
```

---

### カード（Card）

#### 標準カード
```css
bg-white 
rounded-lg 
shadow-md 
hover:shadow-lg 
transition-shadow 
duration-300 
overflow-hidden
```

#### 商品カード
```css
bg-white 
rounded-lg 
shadow-md 
hover:shadow-xl 
transition-all 
duration-300 
overflow-hidden
hover:scale-105
transform
cursor-pointer
```

---

### バッジ・タグ（Badge/Tag）

#### 成功バッジ
```css
bg-green-100 
text-green-800 
text-xs 
font-semibold 
px-2.5 py-0.5 
rounded-full
uppercase
tracking-wide
```

**使用例**: 「在庫あり」、「NEW」

---

#### 警告バッジ
```css
bg-orange-100 
text-orange-800 
text-xs 
font-semibold 
px-2.5 py-0.5 
rounded-full
uppercase
tracking-wide
```

**使用例**: 「在庫わずか」

---

#### エラーバッジ
```css
bg-red-100 
text-red-800 
text-xs 
font-semibold 
px-2.5 py-0.5 
rounded-full
uppercase
tracking-wide
```

**使用例**: 「在庫切れ」、「SALE」

---

### トースト通知（Toast）

#### 成功トースト
```css
bg-green-50 
border-l-4 
border-green-500 
text-green-700 
p-4 
rounded-r-lg
shadow-lg
```

#### エラートースト
```css
bg-red-50 
border-l-4 
border-red-500 
text-red-700 
p-4 
rounded-r-lg
shadow-lg
```

---

## 🖼️ 画像ガイドライン

### 商品画像

#### サイズ・比率
```
推奨サイズ: 800x800px
最小サイズ: 500x500px
最大サイズ: 2000x2000px
アスペクト比: 1:1（正方形）
フォーマット: JPEG, PNG
```

#### 品質
```
解像度: 72-150 DPI
圧縮: 最適化済み（WebP推奨）
ファイルサイズ: 100KB以下（理想）
背景: 白または透明
```

---

### バナー・ヒーロー画像

```
推奨サイズ: 1920x600px
アスペクト比: 16:5
フォーマット: JPEG
ファイルサイズ: 200KB以下
```

---

## 📱 レスポンシブデザイン

### ブレークポイント

```css
/* Tailwind CSS デフォルト */
sm:   640px   /* タブレット（縦） */
md:   768px   /* タブレット（横） */
lg:   1024px  /* ノートPC */
xl:   1280px  /* デスクトップ */
2xl:  1536px  /* 大画面 */
```

---

### レスポンシブクラスの使用例

```css
/* モバイルファースト */
text-sm        /* モバイル: 14px */
md:text-base   /* タブレット: 16px */
lg:text-lg     /* デスクトップ: 18px */

/* グリッドレイアウト */
grid 
grid-cols-1           /* モバイル: 1列 */
sm:grid-cols-2        /* タブレット: 2列 */
md:grid-cols-3        /* タブレット横: 3列 */
lg:grid-cols-4        /* デスクトップ: 4列 */

/* パディング */
p-4              /* モバイル: 16px */
md:p-6           /* タブレット: 24px */
lg:p-8           /* デスクトップ: 32px */
```

---

### モバイル優先のアプローチ

1. **基本スタイル = モバイル**
2. `sm:` でタブレット対応
3. `md:` 以上でPC対応

```css
/* 良い例 */
<div className="text-sm md:text-base lg:text-lg">

/* 悪い例 */
<div className="lg:text-lg md:text-base text-sm">
```

---

## 🎭 アニメーション・トランジション

### 基本トランジション

```css
/* ホバーエフェクト */
transition-colors duration-200

/* 影の変化 */
transition-shadow duration-300

/* すべてのプロパティ */
transition-all duration-200

/* スケール変化 */
transform 
transition-transform 
duration-300
hover:scale-105
```

---

### アニメーション例

#### ボタンホバー
```css
transition-all 
duration-200 
hover:shadow-lg 
hover:-translate-y-0.5
```

#### カードホバー
```css
transition-all 
duration-300 
hover:shadow-xl 
hover:scale-102
```

#### フェードイン
```css
opacity-0 
animate-fade-in
/* カスタムアニメーションが必要 */
```

---

## 🔍 アクセシビリティ

### コントラスト比

```
WCAG AA準拠
- 通常テキスト: 4.5:1以上
- 大きなテキスト: 3:1以上
- UIコンポーネント: 3:1以上

使用している色の組み合わせ:
✅ text-gray-900 on bg-white (21:1)
✅ text-blue-600 on bg-white (8.59:1)
✅ text-white on bg-blue-600 (8.59:1)
```

---

### フォーカス状態

```css
focus:ring-2 
focus:ring-blue-500 
focus:ring-offset-2 
focus:outline-none
```

すべてのインタラクティブ要素に適用

---

### ARIAラベル

```jsx
/* ボタン */
<button aria-label="カートに追加">
  <CartIcon />
</button>

/* インプット */
<input 
  type="text" 
  aria-label="商品を検索"
  placeholder="商品を検索"
/>
```

---

## 📚 参考サイト

### デザインインスピレーション

1. **Apple Store**
   - URL: https://www.apple.com/jp/store
   - 参考点: シンプルさ、商品画像の見せ方

2. **Anker Japan**
   - URL: https://www.ankerjapan.com/
   - 参考点: モダンなデザイン、レスポンシブ対応

3. **Stripe**
   - URL: https://stripe.com/jp
   - 参考点: グラデーション、アニメーション

4. **Vercel**
   - URL: https://vercel.com/
   - 参考点: ダークモード、タイポグラフィ

---

## 🎨 デザインツール

### 推奨ツール

1. **Figma**（デザイン作成）
   - URL: https://www.figma.com/
   - 用途: ワイヤーフレーム、モックアップ

2. **Coolors**（カラーパレット）
   - URL: https://coolors.co/
   - 用途: 色の組み合わせ確認

3. **Google Fonts**（フォント）
   - URL: https://fonts.google.com/
   - 推奨: Inter

4. **Lucide Icons**（アイコン）
   - URL: https://lucide.dev/
   - 用途: UIアイコン

---

## ✅ デザインチェックリスト

実装時に以下を確認：

### カラー
- [ ] プライマリーカラー（#2563EB）を使用
- [ ] グレースケールを統一
- [ ] コントラスト比がWCAG AA準拠

### タイポグラフィ
- [ ] Interフォントを使用
- [ ] フォントサイズが統一
- [ ] 行間が適切

### スペーシング
- [ ] 4pxの倍数で余白を設定
- [ ] コンポーネント間の余白が統一
- [ ] レスポンシブ対応

### コンポーネント
- [ ] ボタンスタイルが統一
- [ ] カードデザインが統一
- [ ] ホバーエフェクトがある

### アクセシビリティ
- [ ] フォーカス状態が見える
- [ ] ARIAラベルがある
- [ ] キーボード操作可能

---

## 🚀 次のステップ

### このドキュメント完成後にやること

1. **[ ] ワイヤーフレーム作成**
   - 次のドキュメント: `05_wireframes.md`
   - 各ページのレイアウト設計

2. **[ ] 共通コンポーネント実装**
   - デザインガイドラインに従って実装
   - Button, Input, Card など

3. **[ ] Tailwind設定のカスタマイズ**
   - tailwind.config.js にカラー追加
   - カスタムクラス定義

---

## 📚 関連ドキュメント

- **前のドキュメント**: `03_setup-guide.md`（環境構築）
- **次のドキュメント**: `05_wireframes.md`（ワイヤーフレーム）
- **参考ドキュメント**: 
  - `01_project-overview.md`（ブランドコンセプト）
  - `ecommerce-project-specification.md`（全体仕様書）

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|----------|--------|
| 1.0 | 2025/10/02 | 初版作成 | _____ |
| _____ | _____ | _____ | _____ |

---

## 💭 メモ・カスタマイズ

**（デザインに関する自由記入欄）**

```
デザインの調整案、追加したい色、参考にしたいサイトなどをメモしてください。









```

---

**デザインガイドラインが完成したら、次はワイヤーフレーム作成です！** 🎨✨
