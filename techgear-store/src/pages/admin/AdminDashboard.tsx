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

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentHistory, setRecentHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
      await Promise.all([loadProducts(), loadRecentHistory()]);
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

  // KPI計算
  const kpiData = {
    totalProducts: products.length,
    publishedProducts: products.filter(p => p.isPublished).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length,
    totalStockValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
    totalSold: products.reduce((sum, p) => sum + (p.sold || 0), 0),
  };

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

  if (loading) {
    return <div className="admin-dashboard__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1>管理者ダッシュボード</h1>
        <div className="admin-dashboard__actions">
          <button onClick={() => navigate('/admin/products')}>商品管理</button>
          <button onClick={() => navigate('/admin/inventory')}>在庫管理</button>
        </div>
      </div>

      {/* KPIカード */}
      <div className="admin-dashboard__kpi">
        <div className="admin-dashboard__kpi-card">
          <h3>総商品数</h3>
          <p className="admin-dashboard__kpi-value">{kpiData.totalProducts}</p>
          <span className="admin-dashboard__kpi-sub">公開中: {kpiData.publishedProducts}</span>
        </div>
        <div className="admin-dashboard__kpi-card admin-dashboard__kpi-card--warning">
          <h3>在庫切れ</h3>
          <p className="admin-dashboard__kpi-value">{kpiData.outOfStock}</p>
          <span className="admin-dashboard__kpi-sub">要対応</span>
        </div>
        <div className="admin-dashboard__kpi-card admin-dashboard__kpi-card--caution">
          <h3>在庫僅少</h3>
          <p className="admin-dashboard__kpi-value">{kpiData.lowStock}</p>
          <span className="admin-dashboard__kpi-sub">{LOW_STOCK_THRESHOLD}個以下</span>
        </div>
        <div className="admin-dashboard__kpi-card">
          <h3>在庫総額</h3>
          <p className="admin-dashboard__kpi-value">¥{kpiData.totalStockValue.toLocaleString()}</p>
          <span className="admin-dashboard__kpi-sub">総販売数: {kpiData.totalSold}</span>
        </div>
      </div>

      {/* グラフセクション */}
      <div className="admin-dashboard__charts">
        <div className="admin-dashboard__chart-card">
          <h3>カテゴリ別商品数</h3>
          <div className="admin-dashboard__chart">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
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
          <div className="admin-dashboard__chart">
            {stockStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
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
                  <Legend />
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
        <div className="admin-dashboard__list-card">
          <h3>在庫アラート</h3>
          {alertProducts.length > 0 ? (
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
          ) : (
            <p className="admin-dashboard__no-data">アラートはありません</p>
          )}
          {alertProducts.length > 0 && (
            <button
              className="admin-dashboard__view-all"
              onClick={() => navigate('/admin/inventory')}
            >
              在庫管理で詳細を確認
            </button>
          )}
        </div>

        <div className="admin-dashboard__list-card">
          <h3>最近の在庫変更</h3>
          {recentHistory.length > 0 ? (
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
          ) : (
            <p className="admin-dashboard__no-data">履歴がありません</p>
          )}
        </div>
      </div>

      {/* 最近更新された商品 */}
      <div className="admin-dashboard__recent">
        <div className="admin-dashboard__list-card admin-dashboard__list-card--full">
          <h3>最近更新された商品</h3>
          {recentlyUpdated.length > 0 ? (
            <table className="admin-dashboard__table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th>価格</th>
                  <th>在庫</th>
                  <th>更新日時</th>
                </tr>
              </thead>
              <tbody>
                {recentlyUpdated.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>¥{product.price.toLocaleString()}</td>
                    <td>{product.stock}</td>
                    <td>{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-dashboard__no-data">商品がありません</p>
          )}
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
        </div>
      </div>
    </div>
  );
};
