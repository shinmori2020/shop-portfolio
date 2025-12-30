import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './AdminDashboard.css';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  sold: number;
  isPublished: boolean;
  updatedAt?: Date;
  mainImage?: string;
}

interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  action: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  createdAt: Date;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

interface Review {
  id: string;
  productId: string;
  productName?: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unanswered' | 'in_progress' | 'completed';
  createdAt: Date;
}

type TabType = 'overview' | 'inventory' | 'orders' | 'analytics' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentHistory, setRecentHistory] = useState<StockHistory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<'7days' | '30days' | '3months'>('30days');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    checkAdminAndLoadData();
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isAdminUser = user.email?.includes('admin') ||
                       user.email === 'test@example.com';

    setIsAdmin(isAdminUser);

    if (isAdminUser) {
      await Promise.all([loadProducts(), loadRecentHistory(), loadOrders(), loadReviews(), loadContacts()]);
    } else {
      navigate('/');
    }
  };

  const loadProducts = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      } as Product));

      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentHistory = async () => {
    if (!db) return;

    try {
      const historyRef = collection(db, 'stockHistory');
      const snapshot = await getDocs(historyRef);

      const history = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        } as StockHistory))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);

      setRecentHistory(history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadOrders = async () => {
    if (!db) return;

    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);

      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      } as Order));

      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadReviews = async () => {
    if (!db) return;

    try {
      const reviewsRef = collection(db, 'reviews');
      const snapshot = await getDocs(reviewsRef);

      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      } as Review));

      setReviews(reviewsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadContacts = async () => {
    if (!db) return;

    try {
      const contactsRef = collection(db, 'contacts');
      const snapshot = await getDocs(contactsRef);

      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || 'unanswered',
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      } as Contact));

      setContacts(contactsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // 日付ヘルパー関数
  const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getStartOfMonth = (date: Date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // KPI計算
  const kpiData = {
    totalProducts: products.length,
    publishedProducts: products.filter(p => p.isPublished).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length,
    totalStockValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
    totalSold: products.reduce((sum, p) => sum + (p.sold || 0), 0),
  };

  // 売上計算
  const today = getStartOfDay(new Date());
  const thisMonthStart = getStartOfMonth(new Date());
  const lastMonthStart = getStartOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);

  const todaySales = orders
    .filter(o => o.createdAt >= today && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const thisMonthSales = orders
    .filter(o => o.createdAt >= thisMonthStart && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const lastMonthSales = orders
    .filter(o => o.createdAt >= lastMonthStart && o.createdAt <= lastMonthEnd && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const monthOverMonthChange = lastMonthSales > 0
    ? Math.round(((thisMonthSales - lastMonthSales) / lastMonthSales) * 100)
    : thisMonthSales > 0 ? 100 : 0;

  // 注文ステータス
  const orderStats = {
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    processing: orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'confirmed').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
  };

  // 問い合わせステータス
  const contactStats = {
    unanswered: contacts.filter(c => c.status === 'unanswered').length,
    inProgress: contacts.filter(c => c.status === 'in_progress').length,
    completedToday: contacts.filter(c => c.status === 'completed' && c.createdAt >= today).length,
  };

  // アクションアイテム計算
  const actionItems = [
    {
      id: 'pending-orders',
      label: '未処理注文',
      count: orderStats.pending,
      priority: 'urgent' as const,
      action: () => navigate('/admin/orders'),
      buttonText: '注文管理へ',
    },
    {
      id: 'shipping',
      label: '発送待ち',
      count: orderStats.processing,
      priority: 'important' as const,
      action: () => navigate('/admin/orders'),
      buttonText: '発送処理へ',
    },
    {
      id: 'out-of-stock',
      label: '在庫切れ商品',
      count: kpiData.outOfStock,
      priority: kpiData.outOfStock > 0 ? 'urgent' as const : 'normal' as const,
      action: () => navigate('/admin/inventory'),
      buttonText: '在庫管理へ',
    },
    {
      id: 'low-stock',
      label: '在庫僅少',
      count: kpiData.lowStock,
      priority: 'important' as const,
      action: () => navigate('/admin/inventory'),
      buttonText: '在庫確認へ',
    },
    {
      id: 'unanswered-contacts',
      label: '未回答問い合わせ',
      count: contactStats.unanswered,
      priority: contactStats.unanswered > 0 ? 'urgent' as const : 'normal' as const,
      action: () => navigate('/admin/contacts'),
      buttonText: '問い合わせへ',
    },
    {
      id: 'low-reviews',
      label: '低評価レビュー',
      count: reviews.filter(r => r.rating <= 2).length,
      priority: 'normal' as const,
      action: () => navigate('/admin/reviews'),
      buttonText: 'レビュー確認へ',
    },
  ].filter(item => item.count > 0);

  // 人気商品ランキング
  const popularProducts = [...products]
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5);

  // 売上推移データ生成
  const generateSalesChartData = () => {
    const days = salesPeriod === '7days' ? 7 : salesPeriod === '30days' ? 30 : 90;
    const data: { date: string; sales: number; orders: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = getDaysAgo(i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySales = orders
        .filter(o => o.createdAt >= date && o.createdAt < nextDate && o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      const dayOrders = orders
        .filter(o => o.createdAt >= date && o.createdAt < nextDate && o.orderStatus !== 'cancelled')
        .length;

      const dateStr = days <= 7
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : days <= 30
          ? `${date.getMonth() + 1}/${date.getDate()}`
          : `${date.getMonth() + 1}月`;

      data.push({ date: dateStr, sales: daySales, orders: dayOrders });
    }

    if (salesPeriod === '3months') {
      const weeklyData: { date: string; sales: number; orders: number }[] = [];
      for (let i = 0; i < data.length; i += 7) {
        const weekData = data.slice(i, i + 7);
        const totalSales = weekData.reduce((sum, d) => sum + d.sales, 0);
        const totalOrders = weekData.reduce((sum, d) => sum + d.orders, 0);
        weeklyData.push({
          date: weekData[0]?.date || '',
          sales: totalSales,
          orders: totalOrders,
        });
      }
      return weeklyData;
    }

    return data;
  };

  const salesChartData = generateSalesChartData();

  // 最新レビュー
  const latestReviews = reviews.slice(0, 5).map(review => {
    const product = products.find(p => p.id === review.productId);
    return {
      ...review,
      productName: product?.name || '不明な商品',
    };
  });

  // カテゴリ別データ
  const categoryData = products.reduce((acc, p) => {
    const category = p.category || 'その他';
    if (!acc[category]) {
      acc[category] = { name: category, count: 0, stock: 0, value: 0 };
    }
    acc[category].count += 1;
    acc[category].stock += p.stock;
    acc[category].value += p.stock * p.price;
    return acc;
  }, {} as Record<string, { name: string; count: number; stock: number; value: number }>);

  const categoryChartData = Object.values(categoryData).sort((a, b) => b.count - a.count);

  // 在庫状況データ
  const stockStatusData = [
    { name: '正常', value: products.filter(p => p.stock > LOW_STOCK_THRESHOLD).length },
    { name: '僅少', value: products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length },
    { name: '在庫切れ', value: products.filter(p => p.stock === 0).length },
  ].filter(d => d.value > 0);

  // 在庫アラート商品
  const alertProducts = products
    .filter(p => p.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  // 最近更新された商品
  const recentlyUpdated = [...products]
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // 最近の注文
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  if (loading) {
    return <div className="admin-dashboard__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  // タブコンテンツ: 概要
  const renderOverviewTab = () => (
    <>
      {/* アクションアイテム */}
      {actionItems.length > 0 && (
        <div className="admin-dashboard__action-items">
          <h3>要対応タスク</h3>
          <div className="admin-dashboard__action-list">
            {actionItems.map(item => (
              <div
                key={item.id}
                className={`admin-dashboard__action-item admin-dashboard__action-item--${item.priority}`}
              >
                <div className="admin-dashboard__action-info">
                  <span className="admin-dashboard__action-label">{item.label}</span>
                  <span className="admin-dashboard__action-count">{item.count}件</span>
                </div>
                <button
                  className="admin-dashboard__action-btn"
                  onClick={item.action}
                >
                  {item.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 売上・注文KPIカード */}
      <div className="admin-dashboard__kpi">
        <div className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--sales ${todaySales > 0 ? 'has-items' : ''}`}>
          <h3>今日の売上</h3>
          <p className="admin-dashboard__kpi-value">¥{todaySales.toLocaleString()}</p>
          <span className="admin-dashboard__kpi-sub">
            注文数: {orders.filter(o => o.createdAt >= today && o.orderStatus !== 'cancelled').length}件
          </span>
        </div>
        <div className="admin-dashboard__kpi-card">
          <h3>今月の売上</h3>
          <p className="admin-dashboard__kpi-value">¥{thisMonthSales.toLocaleString()}</p>
          <span className="admin-dashboard__kpi-sub admin-dashboard__kpi-change">
            前月比: {monthOverMonthChange >= 0 ? '+' : ''}{monthOverMonthChange}%
            {monthOverMonthChange >= 0 ? ' ↑' : ' ↓'}
          </span>
        </div>
        <div className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--warning ${orderStats.pending > 0 ? 'has-items' : ''}`}>
          <h3>未処理注文</h3>
          <p className="admin-dashboard__kpi-value">{orderStats.pending}</p>
          <span className="admin-dashboard__kpi-sub">{orderStats.pending > 0 ? '要対応' : '問題なし'}</span>
        </div>
        <div className="admin-dashboard__kpi-card">
          <h3>発送待ち</h3>
          <p className="admin-dashboard__kpi-value">{orderStats.processing}</p>
          <span className="admin-dashboard__kpi-sub">確認済み・処理中</span>
        </div>
      </div>

      {/* 売上推移グラフ */}
      <div className="admin-dashboard__sales-chart">
        <div className="admin-dashboard__chart-card admin-dashboard__chart-card--full">
          <div className="admin-dashboard__chart-header">
            <h3>売上推移</h3>
            <div className="admin-dashboard__period-selector">
              <button
                className={salesPeriod === '7days' ? 'active' : ''}
                onClick={() => setSalesPeriod('7days')}
              >
                7日間
              </button>
              <button
                className={salesPeriod === '30days' ? 'active' : ''}
                onClick={() => setSalesPeriod('30days')}
              >
                30日間
              </button>
              <button
                className={salesPeriod === '3months' ? 'active' : ''}
                onClick={() => setSalesPeriod('3months')}
              >
                3ヶ月
              </button>
            </div>
          </div>
          <div className="admin-dashboard__chart" style={{ height: '300px' }}>
            {salesChartData.some(d => d.sales > 0 || d.orders > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number | string | Array<number | string> | undefined, name: string) => {
                      if (value === undefined) return '';
                      const numValue = typeof value === 'number' ? value : 0;
                      return name === '売上' ? `¥${numValue.toLocaleString()}` : `${numValue}件`;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#0066cc" name="売上" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" stroke="#66b3ff" name="注文数" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="admin-dashboard__no-data">この期間のデータがありません</p>
            )}
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="admin-dashboard__quick-actions">
        <h3>クイックアクション</h3>
        <div className="admin-dashboard__action-buttons">
          <button onClick={() => navigate('/admin/products')}>
            商品を追加・編集
          </button>
          <button onClick={() => navigate('/admin/inventory')}>
            在庫を更新
          </button>
          <button onClick={() => navigate('/admin/orders')}>
            注文を確認
          </button>
        </div>
      </div>
    </>
  );

  // タブコンテンツ: 在庫・商品
  const renderInventoryTab = () => (
    <>
      {/* 在庫KPIカード */}
      <div className="admin-dashboard__kpi">
        <div className="admin-dashboard__kpi-card">
          <h3>総商品数</h3>
          <p className="admin-dashboard__kpi-value">{kpiData.totalProducts}</p>
          <span className="admin-dashboard__kpi-sub">公開中: {kpiData.publishedProducts}</span>
        </div>
        <div className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--warning ${kpiData.outOfStock > 0 ? 'has-items' : ''}`}>
          <h3>在庫切れ</h3>
          <p className="admin-dashboard__kpi-value">{kpiData.outOfStock}</p>
          <span className="admin-dashboard__kpi-sub">{kpiData.outOfStock > 0 ? '要対応' : '問題なし'}</span>
        </div>
        <div className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--caution ${kpiData.lowStock > 0 ? 'has-items' : ''}`}>
          <h3>在庫僅少</h3>
          <p className="admin-dashboard__kpi-value">{kpiData.lowStock}</p>
          <span className="admin-dashboard__kpi-sub">{LOW_STOCK_THRESHOLD}個以下</span>
        </div>
        <div className="admin-dashboard__kpi-card">
          <h3>在庫総額</h3>
          <p className="admin-dashboard__kpi-value">¥{kpiData.totalStockValue.toLocaleString()}</p>
          <span className="admin-dashboard__kpi-sub">累計販売数: {kpiData.totalSold}</span>
        </div>
      </div>

      {/* グラフセクション */}
      <div className="admin-dashboard__charts">
        <div className="admin-dashboard__chart-card">
          <h3>カテゴリ別商品数</h3>
          <div className="admin-dashboard__chart admin-dashboard__chart--bar">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryChartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0066cc" name="商品数" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="admin-dashboard__no-data">データがありません</p>
            )}
          </div>
        </div>

        <div className="admin-dashboard__chart-card">
          <h3>在庫状況</h3>
          <div className="admin-dashboard__chart admin-dashboard__chart--pie">
            {stockStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === '在庫切れ' ? '#dc3545' :
                          entry.name === '僅少' ? '#ffc107' : '#0066cc'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string, entry: { payload?: { value?: number } }) => {
                      const data = entry.payload;
                      return `${value}: ${data?.value || 0}件`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="admin-dashboard__no-data">データがありません</p>
            )}
          </div>
        </div>
      </div>

      {/* リストセクション */}
      <div className="admin-dashboard__lists">
        {alertProducts.length > 0 && (
          <div className="admin-dashboard__list-card">
            <h3>在庫アラート</h3>
            <table className="admin-dashboard__table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>SKU</th>
                  <th>在庫</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {alertProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku || '-'}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`admin-dashboard__status ${product.stock === 0 ? 'admin-dashboard__status--out' : 'admin-dashboard__status--low'}`}>
                        {product.stock === 0 ? '在庫切れ' : '僅少'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="admin-dashboard__view-all"
              onClick={() => navigate('/admin/inventory')}
            >
              在庫管理で詳細を確認
            </button>
          </div>
        )}

        {popularProducts.length > 0 && (
          <div className="admin-dashboard__list-card admin-dashboard__list-card--full">
            <h3>人気商品ランキング</h3>
            <table className="admin-dashboard__table">
              <thead>
                <tr>
                  <th>順位</th>
                  <th>商品名</th>
                  <th>販売数</th>
                  <th>売上</th>
                </tr>
              </thead>
              <tbody>
                {popularProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>
                      <span className={`admin-dashboard__rank admin-dashboard__rank--${index + 1}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td>{product.name}</td>
                    <td>{product.sold || 0}個</td>
                    <td>¥{((product.sold || 0) * product.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="admin-dashboard__view-all"
              onClick={() => navigate('/admin/products')}
            >
              全商品を確認
            </button>
          </div>
        )}
      </div>

      {/* 最近の在庫変更・更新商品 */}
      <div className="admin-dashboard__lists">
        {recentHistory.length > 0 && (
          <div className="admin-dashboard__list-card">
            <h3>最近の在庫変更</h3>
            <table className="admin-dashboard__table">
              <thead>
                <tr>
                  <th>日時</th>
                  <th>商品名</th>
                  <th>操作</th>
                  <th>変更</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map(history => (
                  <tr key={history.id}>
                    <td>{new Date(history.createdAt).toLocaleDateString()}</td>
                    <td>{history.productName}</td>
                    <td>
                      {history.action === 'add' && '追加'}
                      {history.action === 'remove' && '削除'}
                      {history.action === 'adjust' && '調整'}
                      {history.action === 'sale' && '販売'}
                    </td>
                    <td>{history.previousStock} → {history.newStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {recentlyUpdated.length > 0 && (
          <div className="admin-dashboard__list-card admin-dashboard__list-card--full">
            <h3>最近更新された商品</h3>
            <table className="admin-dashboard__table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th>価格</th>
                  <th>在庫</th>
                </tr>
              </thead>
              <tbody>
                {recentlyUpdated.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>¥{product.price.toLocaleString()}</td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  // タブコンテンツ: 注文・顧客
  const renderOrdersTab = () => (
    <>
      {/* 注文・顧客KPIカード */}
      <div className="admin-dashboard__kpi">
        <div className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--warning ${orderStats.pending > 0 ? 'has-items' : ''}`}>
          <h3>未処理注文</h3>
          <p className="admin-dashboard__kpi-value">{orderStats.pending}</p>
          <span className="admin-dashboard__kpi-sub">{orderStats.pending > 0 ? '要対応' : '問題なし'}</span>
        </div>
        <div className="admin-dashboard__kpi-card">
          <h3>発送待ち</h3>
          <p className="admin-dashboard__kpi-value">{orderStats.processing}</p>
          <span className="admin-dashboard__kpi-sub">確認済み・処理中</span>
        </div>
        <div className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--warning ${contactStats.unanswered > 0 ? 'has-items' : ''}`}>
          <h3>未回答問い合わせ</h3>
          <p className="admin-dashboard__kpi-value">{contactStats.unanswered}</p>
          <span className="admin-dashboard__kpi-sub">{contactStats.unanswered > 0 ? '要対応' : '問題なし'}</span>
        </div>
        <div className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--caution ${contactStats.inProgress > 0 ? 'has-items' : ''}`}>
          <h3>対応中</h3>
          <p className="admin-dashboard__kpi-value">{contactStats.inProgress}</p>
          <span className="admin-dashboard__kpi-sub">問い合わせ対応中</span>
        </div>
      </div>

      {/* 問い合わせステータスカード */}
      <div className="admin-dashboard__contact-status">
        <div className="admin-dashboard__list-card admin-dashboard__list-card--full">
          <h3>問い合わせステータス</h3>
          <div className="admin-dashboard__status-cards">
            <div
              className={`admin-dashboard__status-card admin-dashboard__status-card--warning ${contactStats.unanswered > 0 ? 'clickable has-items' : ''}`}
              onClick={() => contactStats.unanswered > 0 && navigate('/admin/contacts?status=unanswered')}
            >
              <span className="admin-dashboard__status-label">未回答</span>
              <span className="admin-dashboard__status-value">{contactStats.unanswered}件</span>
            </div>
            <div
              className={`admin-dashboard__status-card admin-dashboard__status-card--caution ${contactStats.inProgress > 0 ? 'clickable has-items' : ''}`}
              onClick={() => contactStats.inProgress > 0 && navigate('/admin/contacts?status=in_progress')}
            >
              <span className="admin-dashboard__status-label">対応中</span>
              <span className="admin-dashboard__status-value">{contactStats.inProgress}件</span>
            </div>
            <div className={`admin-dashboard__status-card admin-dashboard__status-card--success ${contactStats.completedToday > 0 ? 'has-items' : ''}`}>
              <span className="admin-dashboard__status-label">今日完了</span>
              <span className="admin-dashboard__status-value">{contactStats.completedToday}件</span>
            </div>
          </div>
          <button
            className="admin-dashboard__view-all"
            onClick={() => navigate('/admin/contacts')}
          >
            問い合わせ管理へ
          </button>
        </div>
      </div>

      {/* 最近の注文 */}
      <div className="admin-dashboard__lists">
        <div className="admin-dashboard__list-card admin-dashboard__list-card--full">
          <h3>最近の注文</h3>
          {recentOrders.length > 0 ? (
            <>
              {/* テーブル表示（デスクトップ・タブレット用） */}
              <table className="admin-dashboard__table admin-dashboard__orders-table">
                <thead>
                  <tr>
                    <th>注文番号</th>
                    <th>日時</th>
                    <th>金額</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>¥{order.total.toLocaleString()}</td>
                      <td>
                        <span className={`admin-dashboard__order-status admin-dashboard__order-status--${order.orderStatus}`}>
                          {order.orderStatus === 'pending' && '未処理'}
                          {order.orderStatus === 'confirmed' && '確認済'}
                          {order.orderStatus === 'processing' && '処理中'}
                          {order.orderStatus === 'shipped' && '発送済'}
                          {order.orderStatus === 'delivered' && '配達完了'}
                          {order.orderStatus === 'cancelled' && 'キャンセル'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* カード表示（モバイル用） */}
              <div className="admin-dashboard__orders-cards">
                {recentOrders.map(order => (
                  <div key={order.id} className="admin-dashboard__order-card">
                    <div className="admin-dashboard__order-card-header">
                      <span className="admin-dashboard__order-card-number">{order.orderNumber}</span>
                      <span className={`admin-dashboard__order-status admin-dashboard__order-status--${order.orderStatus}`}>
                        {order.orderStatus === 'pending' && '未処理'}
                        {order.orderStatus === 'confirmed' && '確認済'}
                        {order.orderStatus === 'processing' && '処理中'}
                        {order.orderStatus === 'shipped' && '発送済'}
                        {order.orderStatus === 'delivered' && '配達完了'}
                        {order.orderStatus === 'cancelled' && 'キャンセル'}
                      </span>
                    </div>
                    <div className="admin-dashboard__order-card-body">
                      <div className="admin-dashboard__order-card-row">
                        <span className="admin-dashboard__order-card-label">日時</span>
                        <span className="admin-dashboard__order-card-value">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="admin-dashboard__order-card-row">
                        <span className="admin-dashboard__order-card-label">金額</span>
                        <span className="admin-dashboard__order-card-value admin-dashboard__order-card-value--price">¥{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="admin-dashboard__view-all"
                onClick={() => navigate('/admin/orders')}
              >
                注文管理へ
              </button>
            </>
          ) : (
            <p className="admin-dashboard__no-data">注文がありません</p>
          )}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="admin-dashboard__quick-actions">
        <h3>注文・顧客機能</h3>
        <div className="admin-dashboard__action-buttons">
          <button onClick={() => navigate('/admin/orders')}>
            注文管理
          </button>
          <button onClick={() => navigate('/admin/contacts')}>
            問い合わせ管理
          </button>
          <button onClick={() => navigate('/admin/customers')}>
            顧客管理
          </button>
        </div>
      </div>
    </>
  );

  // タブコンテンツ: 分析・レビュー
  const renderAnalyticsTab = () => (
    <>
      {/* 分析KPIカード */}
      <div className="admin-dashboard__kpi">
        <div className="admin-dashboard__kpi-card">
          <h3>今月の売上</h3>
          <p className="admin-dashboard__kpi-value">¥{thisMonthSales.toLocaleString()}</p>
          <span className="admin-dashboard__kpi-sub">
            前月比: {monthOverMonthChange >= 0 ? '+' : ''}{monthOverMonthChange}%
          </span>
        </div>
        <div className="admin-dashboard__kpi-card">
          <h3>総注文数</h3>
          <p className="admin-dashboard__kpi-value">{orders.filter(o => o.orderStatus !== 'cancelled').length}</p>
          <span className="admin-dashboard__kpi-sub">キャンセル除く</span>
        </div>
        <div className="admin-dashboard__kpi-card">
          <h3>総レビュー数</h3>
          <p className="admin-dashboard__kpi-value">{reviews.length}</p>
          <span className="admin-dashboard__kpi-sub">平均評価: ★{(reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0')}</span>
        </div>
        <div className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--warning ${reviews.filter(r => r.rating <= 2).length > 0 ? 'has-items' : ''}`}>
          <h3>低評価レビュー</h3>
          <p className="admin-dashboard__kpi-value">{reviews.filter(r => r.rating <= 2).length}</p>
          <span className="admin-dashboard__kpi-sub">★2以下</span>
        </div>
      </div>

      {/* レビュー一覧 */}
      <div className="admin-dashboard__lists">
        <div className="admin-dashboard__list-card admin-dashboard__list-card--full">
          <h3>最新レビュー</h3>
          {latestReviews.length > 0 ? (
            <>
              <div className="admin-dashboard__reviews">
                {latestReviews.map(review => (
                  <div
                    key={review.id}
                    className={`admin-dashboard__review ${review.rating <= 2 ? 'admin-dashboard__review--low' : ''}`}
                  >
                    <div className="admin-dashboard__review-header">
                      <span className="admin-dashboard__review-product">{review.productName}</span>
                      <span className="admin-dashboard__review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="admin-dashboard__review-comment">
                      {review.comment.length > 80 ? review.comment.substring(0, 80) + '...' : review.comment}
                    </p>
                    <div className="admin-dashboard__review-footer">
                      <span className="admin-dashboard__review-user">{review.userName}</span>
                      <span className="admin-dashboard__review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="admin-dashboard__view-all"
                onClick={() => navigate('/admin/reviews')}
              >
                レビュー管理へ
              </button>
            </>
          ) : (
            <p className="admin-dashboard__no-data">レビューがありません</p>
          )}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="admin-dashboard__quick-actions">
        <h3>分析・レビュー機能</h3>
        <div className="admin-dashboard__action-buttons admin-dashboard__analytics-buttons">
          <button onClick={() => navigate('/admin/analytics')}>
            詳細な売上分析
          </button>
          <button onClick={() => navigate('/admin/reviews')}>
            レビュー管理
          </button>
        </div>
      </div>
    </>
  );

  // タブコンテンツ: 設定
  const renderSettingsTab = () => (
    <>
      {/* 設定カテゴリ */}
      <div className="admin-dashboard__settings-grid">
        <div className="admin-dashboard__settings-card" onClick={() => navigate('/admin/settings')}>
          <h3>サイト設定</h3>
          <p>サイト名、ロゴ、基本情報の設定</p>
        </div>
        <div className="admin-dashboard__settings-card" onClick={() => navigate('/admin/settings')}>
          <h3>配送設定</h3>
          <p>配送方法、送料、配達地域の設定</p>
        </div>
        <div className="admin-dashboard__settings-card" onClick={() => navigate('/admin/settings')}>
          <h3>決済設定</h3>
          <p>決済方法、手数料の設定</p>
        </div>
        <div className="admin-dashboard__settings-card" onClick={() => navigate('/admin/settings')}>
          <h3>メール設定</h3>
          <p>自動送信メールのテンプレート設定</p>
        </div>
      </div>

      {/* 開発中のお知らせ */}
      <div className="admin-dashboard__quick-actions">
        <h3>開発中</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>システム設定機能は現在開発中です。</p>
        <div className="admin-dashboard__action-buttons admin-dashboard__settings-actions">
          <button onClick={() => navigate('/admin/settings')}>
            設定ページへ
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1>管理者ダッシュボード</h1>
        <div className="admin-dashboard__actions">
          <button onClick={() => navigate('/admin/products')}>商品管理</button>
          <button onClick={() => navigate('/admin/inventory')}>在庫管理</button>
          <button onClick={() => navigate('/admin/orders')}>注文管理</button>
          <button onClick={() => navigate('/admin/contacts')}>問い合わせ管理</button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="admin-dashboard__tabs">
        <button
          className={`admin-dashboard__tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概要
        </button>
        <button
          className={`admin-dashboard__tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          商品・在庫
        </button>
        <button
          className={`admin-dashboard__tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          注文・顧客
        </button>
        <button
          className={`admin-dashboard__tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          分析・レビュー
        </button>
        <button
          className={`admin-dashboard__tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          設定
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="admin-dashboard__tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'orders' && renderOrdersTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};
