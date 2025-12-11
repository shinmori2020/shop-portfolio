import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { useAuth } from '../../contexts/AuthContext';
import './Register.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.displayName) {
      newErrors.displayName = '名前を入力してください';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = '名前は2文字以上である必要があります';
    }

    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上である必要があります';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワード（確認）を入力してください';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.displayName);
      navigate('/');
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setGeneralError('このメールアドレスは既に使用されています');
      } else if (error.code === 'auth/weak-password') {
        setGeneralError('パスワードが弱すぎます。より強力なパスワードを設定してください。');
      } else {
        setGeneralError('登録に失敗しました。もう一度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGeneralError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      console.error('Google register error:', error);
      setGeneralError('Google登録に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register__container">
        <div className="register__card">
          <h1 className="register__title">新規登録</h1>
          <p className="register__subtitle">アカウントを作成してください</p>

          {generalError && (
            <div className="register__error-banner">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register__form">
            <Input
              type="text"
              name="displayName"
              label="お名前"
              placeholder="山田 太郎"
              value={formData.displayName}
              onChange={handleChange}
              error={errors.displayName}
              required
              fullWidth
              autoComplete="name"
            />

            <Input
              type="email"
              name="email"
              label="メールアドレス"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              fullWidth
              autoComplete="email"
            />

            <Input
              type="password"
              name="password"
              label="パスワード"
              placeholder="6文字以上"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText="6文字以上の英数字を入力してください"
              required
              fullWidth
              autoComplete="new-password"
            />

            <Input
              type="password"
              name="confirmPassword"
              label="パスワード（確認）"
              placeholder="パスワードを再入力"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              fullWidth
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
            >
              登録する
            </Button>
          </form>

          <div className="register__divider">
            <span>または</span>
          </div>

          <Button
            variant="outline"
            size="large"
            fullWidth
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Googleで登録
          </Button>

          <p className="register__login">
            既にアカウントをお持ちの方は
            <Link to="/login" className="register__login-link">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
