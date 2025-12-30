import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import './AdminOrders.css';

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'card' | 'bank' | 'convenience';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier?: string;
  shippingAddress: {
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
  };
  deliveryNote?: string;
  createdAt: Date;
  updatedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export const AdminOrders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['orderStatus']>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  useEffect(() => {
    checkAdminAndLoadData();
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isAdminUser = user.email?.includes('admin') || user.email === 'test@example.com';
    setIsAdmin(isAdminUser);

    if (isAdminUser) {
      await loadOrders();
    } else {
      navigate('/');
    }
  };

  const loadOrders = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const ordersData: Order[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || undefined,
        shippedAt: doc.data().shippedAt?.toDate?.() || undefined,
        deliveredAt: doc.data().deliveredAt?.toDate?.() || undefined,
      } as Order));

      setOrders(ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    if (!db) return;

    try {
      const updateData: Record<string, unknown> = {
        orderStatus: newStatus,
        updatedAt: new Date(),
      };

      if (newStatus === 'shipped') {
        updateData.shippedAt = new Date();
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (carrier) updateData.carrier = carrier;
      }

      if (newStatus === 'delivered') {
        updateData.deliveredAt = new Date();
      }

      await updateDoc(doc(db, 'orders', orderId), updateData);

      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, ...updateData, updatedAt: new Date() } as Order : o
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updateData, updatedAt: new Date() } as Order : null);
      }

      alert('ステータスを更新しました');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setCarrier(order.carrier || '');
    setShowDetailModal(true);
  };

  // 日付フィルター用のヘルパー関数
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return { start: weekStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      }
      case 'month': {
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 30);
        return { start: monthStart, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      }
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return { start, end };
        }
        return null;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

    // 日付フィルター
    const dateRange = getDateRange();
    const matchesDate = !dateRange || (order.createdAt >= dateRange.start && order.createdAt <= dateRange.end);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const orderStats = {
    all: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
  };

  const todaySales = orders
    .filter(o => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return o.createdAt >= today && o.orderStatus !== 'cancelled';
    })
    .reduce((sum, o) => sum + o.total, 0);

  const getStatusLabel = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending': return '未処理';
      case 'confirmed': return '確認済';
      case 'processing': return '処理中';
      case 'shipped': return '発送済';
      case 'delivered': return '配達完了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const getStatusClass = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending': return 'admin-orders__status--pending';
      case 'confirmed': return 'admin-orders__status--confirmed';
      case 'processing': return 'admin-orders__status--processing';
      case 'shipped': return 'admin-orders__status--shipped';
      case 'delivered': return 'admin-orders__status--delivered';
      case 'cancelled': return 'admin-orders__status--cancelled';
      default: return '';
    }
  };

  const getPaymentMethodLabel = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'card': return 'クレジットカード';
      case 'bank': return '銀行振込';
      case 'convenience': return 'コンビニ払い';
      default: return method;
    }
  };

  const getPaymentStatusLabel = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending': return '未払い';
      case 'paid': return '支払済';
      case 'failed': return '失敗';
      case 'refunded': return '返金済';
      default: return status;
    }
  };

  if (loading) {
    return <div className="admin-orders__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-orders">
      <div className="admin-orders__header">
        <h1>注文管理</h1>
        <div className="admin-orders__actions">
          <div className="admin-orders__nav">
            <button onClick={() => navigate('/admin')}>ダッシュボード</button>
            <button onClick={() => navigate('/admin/products')}>商品管理</button>
            <button onClick={() => navigate('/admin/inventory')}>在庫管理</button>
            <button onClick={() => navigate('/admin/contacts')}>問い合わせ管理</button>
          </div>
          <div className="admin-orders__divider" />
          <div className="admin-orders__page-actions">
            <button onClick={loadOrders}>更新</button>
          </div>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="admin-orders__summary">
        <div className="admin-orders__summary-card admin-orders__summary-card--sales">
          <span className="admin-orders__summary-label">今日の売上</span>
          <span className="admin-orders__summary-value">¥{todaySales.toLocaleString()}</span>
        </div>
        <div
          className={`admin-orders__summary-card ${orderStats.pending > 0 ? 'admin-orders__summary-card--warning' : ''} ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
        >
          <span className="admin-orders__summary-label">未処理</span>
          <span className="admin-orders__summary-value">{orderStats.pending}</span>
        </div>
        <div
          className={`admin-orders__summary-card admin-orders__summary-card--caution ${statusFilter === 'processing' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'processing' ? 'all' : 'processing')}
        >
          <span className="admin-orders__summary-label">処理中</span>
          <span className="admin-orders__summary-value">{orderStats.confirmed + orderStats.processing}</span>
        </div>
        <div
          className={`admin-orders__summary-card ${statusFilter === 'shipped' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'shipped' ? 'all' : 'shipped')}
        >
          <span className="admin-orders__summary-label">発送済</span>
          <span className="admin-orders__summary-value">{orderStats.shipped}</span>
        </div>
        <div
          className={`admin-orders__summary-card admin-orders__summary-card--success ${statusFilter === 'delivered' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'delivered' ? 'all' : 'delivered')}
        >
          <span className="admin-orders__summary-label">配達完了</span>
          <span className="admin-orders__summary-value">{orderStats.delivered}</span>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="admin-orders__filters">
        <input
          type="text"
          placeholder="注文番号、顧客名、メールで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-orders__search"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="admin-orders__filter-select"
        >
          <option value="all">すべてのステータス ({orderStats.all})</option>
          <option value="pending">未処理 ({orderStats.pending})</option>
          <option value="confirmed">確認済 ({orderStats.confirmed})</option>
          <option value="processing">処理中 ({orderStats.processing})</option>
          <option value="shipped">発送済 ({orderStats.shipped})</option>
          <option value="delivered">配達完了 ({orderStats.delivered})</option>
          <option value="cancelled">キャンセル ({orderStats.cancelled})</option>
        </select>
      </div>

      {/* 日付フィルター */}
      <div className="admin-orders__date-filters">
        <div className="admin-orders__date-quick">
          <button
            className={`admin-orders__date-btn ${dateFilter === 'all' ? 'active' : ''}`}
            onClick={() => setDateFilter('all')}
          >
            すべて
          </button>
          <button
            className={`admin-orders__date-btn ${dateFilter === 'today' ? 'active' : ''}`}
            onClick={() => setDateFilter('today')}
          >
            今日
          </button>
          <button
            className={`admin-orders__date-btn ${dateFilter === 'week' ? 'active' : ''}`}
            onClick={() => setDateFilter('week')}
          >
            過去7日
          </button>
          <button
            className={`admin-orders__date-btn ${dateFilter === 'month' ? 'active' : ''}`}
            onClick={() => setDateFilter('month')}
          >
            過去30日
          </button>
          <button
            className={`admin-orders__date-btn ${dateFilter === 'custom' ? 'active' : ''}`}
            onClick={() => setDateFilter('custom')}
          >
            期間指定
          </button>
        </div>
        {dateFilter === 'custom' && (
          <div className="admin-orders__date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="admin-orders__date-input"
            />
            <span className="admin-orders__date-separator">〜</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="admin-orders__date-input"
            />
          </div>
        )}
        {dateFilter !== 'all' && (
          <span className="admin-orders__filter-result">
            {filteredOrders.length}件の注文
          </span>
        )}
      </div>

      {/* 注文一覧 */}
      <div className="admin-orders__list">
        {filteredOrders.length === 0 ? (
          <p className="admin-orders__empty">注文がありません</p>
        ) : (
          <table className="admin-orders__table">
            <thead>
              <tr>
                <th>注文番号</th>
                <th>日時</th>
                <th>顧客</th>
                <th>商品数</th>
                <th>合計</th>
                <th>支払い</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className={order.orderStatus === 'pending' ? 'admin-orders__row--urgent' : ''}>
                  <td className="admin-orders__order-number">{order.orderNumber}</td>
                  <td>
                    {order.createdAt.toLocaleDateString()}<br />
                    <span className="admin-orders__time">
                      {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td>
                    <div className="admin-orders__customer">
                      <span className="admin-orders__customer-name">{order.customerName}</span>
                      <span className="admin-orders__customer-email">{order.customerEmail}</span>
                    </div>
                  </td>
                  <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}点</td>
                  <td className="admin-orders__total">¥{order.total.toLocaleString()}</td>
                  <td>
                    <span className={`admin-orders__payment ${order.paymentStatus === 'paid' ? 'admin-orders__payment--paid' : ''}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-orders__status ${getStatusClass(order.orderStatus)}`}>
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-orders__actions-cell">
                      <button
                        className="admin-orders__btn admin-orders__btn--view"
                        onClick={() => openDetailModal(order)}
                      >
                        詳細
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 詳細モーダル */}
      {showDetailModal && selectedOrder && (
        <div className="admin-orders__modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-orders__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-orders__modal-header">
              <h2>注文詳細 - {selectedOrder.orderNumber}</h2>
              <button
                className="admin-orders__modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="admin-orders__modal-content">
              {/* 注文ステータス */}
              <div className="admin-orders__detail-section">
                <h3>注文ステータス</h3>
                <div className="admin-orders__status-update">
                  <span className={`admin-orders__status admin-orders__status--large ${getStatusClass(selectedOrder.orderStatus)}`}>
                    {getStatusLabel(selectedOrder.orderStatus)}
                  </span>
                  {selectedOrder.orderStatus !== 'delivered' && selectedOrder.orderStatus !== 'cancelled' && (
                    <div className="admin-orders__status-actions">
                      {selectedOrder.orderStatus === 'pending' && (
                        <button
                          className="admin-orders__btn admin-orders__btn--confirm"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                        >
                          確認済にする
                        </button>
                      )}
                      {selectedOrder.orderStatus === 'confirmed' && (
                        <button
                          className="admin-orders__btn admin-orders__btn--process"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                        >
                          処理中にする
                        </button>
                      )}
                      {(selectedOrder.orderStatus === 'processing' || selectedOrder.orderStatus === 'confirmed') && (
                        <div className="admin-orders__shipping-form">
                          <input
                            type="text"
                            placeholder="追跡番号"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="admin-orders__input"
                          />
                          <select
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="admin-orders__input"
                          >
                            <option value="">配送業者を選択</option>
                            <option value="yamato">ヤマト運輸</option>
                            <option value="sagawa">佐川急便</option>
                            <option value="japanpost">日本郵便</option>
                          </select>
                          <button
                            className="admin-orders__btn admin-orders__btn--ship"
                            onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                          >
                            発送済にする
                          </button>
                        </div>
                      )}
                      {selectedOrder.orderStatus === 'shipped' && (
                        <button
                          className="admin-orders__btn admin-orders__btn--deliver"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                        >
                          配達完了にする
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 顧客情報 */}
              <div className="admin-orders__detail-section">
                <h3>顧客情報</h3>
                <div className="admin-orders__detail-grid">
                  <div className="admin-orders__detail-item">
                    <label>名前</label>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="admin-orders__detail-item">
                    <label>メール</label>
                    <a href={`mailto:${selectedOrder.customerEmail}`}>{selectedOrder.customerEmail}</a>
                  </div>
                  <div className="admin-orders__detail-item">
                    <label>電話</label>
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                </div>
              </div>

              {/* 配送先 */}
              <div className="admin-orders__detail-section">
                <h3>配送先</h3>
                <div className="admin-orders__address">
                  〒{selectedOrder.shippingAddress.postalCode}<br />
                  {selectedOrder.shippingAddress.prefecture}
                  {selectedOrder.shippingAddress.city}
                  {selectedOrder.shippingAddress.address}
                  {selectedOrder.shippingAddress.building && <><br />{selectedOrder.shippingAddress.building}</>}
                </div>
                {selectedOrder.deliveryNote && (
                  <div className="admin-orders__delivery-note">
                    <label>配送メモ:</label> {selectedOrder.deliveryNote}
                  </div>
                )}
                {selectedOrder.trackingNumber && (
                  <div className="admin-orders__tracking">
                    <label>追跡番号:</label> {selectedOrder.trackingNumber}
                    {selectedOrder.carrier && ` (${selectedOrder.carrier})`}
                  </div>
                )}
              </div>

              {/* 注文商品 */}
              <div className="admin-orders__detail-section">
                <h3>注文商品</h3>
                <table className="admin-orders__items-table">
                  <thead>
                    <tr>
                      <th>商品</th>
                      <th>単価</th>
                      <th>数量</th>
                      <th>小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="admin-orders__item-info">
                            {item.productImage && (
                              <img src={item.productImage} alt={item.productName} className="admin-orders__item-image" />
                            )}
                            <span>{item.productName}</span>
                          </div>
                        </td>
                        <td>¥{item.price.toLocaleString()}</td>
                        <td>{item.quantity}</td>
                        <td>¥{item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 金額 */}
              <div className="admin-orders__detail-section">
                <h3>金額詳細</h3>
                <div className="admin-orders__totals">
                  <div className="admin-orders__total-row">
                    <span>小計</span>
                    <span>¥{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="admin-orders__total-row">
                    <span>送料</span>
                    <span>¥{selectedOrder.shipping.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="admin-orders__total-row admin-orders__total-row--discount">
                      <span>割引</span>
                      <span>-¥{selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="admin-orders__total-row admin-orders__total-row--grand">
                    <span>合計</span>
                    <span>¥{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 支払い情報 */}
              <div className="admin-orders__detail-section">
                <h3>支払い情報</h3>
                <div className="admin-orders__detail-grid">
                  <div className="admin-orders__detail-item">
                    <label>支払方法</label>
                    <span>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                  </div>
                  <div className="admin-orders__detail-item">
                    <label>支払状況</label>
                    <span className={selectedOrder.paymentStatus === 'paid' ? 'admin-orders__paid' : ''}>
                      {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 日時情報 */}
              <div className="admin-orders__detail-section">
                <h3>日時情報</h3>
                <div className="admin-orders__detail-grid">
                  <div className="admin-orders__detail-item">
                    <label>注文日時</label>
                    <span>{selectedOrder.createdAt.toLocaleString()}</span>
                  </div>
                  {selectedOrder.shippedAt && (
                    <div className="admin-orders__detail-item">
                      <label>発送日時</label>
                      <span>{selectedOrder.shippedAt.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.deliveredAt && (
                    <div className="admin-orders__detail-item">
                      <label>配達完了</label>
                      <span>{selectedOrder.deliveredAt.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="admin-orders__modal-actions">
              <button
                className="admin-orders__btn admin-orders__btn--close"
                onClick={() => setShowDetailModal(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
