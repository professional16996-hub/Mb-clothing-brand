import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { 
  AboutUsPage, 
  ContactUsPage, 
  FAQPage, 
  ShippingPolicyPage, 
  ReturnPolicyPage 
} from './pages/StaticPages';
import { AdminLayout } from './admin/AdminLayout';
import { CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

// Inner App with Routing
const MainApp: React.FC = () => {
  const { toast } = useStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parse path and query
  const [pathname, searchStr] = currentPath.split('?');
  const searchParams = new URLSearchParams(searchStr || '');

  // Route Dispatcher
  const renderContent = () => {
    // Admin route
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      const tab = searchParams.get('view') || 'dashboard';
      return <AdminLayout navigate={navigate} initialTab={tab} />;
    }

    if (pathname === '/' || pathname === '') {
      return <HomePage navigate={navigate} />;
    }

    if (pathname === '/products') {
      const cat = searchParams.get('category') || undefined;
      const search = searchParams.get('search') || undefined;
      const sale = searchParams.get('sale') === 'true';
      return (
        <ProductsPage
          initialCategory={cat}
          initialSearch={search}
          initialSale={sale}
          navigate={navigate}
        />
      );
    }

    if (pathname.startsWith('/product/')) {
      const prodId = pathname.replace('/product/', '');
      return <ProductDetailPage productId={prodId} navigate={navigate} />;
    }

    if (pathname === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    if (pathname.startsWith('/order-confirmation/')) {
      const orderId = pathname.replace('/order-confirmation/', '');
      return <OrderConfirmationPage orderId={orderId} navigate={navigate} />;
    }

    if (pathname === '/track-order') {
      const orderId = searchParams.get('orderId') || undefined;
      return <OrderTrackingPage initialOrderId={orderId} navigate={navigate} />;
    }

    if (pathname === '/account') {
      const tab = searchParams.get('tab') || 'orders';
      return <CustomerAccountPage initialTab={tab} navigate={navigate} />;
    }

    if (pathname === '/about') {
      return <AboutUsPage navigate={navigate} />;
    }

    if (pathname === '/contact') {
      return <ContactUsPage />;
    }

    if (pathname === '/faq') {
      return <FAQPage />;
    }

    if (pathname === '/shipping-policy') {
      return <ShippingPolicyPage />;
    }

    if (pathname === '/return-policy') {
      return <ReturnPolicyPage />;
    }

    // Fallback to Home
    return <HomePage navigate={navigate} />;
  };

  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold border ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200 shadow-red-950/50'
                : toast.type === 'info'
                ? 'bg-blue-950/90 border-blue-500/50 text-blue-200 shadow-blue-950/50'
                : 'bg-[#181824]/95 border-amber-500/50 text-amber-300 shadow-amber-950/50 backdrop-blur-md'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info size={16} className="text-blue-400 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Render Storefront Nav & Footers only if not in Admin */}
      {!isAdminRoute && <Navbar currentRoute={pathname} navigate={navigate} />}

      <div className="flex-1">{renderContent()}</div>

      {!isAdminRoute && <Footer navigate={navigate} />}

      {/* Floating Admin Panel Switcher */}
      {!isAdminRoute && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 bg-[#121218]/95 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 text-amber-300 hover:text-black border border-amber-500/40 px-4 py-2.5 rounded-full text-xs font-extrabold shadow-2xl backdrop-blur-md transition-all cursor-pointer group"
            title="Open MB Clothing Admin Panel"
          >
            <ShieldCheck size={16} className="text-amber-400 group-hover:text-black" />
            <span>Admin Panel</span>
          </button>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <CartDrawer navigate={navigate} />
      <QuickViewModal navigate={navigate} />
      <AuthModal navigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
