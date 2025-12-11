import React, { useState } from 'react';
import { Button } from '../../atoms/Button';
import { TEST_CARDS, getStripeErrorMessage } from '../../../lib/stripe';
import './StripeCheckoutForm.css';

interface StripeCheckoutFormProps {
  onSubmit: (paymentData: any) => Promise<void>;
  loading?: boolean;
  amount: number;
}

export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  onSubmit,
  loading = false,
  amount
}) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // カード番号のフォーマット（4桁ごとにスペース）
    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
    }

    // 有効期限のフォーマット（MM/YY）
    if (name === 'cardExpiry') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d{0,2})/, '$1/$2')
        .substring(0, 5);
    }

    // CVCの制限（3-4桁）
    if (name === 'cardCvc') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateCard = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // カード番号の検証
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'カード番号を入力してください';
    } else if (cleanCardNumber.length !== 16) {
      newErrors.cardNumber = 'カード番号は16桁で入力してください';
    }

    // 有効期限の検証
    if (!cardData.cardExpiry) {
      newErrors.cardExpiry = '有効期限を入力してください';
    } else if (!cardData.cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.cardExpiry = '有効期限はMM/YY形式で入力してください';
    }

    // CVCの検証
    if (!cardData.cardCvc) {
      newErrors.cardCvc = 'セキュリティコードを入力してください';
    } else if (cardData.cardCvc.length < 3) {
      newErrors.cardCvc = 'セキュリティコードは3桁以上で入力してください';
    }

    // カード名義の検証
    if (!cardData.cardName) {
      newErrors.cardName = 'カード名義を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCard()) {
      return;
    }

    setProcessing(true);

    try {
      // デモ用の決済処理
      // 実際の実装では、ここでStripeの決済処理を行います
      await onSubmit({
        ...cardData,
        cardNumber: cardData.cardNumber.replace(/\s/g, '')
      });
      // 成功時はprocessingをfalseにしない（親コンポーネントで制御）
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrors({
        submit: error.message || getStripeErrorMessage(error)
      });
      setProcessing(false);
    }
  };

  return (
    <div className="stripe-checkout-form">
      <form onSubmit={handleSubmit}>
        {/* テストモード通知 */}
        <div className="stripe-checkout-form__test-mode">
          <div className="stripe-checkout-form__test-mode-badge">
            テストモード
          </div>
          <p className="stripe-checkout-form__test-mode-text">
            実際の決済は行われません。以下のテストカード番号をお使いください：
          </p>
          <div className="stripe-checkout-form__test-cards">
            <button
              type="button"
              className="stripe-checkout-form__test-card"
              onClick={() => setCardData(prev => ({
                ...prev,
                cardNumber: '4242 4242 4242 4242',
                cardExpiry: '12/34',
                cardCvc: '123',
                cardName: 'TEST USER'
              }))}
            >
              <span>成功するカード:</span>
              <code>4242 4242 4242 4242</code>
            </button>
          </div>
        </div>

        {/* カード情報入力フォーム */}
        <div className="stripe-checkout-form__field">
          <label htmlFor="cardNumber">カード番号</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={cardData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={errors.cardNumber ? 'error' : ''}
            disabled={processing || loading}
          />
          {errors.cardNumber && (
            <span className="stripe-checkout-form__error">{errors.cardNumber}</span>
          )}
        </div>

        <div className="stripe-checkout-form__row">
          <div className="stripe-checkout-form__field">
            <label htmlFor="cardExpiry">有効期限</label>
            <input
              type="text"
              id="cardExpiry"
              name="cardExpiry"
              value={cardData.cardExpiry}
              onChange={handleInputChange}
              placeholder="MM/YY"
              maxLength={5}
              className={errors.cardExpiry ? 'error' : ''}
              disabled={processing || loading}
            />
            {errors.cardExpiry && (
              <span className="stripe-checkout-form__error">{errors.cardExpiry}</span>
            )}
          </div>

          <div className="stripe-checkout-form__field">
            <label htmlFor="cardCvc">セキュリティコード</label>
            <input
              type="text"
              id="cardCvc"
              name="cardCvc"
              value={cardData.cardCvc}
              onChange={handleInputChange}
              placeholder="123"
              maxLength={4}
              className={errors.cardCvc ? 'error' : ''}
              disabled={processing || loading}
            />
            {errors.cardCvc && (
              <span className="stripe-checkout-form__error">{errors.cardCvc}</span>
            )}
          </div>
        </div>

        <div className="stripe-checkout-form__field">
          <label htmlFor="cardName">カード名義</label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={cardData.cardName}
            onChange={handleInputChange}
            placeholder="TARO YAMADA"
            className={errors.cardName ? 'error' : ''}
            disabled={processing || loading}
          />
          {errors.cardName && (
            <span className="stripe-checkout-form__error">{errors.cardName}</span>
          )}
        </div>

        {errors.submit && (
          <div className="stripe-checkout-form__submit-error">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          disabled={processing || loading}
        >
          {processing ? '処理中...' : `¥${amount.toLocaleString()} を支払う`}
        </Button>

        <div className="stripe-checkout-form__security">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>決済情報は安全に保護されています</span>
        </div>
      </form>
    </div>
  );
};