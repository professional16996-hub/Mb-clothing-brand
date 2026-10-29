import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface QuickViewModalProps {
  navigate: (route: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ navigate }) => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    formatPKR,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useStore();

  const product = quickViewProduct;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Sync state when product changes
  React.useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedSize(product.sizes[0] || 'Standard');
      setSelectedColor(product.colors[0]?.name || 'Standard');
      setQuantity(1);
      setAdded(false);
    }
  }, [product]);

  if (!product) return null;

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

  const handleFullDetail = () => {
    setQuickViewProduct(null);
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        />

        <div className="relative inline-block align-bottom bg-[#121217] border border-[#2B2B38] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full z-10">
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-gray-400 hover:text-white hover:bg-black transition-colors"
          >
            <X size={20} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery */}
            <div className="p-4 sm:p-6 bg-[#0E0E12] flex flex-col justify-between">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#181822] relative">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-xs px-2.5 py-0.5 rounded shadow">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 sm:p-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
                  <span className="uppercase tracking-wider font-cinzel">{product.category}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={13} fill="currentColor" />
                    <span>{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
                  </div>
                </div>

                <h2 className="text-white text-lg sm:text-xl font-bold mt-1 font-serif-luxury tracking-wide">
                  {product.name}
                </h2>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">SKU: {product.sku}</p>

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-2xl font-bold font-cinzel text-amber-400">
                    {formatPKR(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm line-through text-gray-500 font-mono">
                      {formatPKR(product.regularPrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 mt-3 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>

                {product.fabricDetails && (
                  <div className="mt-3 p-2.5 rounded-lg bg-[#181822] border border-[#232330] text-xs">
                    <span className="text-amber-400 font-semibold block mb-0.5">Fabric &amp; Craftsmanship:</span>
                    <span className="text-gray-300 text-[11px]">{product.fabricDetails}</span>
                  </div>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mt-4">
                    <label className="text-xs text-gray-300 font-semibold block mb-1.5">
                      Color: <span className="text-amber-400">{selectedColor}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 ${
                            selectedColor === c.name ? 'border-amber-400 scale-110' : 'border-transparent'
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

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-gray-300 font-semibold">
                        Select Size: <span className="text-amber-400">{selectedSize}</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`py-1.5 text-xs rounded-lg border font-semibold transition-all ${
                            selectedSize === s
                              ? 'bg-amber-500 text-black border-amber-400'
                              : 'bg-[#181822] text-gray-300 border-[#2A2A38] hover:border-amber-500/50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs text-gray-300 font-semibold">Quantity:</span>
                  <div className="flex items-center border border-[#2B2B38] rounded-lg bg-[#181822]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1 text-gray-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-white font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-2.5 py-1 text-gray-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    ({product.stock} available in stock)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-[#1F1F2A]">
                <div className="flex gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
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
                    className={`p-3 rounded-xl border border-[#2D2D3A] transition-colors cursor-pointer ${
                      isFavorited ? 'bg-amber-500 text-black border-amber-400' : 'bg-[#181822] text-gray-300 hover:text-amber-400'
                    }`}
                    title="Wishlist"
                  >
                    <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <button
                  onClick={handleFullDetail}
                  className="w-full text-center text-xs text-amber-400 hover:text-amber-300 underline font-medium py-1"
                >
                  View Full Product Specifications &amp; Size Guide &rarr;
                </button>

                <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Truck size={12} className="text-amber-400" /> Free Shipping &gt; ₨ 5,000
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-amber-400" /> Cash on Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
