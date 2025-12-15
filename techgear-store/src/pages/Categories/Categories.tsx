import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

const categories: Category[] = [
  {
    id: 'wireless-earphones',
    name: 'ワイヤレスイヤホン',
    description: '高音質で快適な装着感のワイヤレスイヤホン',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    productCount: 15,
  },
  {
    id: 'smartwatch',
    name: 'スマートウォッチ',
    description: '健康管理と通知機能を備えたスマートウォッチ',
    image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600',
    productCount: 12,
  },
  {
    id: 'bluetooth-speaker',
    name: 'Bluetoothスピーカー',
    description: 'ポータブルで高音質なBluetoothスピーカー',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
    productCount: 8,
  },
  {
    id: 'mobile-battery',
    name: 'モバイルバッテリー',
    description: '大容量で急速充電対応のモバイルバッテリー',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600',
    productCount: 10,
  },
  {
    id: 'cables-accessories',
    name: 'ケーブル・アクセサリー',
    description: '充電ケーブルやスマホアクセサリー',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600',
    productCount: 20,
  },
  {
    id: 'headphones',
    name: 'ヘッドホン',
    description: '高音質で長時間使用でも快適なヘッドホン',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    productCount: 10,
  },
  {
    id: 'keyboard',
    name: 'キーボード',
    description: '快適なタイピングを実現するキーボード',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    productCount: 8,
  },
  {
    id: 'mouse',
    name: 'マウス',
    description: '精密な操作が可能なワイヤレスマウス',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
    productCount: 12,
  },
  {
    id: 'webcam',
    name: 'Webカメラ',
    description: 'テレワークに最適な高画質Webカメラ',
    image: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=600',
    productCount: 6,
  },
  {
    id: 'tablet',
    name: 'タブレット',
    description: '持ち運びに便利な高性能タブレット',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600',
    productCount: 7,
  },
  {
    id: 'laptop',
    name: 'ノートパソコン',
    description: '軽量で高性能なノートパソコン',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    productCount: 5,
  },
];

export const Categories: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    // カテゴリ名でフィルタリングした商品一覧ページに遷移
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="categories">
      <div className="categories__header">
        <h1 className="categories__title">カテゴリー</h1>
        <p className="categories__subtitle">お探しの商品カテゴリーを選択してください</p>
      </div>

      <div className="categories__grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className="category-card__image-wrapper">
              <img
                src={category.image}
                alt={category.name}
                className="category-card__image"
              />
              <div className="category-card__overlay">
                <span className="category-card__view-button">商品を見る</span>
              </div>
            </div>
            <div className="category-card__content">
              <h2 className="category-card__title">{category.name}</h2>
              <p className="category-card__description">{category.description}</p>
              <p className="category-card__count">{category.productCount}商品</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
