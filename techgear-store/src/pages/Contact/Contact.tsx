import React, { useState, FormEvent, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import emailjs from '@emailjs/browser';
import './Contact.css';

export const Contact: React.FC = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // フォーム参照を先に取得
    const form = e.currentTarget;

    if (!recaptchaRef.current) {
      setErrorMessage('reCAPTCHAが読み込まれていません。ページを再読み込みしてください。');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // reCAPTCHA v2 invisible - executeAsync()でトークンを取得
      const recaptchaToken = await recaptchaRef.current.executeAsync();
      if (!recaptchaToken) {
        setErrorMessage('reCAPTCHA認証に失敗しました。ページを再読み込みしてください。');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData(form);

      const templateParams = {
        name: formData.get('name') as string,
        company: formData.get('company') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        category: formData.get('category') as string,
        contactMethod: formData.get('contact-method') as string,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
        'g-recaptcha-response': recaptchaToken,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus('success');
      form.reset();
      // reCAPTCHAをリセット
      recaptchaRef.current?.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('送信に失敗しました。しばらく時間をおいて再度お試しください。');
      // reCAPTCHAをリセット
      recaptchaRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact">
      {/* ヘッダー */}
      <section className="contact__header">
        <div className="contact__container">
          <h1 className="contact__title">お問い合わせ</h1>
          <p className="contact__description">
            商品やサービスに関するご質問・ご相談は、こちらのフォームからお気軽にお問い合わせください。
            <br />
            通常、1-2営業日以内にご返信いたします。
          </p>
        </div>
      </section>

      {/* お問い合わせフォーム */}
      <section className="contact__form-section">
        <div className="contact__container">
          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="contact__form-row">
              <div className="contact__form-group">
                <label htmlFor="name" className="contact__form-label">お名前 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="contact__form-input"
                  required
                />
              </div>
              <div className="contact__form-group">
                <label htmlFor="company" className="contact__form-label">会社名・組織名</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="contact__form-input"
                />
              </div>
            </div>

            <div className="contact__form-row">
              <div className="contact__form-group">
                <label htmlFor="email" className="contact__form-label">メールアドレス *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="contact__form-input"
                  required
                />
              </div>
              <div className="contact__form-group">
                <label htmlFor="phone" className="contact__form-label">電話番号</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="contact__form-input"
                  placeholder="例: 03-1234-5678"
                />
              </div>
            </div>

            <div className="contact__form-group">
              <label htmlFor="address" className="contact__form-label">ご住所</label>
              <input
                type="text"
                id="address"
                name="address"
                className="contact__form-input"
                placeholder="例: 東京都渋谷区..."
              />
            </div>

            <div className="contact__form-row">
              <div className="contact__form-group">
                <label htmlFor="category" className="contact__form-label">お問い合わせ種別 *</label>
                <select
                  id="category"
                  name="category"
                  className="contact__form-select"
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
              <div className="contact__form-group">
                <label htmlFor="contact-method" className="contact__form-label">希望連絡方法 *</label>
                <select
                  id="contact-method"
                  name="contact-method"
                  className="contact__form-select"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="email">メール</option>
                  <option value="phone">電話</option>
                </select>
              </div>
            </div>

            <div className="contact__form-group">
              <label htmlFor="subject" className="contact__form-label">件名 *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="contact__form-input"
                required
              />
            </div>

            <div className="contact__form-group">
              <label htmlFor="message" className="contact__form-label">お問い合わせ内容 *</label>
              <textarea
                id="message"
                name="message"
                className="contact__form-textarea"
                rows={6}
                required
              ></textarea>
            </div>

            {submitStatus === 'success' && (
              <div className="contact__form-success">
                <p>✓ お問い合わせを送信しました。ご連絡ありがとうございます。</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="contact__form-error">
                <p>✗ {errorMessage}</p>
              </div>
            )}

            {/* reCAPTCHA v2 invisible */}
            <ReCAPTCHA
              ref={recaptchaRef}
              size="invisible"
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            />

            <button
              type="submit"
              className="contact__form-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
            <p className="contact__form-note">
              ※このフォームから実際にお問い合わせを送信できます。
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};
