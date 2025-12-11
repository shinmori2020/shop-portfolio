# 【第4段階】実装計画を立てる
# 8. テスト計画

---

## 📋 ドキュメント情報

- **作成日**: 2025年10月2日
- **ドキュメント番号**: 08
- **ステータス**: 作成中
- **作成順序**: 8/12

---

## 🎯 このドキュメントの目的

このドキュメントでは、TechGear Storeの**テスト戦略と具体的なテスト項目**を定義します。

**品質を担保し、バグを早期に発見するためのテスト計画を立てます。**

---

## 🧪 テストの種類

### 1. ユニットテスト（Unit Test）
個々の関数やコンポーネントを単体でテスト

### 2. 統合テスト（Integration Test）
複数のコンポーネントやモジュールの連携をテスト

### 3. E2Eテスト（End-to-End Test）
実際のユーザー操作をシミュレートしてテスト

### 4. パフォーマンステスト
ページ読み込み速度やパフォーマンスをテスト

### 5. アクセシビリティテスト
キーボード操作やスクリーンリーダー対応をテスト

---

## 🛠️ テストツール

### ユニットテスト・統合テスト
```
Jest + React Testing Library
```

**選定理由:**
- Reactの公式推奨ツール
- DOM操作ではなくユーザー視点のテスト
- 優れたドキュメント
- 活発なコミュニティ

### E2Eテスト
```
Cypress または Playwright
```

**Cypress 推奨理由:**
- セットアップが簡単
- デバッグが容易（タイムトラベル機能）
- 視覚的なテストランナー
- 優れたドキュメント

**Playwright（代替案）:**
- 複数ブラウザ対応
- より高速
- Microsoft製で安定

### パフォーマンステスト
```
Lighthouse
```

**選定理由:**
- Google製の標準ツール
- Chrome DevToolsに統合
- CI/CDに組み込み可能

### アクセシビリティテスト
```
axe-core + Jest-axe
```

**選定理由:**
- 業界標準
- 自動で多くの問題を検出
- Jestと統合可能

---

## 📊 テストカバレッジ目標

```
ユニットテスト:     70%以上
統合テスト:         主要機能すべて
E2Eテスト:          クリティカルパス
パフォーマンス:     Lighthouse 90以上
アクセシビリティ:   WCAG 2.1 AA準拠
```

---

## 🔍 1. ユニットテスト

### 1.1 共通コンポーネント

#### Button コンポーネント

```typescript
describe('Button', () => {
  it('正しくレンダリングされる', () => {
    render(<Button>クリック</Button>);
    expect(screen.getByText('クリック')).toBeInTheDocument();
  });

  it('クリック時にonClickが呼ばれる', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    fireEvent.click(screen.getByText('クリック'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled時はクリックできない', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>クリック</Button>);
    fireEvent.click(screen.getByText('クリック'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('loading時はローディング表示になる', () => {
    render(<Button loading>クリック</Button>);
    expect(screen.getByText('処理中...')).toBeInTheDocument();
  });

  it('variantによってスタイルが変わる', () => {
    const { rerender } = render(<Button variant="primary">ボタン</Button>);
    const button = screen.getByText('ボタン');
    expect(button).toHaveClass('bg-blue-600');
    
    rerender(<Button variant="danger">ボタン</Button>);
    expect(button).toHaveClass('bg-red-600');
  });
});
```

#### Input コンポーネント

```typescript
describe('Input', () => {
  it('正しくレンダリングされる', () => {
    render(<Input placeholder="入力してください" />);
    expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
  });

  it('値が変更される', () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'テスト' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('labelが表示される', () => {
    render(<Input label="メールアドレス" />);
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();
  });

  it('エラーメッセージが表示される', () => {
    render(<Input error="入力エラー" />);
    expect(screen.getByText('入力エラー')).toBeInTheDocument();
  });

  it('disabled時は入力できない', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
```

#### Card コンポーネント

```typescript
describe('Card', () => {
  it('childrenが正しく表示される', () => {
    render(<Card>カードコンテンツ</Card>);
    expect(screen.getByText('カードコンテンツ')).toBeInTheDocument();
  });

  it('onClick時にクリックハンドラーが呼ばれる', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>クリック可能</Card>);
    fireEvent.click(screen.getByText('クリック可能'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('hoverプロップでホバースタイルが適用される', () => {
    const { container } = render(<Card hover>ホバー</Card>);
    expect(container.firstChild).toHaveClass('hover:shadow-lg');
  });
});
```

---

### 1.2 機能コンポーネント

#### ProductCard コンポーネント

```typescript
describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'テスト商品',
    price: 10000,
    image: '/test.jpg',
    category: 'テストカテゴリ',
    stock: 10,
    rating: 4.5,
    isNew: true,
  };

  it('商品情報が正しく表示される', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('テスト商品')).toBeInTheDocument();
    expect(screen.getByText('¥10,000')).toBeInTheDocument();
  });

  it('NEWバッジが表示される', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('在庫切れ時は在庫切れバッジが表示される', () => {
    const outOfStock = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStock} />);
    expect(screen.getByText('在庫切れ')).toBeInTheDocument();
  });

  it('カートに追加ボタンをクリックするとonAddToCartが呼ばれる', () => {
    const handleAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />);
    fireEvent.click(screen.getByText('カートに追加'));
    expect(handleAddToCart).toHaveBeenCalledWith('1');
  });

  it('評価が正しく表示される', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});
```

---

### 1.3 ユーティリティ関数

#### 価格フォーマット関数

```typescript
describe('formatPrice', () => {
  it('数値を正しく円表記に変換する', () => {
    expect(formatPrice(1000)).toBe('¥1,000');
    expect(formatPrice(10000)).toBe('¥10,000');
    expect(formatPrice(123456)).toBe('¥123,456');
  });

  it('0円も正しく表示される', () => {
    expect(formatPrice(0)).toBe('¥0');
  });

  it('小数点以下は切り捨てられる', () => {
    expect(formatPrice(1000.99)).toBe('¥1,000');
  });
});
```

#### バリデーション関数

```typescript
describe('validateEmail', () => {
  it('正しいメールアドレスの場合trueを返す', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user+tag@domain.co.jp')).toBe(true);
  });

  it('不正なメールアドレスの場合falseを返す', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('空文字の場合falseを返す', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('8文字以上の場合trueを返す', () => {
    expect(validatePassword('password123')).toBe(true);
  });

  it('8文字未満の場合falseを返す', () => {
    expect(validatePassword('pass')).toBe(false);
  });

  it('空文字の場合falseを返す', () => {
    expect(validatePassword('')).toBe(false);
  });
});
```

---

### 1.4 カスタムフック

#### useCart フック

```typescript
describe('useCart', () => {
  it('初期状態は空のカート', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('商品を追加できる', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: '商品A', price: 1000 });
    });
    expect(result.current.items.length).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(1000);
  });

  it('既存の商品を追加すると数量が増える', () => {
    const { result } = renderHook(() => useCart());
    const product = { id: '1', name: '商品A', price: 1000 };
    act(() => {
      result.current.addItem(product);
      result.current.addItem(product);
    });
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalPrice).toBe(2000);
  });

  it('商品を削除できる', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: '商品A', price: 1000 });
      result.current.removeItem('1');
    });
    expect(result.current.items.length).toBe(0);
  });

  it('数量を変更できる', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: '商品A', price: 1000 });
      result.current.updateQuantity('1', 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalPrice).toBe(5000);
  });

  it('カートをクリアできる', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: '商品A', price: 1000 });
      result.current.clearCart();
    });
    expect(result.current.items).toEqual([]);
  });
});
```

---

## 🔗 2. 統合テスト

### 2.1 認証フロー

```typescript
describe('認証フロー', () => {
  it('ユーザー登録からログインまで正常に動作する', async () => {
    render(<App />);
    
    // 登録ページに移動
    fireEvent.click(screen.getByText('新規登録'));
    
    // 登録フォーム入力
    fireEvent.change(screen.getByLabelText('名前'), {
      target: { value: 'テストユーザー' }
    });
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' }
    });
    
    // 登録実行
    fireEvent.click(screen.getByText('登録する'));
    
    // ホームページにリダイレクトされる
    await waitFor(() => {
      expect(screen.getByText('ようこそ、テストユーザーさん')).toBeInTheDocument();
    });
  });

  it('ログアウト後は保護ページにアクセスできない', async () => {
    render(<App />);
    
    // ログアウト
    fireEvent.click(screen.getByText('ログアウト'));
    
    // マイページにアクセス
    fireEvent.click(screen.getByText('マイページ'));
    
    // ログインページにリダイレクトされる
    await waitFor(() => {
      expect(screen.getByText('ログイン')).toBeInTheDocument();
    });
  });
});
```

---

### 2.2 商品検索とフィルター

```typescript
describe('商品検索とフィルター', () => {
  it('検索すると該当する商品が表示される', async () => {
    render(<ProductsPage />);
    
    // 検索
    const searchInput = screen.getByPlaceholderText('商品を検索...');
    fireEvent.change(searchInput, { target: { value: 'イヤホン' } });
    fireEvent.click(screen.getByRole('button', { name: '検索' }));
    
    // 結果確認
    await waitFor(() => {
      expect(screen.getByText(/イヤホン/)).toBeInTheDocument();
      expect(screen.queryByText('マウス')).not.toBeInTheDocument();
    });
  });

  it('カテゴリーフィルターが機能する', async () => {
    render(<ProductsPage />);
    
    // カテゴリー選択
    fireEvent.click(screen.getByText('ワイヤレスイヤホン'));
    
    // 結果確認
    await waitFor(() => {
      const products = screen.getAllByTestId('product-card');
      products.forEach(product => {
        expect(product).toHaveTextContent('ワイヤレスイヤホン');
      });
    });
  });

  it('価格範囲フィルターが機能する', async () => {
    render(<ProductsPage />);
    
    // 価格範囲設定
    fireEvent.change(screen.getByLabelText('最低価格'), {
      target: { value: '10000' }
    });
    fireEvent.change(screen.getByLabelText('最高価格'), {
      target: { value: '20000' }
    });
    fireEvent.click(screen.getByText('適用'));
    
    // 結果確認
    await waitFor(() => {
      const prices = screen.getAllByTestId('product-price');
      prices.forEach(price => {
        const value = parseInt(price.textContent.replace(/[^0-9]/g, ''));
        expect(value).toBeGreaterThanOrEqual(10000);
        expect(value).toBeLessThanOrEqual(20000);
      });
    });
  });
});
```

---

### 2.3 カート機能

```typescript
describe('カート機能', () => {
  it('商品詳細からカートに追加できる', async () => {
    render(<ProductDetailPage productId="1" />);
    
    // カートに追加
    fireEvent.click(screen.getByText('カートに追加'));
    
    // カートアイコンのバッジが更新される
    await waitFor(() => {
      expect(screen.getByTestId('cart-badge')).toHaveTextContent('1');
    });
    
    // カートページに移動
    fireEvent.click(screen.getByTestId('cart-icon'));
    
    // カートに商品が表示される
    await waitFor(() => {
      expect(screen.getByText('ワイヤレスイヤホン')).toBeInTheDocument();
      expect(screen.getByText('¥15,800')).toBeInTheDocument();
    });
  });

  it('カート内で数量を変更できる', async () => {
    render(<CartPage />);
    
    // 数量を変更
    const quantitySelect = screen.getByLabelText('数量');
    fireEvent.change(quantitySelect, { target: { value: '3' } });
    
    // 合計金額が更新される
    await waitFor(() => {
      expect(screen.getByText('¥47,400')).toBeInTheDocument();
    });
  });

  it('カートから商品を削除できる', async () => {
    render(<CartPage />);
    
    // 削除ボタンをクリック
    fireEvent.click(screen.getByText('削除'));
    
    // 確認ダイアログが表示される
    expect(screen.getByText('この商品を削除しますか？')).toBeInTheDocument();
    
    // 削除確定
    fireEvent.click(screen.getByText('はい'));
    
    // 商品が削除される
    await waitFor(() => {
      expect(screen.queryByText('ワイヤレスイヤホン')).not.toBeInTheDocument();
    });
  });
});
```

---

### 2.4 チェックアウトフロー

```typescript
describe('チェックアウトフロー', () => {
  it('カートからチェックアウトまで完了する', async () => {
    render(<App />);
    
    // カートページに移動
    fireEvent.click(screen.getByTestId('cart-icon'));
    
    // レジに進む
    fireEvent.click(screen.getByText('レジに進む'));
    
    // 配送先情報入力
    fireEvent.change(screen.getByLabelText('お名前'), {
      target: { value: '田中太郎' }
    });
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'tanaka@example.com' }
    });
    // ... その他のフィールド
    
    // 決済情報入力（Stripe Elements）
    // ※ Stripe Elementsのテストは別途モック化が必要
    
    // 注文確定
    fireEvent.click(screen.getByText('注文を確定する'));
    
    // 注文完了ページに移動
    await waitFor(() => {
      expect(screen.getByText('ご注文ありがとうございます！')).toBeInTheDocument();
      expect(screen.getByText(/注文番号:/)).toBeInTheDocument();
    });
  });
});
```

---

## 🤖 3. E2Eテスト（Cypress）

### 3.1 購入フロー（クリティカルパス）

```javascript
describe('商品購入フロー', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('ユーザーが商品を購入できる', () => {
    // ホームページから商品一覧へ
    cy.contains('ショッピングを始める').click();
    
    // 商品を検索
    cy.get('[data-testid="search-input"]').type('イヤホン');
    cy.get('[data-testid="search-button"]').click();
    
    // 商品詳細ページへ
    cy.contains('ワイヤレスイヤホン').click();
    
    // カートに追加
    cy.contains('カートに追加').click();
    cy.get('[data-testid="cart-badge"]').should('contain', '1');
    
    // カートページへ
    cy.get('[data-testid="cart-icon"]').click();
    cy.url().should('include', '/cart');
    
    // レジへ進む
    cy.contains('レジに進む').click();
    
    // ログインしていない場合、ログインページへリダイレクト
    cy.url().should('include', '/login');
    
    // ログイン
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('ログイン').click();
    
    // チェックアウトページへリダイレクト
    cy.url().should('include', '/checkout');
    
    // 配送先情報入力
    cy.get('input[name="name"]').type('田中太郎');
    cy.get('input[name="postalCode"]').type('1234567');
    cy.get('input[name="prefecture"]').select('東京都');
    cy.get('input[name="city"]').type('渋谷区');
    cy.get('input[name="address"]').type('道玄坂1-2-3');
    
    // Stripe決済（テストカード）
    cy.getStripeElement('cardNumber').type('4242424242424242');
    cy.getStripeElement('cardExpiry').type('1225');
    cy.getStripeElement('cardCvc').type('123');
    cy.get('input[name="cardName"]').type('TARO TANAKA');
    
    // 利用規約に同意
    cy.get('input[type="checkbox"]').check();
    
    // 注文確定
    cy.contains('注文を確定する').click();
    
    // 注文完了ページ
    cy.url().should('include', '/order-complete');
    cy.contains('ご注文ありがとうございます！').should('be.visible');
    cy.contains('注文番号:').should('be.visible');
  });
});
```

---

### 3.2 ユーザー登録フロー

```javascript
describe('ユーザー登録', () => {
  it('新規ユーザーを登録できる', () => {
    cy.visit('/register');
    
    // 登録フォーム入力
    cy.get('input[name="name"]').type('テストユーザー');
    cy.get('input[name="email"]').type(`test-${Date.now()}@example.com`);
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="passwordConfirm"]').type('password123');
    
    // 利用規約に同意
    cy.get('input[type="checkbox"]').check();
    
    // 登録実行
    cy.contains('登録する').click();
    
    // ホームページにリダイレクト
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // ログイン状態を確認
    cy.contains('テストユーザー').should('be.visible');
  });

  it('無効なデータではエラーが表示される', () => {
    cy.visit('/register');
    
    // 短いパスワード
    cy.get('input[name="password"]').type('pass');
    cy.contains('登録する').click();
    cy.contains('パスワードは8文字以上').should('be.visible');
    
    // メールアドレス不一致
    cy.get('input[name="email"]').type('invalid-email');
    cy.contains('登録する').click();
    cy.contains('有効なメールアドレスを入力').should('be.visible');
  });
});
```

---

### 3.3 管理者機能

```javascript
describe('管理者機能', () => {
  beforeEach(() => {
    // 管理者としてログイン
    cy.loginAsAdmin();
    cy.visit('/admin');
  });

  it('商品を追加できる', () => {
    // 商品管理ページへ
    cy.contains('商品管理').click();
    
    // 新規商品追加
    cy.contains('新規商品追加').click();
    
    // 商品情報入力
    cy.get('input[name="name"]').type('テスト商品');
    cy.get('textarea[name="description"]').type('テスト商品の説明');
    cy.get('select[name="category"]').select('ワイヤレスイヤホン');
    cy.get('input[name="price"]').type('15000');
    cy.get('input[name="stock"]').type('50');
    
    // 画像アップロード
    cy.get('input[type="file"]').selectFile('cypress/fixtures/product-image.jpg');
    
    // 保存
    cy.contains('保存して公開').click();
    
    // 成功メッセージ
    cy.contains('商品を追加しました').should('be.visible');
    
    // 商品一覧に表示される
    cy.contains('テスト商品').should('be.visible');
  });

  it('注文ステータスを変更できる', () => {
    // 注文管理ページへ
    cy.contains('注文管理').click();
    
    // 注文詳細へ
    cy.get('[data-testid="order-item"]').first().click();
    
    // ステータス変更
    cy.get('select[name="status"]').select('発送済み');
    cy.contains('更新').click();
    
    // 成功メッセージ
    cy.contains('ステータスを更新しました').should('be.visible');
  });
});
```

---

## 📊 4. パフォーマンステスト

### 4.1 Lighthouse監査

```javascript
// lighthouse-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
  };

  const runnerResult = await lighthouse('http://localhost:5173', options);

  const report = runnerResult.report;
  const scores = runnerResult.lhr.categories;

  console.log('Performance:', scores.performance.score * 100);
  console.log('Accessibility:', scores.accessibility.score * 100);
  console.log('Best Practices:', scores['best-practices'].score * 100);
  console.log('SEO:', scores.seo.score * 100);

  await chrome.kill();
}

runLighthouse();
```

### 目標スコア

```
Performance:     90以上
Accessibility:   90以上
Best Practices:  90以上
SEO:             90以上
```

---

### 4.2 Core Web Vitals

```javascript
describe('Core Web Vitals', () => {
  it('LCP（Largest Contentful Paint）が2.5秒以内', () => {
    cy.visit('/');
    cy.window().then((win) => {
      const lcp = win.performance.getEntriesByType('largest-contentful-paint')[0];
      expect(lcp.renderTime).to.be.lessThan(2500);
    });
  });

  it('FID（First Input Delay）が100ms以内', () => {
    // First Input Delay測定
  });

  it('CLS（Cumulative Layout Shift）が0.1以下', () => {
    // Cumulative Layout Shift測定
  });
});
```

---

## ♿ 5. アクセシビリティテスト

### 5.1 自動テスト（jest-axe）

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('アクセシビリティ', () => {
  it('ホームページにアクセシビリティ違反がない', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('商品一覧ページにアクセシビリティ違反がない', async () => {
    const { container } = render(<ProductsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('カートページにアクセシビリティ違反がない', async () => {
    const { container } = render(<CartPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

### 5.2 手動テスト項目

#### キーボード操作

- [ ] すべてのインタラクティブ要素にTabでフォーカス可能
- [ ] フォーカス順序が論理的
- [ ] Enterキーで操作可能
- [ ] Escキーでモーダルを閉じられる
- [ ] 矢印キーで選択肢を移動できる

#### スクリーンリーダー

- [ ] すべての画像にalt属性がある
- [ ] フォームにlabelが関連付けられている
- [ ] ボタンに適切なテキストがある
- [ ] エラーメッセージが読み上げられる
- [ ] ページタイトルが適切

#### カラーコントラスト

- [ ] テキストと背景のコントラスト比が4.5:1以上
- [ ] 大きなテキストは3:1以上
- [ ] リンクが色以外でも識別可能

---

## 📋 テスト実行計画

### 開発中（継続的）

```bash
# ユニットテスト（watchモード）
npm run test:watch

# E2Eテスト
npm run test:e2e

# アクセシビリティテスト
npm run test:a11y
```

### Pull Request前

```bash
# すべてのテストを実行
npm run test:all

# カバレッジ確認
npm run test:coverage

# Lint
npm run lint

# 型チェック
npm run type-check
```

### CI/CD（GitHub Actions）

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e:ci
      - run: npm run build
```

### リリース前

```bash
# すべてのテスト
npm run test:all

# Lighthouse監査
npm run lighthouse

# パフォーマンステスト
npm run test:perf

# セキュリティ監査
npm audit

# 本番ビルド確認
npm run build
npm run preview
```

---

## 📊 テストカバレッジレポート

### 目標カバレッジ

```
Statements:   70%以上
Branches:     70%以上
Functions:    70%以上
Lines:        70%以上
```

### レポート確認

```bash
npm run test:coverage
# → coverage/lcov-report/index.html を開く
```

---

## 🐛 バグ報告テンプレート

```markdown
## バグ概要
簡潔にバグを説明

## 再現手順
1. ページAにアクセス
2. ボタンBをクリック
3. 入力欄Cに「XXX」を入力
4. ...

## 期待される動作
正常に動作する場合の挙動

## 実際の動作
実際に起こった動作

## スクリーンショット
（あれば）

## 環境
- OS: macOS 14.0
- ブラウザ: Chrome 119
- デバイス: Desktop

## 追加情報
その他の補足情報
```

---

## ✅ テストチェックリスト

### Phase 1完了時

- [ ] Button, Input, Card のユニットテスト
- [ ] 商品一覧ページの統合テスト
- [ ] カート機能の統合テスト

### Phase 2完了時

- [ ] 認証フローの統合テスト
- [ ] 決済フローの統合テスト
- [ ] E2E購入フローテスト

### Phase 3完了時

- [ ] マイページの統合テスト
- [ ] レビュー機能のテスト

### Phase 4完了時

- [ ] 管理者機能のE2Eテスト
- [ ] 商品管理のテスト

### Phase 5完了時

- [ ] Lighthouse監査（全ページ）
- [ ] アクセシビリティ監査
- [ ] パフォーマンステスト
- [ ] 最終E2Eテスト

---

## 📚 関連ドキュメント

- **前のドキュメント**: `07_task-breakdown.md`（タスク分解）
- **次のドキュメント**: `09_deployment-guide.md`（デプロイ手順書）
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

**（テスト計画に関する自由記入欄）**

```
追加テストケース、テストツールの変更、テスト戦略の調整などをメモしてください。









```

---

**テスト計画が完成しました！これで実装に必要な主要ドキュメントが揃いました！** 🎉
