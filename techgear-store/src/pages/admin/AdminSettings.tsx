import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminSettings.css';

export const AdminSettings: React.FC = () => {
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
    return <div className="admin-settings__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings__header">
        <h1>設定</h1>
        <div className="admin-settings__actions">
          <div className="admin-settings__nav">
            <button onClick={() => navigate('/admin')}>ダッシュボード</button>
            <button onClick={() => navigate('/admin/products')}>商品管理</button>
            <button onClick={() => navigate('/admin/inventory')}>在庫管理</button>
            <button onClick={() => navigate('/admin/orders')}>注文管理</button>
            <button onClick={() => navigate('/admin/contacts')}>問い合わせ管理</button>
          </div>
        </div>
      </div>

      {/* 設定カテゴリ */}
      <div className="admin-settings__categories">
        <div className="admin-settings__category-card">
          <h3>サイト設定</h3>
          <p>サイト名、ロゴ、基本情報の設定</p>
        </div>
        <div className="admin-settings__category-card">
          <h3>配送設定</h3>
          <p>配送方法、送料、配達地域の設定</p>
        </div>
        <div className="admin-settings__category-card">
          <h3>決済設定</h3>
          <p>決済方法、手数料の設定</p>
        </div>
        <div className="admin-settings__category-card">
          <h3>メール設定</h3>
          <p>自動送信メールのテンプレート設定</p>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="admin-settings__content">
        <div className="admin-settings__notice">
          <h3>開発中</h3>
          <p>システム設定機能は現在開発中です。</p>
          <p>ここではサイト設定、配送設定、決済設定などが管理できます。</p>
          <div className="admin-settings__action-buttons">
            <button onClick={() => navigate('/admin')}>ダッシュボードに戻る</button>
            <button onClick={() => navigate('/admin/products')}>商品管理へ</button>
          </div>
        </div>
      </div>
    </div>
  );
};
