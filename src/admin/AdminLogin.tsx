import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AdminLoginProps {
  onSuccess: () => void;
  navigate: (route: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, navigate }) => {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
    } else if (res.user?.role !== 'admin') {
      setErrorMsg('This account does not possess administrative privileges.');
    } else {
      onSuccess();
    }
  };

  const fillDefaultAdmin = () => {
    setEmail('admin@mbclothing.pk');
    setPassword('MBAdmin@2026!');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0E0E14] border border-[#2B2B38] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Gold Header Aura */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#AA8022] via-[#D4AF37] to-[#AA8022]" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#7E5E14] p-[1px] mx-auto mb-3 shadow-lg shadow-amber-950/40">
            <div className="w-full h-full bg-[#0B0B0E] rounded-[15px] flex items-center justify-center font-cinzel font-black text-amber-400 text-2xl">
              MB
            </div>
          </div>
          <h1 className="font-cinzel text-xl font-bold tracking-widest text-white">
            MB CLOTHING ATELIER
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-amber-400/90 font-bold mt-1">
            Store Administration &amp; Operations Portal
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Instant Admin Sign-In */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 text-center space-y-2">
          <p className="text-[11px] text-amber-300 font-semibold">
            Evaluate the Admin Panel with 1 Click:
          </p>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setErrorMsg('');
              const res = await login('admin@mbclothing.pk', 'MBAdmin@2026!');
              setLoading(false);
              if (res.success) {
                onSuccess();
              } else {
                setErrorMsg(res.message || 'Auto-login failed');
              }
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <ShieldCheck size={16} />
            <span>Enter Admin Dashboard Directly</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#232332]"></div>
          <span className="flex-shrink mx-3 text-[10px] text-gray-500 uppercase font-mono tracking-wider">or sign in manually</span>
          <div className="flex-grow border-t border-[#232332]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-3">
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Executive Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mbclothing.pk"
                className="w-full bg-[#161622] border border-[#292938] rounded-xl py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-gray-300 font-semibold">Security Passkey</label>
              <button
                type="button"
                onClick={fillDefaultAdmin}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                Use Default Admin Key
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#161622] border border-[#292938] rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-xl shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider mt-2"
          >
            <ShieldCheck size={16} />
            <span>{loading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#1C1C28] text-center space-y-3">
          <div className="p-3 rounded-xl bg-[#14141E] border border-[#252536] text-[11px] text-gray-400 text-left">
            <span className="text-amber-400 font-bold block mb-1">Pre-configured Admin Access:</span>
            <p>Email: <span className="font-mono text-white">admin@mbclothing.pk</span></p>
            <p>Pass: <span className="font-mono text-white">MBAdmin@2026!</span></p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            &larr; Return to Customer Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
