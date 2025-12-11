import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '../../components/atoms/Button';
import './AdminProducts.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  sku: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [''],
    stock: 0,
    sku: '',
    isPublished: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAdminAndLoadProducts();
  }, [user]);

  const checkAdminAndLoadProducts = async () => {
    if (!user || !db) {
      navigate('/login');
      return;
    }

    try {
      // Check if user is admin
      const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
      const userData = userDoc.docs[0]?.data();

      if (userData?.role !== 'admin') {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await loadProducts();
    } catch (error) {
      console.error('Error:', error);
      navigate('/');
    }
  };

  const loadProducts = async () => {
    if (!db) return;

    try {
      setLoading(true);
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile || !storage) return null;

    setUploadingImage(true);
    try {
      // ファイル名を一意にするためタイムスタンプを追加
      const fileName = `products/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);

      // 画像をアップロード
      const snapshot = await uploadBytes(storageRef, imageFile);

      // ダウンロードURLを取得
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('画像のアップロードに失敗しました');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 画像ファイルのバリデーション
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }

      // 5MB以下のファイルサイズ制限
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }

      setImageFile(file);

      // プレビュー表示
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (!db) return;

    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        imageUrl: formData.images[0], // 互換性のため両方保存
        price: Number(formData.price),
        stock: Number(formData.stock),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await loadProducts();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('商品の追加に失敗しました');
    }
  };

  const handleUpdateProduct = async () => {
    if (!db || !editingProduct) return;

    try {
      await updateDoc(doc(db, 'products', editingProduct.id), {
        ...formData,
        imageUrl: formData.images[0], // 互換性のため両方保存
        price: Number(formData.price),
        stock: Number(formData.stock),
        updatedAt: new Date(),
      });

      await loadProducts();
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('商品の更新に失敗しました');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!db) return;

    if (!window.confirm('この商品を削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('商品の削除に失敗しました');
    }
  };

  const togglePublishStatus = async (product: Product) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, 'products', product.id), {
        isPublished: !product.isPublished,
        updatedAt: new Date(),
      });
      await loadProducts();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      images: [''],
      stock: 0,
      sku: '',
      isPublished: false,
    });
    setImageFile(null);
    setImagePreview('');
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images || [''],
      stock: product.stock,
      sku: product.sku,
      isPublished: product.isPublished,
    });
    // 編集時は既存画像をプレビューに表示
    if (product.images && product.images[0]) {
      setImagePreview(product.images[0]);
    }
    setImageFile(null);
  };

  if (loading) {
    return <div className="admin-products__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <h1>商品管理</h1>
        <div className="admin-products__actions">
          <Button onClick={() => navigate('/admin')}>ダッシュボードに戻る</Button>
          <Button onClick={() => setShowAddModal(true)}>新商品追加</Button>
        </div>
      </div>

      <div className="admin-products__list">
        <table className="admin-products__table">
          <thead>
            <tr>
              <th>画像</th>
              <th>商品名</th>
              <th>カテゴリー</th>
              <th>価格</th>
              <th>在庫</th>
              <th>SKU</th>
              <th>公開状態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    className="admin-products__thumbnail"
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>¥{product.price.toLocaleString()}</td>
                <td>{product.stock}</td>
                <td>{product.sku}</td>
                <td>
                  <button
                    className={`admin-products__status ${product.isPublished ? 'admin-products__status--published' : 'admin-products__status--draft'}`}
                    onClick={() => togglePublishStatus(product)}
                  >
                    {product.isPublished ? '公開中' : '下書き'}
                  </button>
                </td>
                <td>
                  <div className="admin-products__actions-cell">
                    <button
                      className="admin-products__action admin-products__action--edit"
                      onClick={() => openEditModal(product)}
                    >
                      編集
                    </button>
                    <button
                      className="admin-products__action admin-products__action--delete"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="admin-products__empty">
            商品が登録されていません
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingProduct) && (
        <div className="admin-products__modal">
          <div className="admin-products__modal-content">
            <h2>{editingProduct ? '商品編集' : '新商品追加'}</h2>

            <div className="admin-products__form">
              <div className="admin-products__form-group">
                <label>商品名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-products__form-group">
                <label>説明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="admin-products__form-row">
                <div className="admin-products__form-group">
                  <label>価格</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    min="0"
                    required
                  />
                </div>

                <div className="admin-products__form-group">
                  <label>在庫数</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="admin-products__form-row">
                <div className="admin-products__form-group">
                  <label>カテゴリー</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">選択してください</option>
                    <option value="イヤホン">イヤホン</option>
                    <option value="スマートウォッチ">スマートウォッチ</option>
                    <option value="モバイルバッテリー">モバイルバッテリー</option>
                    <option value="スマホアクセサリー">スマホアクセサリー</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div className="admin-products__form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-products__form-group">
                <label>画像URL</label>
                <input
                  type="text"
                  value={formData.images[0]}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  placeholder="https://example.com/image.jpg"
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  画像のURLを入力してください（例: https://via.placeholder.com/300x300）
                </p>
              </div>

              <div className="admin-products__form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  公開する
                </label>
              </div>

              <div className="admin-products__modal-actions">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'アップロード中...' : editingProduct ? '更新' : '追加'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};