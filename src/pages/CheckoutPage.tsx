import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  Building2, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CheckoutPageProps {
  navigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const {
    cart,
    clearCart,
    currentUser,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings,
    formatPKR
  } = useStore();

  // Customer & Shipping Form
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+92 3');
  const [province, setProvince] = useState(currentUser?.province || 'Punjab');
  const [city, setCity] = useState(currentUser?.city || 'Lahore');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [landmark, setLandmark] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Shipping & Payment Options
  const [shippingType, setShippingType] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'card'>('cod');
  const [bankRef, setBankRef] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pakistaniCities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Bahawalpur',
    'Sargodha',
    'Abbottabad',
    'Sukkur',
    'Sheikhupura',
    'Gujrat',
    'Mardan',
    'Kasur',
    'Rahim Yar Khan',
    'Sahiwal',
    'Okara',
    'Wah Cantt',
    'Dera Ghazi Khan',
    'Mirpur (AJK)',
    'Muzaffarabad (AJK)',
    'Gilgit'
  ];

  const pakistaniProvinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad Capital Territory',
    'Azad Jammu & Kashmir',
    'Gilgit-Baltistan'
  ];

  // Dynamic Shipping Calculation
  const isFreeStandard = subtotal >= settings.freeShippingThreshold;
  const standardFee = isFreeStandard ? 0 : settings.standardShippingFee;
  const expressFee = isFreeStandard
    ? settings.expressShippingFee - settings.standardShippingFee
    : settings.expressShippingFee;

  const currentShippingFee = shippingType === 'standard' ? standardFee : expressFee;
  const finalTotal = Math.max(0, subtotal - discount + currentShippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg('');
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);
    if (!res.success) {
      setCouponMsg(res.message);
    } else {
      setCouponCode('');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your bag is currently empty. Please add items before checking out.');
      return;
    }

    if (!fullName || !phone || !address || !city) {
      setErrorMsg('Please complete all required shipping fields (Name, Phone, City, Address).');
      return;
    }

    if (!phone.includes('3') || phone.length < 10) {
      setErrorMsg('Please enter a valid Pakistani mobile number (e.g. +92 300 1234567).');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          fullName,
          phone,
          email,
          province,
          city,
          address,
          landmark,
          postalCode
        },
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        })),
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        paymentMethod,
        shippingType,
        notes: notes + (paymentMethod === 'bank_transfer' && bankRef ? ` | Bank Ref: ${bankRef}` : '')
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('mb_token')
            ? { Authorization: `Bearer ${localStorage.getItem('mb_token')}` }
            : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to process order. Please try again.');
        return;
      }

      // Order created successfully!
      clearCart();
      navigate(`/order-confirmation/${data.order.id}`);
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Error communicating with server.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#161622] flex items-center justify-center text-amber-400">
          <ShoppingBag size={28} />
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold">Your Bag is Empty</h2>
        <p className="text-gray-400 text-xs max-w-sm text-center">
          Add items from our luxury menswear, traditional wear, or women's pret collections to proceed.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-amber-500 text-black font-bold text-xs px-6 py-2.5 rounded-full"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#1E1E26] mb-8">
        <div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold mb-1"
          >
            <ChevronLeft size={14} /> Back to Shopping
          </button>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-extrabold text-white">
            Secure Luxury Checkout
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Lock size={14} className="text-amber-400" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Customer, Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Details */}
          <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E1E28]">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center font-mono">
                1
              </span>
              <h2 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                Recipient Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Asad Mehmood"
                  className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  WhatsApp / Mobile Number <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Courier will send dispatch SMS and call prior to delivery
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email Address (For E-Invoice &amp; Tracking updates)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="asad.mehmood@gmail.com"
                className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Step 2: Shipping Address in Pakistan */}
          <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E1E28]">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center font-mono">
                2
              </span>
              <h2 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                Pakistan Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Province <span className="text-amber-400">*</span>
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {pakistaniProvinces.map((p) => (
                    <option key={p} value={p} className="bg-[#161620] text-white">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  City <span className="text-amber-400">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {pakistaniCities.map((c) => (
                    <option key={c} value={c} className="bg-[#161620] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Complete Street Address <span className="text-amber-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Apartment #, Street #, Block / Sector, Phase, Area name"
                className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Famous Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Y-Block Market, Opposite PSO"
                  className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 54000"
                  className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Courier Delivery Speed */}
          <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E1E28]">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center font-mono">
                3
              </span>
              <h2 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                Select Courier Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setShippingType('standard')}
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  shippingType === 'standard'
                    ? 'bg-amber-500/10 border-amber-400 shadow-md'
                    : 'bg-[#14141C] border-[#262634] hover:border-[#38384A]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-xs">Standard Express (TCS)</span>
                  <span className="font-mono text-amber-400 font-bold text-xs">
                    {standardFee === 0 ? 'FREE' : formatPKR(standardFee)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Delivered in 2-4 business days. Free for orders over {formatPKR(settings.freeShippingThreshold)}.
                </p>
              </label>

              <label
                onClick={() => setShippingType('express')}
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  shippingType === 'express'
                    ? 'bg-amber-500/10 border-amber-400 shadow-md'
                    : 'bg-[#14141C] border-[#262634] hover:border-[#38384A]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-xs">Priority Air Cargo (Next Day)</span>
                  <span className="font-mono text-amber-400 font-bold text-xs">
                    {formatPKR(expressFee)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Air express priority dispatch for urgent events &amp; ceremonies.
                </p>
              </label>
            </div>
          </div>

          {/* Step 4: Payment Method */}
          <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E1E28]">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center font-mono">
                4
              </span>
              <h2 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                Payment Option
              </h2>
            </div>

            <div className="space-y-3">
              {/* Cash on Delivery (COD) */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-amber-500/10 border-amber-400'
                    : 'bg-[#14141C] border-[#252534] hover:border-[#353546]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xs sm:text-sm">
                        Cash on Delivery (COD) - Nationwide
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Pay in cash to the TCS or Leopards courier upon receiving your package.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
              </div>

              {/* Bank Transfer / Raast */}
              <div
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-amber-500/10 border-amber-400'
                    : 'bg-[#14141C] border-[#252534] hover:border-[#353546]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm">
                      Direct Bank Transfer / Raast (Meezan &bull; HBL)
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Transfer directly to MB Clothing corporate accounts.
                    </p>
                  </div>
                </div>

                {paymentMethod === 'bank_transfer' && (
                  <div className="mt-4 pt-3 border-t border-[#262636] text-xs space-y-2 text-gray-300">
                    <div className="p-3 rounded-lg bg-[#181824] border border-[#2D2D3C]">
                      <p className="font-bold text-amber-400">Meezan Bank Limited (Corporate)</p>
                      <p>Title: <strong>MB CLOTHING ATELIER PVT LTD</strong></p>
                      <p className="font-mono text-white">IBAN: PK64MEZN0002140108924018</p>
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">
                        Bank Transaction Ref / Screenshot ID:
                      </label>
                      <input
                        type="text"
                        value={bankRef}
                        onChange={(e) => setBankRef(e.target.value)}
                        placeholder="e.g. MEZN-789214 or Raast Ref"
                        className="w-full bg-[#12121A] border border-[#2B2B38] rounded-lg py-2 px-3 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Online Debit / Credit Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/10 border-amber-400'
                    : 'bg-[#14141C] border-[#252534] hover:border-[#353546]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm">
                      Credit / Debit Card (Visa &bull; Mastercard &bull; UnionPay)
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Instant secure digital payment processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Special Delivery Notes / Tailoring Remarks
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Deliver between 3 PM to 7 PM, call gatekeeper"
                className="w-full bg-[#161620] border border-[#2B2B38] rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Order Summary & Review */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4 sticky top-28 shadow-2xl">
            <h2 className="font-cinzel text-base font-bold text-white uppercase tracking-wider pb-3 border-b border-[#1E1E28]">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>

            {/* Items List */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-3 text-xs"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-16 object-cover object-top rounded-lg bg-[#181822] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-semibold line-clamp-1">{item.product.name}</h4>
                      <p className="text-gray-400 text-[11px]">
                        Size: <span className="text-amber-300 font-mono">{item.selectedSize}</span> | {item.selectedColor}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-500 font-mono">Qty: {item.quantity}</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-3 border-t border-[#1C1C26]">
              {appliedCoupon ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-red-400 underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon Code"
                        className="w-full bg-[#161622] border border-[#2B2B3A] rounded-lg py-2 pl-9 pr-3 text-xs text-white uppercase font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-[#222230] hover:bg-amber-500 hover:text-black text-gray-200 text-xs font-semibold px-3.5 rounded-lg transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponMsg && <p className="text-[11px] text-red-400">{couponMsg}</p>}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-[#1C1C26] text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Garment Subtotal:</span>
                <span className="font-mono text-white">{formatPKR(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotional Savings:</span>
                  <span className="font-mono">-{formatPKR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-300">
                <span>Express Courier Shipping:</span>
                <span className="font-mono">
                  {currentShippingFee === 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    formatPKR(currentShippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-[#22222E]">
                <span className="font-cinzel tracking-wider">TOTAL AMOUNT</span>
                <span className="font-cinzel text-amber-400 text-lg">
                  {formatPKR(finalTotal)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-xl shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 uppercase tracking-wider"
            >
              <span>{submitting ? 'Confirming Order...' : 'CONFIRM ORDER & DISPATCH'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="text-center pt-2 space-y-1">
              <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Zero Advance Payment Required for COD</span>
              </p>
              <p className="text-[10px] text-gray-500">
                By placing an order, you agree to MB Clothing’s 7-Day Exchange Policy.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
