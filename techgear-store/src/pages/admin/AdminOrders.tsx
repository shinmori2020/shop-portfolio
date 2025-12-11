import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import './AdminCommon.css';

export const AdminOrders: React.FC = () => {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>注文管理</h1>
        <Link to="/admin">
          <Button variant="outline">ダッシュボードに戻る</Button>
        </Link>
      </div>
      <div className="admin-page__content">
        <p>注文管理機能は現在開発中です。</p>
        <p>ここでは注文の確認、ステータス更新、配送管理などが行えます。</p>
      </div>
    </div>
  );
};