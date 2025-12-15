import React from 'react';
import './Privacy.css';

export const Privacy: React.FC = () => {
  return (
    <div className="privacy">
      <div className="privacy__container">
        <h1 className="privacy__title">プライバシーポリシー</h1>
        <p className="privacy__updated">最終更新日: 2025年12月15日</p>

        <div className="privacy__notice">
          <p>※本サイトはポートフォリオプロジェクトです。実際のサービス提供・データ収集は行っておりません。以下の内容は参考例です。</p>
        </div>

        <section className="privacy__section">
          <h2 className="privacy__section-title">1. 基本方針</h2>
          <p className="privacy__text">
            TechGear Store（以下「当社」）は、お客様の個人に関する情報（以下「個人情報」）を適切に保護することを社会的責務と考え、以下の方針に基づき個人情報の保護に努めます。
          </p>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">2. 収集する情報</h2>
          <p className="privacy__text">当社は、以下の情報を収集する場合があります：</p>
          <ul className="privacy__list">
            <li>氏名、メールアドレス、電話番号、住所などの連絡先情報</li>
            <li>お支払い情報（クレジットカード情報は決済代行会社が管理）</li>
            <li>購入履歴、閲覧履歴などの利用情報</li>
            <li>デバイス情報、IPアドレス、ブラウザ情報</li>
          </ul>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">3. 利用目的</h2>
          <p className="privacy__text">収集した個人情報は、以下の目的で利用します：</p>
          <ul className="privacy__list">
            <li>商品の配送、サービスの提供</li>
            <li>お問い合わせへの対応</li>
            <li>新商品やキャンペーン情報のご案内</li>
            <li>サービスの改善および新サービスの開発</li>
            <li>利用規約違反への対応</li>
          </ul>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">4. 第三者提供</h2>
          <p className="privacy__text">
            当社は、以下の場合を除き、お客様の同意なく個人情報を第三者に提供することはありません：
          </p>
          <ul className="privacy__list">
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
          </ul>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">5. 安全管理措置</h2>
          <p className="privacy__text">
            当社は、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のため、必要かつ適切な措置を講じます。
          </p>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">6. Cookie（クッキー）について</h2>
          <p className="privacy__text">
            当サイトでは、サービスの利便性向上のためCookieを使用する場合があります。Cookieとは、ウェブサイトがお客様のコンピュータに保存する小さなテキストファイルです。
          </p>
          <p className="privacy__text">
            お客様はブラウザの設定によりCookieの受け取りを拒否することができますが、その場合、一部のサービスがご利用いただけない場合があります。
          </p>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">7. アクセス解析ツール</h2>
          <p className="privacy__text">
            当サイトでは、Google Analyticsを使用してアクセス解析を行っています。このサービスはトラフィックデータの収集のためにCookieを使用しています。
          </p>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">8. 個人情報の開示・訂正・削除</h2>
          <p className="privacy__text">
            お客様は、当社が保有する自己の個人情報について、開示、訂正、削除を求めることができます。お問い合わせフォームよりご連絡ください。
          </p>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">9. お問い合わせ</h2>
          <p className="privacy__text">
            本プライバシーポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
          </p>
          <div className="privacy__contact">
            <p>Email: privacy@techgearstore.com</p>
          </div>
        </section>

        <section className="privacy__section">
          <h2 className="privacy__section-title">10. プライバシーポリシーの変更</h2>
          <p className="privacy__text">
            当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <section className="privacy__section">
          <p className="privacy__end">以上</p>
        </section>
      </div>
    </div>
  );
};
