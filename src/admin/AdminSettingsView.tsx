import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Store, PhoneCall, Mail, MapPin, Key, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AdminSettingsView: React.FC = () => {
  const { settings, refreshSettings, token, showToast } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [logoText, setLogoText] = useState(settings.logoText);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [physicalAddress, setPhysicalAddress] = useState(settings.physicalAddress);
  const [shippingPolicy, setShippingPolicy] = useState(settings.shippingPolicy);
  const [returnPolicy, setReturnPolicy] = useState(settings.returnPolicy);
  const [saving, setSaving] = useState(false);

  // Admin Security Reset
  const [newAdminEmail, setNewAdminEmail] = useState('admin@mbclothing.pk');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [masterSetupKey, setMasterSetupKey] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setStoreName(settings.storeName);
    setTagline(settings.tagline);
    setLogoText(settings.logoText);
    setWhatsappNumber(settings.whatsappNumber);
    setSupportEmail(settings.supportEmail);
    setSupportPhone(settings.supportPhone);
    setPhysicalAddress(settings.physicalAddress);
    setShippingPolicy(settings.shippingPolicy);
    setReturnPolicy(settings.returnPolicy);
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          storeName,
          tagline,
          logoText,
          whatsappNumber,
          supportEmail,
          supportPhone,
          physicalAddress,
          shippingPolicy,
          returnPolicy
        })
      });

      setSaving(false);
      if (res.ok) {
        showToast('Store settings updated and synchronized across website', 'success');
        refreshSettings();
      }
    } catch {
      setSaving(false);
      showToast('Error saving settings', 'error');
    }
  };

  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) {
      showToast('Please enter a new password', 'error');
      return;
    }
    setResetting(true);

    try {
      const res = await fetch('/api/auth/admin-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          setupKey: masterSetupKey || 'MB2026_INIT'
        })
      });

      const data = await res.json();
      setResetting(false);

      if (res.ok) {
        showToast('Admin credentials updated securely', 'success');
        setNewAdminPassword('');
        setMasterSetupKey('');
      } else {
        showToast(data.error || 'Failed to update admin credentials', 'error');
      }
    } catch {
      setResetting(false);
      showToast('Error updating credentials', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-extrabold text-white">
          Store Configuration &amp; Legal Policies
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Update brand metadata, concierge contact coordinates, and policy documentation
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-6 shadow-xl text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1E1E28]">
          <Store size={18} className="text-amber-400" />
          <h2 className="font-serif-luxury text-base font-bold text-white">
            Brand Identity &amp; Contact Coordinates
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Store Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Header Logo Monogram Text</label>
            <input
              type="text"
              required
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-cinzel"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 font-semibold mb-1">Brand Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">WhatsApp Concierge Number</label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Helpline Phone</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Concierge Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 font-semibold mb-1">Flagship Studio Addresses</label>
          <textarea
            rows={2}
            value={physicalAddress}
            onChange={(e) => setPhysicalAddress(e.target.value)}
            className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
          />
        </div>

        <div className="pt-4 border-t border-[#1E1E28] space-y-4">
          <h3 className="font-serif-luxury text-sm font-bold text-white">Policy Documentation</h3>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Shipping &amp; COD Terms</label>
            <textarea
              rows={3}
              value={shippingPolicy}
              onChange={(e) => setShippingPolicy(e.target.value)}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white text-[11px]"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">7-Day Exchange Policy</label>
            <textarea
              rows={3}
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white text-[11px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-7 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Updating Store...' : 'Save Brand Settings'}</span>
          </button>
        </div>
      </form>

      {/* Admin Security Credentials Manager */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4 text-xs shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1E1E28]">
          <ShieldCheck size={18} className="text-amber-400" />
          <h2 className="font-serif-luxury text-base font-bold text-white">
            Security &amp; First Admin Credentials Update
          </h2>
        </div>

        <p className="text-gray-400 text-xs">
          Never hardcode credentials. You can update the master administrator email and passkey here without exposing secrets in source code.
        </p>

        <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 max-w-md">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Admin Email Address</label>
            <input
              type="email"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">New Security Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Master Setup Key (Default: MB2026_INIT)</label>
            <input
              type="text"
              value={masterSetupKey}
              onChange={(e) => setMasterSetupKey(e.target.value)}
              placeholder="MB2026_INIT"
              className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={resetting}
            className="bg-[#242434] hover:bg-amber-500 hover:text-black text-gray-200 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {resetting ? 'Updating...' : 'Update Admin Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
