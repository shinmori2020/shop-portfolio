import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sampleProducts } from '../data/products';

/**
 * サンプル商品データをFirestoreに追加
 */
export const seedProducts = async () => {
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  try {
    console.log('Starting product seeding...');

    // 既存の商品をチェック
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    if (snapshot.size > 0) {
      const confirm = window.confirm(
        `既に${snapshot.size}件の商品が登録されています。\n追加で商品を登録しますか？`
      );
      if (!confirm) {
        console.log('Product seeding cancelled');
        return;
      }
    }

    // サンプル商品を追加
    let addedCount = 0;
    for (const product of sampleProducts) {
      try {
        // 在庫数を設定（カテゴリによって変える）
        const defaultStock = {
          laptops: 20,
          smartphones: 30,
          accessories: 100,
          headphones: 50,
          tablets: 25,
          monitors: 15,
          keyboards: 80,
          mice: 100,
          speakers: 40,
        };

        const category = product.category || 'accessories';
        const stock = defaultStock[category as keyof typeof defaultStock] || 50;

        await addDoc(productsRef, {
          ...product,
          stock: stock,
          sold: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublished: true,
        });

        addedCount++;
        console.log(`Added product: ${product.name}`);
      } catch (error) {
        console.error(`Error adding product ${product.name}:`, error);
      }
    }

    console.log(`Successfully added ${addedCount} products`);
    alert(`${addedCount}件の商品を追加しました！`);

    // ページをリロードして商品を表示
    window.location.reload();
  } catch (error) {
    console.error('Error seeding products:', error);
    alert('商品の追加に失敗しました');
  }
};