import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Printer, 
  Eye, 
  Truck, 
  PackageCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  PhoneCall, 
  Save, 
  Clock 
} from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

export const AdminOrdersView: React.FC = () => {
  const { formatPKR, token, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Selected Order for Modal / Drawer
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Edit fields for selected order
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [timelineNote, setTimelineNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    let url = '/api/admin/orders';
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (paymentFilter) params.append('paymentStatus', paymentFilter);
    if (search.trim()) params.append('search', search.trim());
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderDetail = (ord: Order) => {
    setActiveOrder(ord);
    setNewStatus(ord.orderStatus);
    setNewPaymentStatus(ord.paymentStatus);
    setCourierName(ord.courierName || 'TCS Express Pakistan');
    setTrackingNumber(ord.trackingNumber || '');
    setTimelineNote('');
  };

  const handleSaveOrderChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/orders/${activeOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderStatus: newStatus,
          paymentStatus: newPaymentStatus,
          courierName,
          trackingNumber,
          timelineMessage: timelineNote
        })
      });

      const data = await res.json();
      setSaving(false);

      if (res.ok) {
        showToast(`Order ${activeOrder.id} updated successfully`, 'success');
        setActiveOrder(data.order);
        fetchOrders();
      } else {
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch {
      setSaving(false);
      showToast('Error updating order', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-extrabold text-white">
            Consignment &amp; Order Fulfillment
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Dispatch verification, COD reconciliation, and live courier tracking management
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-[#181824] hover:bg-[#202030] text-amber-400 border border-amber-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          Refresh Orders
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0E0E14] border border-[#22222E] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Client, Phone..."
            className="w-full bg-[#161622] border border-[#292938] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161622] border border-[#292938] text-xs text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#161622] border border-[#292938] text-xs text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending / COD Due</option>
            <option value="cod_received">COD Received</option>
            <option value="paid">Prepaid / Bank Verified</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] shadow-xl overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-amber-400 animate-pulse font-mono">
            Loading consignments...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No orders match the current filter selection.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#1E1E28]">
              <tr>
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Customer &amp; Phone</th>
                <th className="py-3 px-2">City &amp; Province</th>
                <th className="py-3 px-2">Total Amount</th>
                <th className="py-3 px-2">Order Status</th>
                <th className="py-3 px-2">Payment Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A24]">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#12121A] transition-colors">
                  <td className="py-3.5 px-2 font-mono font-bold text-amber-300">
                    {ord.id}
                  </td>

                  <td className="py-3.5 px-2 text-gray-400">
                    {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </td>

                  <td className="py-3.5 px-2">
                    <span className="font-semibold text-white block">{ord.customerName}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{ord.customerPhone}</span>
                  </td>

                  <td className="py-3.5 px-2 text-gray-300">
                    {ord.shippingAddress?.city}, {ord.shippingAddress?.province}
                  </td>

                  <td className="py-3.5 px-2 font-mono font-bold text-white">
                    {formatPKR(ord.total)}
                  </td>

                  <td className="py-3.5 px-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : ord.orderStatus === 'shipped'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : ord.orderStatus === 'processing'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : ord.orderStatus === 'confirmed'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : ord.orderStatus === 'cancelled'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        ord.paymentStatus === 'cod_received' || ord.paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {ord.paymentStatus === 'cod_received' ? 'COD Collected' : ord.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openOrderDetail(ord)}
                        className="px-2.5 py-1 rounded-lg bg-[#181822] text-amber-400 hover:bg-amber-500 hover:text-black font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => setSelectedInvoice(ord)}
                        className="p-1.5 rounded-lg bg-[#181822] text-gray-300 hover:text-amber-400"
                        title="Print Invoice"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail & Management Drawer Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              onClick={() => setActiveOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <div className="relative bg-[#111116] border border-[#2D2D3C] rounded-3xl max-w-2xl w-full p-6 sm:p-8 z-10 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#20202E]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-amber-400">
                      {activeOrder.id}
                    </span>
                    <span className="text-xs bg-[#1F1F2C] px-2 py-0.5 rounded uppercase font-mono">
                      {activeOrder.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Order created on {new Date(activeOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#14141E] border border-[#22222E] text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Client Contact:</span>
                  <p className="font-bold text-white text-sm">{activeOrder.customerName}</p>
                  <p className="font-mono text-amber-400">{activeOrder.customerPhone}</p>
                  {activeOrder.customerEmail && <p className="text-gray-400">{activeOrder.customerEmail}</p>}
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Destination Address:</span>
                  <p className="text-gray-200">{activeOrder.shippingAddress.address}</p>
                  <p className="text-gray-400">
                    {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.province}
                  </p>
                  {activeOrder.shippingAddress.landmark && (
                    <p className="text-[11px] text-amber-400 italic">Landmark: {activeOrder.shippingAddress.landmark}</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Garments in Order ({activeOrder.items.length})
                </h4>
                <div className="divide-y divide-[#1C1C28] border border-[#22222E] rounded-xl overflow-hidden bg-[#14141C]">
                  {activeOrder.items.map((i, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={i.image} alt="" className="w-10 h-12 object-cover rounded bg-[#181822]" />
                        <div>
                          <p className="font-bold text-white">{i.name}</p>
                          <p className="text-[10px] text-gray-400">
                            Size: {i.selectedSize} | Color: {i.selectedColor} | Qty: {i.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">{formatPKR(i.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status & Courier Form */}
              <form onSubmit={handleSaveOrderChanges} className="space-y-4 pt-2 border-t border-[#20202E] text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Update Order Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-[#181824] border border-[#2C2C3C] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">In Tailoring / QC</option>
                      <option value="shipped">Dispatched (Shipped)</option>
                      <option value="delivered">Delivered to Customer</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Update Payment Status</label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full bg-[#181824] border border-[#2C2C3C] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="pending">Pending (COD Due)</option>
                      <option value="cod_received">COD Collected (Courier Remittance)</option>
                      <option value="paid">Paid (Prepaid / Bank)</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Courier Partner</label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. TCS Express Pakistan / Leopards"
                      className="w-full bg-[#181824] border border-[#2C2C3C] rounded-xl py-2.5 px-3 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Consignment / Tracking ID</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. TCS-98241029PK"
                      className="w-full bg-[#181824] border border-[#2C2C3C] rounded-xl py-2.5 px-3 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Custom Timeline Event Log</label>
                  <input
                    type="text"
                    value={timelineNote}
                    onChange={(e) => setTimelineNote(e.target.value)}
                    placeholder="e.g. Handed to TCS delivery rider for Gulberg III route."
                    className="w-full bg-[#181824] border border-[#2C2C3C] rounded-xl py-2.5 px-3 text-white"
                  />
                  <span className="text-[10px] text-gray-500">
                    This message will instantly reflect in the customer's live tracking view.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#20202E]">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(activeOrder)}
                    className="bg-[#1C1C28] hover:bg-[#252536] text-gray-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>Print Tax Invoice</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={15} />
                    <span>{saving ? 'Updating...' : 'Save & Notify Customer'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
