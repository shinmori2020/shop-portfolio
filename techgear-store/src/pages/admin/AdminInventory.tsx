import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import * as XLSX from 'xlsx';
import './AdminInventory.css';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  sold: number;
  imageUrl?: string;
  updatedAt?: Date;
}

interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  action: 'add' | 'remove' | 'adjust' | 'sale';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: Date;
  createdBy: string;
}

export const AdminInventory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkStockValue, setBulkStockValue] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);

  // 在庫警告の閾値
  const LOW_STOCK_THRESHOLD = 5;

  // 次のSKU番号を生成する関数
  const generateNextSku = (existingProducts: Product[]): string => {
    const skuNumbers = existingProducts
      .map(p => p.sku)
      .filter(sku => sku && sku.startsWith('SKU_'))
      .map(sku => parseInt(sku.replace('SKU_', ''), 10))
      .filter(num => !isNaN(num));

    const maxNumber = skuNumbers.length > 0 ? Math.max(...skuNumbers) : 0;
    return `SKU_${String(maxNumber + 1).padStart(3, '0')}`;
  };

  // SKUが空の商品に自動でSKUを設定する関数
  const assignMissingSKUs = async () => {
    if (!db) return;

    const productsWithoutSku = products.filter(p => !p.sku || p.sku === '');
    if (productsWithoutSku.length === 0) {
      alert('すべての商品にSKUが設定されています');
      return;
    }

    if (!window.confirm(`${productsWithoutSku.length}件の商品にSKUが設定されていません。自動でSKUを割り当てますか？`)) {
      return;
    }

    try {
      const batch = writeBatch(db);
      let currentProducts = [...products];

      for (const product of productsWithoutSku) {
        const newSku = generateNextSku(currentProducts);
        batch.update(doc(db, 'products', product.id), {
          sku: newSku,
          updatedAt: new Date(),
        });
        // 次のSKU生成のために更新
        currentProducts = currentProducts.map(p =>
          p.id === product.id ? { ...p, sku: newSku } : p
        );
      }

      await batch.commit();
      await loadProducts();
      alert(`${productsWithoutSku.length}件の商品にSKUを割り当てました`);
    } catch (error) {
      console.error('Error assigning SKUs:', error);
      alert('SKUの割り当てに失敗しました');
    }
  };

  useEffect(() => {
    checkAdminAndLoadProducts();
  }, [user]);

  const checkAdminAndLoadProducts = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 簡易的な管理者チェック（本番環境では適切な権限管理が必要）
    const isAdminUser = user.email?.includes('admin') ||
                       user.email === 'test@example.com';

    setIsAdmin(isAdminUser);

    if (isAdminUser) {
      await loadProducts();
    } else {
      navigate('/');
    }
  };

  const loadProducts = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      } as Product));

      // SKU順にソート（SKUがない場合は最後に）
      setProducts(productsData.sort((a, b) => {
        const skuA = a.sku || 'ZZZ'; // SKUがない場合は最後に
        const skuB = b.sku || 'ZZZ';
        return skuA.localeCompare(skuB);
      }));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId: string) => {
    if (!db || editingStock[productId] === undefined) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = editingStock[productId];
    const previousStock = product.stock;

    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: newStock,
        updatedAt: new Date(),
      });

      // 履歴を記録
      await addStockHistory(
        productId,
        product.name,
        'adjust',
        Math.abs(newStock - previousStock),
        previousStock,
        newStock,
        '手動調整'
      );

      // 商品リストを更新
      setProducts(products.map(p =>
        p.id === productId ? { ...p, stock: newStock } : p
      ));

      // 編集状態をクリア
      setEditingStock(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });

      alert('在庫を更新しました');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('在庫の更新に失敗しました');
    }
  };

  const handleBulkStockUpdate = async () => {
    if (!db || selectedProducts.size === 0 || bulkStockValue <= 0) {
      alert('商品を選択し、有効な在庫数を入力してください');
      return;
    }

    if (!window.confirm(`選択した${selectedProducts.size}件の商品の在庫を${bulkStockValue}に更新しますか？`)) {
      return;
    }

    try {
      const batch = writeBatch(db);
      const dbRef = db; // TypeScript narrowing用

      selectedProducts.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
          batch.update(doc(dbRef, 'products', productId), {
            stock: bulkStockValue,
            updatedAt: new Date(),
          });

          // 履歴用（バッチ処理後に追加）
          addStockHistory(
            productId,
            product.name,
            'adjust',
            Math.abs(bulkStockValue - product.stock),
            product.stock,
            bulkStockValue,
            '一括更新'
          );
        }
      });

      await batch.commit();
      await loadProducts();
      setSelectedProducts(new Set());
      setBulkStockValue(0);
      alert('在庫を一括更新しました');
    } catch (error) {
      console.error('Error bulk updating stock:', error);
      alert('一括更新に失敗しました');
    }
  };

  const addStockHistory = async (
    productId: string,
    productName: string,
    action: 'add' | 'remove' | 'adjust' | 'sale',
    quantity: number,
    previousStock: number,
    newStock: number,
    reason?: string
  ) => {
    if (!db || !user) return;

    try {
      await addDoc(collection(db, 'stockHistory'), {
        productId,
        productName,
        action,
        quantity,
        previousStock,
        newStock,
        reason,
        createdAt: new Date(),
        createdBy: user.email || user.uid,
      });
    } catch (error) {
      console.error('Error adding stock history:', error);
    }
  };

  // 履歴の保持期間（日数）
  const HISTORY_RETENTION_DAYS = 90;

  const loadStockHistory = async (product: Product) => {
    if (!db) return;

    try {
      const historyRef = collection(db, 'stockHistory');
      const snapshot = await getDocs(historyRef);

      // 90日前の日付を計算
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - HISTORY_RETENTION_DAYS);

      const history = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        } as StockHistory))
        .filter(h => h.productId === product.id && h.createdAt >= cutoffDate)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setStockHistory(history);
      setSelectedProductHistory(product);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading stock history:', error);
    }
  };

  const exportToExcel = () => {
    // SKU順にソートしてエクスポート
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const skuA = a.sku || 'ZZZ';
      const skuB = b.sku || 'ZZZ';
      return skuA.localeCompare(skuB);
    });

    // Excelに出力するデータを作成
    const data = sortedProducts.map(p => ({
      '商品名': p.name,
      'SKU': p.sku || '',
      'カテゴリ': p.category,
      '現在在庫': p.stock,
      '販売数': p.sold || 0,
      '価格': p.price,
    }));

    // ワークシートを作成
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 列幅を設定
    worksheet['!cols'] = [
      { wch: 20 }, // 商品名
      { wch: 12 }, // SKU
      { wch: 15 }, // カテゴリ
      { wch: 10 }, // 現在在庫
      { wch: 10 }, // 販売数
      { wch: 12 }, // 価格
    ];

    // ワークブックを作成
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '在庫一覧');

    // Excelファイルとしてダウンロード
    XLSX.writeFile(workbook, `inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !db) return;

    try {
      // Excelファイルを読み込み
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      // 最初のシートを取得
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // シートをJSONに変換
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      console.log('インポートデータ:', data);

      if (data.length === 0) {
        alert('ファイルにデータがありません');
        return;
      }

      // SKU列の確認
      const firstRow = data[0];
      if (!('SKU' in firstRow)) {
        alert('ファイルにSKU列が必要です');
        return;
      }

      const dbRef = db;
      const batch = writeBatch(dbRef);
      let updatedCount = 0;
      let addedCount = 0;
      let currentProducts = [...products];

      for (const row of data) {
        const sku = String(row['SKU'] || '').trim();
        const productName = String(row['商品名'] || '').trim();
        const category = String(row['カテゴリ'] || '').trim();
        const stock = Number(row['現在在庫']);
        const sold = Number(row['販売数']);
        const price = Number(row['価格']);

        // SKUのみでマッチング（シンプルで確実）
        const product = sku ? products.find(p => p.sku === sku) : null;

        console.log(`検索: SKU="${sku}" => ${product ? `マッチ: ${product.name}` : '見つからず'}`);

        if (product) {
          // 既存商品の更新
          const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
          };

          if (!isNaN(stock)) {
            updateData.stock = stock;
          }

          if (!isNaN(price)) {
            updateData.price = price;
          }

          if (!isNaN(sold)) {
            updateData.sold = sold;
          }

          if (productName) {
            updateData.name = productName;
          }

          if (category) {
            updateData.category = category;
          }

          batch.update(doc(dbRef, 'products', product.id), updateData);
          updatedCount++;
          console.log(`更新: ${product.name}`, updateData);
        } else {
          // 新規商品の追加（商品名と価格が必須）
          if (productName && !isNaN(price)) {
            // SKUがない場合は自動生成
            const finalSku = sku || generateNextSku(currentProducts);

            const newProductRef = doc(collection(dbRef, 'products'));
            const newProductData = {
              name: productName,
              sku: finalSku,
              category: category || 'その他',
              stock: isNaN(stock) ? 0 : stock,
              sold: isNaN(sold) ? 0 : sold,
              price: price,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            batch.set(newProductRef, newProductData);
            addedCount++;
            console.log(`新規追加: ${productName} (SKU: ${finalSku})`, newProductData);

            // 次のSKU生成のためにリストに追加
            currentProducts.push({ ...newProductData, id: newProductRef.id } as Product);
          } else {
            console.log(`スキップ（情報不足）- 商品名: "${productName}", 価格: ${price}`);
          }
        }
      }

      if (updatedCount > 0 || addedCount > 0) {
        await batch.commit();
        await loadProducts();
      }

      const messages = [];
      if (updatedCount > 0) {
        messages.push(`${updatedCount}件の商品を更新しました`);
      }
      if (addedCount > 0) {
        messages.push(`${addedCount}件の商品を新規追加しました`);
      }
      if (messages.length === 0) {
        messages.push('更新する商品がありませんでした');
      }
      alert(messages.join('\n'));
    } catch (error) {
      console.error('Error importing Excel:', error);
      alert('ファイルのインポートに失敗しました');
    }

    event.target.value = '';
  };

  // フィルタリング処理
  const filteredProducts = products.filter(product => {
    // 検索フィルター
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.sku?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // カテゴリフィルター
    if (filterCategory !== 'all' && product.category !== filterCategory) {
      return false;
    }

    // 在庫フィルター
    if (stockFilter === 'low' && product.stock > LOW_STOCK_THRESHOLD) {
      return false;
    }
    if (stockFilter === 'out' && product.stock > 0) {
      return false;
    }

    return true;
  });

  // カテゴリ一覧を取得
  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  // 在庫状況のサマリー
  const stockSummary = {
    total: products.length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length,
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
  };

  if (loading) {
    return <div className="admin-inventory__loading">読み込み中...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-inventory">
      <div className="admin-inventory__header">
        <h1>在庫管理</h1>
        <div className="admin-inventory__actions">
          <div className="admin-inventory__nav">
            <button onClick={() => navigate('/admin')}>ダッシュボードに戻る</button>
            <button onClick={() => navigate('/admin/products')}>商品管理</button>
          </div>
          <div className="admin-inventory__divider"></div>
          <div className="admin-inventory__page-actions">
            <button onClick={exportToExcel}>Excelエクスポート</button>
            <label className="admin-inventory__csv-import">
              Excelインポート
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                style={{ display: 'none' }}
              />
            </label>
            <button
              onClick={assignMissingSKUs}
              title="SKUが設定されていない商品に自動でSKUを割り当てます"
            >
              SKU自動割り当て
            </button>
          </div>
        </div>
      </div>

      {/* 在庫サマリー */}
      <div className="admin-inventory__summary">
        <div className="admin-inventory__summary-card">
          <h3>総商品数</h3>
          <p>{stockSummary.total}</p>
        </div>
        <div className="admin-inventory__summary-card admin-inventory__summary-card--warning">
          <h3>在庫切れ</h3>
          <p>{stockSummary.outOfStock}</p>
        </div>
        <div className="admin-inventory__summary-card admin-inventory__summary-card--caution">
          <h3>在庫僅少</h3>
          <p>{stockSummary.lowStock}</p>
        </div>
        <div className="admin-inventory__summary-card">
          <h3>在庫総額</h3>
          <p>¥{stockSummary.totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* フィルター */}
      <div className="admin-inventory__filters">
        <input
          type="text"
          placeholder="商品名またはSKUで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-inventory__search"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="admin-inventory__filter"
        >
          <option value="all">すべてのカテゴリ</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as any)}
          className="admin-inventory__filter"
        >
          <option value="all">すべての在庫状況</option>
          <option value="low">在庫僅少（{LOW_STOCK_THRESHOLD}個以下）</option>
          <option value="out">在庫切れ</option>
        </select>
      </div>

      {/* 一括操作 */}
      {selectedProducts.size > 0 && (
        <div className="admin-inventory__bulk">
          <span>{selectedProducts.size}件選択中</span>
          <input
            type="number"
            placeholder="新しい在庫数"
            value={bulkStockValue || ''}
            onChange={(e) => setBulkStockValue(parseInt(e.target.value, 10) || 0)}
            min="0"
          />
          <button onClick={handleBulkStockUpdate}>一括更新</button>
          <button onClick={() => setSelectedProducts(new Set())}>
            選択解除
          </button>
        </div>
      )}

      {/* 商品リスト */}
      <div className="admin-inventory__table-wrapper">
        <table className="admin-inventory__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
                    } else {
                      setSelectedProducts(new Set());
                    }
                  }}
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                />
              </th>
              <th>商品名</th>
              <th>SKU</th>
              <th>カテゴリ</th>
              <th>現在在庫</th>
              <th>販売数</th>
              <th>価格</th>
              <th>在庫額</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr
                key={product.id}
                className={
                  product.stock === 0 ? 'admin-inventory__row--out' :
                  product.stock <= LOW_STOCK_THRESHOLD ? 'admin-inventory__row--low' : ''
                }
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedProducts);
                      if (e.target.checked) {
                        newSelected.add(product.id);
                      } else {
                        newSelected.delete(product.id);
                      }
                      setSelectedProducts(newSelected);
                    }}
                  />
                </td>
                <td>
                  <div className="admin-inventory__product">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} />
                    )}
                    <span>{product.name}</span>
                  </div>
                </td>
                <td>{product.sku || '-'}</td>
                <td>{product.category}</td>
                <td>
                  {editingStock[product.id] !== undefined ? (
                    <input
                      type="number"
                      value={editingStock[product.id]}
                      onChange={(e) => setEditingStock(prev => ({
                        ...prev,
                        [product.id]: parseInt(e.target.value, 10) || 0
                      }))}
                      onBlur={() => handleStockUpdate(product.id)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleStockUpdate(product.id);
                        }
                      }}
                      min="0"
                      className="admin-inventory__stock-input"
                    />
                  ) : (
                    <span
                      onClick={() => setEditingStock(prev => ({
                        ...prev,
                        [product.id]: product.stock
                      }))}
                      className="admin-inventory__stock-value"
                    >
                      {product.stock}
                      {product.stock === 0 && ' (在庫切れ)'}
                      {product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD && ' (僅少)'}
                    </span>
                  )}
                </td>
                <td>{product.sold || 0}</td>
                <td>¥{product.price.toLocaleString()}</td>
                <td>¥{(product.stock * product.price).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => loadStockHistory(product)}
                  >
                    履歴
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 在庫履歴モーダル */}
      {showHistoryModal && selectedProductHistory && (
        <div className="admin-inventory__modal">
          <div className="admin-inventory__modal-content">
            <h2>{selectedProductHistory.name} の在庫履歴</h2>
            <div className="admin-inventory__history">
              {stockHistory.length === 0 ? (
                <p>履歴がありません</p>
              ) : (
                <table className="admin-inventory__history-table">
                  <thead>
                    <tr>
                      <th>日時</th>
                      <th>操作</th>
                      <th>数量</th>
                      <th>前在庫</th>
                      <th>後在庫</th>
                      <th>理由</th>
                      <th>実行者</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockHistory.map(history => (
                      <tr key={history.id}>
                        <td>{new Date(history.createdAt).toLocaleString()}</td>
                        <td>
                          {history.action === 'add' && '追加'}
                          {history.action === 'remove' && '削除'}
                          {history.action === 'adjust' && '調整'}
                          {history.action === 'sale' && '販売'}
                        </td>
                        <td>{history.quantity}</td>
                        <td>{history.previousStock}</td>
                        <td>{history.newStock}</td>
                        <td>{history.reason || '-'}</td>
                        <td>{history.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="admin-inventory__modal-actions">
              <button onClick={() => {
                setShowHistoryModal(false);
                setSelectedProductHistory(null);
                setStockHistory([]);
              }}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};