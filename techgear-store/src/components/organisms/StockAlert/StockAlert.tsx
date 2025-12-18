import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import './StockAlert.css';

interface Product {
  id: string;
  name: string;
  stock: number;
  category: string;
  sku?: string;
}

interface StockAlertProps {
  threshold?: number;
  onAlertClick?: (product: Product) => void;
}

export const StockAlert: React.FC<StockAlertProps> = ({
  threshold = 5,
  onAlertClick
}) => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    if (!db) return;

    // リアルタイム監視の設定
    const unsubscribe = subscribeToStockChanges();

    // 初回チェック
    checkStockLevels();

    // 5分ごとに再チェック
    const interval = setInterval(() => {
      checkStockLevels();
    }, 5 * 60 * 1000);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      clearInterval(interval);
    };
  }, [threshold]);

  const subscribeToStockChanges = (): Unsubscribe | undefined => {
    if (!db) return;

    const productsRef = collection(db, 'products');

    // リアルタイム更新の監視
    return onSnapshot(productsRef, (snapshot) => {
      const products: Product[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.stock !== undefined) {
          products.push({
            id: doc.id,
            name: data.name,
            stock: data.stock,
            category: data.category,
            sku: data.sku,
          });
        }
      });

      updateAlerts(products);
    });
  };

  const checkStockLevels = async () => {
    if (!db) return;

    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      const products: Product[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.stock !== undefined) {
          products.push({
            id: doc.id,
            name: data.name,
            stock: data.stock,
            category: data.category,
            sku: data.sku,
          });
        }
      });

      updateAlerts(products);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error checking stock levels:', error);
    }
  };

  const updateAlerts = (products: Product[]) => {
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= threshold);
    const outOfStock = products.filter(p => p.stock === 0);

    setLowStockProducts(lowStock);
    setOutOfStockProducts(outOfStock);

    // アラート表示の判定
    if (lowStock.length > 0 || outOfStock.length > 0) {
      setShowAlert(true);

      // LocalStorageに保存（ページ再読み込み後も維持）
      const alertData = {
        lowStock: lowStock.map(p => ({ id: p.id, name: p.name, stock: p.stock })),
        outOfStock: outOfStock.map(p => ({ id: p.id, name: p.name })),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('stockAlerts', JSON.stringify(alertData));

      // 新しいアラートがある場合はブラウザ通知を試みる
      if ('Notification' in window && Notification.permission === 'granted') {
        showBrowserNotification(lowStock, outOfStock);
      }
    } else {
      setShowAlert(false);
      localStorage.removeItem('stockAlerts');
    }
  };

  const showBrowserNotification = (lowStock: Product[], outOfStock: Product[]) => {
    let title = '在庫アラート';
    let body = '';

    if (outOfStock.length > 0) {
      body += `在庫切れ: ${outOfStock.length}件\n`;
    }
    if (lowStock.length > 0) {
      body += `在庫僅少: ${lowStock.length}件`;
    }

    try {
      new Notification(title, {
        body: body.trim(),
        icon: '/favicon.ico',
        tag: 'stock-alert',
        requireInteraction: true,
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('通知権限が許可されました');
      }
    }
  };

  const getTotalAlertCount = () => {
    return lowStockProducts.length + outOfStockProducts.length;
  };

  if (!showAlert) {
    return null;
  }

  return (
    <div className="stock-alert">
      <div className="stock-alert__summary">
        <div className="stock-alert__icon">
          ⚠️
        </div>
        <div className="stock-alert__content">
          <h4 className="stock-alert__title">在庫アラート</h4>
          <p className="stock-alert__count">
            {outOfStockProducts.length > 0 && (
              <span className="stock-alert__out">
                在庫切れ: {outOfStockProducts.length}件
              </span>
            )}
            {outOfStockProducts.length > 0 && lowStockProducts.length > 0 && ' / '}
            {lowStockProducts.length > 0 && (
              <span className="stock-alert__low">
                在庫僅少: {lowStockProducts.length}件
              </span>
            )}
          </p>
        </div>
        <button
          className="stock-alert__toggle"
          onClick={() => setShowAlert(!showAlert)}
          aria-label="アラートを閉じる"
        >
          ×
        </button>
      </div>

      <div className="stock-alert__details">
        {outOfStockProducts.length > 0 && (
          <div className="stock-alert__section">
            <h5>在庫切れ商品</h5>
            <ul className="stock-alert__list">
              {outOfStockProducts.slice(0, 5).map(product => (
                <li
                  key={product.id}
                  onClick={() => onAlertClick?.(product)}
                  className="stock-alert__item stock-alert__item--out"
                >
                  <span className="stock-alert__name">{product.name}</span>
                  {product.sku && (
                    <span className="stock-alert__sku">({product.sku})</span>
                  )}
                </li>
              ))}
              {outOfStockProducts.length > 5 && (
                <li className="stock-alert__more">
                  他 {outOfStockProducts.length - 5} 件
                </li>
              )}
            </ul>
          </div>
        )}

        {lowStockProducts.length > 0 && (
          <div className="stock-alert__section">
            <h5>在庫僅少商品（{threshold}個以下）</h5>
            <ul className="stock-alert__list">
              {lowStockProducts.slice(0, 5).map(product => (
                <li
                  key={product.id}
                  onClick={() => onAlertClick?.(product)}
                  className="stock-alert__item stock-alert__item--low"
                >
                  <span className="stock-alert__name">{product.name}</span>
                  <span className="stock-alert__stock">残り{product.stock}個</span>
                  {product.sku && (
                    <span className="stock-alert__sku">({product.sku})</span>
                  )}
                </li>
              ))}
              {lowStockProducts.length > 5 && (
                <li className="stock-alert__more">
                  他 {lowStockProducts.length - 5} 件
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="stock-alert__footer">
          <span className="stock-alert__time">
            最終チェック: {lastCheck.toLocaleTimeString()}
          </span>
          {!('Notification' in window) ? null :
            Notification.permission === 'default' ? (
              <button
                onClick={requestNotificationPermission}
                className="stock-alert__notify-btn"
              >
                通知を有効化
              </button>
            ) : Notification.permission === 'granted' ? (
              <span className="stock-alert__notify-status">通知: ON</span>
            ) : null
          }
        </div>
      </div>
    </div>
  );
};