import React from 'react';
import { Link } from 'react-router-dom';
import './ContactSuccess.css';

export const ContactSuccess: React.FC = () => {
  return (
    <div className="contact-success">
      <div className="contact-success__container">
        <div className="contact-success__card">
          <div className="contact-success__icon">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="40" fill="#4CAF50" />
              <path
                d="M25 40L35 50L55 30"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="contact-success__title">
            お問い合わせを受け付けました
          </h1>

          <p className="contact-success__message">
            この度は、TechGear Storeにお問い合わせいただき、誠にありがとうございます。
          </p>

          <div className="contact-success__info">
            <p className="contact-success__info-text">
              ご入力いただいたメールアドレス宛に、確認メールを送信いたしました。
              <br />
              通常、1-2営業日以内に担当者よりご返信させていただきます。
            </p>
          </div>

          <div className="contact-success__note">
            <p className="contact-success__note-text">
              ※ 確認メールが届かない場合は、迷惑メールフォルダをご確認ください。
              <br />
              ※ 3営業日以内にご返信がない場合は、お手数ですが再度お問い合わせください。
            </p>
          </div>

          <div className="contact-success__actions">
            <Link to="/" className="contact-success__button contact-success__button--primary">
              ホームに戻る
            </Link>
            <Link to="/products" className="contact-success__button contact-success__button--secondary">
              商品一覧を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
