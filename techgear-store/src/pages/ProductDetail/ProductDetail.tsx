import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import { useCartStore } from '../../store/useCartStore';
import { sampleProducts } from '../../data/products';
import './ProductDetail.css';

export const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = sampleProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="product-detail">
        <div className="product-detail__not-found">
          <h2>商品が見つかりません</h2>
          <Button variant="primary" onClick={() => navigate('/products')}>
            商品一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  const displayPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
  const hasDiscount = product.onSale && product.salePrice;

  const handleAddToCart = () => {
    addItem(product, quantity);
    // カート追加完了の通知（後でToast実装予定）
    alert(`${product.name} をカートに追加しました`);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="product-detail">
      <div className="product-detail__container">
        {/* パンくずリスト */}
        <nav className="product-detail__breadcrumb">
          <button onClick={() => navigate('/')} className="product-detail__breadcrumb-link">
            ホーム
          </button>
          <span className="product-detail__breadcrumb-separator">/</span>
          <button onClick={() => navigate('/products')} className="product-detail__breadcrumb-link">
            商品一覧
          </button>
          <span className="product-detail__breadcrumb-separator">/</span>
          <span className="product-detail__breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail__content">
          {/* 画像エリア */}
          <div className="product-detail__images">
            <div className="product-detail__main-image">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="product-detail__image"
              />
              {product.onSale && (
                <span className="product-detail__sale-badge">SALE</span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="product-detail__thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`product-detail__thumbnail ${selectedImage === index ? 'product-detail__thumbnail--active' : ''}`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 商品情報エリア */}
          <div className="product-detail__info">
            <div className="product-detail__header">
              {product.isNew && (
                <span className="product-detail__new-badge">NEW</span>
              )}
              <p className="product-detail__category">{product.category}</p>
              <h1 className="product-detail__title">{product.name}</h1>
              {product.brand && (
                <p className="product-detail__brand">ブランド: {product.brand}</p>
              )}
            </div>

            {/* レビュー */}
            <div className="product-detail__rating">
              <div className="product-detail__stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`product-detail__star ${i < Math.floor(product.rating) ? 'product-detail__star--filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="product-detail__rating-text">
                {product.rating} ({product.reviewCount}件のレビュー)
              </span>
            </div>

            {/* 価格 */}
            <div className="product-detail__price-section">
              {hasDiscount && (
                <div className="product-detail__original-price">
                  ¥{product.price.toLocaleString()}
                </div>
              )}
              <div className="product-detail__current-price">
                ¥{displayPrice.toLocaleString()}
                {hasDiscount && (
                  <span className="product-detail__discount">
                    {Math.round(((product.price - product.salePrice!) / product.price) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* 商品説明 */}
            <div className="product-detail__description">
              <p>{product.description}</p>
            </div>

            {/* 仕様 */}
            {product.specifications && (
              <div className="product-detail__specifications">
                <h3 className="product-detail__specifications-title">仕様</h3>
                <dl className="product-detail__specifications-list">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <dt className="product-detail__spec-key">{key}</dt>
                      <dd className="product-detail__spec-value">{value}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            )}

            {/* 在庫状況 */}
            <div className="product-detail__stock">
              {product.stock > 0 ? (
                <span className="product-detail__stock-available">
                  在庫あり ({product.stock}個)
                </span>
              ) : (
                <span className="product-detail__stock-out">在庫切れ</span>
              )}
            </div>

            {/* 数量選択とカート追加 */}
            {product.stock > 0 && (
              <div className="product-detail__actions">
                <div className="product-detail__quantity">
                  <label className="product-detail__quantity-label">数量:</label>
                  <div className="product-detail__quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="product-detail__quantity-btn"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="product-detail__quantity-input"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="product-detail__quantity-btn"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={handleAddToCart}
                >
                  カートに追加
                </Button>
              </div>
            )}

            {/* 商品メタ情報 */}
            <div className="product-detail__meta">
              <p className="product-detail__meta-item">
                <strong>SKU:</strong> {product.sku}
              </p>
              <p className="product-detail__meta-item">
                <strong>販売数:</strong> {product.sold}個
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
