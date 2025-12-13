import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductCard } from '../../components/molecules/ProductCard';
import { SearchBar } from '../../components/molecules/SearchBar';
import { PriceFilter } from '../../components/molecules/PriceFilter';
import { DiscountFilter } from '../../components/molecules/DiscountFilter';
import { BrandFilter } from '../../components/molecules/BrandFilter';
import { StockFilter } from '../../components/molecules/StockFilter';
import { RatingFilter } from '../../components/molecules/RatingFilter';
import { TrendingFilter } from '../../components/molecules/TrendingFilter';
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
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',').filter(Boolean) || []
  );
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>(
    searchParams.get('discounts')?.split(',').filter(Boolean) || []
  );
  const [selectedStockFilter, setSelectedStockFilter] = useState<string[]>(
    searchParams.get('stock')?.split(',').filter(Boolean) || []
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(
    searchParams.get('rating') ? Number(searchParams.get('rating')) : null
  );
  const [minReviewCount, setMinReviewCount] = useState<number>(
    searchParams.get('minReviews') ? Number(searchParams.get('minReviews')) : 0
  );
  const [selectedTrending, setSelectedTrending] = useState<string>(
    searchParams.get('trending') || 'none'
  );
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
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    if (selectedDiscounts.length > 0) params.set('discounts', selectedDiscounts.join(','));
    if (selectedStockFilter.length > 0) params.set('stock', selectedStockFilter.join(','));
    if (selectedRating !== null) params.set('rating', selectedRating.toString());
    if (minReviewCount > 0) params.set('minReviews', minReviewCount.toString());
    if (selectedTrending !== 'none') params.set('trending', selectedTrending);
    if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
    if (priceRange.max < 50000) params.set('maxPrice', priceRange.max.toString());
    if (sortBy !== 'default') params.set('sort', sortBy);

    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedBrands, selectedDiscounts, selectedStockFilter, selectedRating, minReviewCount, selectedTrending, priceRange, sortBy, setSearchParams]);

  // カテゴリー一覧を取得
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...uniqueCategories];
  }, [products]);

  // ブランド一覧を取得
  const brands = useMemo(() => {
    const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return uniqueBrands;
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
    if (selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter(p =>
        p.brand && selectedBrands.includes(p.brand)
      );
    }

    // 割引フィルター
    if (selectedDiscounts.length > 0) {
      filteredProducts = filteredProducts.filter(p => {
        if (selectedDiscounts.includes('all-discounts')) {
          return p.onSale || (p.salePrice && p.salePrice < p.price);
        }
        if (selectedDiscounts.includes('timesale')) {
          // タイムセール商品（今回は onSale フラグで判定）
          return p.onSale;
        }

        // 割引率計算
        if (p.salePrice && p.salePrice < p.price) {
          const discountRate = ((p.price - p.salePrice) / p.price) * 100;

          if (selectedDiscounts.includes('discount-10') && discountRate >= 10) return true;
          if (selectedDiscounts.includes('discount-20') && discountRate >= 20) return true;
          if (selectedDiscounts.includes('discount-30') && discountRate >= 30) return true;
        }

        return false;
      });
    }

    // 在庫フィルター
    if (selectedStockFilter.length > 0) {
      filteredProducts = filteredProducts.filter(p => {
        const stockOption = selectedStockFilter[0]; // ラジオボタンなので単一選択

        switch (stockOption) {
          case 'in-stock':
            return p.stock > 0;
          case 'ready-to-ship':
            return p.stock >= 5;
          case 'low-stock':
            return p.stock > 0 && p.stock <= 3;
          case 'include-out-of-stock':
            return true; // すべて表示
          default:
            return p.stock > 0; // デフォルトは在庫ありのみ
        }
      });
    } else {
      // デフォルトは在庫ありのみ表示
      filteredProducts = filteredProducts.filter(p => p.stock > 0);
    }

    // 評価フィルター
    if (selectedRating !== null) {
      filteredProducts = filteredProducts.filter(p => p.rating >= selectedRating);
    }

    // レビュー数フィルター
    if (minReviewCount > 0) {
      filteredProducts = filteredProducts.filter(p => p.reviewCount >= minReviewCount);
    }

    // 新着・人気フィルター
    if (selectedTrending !== 'none') {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (selectedTrending) {
        case 'new-7days':
          filteredProducts = filteredProducts.filter(p => {
            if (!p.createdAt) return false;
            const productDate = new Date(p.createdAt.seconds * 1000);
            return productDate >= sevenDaysAgo;
          });
          break;
        case 'new-30days':
          filteredProducts = filteredProducts.filter(p => {
            if (!p.createdAt) return false;
            const productDate = new Date(p.createdAt.seconds * 1000);
            return productDate >= thirtyDaysAgo;
          });
          break;
        case 'bestseller':
          // 売上数またはレビュー数でトップ10を取得
          filteredProducts = [...filteredProducts]
            .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
            .slice(0, 10);
          break;
        case 'trending':
          // 急上昇中（最近のレビューが多い商品）
          filteredProducts = filteredProducts.filter(p => p.reviewCount >= 10 && p.rating >= 4);
          break;
        case 'restocked':
          // 再入荷商品（在庫が少なかったが今は在庫がある）
          filteredProducts = filteredProducts.filter(p => p.stock > 5 && p.stock <= 20);
          break;
        case 'limited':
          // 限定商品（在庫が少ない）
          filteredProducts = filteredProducts.filter(p => p.stock > 0 && p.stock <= 5);
          break;
      }
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
  }, [products, searchQuery, selectedCategory, selectedBrands, selectedDiscounts, selectedStockFilter, selectedRating, minReviewCount, selectedTrending, priceRange, sortBy]);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // フィルターのリセット
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSelectedDiscounts([]);
    setSelectedStockFilter([]);
    setSelectedRating(null);
    setMinReviewCount(0);
    setSelectedTrending('none');
    setPriceRange({ min: 0, max: 50000 });
    setSortBy('default');
  };

  // アクティブなフィルターの数を計算
  const activeFilterCount = [
    searchQuery !== '',
    selectedCategory !== 'all',
    selectedBrands.length > 0,
    selectedDiscounts.length > 0,
    selectedStockFilter.length > 0,
    selectedRating !== null,
    minReviewCount > 0,
    selectedTrending !== 'none',
    priceRange.min > 0 || priceRange.max < 50000
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
            <button
              className="product-list__reset-button"
              onClick={handleResetFilters}
              disabled={activeFilterCount === 0}
            >
              すべてリセット {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
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

          {/* 価格フィルター */}
          <PriceFilter
            min={priceRangeData.min}
            max={priceRangeData.max}
            currentMin={priceRange.min}
            currentMax={priceRange.max}
            onPriceChange={(min, max) => setPriceRange({ min, max })}
          />

          {/* 割引フィルター */}
          <DiscountFilter
            selectedOptions={selectedDiscounts}
            onFilterChange={setSelectedDiscounts}
          />

          {/* 新着・人気フィルター */}
          <TrendingFilter
            selectedOption={selectedTrending}
            onFilterChange={setSelectedTrending}
          />

          {/* ブランドフィルター */}
          {brands.length > 0 && (
            <BrandFilter
              brands={brands}
              selectedBrands={selectedBrands}
              onBrandChange={setSelectedBrands}
            />
          )}

          {/* レビューフィルター */}
          <RatingFilter
            selectedRating={selectedRating}
            minReviews={minReviewCount}
            onRatingChange={setSelectedRating}
            onMinReviewsChange={setMinReviewCount}
          />

          {/* 在庫フィルター */}
          <StockFilter
            selectedOptions={selectedStockFilter}
            onFilterChange={setSelectedStockFilter}
          />

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
