import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import { useCartStore } from '../../store/useCartStore';
import './Cart.css';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice >= 5000 ? 0 : 500;
  const finalTotal = totalPrice + shippingFee;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      if (confirm('この商品をカートから削除しますか？')) {
        removeItem(productId);
      }
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    if (confirm(`${productName}をカートから削除しますか？`)) {
      removeItem(productId);
    }
  };

  const handleClearCart = () => {
    if (confirm('カート内の商品をすべて削除しますか？')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="cart">
        <div className="cart__empty">
          <h2 className="cart__empty-title">カートは空です</h2>
          <p className="cart__empty-text">商品を追加してください</p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            商品を探す
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart__container">
        <div className="cart__header">
          <h1 className="cart__title">ショッピングカート</h1>
          <Button variant="ghost" onClick={handleClearCart}>
            すべて削除
          </Button>
        </div>

        <div className="cart__content">
          {/* カート商品リスト */}
          <div className="cart__items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item__image-wrapper">
                  <img
                    src={item.product.mainImage}
                    alt={item.product.name}
                    className="cart-item__image"
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  />
                </div>

                <div className="cart-item__info">
                  <h3
                    className="cart-item__name"
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="cart-item__category">{item.product.category}</p>
                  {item.product.brand && (
                    <p className="cart-item__brand">ブランド: {item.product.brand}</p>
                  )}
                </div>

                <div className="cart-item__quantity">
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                    className="cart-item__quantity-btn"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                    className="cart-item__quantity-input"
                    min="1"
                    max={item.product.stock}
                  />
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                    className="cart-item__quantity-btn"
                    disabled={item.quantity >= item.product.stock}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item__price">
                  <div className="cart-item__unit-price">
                    ¥{(item.product.salePrice || item.product.price).toLocaleString()}
                  </div>
                  <div className="cart-item__total-price">
                    ¥{item.totalPrice.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                  className="cart-item__remove"
                  aria-label="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* 注文サマリー */}
          <div className="cart__summary">
            <h2 className="cart__summary-title">注文サマリー</h2>

            <div className="cart__summary-content">
              <div className="cart__summary-row">
                <span>小計 ({items.length}点)</span>
                <span>¥{totalPrice.toLocaleString()}</span>
              </div>

              <div className="cart__summary-row">
                <span>送料</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="cart__free-shipping">無料</span>
                  ) : (
                    `¥${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>

              {totalPrice < 5000 && (
                <p className="cart__shipping-info">
                  ¥{(5000 - totalPrice).toLocaleString()}以上のご購入で送料無料
                </p>
              )}

              <div className="cart__summary-divider"></div>

              <div className="cart__summary-row cart__summary-total">
                <span>合計</span>
                <span className="cart__summary-total-price">
                  ¥{finalTotal.toLocaleString()}
                </span>
              </div>

              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleCheckout}
              >
                レジに進む
              </Button>

              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/products')}
              >
                買い物を続ける
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
