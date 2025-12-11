import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import './AdminCommon.css';

export const AdminSettings: React.FC = () => {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>設定</h1>
        <Link to="/admin">
          <Button variant="outline">ダッシュボードに戻る</Button>
        </Link>
      </div>
      <div className="admin-page__content">
        <p>システム設定機能は現在開発中です。</p>
        <p>ここではサイト設定、配送設定、決済設定などが管理できます。</p>
      </div>
    </div>
  );
};