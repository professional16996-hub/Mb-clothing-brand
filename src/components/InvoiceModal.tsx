import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { formatPKR, settings } = useStore();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        />

        <div className="relative bg-[#111116] border border-[#2D2D3A] rounded-2xl max-w-3xl w-full z-10 overflow-hidden shadow-2xl flex flex-col text-white">
          {/* Top Actions Bar (Hidden during print) */}
          <div className="p-4 bg-[#181822] border-b border-[#2A2A38] flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-amber-400 text-sm">
                OFFICIAL TAX INVOICE
              </span>
              <span className="text-xs bg-[#242432] text-gray-300 px-2 py-0.5 rounded font-mono">
                {order.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Printer size={15} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252532] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div
            id="printable-invoice"
            className="p-8 sm:p-10 bg-white text-gray-900 font-sans print:p-0 print:m-0"
          >
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-gray-900">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded bg-gray-900 text-amber-400 font-cinzel font-black flex items-center justify-center text-sm">
                    MB
                  </div>
                  <h1 className="font-cinzel text-2xl font-bold tracking-widest text-gray-900">
                    MB CLOTHING
                  </h1>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold">
                  Haute Couture &bull; Luxury Ready-to-Wear
                </p>
                <p className="text-[11px] text-gray-500 mt-1 max-w-sm leading-tight">
                  14-L, Mini Market, Gulberg II, Lahore, Pakistan<br />
                  Karachi Studio: Phase 6 DHA, Karachi | Tel: +92 42 35789000
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">NTN: 8941208-4 &bull; STRN: 3277876123456</p>
              </div>

              <div className="sm:text-right">
                <span className="inline-block bg-gray-900 text-amber-300 font-cinzel font-bold text-xs uppercase tracking-widest px-3 py-1 rounded mb-2">
                  Tax Invoice
                </span>
                <p className="text-xs font-mono font-bold text-gray-900">Invoice #: {order.id}</p>
                <p className="text-xs text-gray-600">
                  Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Payment Mode: <strong className="text-gray-900 uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}</strong>
                </p>
                <p className="text-xs text-gray-600">
                  Payment Status:{' '}
                  <span className="font-semibold uppercase text-emerald-700">
                    {order.paymentStatus === 'cod_received' ? 'COD Collected' : order.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            {/* Billed To / Shipping Details */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-gray-200 text-xs">
              <div>
                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-1.5">
                  Customer &amp; Shipping Details
                </h3>
                <p className="font-semibold text-gray-800 text-sm">{order.shippingAddress.fullName || order.customerName}</p>
                <p className="text-gray-600 mt-0.5">{order.shippingAddress.address}</p>
                {order.shippingAddress.landmark && (
                  <p className="text-gray-500 italic">Landmark: {order.shippingAddress.landmark}</p>
                )}
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode && `(${order.shippingAddress.postalCode})`}
                </p>
                <p className="text-gray-800 font-mono mt-1">Phone: {order.shippingAddress.phone || order.customerPhone}</p>
                {order.customerEmail && <p className="text-gray-600">Email: {order.customerEmail}</p>}
              </div>

              <div>
                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-1.5">
                  Dispatch &amp; Courier Logistics
                </h3>
                <p className="text-gray-700">
                  Courier Partner: <strong>{order.courierName || 'TCS Express Pakistan'}</strong>
                </p>
                <p className="text-gray-700 font-mono">
                  Consignment / Tracking: <strong>{order.trackingNumber || 'Assigned upon dispatch'}</strong>
                </p>
                <p className="text-gray-700 mt-1">
                  Order Status: <span className="font-bold uppercase text-amber-800">{order.orderStatus}</span>
                </p>
                {order.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-[11px]">
                    <span className="font-bold">Instructions:</span> {order.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-900 text-gray-900 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">Size</th>
                    <th className="py-2.5 text-center">Color</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-3 font-medium text-gray-900 max-w-xs">{item.name}</td>
                      <td className="py-3 text-center font-mono">{item.selectedSize}</td>
                      <td className="py-3 text-center">{item.selectedColor}</td>
                      <td className="py-3 text-center font-bold font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">{formatPKR(item.unitPrice)}</td>
                      <td className="py-3 text-right font-bold text-gray-900 font-mono">
                        {formatPKR(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end pt-4 border-t-2 border-gray-900">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono text-gray-900 font-semibold">{formatPKR(order.subtotal)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({order.couponCode || 'Promo'}):</span>
                    <span className="font-mono">-{formatPKR(order.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Nationwide Express Shipping:</span>
                  <span className="font-mono text-gray-900 font-semibold">
                    {order.shippingFee === 0 ? 'FREE' : formatPKR(order.shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-900">
                  <span className="font-cinzel">Total Payable:</span>
                  <span className="font-cinzel text-amber-700">{formatPKR(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer Notice & Return Clause */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-[10px] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="max-w-md">
                Thank you for choosing MB Clothing. Please retain this invoice for your 7-day hassle-free exchange. For assistance, WhatsApp us at {settings.whatsappNumber}.
              </p>
              <div className="text-right">
                <p className="font-cinzel font-bold text-gray-800 text-xs">MB ATELIER QUALITY CERTIFIED</p>
                <p className="text-[9px] text-gray-400">Computer generated invoice. No signature required.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
