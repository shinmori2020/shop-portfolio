import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductCard } from '../../components/molecules/ProductCard';
import { SearchBar } from '../../components/molecules/SearchBar';
import { PriceFilter } from '../../components/molecules/PriceFilter';
import { Product } from '../../types';
import './ProductList.css';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // フィルター状態
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || 'all');
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get('minPrice')) || 0,
    max: Number(searchParams.get('maxPrice')) || 50000
  });
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating' | 'newest'>(
    (searchParams.get('sort') as any) || 'default'
  );

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
            brand: data.brand || '',
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

  // URLパラメータの更新
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedBrand !== 'all') params.set('brand', selectedBrand);
    if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
    if (priceRange.max < 999999) params.set('maxPrice', priceRange.max.toString());
    if (sortBy !== 'default') params.set('sort', sortBy);

    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy, setSearchParams]);

  // カテゴリー一覧を取得
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...uniqueCategories];
  }, [products]);

  // ブランド一覧を取得
  const brands = useMemo(() => {
    const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return ['all', ...uniqueBrands];
  }, [products]);

  // 価格範囲を取得
  const priceRangeData = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 50000 };
    const prices = products.map(p => p.salePrice || p.price);
    return {
      min: 0,
      max: 50000
    };
  }, [products]);

  // フィルタリングとソート
  const filteredAndSortedProducts = useMemo(() => {
    let filteredProducts = [...products];

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query))
      );
    }

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }

    // ブランドフィルター
    if (selectedBrand !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.brand === selectedBrand);
    }

    // 価格フィルター
    filteredProducts = filteredProducts.filter(p => {
      const price = p.salePrice || p.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

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
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // フィルターのリセット
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange({ min: 0, max: 999999 });
    setSortBy('default');
  };

  // アクティブなフィルターの数を計算
  const activeFilterCount = [
    searchQuery !== '',
    selectedCategory !== 'all',
    selectedBrand !== 'all',
    priceRange.min > 0 || priceRange.max < 999999
  ].filter(Boolean).length;

  return (
    <div className="product-list">
      <div className="product-list__header">
        <h1 className="product-list__title">商品一覧</h1>
      </div>

      {/* 検索バー */}
      <div className="product-list__search-section">
        <SearchBar
          value={searchQuery}
          onSearch={setSearchQuery}
          placeholder="商品名、カテゴリー、ブランドで検索..."
        />
      </div>

      <div className="product-list__content-wrapper">
        {/* サイドバーフィルター */}
        <aside className="product-list__sidebar">
          <div className="product-list__sidebar-header">
            <h2>フィルター</h2>
            {activeFilterCount > 0 && (
              <button
                className="product-list__reset-button"
                onClick={handleResetFilters}
              >
                リセット ({activeFilterCount})
              </button>
            )}
          </div>

          {/* 価格フィルター */}
          <div className="product-list__filter-section">
            <PriceFilter
              min={priceRangeData.min}
              max={priceRangeData.max}
              currentMin={priceRange.min}
              currentMax={priceRange.max}
              onPriceChange={(min, max) => setPriceRange({ min, max })}
            />
          </div>

          {/* カテゴリーフィルター */}
          <div className="product-list__filter-section">
            <h3 className="product-list__filter-title">カテゴリー</h3>
            <div className="product-list__filter-options">
              {categories.map(category => (
                <label key={category} className="product-list__filter-option">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                  <span>{category === 'all' ? 'すべて' : category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ブランドフィルター */}
          {brands.length > 1 && (
            <div className="product-list__filter-section">
              <h3 className="product-list__filter-title">ブランド</h3>
              <div className="product-list__filter-options">
                {brands.map(brand => (
                  <label key={brand} className="product-list__filter-option">
                    <input
                      type="radio"
                      name="brand"
                      value={brand}
                      checked={selectedBrand === brand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                    />
                    <span>{brand === 'all' ? 'すべて' : brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* メインコンテンツ */}
        <div className="product-list__main">
          <div className="product-list__controls">
            <p className="product-list__count">
              {filteredAndSortedProducts.length}件の商品
              {searchQuery && ` "「${searchQuery}」の検索結果`}
            </p>

            {/* ソート */}
            <div className="product-list__sort">
              <label htmlFor="sort-select" className="product-list__sort-label">
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
              {activeFilterCount > 0 && (
                <button
                  className="product-list__reset-filters"
                  onClick={handleResetFilters}
                >
                  フィルターをリセット
                </button>
              )}
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
      </div>
    </div>
  );
};
