import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layouts/Header';
import { Footer } from './components/layouts/Footer';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Categories } from './pages/Categories';
import { About } from './pages/About';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { CommercialTransaction } from './pages/CommercialTransaction';
import { NotFound } from './pages/NotFound';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Checkout } from './pages/Checkout';
import { OrderComplete } from './pages/OrderComplete';
import { Orders } from './pages/Orders';
import { Account } from './pages/Account';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';
import './App.css';

function App() {
  useEffect(() => {
    // localStorage内のカートデータをチェック
    const cartData = localStorage.getItem('cart-storage');
    if (cartData) {
      try {
        const parsed = JSON.parse(cartData);
        // バージョンチェック：古いデータ形式の場合はクリア
        if (parsed.version !== 0) {
          // zustandのpersistのバージョンと一致しない場合はクリア
          console.log('Clearing old cart data format');
          localStorage.removeItem('cart-storage');
          window.location.reload();
        }
      } catch (error) {
        console.error('Invalid cart data, clearing...', error);
        localStorage.removeItem('cart-storage');
        window.location.reload();
      }
    }
  }, []);
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="app__content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/commercial-transaction" element={<CommercialTransaction />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-complete" element={<OrderComplete />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/account" element={<Account />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />

              {/* 404 Not Found - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
