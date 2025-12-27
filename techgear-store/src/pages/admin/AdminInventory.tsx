import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
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
  const [showCsvImport, setShowCsvImport] = useState(false);

  // 在庫警告の閾値
  const LOW_STOCK_THRESHOLD = 5;

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

      setProducts(productsData.sort((a, b) => a.name.localeCompare(b.name)));
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

      selectedProducts.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
          batch.update(doc(db, 'products', productId), {
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

  const loadStockHistory = async (product: Product) => {
    if (!db) return;

    try {
      const historyRef = collection(db, 'stockHistory');
      const snapshot = await getDocs(historyRef);
      const history = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        } as StockHistory))
        .filter(h => h.productId === product.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setStockHistory(history);
      setSelectedProductHistory(product);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading stock history:', error);
    }
  };

  const exportToCsv = () => {
    const headers = ['商品名', 'SKU', 'カテゴリ', '現在在庫', '販売数', '価格'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.sku || '',
      p.category,
      p.stock.toString(),
      (p.sold || 0).toString(),
      p.price.toString(),
    ]);

    // タブ区切りで作成（Excelが確実に認識する形式）
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\r\n');

    // BOM付きUTF-16LEで出力（Excelが最も確実に認識する形式）
    // UTF-16LE BOM: 0xFF 0xFE
    const bom = new Uint8Array([0xFF, 0xFE]);
    const encoder = new TextEncoder();

    // UTF-16LEに変換
    const textArray = new Uint16Array(tsvContent.length);
    for (let i = 0; i < tsvContent.length; i++) {
      textArray[i] = tsvContent.charCodeAt(i);
    }

    // BOMとコンテンツを結合
    const combinedArray = new Uint8Array(bom.length + textArray.byteLength);
    combinedArray.set(bom, 0);
    combinedArray.set(new Uint8Array(textArray.buffer), bom.length);

    const blob = new Blob([combinedArray], { type: 'text/plain;charset=utf-16le;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    // .txt拡張子でExcelがタブ区切りとして認識
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  // CSVをパースする共通関数
  const parseAndImportCsv = async (text: string) => {
    if (!db) return;

    // BOMを除去
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/);

    // タブ区切りかカンマ区切りかを自動判定
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    console.log('区切り文字:', delimiter === '\t' ? 'タブ' : 'カンマ');

    const headers = lines[0].split(delimiter).map(h => h.replace(/"/g, '').trim());

    console.log('CSVヘッダー:', headers);

    // SKU列のインデックスを取得
    const skuIndex = headers.findIndex(h => h === 'SKU');
    const stockIndex = headers.findIndex(h => h === '現在在庫' || h.includes('在庫'));

    if (skuIndex === -1) {
      alert('CSVファイルにSKU列が必要です。\nヘッダー: ' + headers.join(', '));
      return;
    }

    if (stockIndex === -1) {
      alert('CSVファイルに在庫列（現在在庫）が必要です。\nヘッダー: ' + headers.join(', '));
      return;
    }

    const batch = writeBatch(db);
    let updatedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(delimiter).map(v => v.replace(/"/g, '').trim());
      const sku = values[skuIndex];
      const newStock = parseInt(values[stockIndex], 10);

      if (sku && !isNaN(newStock)) {
        // SKUで商品を検索
        const product = products.find(p => p.sku === sku);
        if (product) {
          batch.update(doc(db, 'products', product.id), {
            stock: newStock,
            updatedAt: new Date(),
          });
          updatedCount++;
        }
      }
    }

    await batch.commit();
    await loadProducts();
    alert(`${updatedCount}件の商品の在庫を更新しました`);
  };

  const importFromCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !db) return;

    // ファイルをArrayBufferとして読み込む
    const readerBuffer = new FileReader();
    readerBuffer.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);

        let text = '';
        let encoding = 'unknown';

        // BOMをチェックしてエンコーディングを判定
        if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
          // UTF-16LE BOM
          encoding = 'UTF-16LE';
          const uint16Array = new Uint16Array(buffer, 2); // BOMをスキップ
          text = String.fromCharCode(...uint16Array);
        } else if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
          // UTF-16BE BOM
          encoding = 'UTF-16BE';
          const view = new DataView(buffer, 2);
          const chars = [];
          for (let i = 0; i < view.byteLength; i += 2) {
            chars.push(view.getUint16(i, false));
          }
          text = String.fromCharCode(...chars);
        } else if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
          // UTF-8 BOM
          encoding = 'UTF-8';
          const decoder = new TextDecoder('utf-8');
          text = decoder.decode(new Uint8Array(buffer, 3)); // BOMをスキップ
        } else {
          // BOMなし - UTF-8として試す
          encoding = 'UTF-8 (no BOM)';
          const decoder = new TextDecoder('utf-8');
          text = decoder.decode(buffer);
        }

        console.log('検出エンコーディング:', encoding);

        // SKUヘッダーをチェック
        const lines = text.split(/\r?\n/);
        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map(h => h.replace(/"/g, '').trim());

        if (headers.includes('SKU')) {
          await parseAndImportCsv(text);
        } else {
          // Shift-JISで再読み込み
          console.log('SKUヘッダーが見つからない、Shift-JISで再試行');
          const readerShiftJIS = new FileReader();
          readerShiftJIS.onload = async (e2) => {
            try {
              const textShiftJIS = e2.target?.result as string;
              await parseAndImportCsv(textShiftJIS);
            } catch (error) {
              console.error('Error importing CSV (Shift-JIS):', error);
              alert('CSVのインポートに失敗しました');
            }
          };
          readerShiftJIS.readAsText(file, 'Shift-JIS');
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('CSVのインポートに失敗しました');
      }
    };

    readerBuffer.readAsArrayBuffer(file);
    event.target.value = ''; // リセット
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
          <button onClick={() => navigate('/admin')}>ダッシュボードに戻る</button>
          <button onClick={() => navigate('/admin/products')}>商品管理</button>
          <button onClick={exportToCsv}>CSVエクスポート</button>
          <label className="admin-inventory__csv-import">
            インポート
            <input
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={importFromCsv}
              style={{ display: 'none' }}
            />
          </label>
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