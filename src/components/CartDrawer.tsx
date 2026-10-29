import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  navigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQuantity,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPKR,
    settings
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold || 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    const res = await applyCoupon(couponInput);
    setCouponLoading(false);

    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0E0E12] border-l border-[#23232C] text-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#1E1E26] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-amber-400" size={20} />
              <h2 className="font-cinzel text-base font-bold tracking-wider">
                YOUR ATELIER BAG ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1C1C24] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-[#131318] border-b border-[#20202A] text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-gray-300">
                <Truck size={14} className="text-amber-400" />
                {amountNeeded === 0 ? (
                  <span className="text-emerald-400 font-semibold">
                    Congratulations! You qualify for Free Express Shipping
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-amber-400">{formatPKR(amountNeeded)}</strong> more for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-amber-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#20202A] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#181822] flex items-center justify-center text-gray-500">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-cinzel text-white text-lg font-bold">Your Bag is Empty</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Discover our curated menswear, luxury traditional suits, and pret collections crafted for elegance.
                </p>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate('/products');
                  }}
                  className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs px-6 py-2.5 rounded-full hover:brightness-110 transition-all cursor-pointer"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-3.5 p-3 rounded-xl bg-[#14141A] border border-[#22222C] relative"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=80'}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover object-top rounded-lg bg-[#181822] shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-white text-xs font-semibold line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                          className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-gray-400">
                        <span className="bg-[#1F1F2A] px-2 py-0.5 rounded text-amber-300 font-mono">
                          Size: {item.selectedSize}
                        </span>
                        <span className="bg-[#1F1F2A] px-2 py-0.5 rounded text-gray-300 font-mono">
                          {item.selectedColor}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1F1F2A]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#2B2B38] rounded-lg overflow-hidden bg-[#101016]">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-[#20202A] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-[#20202A] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Total */}
                      <span className="font-cinzel text-amber-400 font-bold text-xs sm:text-sm">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#121217] border-t border-[#20202A] space-y-3">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatPKR(appliedCoupon.discountAmount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-red-400 text-[11px] underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Promo Code (e.g. WELCOME10)"
                        className="w-full bg-[#181822] border border-[#2B2B3A] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 uppercase font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-[#242432] hover:bg-amber-500 hover:text-black text-gray-200 text-xs font-semibold px-4 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-300 pt-2 border-t border-[#1C1C24]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatPKR(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">-{formatPKR(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping (Pakistan)</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      formatPKR(shippingFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm sm:text-base font-bold text-white pt-2 border-t border-[#22222E]">
                  <span className="font-cinzel tracking-wider">ESTIMATED TOTAL</span>
                  <span className="font-cinzel text-amber-400">{formatPKR(total)}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-extrabold text-sm py-3 rounded-xl transition-all shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center">
                <ShieldCheck size={14} className="text-amber-400" />
                <span>Cash on Delivery Available Nationwide</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
