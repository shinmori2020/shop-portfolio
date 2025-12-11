# 【第4段階】実装計画を立てる
# 6. コンポーネント設計書

---

## 📋 ドキュメント情報

- **作成日**: 2025年10月2日
- **ドキュメント番号**: 06
- **ステータス**: 作成中
- **作成順序**: 6/12

---

## 🎯 このドキュメントの目的

このドキュメントでは、TechGear Storeで使用する**再利用可能なコンポーネント**を設計します。

**各コンポーネントのProps、使用例、バリエーションを明確にします。**

---

## 📦 コンポーネント分類

### 1. 共通コンポーネント（Atoms）
最も基本的な、再利用可能な小さなコンポーネント

### 2. レイアウトコンポーネント（Layouts）
ページ全体の構造を定義するコンポーネント

### 3. 機能コンポーネント（Molecules）
複数のAtomsを組み合わせた機能的なコンポーネント

### 4. ページコンポーネント（Organisms）
完全なページセクションを構成するコンポーネント

---

## 🔹 1. 共通コンポーネント（Atoms）

### 1.1 Button

#### 📝 説明
汎用的なボタンコンポーネント

#### Props定義

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  className?: string;
}
```

#### 使用例

```tsx
// プライマリーボタン
<Button variant="primary" size="md">
  カートに追加
</Button>

// アイコン付きボタン
<Button variant="outline" icon={<ShoppingCart />}>
  カートを見る
</Button>

// ローディング状態
<Button variant="primary" loading disabled>
  処理中...
</Button>

// フルワイド
<Button variant="primary" fullWidth>
  注文を確定する
</Button>
```

#### スタイルバリエーション

```css
/* Primary */
bg-blue-600 text-white hover:bg-blue-700

/* Secondary */
bg-gray-600 text-white hover:bg-gray-700

/* Outline */
border-2 border-blue-600 text-blue-600 hover:bg-blue-50

/* Ghost */
text-blue-600 hover:bg-blue-50

/* Danger */
bg-red-600 text-white hover:bg-red-700
```

---

### 1.2 Input

#### 📝 説明
フォーム入力フィールド

#### Props定義

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}
```

#### 使用例

```tsx
// 基本的な入力
<Input
  type="email"
  label="メールアドレス"
  placeholder="example@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// エラー表示
<Input
  type="password"
  label="パスワード"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error="パスワードは8文字以上である必要があります"
/>

// アイコン付き
<Input
  type="text"
  placeholder="商品を検索..."
  icon={<SearchIcon />}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

---

### 1.3 Card

#### 📝 説明
コンテンツを囲むカードコンポーネント

#### Props定義

```typescript
interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}
```

#### 使用例

```tsx
// 基本的なカード
<Card padding="md" shadow="md">
  <h3>カードタイトル</h3>
  <p>カードの内容</p>
</Card>

// ホバー効果付き
<Card hover padding="md" shadow="sm" onClick={handleClick}>
  クリック可能なカード
</Card>

// パディングなし（画像用）
<Card padding="none" shadow="md">
  <img src="..." alt="..." />
  <div className="p-4">
    <h3>画像付きカード</h3>
  </div>
</Card>
```

---

### 1.4 Badge

#### 📝 説明
ステータスやカテゴリーを表示するバッジ

#### Props定義

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### 使用例

```tsx
// ステータスバッジ
<Badge variant="success">在庫あり</Badge>
<Badge variant="warning">残りわずか</Badge>
<Badge variant="danger">在庫切れ</Badge>

// NEWバッジ
<Badge variant="info">NEW</Badge>

// SALEバッジ
<Badge variant="danger" size="lg">SALE</Badge>
```

---

### 1.5 Modal

#### 📝 説明
モーダルダイアログコンポーネント

#### Props定義

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
}
```

#### 使用例

```tsx
// 基本的なモーダル
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="商品の詳細"
  size="md"
>
  <p>モーダルの内容</p>
</Modal>

// フッター付きモーダル
<Modal
  isOpen={isConfirmOpen}
  onClose={() => setIsConfirmOpen(false)}
  title="注文の確認"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
        キャンセル
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        確定する
      </Button>
    </>
  }
>
  <p>この注文を確定しますか？</p>
</Modal>
```

---

### 1.6 Loading

#### 📝 説明
ローディング表示コンポーネント

#### Props定義

```typescript
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}
```

#### 使用例

```tsx
// 小さなローディング
<Loading size="sm" />

// テキスト付き
<Loading size="md" text="読み込み中..." />

// フルスクリーン
<Loading fullScreen text="処理中..." />
```

---

### 1.7 Toast

#### 📝 説明
通知メッセージ表示コンポーネント

#### Props定義

```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // ミリ秒
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  onClose?: () => void;
}
```

#### 使用例

```tsx
// 成功メッセージ
<Toast
  message="カートに追加しました"
  type="success"
  duration={3000}
  position="top-right"
/>

// エラーメッセージ
<Toast
  message="エラーが発生しました"
  type="error"
  duration={5000}
  position="top-center"
/>
```

---

### 1.8 Select

#### 📝 説明
ドロップダウン選択コンポーネント

#### Props定義

```typescript
interface SelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}
```

#### 使用例

```tsx
<Select
  label="カテゴリー"
  placeholder="選択してください"
  options={[
    { value: 'wireless', label: 'ワイヤレスイヤホン' },
    { value: 'smartphone', label: 'スマートフォンアクセサリー' },
    { value: 'pc', label: 'PC周辺機器' },
  ]}
  value={category}
  onChange={setCategory}
/>
```

---

### 1.9 Checkbox

#### 📝 説明
チェックボックスコンポーネント

#### Props定義

```typescript
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}
```

#### 使用例

```tsx
<Checkbox
  checked={agreedToTerms}
  onChange={setAgreedToTerms}
  label="利用規約に同意する"
/>
```

---

### 1.10 Radio

#### 📝 説明
ラジオボタンコンポーネント

#### Props定義

```typescript
interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}
```

#### 使用例

```tsx
<Radio
  name="payment"
  value="credit"
  checked={paymentMethod === 'credit'}
  onChange={setPaymentMethod}
  label="クレジットカード"
/>
<Radio
  name="payment"
  value="bank"
  checked={paymentMethod === 'bank'}
  onChange={setPaymentMethod}
  label="銀行振込"
/>
```

---

## 📐 2. レイアウトコンポーネント（Layouts）

### 2.1 Header

#### 📝 説明
全ページ共通のヘッダー

#### Props定義

```typescript
interface HeaderProps {
  user?: User | null;
  cartItemCount?: number;
  onSearchSubmit?: (query: string) => void;
}
```

#### 使用例

```tsx
<Header
  user={currentUser}
  cartItemCount={3}
  onSearchSubmit={handleSearch}
/>
```

#### 含まれる要素
- ロゴ
- 検索バー
- ナビゲーションメニュー
- カートアイコン（商品数表示）
- ユーザーアイコン（ログイン/ログアウト）

---

### 2.2 Footer

#### 📝 説明
全ページ共通のフッター

#### Props定義

```typescript
interface FooterProps {
  className?: string;
}
```

#### 使用例

```tsx
<Footer />
```

#### 含まれる要素
- 会社情報リンク
- サポートリンク
- SNSリンク
- コピーライト表記

---

### 2.3 Container

#### 📝 説明
コンテンツを中央に配置するラッパー

#### Props定義

```typescript
interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}
```

#### 使用例

```tsx
<Container size="lg">
  <h1>ページタイトル</h1>
  <p>コンテンツ</p>
</Container>
```

---

### 2.4 Sidebar

#### 📝 説明
サイドバーコンポーネント（管理画面等）

#### Props定義

```typescript
interface SidebarProps {
  items: Array<{
    icon: React.ReactNode;
    label: string;
    path: string;
    active?: boolean;
  }>;
  onItemClick?: (path: string) => void;
}
```

#### 使用例

```tsx
<Sidebar
  items={[
    { icon: <HomeIcon />, label: 'ダッシュボード', path: '/admin' },
    { icon: <BoxIcon />, label: '商品管理', path: '/admin/products' },
    { icon: <OrderIcon />, label: '注文管理', path: '/admin/orders' },
  ]}
  onItemClick={handleNavigation}
/>
```

---

## 🔧 3. 機能コンポーネント（Molecules）

### 3.1 ProductCard

#### 📝 説明
商品カード（一覧ページで使用）

#### Props定義

```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    rating?: number;
    isNew?: boolean;
    onSale?: boolean;
  };
  onAddToCart?: (productId: string) => void;
  onClick?: (productId: string) => void;
}
```

#### 使用例

```tsx
<ProductCard
  product={{
    id: '1',
    name: 'ワイヤレスイヤホン',
    price: 15800,
    image: '/images/earphone.jpg',
    category: 'ワイヤレスイヤホン',
    stock: 50,
    rating: 4.5,
    isNew: true,
  }}
  onAddToCart={handleAddToCart}
  onClick={handleProductClick}
/>
```

#### 含まれる要素
- 商品画像
- NEWバッジ（新商品の場合）
- SALEバッジ（セール中の場合）
- 商品名
- 価格
- 評価（星）
- 在庫状況バッジ
- カートに追加ボタン

---

### 3.2 CartItem

#### 📝 説明
カート内の商品アイテム

#### Props定義

```typescript
interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
  };
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
}
```

#### 使用例

```tsx
<CartItem
  item={{
    id: '1',
    name: 'ワイヤレスイヤホン',
    price: 15800,
    image: '/images/earphone.jpg',
    quantity: 2,
    stock: 50,
  }}
  onQuantityChange={handleQuantityChange}
  onRemove={handleRemove}
/>
```

#### 含まれる要素
- 商品画像（小）
- 商品名
- 単価
- 数量選択
- 小計
- 削除ボタン
- 在庫状況

---

### 3.3 ReviewCard

#### 📝 説明
レビュー表示カード

#### Props定義

```typescript
interface ReviewCardProps {
  review: {
    id: string;
    userName: string;
    rating: number;
    date: string;
    title?: string;
    comment: string;
    helpful?: number;
  };
  onHelpful?: (reviewId: string) => void;
}
```

#### 使用例

```tsx
<ReviewCard
  review={{
    id: '1',
    userName: '田中太郎',
    rating: 5,
    date: '2025/09/15',
    title: '音質が素晴らしい！',
    comment: 'ノイズキャンセリングも効果的です...',
    helpful: 12,
  }}
  onHelpful={handleHelpful}
/>
```

#### 含まれる要素
- ユーザー名
- 評価（星）
- 投稿日
- レビュータイトル
- レビュー本文
- 「役に立った」ボタン

---

### 3.4 OrderSummary

#### 📝 説明
注文サマリー（チェックアウトページ等）

#### Props定義

```typescript
interface OrderSummaryProps {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  editable?: boolean;
  onEdit?: () => void;
}
```

#### 使用例

```tsx
<OrderSummary
  items={cartItems}
  subtotal={48200}
  shipping={0}
  tax={4820}
  total={53020}
  editable
  onEdit={handleEdit}
/>
```

#### 含まれる要素
- 注文商品リスト
- 小計
- 配送料
- 税金
- 合計金額
- 編集ボタン（オプション）

---

### 3.5 SearchBar

#### 📝 説明
検索バーコンポーネント

#### Props定義

```typescript
interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  suggestions?: string[];
  className?: string;
}
```

#### 使用例

```tsx
<SearchBar
  placeholder="商品を検索..."
  value={searchQuery}
  onChange={setSearchQuery}
  onSubmit={handleSearch}
  suggestions={['イヤホン', 'マウス', 'キーボード']}
/>
```

---

### 3.6 Pagination

#### 📝 説明
ページネーションコンポーネント

#### Props定義

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisible?: number;
}
```

#### 使用例

```tsx
<Pagination
  currentPage={2}
  totalPages={10}
  onPageChange={handlePageChange}
  showFirstLast
  maxVisible={5}
/>
```

---

### 3.7 Breadcrumb

#### 📝 説明
パンくずリストコンポーネント

#### Props定義

```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string;
    path?: string;
  }>;
}
```

#### 使用例

```tsx
<Breadcrumb
  items={[
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'ワイヤレスイヤホン', path: '/products/wireless' },
    { label: '商品名' },
  ]}
/>
```

---

### 3.8 FilterPanel

#### 📝 説明
商品フィルターパネル

#### Props定義

```typescript
interface FilterPanelProps {
  categories: string[];
  priceRange: { min: number; max: number };
  selectedCategory?: string;
  selectedPriceRange?: { min: number; max: number };
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  onReset: () => void;
}
```

#### 使用例

```tsx
<FilterPanel
  categories={['すべて', 'ワイヤレスイヤホン', 'スマホアクセサリー']}
  priceRange={{ min: 0, max: 100000 }}
  selectedCategory="ワイヤレスイヤホン"
  onCategoryChange={handleCategoryChange}
  onPriceRangeChange={handlePriceChange}
  onReset={handleReset}
/>
```

---

### 3.9 ImageGallery

#### 📝 説明
画像ギャラリー（商品詳細ページ）

#### Props定義

```typescript
interface ImageGalleryProps {
  images: string[];
  altText?: string;
  onImageClick?: (index: number) => void;
}
```

#### 使用例

```tsx
<ImageGallery
  images={[
    '/images/product1.jpg',
    '/images/product2.jpg',
    '/images/product3.jpg',
  ]}
  altText="商品画像"
  onImageClick={handleImageClick}
/>
```

---

### 3.10 RatingStars

#### 📝 説明
評価星表示コンポーネント

#### Props定義

```typescript
interface RatingStarsProps {
  rating: number; // 0-5
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}
```

#### 使用例

```tsx
// 表示のみ
<RatingStars rating={4.5} size="md" />

// インタラクティブ（レビュー投稿時）
<RatingStars
  rating={userRating}
  size="lg"
  interactive
  onChange={setUserRating}
/>
```

---

## 🏗️ 4. ページコンポーネント（Organisms）

### 4.1 HeroSection

#### 📝 説明
ホームページのヒーローセクション

#### Props定義

```typescript
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}
```

#### 使用例

```tsx
<HeroSection
  title="Your Tech, Your Style"
  subtitle="最新のガジェットをお届けします"
  backgroundImage="/images/hero-bg.jpg"
  ctaText="ショッピングを始める"
  onCtaClick={handleShopNow}
/>
```

---

### 4.2 FeaturedProducts

#### 📝 説明
注目商品セクション

#### Props定義

```typescript
interface FeaturedProductsProps {
  title?: string;
  products: Product[];
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}
```

#### 使用例

```tsx
<FeaturedProducts
  title="注目商品"
  products={featuredProducts}
  onProductClick={handleProductClick}
  onAddToCart={handleAddToCart}
/>
```

---

### 4.3 CategoryGrid

#### 📝 説明
カテゴリー一覧グリッド

#### Props定義

```typescript
interface CategoryGridProps {
  categories: Array<{
    id: string;
    name: string;
    image: string;
    productCount: number;
  }>;
  onCategoryClick?: (categoryId: string) => void;
}
```

#### 使用例

```tsx
<CategoryGrid
  categories={[
    { id: '1', name: 'ワイヤレスイヤホン', image: '...', productCount: 24 },
    { id: '2', name: 'スマホアクセサリー', image: '...', productCount: 56 },
  ]}
  onCategoryClick={handleCategoryClick}
/>
```

---

### 4.4 ProductGrid

#### 📝 説明
商品一覧グリッド

#### Props定義

```typescript
interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}
```

#### 使用例

```tsx
<ProductGrid
  products={products}
  loading={isLoading}
  columns={4}
  onProductClick={handleProductClick}
  onAddToCart={handleAddToCart}
/>
```

---

### 4.5 CheckoutForm

#### 📝 説明
チェックアウトフォーム

#### Props定義

```typescript
interface CheckoutFormProps {
  onSubmit: (data: CheckoutData) => void;
  loading?: boolean;
  initialData?: Partial<CheckoutData>;
}

interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  deliveryNote?: string;
}
```

#### 使用例

```tsx
<CheckoutForm
  onSubmit={handleCheckout}
  loading={isProcessing}
  initialData={savedAddress}
/>
```

---

## 📂 ファイル構造

```
src/
├── components/
│   ├── atoms/              # 共通コンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   ├── Toast.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   └── Radio.tsx
│   │
│   ├── layouts/            # レイアウトコンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Container.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── molecules/          # 機能コンポーネント
│   │   ├── ProductCard.tsx
│   │   ├── CartItem.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── OrderSummary.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Pagination.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ImageGallery.tsx
│   │   └── RatingStars.tsx
│   │
│   └── organisms/          # ページコンポーネント
│       ├── HeroSection.tsx
│       ├── FeaturedProducts.tsx
│       ├── CategoryGrid.tsx
│       ├── ProductGrid.tsx
│       └── CheckoutForm.tsx
│
├── pages/                  # ページ
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ...
│
└── ...
```

---

## 🎨 スタイリング方針

### Tailwind CSS使用

すべてのコンポーネントはTailwind CSSでスタイリングします。

### クラス名の再利用

共通のスタイルは定数化して再利用します。

```typescript
// src/styles/commonClasses.ts
export const buttonBase = "px-4 py-2 rounded-md font-medium transition-colors";
export const inputBase = "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2";
export const cardBase = "bg-white rounded-lg border";
```

### レスポンシブ対応

すべてのコンポーネントはレスポンシブ対応します。

```tsx
// 例: ProductCard
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
  {/* 商品カード */}
</div>
```

---

## ♿ アクセシビリティ

### 必須要件

1. **キーボード操作対応**
   - すべてのインタラクティブ要素はキーボードで操作可能

2. **ARIA属性**
   - 適切なaria-label、aria-describedby等を設定

3. **カラーコントラスト**
   - WCAG AA基準を満たす（4.5:1以上）

4. **フォーカス表示**
   - フォーカス時の視覚的フィードバック

5. **スクリーンリーダー対応**
   - 意味のある要素には適切なalt属性やlabel

---

## 🧪 テスト方針

### 単体テスト

各コンポーネントは以下をテストします：

```typescript
// Button.test.tsx
describe('Button', () => {
  it('renders correctly', () => {});
  it('calls onClick when clicked', () => {});
  it('shows loading state', () => {});
  it('is disabled when disabled prop is true', () => {});
  it('renders with different variants', () => {});
});
```

### スナップショットテスト

見た目の変更を検出します。

### インタラクションテスト

ユーザー操作をシミュレートします。

---

## 📝 実装の優先順位

### Phase 1: 最優先（基本コンポーネント）

```
1. Button
2. Input
3. Card
4. Loading
5. Toast
```

### Phase 2: 高優先（機能コンポーネント）

```
6. ProductCard
7. CartItem
8. SearchBar
9. Header
10. Footer
```

### Phase 3: 中優先（拡張コンポーネント）

```
11. Modal
12. Select
13. Checkbox
14. ReviewCard
15. OrderSummary
```

### Phase 4: 低優先（装飾コンポーネント）

```
16. Badge
17. Pagination
18. Breadcrumb
19. RatingStars
20. ImageGallery
```

---

## ✅ 次のステップ

### このドキュメント完成後にやること

1. **[ ] コンポーネント実装開始**
   - Phase 1の基本コンポーネントから実装
   - Storybookでコンポーネントカタログ作成（オプション）

2. **[ ] コンポーネントテスト作成**
   - Jest + React Testing Library

3. **[ ] デザインシステムドキュメント作成**
   - 使い方ガイド
   - ベストプラクティス

---

## 📚 関連ドキュメント

- **前のドキュメント**: `05_wireframes.md`（ワイヤーフレーム）
- **次のドキュメント**: `07_task-breakdown.md`（タスク分解）
- **参考ドキュメント**: 
  - `04_design-guideline.md`（デザインガイドライン）
  - `ecommerce-project-specification.md`（全体仕様書）

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 | 変更者 |
|-----------|------|----------|--------|
| 1.0 | 2025/10/02 | 初版作成 | _____ |
| _____ | _____ | _____ | _____ |

---

## 💭 メモ・調整案

**（コンポーネント設計に関する自由記入欄）**

```
追加したいコンポーネント、Props変更案、使用例の追加などをメモしてください。









```

---

**コンポーネント設計が完成したら、次はタスク分解です！** 🚀
