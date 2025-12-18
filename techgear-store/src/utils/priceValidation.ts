import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, OrderItem } from '../types';

/**
 * 商品価格の検証
 * Firestoreから最新の価格を取得して、クライアント側の価格と照合
 */
export const validateProductPrice = async (
  productId: string,
  clientPrice: number
): Promise<{ isValid: boolean; serverPrice: number }> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));

    if (!productDoc.exists()) {
      console.error(`Product not found: ${productId}`);
      return { isValid: false, serverPrice: 0 };
    }

    const productData = productDoc.data();
    const serverPrice = productData.salePrice || productData.price || 0;

    // 価格の差異を確認（1円の誤差も許容しない）
    const isValid = Math.abs(serverPrice - clientPrice) < 0.01;

    if (!isValid) {
      console.warn(`Price mismatch for product ${productId}: Client=${clientPrice}, Server=${serverPrice}`);
    }

    return { isValid, serverPrice };
  } catch (error) {
    console.error('Error validating price:', error);
    return { isValid: false, serverPrice: 0 };
  }
};

/**
 * カート全体の価格検証
 * すべてのアイテムの価格をサーバーと照合
 */
export const validateCartPrices = async (
  items: Array<{ product: Product; quantity: number }>
): Promise<{
  isValid: boolean;
  validatedItems: OrderItem[];
  errors: string[];
}> => {
  const errors: string[] = [];
  const validatedItems: OrderItem[] = [];
  let isValid = true;

  for (const item of items) {
    try {
      const validation = await validateProductPrice(
        item.product.id,
        item.product.price
      );

      if (!validation.isValid) {
        isValid = false;
        errors.push(
          `価格が変更されています: ${item.product.name} (最新価格: ¥${validation.serverPrice.toLocaleString()})`
        );
      }

      // サーバー価格で検証済みアイテムを作成
      validatedItems.push({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl || '',
        price: validation.serverPrice, // サーバー価格を使用
        quantity: item.quantity,
        subtotal: validation.serverPrice * item.quantity,
      });
    } catch (error) {
      isValid = false;
      errors.push(`商品の検証に失敗しました: ${item.product.name}`);
    }
  }

  return { isValid, validatedItems, errors };
};

/**
 * 注文合計金額の検証
 * 送料と税金を含めた合計金額を再計算
 */
export const calculateValidatedTotal = (
  items: OrderItem[],
  shippingThreshold: number = 5000,
  shippingFee: number = 500,
  taxRate: number = 0.1
): {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
} => {
  // 小計を計算
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  // 送料を計算
  const shipping = subtotal >= shippingThreshold ? 0 : shippingFee;

  // 税金を計算
  const tax = Math.floor(subtotal * taxRate);

  // 合計を計算
  const total = subtotal + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    total,
  };
};

/**
 * 在庫チェック
 * 商品の在庫数を確認
 */
export const checkProductStock = async (
  productId: string,
  requestedQuantity: number
): Promise<{
  hasStock: boolean;
  availableStock: number;
  message?: string;
}> => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const productDoc = await getDoc(doc(db, 'products', productId));

    if (!productDoc.exists()) {
      return {
        hasStock: false,
        availableStock: 0,
        message: '商品が見つかりません',
      };
    }

    const productData = productDoc.data();
    const stock = productData.stock || productData.inventory || 0;

    if (stock === undefined || stock === null) {
      // 在庫管理していない商品は購入可能とする
      return {
        hasStock: true,
        availableStock: 999,
      };
    }

    const hasStock = stock >= requestedQuantity;

    return {
      hasStock,
      availableStock: stock,
      message: hasStock ? undefined : `在庫が不足しています (残り${stock}個)`,
    };
  } catch (error) {
    console.error('Error checking stock:', error);
    return {
      hasStock: false,
      availableStock: 0,
      message: '在庫確認中にエラーが発生しました',
    };
  }
};

/**
 * カート全体の在庫チェック
 */
export const validateCartStock = async (
  items: Array<{ product: Product; quantity: number }>
): Promise<{
  hasStock: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  let hasStock = true;

  for (const item of items) {
    const stockCheck = await checkProductStock(
      item.product.id,
      item.quantity
    );

    if (!stockCheck.hasStock) {
      hasStock = false;
      errors.push(
        `${item.product.name}: ${stockCheck.message || '在庫が不足しています'}`
      );
    }
  }

  return { hasStock, errors };
};