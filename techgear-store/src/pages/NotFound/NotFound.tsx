import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="notfound">
      <div className="notfound__container">
        <div className="notfound__content">
          <h1 className="notfound__code">404</h1>
          <h2 className="notfound__title">ページが見つかりません</h2>
          <p className="notfound__message">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>

          <div className="notfound__actions">
            <button
              onClick={handleGoHome}
              className="notfound__button notfound__button--primary"
            >
              ホームに戻る
            </button>
            <button
              onClick={handleGoBack}
              className="notfound__button notfound__button--secondary"
            >
              前のページに戻る
            </button>
          </div>

          <div className="notfound__links">
            <h3 className="notfound__links-title">お探しのページはこちらですか？</h3>
            <ul className="notfound__links-list">
              <li><a href="/products">商品一覧</a></li>
              <li><a href="/categories">カテゴリ一覧</a></li>
              <li><a href="/cart">カート</a></li>
              <li><a href="/about">TechGear Storeについて</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
