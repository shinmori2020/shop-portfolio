import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import './AdminCommon.css';

export const AdminAnalytics: React.FC = () => {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>売上分析</h1>
        <Link to="/admin">
          <Button variant="outline">ダッシュボードに戻る</Button>
        </Link>
      </div>
      <div className="admin-page__content">
        <p>売上分析機能は現在開発中です。</p>
        <p>ここでは売上トレンド、商品別売上、顧客分析などが確認できます。</p>
      </div>
    </div>
  );
};