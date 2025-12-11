import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductCard } from '../../components/molecules/ProductCard';
import { Button } from '../../components/atoms/Button';
import { Product } from '../../types';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        // Featured商品を取得
        const featuredQuery = query(
          collection(db, 'products'),
          where('featured', '==', true),
          limit(3)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        const featuredData: Product[] = [];
        featuredSnapshot.forEach((doc) => {
          const data = doc.data();
          featuredData.push({
            id: doc.id,
            ...data
          } as Product);
        });
        setFeaturedProducts(featuredData);

        // 新着商品を取得（作成日順）
        const newQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const newSnapshot = await getDocs(newQuery);
        const newData: Product[] = [];
        newSnapshot.forEach((doc) => {
          const data = doc.data();
          newData.push({
            id: doc.id,
            ...data
          } as Product);
        });
        setNewProducts(newData);

        // セール商品を取得
        const saleQuery = query(
          collection(db, 'products'),
          where('onSale', '==', true),
          limit(3)
        );
        const saleSnapshot = await getDocs(saleQuery);
        const saleData: Product[] = [];
        saleSnapshot.forEach((doc) => {
          const data = doc.data();
          saleData.push({
            id: doc.id,
            ...data
          } as Product);
        });
        setSaleProducts(saleData);

      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="home">
        <div className="home__loading">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

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
