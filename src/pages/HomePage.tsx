import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Award, 
  Truck, 
  ShieldCheck, 
  Clock, 
  Star, 
  Quote,
  ShoppingBag,
  MessageCircle
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Banner, Category } from '../types';
import { useStore } from '../context/StoreContext';

interface HomePageProps {
  navigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { formatPKR, settings } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [productTab, setProductTab] = useState<'featured' | 'bestseller' | 'new' | 'sale'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial storefront data
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/banners').then((r) => r.json())
    ])
      .then(([prods, cats, bans]) => {
        setProducts(prods || []);
        setCategories(cats || []);
        setBanners(bans || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load homepage data:', err);
        setLoading(false);
      });
  }, []);

  // Auto banner rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanners = banners.filter((b) => b.active);
  const currentBanner = activeBanners[activeBannerIdx] || activeBanners[0];

  // Filtered products for tabs
  const tabProducts = products.filter((p) => {
    if (productTab === 'featured') return p.isFeatured;
    if (productTab === 'bestseller') return p.isBestSeller;
    if (productTab === 'new') return p.isNewArrival;
    if (productTab === 'sale') return p.salePrice && p.salePrice < p.regularPrice;
    return true;
  });

  const traditionalProducts = products.filter((p) => p.category === 'Traditional Wear');

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200">
      {/* Hero Banner Carousel */}
      {currentBanner && (
        <section className="relative h-[78vh] min-h-[520px] max-h-[780px] w-full overflow-hidden bg-black flex items-center">
          <div className="absolute inset-0">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center filter brightness-[0.65] transition-all duration-1000 scale-100 animate-in fade-in"
            />
            {/* Elegant Luxury Vignette & Metallic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0D] via-transparent to-black/40" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 w-full z-10">
            <div className="max-w-2xl space-y-4 animate-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                <Sparkles size={13} className="text-amber-400" />
                <span>{currentBanner.tag || 'HAUTE COUTURE 2026'}</span>
              </div>

              <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-wider">
                {currentBanner.title}
              </h1>

              <p className="text-gray-300 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                {currentBanner.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => navigate(currentBanner.ctaLink || '/products')}
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-full transition-all shadow-xl shadow-amber-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <span>{currentBanner.ctaText || 'EXPLORE COLLECTION'}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => navigate('/products?category=Traditional%20Wear')}
                  className="bg-black/60 hover:bg-black text-white hover:text-amber-300 border border-[#3A3A4A] hover:border-amber-400 text-xs sm:text-sm px-6 py-3.5 rounded-full transition-all backdrop-blur-md font-semibold cursor-pointer"
                >
                  Bespoke Traditional
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Arrows */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveBannerIdx((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
                }
                className="p-2.5 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white border border-[#333342] transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-mono text-amber-400 px-2">
                0{activeBannerIdx + 1} / 0{activeBanners.length}
              </span>
              <button
                onClick={() => setActiveBannerIdx((prev) => (prev + 1) % activeBanners.length)}
                className="p-2.5 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white border border-[#333342] transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Master Front Campaign Banner - MB Mohsin Bhatti Traditional Wear */}
      <section className="py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto">
        <div
          onClick={() => navigate('/products?category=Traditional%20Wear')}
          className="group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/35 bg-black shadow-2xl hover:border-amber-400/80 transition-all duration-300"
          title="Click to explore MB Traditional Shalwar Kameez Collection"
        >
          {/* Main User Provided High-Fashion Banner */}
          <img
            src="/assets/aistudio/image_f8e24ddc.png"
            alt="MB Mohsin Bhatti Clothing - Timeless Tradition, Modern You"
            className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          />

          {/* Interactive Floating Hover Pill */}
          <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-10 hidden sm:flex items-center gap-2 bg-black/85 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs font-bold px-4 py-2 rounded-full shadow-xl transition-all group-hover:bg-amber-500 group-hover:text-black">
            <span>Explore Traditional Edit</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Poetic Praise (Tareef) & Quick Concierge Bar */}
        <div className="mt-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#121218] via-[#0E0E14] to-[#121218] border border-[#262635] shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Two Poetic Praise Lines in Urdu & Roman Urdu */}
          <div className="space-y-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest font-cinzel">
                Shahi Libaas • Timeless Elegance
              </span>
            </div>
            <p className="font-serif-luxury text-base sm:text-lg md:text-xl font-bold text-amber-100">
              “ہر انداز میں شاہی وقار، ہر لباس میں بے مثال نزاکت۔”
            </p>
            <p className="text-xs sm:text-sm text-gray-400 italic">
              “Har andaaz mein shahi waqar, har libaas mein be-misaal nazaakat. Zari aur resham ka haseen sangam.”
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => navigate('/products?category=Traditional%20Wear')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all shadow-md shadow-amber-950/40 cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>Shop Shalwar Kameez</span>
              <ArrowRight size={13} />
            </button>

            <a
              href={`https://wa.me/${(settings.whatsappNumber || '+923001234567').replace(/[^0-9]/g, '')}?text=Assalam-o-Alaikum!%20I%20am%20interested%20in%20the%20MB%20Mohsin%20Bhatti%20Traditional%20Wear%20collection.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1A1A24] hover:bg-[#252533] text-emerald-400 border border-emerald-500/40 text-xs sm:text-sm px-4 py-2.5 rounded-full transition-colors font-medium text-center"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>

        {/* Minimalist Trust Assurance Row */}
        <div className="mt-3 py-2.5 px-4 rounded-xl bg-[#0A0A0E] border border-[#1E1E28] flex flex-wrap items-center justify-around gap-2 text-[11px] text-gray-300">
          <span className="flex items-center gap-1.5">
            <Truck size={13} className="text-amber-400" />
            <span>Free Express Nationwide Delivery &gt; {formatPKR(settings.freeShippingThreshold)}</span>
          </span>
          <span className="text-gray-600 hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Cash on Delivery (COD) Available</span>
          </span>
          <span className="text-gray-600 hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-amber-400" />
            <span>7-Day Hassle-Free Fitting Exchange</span>
          </span>
        </div>
      </section>

      {/* Categories Showcase Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest font-cinzel">
            CURATED DEPARTMENTS
          </p>
          <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-white mt-1">
            Explore Distinctive Attire
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-[#16161E] border border-[#23232D] hover:border-amber-500/50 cursor-pointer shadow-lg transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-108"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity group-hover:opacity-90" />

              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold font-cinzel">
                  {cat.itemCount ? `${cat.itemCount} DESIGNS` : 'EXPLORE'}
                </span>
                <h3 className="text-white text-base sm:text-lg font-bold font-serif-luxury group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-gray-300 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Shop Collection</span>
                  <ChevronRight size={13} className="text-amber-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collections & Best Sellers Tab Section */}
      <section className="py-12 bg-[#0E0E13] border-t border-[#1C1C24] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest font-cinzel">
                THE SARTORIAL EDIT
              </p>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
                Distinguished Garments
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setProductTab('featured')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  productTab === 'featured'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#272736]'
                }`}
              >
                Featured Pieces
              </button>
              <button
                onClick={() => setProductTab('bestseller')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  productTab === 'bestseller'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#272736]'
                }`}
              >
                Best Sellers
              </button>
              <button
                onClick={() => setProductTab('new')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  productTab === 'new'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#272736]'
                }`}
              >
                New Arrivals
              </button>
              <button
                onClick={() => setProductTab('sale')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  productTab === 'sale'
                    ? 'bg-red-600 text-white shadow-md font-bold'
                    : 'bg-[#181822] text-red-400 hover:text-red-300 border border-[#272736]'
                }`}
              >
                Special Discounts
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tabProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} navigate={navigate} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 bg-[#181822] hover:bg-amber-500 hover:text-black text-amber-300 border border-amber-500/30 hover:border-amber-400 font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-all cursor-pointer shadow-lg"
            >
              <span>View All 2026 Collections</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Traditional Pakistani Ceremonial Wear Spotlight Banner */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#17130B] via-[#1A1813] to-[#0E0E12] border border-amber-500/30 p-8 sm:p-12 shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80"
              alt="Pakistani Traditional Wear"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-xl relative z-10 space-y-4">
            <div className="inline-block bg-amber-500/20 text-amber-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border border-amber-500/40">
              The Bespoke Heritage Atelier
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Royal Embroidered Prince Coats &amp; Jamawar Waistcoats
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Elevate weddings, festive celebrations, and ceremonial evenings with our hand-tailored Pakistani bridal wear. Embellished with antique tilla threadwork, pure Banarasi brocade, and tailored to perfection.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/products?category=Traditional%20Wear')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-6 py-3 rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Shop Ceremonial Collection</span>
                <ArrowRight size={15} />
              </button>

              <div className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Custom At-Home Sizing Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Wear Mini Showcase */}
      {traditionalProducts.length > 0 && (
        <section className="pb-16 px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider font-cinzel">
                BESPOKE TRADITION
              </p>
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
                Kurta Shalwar &amp; Waistcoats
              </h3>
            </div>
            <button
              onClick={() => navigate('/products?category=Traditional%20Wear')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {traditionalProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* Promotional Coupon Card */}
      <section className="bg-gradient-to-b from-[#101016] to-[#0A0A0D] border-t border-[#1C1C24] py-12 px-6">
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#14141C] border border-[#2E2E3E] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              LIMITED TIME PROMOTION
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-white">
              Enjoy 10% Off Your Entire First Order
            </h3>
            <p className="text-xs text-gray-400 max-w-md">
              Apply coupon code during checkout on all luxury menswear, women's festive wear, and tailored shirts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="border-2 border-dashed border-amber-500/60 bg-[#1A1A24] px-5 py-2.5 rounded-xl font-mono text-base font-bold text-amber-300 tracking-widest">
              WELCOME10
            </div>
            <button
              onClick={() => navigate('/products')}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Claim Discount
            </button>
          </div>
        </div>
      </section>

      {/* Verified Pakistani Client Testimonials */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest font-cinzel">
            CLIENT SATISFACTION
          </p>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mt-1">
            Words From Our Connoisseurs
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#121217] border border-[#22222E] flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed italic">
                "Ordered the Royal Zari Prince Coat for my brother’s Mehndi in Lahore. The embroidery threadwork is genuine antique matte gold and the drape of the raw silk is world-class. Delivered in 2 days via TCS."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1F1F2A] flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-bold">Barrister Daniyal Qureshi</p>
                <p className="text-[10px] text-gray-500">Gulberg III, Lahore</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121217] border border-[#22222E] flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed italic">
                "The Egyptian Giza formal shirts fit like Savile Row bespoke tailoring. Crisp collar, perfect cuffs, and they don't crease after hours in corporate meetings. Cash on delivery was seamless."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1F1F2A] flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-bold">Zayd Al-Hassan</p>
                <p className="text-[10px] text-gray-500">DHA Phase 6, Karachi</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                Verified Buyer
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121217] border border-[#22222E] flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed italic">
                "The velvet shawl suit from their women's collection is royal. Micro velvet with intricate tilla work. Received endless compliments at the Islamabad club banquet. MB Clothing is unmatched."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1F1F2A] flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-bold">Mahnoor Tariq</p>
                <p className="text-[10px] text-gray-500">Sector F-7/2, Islamabad</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                Verified Buyer
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
