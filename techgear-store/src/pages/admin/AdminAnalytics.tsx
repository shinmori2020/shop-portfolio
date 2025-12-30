import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminAnalytics.css';

export const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isAdminUser = user.email?.includes('admin') || user.email === 'test@example.com';
    setIsAdmin(isAdminUser);

    if (!isAdminUser) {
      navigate('/');
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="admin-analytics__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-analytics">
      <div className="admin-analytics__header">
        <h1>売上分析</h1>
        <div className="admin-analytics__actions">
          <div className="admin-analytics__nav">
            <button onClick={() => navigate('/admin')}>ダッシュボード</button>
            <button onClick={() => navigate('/admin/products')}>商品管理</button>
            <button onClick={() => navigate('/admin/inventory')}>在庫管理</button>
            <button onClick={() => navigate('/admin/orders')}>注文管理</button>
            <button onClick={() => navigate('/admin/contacts')}>問い合わせ管理</button>
          </div>
        </div>
      </div>

      {/* サマリー */}
      <div className="admin-analytics__summary">
        <div className="admin-analytics__summary-card">
          <span className="admin-analytics__summary-label">今月の売上</span>
          <span className="admin-analytics__summary-value">¥0</span>
        </div>
        <div className="admin-analytics__summary-card">
          <span className="admin-analytics__summary-label">先月比</span>
          <span className="admin-analytics__summary-value">-</span>
        </div>
        <div className="admin-analytics__summary-card">
          <span className="admin-analytics__summary-label">注文数</span>
          <span className="admin-analytics__summary-value">0</span>
        </div>
        <div className="admin-analytics__summary-card">
          <span className="admin-analytics__summary-label">平均注文額</span>
          <span className="admin-analytics__summary-value">¥0</span>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="admin-analytics__content">
        <div className="admin-analytics__notice">
          <h3>開発中</h3>
          <p>売上分析機能は現在開発中です。</p>
          <p>ここでは売上トレンド、商品別売上、顧客分析などが確認できます。</p>
          <div className="admin-analytics__action-buttons">
            <button onClick={() => navigate('/admin')}>ダッシュボードで概要を確認</button>
            <button onClick={() => navigate('/admin/orders')}>注文一覧を確認</button>
          </div>
        </div>
      </div>
    </div>
  );
};
