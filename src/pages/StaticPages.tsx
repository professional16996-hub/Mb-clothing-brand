import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AboutUsPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { settings } = useStore();

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <p className="text-xs uppercase font-cinzel tracking-widest text-amber-400 font-bold">
          THE MB ATELIER HERITAGE
        </p>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-extrabold text-white">
          Where Pakistani Heritage Meets Modern Luxury
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Founded in Lahore, MB Clothing crafts sartorial garments and ceremonial heirlooms for the discerning connoisseur who demands nothing less than perfection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-300">
          <h2 className="font-serif-luxury text-2xl font-bold text-white">
            Uncompromising Standards &amp; Rare Fabrics
          </h2>
          <p>
            Every MB Clothing creation begins with world-class materials: combed Egyptian Giza cotton from the Nile delta, banarasi jamawar woven with real zari thread, and pure 100% raw silks curated from legacy weavers.
          </p>
          <p>
            Whether it is an iconic black Zari Embroidered Prince Coat designed for a wedding banquet, or an understated Italian wool Gurkha trouser, our master tailors spend up to 40 hours perfecting every seam, welt, and drape.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/products')}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-3 rounded-full uppercase"
            >
              Explore Collections
            </button>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-[#262636] shadow-2xl aspect-[4/3] bg-[#121218]">
          <img
            src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80"
            alt="MB Atelier Lahore"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Flagships */}
      <div className="p-8 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-6">
        <h3 className="font-cinzel text-lg font-bold text-center text-amber-400 uppercase tracking-wider">
          Flagship Atelier Locations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-[#14141E] border border-[#242432] space-y-2">
            <p className="font-bold text-white text-sm">Lahore Flagship &amp; Bespoke Studio</p>
            <p className="text-gray-400">14-L, Mini Market, Gulberg II, Lahore, Pakistan</p>
            <p className="text-amber-400 font-mono">Tel: +92 (42) 3578-9000</p>
            <p className="text-[11px] text-gray-500">Bespoke fitting rooms &bull; Made to Measure</p>
          </div>

          <div className="p-5 rounded-xl bg-[#14141E] border border-[#242432] space-y-2">
            <p className="font-bold text-white text-sm">Karachi Haute Couture Studio</p>
            <p className="text-gray-400">Bukhari Commercial Area, Phase 6, DHA, Karachi</p>
            <p className="text-amber-400 font-mono">WhatsApp: +92 300 8472910</p>
            <p className="text-[11px] text-gray-500">Festive pret &bull; Ceremonial consultation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactUsPage: React.FC = () => {
  const { settings, showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+92 ');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message })
      });

      setSubmitting(false);
      if (res.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
        setSubject('');
        showToast('Your message has been received by MB Concierge', 'success');
      }
    } catch {
      setSubmitting(false);
      showToast('Error sending message', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase font-cinzel tracking-widest text-amber-400 font-bold">
          CONCIERGE &bull; FLAGSHIP STORES
        </p>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-extrabold text-white">
          Contact MB Clothing
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
          Reach our dedicated sartorial advisors for styling guidance, bespoke wedding consultations, or courier inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] space-y-4 text-xs">
            <h3 className="font-cinzel text-sm font-bold text-amber-400 uppercase tracking-wider">
              Direct Channels
            </h3>

            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.physicalAddress}</span>
              </div>

              <div className="flex items-center gap-3">
                <PhoneCall size={18} className="text-amber-400 shrink-0" />
                <span>{settings.supportPhone}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-amber-400 shrink-0" />
                <span>{settings.supportEmail}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1C1C26]">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20MB%20Clothing%2C%20I%20would%20like%20to%20inquire%20about`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <PhoneCall size={16} />
                <span>Chat on WhatsApp Directly</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#0E0E14] border border-[#22222E]">
          <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider mb-4 pb-3 border-b border-[#1E1E28]">
            Send an Inquiry to Our Atelier Desk
          </h3>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto" />
              <p className="font-bold text-white text-sm">Inquiry Received</p>
              <p className="text-xs text-gray-300">
                Our concierge desk will review your message and reply via WhatsApp or email within 4 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-amber-400 underline pt-2 cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bilal Farooq"
                    className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bilal@gmail.com"
                    className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Custom Tailoring, Order Inquiry, etc."
                    className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Message Details *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your request, sizing inquiry, or fitting appointment dates..."
                  className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-7 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={14} />
                <span>{submitting ? 'Sending...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: 'Do you offer Cash on Delivery (COD) across Pakistan?',
      a: 'Yes, Cash on Delivery is available across all cities and towns in Pakistan up to an order value of ₨ 50,000. You pay in cash to the TCS or Leopards courier upon inspection of your sealed delivery box.'
    },
    {
      q: 'How long does nationwide delivery take?',
      a: 'Orders in major cities like Lahore, Karachi, and Islamabad/Rawalpindi are delivered within 2-3 business days. Other cities and surrounding regions typically take 3-5 business days. Express next-day air dispatch is also available.'
    },
    {
      q: 'What is your size exchange policy?',
      a: 'We offer a 7-day hassle-free exchange policy. If a garment does not fit as expected, simply WhatsApp our concierge team at +92 300 8472910, and we will arrange a reverse pickup or courier swap.'
    },
    {
      q: 'Can I request bespoke made-to-measure tailoring?',
      a: 'Yes! For wedding sherwanis, prince coats, and waistcoats, you can schedule an in-person measurement session at our Gulberg Lahore atelier or send custom shoulder, chest, and length measurements via WhatsApp.'
    },
    {
      q: 'Are your traditional fabrics authentic pure silk and Egyptian cotton?',
      a: 'All our fabrics are authentic and certified. We use genuine raw silk, pure Banarasi jamawar brocade, and 100% two-ply long-staple Egyptian Giza combed cotton for shirts and kurta sets.'
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-12 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase font-cinzel tracking-widest text-amber-400 font-bold">
          HELP &bull; CONCIERGE FAQ
        </p>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-400 text-xs">Everything you need to know about purchasing, shipping, and sizing at MB Clothing.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-[#0E0E14] border border-[#22222E] cursor-pointer"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-white">
              <span>{f.q}</span>
              <ChevronDown
                size={16}
                className={`text-amber-400 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
              />
            </div>
            {openIdx === i && (
              <p className="text-xs text-gray-400 mt-2.5 pt-2.5 border-t border-[#1C1C26] leading-relaxed">
                {f.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => {
  const { settings, formatPKR } = useStore();

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-12 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
      <h1 className="font-serif-luxury text-3xl font-extrabold text-white">Shipping &amp; Delivery Terms</h1>
      <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] text-xs sm:text-sm text-gray-300 space-y-4 leading-relaxed">
        <p>
          MB Clothing partners with Pakistan’s premier courier networks—TCS Express and Leopards Courier—to provide safe, trackable door-to-door delivery across all provinces and territories.
        </p>

        <h3 className="font-bold text-amber-400 text-sm">Domestic Delivery Timelines</h3>
        <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
          <li><strong>Lahore &amp; Karachi Metropolitan:</strong> 2 - 3 business days</li>
          <li><strong>Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar:</strong> 3 - 4 business days</li>
          <li><strong>Other Cities &amp; Azad Jammu &amp; Kashmir:</strong> 3 - 5 business days</li>
        </ul>

        <h3 className="font-bold text-amber-400 text-sm">Shipping Charges</h3>
        <p className="text-xs text-gray-400">
          - <strong>Free Nationwide Express Shipping:</strong> Automatically applied to all domestic orders with a subtotal of {formatPKR(settings.freeShippingThreshold)} or higher.<br />
          - <strong>Standard Shipping:</strong> A flat rate of {formatPKR(settings.standardShippingFee)} is applied to orders below {formatPKR(settings.freeShippingThreshold)}.<br />
          - <strong>Priority Air Dispatch:</strong> Available for {formatPKR(settings.expressShippingFee)} for urgent wedding or event deliveries.
        </p>

        <h3 className="font-bold text-amber-400 text-sm">Cash on Delivery (COD) Rules</h3>
        <p className="text-xs text-gray-400">
          Cash on delivery is supported up to ₨ 50,000. Please have exact change ready for the courier representative upon arrival.
        </p>
      </div>
    </div>
  );
};

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-12 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
      <h1 className="font-serif-luxury text-3xl font-extrabold text-white">7-Day Hassle-Free Exchange Policy</h1>
      <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] text-xs sm:text-sm text-gray-300 space-y-4 leading-relaxed">
        <p>
          At MB Clothing, we take immense pride in the fit and finish of every garment. If you are not completely satisfied with the sizing of your order, we offer a straightforward 7-day exchange window.
        </p>

        <h3 className="font-bold text-amber-400 text-sm">Exchange Eligibility</h3>
        <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
          <li>Garments must be unworn, unwashed, and in original pristine condition.</li>
          <li>All original MB Clothing gold tags and luxury seals must remain attached.</li>
          <li>Exchange request must be initiated within 7 calendar days of courier delivery.</li>
        </ul>

        <h3 className="font-bold text-amber-400 text-sm">How to Request an Exchange</h3>
        <p className="text-xs text-gray-400">
          Contact our WhatsApp Concierge at <strong>+92 300 8472910</strong> or email <strong>concierge@mbclothing.pk</strong> with your Order ID (e.g. MB-PK-98241) and the replacement size desired. We will dispatch the replacement piece via courier.
        </p>
      </div>
    </div>
  );
};
