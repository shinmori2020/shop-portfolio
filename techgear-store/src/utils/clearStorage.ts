// localStorageをクリアするユーティリティ関数
export const clearCartStorage = () => {
  try {
    localStorage.removeItem('cart-storage');
    console.log('Cart storage cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear cart storage:', error);
    return false;
  }
};

// 全てのlocalStorageをクリア（開発時のデバッグ用）
export const clearAllStorage = () => {
  try {
    localStorage.clear();
    console.log('All storage cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
};