import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Button } from '../components/atoms/Button';
import './Account.css';

interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
}

export const Account: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'address'>('profile');

  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user profile
    const loadProfile = async () => {
      try {
        setProfile({
          displayName: user.displayName || '',
          email: user.email || '',
          phone: '',
          postalCode: '',
          prefecture: '',
          city: '',
          address: '',
        });

        if (db) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile(prev => ({
              ...prev,
              phone: data.phone || '',
              postalCode: data.postalCode || '',
              prefecture: data.prefecture || '',
              city: data.city || '',
              address: data.address || '',
            }));
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (!user || !auth) {
        throw new Error('認証情報が見つかりません');
      }

      // Update display name in Firebase Auth
      if (profile.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: profile.displayName,
        });
      }

      // Update additional info in Firestore
      if (db) {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: profile.displayName,
          phone: profile.phone,
          updatedAt: new Date(),
        });
      }

      setMessage('プロフィールを更新しました');
    } catch (error: any) {
      setError(error.message || 'プロフィールの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('新しいパスワードが一致しません');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('パスワードは6文字以上にしてください');
      setLoading(false);
      return;
    }

    try {
      if (!user) {
        throw new Error('認証情報が見つかりません');
      }

      await updatePassword(user, passwordData.newPassword);
      setMessage('パスワードを更新しました');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setError('セキュリティのため、再度ログインしてください');
      } else {
        setError(error.message || 'パスワードの更新に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (!user || !db) {
        throw new Error('認証情報が見つかりません');
      }

      await updateDoc(doc(db, 'users', user.uid), {
        postalCode: profile.postalCode,
        prefecture: profile.prefecture,
        city: profile.city,
        address: profile.address,
        updatedAt: new Date(),
      });

      setMessage('住所を更新しました');
    } catch (error: any) {
      setError(error.message || '住所の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="account">
      <div className="account__container">
        <h1 className="account__title">マイページ</h1>

        <div className="account__tabs">
          <button
            className={`account__tab ${activeTab === 'profile' ? 'account__tab--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            プロフィール
          </button>
          <button
            className={`account__tab ${activeTab === 'password' ? 'account__tab--active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            パスワード変更
          </button>
          <button
            className={`account__tab ${activeTab === 'address' ? 'account__tab--active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            住所管理
          </button>
        </div>

        {message && <div className="account__message account__message--success">{message}</div>}
        {error && <div className="account__message account__message--error">{error}</div>}

        {activeTab === 'profile' && (
          <form className="account__form" onSubmit={handleProfileUpdate}>
            <div className="account__form-group">
              <label htmlFor="displayName">お名前</label>
              <input
                type="text"
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                required
              />
            </div>

            <div className="account__form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="account__input--disabled"
              />
              <small>メールアドレスは変更できません</small>
            </div>

            <div className="account__form-group">
              <label htmlFor="phone">電話番号</label>
              <input
                type="tel"
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="090-1234-5678"
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? '更新中...' : 'プロフィールを更新'}
            </Button>
          </form>
        )}

        {activeTab === 'password' && (
          <form className="account__form" onSubmit={handlePasswordUpdate}>
            <div className="account__form-group">
              <label htmlFor="newPassword">新しいパスワード</label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="account__form-group">
              <label htmlFor="confirmPassword">新しいパスワード（確認）</label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? '更新中...' : 'パスワードを変更'}
            </Button>
          </form>
        )}

        {activeTab === 'address' && (
          <form className="account__form" onSubmit={handleAddressUpdate}>
            <div className="account__form-group">
              <label htmlFor="postalCode">郵便番号</label>
              <input
                type="text"
                id="postalCode"
                value={profile.postalCode}
                onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                placeholder="123-4567"
              />
            </div>

            <div className="account__form-group">
              <label htmlFor="prefecture">都道府県</label>
              <select
                id="prefecture"
                value={profile.prefecture}
                onChange={(e) => setProfile({ ...profile, prefecture: e.target.value })}
              >
                <option value="">選択してください</option>
                <option value="東京都">東京都</option>
                <option value="大阪府">大阪府</option>
                <option value="神奈川県">神奈川県</option>
                <option value="愛知県">愛知県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="千葉県">千葉県</option>
                <option value="兵庫県">兵庫県</option>
                <option value="北海道">北海道</option>
                <option value="福岡県">福岡県</option>
                {/* 他の都道府県も追加可能 */}
              </select>
            </div>

            <div className="account__form-group">
              <label htmlFor="city">市区町村</label>
              <input
                type="text"
                id="city"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="渋谷区"
              />
            </div>

            <div className="account__form-group">
              <label htmlFor="address">住所</label>
              <input
                type="text"
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="道玄坂1-2-3 ABCビル4F"
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? '更新中...' : '住所を更新'}
            </Button>
          </form>
        )}

        <div className="account__actions">
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
            fullWidth
          >
            注文履歴を見る
          </Button>
        </div>
      </div>
    </div>
  );
};