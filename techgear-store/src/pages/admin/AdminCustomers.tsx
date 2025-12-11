import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import './AdminCommon.css';

export const AdminCustomers: React.FC = () => {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>顧客管理</h1>
        <Link to="/admin">
          <Button variant="outline">ダッシュボードに戻る</Button>
        </Link>
      </div>
      <div className="admin-page__content">
        <p>顧客管理機能は現在開発中です。</p>
        <p>ここでは顧客情報の確認、検索、連絡などが行えます。</p>
      </div>
    </div>
  );
};