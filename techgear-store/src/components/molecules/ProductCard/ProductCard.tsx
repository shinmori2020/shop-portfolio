import React from 'react';
import { Product } from '../../../types';
import { Button } from '../../atoms/Button';
import { useCartStore } from '../../../store/useCartStore';
import { checkProductStock } from '../../../utils/priceValidation';
import './ProductCard.css';

export interface ProductCardProps {
  product: Product;
  onProductClick?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 在庫チェック
    const stockCheck = await checkProductStock(product.id, 1);

    if (!stockCheck.hasStock) {
      alert(stockCheck.message || '在庫が不足しています');
      return;
    }

    addItem(product);
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  const displayPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
  const hasDiscount = product.onSale && product.salePrice;

  return (
    <div className="product-card" onClick={handleCardClick}>
        <div className="product-card__image-wrapper">
          <img
            src={product.imageUrl || product.images?.[0] || '/placeholder-product.svg'}
            alt={product.name}
            className="product-card__image"
          />
          <div className="product-card__badges">
            {product.isNew && (
              <span className="product-card__badge product-card__badge--new">NEW</span>
            )}
            {product.onSale && (
              <span className="product-card__badge product-card__badge--sale">SALE</span>
            )}
            {product.stock === 0 && (
              <span className="product-card__badge product-card__badge--out-of-stock">在庫切れ</span>
            )}
          </div>
        </div>

        <div className="product-card__content">
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__category">{product.category}</p>

          <div className="product-card__rating">
            <div className="product-card__stars">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`product-card__star ${i < Math.floor(product.rating) ? 'product-card__star--filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="product-card__review-count">({product.reviewCount})</span>
          </div>

          <div className="product-card__price-wrapper">
            <div className="product-card__price">
              {hasDiscount && (
                <span className="product-card__original-price">¥{product.price.toLocaleString()}</span>
              )}
              <span className="product-card__current-price">¥{displayPrice.toLocaleString()}</span>
            </div>
            {hasDiscount && (
              <span className="product-card__discount">
                {Math.round(((product.price - product.salePrice!) / product.price) * 100)}% OFF
              </span>
            )}
          </div>

          {/* 在庫表示 */}
          {product.stock !== undefined && product.stock !== null && (
            <div className="product-card__stock-info">
              {product.stock === 0 ? (
                <span className="product-card__stock-out">在庫切れ</span>
              ) : product.stock <= 5 ? (
                <span className="product-card__stock-low">残りわずか（{product.stock}個）</span>
              ) : (
                <span className="product-card__stock-available">在庫あり</span>
              )}
            </div>
          )}

          <Button
            variant="primary"
            fullWidth
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? '在庫切れ' : 'カートに追加'}
          </Button>
        </div>
    </div>
  );
};
