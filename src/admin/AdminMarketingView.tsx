import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, Image as ImageIcon, Save, X, Eye, EyeOff } from 'lucide-react';
import { Category, Banner } from '../types';
import { useStore } from '../context/StoreContext';

export const AdminMarketingView: React.FC = () => {
  const { token, showToast } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Banner Modal
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSub, setBannerSub] = useState('');
  const [bannerTag, setBannerTag] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('EXPLORE COLLECTION');
  const [bannerCtaLink, setBannerCtaLink] = useState('/products');
  const [bannerImg, setBannerImg] = useState('');
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/banners').then((r) => r.json())
    ])
      .then(([cats, bans]) => {
        setCategories(cats || []);
        setBanners(bans || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Category Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCatId ? `/api/categories/${editingCatId}` : '/api/categories';
    const method = editingCatId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: catName, description: catDesc, image: catImage })
      });

      if (res.ok) {
        showToast('Category saved successfully', 'success');
        setShowCatModal(false);
        fetchData();
      }
    } catch {
      showToast('Error saving category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Category deleted', 'info');
        fetchData();
      }
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  // Banner Handlers
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedBanners = [...banners];

    if (editingBannerId) {
      updatedBanners = updatedBanners.map((b) =>
        b.id === editingBannerId
          ? {
              ...b,
              title: bannerTitle,
              subtitle: bannerSub,
              tag: bannerTag,
              ctaText: bannerCtaText,
              ctaLink: bannerCtaLink,
              imageUrl: bannerImg
            }
          : b
      );
    } else {
      updatedBanners.push({
        id: 'bnr-' + Date.now(),
        title: bannerTitle,
        subtitle: bannerSub,
        tag: bannerTag,
        ctaText: bannerCtaText,
        ctaLink: bannerCtaLink,
        imageUrl: bannerImg,
        active: true
      });
    }

    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ banners: updatedBanners })
      });

      if (res.ok) {
        showToast('Homepage hero banners updated', 'success');
        setShowBannerModal(false);
        setBanners(updatedBanners);
      }
    } catch {
      showToast('Error updating banners', 'error');
    }
  };

  const handleToggleBannerActive = async (bannerId: string) => {
    const updated = banners.map((b) => (b.id === bannerId ? { ...b, active: !b.active } : b));
    try {
      await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ banners: updated })
      });
      setBanners(updated);
      showToast('Banner visibility toggled', 'success');
    } catch {
      showToast('Error updating banner', 'error');
    }
  };

  return (
    <div className="space-y-10">
      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
              Category Department Taxonomy
            </h2>
            <p className="text-xs text-gray-400">
              Manage product groups, sub-departments, and customer navigation links
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCatId(null);
              setCatName('');
              setCatDesc('');
              setCatImage('https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80');
              setShowCatModal(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Department</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-[#0E0E14] border border-[#22222E] flex flex-col justify-between space-y-3"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#181822]">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>

              <div>
                <h4 className="text-white font-bold text-sm">{cat.name}</h4>
                <p className="text-gray-400 text-xs line-clamp-2 mt-1">{cat.description}</p>
                <p className="text-[10px] text-amber-400 font-mono mt-1">Slug: /{cat.slug}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1C1C26]">
                <button
                  onClick={() => {
                    setEditingCatId(cat.id);
                    setCatName(cat.name);
                    setCatDesc(cat.description);
                    setCatImage(cat.image);
                    setShowCatModal(true);
                  }}
                  className="p-1.5 rounded-lg bg-[#181824] text-gray-300 hover:text-amber-400"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-1.5 rounded-lg bg-[#181824] text-gray-300 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Banners Section */}
      <div className="space-y-4 pt-6 border-t border-[#20202A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
              Homepage Hero Slides &amp; Campaigns
            </h2>
            <p className="text-xs text-gray-400">
              Configure luxury lookbook banners, headlines, call-to-actions, and background photography
            </p>
          </div>

          <button
            onClick={() => {
              setEditingBannerId(null);
              setBannerTitle('');
              setBannerSub('');
              setBannerTag('FESTIVE COUTURE');
              setBannerCtaText('EXPLORE COLLECTION');
              setBannerCtaLink('/products');
              setBannerImg('https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=85');
              setShowBannerModal(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Campaign Banner</span>
          </button>
        </div>

        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-[#0E0E14] border border-[#22222E] flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-24 h-16 object-cover rounded-xl bg-[#181822] shrink-0"
                />
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider font-bold">
                    {b.tag}
                  </span>
                  <h4 className="text-white font-bold text-sm line-clamp-1">{b.title}</h4>
                  <p className="text-gray-400 text-xs line-clamp-1">{b.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleToggleBannerActive(b.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                    b.active
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {b.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{b.active ? 'Active' : 'Inactive'}</span>
                </button>

                <button
                  onClick={() => {
                    setEditingBannerId(b.id);
                    setBannerTitle(b.title);
                    setBannerSub(b.subtitle);
                    setBannerTag(b.tag);
                    setBannerCtaText(b.ctaText);
                    setBannerCtaLink(b.ctaLink);
                    setBannerImg(b.imageUrl);
                    setShowBannerModal(true);
                  }}
                  className="p-2 rounded-lg bg-[#181824] text-gray-300 hover:text-amber-400"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowCatModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-[#111116] border border-[#2D2D3C] rounded-2xl max-w-md w-full p-6 text-white z-10 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#20202E] pb-3">
              <h3 className="font-serif-luxury text-base font-bold">
                {editingCatId ? 'Edit Department' : 'Create New Category'}
              </h3>
              <button onClick={() => setShowCatModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white font-mono text-[11px]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 text-black font-bold py-2.5 rounded-xl uppercase mt-2"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowBannerModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-[#111116] border border-[#2D2D3C] rounded-2xl max-w-lg w-full p-6 text-white z-10 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#20202E] pb-3">
              <h3 className="font-serif-luxury text-base font-bold">
                {editingBannerId ? 'Edit Hero Slide' : 'New Campaign Banner'}
              </h3>
              <button onClick={() => setShowBannerModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Hero Title *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Subtitle</label>
                <input
                  type="text"
                  value={bannerSub}
                  onChange={(e) => setBannerSub(e.target.value)}
                  className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={bannerTag}
                    onChange={(e) => setBannerTag(e.target.value)}
                    className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerCtaText}
                    onChange={(e) => setBannerCtaText(e.target.value)}
                    className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Button Target Link</label>
                <input
                  type="text"
                  value={bannerCtaLink}
                  onChange={(e) => setBannerCtaLink(e.target.value)}
                  className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Background Image URL</label>
                <input
                  type="text"
                  value={bannerImg}
                  onChange={(e) => setBannerImg(e.target.value)}
                  className="w-full bg-[#181822] border border-[#292938] rounded-xl py-2 px-3 text-white font-mono text-[11px]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 text-black font-bold py-2.5 rounded-xl uppercase mt-2"
              >
                Save Campaign Slide
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
