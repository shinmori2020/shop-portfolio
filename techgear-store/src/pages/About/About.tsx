import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeadphones,
  faClock,
  faVolumeHigh,
  faBatteryFull,
  faPlug,
  faKeyboard,
  faComputerMouse,
  faVideo,
  faTabletScreenButton,
  faLaptop,
  faBoxOpen,
  faMagnifyingGlass,
  faCreditCard,
  faMobileScreenButton
} from '@fortawesome/free-solid-svg-icons';
import './About.css';

export const About: React.FC = () => {
  const categories = [
    { name: 'ワイヤレスイヤホン', icon: faHeadphones },
    { name: 'スマートウォッチ', icon: faClock },
    { name: 'Bluetoothスピーカー', icon: faVolumeHigh },
    { name: 'モバイルバッテリー', icon: faBatteryFull },
    { name: 'ケーブル・アクセサリー', icon: faPlug },
    { name: 'ヘッドホン', icon: faHeadphones },
    { name: 'キーボード', icon: faKeyboard },
    { name: 'マウス', icon: faComputerMouse },
    { name: 'Webカメラ', icon: faVideo },
    { name: 'タブレット', icon: faTabletScreenButton },
    { name: 'ノートパソコン', icon: faLaptop },
  ];

  const features = [
    {
      title: '豊富な商品ラインナップ',
      description: '最新のテックガジェットから定番のアクセサリーまで、幅広い商品を取り揃えています。',
      icon: faBoxOpen,
    },
    {
      title: '高度な検索機能',
      description: 'カテゴリ、ブランド、価格帯、評価など、多様なフィルターで欲しい商品を素早く見つけられます。',
      icon: faMagnifyingGlass,
    },
    {
      title: 'スムーズな購入体験',
      description: 'Stripe決済統合により、安全で簡単なオンライン決済が可能です。',
      icon: faCreditCard,
    },
    {
      title: 'モバイル対応',
      description: 'スマートフォンやタブレットでも快適にショッピングを楽しめるレスポンシブデザイン。',
      icon: faMobileScreenButton,
    },
  ];

  return (
    <div className="about">
      {/* ヒーローセクション */}
      <section className="about__hero">
        <div className="about__hero-content">
          <h1 className="about__title">TECHGEAR STORE</h1>
          <p className="about__subtitle">最新テクノロジーガジェットの総合ストア</p>
        </div>
      </section>

      {/* 紹介セクション */}
      <section className="about__intro">
        <div className="about__container">
          <h2 className="about__section-title">TechGear Storeについて</h2>
          <p className="about__description">
            TechGear Storeは、最新のテクノロジーガジェットとアクセサリーを提供するオンラインストアです。
            日常生活をより快適に、より便利にするための製品を厳選し、お客様に最高のショッピング体験を提供します。
          </p>
          <p className="about__description">
            このサイトは、React + TypeScript + Firebaseを使用したモダンなECサイトのポートフォリオプロジェクトです。
            商品検索、フィルタリング、カート機能、Stripe決済統合など、実際のECサイトに必要な機能を実装しています。
          </p>
        </div>
      </section>

      {/* 取り扱いカテゴリ */}
      <section className="about__categories">
        <div className="about__container">
          <h2 className="about__section-title">取り扱い商品カテゴリ</h2>
          <div className="about__category-grid">
            {categories.map((category, index) => (
              <div key={index} className="about__category-card">
                <FontAwesomeIcon icon={category.icon} className="about__category-icon" />
                <span className="about__category-name">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サイトの特徴 */}
      <section className="about__features">
        <div className="about__container">
          <h2 className="about__section-title">サイトの特徴</h2>
          <div className="about__feature-grid">
            {features.map((feature, index) => (
              <div key={index} className="about__feature-card">
                <FontAwesomeIcon icon={feature.icon} className="about__feature-icon" />
                <h3 className="about__feature-title">{feature.title}</h3>
                <p className="about__feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技術スタック */}
      <section className="about__tech">
        <div className="about__container">
          <h2 className="about__section-title">使用技術</h2>
          <div className="about__tech-list">
            <div className="about__tech-item">
              <h4>フロントエンド</h4>
              <p>React, TypeScript, React Router</p>
            </div>
            <div className="about__tech-item">
              <h4>バックエンド</h4>
              <p>Firebase (Firestore, Authentication)</p>
            </div>
            <div className="about__tech-item">
              <h4>決済</h4>
              <p>Stripe</p>
            </div>
            <div className="about__tech-item">
              <h4>スタイリング</h4>
              <p>CSS3, レスポンシブデザイン</p>
            </div>
          </div>
        </div>
      </section>

      {/* お問い合わせ */}
      <section className="about__contact">
        <div className="about__container">
          <h2 className="about__section-title">お問い合わせ</h2>
          <form className="about__contact-form">
            <div className="about__form-row">
              <div className="about__form-group">
                <label htmlFor="name" className="about__form-label">お名前 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="about__form-input"
                  required
                />
              </div>
              <div className="about__form-group">
                <label htmlFor="company" className="about__form-label">会社名・組織名</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="about__form-input"
                />
              </div>
            </div>

            <div className="about__form-row">
              <div className="about__form-group">
                <label htmlFor="email" className="about__form-label">メールアドレス *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="about__form-input"
                  required
                />
              </div>
              <div className="about__form-group">
                <label htmlFor="phone" className="about__form-label">電話番号</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="about__form-input"
                  placeholder="例: 03-1234-5678"
                />
              </div>
            </div>

            <div className="about__form-group">
              <label htmlFor="address" className="about__form-label">ご住所</label>
              <input
                type="text"
                id="address"
                name="address"
                className="about__form-input"
                placeholder="例: 東京都渋谷区..."
              />
            </div>

            <div className="about__form-row">
              <div className="about__form-group">
                <label htmlFor="category" className="about__form-label">お問い合わせ種別 *</label>
                <select
                  id="category"
                  name="category"
                  className="about__form-select"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="product">商品について</option>
                  <option value="shipping">配送について</option>
                  <option value="return">返品・交換について</option>
                  <option value="payment">お支払いについて</option>
                  <option value="account">アカウントについて</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div className="about__form-group">
                <label htmlFor="contact-method" className="about__form-label">希望連絡方法 *</label>
                <select
                  id="contact-method"
                  name="contact-method"
                  className="about__form-select"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="email">メール</option>
                  <option value="phone">電話</option>
                </select>
              </div>
            </div>

            <div className="about__form-group">
              <label htmlFor="subject" className="about__form-label">件名 *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="about__form-input"
                required
              />
            </div>

            <div className="about__form-group">
              <label htmlFor="message" className="about__form-label">お問い合わせ内容 *</label>
              <textarea
                id="message"
                name="message"
                className="about__form-textarea"
                rows={6}
                required
              ></textarea>
            </div>

            <button type="submit" className="about__form-submit">送信する</button>
            <p className="about__contact-note">
              ※このサイトはポートフォリオプロジェクトです。実際のフォーム送信は行われません。
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};
