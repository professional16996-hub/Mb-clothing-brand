import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, X, Truck, Save, Percent, DollarSign } from 'lucide-react';
import { Coupon } from '../types';
import { useStore } from '../context/StoreContext';

export const AdminCouponsShippingView: React.FC = () => {
  const { formatPKR, token, settings, refreshSettings, showToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Modal
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(3000);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>(2500);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number | ''>(200);

  // Shipping Rates Form
  const [freeThreshold, setFreeThreshold] = useState(settings.freeShippingThreshold);
  const [standardFee, setStandardFee] = useState(settings.standardShippingFee);
  const [expressFee, setExpressFee] = useState(settings.expressShippingFee);
  const [savingRates, setSavingRates] = useState(false);

  useEffect(() => {
    setFreeThreshold(settings.freeShippingThreshold);
    setStandardFee(settings.standardShippingFee);
    setExpressFee(settings.expressShippingFee);
  }, [settings]);

  const fetchCoupons = () => {
    setLoading(true);
    fetch('/api/admin/coupons', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCoupons(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoupons();
  }, [token]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: Number(discountValue),
          minSpend: Number(minSpend),
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          expiryDate,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          isActive: true
        })
      });

      if (res.ok) {
        showToast(`Coupon "${code}" published`, 'success');
        setShowModal(false);
        fetchCoupons();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create coupon', 'error');
      }
    } catch {
      showToast('Error creating coupon', 'error');
    }
  };

  const handleToggleActive = async (cpn: Coupon) => {
    try {
      await fetch(`/api/admin/coupons/${cpn.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !cpn.isActive })
      });
      fetchCoupons();
      showToast(`Coupon ${cpn.isActive ? 'deactivated' : 'activated'}`, 'info');
    } catch {
      showToast('Failed to update coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string, cCode: string) => {
    if (!window.confirm(`Delete coupon "${cCode}"?`)) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCoupons();
      showToast('Coupon deleted', 'info');
    } catch {
      showToast('Error deleting coupon', 'error');
    }
  };

  const handleSaveShippingRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRates(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          freeShippingThreshold: Number(freeThreshold),
          standardShippingFee: Number(standardFee),
          expressShippingFee: Number(expressFee)
        })
      });

      setSavingRates(false);
      if (res.ok) {
        showToast('Shipping thresholds and delivery rates saved', 'success');
        refreshSettings();
      }
    } catch {
      setSavingRates(false);
      showToast('Failed to update shipping rates', 'error');
    }
  };

  return (
    <div className="space-y-10">
      {/* Shipping Configurations Section */}
      <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1E1E28]">
          <Truck className="text-amber-400" size={18} />
          <h2 className="font-serif-luxury text-lg font-bold text-white">
            Nationwide Logistics Rates &amp; Free Delivery Threshold
          </h2>
        </div>

        <form onSubmit={handleSaveShippingRates} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Free Shipping Threshold (PKR)
            </label>
            <input
              type="number"
              required
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(Number(e.target.value))}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block">
              Cart subtotal required for 100% free delivery across Pakistan.
            </span>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Standard Express Delivery (PKR)
            </label>
            <input
              type="number"
              required
              value={standardFee}
              onChange={(e) => setStandardFee(Number(e.target.value))}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block">
              Applied on domestic orders below the free threshold.
            </span>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Priority Air Dispatch Fee (PKR)
            </label>
            <input
              type="number"
              required
              value={expressFee}
              onChange={(e) => setExpressFee(Number(e.target.value))}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block">
              Expedited courier charge for 1-2 day emergency event deliveries.
            </span>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingRates}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{savingRates ? 'Saving...' : 'Update Shipping Thresholds'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
              Promotional Coupons &amp; Vouchers
            </h2>
            <p className="text-xs text-gray-400">
              Create discount codes with minimum spend requirements and maximum caps
            </p>
          </div>

          <button
            onClick={() => {
              setCode('');
              setDiscountType('percentage');
              setDiscountValue(10);
              setMinSpend(3000);
              setMaxDiscount(2500);
              setExpiryDate('2026-12-31');
              setUsageLimit(200);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Promo Coupon</span>
          </button>
        </div>

        {/* Coupons Table */}
        <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] shadow-xl overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-amber-400 animate-pulse font-mono">
              Loading active coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-xs">
              No promotional coupons configured yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#1E1E28]">
                <tr>
                  <th className="py-3 px-2">Coupon Code</th>
                  <th className="py-3 px-2">Discount Value</th>
                  <th className="py-3 px-2">Min Spend (PKR)</th>
                  <th className="py-3 px-2">Max Cap</th>
                  <th className="py-3 px-2">Expiry</th>
                  <th className="py-3 px-2">Usage Count</th>
                  <th className="py-3 px-2">Active Status</th>
                  <th className="py-3 px-2 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A24]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#12121A] transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-amber-300">
                      {c.code}
                    </td>

                    <td className="py-3.5 px-2 font-semibold text-white">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatPKR(c.discountValue)} FLAT OFF`}
                    </td>

                    <td className="py-3.5 px-2 font-mono text-gray-300">
                      {formatPKR(c.minSpend)}
                    </td>

                    <td className="py-3.5 px-2 font-mono text-gray-400">
                      {c.maxDiscount ? formatPKR(c.maxDiscount) : 'No Cap'}
                    </td>

                    <td className="py-3.5 px-2 text-gray-400 font-mono">
                      {c.expiryDate}
                    </td>

                    <td className="py-3.5 px-2 font-mono">
                      <span className="text-white font-bold">{c.usageCount || 0}</span>
                      {c.usageLimit && <span className="text-gray-500 text-[10px]"> / {c.usageLimit}</span>}
                    </td>

                    <td className="py-3.5 px-2">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                          c.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-1.5 rounded-lg bg-[#181822] text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-[#111116] border border-[#2D2D3C] rounded-2xl max-w-md w-full p-6 text-white z-10 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#20202E] pb-3">
              <h3 className="font-serif-luxury text-base font-bold">Create Discount Coupon</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EID2026"
                  className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat PKR (₨)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="10 or 500"
                    className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Min Spend (PKR)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    placeholder="3000"
                    className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Max Cap (PKR)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="2500"
                    className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
                    placeholder="200"
                    className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 text-black font-bold py-2.5 rounded-xl uppercase mt-2"
              >
                Publish Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
