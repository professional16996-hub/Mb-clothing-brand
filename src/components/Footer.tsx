import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings, formatPKR } = useStore();
  const [emailSub, setEmailSub] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSub.trim()) {
      setSubSuccess(true);
      setEmailSub('');
      setTimeout(() => setSubSuccess(false), 5000);
    }
  };

  return (
    <footer className="bg-[#070709] border-t border-[#1C1C22] text-gray-400 text-xs">
      {/* Value Propositions / Brand Perks Bar */}
      <div className="border-b border-[#1A1A22] bg-[#0C0C10] py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Nationwide Delivery</h4>
              <p className="text-gray-400 text-xs mt-0.5">
                Free express shipping on all orders over {formatPKR(settings.freeShippingThreshold)} across Pakistan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Cash on Delivery (COD)</h4>
              <p className="text-gray-400 text-xs mt-0.5">
                Pay conveniently at your doorstep upon receiving your luxury package.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">7-Day Hassle-Free Exchange</h4>
              <p className="text-gray-400 text-xs mt-0.5">
                Seamless size exchanges and fittings backed by our concierge desk.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <PhoneCall size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">WhatsApp Concierge</h4>
              <p className="text-gray-400 text-xs mt-0.5">
                Dedicated sartorial advisors ready to assist with sizing and styling.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#D4AF37] to-[#7E5E14] p-[1px]">
              <div className="w-full h-full bg-[#0B0B0E] flex items-center justify-center font-cinzel font-black text-amber-400 text-base">
                MB
              </div>
            </div>
            <span className="font-cinzel text-xl font-bold tracking-[0.2em] text-white">
              MB CLOTHING
            </span>
          </div>

          <p className="text-gray-400 leading-relaxed text-xs">
            MB Clothing is Pakistan’s premier destination for luxury menswear, festive womenswear, and bespoke traditional attire. From hand-embroidered prince coats and raw silk waistcoats to Egyptian Supima shirts and Japanese denim, every creation epitomizes timeless elegance.
          </p>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-start gap-2.5 text-gray-300">
              <MapPin size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span>{settings.physicalAddress}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <PhoneCall size={16} className="text-amber-400 shrink-0" />
              <span>{settings.supportPhone} | WhatsApp: {settings.whatsappNumber}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <Mail size={16} className="text-amber-400 shrink-0" />
              <span>{settings.supportEmail}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <Clock size={16} className="text-amber-400 shrink-0" />
              <span>Mon - Sat: 11:00 AM – 10:00 PM (PKT)</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-cinzel text-sm uppercase tracking-wider font-semibold mb-4 text-amber-300/90">
            Collections
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => navigate('/products?category=Traditional%20Wear')} className="hover:text-amber-300 transition-colors">
                Traditional Wear &amp; Kurta
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/products?category=Men's%20Clothing")} className="hover:text-amber-300 transition-colors">
                Men's Suits &amp; Blazers
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/products?category=Women's%20Clothing")} className="hover:text-amber-300 transition-colors">
                Women's Festive Pret
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?category=Shirts')} className="hover:text-amber-300 transition-colors">
                Egyptian Cotton Shirts
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?category=T-Shirts')} className="hover:text-amber-300 transition-colors">
                Supima Cotton T-Shirts
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?category=Jeans')} className="hover:text-amber-300 transition-colors">
                Selvedge Denim &amp; Jeans
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?category=Hoodies')} className="hover:text-amber-300 transition-colors">
                Luxury Heavyweight Hoodies
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?sale=true')} className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                Exclusive Sale &bull; Up to 35% Off
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-white font-cinzel text-sm uppercase tracking-wider font-semibold mb-4 text-amber-300/90">
            Concierge Care
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => navigate('/track-order')} className="hover:text-amber-300 transition-colors">
                Track Live Order
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/shipping-policy')} className="hover:text-amber-300 transition-colors">
                Shipping &amp; Delivery Details
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/return-policy')} className="hover:text-amber-300 transition-colors">
                Returns &amp; Exchange Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/faq')} className="hover:text-amber-300 transition-colors">
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/contact')} className="hover:text-amber-300 transition-colors">
                Flagship Stores &amp; Contact
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/about')} className="hover:text-amber-300 transition-colors">
                The MB Atelier Heritage
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter & Loyalty */}
        <div>
          <h4 className="text-white font-cinzel text-sm uppercase tracking-wider font-semibold mb-4 text-amber-300/90">
            The VIP Society
          </h4>
          <p className="text-gray-400 text-xs mb-3 leading-relaxed">
            Subscribe for private preview access to our seasonal edits, couture launches, and receive 10% off your first order.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="w-full bg-[#15151B] border border-[#2B2B36] rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400 placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Join The Circle</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {subSuccess && (
            <div className="mt-2 text-emerald-400 text-[11px] flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span>Use code <b className="text-amber-300">WELCOME10</b> for 10% off!</span>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#1C1C24]">
            <p className="text-[11px] text-gray-500 mb-2">Accepted Payment Modes</p>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-300">
              <span className="bg-[#181820] border border-[#2B2B38] px-2 py-0.5 rounded font-mono">Cash on Delivery</span>
              <span className="bg-[#181820] border border-[#2B2B38] px-2 py-0.5 rounded font-mono">Bank Transfer</span>
              <span className="bg-[#181820] border border-[#2B2B38] px-2 py-0.5 rounded font-mono">Raast</span>
              <span className="bg-[#181820] border border-[#2B2B38] px-2 py-0.5 rounded font-mono">Visa / Mastercard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Admin Gateway */}
      <div className="border-t border-[#181820] bg-[#050507] py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} {settings.storeName} Pakistan. All rights reserved. NTN: 8941208-4.
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/shipping-policy')} className="hover:text-gray-300">
              Shipping Terms
            </button>
            <span>&bull;</span>
            <button onClick={() => navigate('/return-policy')} className="hover:text-gray-300">
              Exchange Policy
            </button>
            <span>&bull;</span>
            {/* Discrete Admin Link */}
            <button 
              onClick={() => navigate('/admin')} 
              className="text-gray-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Staff & Store Administration"
            >
              <Lock size={11} />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
