import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../atoms/Button';
import { useCartStore } from '../../../store/useCartStore';
import { useAuth } from '../../../contexts/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { currentUser, logout } = useAuth();
  const cartItemsCount = getTotalItems();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 管理者判定
  const isAdmin = currentUser?.email?.includes('admin') || currentUser?.email === 'test@example.com';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setShowUserMenu(false);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__content">
          <Link to="/" className="header__logo">
            <h1>TechGear Store</h1>
          </Link>

          <div className="header__right">
            <nav className="header__nav">
              <Link to="/products" className="header__nav-link">
                商品一覧
              </Link>
              <Link to="/categories" className="header__nav-link">
                カテゴリー
              </Link>
              <Link to="/about" className="header__nav-link">
                About
              </Link>
              <Link to="/contact" className="header__nav-link">
                お問い合わせ
              </Link>
            </nav>

            <div className="header__actions">
              {/* ハンバーガーメニューボタン */}
              <button
                className="header__menu-button"
                onClick={toggleMobileMenu}
                aria-label="メニュー"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/cart" className="header__cart">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  width="24"
                  height="24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="header__cart-badge">{cartItemsCount}</span>
                )}
              </Link>

              {currentUser ? (
                <div className="header__user">
                  <button
                    className="header__user-button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="header__user-avatar">
                      {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </div>
                    <span className="header__user-name">
                      {currentUser.displayName || 'ユーザー'}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="header__user-menu">
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="header__user-menu-item header__user-menu-item--admin"
                            onClick={() => setShowUserMenu(false)}
                          >
                            ダッシュボード
                          </Link>
                          <Link
                            to="/admin/products"
                            className="header__user-menu-item header__user-menu-item--admin"
                            onClick={() => setShowUserMenu(false)}
                          >
                            商品管理
                          </Link>
                          <Link
                            to="/admin/inventory"
                            className="header__user-menu-item header__user-menu-item--admin"
                            onClick={() => setShowUserMenu(false)}
                          >
                            在庫管理
                          </Link>
                          <div className="header__user-menu-divider"></div>
                        </>
                      )}
                      <Link
                        to="/account"
                        className="header__user-menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        マイページ
                      </Link>
                      <Link
                        to="/orders"
                        className="header__user-menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        注文履歴
                      </Link>
                      <button
                        className="header__user-menu-item"
                        onClick={handleLogout}
                      >
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <Button size="small" variant="outline">
                    ログイン
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className={`header__mobile-menu ${showMobileMenu ? 'header__mobile-menu--open' : ''}`}>
        <ul className="header__mobile-nav">
          <li className="header__mobile-nav-item">
            <Link
              to="/products"
              className="header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              商品一覧
            </Link>
          </li>
          <li className="header__mobile-nav-item">
            <Link
              to="/categories"
              className="header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              カテゴリー
            </Link>
          </li>
          <li className="header__mobile-nav-item">
            <Link
              to="/about"
              className="header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              About
            </Link>
          </li>
          <li className="header__mobile-nav-item">
            <Link
              to="/contact"
              className="header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              お問い合わせ
            </Link>
          </li>
        </ul>

        <div className="header__mobile-actions">
          {currentUser ? (
            <>
              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="header__mobile-nav-link header__mobile-nav-link--admin"
                    onClick={closeMobileMenu}
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    to="/admin/products"
                    className="header__mobile-nav-link header__mobile-nav-link--admin"
                    onClick={closeMobileMenu}
                  >
                    商品管理
                  </Link>
                  <Link
                    to="/admin/inventory"
                    className="header__mobile-nav-link header__mobile-nav-link--admin"
                    onClick={closeMobileMenu}
                  >
                    在庫管理
                  </Link>
                  <hr className="header__mobile-divider" />
                </>
              )}
              <Link
                to="/account"
                className="header__mobile-nav-link"
                onClick={closeMobileMenu}
              >
                マイページ
              </Link>
              <Link
                to="/orders"
                className="header__mobile-nav-link"
                onClick={closeMobileMenu}
              >
                注文履歴
              </Link>
              <button
                className="header__mobile-nav-link"
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMobileMenu}>
              <Button size="medium" variant="primary">
                ログイン
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
