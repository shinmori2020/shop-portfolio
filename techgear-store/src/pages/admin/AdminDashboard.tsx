import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, getDocs, doc, getDoc, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { StockAlert } from '../../components/organisms/StockAlert';
import './AdminDashboard.css';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      if (!user || !db) {
        navigate('/login');
        return;
      }

      try {
        // Check if user is admin by UID
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.log('User document not found');
          navigate('/');
          return;
        }

        const userData = userDocSnap.data();
        console.log('User data:', userData); // Debug log

        if (userData?.role !== 'admin') {
          console.log('User is not admin, role:', userData?.role);
          navigate('/');
          return;
        }

        setIsAdmin(true);

        // Load dashboard data
        await loadDashboardData();
      } catch (error) {
        console.error('Error loading admin dashboard:', error);
        navigate('/');
      }
    };

    checkAdminAndLoadData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    if (!db) return;

    try {
      setLoading(true);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get this month's date range
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Fetch all orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      // Calculate stats
      let totalRevenue = 0;
      let todayRevenue = 0;
      let monthlyRevenue = 0;
      let todayOrders = 0;
      let pendingOrders = 0;

      orders.forEach(order => {
        const orderAmount = order.totalAmount || 0;
        const orderDate = order.createdAt;

        totalRevenue += orderAmount;

        if (orderDate >= today && orderDate < tomorrow) {
          todayOrders++;
          todayRevenue += orderAmount;
        }

        if (orderDate >= monthStart) {
          monthlyRevenue += orderAmount;
        }

        if (order.status === 'pending') {
          pendingOrders++;
        }
      });

      // Get recent orders
      const recentOrdersData = orders
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          orderNumber: order.orderNumber || `ORD-${order.id.slice(0, 8)}`,
          customerName: order.shippingAddress?.fullName || 'Unknown',
          totalAmount: order.totalAmount || 0,
          status: order.status || 'pending',
          createdAt: order.createdAt,
        }));

      // Fetch customers count
      const customersSnapshot = await getDocs(collection(db, 'users'));
      const totalCustomers = customersSnapshot.size;

      // Fetch products count
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const totalProducts = productsSnapshot.size;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers,
        totalProducts,
        pendingOrders,
        todayOrders,
        todayRevenue,
        monthlyRevenue,
      });

      setRecentOrders(recentOrdersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      pending: 'admin-dashboard__badge--warning',
      processing: 'admin-dashboard__badge--info',
      shipped: 'admin-dashboard__badge--primary',
      delivered: 'admin-dashboard__badge--success',
      cancelled: 'admin-dashboard__badge--danger',
    };
    return `admin-dashboard__badge ${statusClasses[status] || ''}`;
  };

  const getStatusText = (status: string) => {
    const statusTexts: { [key: string]: string } = {
      pending: '保留中',
      processing: '処理中',
      shipped: '発送済み',
      delivered: '配達完了',
      cancelled: 'キャンセル',
    };
    return statusTexts[status] || status;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard__loading">読み込み中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleAlertClick = (product: any) => {
    navigate('/admin/inventory');
  };

  return (
    <div className="admin-dashboard">
      {/* 在庫アラート表示 */}
      <StockAlert
        threshold={5}
        onAlertClick={handleAlertClick}
      />
      <div className="admin-dashboard__header">
        <h1>管理者ダッシュボード</h1>
        <div className="admin-dashboard__header-actions">
          <Link to="/admin/products" className="admin-dashboard__link-button">
            商品管理
          </Link>
          <Link to="/admin/orders" className="admin-dashboard__link-button">
            注文管理
          </Link>
        </div>
      </div>

      <div className="admin-dashboard__stats">
        <div className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--orders">
            📦
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>総注文数</h3>
            <p className="admin-dashboard__stat-value">{stats.totalOrders}</p>
            <span className="admin-dashboard__stat-label">
              本日: {stats.todayOrders}件
            </span>
          </div>
        </div>

        <div className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--revenue">
            💴
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>総売上</h3>
            <p className="admin-dashboard__stat-value">
              ¥{stats.totalRevenue.toLocaleString()}
            </p>
            <span className="admin-dashboard__stat-label">
              本日: ¥{stats.todayRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--customers">
            👥
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>顧客数</h3>
            <p className="admin-dashboard__stat-value">{stats.totalCustomers}</p>
            <span className="admin-dashboard__stat-label">登録ユーザー</span>
          </div>
        </div>

        <div className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--products">
            📱
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>商品数</h3>
            <p className="admin-dashboard__stat-value">{stats.totalProducts}</p>
            <span className="admin-dashboard__stat-label">登録商品</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__insights">
        <div className="admin-dashboard__insight-card">
          <h3>月間売上</h3>
          <p className="admin-dashboard__insight-value">
            ¥{stats.monthlyRevenue.toLocaleString()}
          </p>
        </div>

        <div className="admin-dashboard__insight-card">
          <h3>保留中の注文</h3>
          <p className="admin-dashboard__insight-value admin-dashboard__insight-value--warning">
            {stats.pendingOrders}件
          </p>
        </div>
      </div>

      <div className="admin-dashboard__recent">
        <h2>最近の注文</h2>
        {recentOrders.length > 0 ? (
          <div className="admin-dashboard__table">
            <table>
              <thead>
                <tr>
                  <th>注文番号</th>
                  <th>顧客名</th>
                  <th>金額</th>
                  <th>ステータス</th>
                  <th>日時</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>¥{order.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={getStatusBadgeClass(order.status)}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>{order.createdAt.toLocaleDateString('ja-JP')}</td>
                    <td>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="admin-dashboard__action-link"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-dashboard__no-data">注文がまだありません</p>
        )}
      </div>

      <div className="admin-dashboard__quick-actions">
        <h2>クイックアクション</h2>
        <div className="admin-dashboard__actions-grid">
          <Link to="/admin/products/new" className="admin-dashboard__action-card">
            <span className="admin-dashboard__action-icon">➕</span>
            <span>新商品追加</span>
          </Link>
          <Link to="/admin/orders" className="admin-dashboard__action-card">
            <span className="admin-dashboard__action-icon">📋</span>
            <span>注文管理</span>
          </Link>
          <Link to="/admin/customers" className="admin-dashboard__action-card">
            <span className="admin-dashboard__action-icon">👤</span>
            <span>顧客管理</span>
          </Link>
          <Link to="/admin/analytics" className="admin-dashboard__action-card">
            <span className="admin-dashboard__action-icon">📊</span>
            <span>売上分析</span>
          </Link>
        </div>
      </div>
    </div>
  );
};