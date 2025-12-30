import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import './AdminCustomers.css';

interface Customer {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  orderCount?: number;
  totalSpent?: number;
}

export const AdminCustomers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      await loadCustomers();
    } else {
      navigate('/');
    }
  };

  const loadCustomers = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      // TODO: 実際の顧客データを取得する実装
      // 仮のデータ
      setCustomers([]);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div className="admin-customers__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-customers">
      <div className="admin-customers__header">
        <h1>顧客管理</h1>
        <div className="admin-customers__actions">
          <div className="admin-customers__nav">
            <button onClick={() => navigate('/admin')}>ダッシュボード</button>
            <button onClick={() => navigate('/admin/products')}>商品管理</button>
            <button onClick={() => navigate('/admin/inventory')}>在庫管理</button>
            <button onClick={() => navigate('/admin/orders')}>注文管理</button>
            <button onClick={() => navigate('/admin/contacts')}>問い合わせ管理</button>
          </div>
          <div className="admin-customers__divider" />
          <div className="admin-customers__page-actions">
            <button onClick={loadCustomers}>更新</button>
          </div>
        </div>
      </div>

      {/* サマリー */}
      <div className="admin-customers__summary">
        <div className="admin-customers__summary-card">
          <span className="admin-customers__summary-label">総顧客数</span>
          <span className="admin-customers__summary-value">{customers.length}</span>
        </div>
        <div className="admin-customers__summary-card">
          <span className="admin-customers__summary-label">今月の新規</span>
          <span className="admin-customers__summary-value">0</span>
        </div>
        <div className="admin-customers__summary-card">
          <span className="admin-customers__summary-label">アクティブ</span>
          <span className="admin-customers__summary-value">0</span>
        </div>
      </div>

      {/* 検索 */}
      <div className="admin-customers__filters">
        <input
          type="text"
          placeholder="メールアドレス、名前で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-customers__search"
        />
      </div>

      {/* 顧客一覧 */}
      <div className="admin-customers__content">
        <div className="admin-customers__notice">
          <h3>開発中</h3>
          <p>顧客管理機能は現在開発中です。</p>
          <p>ここでは顧客情報の確認、検索、連絡などが行えます。</p>
          <div className="admin-customers__action-buttons">
            <button onClick={() => navigate('/admin/orders')}>注文履歴を確認</button>
            <button onClick={() => navigate('/admin/contacts')}>問い合わせを確認</button>
          </div>
        </div>
      </div>
    </div>
  );
};
