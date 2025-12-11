import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { StripeCheckoutForm } from '../../components/organisms/StripeCheckoutForm';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../store/useCartStore';
import { Order, OrderItem } from '../../types';
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
  });

  // currentUserが更新されたら、フォームデータも更新
  React.useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.displayName || '',
        email: prev.email || currentUser.email || '',
      }));
    }
  }, [currentUser]);

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
    // 無効なアイテムをフィルタリング
    const validItems = items.filter(item =>
      item?.product?.id &&
      typeof item?.product?.price === 'number' &&
      typeof item?.quantity === 'number'
    );

    if (validItems.length === 0) {
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
    if (!formData.fullName || formData.fullName.trim() === '') {
      newErrors.fullName = '氏名を入力してください';
    }
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = '電話番号を入力してください';
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '有効な電話番号を入力してください';
    }
    if (!formData.postalCode || formData.postalCode.trim() === '') {
      newErrors.postalCode = '郵便番号を入力してください';
    } else if (!/^\d{3}-?\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = '有効な郵便番号を入力してください（例: 123-4567）';
    }
    if (!formData.prefecture || formData.prefecture.trim() === '') {
      newErrors.prefecture = '都道府県を入力してください';
    }
    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = '市区町村を入力してください';
    }
    if (!formData.address || formData.address.trim() === '') {
      newErrors.address = '番地を入力してください';
    }

    console.log('Validating form data:', formData);
    console.log('Validation errors found:', newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 注文番号を生成
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}${month}${day}-${random}`;
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    console.log('=== Payment Submit Started ===');
    console.log('Payment data received:', paymentData);
    console.log('Current form data:', formData);

    // 配送先情報のバリデーションを最初に行う
    if (!validate()) {
      console.log('Validation failed. Form data:', formData);
      console.log('Validation errors:', errors);
      throw new Error('配送先情報を正しく入力してください。コンソールで詳細を確認してください。');
    }

    console.log('Validation passed successfully');

    if (!currentUser || !db) {
      throw new Error('認証エラーが発生しました');
    }

    setLoading(true);

    try {
      // 注文アイテムを準備
      const orderItems: OrderItem[] = await Promise.all(
        items.map(async (item) => {
          // 商品の最新情報を取得
          const productDoc = await getDoc(doc(db, 'products', item.product.id));
          const productData = productDoc.exists() ? productDoc.data() : item.product;

          return {
            productId: item.product.id,
            productName: productData.name || item.product.name,
            productImage: productData.imageUrl || productData.images?.[0] || item.product.imageUrl || '',
            price: productData.salePrice || productData.price || item.product.price,
            quantity: item.quantity,
            subtotal: (productData.salePrice || productData.price || item.product.price) * item.quantity,
          };
        })
      );

      // 注文データを作成
      const orderData: Omit<Order, 'id'> = {
        orderNumber: generateOrderNumber(),
        userId: currentUser.uid,
        customerEmail: formData.email,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        items: orderItems,
        shippingAddress: {
          postalCode: formData.postalCode,
          prefecture: formData.prefecture,
          city: formData.city,
          address: formData.address,
          building: formData.building,
        },
        subtotal: totalPrice,
        shipping: shippingFee,
        tax: Math.floor(totalPrice * 0.1), // 10%の税金
        discount: 0,
        total: finalTotal,
        paymentMethod: 'card',
        paymentStatus: 'pending', // 実際の決済処理後に'paid'に更新
        orderStatus: 'pending',
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      // Firestoreに注文データを保存
      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // 在庫を減らす処理
      for (const item of orderItems) {
        const productRef = doc(db, 'products', item.productId);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const currentStock = productDoc.data().stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);

          await updateDoc(productRef, {
            stock: newStock,
            sold: (productDoc.data().sold || 0) + item.quantity,
            updatedAt: new Date(),
          });
        }
      }

      // Stripeの決済処理をシミュレーション
      // 実際の本番環境では、ここでStripe APIを使用して決済を処理します
      console.log('Processing payment simulation...');

      // テストモードでの決済シミュレーション（2秒待機）
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 決済成功として注文ステータスを更新
      console.log('Updating order status to paid...');
      await updateDoc(doc(db, 'orders', orderRef.id), {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        updatedAt: new Date(),
      });

      // カートをクリア
      console.log('Clearing cart...');
      clearCart();

      // loadingをfalseに設定
      setLoading(false);

      // 注文完了ページへ遷移（注文IDを渡す）
      console.log(`Navigating to order-complete page with orderId: ${orderRef.id}`);
      navigate(`/order-complete?orderId=${orderRef.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
      throw error; // エラーを再スロー
    }
  };

  // この関数は不要になりました（StripeCheckoutFormが処理を行うため）

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
            <div className="checkout__form">
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

                <StripeCheckoutForm
                  onSubmit={handlePaymentSubmit}
                  loading={loading}
                  amount={finalTotal}
                />
              </section>
            </div>
          </div>

          {/* 右側: 注文サマリー */}
          <div className="checkout__summary">
            <h2 className="checkout__summary-title">注文内容</h2>

            <div className="checkout__items">
              {items.map((item) => (
                <div key={item.product.id} className="checkout__item">
                  <img
                    src={item.product.imageUrl || item.product.images?.[0] || '/placeholder-product.svg'}
                    alt={item.product.name}
                    className="checkout__item-image"
                  />
                  <div className="checkout__item-info">
                    <p className="checkout__item-name">{item.product.name}</p>
                    <p className="checkout__item-quantity">数量: {item.quantity}</p>
                  </div>
                  <p className="checkout__item-price">
                    ¥{((item.product.salePrice || item.product.price) * item.quantity).toLocaleString()}
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
