import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { getSessionId } from './utils/sessionManager';
 
// lazy-loaded pages for code-splitting
const HomePage = lazy(() =>
  import('./pages/HomePage').then(mod => ({ default: (mod as any).default || (mod as any).HomePage || mod }))
);
const MenuPage = lazy(() =>
  import('./pages/MenuPage').then(mod => ({ default: (mod as any).default || (mod as any).MenuPage || mod }))
);
const PreOrderPage = lazy(() =>
  import('./pages/PreOrderPage').then(mod => ({ default: (mod as any).default || (mod as any).PreOrderPage || mod }))
);
const DeliveryPage = lazy(() =>
  import('./pages/DeliveryPage').then(mod => ({ default: (mod as any).default || (mod as any).DeliveryPage || mod }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/AdminLoginPage').then(mod => ({ default: (mod as any).default || (mod as any).AdminLoginPage || mod }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then(mod => ({ default: (mod as any).default || (mod as any).AdminDashboardPage || mod }))
);
const MyOrdersPage = lazy(() =>
  import('./pages/MyOrdersPage').then(mod => ({ default: (mod as any).default || (mod as any).MyOrdersPage || mod }))
);
 
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
              <Route path="/admin/login" element={
                <Suspense fallback={null}><AdminLoginPage /></Suspense>
              } />
              <Route path="/admin/dashboard" element={
                <Suspense fallback={null}><AdminDashboardPage /></Suspense>
              } />
              <Route path="*" element={
                <>
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Suspense fallback={null}><HomePage /></Suspense>} />
                      <Route path="/menu" element={<Suspense fallback={null}><MenuPage /></Suspense>} />
                      <Route path="/preorder" element={<Suspense fallback={null}><PreOrderPage /></Suspense>} />
                      <Route path="/delivery" element={<Suspense fallback={null}><DeliveryPage /></Suspense>} />
                      <Route path="my-orders" element={<Suspense fallback={null}><MyOrdersPage /></Suspense>} />
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