import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  ShoppingBag, 
  Users, 
  Tag, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck,
  Truck
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminProductsView } from './AdminProductsView';
import { AdminOrdersView } from './AdminOrdersView';
import { AdminCustomersView } from './AdminCustomersView';
import { AdminMarketingView } from './AdminMarketingView';
import { AdminCouponsShippingView } from './AdminCouponsShippingView';
import { AdminSettingsView } from './AdminSettingsView';
import { useStore } from '../context/StoreContext';

interface AdminLayoutProps {
  navigate: (route: string) => void;
  initialTab?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ navigate, initialTab = 'dashboard' }) => {
  const { currentUser, isAdmin, logout } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not logged in as admin, show the secure Admin Login portal
  if (!currentUser || !isAdmin) {
    return <AdminLogin onSuccess={() => setActiveTab('dashboard')} navigate={navigate} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Garment Catalog', icon: Layers },
    { id: 'orders', label: 'Orders & Logistics', icon: ShoppingBag },
    { id: 'customers', label: 'VIP Customers', icon: Users },
    { id: 'marketing', label: 'Categories & Banners', icon: ImageIcon },
    { id: 'coupons', label: 'Coupons & Shipping', icon: Tag },
    { id: 'settings', label: 'Store Settings', icon: Settings }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-200 flex flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0A0A0E] border-r border-[#1C1C24] p-5 shrink-0 justify-between h-screen sticky top-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#1C1C24]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#7E5E14] p-[1px] shadow-lg shadow-amber-950/40">
              <div className="w-full h-full bg-[#0B0B0E] rounded-[11px] flex items-center justify-center font-cinzel font-black text-amber-400 text-lg">
                MB
              </div>
            </div>
            <div>
              <span className="font-cinzel text-sm font-bold tracking-widest text-white block">
                MB ATELIER
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Management Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-950/20 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-[#14141E]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Storefront link */}
        <div className="pt-4 border-t border-[#1C1C24] space-y-2 text-xs">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14141E] border border-[#232332] text-amber-400 hover:bg-[#1C1C28] text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink size={14} />
            <span>View Live Storefront</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-[#1C1C28] text-xs transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar for Admin */}
      <header className="lg:hidden bg-[#0A0A0E] border-b border-[#1C1C24] p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-cinzel text-sm font-bold text-white">MB Admin Portal</span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs text-amber-400 font-semibold flex items-center gap-1"
        >
          <span>Store</span>
          <ExternalLink size={12} />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="w-64 bg-[#0A0A0E] h-full p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#20202E]">
                <span className="font-cinzel text-sm font-bold text-amber-400">MB ATELIER</span>
                <button onClick={() => setMobileMenuOpen(false)}><X size={18} /></button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-amber-500 text-black font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#1C1C24]">
              <button
                onClick={() => navigate('/')}
                className="w-full text-left text-xs text-amber-400 py-1.5 flex items-center gap-2"
              >
                <ExternalLink size={14} /> Live Storefront
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full text-left text-xs text-red-400 py-1.5 flex items-center gap-2"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {activeTab === 'dashboard' && <AdminDashboardView onNavigateTab={handleTabChange} />}
        {activeTab === 'products' && <AdminProductsView />}
        {activeTab === 'orders' && <AdminOrdersView />}
        {activeTab === 'customers' && <AdminCustomersView />}
        {activeTab === 'marketing' && <AdminMarketingView />}
        {activeTab === 'coupons' && <AdminCouponsShippingView />}
        {activeTab === 'settings' && <AdminSettingsView />}
      </main>
    </div>
  );
};
