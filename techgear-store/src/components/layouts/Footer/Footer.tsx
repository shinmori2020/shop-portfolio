import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* 会社情報 */}
          <div className="footer__section">
            <h3 className="footer__title">TechGear Store</h3>
            <p className="footer__description">
              最新のテクノロジーアクセサリーを<br />
              お手頃価格でお届けします
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Twitter">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Facebook">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Instagram">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* ショップ情報 */}
          <div className="footer__section">
            <h4 className="footer__section-title">ショップ</h4>
            <ul className="footer__links">
              <li>
                <Link to="/products" className="footer__link">商品一覧</Link>
              </li>
              <li>
                <Link to="/categories" className="footer__link">カテゴリー</Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="footer__link">新着商品</Link>
              </li>
              <li>
                <Link to="/sale" className="footer__link">セール</Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div className="footer__section">
            <h4 className="footer__section-title">サポート</h4>
            <ul className="footer__links">
              <li>
                <Link to="/help" className="footer__link">ヘルプ</Link>
              </li>
              <li>
                <Link to="/contact" className="footer__link">お問い合わせ</Link>
              </li>
              <li>
                <Link to="/shipping" className="footer__link">配送について</Link>
              </li>
              <li>
                <Link to="/returns" className="footer__link">返品・交換</Link>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div className="footer__section">
            <h4 className="footer__section-title">法的情報</h4>
            <ul className="footer__links">
              <li>
                <Link to="/privacy" className="footer__link">プライバシーポリシー</Link>
              </li>
              <li>
                <Link to="/terms" className="footer__link">利用規約</Link>
              </li>
              <li>
                <Link to="/commercial-law" className="footer__link">特定商取引法</Link>
              </li>
              <li>
                <Link to="/about" className="footer__link">会社概要</Link>
              </li>
              <li>
                <Link to="/contact" className="footer__link">お問い合わせ</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__divider"></div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} TechGear Store. All rights reserved.
          </p>
          <div className="footer__payment">
            <span className="footer__payment-text">お支払い方法:</span>
            <div className="footer__payment-icons">
              <span className="footer__payment-icon">💳</span>
              <span className="footer__payment-icon">🏦</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
