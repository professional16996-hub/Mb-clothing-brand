import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  navigate: (route: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const { 
    formatPKR, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setQuickViewProduct 
  } = useStore();

  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Standard');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const hasDiscount = product.salePrice && product.salePrice < product.regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.salePrice!) / product.regularPrice) * 100)
    : 0;

  const currentPrice = product.salePrice || product.regularPrice;
  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, selectedColor, 1);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      setShowQuickAdd(false);
    }, 1200);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowQuickAdd(false);
      }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative bg-[#121217] rounded-xl border border-[#23232D] hover:border-amber-500/40 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-amber-950/20"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#181820]">
        <img
          src={hovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-red-600/90 backdrop-blur-sm text-white font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded uppercase shadow">
              SAVE {discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded uppercase shadow">
              BEST SELLER
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="bg-white/90 backdrop-blur-sm text-black font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded uppercase shadow">
              NEW
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-600/90 text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase shadow">
              Only {product.stock} Left
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-800 text-gray-300 font-bold text-[9px] px-2 py-0.5 rounded uppercase shadow">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorited
              ? 'bg-amber-500 text-black shadow-md'
              : 'bg-black/50 text-white hover:text-amber-400 hover:bg-black/80 backdrop-blur-sm'
          }`}
          title="Save to Wishlist"
        >
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          className="absolute bottom-3 left-3 right-3 py-2 bg-[#121216]/90 hover:bg-amber-500 hover:text-black text-white text-xs font-semibold rounded-lg backdrop-blur-md border border-[#33333F] hover:border-amber-400 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1.5 z-10"
        >
          <Eye size={15} />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
            <span className="uppercase tracking-wider text-amber-400/90 font-medium truncate max-w-[70%]">
              {product.subcategory || product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <Star size={12} fill="currentColor" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white text-sm font-semibold tracking-wide line-clamp-1 group-hover:text-amber-300 transition-colors">
            {product.name}
          </h3>

          {/* Color preview dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  style={{ backgroundColor: c.hex }}
                  className="w-2.5 h-2.5 rounded-full border border-gray-600 inline-block"
                  title={c.name}
                />
              ))}
              <span className="text-[10px] text-gray-500 ml-1">
                {product.colors.length} {product.colors.length === 1 ? 'color' : 'colors'}
              </span>
            </div>
          )}
        </div>

        {/* Price & Quick Add Button */}
        <div className="mt-3 pt-3 border-t border-[#1F1F28] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-amber-400 font-bold text-sm sm:text-base font-cinzel">
                {formatPKR(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-gray-500 line-through text-xs font-mono">
                  {formatPKR(product.regularPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Trigger */}
          <div className="relative">
            {product.stock > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.sizes.length > 1) {
                    setShowQuickAdd(!showQuickAdd);
                  } else {
                    handleQuickAdd(e);
                  }
                }}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  addedAnimation
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#1C1C26] hover:bg-amber-500 text-gray-200 hover:text-black border border-[#2D2D3A] hover:border-amber-400'
                }`}
                title="Add to Cart"
              >
                {addedAnimation ? <Check size={16} /> : <ShoppingBag size={16} />}
              </button>
            ) : (
              <span className="text-[10px] text-gray-500 font-semibold px-2 py-1 bg-[#1A1A22] rounded">
                Out of Stock
              </span>
            )}

            {/* Quick Size Picker Dropdown */}
            {showQuickAdd && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full right-0 mb-2 w-48 bg-[#181822] border border-[#333342] rounded-xl shadow-2xl p-3 z-30 animate-in fade-in zoom-in-95"
              >
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-2">Select Size</p>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`text-[11px] py-1 rounded border font-medium ${
                        selectedSize === s
                          ? 'bg-amber-500 text-black border-amber-400 font-bold'
                          : 'bg-[#13131A] text-gray-300 border-[#2E2E3C] hover:border-amber-500/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleQuickAdd}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:brightness-110"
                >
                  <ShoppingBag size={13} />
                  <span>Confirm Add</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
