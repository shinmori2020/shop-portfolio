import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/molecules/ProductCard';
import { Button } from '../../components/atoms/Button';
import { sampleProducts } from '../../data/products';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Featured商品のみ表示
  const featuredProducts = sampleProducts.filter(p => p.featured).slice(0, 3);

  // 新着商品
  const newProducts = sampleProducts.filter(p => p.isNew).slice(0, 3);

  // セール商品
  const saleProducts = sampleProducts.filter(p => p.onSale).slice(0, 3);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  return (
    <div className="home">
      {/* ヒーローセクション */}
      <section className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__hero-title">TechGear Store</h1>
          <p className="home__hero-subtitle">
            最新のテクノロジーアクセサリーを<br />
            お手頃価格でお届けします
          </p>
          <Button variant="primary" size="large" onClick={handleViewAllProducts}>
            商品を見る
          </Button>
        </div>
      </section>

      {/* おすすめ商品 */}
      {featuredProducts.length > 0 && (
        <section className="home__section">
          <div className="home__section-header">
            <h2 className="home__section-title">おすすめ商品</h2>
            <a href="/products" className="home__section-link">
              すべて見る →
            </a>
          </div>
          <div className="home__products-grid">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* 新着商品 */}
      {newProducts.length > 0 && (
        <section className="home__section">
          <div className="home__section-header">
            <h2 className="home__section-title">新着商品</h2>
            <a href="/products" className="home__section-link">
              すべて見る →
            </a>
          </div>
          <div className="home__products-grid">
            {newProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* セール商品 */}
      {saleProducts.length > 0 && (
        <section className="home__section">
          <div className="home__section-header">
            <h2 className="home__section-title">セール中</h2>
            <Button variant="ghost" onClick={handleViewAllProducts}>
              すべて見る →
            </Button>
          </div>
          <div className="home__products-grid">
            {saleProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* 特徴セクション */}
      <section className="home__features">
        <div className="home__features-container">
          <div className="home__features-grid">
            <div className="home__feature-card">
              <div className="home__feature-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h3 className="home__feature-title">送料無料</h3>
              <p className="home__feature-description">5,000円以上のご購入で送料無料</p>
            </div>
            <div className="home__feature-card">
              <div className="home__feature-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h3 className="home__feature-title">安心のセキュリティ</h3>
              <p className="home__feature-description">SSL暗号化で安全なお買い物</p>
            </div>
            <div className="home__feature-card">
              <div className="home__feature-icon">
                <i className="fas fa-credit-card"></i>
              </div>
              <h3 className="home__feature-title">簡単決済</h3>
              <p className="home__feature-description">クレジットカード、各種決済に対応</p>
            </div>
            <div className="home__feature-card">
              <div className="home__feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3 className="home__feature-title">サポート対応</h3>
              <p className="home__feature-description">平日10:00-18:00 お問い合わせ受付</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
