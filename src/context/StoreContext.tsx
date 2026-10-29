import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, StoreSettings, Coupon } from '../types';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  couponData?: Coupon;
}

interface StoreContextType {
  currentUser: User | null;
  token: string | null;
  isAdmin: boolean;
  cart: CartItem[];
  wishlist: string[];
  settings: StoreSettings;
  appliedCoupon: AppliedCoupon | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  isCartOpen: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  quickViewProduct: Product | null;
  toast: ToastInfo | null;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  formatPKR: (val: number | undefined) => string;
  setCartOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => void;
  setQuickViewProduct: (product: Product | null) => void;
  refreshSettings: () => Promise<void>;
  updateCustomerProfile: (updated: Partial<User>) => void;
}

const defaultSettings: StoreSettings = {
  storeName: 'MB Clothing',
  tagline: 'Haute Couture & Premium Ready-to-Wear',
  logoText: 'MB CLOTHING',
  whatsappNumber: '+923008472910',
  supportEmail: 'concierge@mbclothing.pk',
  supportPhone: '+92 (42) 3578-9000',
  physicalAddress: 'Flagship Atelier: 14-L, Mini Market, Gulberg II, Lahore | Karachi Studio: Phase 6 DHA, Karachi',
  freeShippingThreshold: 5000,
  standardShippingFee: 250,
  expressShippingFee: 450,
  shippingPolicy: 'Free express shipping across Pakistan on orders above ₨ 5,000. Nationwide Cash on Delivery (COD) available.',
  returnPolicy: '7-day hassle-free exchanges on all standard garments.',
  currency: '₨'
};

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mb_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('mb_token') || null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mb_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('mb_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mb_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('mb_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('mb_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('mb_coupon');
    }
  }, [appliedCoupon]);

  // Load Settings
  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Validate Token on Mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Invalid token');
        })
        .then((data) => {
          setCurrentUser(data.user);
          localStorage.setItem('mb_user', JSON.stringify(data.user));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const formatPKR = (val: number | undefined): string => {
    if (val === undefined || isNaN(val)) return '₨ 0';
    return `₨ ${Math.round(val).toLocaleString()}`;
  };

  // Cart Management
  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.productId === product.id && item.selectedSize === size && item.selectedColor === color
      );

      const unitPrice = product.salePrice || product.regularPrice;

      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Cannot add more than ${product.stock} available in stock`, 'error');
          return prevCart;
        }
        updated[existingIdx].quantity = newQty;
        showToast(`Updated quantity in cart (${newQty})`, 'success');
        return updated;
      } else {
        if (quantity > product.stock) {
          showToast(`Only ${product.stock} items left in stock`, 'error');
          return prevCart;
        }
        showToast(`Added "${product.name}" to cart`, 'success');
        return [
          ...prevCart,
          {
            productId: product.id,
            product,
            selectedSize: size,
            selectedColor: color,
            quantity,
            unitPrice
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.selectedSize === size && item.selectedColor === color) {
          if (quantity > item.product.stock) {
            showToast(`Maximum ${item.product.stock} available in stock`, 'error');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Recalculate coupon discount
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    discount = appliedCoupon.discountAmount;
    if (discount > subtotal) discount = subtotal;
  }

  const shippingFee =
    cart.length === 0
      ? 0
      : subtotal >= settings.freeShippingThreshold
      ? 0
      : settings.standardShippingFee;

  const total = Math.max(0, subtotal - discount + shippingFee);

  // Apply Coupon
  const applyCoupon = async (code: string) => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a coupon code' };
    }
    if (cart.length === 0) {
      return { success: false, message: 'Your cart is empty. Add items first.' };
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to apply coupon' };
      }

      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        couponData: data.coupon
      });

      showToast(`Coupon "${data.code}" applied! Saved ${formatPKR(data.discountAmount)}`, 'success');
      return { success: true, message: `Discount of ${formatPKR(data.discountAmount)} applied!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Auth Operations
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('mb_token', data.token);
      localStorage.setItem('mb_user', JSON.stringify(data.user));

      showToast(`Welcome back, ${data.user.name}!`, 'success');
      setIsAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login request failed' };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Registration failed' };
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('mb_token', data.token);
      localStorage.setItem('mb_user', JSON.stringify(data.user));

      showToast('Account created successfully!', 'success');
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration request failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('mb_token');
    localStorage.removeItem('mb_user');
    showToast('Signed out successfully', 'info');
  };

  const updateCustomerProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const next = { ...currentUser, ...updated };
    setCurrentUser(next);
    localStorage.setItem('mb_user', JSON.stringify(next));
  };

  const setAuthModalOpen = (open: boolean, mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(open);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        token,
        isAdmin: currentUser?.role === 'admin',
        cart,
        wishlist,
        settings,
        appliedCoupon,
        subtotal,
        discount,
        shippingFee,
        total,
        isCartOpen,
        isAuthModalOpen,
        authModalMode,
        quickViewProduct,
        toast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        login,
        register,
        logout,
        showToast,
        formatPKR,
        setCartOpen: setIsCartOpen,
        setAuthModalOpen,
        setQuickViewProduct,
        refreshSettings,
        updateCustomerProfile
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
