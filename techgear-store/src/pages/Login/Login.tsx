import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

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
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setGeneralError('このメールアドレスは登録されていません');
      } else if (error.code === 'auth/wrong-password') {
        setGeneralError('パスワードが正しくありません');
      } else if (error.code === 'auth/invalid-credential') {
        setGeneralError('メールアドレスまたはパスワードが正しくありません');
      } else {
        setGeneralError('ログインに失敗しました。もう一度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGeneralError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      console.error('Google login error:', error);
      setGeneralError('Googleログインに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__card">
          <h1 className="login__title">ログイン</h1>
          <p className="login__subtitle">アカウントにログインしてください</p>

          {generalError && (
            <div className="login__error-banner">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login__form">
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
              placeholder="パスワードを入力"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              fullWidth
              autoComplete="current-password"
            />

            <div className="login__forgot">
              <Link to="/forgot-password" className="login__forgot-link">
                パスワードをお忘れですか？
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
            >
              ログイン
            </Button>
          </form>

          <div className="login__divider">
            <span>または</span>
          </div>

          <Button
            variant="outline"
            size="large"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Googleでログイン
          </Button>

          <p className="login__register">
            アカウントをお持ちでない方は
            <Link to="/register" className="login__register-link">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
