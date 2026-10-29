import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  PackageCheck, 
  Heart, 
  MapPin, 
  Printer, 
  LogOut, 
  ShieldCheck, 
  Save, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';
import { Order, Product } from '../types';
import { useStore } from '../context/StoreContext';

interface CustomerAccountPageProps {
  initialTab?: string;
  navigate: (route: string) => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({ initialTab, navigate }) => {
  const {
    currentUser,
    token,
    isAdmin,
    wishlist,
    toggleWishlist,
    addToCart,
    logout,
    formatPKR,
    setAuthModalOpen,
    showToast,
    updateCustomerProfile
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>(
    (initialTab as any) || 'orders'
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Lahore');
  const [province, setProvince] = useState(currentUser?.province || 'Punjab');
  const [address, setAddress] = useState(currentUser?.address || '');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
      setCity(currentUser.city || 'Lahore');
      setProvince(currentUser.province || 'Punjab');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  // Fetch My Orders
  useEffect(() => {
    if (token) {
      setLoadingOrders(true);
      fetch('/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setOrders(data || []);
          setLoadingOrders(false);
        })
        .catch(() => setLoadingOrders(false));
    }
  }, [token]);

  // Fetch Wishlist Products
  useEffect(() => {
    if (wishlist.length > 0) {
      fetch('/api/products')
        .then((r) => r.json())
        .then((all) => {
          setWishlistProducts(all.filter((p: Product) => wishlist.includes(p.id)));
        })
        .catch(() => {});
    } else {
      setWishlistProducts([]);
    }
  }, [wishlist]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#14141E] flex items-center justify-center text-amber-400">
          <UserIcon size={28} />
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold">Sign In to Your VIP Account</h2>
        <p className="text-gray-400 text-xs max-w-sm text-center">
          Access your personalized order history, track live Pakistani consignments, and manage your luxury wardrobe preferences.
        </p>
        <button
          onClick={() => setAuthModalOpen(true, 'login')}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs px-8 py-3 rounded-full hover:brightness-110 shadow-lg shadow-amber-950/30"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({ name, phone, city, province, address });
    showToast('Profile information saved successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Customer Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0E0E14] border border-[#22222E] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center font-cinzel font-bold text-2xl shadow-lg shadow-amber-950/40">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
                {currentUser.name}
              </h1>
              {isAdmin && (
                <span className="text-[10px] bg-amber-500 text-black font-extrabold uppercase px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-amber-400 font-mono mt-0.5">{currentUser.email}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Member since {new Date(currentUser.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2.5 rounded-xl bg-[#1A1A24] border border-[#2B2B38] text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#20202A] gap-4 sm:gap-8 text-xs font-cinzel font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'text-amber-400 border-amber-400'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <PackageCheck size={16} />
          <span>My Orders &amp; Consignments ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'wishlist'
              ? 'text-amber-400 border-amber-400'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <Heart size={16} />
          <span>Saved Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'text-amber-400 border-amber-400'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          <UserIcon size={16} />
          <span>Profile &amp; Addresses</span>
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-12 text-center text-amber-400 animate-pulse">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center bg-[#0E0E14] border border-[#22222E] rounded-2xl p-8 space-y-3">
              <PackageCheck size={36} className="text-gray-600 mx-auto" />
              <h3 className="text-white font-bold text-base">No Orders Placed Yet</h3>
              <p className="text-gray-400 text-xs">
                Your luxury attire orders will appear here with live courier tracking updates and invoices.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="mt-3 bg-amber-500 text-black font-bold text-xs px-6 py-2.5 rounded-full"
              >
                Shop Masterpieces
              </button>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4 hover:border-amber-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E1E28]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{o.id}</span>
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-amber-500/30">
                        {o.orderStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {o.paymentMethod.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/track-order?orderId=${encodeURIComponent(o.id)}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#181824] border border-[#2E2E3E] text-xs font-semibold text-gray-200 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <PackageCheck size={14} className="text-amber-400" />
                      <span>Track Status</span>
                    </button>

                    <button
                      onClick={() => setSelectedInvoiceOrder(o)}
                      className="px-3 py-1.5 rounded-lg bg-[#181824] border border-[#2E2E3E] text-xs font-semibold text-gray-200 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#181824]">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-14 object-cover object-top rounded-lg bg-[#181822]"
                        />
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-[11px] text-gray-400">
                            Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">{formatPKR(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#1C1C26] text-xs">
                  <span className="text-gray-400">
                    Delivered to: <strong className="text-gray-200">{o.shippingAddress.city}, {o.shippingAddress.province}</strong>
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-cinzel text-amber-400 font-bold text-sm">
                      {formatPKR(o.total)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="py-16 text-center bg-[#0E0E14] border border-[#22222E] rounded-2xl p-8 space-y-3">
              <Heart size={36} className="text-gray-600 mx-auto" />
              <h3 className="text-white font-bold text-base">Your Wishlist is Empty</h3>
              <p className="text-gray-400 text-xs">
                Explore our collections and tap the heart icon on any piece you adore.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="mt-3 bg-amber-500 text-black font-bold text-xs px-6 py-2.5 rounded-full"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#121217] rounded-xl border border-[#23232D] overflow-hidden flex flex-col justify-between p-3 relative"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[3/4] object-cover object-top rounded-lg bg-[#181822] cursor-pointer"
                    onClick={() => navigate(`/product/${p.id}`)}
                  />
                  <div className="mt-3">
                    <p className="text-[10px] text-amber-400 uppercase font-mono">{p.category}</p>
                    <h4 className="text-xs font-semibold text-white line-clamp-1">{p.name}</h4>
                    <p className="font-cinzel text-amber-400 font-bold text-xs mt-1">
                      {formatPKR(p.salePrice || p.regularPrice)}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          addToCart(p, p.sizes[0] || 'Standard', p.colors[0]?.name || 'Standard', 1);
                        }}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag size={13} />
                        <span>Move to Bag</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-2 rounded-lg bg-[#181822] text-gray-400 hover:text-red-400"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile & Address */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-[#0E0E14] border border-[#22222E] rounded-2xl p-6 sm:p-8">
          <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider mb-4 pb-3 border-b border-[#1E1E28]">
            Customer Profile &amp; Default Pakistani Shipping Address
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-[#121218] border border-[#22222E] rounded-xl py-2.5 px-3.5 text-gray-400 cursor-not-allowed font-mono"
              />
              <span className="text-[10px] text-gray-500">Email cannot be changed after registration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Phone Number (Pakistan)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Province</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lahore / Karachi / Islamabad"
                className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Street Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Apartment #, Street #, Sector / Area"
                className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
};
