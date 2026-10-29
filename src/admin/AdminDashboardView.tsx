import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  Printer, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  CheckCircle2,
  Package
} from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateTab }) => {
  const { formatPKR, token, showToast } = useStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  const fetchAnalytics = () => {
    setLoading(true);
    fetch('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (res.ok) {
        showToast(`Order ${orderId} marked as ${newStatus.toUpperCase()}`, 'success');
        fetchAnalytics();
      }
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  if (loading || !analytics) {
    return (
      <div className="py-20 text-center text-amber-400 animate-pulse font-cinzel">
        Loading executive metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-extrabold text-white">
            Operations Executive Overview
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time financial synchronization and nationwide fulfillment metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('products')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Garment</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert if needed */}
      {analytics.lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-amber-300 font-bold text-xs sm:text-sm">
                Inventory Alert: {analytics.lowStockCount} Products Running Low
              </h4>
              <p className="text-[11px] text-gray-400">
                Replenish stock quantities to prevent out-of-stock cancellations.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs text-amber-400 hover:underline font-semibold whitespace-nowrap cursor-pointer"
          >
            Review Inventory &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="p-5 rounded-2xl bg-[#0E0E14] border border-[#23232F] relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
            <span className="font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="font-cinzel text-2xl sm:text-3xl font-extrabold text-amber-400">
            {formatPKR(analytics.totalSales)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp size={13} />
            <span>Net domestic volume in PKR</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#0E0E14] border border-[#23232F] relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
            <span className="font-semibold uppercase tracking-wider">Total Consignments</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalOrders}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400">
            <Clock size={13} />
            <span>{analytics.pendingOrdersCount} pending dispatch confirmation</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-[#0E0E14] border border-[#23232F] relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
            <span className="font-semibold uppercase tracking-wider">Registered VIPs</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users size={18} />
            </div>
          </div>
          <p className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalCustomers}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>Verified accounts across Pakistan</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-[#0E0E14] border border-[#23232F] relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
            <span className="font-semibold uppercase tracking-wider">Catalog Garments</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Layers size={18} />
            </div>
          </div>
          <p className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.totalProducts}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>{analytics.outOfStockCount} out of stock</span>
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      {analytics.categorySales && Object.keys(analytics.categorySales).length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4 shadow-xl">
          <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
            Revenue by Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.categorySales).map(([cat, amount]: [string, any]) => (
              <div key={cat} className="p-4 rounded-xl bg-[#14141E] border border-[#242432]">
                <p className="text-gray-400 text-xs truncate">{cat}</p>
                <p className="text-amber-400 font-cinzel font-bold text-base mt-1">
                  {formatPKR(amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E28]">
          <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
            Recent Client Orders
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#1C1C26]">
              <tr>
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Client</th>
                <th className="py-3 px-2">City</th>
                <th className="py-3 px-2">Total (PKR)</th>
                <th className="py-3 px-2">Payment</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A24]">
              {analytics.recentOrders?.map((ord: Order) => (
                <tr key={ord.id} className="hover:bg-[#12121A] transition-colors">
                  <td className="py-3.5 px-2 font-mono font-bold text-amber-300">
                    {ord.id}
                  </td>
                  <td className="py-3.5 px-2 font-medium text-white">
                    {ord.customerName}
                    <span className="block text-[10px] text-gray-500 font-mono">{ord.customerPhone}</span>
                  </td>
                  <td className="py-3.5 px-2 text-gray-300">
                    {ord.shippingAddress?.city || 'Pakistan'}
                  </td>
                  <td className="py-3.5 px-2 font-mono font-bold text-white">
                    {formatPKR(ord.total)}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="bg-[#1C1C28] text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-2">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : ord.orderStatus === 'shipped'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : ord.orderStatus === 'processing'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : ord.orderStatus === 'confirmed'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : ord.orderStatus === 'cancelled'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      <option value="pending" className="bg-[#161622] text-yellow-400">Pending</option>
                      <option value="confirmed" className="bg-[#161622] text-amber-400">Confirmed</option>
                      <option value="processing" className="bg-[#161622] text-purple-400">Processing</option>
                      <option value="shipped" className="bg-[#161622] text-blue-400">Shipped</option>
                      <option value="delivered" className="bg-[#161622] text-emerald-400">Delivered</option>
                      <option value="cancelled" className="bg-[#161622] text-red-400">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => setSelectedInvoice(ord)}
                      className="p-1.5 rounded-lg bg-[#181822] text-gray-300 hover:text-amber-400 hover:bg-[#20202E] transition-colors"
                      title="Print Tax Invoice"
                    >
                      <Printer size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
