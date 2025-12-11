import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductCard } from '../../components/molecules/ProductCard';
import { Product } from '../../types';
import './ProductList.css';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating' | 'newest'>('default');

  // Firestoreから商品データを取得
  useEffect(() => {
    const fetchProducts = async () => {
      if (!db) {
        console.error('Firestore is not initialized');
        setLoading(false);
        return;
      }

      try {
        const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(productsQuery);
        const fetchedProducts: Product[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProducts.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            salePrice: data.salePrice,
            category: data.category,
            imageUrl: data.imageUrl || '/placeholder-product.svg',
            stock: data.stock,
            featured: data.featured || false,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          } as Product);
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // カテゴリー一覧を取得
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...uniqueCategories];
  }, [products]);

  // フィルタリングとソート
  const filteredAndSortedProducts = useMemo(() => {
    let filteredProducts = [...products];

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }

    // ソート
    switch (sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => {
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => {
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Firestoreのタイムスタンプを扱う
        filteredProducts.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        break;
      default:
        // featured商品を最初に表示
        filteredProducts.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    return filteredProducts;
  }, [products, selectedCategory, sortBy]);

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

      {loading ? (
        <div className="product-list__loading">
          <p>商品を読み込み中...</p>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
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
