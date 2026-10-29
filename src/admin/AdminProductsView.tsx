import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Layers, 
  Tag, 
  Eye, 
  EyeOff, 
  Star, 
  Sparkles, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Product, Category } from '../types';
import { useStore } from '../context/StoreContext';

export const AdminProductsView: React.FC = () => {
  const { formatPKR, token, showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  // Modal / Drawer state
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Traditional Wear');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [fabricDetails, setFabricDetails] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [regularPrice, setRegularPrice] = useState<number | ''>(9990);
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(15);
  const [sizesStr, setSizesStr] = useState('S, M, L, XL');
  const [colorsStr, setColorsStr] = useState('Midnight Black (#111111), Pearl Ivory (#FDFBF7)');
  const [imagesStr, setImagesStr] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isPublished, setIsPublished] = useState(true);

  // Pakistani Luxury Photo Presets for 1-click addition
  const photoPresets = [
    { label: 'Royal Prince Coat (Black & Gold)', url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Italian Navy Blazer Suit', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Women Velvet Pret Suit', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Embroidered Kurta Shalwar', url: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Egyptian Formal Shirt', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Japanese Selvedge Denim', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Tailored Gurkha Trousers', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Heavyweight Streetwear Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80' }
  ];

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products?all=true', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories')
      .then((r) => r.json())
      .then((cats) => setCategories(cats || []))
      .catch(() => {});
  }, [token]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`MB-PK-${Math.floor(100 + Math.random() * 900)}`);
    setCategory(categories[0]?.name || 'Traditional Wear');
    setSubcategory('');
    setDescription('');
    setFabricDetails('');
    setCareInstructions('Gentle wash or professional dry clean.');
    setRegularPrice(8990);
    setSalePrice('');
    setCostPrice(4000);
    setStock(20);
    setSizesStr('S, M, L, XL');
    setColorsStr('Midnight Black (#111111), Pearl Ivory (#FDFBF7)');
    setImagesStr('https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80');
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsNewArrival(true);
    setIsPublished(true);
    setShowDrawer(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setSubcategory(p.subcategory || '');
    setDescription(p.description);
    setFabricDetails(p.fabricDetails || '');
    setCareInstructions(p.careInstructions || '');
    setRegularPrice(p.regularPrice);
    setSalePrice(p.salePrice || '');
    setCostPrice(p.costPrice || '');
    setStock(p.stock);
    setSizesStr(p.sizes.join(', '));
    setColorsStr(p.colors.map((c) => `${c.name} (${c.hex})`).join(', '));
    setImagesStr(p.images.join('\n'));
    setIsFeatured(p.isFeatured);
    setIsBestSeller(p.isBestSeller);
    setIsNewArrival(p.isNewArrival);
    setIsPublished(p.isPublished);
    setShowDrawer(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse sizes
    const sizes = sizesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Parse colors
    const colors = colorsStr
      .split(',')
      .map((part) => {
        const match = part.match(/(.*?)\s*\((#?[a-zA-Z0-9]+)\)/);
        if (match) {
          return { name: match[1].trim(), hex: match[2].trim() };
        }
        return { name: part.trim(), hex: '#111111' };
      })
      .filter((c) => c.name);

    // Parse images
    const images = imagesStr
      .split(/[\n,]+/)
      .map((img) => img.trim())
      .filter(Boolean);

    const payload = {
      name,
      sku,
      category,
      subcategory,
      description,
      fabricDetails,
      careInstructions,
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      stock: Number(stock),
      sizes: sizes.length > 0 ? sizes : ['Standard'],
      colors: colors.length > 0 ? colors : [{ name: 'Default', hex: '#111111' }],
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80'],
      isFeatured,
      isBestSeller,
      isNewArrival,
      isPublished
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingProduct ? 'Product updated successfully' : 'Product created successfully', 'success');
        setShowDrawer(false);
        fetchProducts();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch {
      showToast('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prodName}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('Product deleted from catalog', 'info');
        fetchProducts();
      }
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleTogglePublished = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !product.isPublished })
      });

      if (res.ok) {
        showToast(`Product ${product.isPublished ? 'Unpublished' : 'Published'}`, 'success');
        fetchProducts();
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const filtered = products.filter((p) => {
    if (filterCat && p.category !== filterCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-extrabold text-white">
            Garment Catalog Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Publish, edit, and synchronize luxury products with real-time stock tracking
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Garment</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0E0E14] border border-[#22222E] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, category, SKU..."
            className="w-full bg-[#161622] border border-[#292938] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-[#161622] border border-[#292938] text-xs text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer w-full sm:w-auto"
          >
            <option value="">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="p-6 rounded-2xl bg-[#0E0E14] border border-[#22222E] shadow-xl overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-amber-400 animate-pulse font-mono">
            Synchronizing inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No products found matching your search.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#1E1E28]">
              <tr>
                <th className="py-3 px-2">Garment</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Regular / Sale Price</th>
                <th className="py-3 px-2">Stock Level</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Badges</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A24]">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#12121A] transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-12 h-14 object-cover object-top rounded-lg bg-[#181822] shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs line-clamp-1">{prod.name}</h4>
                        <span className="text-[10px] text-gray-500 font-mono">SKU: {prod.sku}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2 text-amber-400 font-medium">
                    {prod.category}
                  </td>

                  <td className="py-3 px-2 font-mono">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{formatPKR(prod.salePrice || prod.regularPrice)}</span>
                      {prod.salePrice && (
                        <span className="text-gray-500 line-through text-[10px]">
                          {formatPKR(prod.regularPrice)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-2 font-mono">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        prod.stock === 0
                          ? 'bg-red-500/20 text-red-400'
                          : prod.stock <= 10
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {prod.stock} units
                    </span>
                  </td>

                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleTogglePublished(prod)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                        prod.isPublished
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      {prod.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{prod.isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-1 text-[9px] font-bold uppercase">
                      {prod.isFeatured && (
                        <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Featured</span>
                      )}
                      {prod.isBestSeller && (
                        <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Best Seller</span>
                      )}
                      {prod.isNewArrival && (
                        <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">New</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 rounded-lg bg-[#181822] text-gray-300 hover:text-amber-400 transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 rounded-lg bg-[#181822] text-gray-300 hover:text-red-400 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Drawer Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <div className="relative bg-[#111116] border border-[#2D2D3C] rounded-3xl max-w-2xl w-full p-6 sm:p-8 z-10 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#20202E]">
                <h3 className="font-serif-luxury text-xl font-bold text-white">
                  {editingProduct ? 'Edit Garment Details' : 'Add New Atelier Garment'}
                </h3>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Raw Silk Prince Coat"
                    className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Subcategory</label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. Prince Coats"
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="MB-TR-001"
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2.5 px-3 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Regular Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(Number(e.target.value))}
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Sale Price (PKR)</label>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Optional"
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Cost Price (PKR)</label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Optional"
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Stock Count *</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Sizes & Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Available Sizes (Comma-separated)</label>
                    <input
                      type="text"
                      value={sizesStr}
                      onChange={(e) => setSizesStr(e.target.value)}
                      placeholder="S, M, L, XL, XXL"
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Colors (e.g. Black (#000), Gold (#D4AF37))</label>
                    <input
                      type="text"
                      value={colorsStr}
                      onChange={(e) => setColorsStr(e.target.value)}
                      className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-300 font-semibold">Image URLs (One per line or comma-separated)</label>
                  </div>
                  <textarea
                    rows={2}
                    value={imagesStr}
                    onChange={(e) => setImagesStr(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white font-mono text-[11px]"
                  />

                  {/* 1-Click Luxury Pakistani Image Presets */}
                  <div className="mt-2 p-2.5 rounded-xl bg-[#14141E] border border-[#22222E]">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                      Quick 1-Click Pakistani Fashion Image Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {photoPresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setImagesStr((prev) => (prev ? `${prev}\n${preset.url}` : preset.url));
                          }}
                          className="text-[10px] bg-[#1A1A26] hover:bg-amber-500 hover:text-black border border-[#2E2E3E] text-gray-300 px-2 py-1 rounded transition-colors"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fabric & Description */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Fabric &amp; Craftsmanship</label>
                  <input
                    type="text"
                    value={fabricDetails}
                    onChange={(e) => setFabricDetails(e.target.value)}
                    placeholder="e.g. 100% Pure Raw Silk with Antique Gold Zari embroidery"
                    className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Garment Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed description..."
                    className="w-full bg-[#161622] border border-[#2B2B38] rounded-xl py-2 px-3 text-white"
                  />
                </div>

                {/* Badges Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#14141E] border border-[#22222E]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="accent-amber-400 w-4 h-4"
                    />
                    <span className="text-gray-200">Published</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="accent-amber-400 w-4 h-4"
                    />
                    <span className="text-gray-200">Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="accent-amber-400 w-4 h-4"
                    />
                    <span className="text-gray-200">Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="accent-amber-400 w-4 h-4"
                    />
                    <span className="text-gray-200">New Arrival</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowDrawer(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#1C1C28] text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs px-7 py-2.5 rounded-xl shadow-lg cursor-pointer"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Garment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
