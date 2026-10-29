import React, { useState, useEffect } from 'react';
import { 
  Search, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Printer, 
  PhoneCall, 
  AlertCircle 
} from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  navigate: (route: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialOrderId, navigate }) => {
  const { formatPKR, settings } = useStore();
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || '');
  const [queryInput, setQueryInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  const fetchOrder = (id: string, q?: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorMsg('');

    const url = `/api/orders/track?orderId=${encodeURIComponent(id.trim())}${q ? `&query=${encodeURIComponent(q.trim())}` : ''}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found. Please verify your Order ID.');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        setOrder(null);
        setErrorMsg(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderIdInput, queryInput);
  };

  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Received at atelier' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Verified by concierge' },
    { key: 'processing', label: 'Tailoring & QC', desc: 'Garment inspected & boxed' },
    { key: 'shipped', label: 'Dispatched', desc: 'Handed to TCS / Leopards' },
    { key: 'delivered', label: 'Delivered', desc: 'Handed to customer' }
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentStatus === 'cancelled') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs uppercase font-cinzel tracking-widest text-amber-400 font-bold">
          CONCIERGE LOGISTICS &bull; PAKISTAN
        </p>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-white">
          Real-Time Order Tracking
        </h1>
        <p className="text-gray-400 text-xs max-w-md mx-auto">
          Enter your MB Clothing Consignment Order ID (e.g. <b>MB-PK-98241</b>) to track real-time tailoring, courier dispatch, and delivery status.
        </p>
      </div>

      {/* Tracker Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0E0E14] border border-[#22222E] shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Order Tracking ID <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                placeholder="e.g. MB-PK-98241"
                className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-amber-400 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Phone Number or Email (Optional Verification)
              </label>
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="+92 3XX XXXXXXX or email"
                className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span>Quick Samples:</span>
              <button
                type="button"
                onClick={() => {
                  setOrderIdInput('MB-PK-98241');
                  fetchOrder('MB-PK-98241');
                }}
                className="text-amber-400 hover:underline font-mono"
              >
                MB-PK-98241
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setOrderIdInput('MB-PK-98188');
                  fetchOrder('MB-PK-98188');
                }}
                className="text-amber-400 hover:underline font-mono"
              >
                MB-PK-98188
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Search size={15} />
              <span>{loading ? 'Searching...' : 'Track Package'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Order Status Display */}
      {order && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0E0E14] border border-[#262636] shadow-2xl space-y-8 animate-in fade-in">
          {/* Top Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#20202C]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-amber-400">{order.id}</span>
                <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded border border-amber-500/30">
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoice(true)}
                className="p-2 rounded-xl bg-[#1A1A26] border border-[#2D2D3C] text-xs font-semibold text-gray-200 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={15} />
                <span>Tax Invoice</span>
              </button>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Tracking%20inquiry%20for%20order%20${encodeURIComponent(order.id)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5"
              >
                <PhoneCall size={15} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-4">
            <h3 className="font-cinzel text-xs font-bold text-gray-400 uppercase tracking-wider">
              Transit Progression
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {steps.map((st, idx) => {
                const stepState = getStepStatus(st.key, order.orderStatus);
                return (
                  <div
                    key={st.key}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      stepState === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : stepState === 'current'
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-lg shadow-amber-950/20'
                        : 'bg-[#121218] border-[#20202A] text-gray-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold">0{idx + 1}</span>
                      {stepState === 'completed' ? (
                        <CheckCircle2 size={16} />
                      ) : stepState === 'current' ? (
                        <Truck size={16} className="animate-bounce" />
                      ) : (
                        <Clock size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">{st.label}</p>
                      <p className="text-[10px] text-gray-400">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Consignment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#14141E] border border-[#242432] text-xs">
            <div>
              <p className="text-gray-400 text-[11px]">Courier Logistics Service:</p>
              <p className="font-bold text-white text-sm">{order.courierName || 'TCS Express Pakistan'}</p>
              <p className="text-amber-400 font-mono mt-0.5">Tracking #: {order.trackingNumber || 'Consignment in packing'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[11px]">Delivery Destination:</p>
              <p className="font-semibold text-white">{order.shippingAddress.address}</p>
              <p className="text-gray-300">{order.shippingAddress.city}, {order.shippingAddress.province}</p>
            </div>
          </div>

          {/* Timeline History */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-cinzel text-xs font-bold text-gray-400 uppercase tracking-wider">
                Event Activity Log
              </h3>
              <div className="space-y-2 border-l-2 border-[#282836] ml-2 pl-4">
                {order.timeline.map((event, i) => (
                  <div key={i} className="relative text-xs space-y-0.5 pb-2">
                    <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{event.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(event.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} &bull; {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px]">{event.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchased Items */}
          <div className="space-y-3 pt-4 border-t border-[#20202C]">
            <h3 className="font-cinzel text-xs font-bold text-gray-400 uppercase tracking-wider">
              Enclosed Garments
            </h3>
            <div className="divide-y divide-[#1E1E28]">
              {order.items.map((item, idx) => (
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
                        Size: <span className="text-amber-300 font-mono">{item.selectedSize}</span> | Color: {item.selectedColor} | Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">{formatPKR(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#20202C] text-xs">
              <span className="text-gray-400 font-semibold">Total Payable ({order.paymentMethod.toUpperCase()}):</span>
              <span className="font-cinzel text-amber-400 font-bold text-base">{formatPKR(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && order && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
