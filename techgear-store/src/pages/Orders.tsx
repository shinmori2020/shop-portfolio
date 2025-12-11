import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import './Orders.css';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: {
    name: string;
    email: string;
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    phone: string;
  };
}

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Current user in Orders page:', user); // デバッグログ
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        if (!db) {
          setError('データベースが設定されていません');
          setLoading(false);
          return;
        }

        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const ordersData: Order[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({
            id: doc.id,
            userId: data.userId,
            items: data.items,
            totalAmount: data.totalAmount,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            shippingAddress: data.shippingAddress,
          });
        });

        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('注文履歴の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
      pending: '注文確認中',
      processing: '処理中',
      shipped: '発送済み',
      delivered: '配達完了',
      cancelled: 'キャンセル済み'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: Order['status']) => {
    return `orders__status orders__status--${status}`;
  };

  if (!user) {
    return (
      <div className="orders">
        <div className="orders__container">
          <p className="orders__message">ログインしてください</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders">
        <div className="orders__container">
          <p className="orders__loading">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders">
        <div className="orders__container">
          <p className="orders__error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="orders__container">
        <h1 className="orders__title">注文履歴</h1>

        {orders.length === 0 ? (
          <div className="orders__empty">
            <p>注文履歴がありません</p>
          </div>
        ) : (
          <div className="orders__list">
            {orders.map((order) => (
              <div key={order.id} className="orders__item">
                <div className="orders__header">
                  <div className="orders__info">
                    <p className="orders__date">
                      注文日: {order.createdAt.toLocaleDateString('ja-JP')}
                    </p>
                    <p className="orders__id">注文番号: {order.id}</p>
                  </div>
                  <span className={getStatusClass(order.status)}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="orders__items">
                  {order.items.map((item, index) => (
                    <div key={index} className="orders__product">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="orders__product-image"
                      />
                      <div className="orders__product-info">
                        <h3 className="orders__product-name">{item.name}</h3>
                        <p className="orders__product-quantity">数量: {item.quantity}</p>
                      </div>
                      <p className="orders__product-price">
                        ¥{item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="orders__footer">
                  <p className="orders__total">
                    合計: ¥{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};