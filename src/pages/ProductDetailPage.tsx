import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Ruler, 
  Share2, 
  Check, 
  X,
  PhoneCall,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailPageProps {
  productId: string;
  navigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, navigate }) => {
  const { 
    formatPKR, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setCartOpen,
    settings,
    showToast 
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'fabric' | 'sizing' | 'shipping' | 'reviews'>('desc');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedSize(data.sizes[0] || 'Standard');
        setSelectedColor(data.colors[0]?.name || 'Standard');
        setActiveImageIdx(0);
        setLoading(false);

        // Fetch related products
        fetch(`/api/products?category=${encodeURIComponent(data.category)}`)
          .then((r) => r.json())
          .then((rel) => {
            setRelatedProducts((rel || []).filter((p: Product) => p.id !== data.id).slice(0, 4));
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] flex items-center justify-center text-amber-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0D] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <h2 className="font-serif-luxury text-2xl font-bold">Product Not Found</h2>
        <p className="text-gray-400 text-xs">The garment you are looking for may have been retired from our catalog.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-amber-500 text-black font-bold text-xs px-6 py-2.5 rounded-full"
        >
          Return to Collections
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const currentPrice = product.salePrice || product.regularPrice;
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.salePrice!) / product.regularPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
        <button onClick={() => navigate('/')} className="hover:text-amber-400">
          Home
        </button>
        <ChevronRight size={12} />
        <button onClick={() => navigate('/products')} className="hover:text-amber-400">
          Catalog
        </button>
        <ChevronRight size={12} />
        <button
          onClick={() => navigate(`/products?category=${encodeURIComponent(product.category)}`)}
          className="hover:text-amber-400"
        >
          {product.category}
        </button>
        <ChevronRight size={12} />
        <span className="text-amber-400 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#16161F] border border-[#23232E] relative shadow-2xl">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />

            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded shadow-lg uppercase tracking-wider">
                SAVE {discountPercent}%
              </span>
            )}

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-gray-300 hover:text-white backdrop-blur-md border border-[#333342] transition-colors"
              title="Share Link"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? 'border-amber-400 scale-105 shadow-md shadow-amber-950/40'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
              <span className="uppercase tracking-widest font-cinzel">{product.subcategory || product.category}</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star size={14} fill="currentColor" />
                <span className="font-bold">{product.rating.toFixed(1)}</span>
                <span className="text-gray-500">({product.reviewCount} verified reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif-luxury text-white mt-1.5 tracking-wide leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Item Code: {product.sku}</p>

            {/* Pricing in PKR */}
            <div className="flex items-baseline gap-3 mt-4 pt-3 border-t border-[#1C1C24]">
              <span className="text-3xl font-extrabold font-cinzel text-amber-400">
                {formatPKR(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-base line-through text-gray-500 font-mono">
                  {formatPKR(product.regularPrice)}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  You Save {formatPKR(product.regularPrice - currentPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">
                Garment Shade: <span className="text-amber-400 font-bold">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-9 h-9 rounded-full border-2 transition-all p-0.5 ${
                      selectedColor === c.name ? 'border-amber-400 scale-110 shadow-lg' : 'border-transparent'
                    }`}
                    title={c.name}
                  >
                    <span
                      className="w-full h-full rounded-full block border border-gray-600"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector with Size Guide Trigger */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-300">
                  Select Size: <span className="text-amber-400 font-bold">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSizeModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold underline cursor-pointer"
                >
                  <Ruler size={13} /> Size Guide (Inches &amp; CM)
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 text-xs rounded-xl border font-bold transition-all ${
                      selectedSize === s
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                        : 'bg-[#14141C] text-gray-300 border-[#282836] hover:border-amber-500/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {product.stock > 10 ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                In Stock &bull; Ready for immediate dispatch
              </span>
            ) : product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Limited Stock &bull; Only {product.stock} units remaining in atelier
              </span>
            ) : (
              <span className="text-red-400 font-semibold">
                Currently Out of Stock &bull; Contact concierge for made-to-order
              </span>
            )}
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#2B2B38] rounded-xl bg-[#14141C] p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-gray-400 hover:text-white"
                >
                  -
                </button>
                <span className="px-4 text-xs font-mono font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1.5 text-gray-400 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                  added
                    ? 'bg-emerald-500 text-black'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black'
                }`}
              >
                {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                <span>{added ? 'Added to Bag' : 'Add to Bag'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border border-[#2C2C3A] transition-colors cursor-pointer ${
                  isFavorited
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-[#14141C] text-gray-300 hover:text-amber-400'
                }`}
                title="Wishlist"
              >
                <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Direct Buy Now (Instant Checkout) */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full bg-[#181824] hover:bg-[#222230] text-amber-300 hover:text-amber-200 border border-amber-500/40 font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
            >
              Express Buy Now (Cash on Delivery)
            </button>
          </div>

          {/* Quick Perks Strip */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1C1C24] text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <Truck size={16} className="text-amber-400 shrink-0" />
              <span>2-4 Days Delivery via TCS</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck size={16} className="text-amber-400 shrink-0" />
              <span>Cash on Delivery (COD)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <RotateCcw size={16} className="text-amber-400 shrink-0" />
              <span>7-Day Hassle-Free Exchange</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <PhoneCall size={16} className="text-amber-400 shrink-0" />
              <span>WhatsApp Fitting Assistance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Fabric, Sizing, Delivery, Reviews */}
      <div className="mt-16 border-t border-[#1F1F2A] pt-10">
        <div className="flex flex-wrap gap-2 sm:gap-6 border-b border-[#1E1E28] pb-3">
          <button
            onClick={() => setActiveTab('desc')}
            className={`font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'desc'
                ? 'text-amber-400 border-amber-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Design &amp; Silhouette
          </button>
          <button
            onClick={() => setActiveTab('fabric')}
            className={`font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'fabric'
                ? 'text-amber-400 border-amber-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Fabric &amp; Care
          </button>
          <button
            onClick={() => setActiveTab('sizing')}
            className={`font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sizing'
                ? 'text-amber-400 border-amber-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Measurements Guide
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'shipping'
                ? 'text-amber-400 border-amber-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Nationwide Logistics
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-amber-400 border-amber-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Reviews ({product.reviewCount})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-6 max-w-4xl text-xs sm:text-sm text-gray-300 leading-relaxed">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#1C1C26]">
                <div className="p-4 rounded-xl bg-[#13131A] border border-[#22222E]">
                  <h4 className="font-bold text-white text-xs uppercase mb-1 text-amber-400 font-cinzel">Cut &amp; Fit</h4>
                  <p className="text-xs text-gray-300">
                    Tailored with precision contours to celebrate modern masculine and feminine proportions, honoring traditional Pakistani draping heritage.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#13131A] border border-[#22222E]">
                  <h4 className="font-bold text-white text-xs uppercase mb-1 text-amber-400 font-cinzel">Origin &amp; Atelier</h4>
                  <p className="text-xs text-gray-300">
                    Individually hand-cut, basted, and inspected at the MB Clothing atelier in Gulberg, Lahore, Pakistan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fabric' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#14141C] border border-[#252534]">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2 font-cinzel">
                  Material Composition
                </h4>
                <p className="text-white text-sm">{product.fabricDetails}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#14141C] border border-[#252534]">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2 font-cinzel">
                  Care &amp; Longevity Instructions
                </h4>
                <p className="text-gray-300">{product.careInstructions}</p>
              </div>
            </div>
          )}

          {activeTab === 'sizing' && (
            <div className="space-y-4">
              <p>Standard measurements for Pakistani tailored clothing (in inches):</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#262634] rounded-xl overflow-hidden">
                  <thead className="bg-[#181822] text-amber-400 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Size Tag</th>
                      <th className="p-3">Chest / Bust</th>
                      <th className="p-3">Shoulder</th>
                      <th className="p-3">Garment Length</th>
                      <th className="p-3">Sleeve Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#22222E] bg-[#101016]">
                    <tr><td className="p-3 font-bold text-white font-mono">Small (S)</td><td className="p-3">38" - 39"</td><td className="p-3">17.5"</td><td className="p-3">40"</td><td className="p-3">24.5"</td></tr>
                    <tr><td className="p-3 font-bold text-white font-mono">Medium (M)</td><td className="p-3">41" - 42"</td><td className="p-3">18.5"</td><td className="p-3">42"</td><td className="p-3">25.5"</td></tr>
                    <tr><td className="p-3 font-bold text-white font-mono">Large (L)</td><td className="p-3">44" - 45"</td><td className="p-3">19.5"</td><td className="p-3">43"</td><td className="p-3">26.0"</td></tr>
                    <tr><td className="p-3 font-bold text-white font-mono">X-Large (XL)</td><td className="p-3">47" - 48"</td><td className="p-3">20.5"</td><td className="p-3">44"</td><td className="p-3">26.5"</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <p>
                MB Clothing partners with TCS Express and Leopards Courier to ensure rapid, secure delivery across all cities and towns in Pakistan.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>Lahore, Islamabad, Rawalpindi &amp; Karachi: <strong>2 - 3 Business Days</strong></li>
                <li>Faisalabad, Multan, Peshawar, Sialkot, Quetta &amp; Gujranwala: <strong>3 - 4 Business Days</strong></li>
                <li>Free shipping applies automatically on all domestic orders above {formatPKR(settings.freeShippingThreshold)}.</li>
                <li>Cash on Delivery (COD) is supported up to ₨ 50,000 without advance payment.</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#20202A]">
                <div>
                  <h4 className="text-white font-bold text-base">Verified Buyer Ratings</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <span className="font-bold text-white">{product.rating.toFixed(1)} out of 5</span>
                    <span className="text-gray-400">({product.reviewCount} customer reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#13131A] border border-[#22222E]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">Kamran Aslam &bull; Lahore</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Verified Purchase</span>
                  </div>
                  <div className="flex text-amber-400 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300">
                    "Exceptional quality and finishing. Delivered in a luxury garment dust bag and wooden hanger. Size M was true to fit."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-[#1F1F2A] pt-12">
          <div className="text-center mb-8">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest font-cinzel">
              COMPLETE THE LOOK
            </p>
            <h3 className="font-serif-luxury text-2xl font-bold text-white mt-1">
              Complementary Masterpieces
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* Sizing Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowSizeModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-[#121218] border border-[#2D2D3C] rounded-2xl p-6 sm:p-8 max-w-lg w-full text-white z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#242434] pb-3">
              <h3 className="font-cinzel text-base font-bold text-amber-400">
                MB ATELIER SIZE CONVERSION GUIDE
              </h3>
              <button onClick={() => setShowSizeModal(false)}><X size={20} /></button>
            </div>
            <p className="text-xs text-gray-400">
              For custom measurements or tailored fittings at our Gulberg Lahore atelier, contact our WhatsApp Concierge at {settings.whatsappNumber}.
            </p>
            <table className="w-full text-xs text-left border border-[#2A2A3A]">
              <thead className="bg-[#1A1A26] text-amber-300 font-bold">
                <tr><th className="p-2.5">Tag</th><th className="p-2.5">Chest</th><th className="p-2.5">Waist</th><th className="p-2.5">Height Fit</th></tr>
              </thead>
              <tbody className="divide-y divide-[#242434]">
                <tr><td className="p-2.5 font-bold font-mono">S</td><td className="p-2.5">38"</td><td className="p-2.5">30" - 32"</td><td className="p-2.5">5'6" – 5'9"</td></tr>
                <tr><td className="p-2.5 font-bold font-mono">M</td><td className="p-2.5">41"</td><td className="p-2.5">32" - 34"</td><td className="p-2.5">5'9" – 6'0"</td></tr>
                <tr><td className="p-2.5 font-bold font-mono">L</td><td className="p-2.5">44"</td><td className="p-2.5">35" - 37"</td><td className="p-2.5">5'11" – 6'2"</td></tr>
                <tr><td className="p-2.5 font-bold font-mono">XL</td><td className="p-2.5">47"</td><td className="p-2.5">38" - 41"</td><td className="p-2.5">6'0" – 6'4"</td></tr>
              </tbody>
            </table>
            <button
              onClick={() => setShowSizeModal(false)}
              className="w-full bg-amber-500 text-black font-bold text-xs py-2.5 rounded-xl uppercase"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
