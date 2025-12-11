import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderStatus } from './pages/OrderStatus';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';

// Wrapper to conditionally render Navbar/MobileNav
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {children}
      {!isAdminRoute && <MobileNav />}
    </>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-background text-white font-sans">
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderStatus />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<Login />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
