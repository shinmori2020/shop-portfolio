import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import emailjs from '@emailjs/browser';
import './Contact.css';

// レート制限の設定
const RATE_LIMIT_MAX = 3; // 1時間以内の最大送信回数
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1時間（ミリ秒）
const STORAGE_KEY = 'contact_submissions';

// 自動保存の設定
const DRAFT_STORAGE_KEY = 'contact_form_draft';
const AUTOSAVE_DELAY = 500; // 500ms後に保存（デバウンス）

// 禁止ワードリスト（スパムフィルタ）
const SPAM_KEYWORDS = ['viagra', 'casino', 'lottery', 'winner', 'free money', 'click here'];

interface SubmissionHistory {
  timestamps: string[];
}

interface FormDraft {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  contactMethod: string;
  subject: string;
  message: string;
  savedAt: string;
}

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingSubmissions, setRemainingSubmissions] = useState(RATE_LIMIT_MAX);

  // フィールドごとのエラーメッセージ
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    phone: '',
    message: '',
    subject: ''
  });

  // フォームの値を管理
  const [formValues, setFormValues] = useState<FormDraft>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    contactMethod: '',
    subject: '',
    message: '',
    savedAt: ''
  });

  // レート制限のチェック
  const checkRateLimit = (): { allowed: boolean; message?: string; nextAvailableTime?: Date } => {
    const historyStr = localStorage.getItem(STORAGE_KEY);
    if (!historyStr) {
      return { allowed: true };
    }

    const history: SubmissionHistory = JSON.parse(historyStr);
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    // 1時間以内の送信履歴をフィルタ
    const recentSubmissions = history.timestamps.filter(
      (timestamp) => new Date(timestamp).getTime() > windowStart
    );

    // 古い履歴を削除して保存
    if (recentSubmissions.length !== history.timestamps.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamps: recentSubmissions }));
    }

    // 残り回数を更新
    setRemainingSubmissions(Math.max(0, RATE_LIMIT_MAX - recentSubmissions.length));

    if (recentSubmissions.length >= RATE_LIMIT_MAX) {
      const oldestSubmission = new Date(recentSubmissions[0]);
      const nextAvailable = new Date(oldestSubmission.getTime() + RATE_LIMIT_WINDOW);

      return {
        allowed: false,
        message: `送信回数の上限に達しました。次回送信可能時刻: ${nextAvailable.toLocaleString('ja-JP')}`,
        nextAvailableTime: nextAvailable,
      };
    }

    return { allowed: true };
  };

  // 送信履歴を更新
  const updateSubmissionHistory = () => {
    const historyStr = localStorage.getItem(STORAGE_KEY);
    const history: SubmissionHistory = historyStr ? JSON.parse(historyStr) : { timestamps: [] };

    history.timestamps.push(new Date().toISOString());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    // 残り回数を更新
    setRemainingSubmissions(Math.max(0, RATE_LIMIT_MAX - history.timestamps.length));
  };

  // スパムチェック
  const checkSpamContent = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  // フィールド単体のバリデーション（onBlur用）
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return ''; // 空の場合はエラーなし（requiredで処理）
        if (!emailRegex.test(value)) {
          return 'メールアドレスの形式が正しくありません。';
        }
        return '';

      case 'phone':
        if (!value) return ''; // 電話番号は任意項目
        const phoneRegex = /^[0-9\-\(\)\s]+$/;
        if (!phoneRegex.test(value)) {
          return '電話番号は数字、ハイフン、括弧のみ使用できます。';
        }
        return '';

      case 'message':
        if (!value) return '';
        if (value.length < 10) {
          return 'お問い合わせ内容は10文字以上入力してください。';
        }
        if (checkSpamContent(value)) {
          return '不適切な内容が含まれています。';
        }
        return '';

      case 'subject':
        if (!value) return '';
        if (checkSpamContent(value)) {
          return '不適切な内容が含まれています。';
        }
        return '';

      default:
        return '';
    }
  };

  // フィールドのBlurイベントハンドラ
  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  // バリデーション強化
  const validateForm = (formData: FormData): { valid: boolean; error?: string } => {
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;
    const subject = formData.get('subject') as string;

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'メールアドレスの形式が正しくありません。' };
    }

    // 電話番号形式チェック（入力されている場合のみ）
    if (phone) {
      const phoneRegex = /^[0-9\-\(\)\s]+$/;
      if (!phoneRegex.test(phone)) {
        return { valid: false, error: '電話番号は数字、ハイフン、括弧のみ使用できます。' };
      }
    }

    // メッセージの最小文字数チェック
    if (message.length < 10) {
      return { valid: false, error: 'お問い合わせ内容は10文字以上入力してください。' };
    }

    // スパムチェック
    if (checkSpamContent(message) || checkSpamContent(subject)) {
      return { valid: false, error: '不適切な内容が含まれています。' };
    }

    return { valid: true };
  };

  // 下書きを保存
  const saveDraft = () => {
    const draft: FormDraft = {
      ...formValues,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  };

  // 下書きを読み込み
  const loadDraft = () => {
    const draftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draftStr) {
      try {
        const draft: FormDraft = JSON.parse(draftStr);
        return draft;
      } catch (error) {
        console.error('Failed to parse draft:', error);
        return null;
      }
    }
    return null;
  };

  // 下書きをクリア
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  // フォーム入力時のハンドラ（デバウンス付き自動保存）
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));

    // デバウンス処理
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, AUTOSAVE_DELAY);
  };

  // コンポーネントマウント時の処理
  useEffect(() => {
    checkRateLimit();

    // 下書きを自動復元
    const draft = loadDraft();
    if (draft && draft.savedAt) {
      const hasContent = Object.entries(draft).some(
        ([key, value]) => key !== 'savedAt' && value !== ''
      );
      if (hasContent) {
        setFormValues(draft);
      }
    }
  }, []);

  // コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // フォーム参照を先に取得
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypotチェック（ボット検知）
    const honeypot = formData.get('website') as string;
    if (honeypot) {
      // ボットを検知 - 成功したように見せかける
      setSubmitStatus('success');
      form.reset();
      return;
    }

    // レート制限チェック
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      setErrorMessage(rateLimitCheck.message || '送信制限中です。');
      setSubmitStatus('error');
      return;
    }

    if (!recaptchaRef.current) {
      setErrorMessage('reCAPTCHAが読み込まれていません。ページを再読み込みしてください。');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // バリデーションチェック
      const validation = validateForm(formData);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'フォームの入力内容を確認してください。');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      // reCAPTCHA v2 invisible - executeAsync()でトークンを取得
      const recaptchaToken = await recaptchaRef.current.executeAsync();
      if (!recaptchaToken) {
        setErrorMessage('reCAPTCHA認証に失敗しました。ページを再読み込みしてください。');
        setSubmitStatus('error');
        setIsSubmitting(false);
        return;
      }

      const templateParams = {
        name: formData.get('name') as string,
        company: formData.get('company') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        category: formData.get('category') as string,
        contactMethod: formData.get('contactMethod') as string,
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

      // 送信履歴を更新
      updateSubmissionHistory();

      // 下書きをクリア
      clearDraft();

      // 送信完了ページに遷移
      navigate('/contact/success');
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
                  value={formValues.name}
                  onChange={handleInputChange}
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
                  value={formValues.company}
                  onChange={handleInputChange}
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
                  className={`contact__form-input ${fieldErrors.email ? 'contact__form-input--error' : ''}`}
                  value={formValues.email}
                  onChange={handleInputChange}
                  required
                  onBlur={handleFieldBlur}
                />
                {fieldErrors.email && (
                  <span className="contact__form-error">{fieldErrors.email}</span>
                )}
              </div>
              <div className="contact__form-group">
                <label htmlFor="phone" className="contact__form-label">電話番号</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`contact__form-input ${fieldErrors.phone ? 'contact__form-input--error' : ''}`}
                  value={formValues.phone}
                  onChange={handleInputChange}
                  placeholder="例: 03-1234-5678"
                  onBlur={handleFieldBlur}
                />
                {fieldErrors.phone && (
                  <span className="contact__form-error">{fieldErrors.phone}</span>
                )}
              </div>
            </div>

            <div className="contact__form-group">
              <label htmlFor="address" className="contact__form-label">ご住所</label>
              <input
                type="text"
                id="address"
                name="address"
                className="contact__form-input"
                value={formValues.address}
                onChange={handleInputChange}
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
                  value={formValues.category}
                  onChange={handleInputChange}
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
                  name="contactMethod"
                  className="contact__form-select"
                  value={formValues.contactMethod}
                  onChange={handleInputChange}
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
                className={`contact__form-input ${fieldErrors.subject ? 'contact__form-input--error' : ''}`}
                value={formValues.subject}
                onChange={handleInputChange}
                required
                onBlur={handleFieldBlur}
              />
              {fieldErrors.subject && (
                <span className="contact__form-error">{fieldErrors.subject}</span>
              )}
            </div>

            <div className="contact__form-group">
              <label htmlFor="message" className="contact__form-label">お問い合わせ内容 *</label>
              <textarea
                id="message"
                name="message"
                className={`contact__form-textarea ${fieldErrors.message ? 'contact__form-textarea--error' : ''}`}
                value={formValues.message}
                onChange={handleInputChange}
                rows={6}
                required
                onBlur={handleFieldBlur}
              ></textarea>
              {fieldErrors.message && (
                <span className="contact__form-error">{fieldErrors.message}</span>
              )}
            </div>

            {/* Honeypot field - ボット検知用の隠しフィールド */}
            <input
              type="text"
              name="website"
              id="website"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

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

            {remainingSubmissions < RATE_LIMIT_MAX && (
              <p className="contact__rate-limit-info">
                残り送信可能回数: {remainingSubmissions}/{RATE_LIMIT_MAX} (1時間以内)
              </p>
            )}

            <p className="contact__form-note">
              ※このフォームから実際にお問い合わせを送信できます。
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};
