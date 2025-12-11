import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../store/useCartStore';
import './Checkout.css';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    // 配送先情報
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    // 支払い情報（実際はStripe Elementsを使用）
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const totalPrice = getTotalPrice();
  const shippingFee = totalPrice >= 5000 ? 0 : 500;
  const finalTotal = totalPrice + shippingFee;

  // ログインチェック
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=/checkout');
    }
  }, [currentUser, navigate]);

  // カートが空の場合はリダイレクト
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // 配送先情報のバリデーション
    if (!formData.fullName) newErrors.fullName = '氏名を入力してください';
    if (!formData.email) newErrors.email = 'メールアドレスを入力してください';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    if (!formData.phone) newErrors.phone = '電話番号を入力してください';
    else if (!/^\d{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '有効な電話番号を入力してください';
    }
    if (!formData.postalCode) newErrors.postalCode = '郵便番号を入力してください';
    else if (!/^\d{3}-?\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = '有効な郵便番号を入力してください（例: 123-4567）';
    }
    if (!formData.prefecture) newErrors.prefecture = '都道府県を入力してください';
    if (!formData.city) newErrors.city = '市区町村を入力してください';
    if (!formData.address) newErrors.address = '番地を入力してください';

    // 支払い情報のバリデーション（簡易的）
    if (!formData.cardNumber) newErrors.cardNumber = 'カード番号を入力してください';
    if (!formData.cardExpiry) newErrors.cardExpiry = '有効期限を入力してください';
    if (!formData.cardCvc) newErrors.cardCvc = 'セキュリティコードを入力してください';
    if (!formData.cardName) newErrors.cardName = 'カード名義を入力してください';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: 実際のStripe決済処理を実装
      // ここでは簡易的なシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Firestoreに注文データを保存

      // カートをクリア
      clearCart();

      // 注文完了ページへ遷移
      navigate('/order-complete');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('決済処理に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || items.length === 0) {
    return null; // リダイレクト中
  }

  return (
    <div className="checkout">
      <div className="checkout__container">
        <h1 className="checkout__title">お支払い</h1>

        <div className="checkout__content">
          {/* 左側: フォーム */}
          <div className="checkout__form-section">
            <form onSubmit={handleSubmit} className="checkout__form">
              {/* 配送先情報 */}
              <section className="checkout__section">
                <h2 className="checkout__section-title">配送先情報</h2>

                <div className="checkout__form-row">
                  <Input
                    type="text"
                    name="fullName"
                    label="氏名"
                    placeholder="山田 太郎"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    required
                    fullWidth
                  />
                </div>

                <div className="checkout__form-row">
                  <Input
                    type="email"
                    name="email"
                    label="メールアドレス"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    fullWidth
                  />
                </div>

                <div className="checkout__form-row">
                  <Input
                    type="tel"
                    name="phone"
                    label="電話番号"
                    placeholder="09012345678"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    required
                    fullWidth
                  />
                </div>

                <div className="checkout__form-row checkout__form-row--half">
                  <Input
                    type="text"
                    name="postalCode"
                    label="郵便番号"
                    placeholder="123-4567"
                    value={formData.postalCode}
                    onChange={handleChange}
                    error={errors.postalCode}
                    required
                  />
                  <Input
                    type="text"
                    name="prefecture"
                    label="都道府県"
                    placeholder="東京都"
                    value={formData.prefecture}
                    onChange={handleChange}
                    error={errors.prefecture}
                    required
                  />
                </div>

                <div className="checkout__form-row">
                  <Input
                    type="text"
                    name="city"
                    label="市区町村"
                    placeholder="渋谷区"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                    required
                    fullWidth
                  />
                </div>

                <div className="checkout__form-row">
                  <Input
                    type="text"
                    name="address"
                    label="番地"
                    placeholder="1-2-3"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    required
                    fullWidth
                  />
                </div>

                <div className="checkout__form-row">
                  <Input
                    type="text"
                    name="building"
                    label="建物名・部屋番号（任意）"
                    placeholder="〇〇マンション 101号室"
                    value={formData.building}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>
              </section>

              {/* 支払い情報 */}
              <section className="checkout__section">
                <h2 className="checkout__section-title">支払い情報</h2>

                <div className="checkout__payment-note">
                  ※ 実際の決済にはStripeを使用します（開発中）
                </div>

                <div className="checkout__form-row">
                  <Input
                    type="text"
                    name="cardNumber"
                    label="カード番号"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    error={errors.cardNumber}
                    required
                    fullWidth
                  />
                </div>

                <div className="checkout__form-row checkout__form-row--half">
                  <Input
                    type="text"
                    name="cardExpiry"
                    label="有効期限"
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    error={errors.cardExpiry}
                    required
                  />
                  <Input
                    type="text"
                    name="cardCvc"
                    label="セキュリティコード"
                    placeholder="123"
                    value={formData.cardCvc}
                    onChange={handleChange}
                    error={errors.cardCvc}
                    required
                  />
                </div>

                <div className="checkout__form-row">
                  <Input
                    type="text"
                    name="cardName"
                    label="カード名義"
                    placeholder="TARO YAMADA"
                    value={formData.cardName}
                    onChange={handleChange}
                    error={errors.cardName}
                    required
                    fullWidth
                  />
                </div>
              </section>

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
              >
                ¥{finalTotal.toLocaleString()} を支払う
              </Button>
            </form>
          </div>

          {/* 右側: 注文サマリー */}
          <div className="checkout__summary">
            <h2 className="checkout__summary-title">注文内容</h2>

            <div className="checkout__items">
              {items.map((item) => (
                <div key={item.id} className="checkout__item">
                  <img
                    src={item.product.mainImage}
                    alt={item.product.name}
                    className="checkout__item-image"
                  />
                  <div className="checkout__item-info">
                    <p className="checkout__item-name">{item.product.name}</p>
                    <p className="checkout__item-quantity">数量: {item.quantity}</p>
                  </div>
                  <p className="checkout__item-price">
                    ¥{item.totalPrice.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="checkout__summary-details">
              <div className="checkout__summary-row">
                <span>小計</span>
                <span>¥{totalPrice.toLocaleString()}</span>
              </div>
              <div className="checkout__summary-row">
                <span>送料</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="checkout__free-shipping">無料</span>
                  ) : (
                    `¥${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="checkout__summary-divider"></div>
              <div className="checkout__summary-row checkout__summary-total">
                <span>合計</span>
                <span>¥{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
