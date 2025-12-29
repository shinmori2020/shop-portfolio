import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import './AdminReviews.css';

interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
}

interface Product {
  id: string;
  name: string;
}

export const AdminReviews: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'low' | 'high'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isAdminUser = user.email?.includes('admin') || user.email === 'test@example.com';
    setIsAdmin(isAdminUser);

    if (isAdminUser) {
      await Promise.all([loadReviews(), loadProducts()]);
    } else {
      navigate('/');
    }
  };

  const loadProducts = async () => {
    if (!db) return;

    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadReviews = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const reviewsRef = collection(db, 'reviews');
      const snapshot = await getDocs(reviewsRef);
      const reviewsData: Review[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || 'approved',
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || undefined,
      } as Review));

      setReviews(reviewsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || '不明な商品';
  };

  const updateReviewStatus = async (reviewId: string, newStatus: Review['status']) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, status: newStatus, updatedAt: new Date() } : r
      ));

      if (selectedReview?.id === reviewId) {
        setSelectedReview(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date() } : null);
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!db) return;
    if (!window.confirm('このレビューを削除しますか？この操作は取り消せません。')) return;

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      if (selectedReview?.id === reviewId) {
        setShowDetailModal(false);
        setSelectedReview(null);
      }
      alert('レビューを削除しました');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('レビューの削除に失敗しました');
    }
  };

  const openDetailModal = (review: Review) => {
    setSelectedReview({
      ...review,
      productName: getProductName(review.productId),
    });
    setShowDetailModal(true);
  };

  const filteredReviews = reviews.filter(review => {
    const productName = getProductName(review.productId);
    const matchesSearch = searchTerm === '' ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;

    const matchesRating = ratingFilter === 'all' ||
      (ratingFilter === 'low' && review.rating <= 2) ||
      (ratingFilter === 'high' && review.rating >= 4);

    return matchesSearch && matchesStatus && matchesRating;
  });

  const reviewStats = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    lowRating: reviews.filter(r => r.rating <= 2).length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
  };

  const getStatusLabel = (status: Review['status']) => {
    switch (status) {
      case 'pending': return '審査中';
      case 'approved': return '承認済';
      case 'rejected': return '却下';
      default: return status;
    }
  };

  const getStatusClass = (status: Review['status']) => {
    switch (status) {
      case 'pending': return 'admin-reviews__status--pending';
      case 'approved': return 'admin-reviews__status--approved';
      case 'rejected': return 'admin-reviews__status--rejected';
      default: return '';
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div className="admin-reviews__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-reviews">
      <div className="admin-reviews__header">
        <h1>レビュー管理</h1>
        <div className="admin-reviews__actions">
          <div className="admin-reviews__nav">
            <button onClick={() => navigate('/admin')}>ダッシュボード</button>
          </div>
          <div className="admin-reviews__divider" />
          <div className="admin-reviews__page-actions">
            <button onClick={() => { loadReviews(); loadProducts(); }}>更新</button>
          </div>
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="admin-reviews__summary">
        <div className="admin-reviews__summary-card">
          <span className="admin-reviews__summary-label">総レビュー数</span>
          <span className="admin-reviews__summary-value">{reviewStats.all}</span>
        </div>
        <div className="admin-reviews__summary-card">
          <span className="admin-reviews__summary-label">平均評価</span>
          <span className="admin-reviews__summary-value admin-reviews__summary-value--rating">
            ★ {reviewStats.averageRating}
          </span>
        </div>
        <div className="admin-reviews__summary-card admin-reviews__summary-card--warning">
          <span className="admin-reviews__summary-label">低評価</span>
          <span className="admin-reviews__summary-value">{reviewStats.lowRating}</span>
        </div>
        <div className="admin-reviews__summary-card admin-reviews__summary-card--caution">
          <span className="admin-reviews__summary-label">審査中</span>
          <span className="admin-reviews__summary-value">{reviewStats.pending}</span>
        </div>
      </div>

      {/* フィルター */}
      <div className="admin-reviews__filters">
        <input
          type="text"
          placeholder="商品名、ユーザー名、コメントで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-reviews__search"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="admin-reviews__filter-select"
        >
          <option value="all">すべてのステータス</option>
          <option value="pending">審査中</option>
          <option value="approved">承認済</option>
          <option value="rejected">却下</option>
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value as typeof ratingFilter)}
          className="admin-reviews__filter-select"
        >
          <option value="all">すべての評価</option>
          <option value="low">低評価（★2以下）</option>
          <option value="high">高評価（★4以上）</option>
        </select>
      </div>

      {/* レビュー一覧 */}
      <div className="admin-reviews__list">
        {filteredReviews.length === 0 ? (
          <p className="admin-reviews__empty">レビューがありません</p>
        ) : (
          <div className="admin-reviews__cards">
            {filteredReviews.map(review => (
              <div
                key={review.id}
                className={`admin-reviews__card ${review.rating <= 2 ? 'admin-reviews__card--low' : ''}`}
              >
                <div className="admin-reviews__card-header">
                  <div className="admin-reviews__card-rating">
                    <span className={`admin-reviews__stars ${review.rating <= 2 ? 'admin-reviews__stars--low' : ''}`}>
                      {renderStars(review.rating)}
                    </span>
                  </div>
                  <span className={`admin-reviews__status ${getStatusClass(review.status)}`}>
                    {getStatusLabel(review.status)}
                  </span>
                </div>
                <div className="admin-reviews__card-product">
                  {getProductName(review.productId)}
                </div>
                <div className="admin-reviews__card-comment">
                  {review.comment.length > 100 ? review.comment.substring(0, 100) + '...' : review.comment}
                </div>
                <div className="admin-reviews__card-footer">
                  <div className="admin-reviews__card-meta">
                    <span className="admin-reviews__card-user">{review.userName}</span>
                    <span className="admin-reviews__card-date">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="admin-reviews__card-actions">
                    <button
                      className="admin-reviews__btn admin-reviews__btn--view"
                      onClick={() => openDetailModal(review)}
                    >
                      詳細
                    </button>
                    {review.status === 'pending' && (
                      <>
                        <button
                          className="admin-reviews__btn admin-reviews__btn--approve"
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                        >
                          承認
                        </button>
                        <button
                          className="admin-reviews__btn admin-reviews__btn--reject"
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                        >
                          却下
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {showDetailModal && selectedReview && (
        <div className="admin-reviews__modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-reviews__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-reviews__modal-header">
              <h2>レビュー詳細</h2>
              <button
                className="admin-reviews__modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="admin-reviews__modal-content">
              <div className="admin-reviews__detail-row">
                <label>ステータス</label>
                <select
                  value={selectedReview.status}
                  onChange={(e) => updateReviewStatus(selectedReview.id, e.target.value as Review['status'])}
                  className="admin-reviews__status-select"
                >
                  <option value="pending">審査中</option>
                  <option value="approved">承認済</option>
                  <option value="rejected">却下</option>
                </select>
              </div>
              <div className="admin-reviews__detail-row">
                <label>商品</label>
                <span>{selectedReview.productName}</span>
              </div>
              <div className="admin-reviews__detail-row">
                <label>評価</label>
                <span className={`admin-reviews__stars ${selectedReview.rating <= 2 ? 'admin-reviews__stars--low' : ''}`}>
                  {renderStars(selectedReview.rating)} ({selectedReview.rating}/5)
                </span>
              </div>
              <div className="admin-reviews__detail-row">
                <label>投稿者</label>
                <span>{selectedReview.userName}</span>
              </div>
              <div className="admin-reviews__detail-row">
                <label>投稿日時</label>
                <span>{selectedReview.createdAt.toLocaleString()}</span>
              </div>
              {selectedReview.title && (
                <div className="admin-reviews__detail-row">
                  <label>タイトル</label>
                  <span>{selectedReview.title}</span>
                </div>
              )}
              <div className="admin-reviews__detail-row admin-reviews__detail-row--full">
                <label>コメント</label>
                <div className="admin-reviews__comment">{selectedReview.comment}</div>
              </div>
              {selectedReview.updatedAt && (
                <div className="admin-reviews__detail-row">
                  <label>最終更新</label>
                  <span>{selectedReview.updatedAt.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="admin-reviews__modal-actions">
              {selectedReview.status === 'pending' && (
                <>
                  <button
                    className="admin-reviews__btn admin-reviews__btn--approve"
                    onClick={() => updateReviewStatus(selectedReview.id, 'approved')}
                  >
                    承認
                  </button>
                  <button
                    className="admin-reviews__btn admin-reviews__btn--reject"
                    onClick={() => updateReviewStatus(selectedReview.id, 'rejected')}
                  >
                    却下
                  </button>
                </>
              )}
              <button
                className="admin-reviews__btn admin-reviews__btn--delete"
                onClick={() => deleteReview(selectedReview.id)}
              >
                削除
              </button>
              <button
                className="admin-reviews__btn admin-reviews__btn--close"
                onClick={() => setShowDetailModal(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
