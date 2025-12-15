import React from 'react';
import './CommercialTransaction.css';

export const CommercialTransaction: React.FC = () => {
  return (
    <div className="commercial">
      <div className="commercial__container">
        <h1 className="commercial__title">特定商取引法に基づく表記</h1>

        <div className="commercial__notice">
          <p>※本サイトはポートフォリオプロジェクトです。以下の情報は架空のものです。</p>
        </div>

        <div className="commercial__table">
          <div className="commercial__row">
            <div className="commercial__label">販売業者</div>
            <div className="commercial__value">TechGear Store</div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">運営責任者</div>
            <div className="commercial__value">山田 太郎</div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">所在地</div>
            <div className="commercial__value">
              〒150-0001<br />
              東京都渋谷区神宮前1-2-3 テックビル5F
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">電話番号</div>
            <div className="commercial__value">03-1234-5678</div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">メールアドレス</div>
            <div className="commercial__value">info@techgearstore.com</div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">営業時間</div>
            <div className="commercial__value">
              平日 9:00 - 18:00<br />
              （土日祝日は休業）
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">商品代金以外の必要料金</div>
            <div className="commercial__value">
              消費税、配送料、決済手数料（一部決済方法）
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">お支払い方法</div>
            <div className="commercial__value">
              ・クレジットカード（Visa、Mastercard、American Express、JCB）<br />
              ・コンビニ決済<br />
              ・銀行振込
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">お支払い期限</div>
            <div className="commercial__value">
              ・クレジットカード：ご注文時にお支払い確定<br />
              ・コンビニ決済：ご注文後3日以内<br />
              ・銀行振込：ご注文後3営業日以内
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">商品の引渡し時期</div>
            <div className="commercial__value">
              ご注文確定後、通常3～7営業日以内に発送いたします。<br />
              （在庫状況や配送地域により異なる場合があります）
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">返品・交換について</div>
            <div className="commercial__value">
              <strong>【不良品・誤配送の場合】</strong><br />
              商品到着後7日以内にご連絡ください。送料は当社負担で交換・返品を承ります。<br />
              <br />
              <strong>【お客様都合の場合】</strong><br />
              未開封の商品に限り、商品到着後7日以内であれば返品可能です。<br />
              返送料はお客様負担となります。<br />
              <br />
              <strong>【返品不可の場合】</strong><br />
              ・商品到着後8日以上経過した場合<br />
              ・開封済みまたは使用済みの場合<br />
              ・お客様の責任により傷や汚れが生じた場合<br />
              ・セール品、アウトレット品
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">配送料</div>
            <div className="commercial__value">
              全国一律 800円（税込）<br />
              10,000円以上のご購入で送料無料
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">配送業者</div>
            <div className="commercial__value">
              ヤマト運輸、佐川急便、日本郵便のいずれか<br />
              （配送業者のご指定は承れません）
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">キャンセルについて</div>
            <div className="commercial__value">
              商品発送前であればキャンセル可能です。<br />
              お問い合わせフォームよりご連絡ください。<br />
              商品発送後のキャンセルは、返品の扱いとなります。
            </div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">屋号またはサービス名</div>
            <div className="commercial__value">TechGear Store</div>
          </div>

          <div className="commercial__row">
            <div className="commercial__label">ホームページURL</div>
            <div className="commercial__value">https://techgearstore.com</div>
          </div>
        </div>

        <section className="commercial__section">
          <h2 className="commercial__section-title">お問い合わせ先</h2>
          <p className="commercial__text">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <div className="commercial__contact">
            <p><strong>Email:</strong> support@techgearstore.com</p>
            <p><strong>電話:</strong> 03-1234-5678（平日 9:00 - 18:00）</p>
          </div>
        </section>
      </div>
    </div>
  );
};
