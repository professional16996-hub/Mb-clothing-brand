import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  Search, 
  ArrowUpDown, 
  RotateCcw,
  Tag,
  Check
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductsPageProps {
  initialCategory?: string;
  initialSearch?: string;
  initialSale?: boolean;
  navigate: (route: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  initialCategory,
  initialSearch,
  initialSale,
  navigate
}) => {
  const { formatPKR } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [onlySale, setOnlySale] = useState<boolean>(initialSale || false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(35000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialCategory !== undefined) setSelectedCategory(initialCategory);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
    if (initialSale !== undefined) setOnlySale(initialSale);
  }, [initialCategory, initialSearch, initialSale]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json())
    ])
      .then(([prods, cats]) => {
        setProducts(prods || []);
        setCategories(cats || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38R', '40R', '42R', '44R'];

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory && selectedCategory !== 'All') {
        const catMatch =
          p.category.toLowerCase() === selectedCategory.toLowerCase() ||
          (p.subcategory && p.subcategory.toLowerCase() === selectedCategory.toLowerCase());
        if (!catMatch) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Sale filter
      if (onlySale) {
        if (!p.salePrice || p.salePrice >= p.regularPrice) return false;
      }

      // Size
      if (selectedSize) {
        if (!p.sizes.some((s) => s.toLowerCase().includes(selectedSize.toLowerCase()))) {
          return false;
        }
      }

      // Price
      const price = p.salePrice || p.regularPrice;
      if (price < minPrice || price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice || a.regularPrice;
      const priceB = b.salePrice || b.regularPrice;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, searchQuery, onlySale, selectedSize, minPrice, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedSize('');
    setOnlySale(false);
    setMinPrice(0);
    setMaxPrice(35000);
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(
    selectedCategory || searchQuery || selectedSize || onlySale || minPrice > 0 || maxPrice < 35000
  );

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-gray-200 py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header & Title */}
      <div className="border-b border-[#1E1E26] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase font-cinzel tracking-widest text-amber-400 font-bold">
            THE MB COLLECTION &bull; PAKISTAN
          </p>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-extrabold text-white mt-1">
            {selectedCategory || (onlySale ? 'Special Discounts & Sale' : 'All Luxury Apparel')}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Showing {filteredProducts.length} handcrafted pieces tailored for elegance
          </p>
        </div>

        {/* Sort & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 bg-[#16161E] border border-[#2B2B38] px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-200"
          >
            <SlidersHorizontal size={14} className="text-amber-400" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#16161E] border border-[#2B2B38] text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="newest">Sort by: Newest Releases</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-[#0E0E14] border border-[#22222C] rounded-2xl p-6 h-fit sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#20202A]">
            <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-amber-400" />
              <span>Refine Catalog</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          {/* Search in Catalog */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Search Items</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kurta, blazer, denim..."
                className="w-full bg-[#16161E] border border-[#282836] rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Categories</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  !selectedCategory ? 'bg-amber-500 text-black font-bold' : 'text-gray-300 hover:bg-[#1A1A24]'
                }`}
              >
                <span>All Collections</span>
                <span>{products.length}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat.name
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-gray-300 hover:bg-[#1A1A24]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70">
                    {products.filter((p) => p.category === cat.name).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">Price in PKR</label>
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                {formatPKR(minPrice)} - {formatPKR(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Sizes */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Size</label>
            <div className="grid grid-cols-4 gap-1.5">
              {allSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                  className={`py-1 text-xs rounded-lg border font-semibold transition-all ${
                    selectedSize === s
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-[#14141C] text-gray-300 border-[#262634] hover:border-amber-500/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* On Sale Switch */}
          <div className="pt-2 border-t border-[#20202A]">
            <button
              onClick={() => setOnlySale(!onlySale)}
              className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                onlySale
                  ? 'bg-red-500/10 border-red-500 text-red-400 font-bold'
                  : 'bg-[#14141C] border-[#262634] text-gray-300 hover:border-red-400/40'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Tag size={14} className={onlySale ? 'text-red-400' : 'text-gray-400'} />
                <span>Discounted Items Only</span>
              </span>
              {onlySale && <Check size={14} />}
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-[#121218] border border-[#22222E]">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Active:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('')}><X size={12} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#1F1F2C] text-gray-200 border border-[#333344] px-2.5 py-0.5 rounded-full">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                </span>
              )}
              {selectedSize && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  Size: {selectedSize}
                  <button onClick={() => setSelectedSize('')}><X size={12} /></button>
                </span>
              )}
              {onlySale && (
                <span className="inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-0.5 rounded-full">
                  Sale Only
                  <button onClick={() => setOnlySale(false)}><X size={12} /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-gray-400 hover:text-amber-400 underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#14141C] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#0E0E14] border border-[#22222C] rounded-2xl p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#181824] flex items-center justify-center mx-auto text-gray-500">
                <Search size={28} />
              </div>
              <h3 className="font-serif-luxury text-xl font-bold text-white">No Matching Garments Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                We couldn't find products matching your filter criteria. Try resetting your filters or exploring our other collections.
              </p>
              <button
                onClick={resetFilters}
                className="bg-amber-500 text-black font-bold text-xs px-6 py-2.5 rounded-full hover:bg-amber-400 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-[#0E0E14] border-l border-[#23232E] p-6 overflow-y-auto space-y-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#20202A]">
              <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                Filters
              </h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                    !selectedCategory ? 'bg-amber-500 text-black font-bold' : 'text-gray-300'
                  }`}
                >
                  All Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                      selectedCategory === cat.name ? 'bg-amber-500 text-black font-bold' : 'text-gray-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span>Max Price:</span>
                <span className="font-mono text-amber-400 font-bold">{formatPKR(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="35000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Mobile Sizes */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Sizes</label>
              <div className="grid grid-cols-3 gap-2">
                {allSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                    className={`py-1.5 text-xs rounded-lg border font-semibold ${
                      selectedSize === s
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-[#161622] text-gray-300 border-[#292938]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 rounded-xl text-xs uppercase"
            >
              Apply &amp; View Results ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
