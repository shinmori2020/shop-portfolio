import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import './OrderComplete.css';

export const OrderComplete: React.FC = () => {
  return (
    <div className="order-complete">
      <div className="order-complete__container">
        <div className="order-complete__icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h1 className="order-complete__title">ご注文ありがとうございます！</h1>
        <p className="order-complete__message">
          ご注文が正常に完了しました。<br />
          ご登録のメールアドレスに確認メールを送信しました。
        </p>

        <div className="order-complete__info">
          <div className="order-complete__info-item">
            <span className="order-complete__info-label">注文番号</span>
            <span className="order-complete__info-value">
              #{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </span>
          </div>
          <div className="order-complete__info-item">
            <span className="order-complete__info-label">注文日時</span>
            <span className="order-complete__info-value">
              {new Date().toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="order-complete__next-steps">
          <h2 className="order-complete__next-steps-title">次のステップ</h2>
          <ul className="order-complete__next-steps-list">
            <li>確認メールをご確認ください</li>
            <li>商品は3〜5営業日以内に発送されます</li>
            <li>発送完了後、追跡番号をメールでお知らせします</li>
            <li>マイページから注文履歴を確認できます</li>
          </ul>
        </div>

        <div className="order-complete__actions">
          <Link to="/orders">
            <Button variant="primary" size="large">
              注文履歴を見る
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" size="large">
              買い物を続ける
            </Button>
          </Link>
        </div>

        <div className="order-complete__help">
          <p>
            ご不明な点がございましたら、
            <Link to="/contact" className="order-complete__help-link">
              お問い合わせ
            </Link>
            ください。
          </p>
        </div>
      </div>
    </div>
  );
};
