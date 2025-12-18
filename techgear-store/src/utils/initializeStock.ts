import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * 既存の商品に在庫フィールドを追加する初期化スクリプト
 * 開発時に一度実行すれば十分
 */
export const initializeProductStock = async () => {
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  try {
    console.log('Initializing product stock...');
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const updatePromises = snapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();

      // 既に在庫フィールドがある場合はスキップ
      if (data.stock !== undefined) {
        console.log(`Product ${data.name} already has stock field`);
        return;
      }

      // デフォルトの在庫数を設定（商品カテゴリによって変える）
      let defaultStock = 50;
      if (data.category === 'laptops') {
        defaultStock = 20;
      } else if (data.category === 'smartphones') {
        defaultStock = 30;
      } else if (data.category === 'accessories') {
        defaultStock = 100;
      }

      // 在庫フィールドを追加
      await updateDoc(doc(db, 'products', docSnapshot.id), {
        stock: defaultStock,
        sold: 0,
        updatedAt: new Date(),
      });

      console.log(`Added stock field to ${data.name}: ${defaultStock}`);
    });

    await Promise.all(updatePromises);
    console.log('Stock initialization completed');
  } catch (error) {
    console.error('Error initializing stock:', error);
  }
};

/**
 * 特定の商品の在庫を更新
 */
export const updateProductStock = async (
  productId: string,
  newStock: number
) => {
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  try {
    await updateDoc(doc(db, 'products', productId), {
      stock: newStock,
      updatedAt: new Date(),
    });
    console.log(`Stock updated for product ${productId}: ${newStock}`);
  } catch (error) {
    console.error('Error updating stock:', error);
  }
};