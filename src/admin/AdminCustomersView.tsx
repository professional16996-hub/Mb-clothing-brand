import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, MapPin, ShoppingBag, Eye, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export const AdminCustomersView: React.FC = () => {
  const { formatPKR, token } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/customers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCustomers(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const viewCustomerOrders = (cust: any) => {
    setSelectedCustomer(cust);
    setLoadingOrders(true);
    fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((allOrders) => {
        const filtered = allOrders.filter(
          (o: Order) =>
            o.customerId === cust.id ||
            (o.customerEmail && o.customerEmail.toLowerCase() === cust.email.toLowerCase()) ||
            (o.customerPhone && cust.phone && o.customerPhone.includes(cust.phone.slice(-7)))
        );
        setCustomerOrders(filtered);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  };

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-extrabold text-white">
          VIP Customer Directory
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Registered customer accounts, lifetime spending volume, and fulfillment records
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0E0E14] border border-[#22222E] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, city..."
            className="w-full bg-[#161622] border border-[#292938] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono hidden sm:inline">
          {filtered.length} Registered Accounts
        </span>
      </div>

      {/* Customers Table */}
      <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] shadow-xl overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-amber-400 animate-pulse font-mono">
            Loading customer records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No customers match the search criteria.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#1E1E28]">
              <tr>
                <th className="py-3 px-2">Client Name</th>
                <th className="py-3 px-2">Contact Details</th>
                <th className="py-3 px-2">Location</th>
                <th className="py-3 px-2">Registered On</th>
                <th className="py-3 px-2">Orders Placed</th>
                <th className="py-3 px-2">Lifetime Spend</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A24]">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#12121A] transition-colors">
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center font-mono">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-white text-xs">{cust.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-2">
                    <span className="text-gray-300 block">{cust.email}</span>
                    <span className="text-amber-400 font-mono text-[11px]">{cust.phone || 'No phone'}</span>
                  </td>

                  <td className="py-3.5 px-2 text-gray-300">
                    {cust.city || 'Pakistan'}, {cust.province || 'Punjab'}
                  </td>

                  <td className="py-3.5 px-2 text-gray-400 font-mono">
                    {new Date(cust.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  <td className="py-3.5 px-2 font-mono font-bold text-white">
                    {cust.totalOrders}
                  </td>

                  <td className="py-3.5 px-2 font-mono font-bold text-amber-300">
                    {formatPKR(cust.totalSpent)}
                  </td>

                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => viewCustomerOrders(cust)}
                      className="px-3 py-1.5 rounded-lg bg-[#181824] hover:bg-amber-500 hover:text-black text-amber-400 text-[11px] font-semibold transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Order History</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              onClick={() => setSelectedCustomer(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <div className="relative bg-[#111116] border border-[#2D2D3C] rounded-3xl max-w-2xl w-full p-6 sm:p-8 z-10 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#20202E]">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-white">
                    {selectedCustomer.name} &bull; Order Portfolio
                  </h3>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    {selectedCustomer.email} | {selectedCustomer.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-amber-400 animate-pulse">Loading orders...</div>
              ) : customerOrders.length === 0 ? (
                <p className="py-8 text-center text-gray-500 text-xs">
                  This customer has not placed any orders yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl bg-[#14141E] border border-[#242432] space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-amber-300">{ord.id}</span>
                        <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {ord.orderStatus}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px]">
                        Placed: {new Date(ord.createdAt).toLocaleDateString()} | Total: <strong className="text-white font-mono">{formatPKR(ord.total)}</strong> ({ord.paymentMethod.toUpperCase()})
                      </p>
                      <div className="divide-y divide-[#1E1E28] pt-1">
                        {ord.items.map((it, i) => (
                          <div key={i} className="py-1 flex justify-between text-[11px] text-gray-300">
                            <span>{it.name} ({it.selectedSize}) x {it.quantity}</span>
                            <span className="font-mono">{formatPKR(it.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
