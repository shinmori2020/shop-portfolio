// Stripeの公開可能キー（テスト用）
// 本番環境では環境変数から読み込むようにしてください
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo';

// Stripeインスタンスを作成（テストモードでは実際には使用しない）
// 本番環境で実際のStripeを使用する場合はコメントを外してください
// import { loadStripe } from '@stripe/stripe-js';
// export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// テストモード用のダミーPromise
export const stripePromise = Promise.resolve(null);

// 支払い意図（Payment Intent）を作成する関数
// 注意：実際の本番環境では、Payment Intentの作成はバックエンドで行う必要があります
export const createPaymentIntent = async (amount: number) => {
  // Firebase Functionsなどのバックエンドエンドポイントを呼び出す
  // ここではデモ用にクライアント側で処理していますが、
  // 実際にはサーバー側でStripeのSecret APIキーを使用して作成する必要があります

  // デモ用：仮のclientSecretを返す
  // 実際の実装では、バックエンドAPIを呼び出してclientSecretを取得します
  return {
    clientSecret: 'pi_demo_secret_' + Math.random().toString(36).substring(7)
  };
};

// テスト用カード番号
export const TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  requiresAuthentication: '4000002500003155'
};

// Stripeエラーメッセージの日本語化
export const getStripeErrorMessage = (error: any): string => {
  if (!error) return '決済処理中にエラーが発生しました';

  switch (error.code) {
    case 'card_declined':
      return 'カードが拒否されました。別のカードをお試しください。';
    case 'expired_card':
      return 'カードの有効期限が切れています。';
    case 'incorrect_cvc':
      return 'セキュリティコードが正しくありません。';
    case 'processing_error':
      return '決済処理中にエラーが発生しました。もう一度お試しください。';
    case 'incorrect_number':
      return 'カード番号が正しくありません。';
    default:
      return error.message || '決済処理中にエラーが発生しました。';
  }
};