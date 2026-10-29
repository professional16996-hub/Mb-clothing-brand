import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  navigate: (route: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ navigate }) => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authModalMode,
    login,
    register
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode || 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('+92 ');
  const [regProvince, setRegProvince] = useState('Punjab');
  const [regCity, setRegCity] = useState('Lahore');
  const [regAddress, setRegAddress] = useState('');

  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Login failed');
    } else if (res.user?.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      province: regProvince,
      city: regCity,
      address: regAddress
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  const fillDemoCustomer = () => {
    setMode('login');
    setLoginEmail('shahmeer.khan@gmail.com');
    setLoginPassword('Customer@123');
    setErrorMsg('');
  };

  const fillDemoAdmin = () => {
    setMode('login');
    setLoginEmail('admin@mbclothing.pk');
    setLoginPassword('MBAdmin@2026!');
    setErrorMsg('');
  };

  const pakistaniProvinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad Capital Territory',
    'Azad Jammu & Kashmir',
    'Gilgit-Baltistan'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          onClick={() => setAuthModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        />

        <div className="relative bg-[#111116] border border-[#2B2B38] rounded-2xl text-left overflow-hidden shadow-2xl max-w-md w-full z-10 p-6 sm:p-8 animate-in fade-in zoom-in-95">
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1C1C24] transition-colors"
          >
            <X size={20} />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#D4AF37] to-[#7E5E14] p-[1px] mx-auto mb-2">
              <div className="w-full h-full bg-[#0B0B0E] flex items-center justify-center font-cinzel font-black text-amber-400 text-lg">
                MB
              </div>
            </div>
            <h2 className="font-cinzel text-xl font-bold tracking-widest text-white">
              MB CLOTHING
            </h2>
            <p className="text-xs text-amber-400/90 font-medium tracking-wider uppercase mt-0.5">
              Haute Couture &bull; Pakistan
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#181822] p-1 rounded-xl border border-[#272736] mb-6">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-gray-300">Password</label>
                  <button
                    type="button"
                    onClick={() => fillDemoCustomer()}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Use Sample Account
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
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
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg shadow-amber-950/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'SIGN IN TO MB CLOTHING'}
              </button>

              {/* Fast Demo Logins */}
              <div className="pt-3 border-t border-[#1E1E28]">
                <p className="text-[11px] text-gray-400 text-center mb-2 font-medium">Quick Credentials for Testing</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillDemoCustomer}
                    className="py-1.5 px-2 bg-[#1A1A24] border border-[#2C2C3C] hover:border-amber-400 text-[11px] text-gray-300 rounded-lg text-center"
                  >
                    Sample Customer
                  </button>
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="py-1.5 px-2 bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-[11px] text-amber-300 rounded-lg text-center font-semibold flex items-center justify-center gap-1"
                  >
                    <ShieldCheck size={12} /> Admin Account
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Hamza Malik"
                    className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. hamza@gmail.com"
                    className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Phone (Pakistan)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2 pl-8 pr-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Province</label>
                  <select
                    value={regProvince}
                    onChange={(e) => setRegProvince(e.target.value)}
                    className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {pakistaniProvinces.map((prov) => (
                      <option key={prov} value={prov} className="bg-[#181820] text-white">
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Lahore / Karachi / Islamabad"
                    className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Street, Sector, House #"
                    className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#181820] border border-[#2B2B38] rounded-xl py-2 pl-9 pr-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg shadow-amber-950/20 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? 'Registering...' : 'CREATE LUXURY ACCOUNT'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
