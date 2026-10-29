import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  Truck, 
  PhoneCall, 
  ChevronDown,
  LogOut,
  PackageCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { 
    currentUser, 
    isAdmin, 
    cart, 
    wishlist, 
    setCartOpen, 
    setAuthModalOpen, 
    logout, 
    formatPKR,
    settings 
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categoriesNav = [
    { name: 'All Collections', path: '/products' },
    { name: 'Traditional Wear', path: '/products?category=Traditional%20Wear' },
    { name: "Men's Clothing", path: "/products?category=Men's%20Clothing" },
    { name: "Women's Clothing", path: "/products?category=Women's%20Clothing" },
    { name: 'Shirts', path: '/products?category=Shirts' },
    { name: 'T-Shirts', path: '/products?category=T-Shirts' },
    { name: 'Jeans & Trousers', path: '/products?category=Jeans' },
    { name: 'Hoodies', path: '/products?category=Hoodies' },
    { name: 'Sale', path: '/products?sale=true', highlight: true },
    { name: '🛡️ Admin Panel', path: '/admin', highlight: true }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#23232A]">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-[#121216] border-b border-[#1E1E24] text-[11px] py-1.5 px-4 text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <Truck size={13} className="text-amber-400" />
              Free Nationwide Express Shipping on Orders Over {formatPKR(settings.freeShippingThreshold)}
            </span>
            <span className="hidden md:inline text-gray-600">|</span>
            <span className="hidden md:inline text-gray-300">
              Cash on Delivery (COD) Available Across Pakistan
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <button 
              onClick={() => navigate('/track-order')} 
              className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PackageCheck size={12} className="text-amber-400" />
              <span>Track Order</span>
            </button>
            <span className="text-gray-700">•</span>
            <a 
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20MB%20Clothing%2C%20I%20have%20an%20inquiry`} 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors flex items-center gap-1 text-emerald-400 font-medium"
            >
              <PhoneCall size={12} />
              <span>WhatsApp Concierge</span>
            </a>
            <span className="text-gray-700">•</span>
            <button
              onClick={() => navigate('/admin')}
              className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded text-[10px] font-bold border border-amber-500/40 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              title="Open MB Clothing Admin Panel"
            >
              <ShieldCheck size={12} className="text-amber-400" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Quick Links */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-300 hover:text-amber-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gray-300 hover:text-amber-400"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Center/Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/')} 
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-[#D4AF37] via-[#AA8022] to-[#684C0F] p-[1px] shadow-lg shadow-amber-950/20">
                <div className="w-full h-full bg-[#0B0B0E] flex items-center justify-center font-cinzel font-black text-amber-400 text-lg tracking-tighter">
                  MB
                </div>
              </div>
              <div>
                <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.2em] text-white group-hover:text-amber-300 transition-colors">
                  MB CLOTHING
                </span>
                <span className="block text-[9px] uppercase tracking-[0.25em] text-amber-400/80 -mt-1 font-medium">
                  Atelier &bull; Pakistan
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Kurta, Prince Coat, Blazers, Egyptian Shirts, Jeans..."
              className="w-full bg-[#15151A] border border-[#2A2A34] text-xs text-gray-200 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-amber-500/60 transition-colors placeholder-gray-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Right Actions: Wishlist, Account, Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wishlist */}
          <button
            onClick={() => {
              if (!currentUser) {
                setAuthModalOpen(true, 'login');
              } else {
                navigate('/account?tab=wishlist');
              }
            }}
            className="relative p-2 text-gray-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Wishlist"
          >
            <Heart size={21} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* User Account / Profile */}
          <div className="relative">
            {currentUser ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-[#1A1A22] text-gray-300 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs font-bold uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <ChevronDown size={14} className="hidden sm:inline text-gray-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-[#16161C] border border-[#2D2D38] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#242430]">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-amber-400 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate('/account');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-200 hover:bg-[#202028] hover:text-amber-300 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon size={14} /> My Profile &amp; Addresses
                    </button>

                    <button
                      onClick={() => {
                        navigate('/account?tab=orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-200 hover:bg-[#202028] hover:text-amber-300 flex items-center gap-2 cursor-pointer"
                    >
                      <PackageCheck size={14} /> My Orders &amp; Invoices
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-400 hover:bg-[#202028] font-medium flex items-center gap-2 cursor-pointer border-t border-[#242430]"
                      >
                        <ShieldCheck size={14} /> Admin Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-[#202028] flex items-center gap-2 cursor-pointer border-t border-[#242430]"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true, 'login')}
                className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-amber-400 font-medium px-2.5 py-1.5 rounded-lg border border-[#2D2D38] hover:border-amber-500/40 transition-colors cursor-pointer"
              >
                <UserIcon size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>

          {/* Admin Panel Header Button */}
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500 hover:to-amber-600 text-amber-300 hover:text-black border border-amber-500/50 px-3 py-1.5 rounded-full font-bold text-xs transition-all shadow-sm cursor-pointer"
            title="Open Store Administration"
          >
            <ShieldCheck size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Admin Panel</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-3.5 py-1.5 rounded-full font-semibold text-xs transition-all shadow-md shadow-amber-900/30 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag size={17} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-amber-300 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-amber-400">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline font-bold">
              {formatPKR(cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="lg:hidden px-4 pb-3 border-t border-[#1E1E26] pt-3 bg-[#0E0E12]">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clothing, fabrics, sizes..."
              className="w-full bg-[#181820] border border-[#2E2E3C] text-xs text-white rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Desktop Category Navigation Bar */}
      <nav className="hidden lg:block border-t border-[#1C1C22] bg-[#0E0E12]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 py-2 text-xs">
          {categoriesNav.map((cat) => {
            const isActive = currentRoute === cat.path;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(cat.path)}
                className={`transition-colors font-medium cursor-pointer py-1 ${
                  cat.highlight
                    ? 'text-amber-400 hover:text-amber-300 font-semibold'
                    : isActive
                    ? 'text-amber-400 border-b border-amber-400'
                    : 'text-gray-300 hover:text-amber-300'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#23232D] bg-[#121217] px-5 py-4 animate-in slide-in-from-top-4">
          <div className="flex flex-col space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Categories</p>
            {categoriesNav.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  navigate(cat.path);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-sm py-1.5 font-medium transition-colors cursor-pointer ${
                  cat.highlight
                    ? 'text-amber-400 font-bold'
                    : 'text-gray-200 hover:text-amber-400'
                }`}
              >
                {cat.name}
              </button>
            ))}

            <div className="pt-3 border-t border-[#22222C] flex flex-col space-y-2">
              <button
                onClick={() => {
                  navigate('/track-order');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs text-gray-300 hover:text-amber-400 py-1 flex items-center gap-2"
              >
                <PackageCheck size={14} className="text-amber-400" /> Track My Order
              </button>
              <button
                onClick={() => {
                  navigate('/contact');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs text-gray-300 hover:text-amber-400 py-1"
              >
                Contact &amp; Flagship Stores
              </button>
              <button
                onClick={() => {
                  navigate('/about');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs text-gray-300 hover:text-amber-400 py-1"
              >
                About MB Atelier
              </button>
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs text-black font-extrabold py-2 px-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg flex items-center gap-2 shadow-md cursor-pointer mt-2"
              >
                <ShieldCheck size={16} /> Open Admin Operations Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
