import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  PackageCheck, 
  Printer, 
  Truck, 
  PhoneCall, 
  ArrowRight, 
  Copy, 
  Check,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderConfirmationPageProps {
  orderId: string;
  navigate: (route: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, navigate }) => {
  const { formatPKR, settings, showToast } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [orderId]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    showToast('Order ID copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Thank you Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0E0E14] border border-[#262636] shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/40">
          <CheckCircle2 size={42} />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase font-cinzel tracking-widest text-amber-400 font-bold">
            ORDER CONFIRMED &bull; MB CLOTHING ATELIER
          </p>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-extrabold text-white">
            Thank You For Your Order
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
            Your tailored garments are being prepped at our atelier. We have dispatched an order verification SMS and WhatsApp confirmation.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#14141E] border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
          <div className="text-left">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">
              Pakistani Consignment ID:
            </span>
            <span className="font-mono text-lg font-bold text-amber-300">{orderId}</span>
          </div>

          <button
            onClick={copyOrderId}
            className="p-2 rounded-lg bg-[#20202E] hover:bg-amber-500 hover:text-black text-gray-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy ID'}</span>
          </button>
        </div>

        {/* Order Highlights Details */}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4 border-t border-[#1C1C26] text-xs">
            <div className="p-4 rounded-xl bg-[#12121A] border border-[#20202E]">
              <span className="text-gray-500 block mb-1">Delivering To</span>
              <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
              <p className="text-gray-400 text-[11px] mt-0.5 line-clamp-2">
                {order.shippingAddress.address}, {order.shippingAddress.city}
              </p>
              <p className="text-amber-400 font-mono mt-1">{order.shippingAddress.phone}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#12121A] border border-[#20202E]">
              <span className="text-gray-500 block mb-1">Payment Mode</span>
              <p className="font-bold text-white uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}</p>
              <p className="text-amber-400 font-cinzel font-bold text-sm mt-1">{formatPKR(order.total)}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Pay in cash to courier</p>
            </div>

            <div className="p-4 rounded-xl bg-[#12121A] border border-[#20202E]">
              <span className="text-gray-500 block mb-1">Estimated Arrival</span>
              <p className="font-bold text-white">2 – 4 Business Days</p>
              <p className="text-gray-400 text-[11px] mt-0.5">Dispatched via TCS Express</p>
              <p className="text-emerald-400 font-semibold text-[11px] mt-1 flex items-center gap-1">
                <Clock size={12} /> Standard Transit
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(`/track-order?orderId=${encodeURIComponent(orderId)}`)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-6 py-3 rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/30"
          >
            <PackageCheck size={16} />
            <span>Track Order Timeline</span>
          </button>

          <button
            onClick={() => setShowInvoice(true)}
            className="bg-[#181822] hover:bg-[#222230] text-gray-200 border border-[#2D2D3E] font-bold text-xs px-6 py-3 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer size={16} />
            <span>View &amp; Print Tax Invoice</span>
          </button>

          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20MB%20Clothing%2C%20I%20just%20placed%20order%20${encodeURIComponent(orderId)}`}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs px-6 py-3 rounded-full transition-all flex items-center gap-2"
          >
            <PhoneCall size={16} />
            <span>WhatsApp Support</span>
          </a>
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate('/products')}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-semibold"
          >
            Continue Browsing Atelier Collections &rarr;
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && order && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
