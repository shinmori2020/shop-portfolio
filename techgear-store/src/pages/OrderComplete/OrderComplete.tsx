import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/atoms/Button';
import { Order } from '../../types';
import './OrderComplete.css';

export const OrderComplete: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !db) {
        setLoading(false);
        return;
      }

      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-complete order-complete--loading">
        <div className="order-complete__container">
          <p>注文情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-complete order-complete--error">
        <div className="order-complete__container">
          <h1>注文情報が見つかりません</h1>
          <Button onClick={() => navigate('/')} variant="primary">
            ホームへ戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-complete">
      <div className="order-complete__container">
        <div className="order-complete__success-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="40" fill="#4CAF50" />
            <path
              d="M54 28L34 48L26 40"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="order-complete__title">ご注文ありがとうございました！</h1>

        <div className="order-complete__message">
          <p>ご注文を正常に受け付けました。</p>
          <p>確認メールを {order.customerEmail} 宛にお送りしました。</p>
        </div>

        <div className="order-complete__details">
          <div className="order-complete__detail-item">
            <span className="order-complete__label">注文番号</span>
            <span className="order-complete__value">{order.orderNumber}</span>
          </div>
          <div className="order-complete__detail-item">
            <span className="order-complete__label">お支払い金額</span>
            <span className="order-complete__value">¥{order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="order-complete__summary">
          <h2 className="order-complete__summary-title">注文内容</h2>
          <div className="order-complete__items">
            {order.items.map((item, index) => (
              <div key={index} className="order-complete__item">
                <img
                  src={item.productImage || '/placeholder-product.svg'}
                  alt={item.productName}
                  className="order-complete__item-image"
                />
                <div className="order-complete__item-info">
                  <p className="order-complete__item-name">{item.productName}</p>
                  <p className="order-complete__item-quantity">数量: {item.quantity}</p>
                </div>
                <p className="order-complete__item-price">
                  ¥{item.subtotal.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-complete__shipping">
          <h3 className="order-complete__shipping-title">配送先</h3>
          <p>{order.customerName}</p>
          <p>〒{order.shippingAddress.postalCode}</p>
          <p>
            {order.shippingAddress.prefecture}
            {order.shippingAddress.city}
            {order.shippingAddress.address}
          </p>
          {order.shippingAddress.building && <p>{order.shippingAddress.building}</p>}
        </div>

        <div className="order-complete__actions">
          <Button onClick={() => navigate('/account/orders')} variant="outline">
            注文履歴を見る
          </Button>
          <Button onClick={() => navigate('/')} variant="primary">
            ショッピングを続ける
          </Button>
        </div>
      </div>
    </div>
  );
};