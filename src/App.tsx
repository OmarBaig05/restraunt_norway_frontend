import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { PreOrderPage } from './pages/PreOrderPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { getSessionId } from './utils/sessionManager';
import { MyOrdersPage } from './pages/MyOrdersPage';

function App() {
  // Initialize session ID when app loads
  useEffect(() => {
    getSessionId(); // This will create a new session if one doesn't exist
  }, []);

  return (
    <LanguageProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="*" element={
                <>
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/menu" element={<MenuPage />} />
                      <Route path="/preorder" element={<PreOrderPage />} />
                      <Route path="/delivery" element={<DeliveryPage />} />
                      <Route path="my-orders" element={<MyOrdersPage />} /> 
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;