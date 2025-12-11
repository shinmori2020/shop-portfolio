import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/molecules/ProductCard';
import { sampleProducts } from '../../data/products';
import './ProductList.css';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating' | 'newest'>('default');

  // カテゴリー一覧を取得
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(sampleProducts.map(p => p.category)));
    return ['all', ...uniqueCategories];
  }, []);

  // フィルタリングとソート
  const filteredAndSortedProducts = useMemo(() => {
    let products = [...sampleProducts];

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      products = products.filter(p => p.category === selectedCategory);
    }

    // ソート
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => {
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        products.sort((a, b) => {
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        break;
      default:
        // featured商品を最初に表示
        products.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    return products;
  }, [selectedCategory, sortBy]);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="product-list">
      <div className="product-list__header">
        <h1 className="product-list__title">商品一覧</h1>
        <p className="product-list__count">{filteredAndSortedProducts.length}件の商品</p>
      </div>

      <div className="product-list__controls">
        {/* カテゴリーフィルター */}
        <div className="product-list__filter">
          <label htmlFor="category-filter" className="product-list__filter-label">
            カテゴリー:
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="product-list__select"
          >
            <option value="all">すべて</option>
            {categories.filter(c => c !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* ソート */}
        <div className="product-list__filter">
          <label htmlFor="sort-select" className="product-list__filter-label">
            並び替え:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="product-list__select"
          >
            <option value="default">おすすめ順</option>
            <option value="newest">新着順</option>
            <option value="price-low">価格が安い順</option>
            <option value="price-high">価格が高い順</option>
            <option value="rating">評価が高い順</option>
          </select>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="product-list__empty">
          <p>該当する商品が見つかりませんでした。</p>
        </div>
      ) : (
        <div className="product-list__grid">
          {filteredAndSortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={handleProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
