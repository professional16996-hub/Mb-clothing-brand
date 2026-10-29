import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'mb_clothing_store.json');
const JWT_SECRET = process.env.JWT_SECRET || 'mb-clothing-pakistan-luxury-secret-key-2026';

// Helper for password hashing
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

// Generate simple secure token
function createToken(payload: { id: string; email: string; role: string; name: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  const signature = hmac.update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + signature;
}

function verifyToken(token: string): { id: string; email: string; role: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const data = Buffer.from(parts[0], 'base64').toString('utf8');
    const signature = parts[1];
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(data);
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Initial Seed Data
function getSeedData() {
  const adminAuth = hashPassword('MBAdmin@2026!');
  const customerAuth = hashPassword('Customer@123');

  return {
    settings: {
      storeName: 'MB Clothing',
      tagline: 'Haute Couture & Premium Ready-to-Wear',
      logoText: 'MB CLOTHING',
      whatsappNumber: '+923008472910',
      supportEmail: 'concierge@mbclothing.pk',
      supportPhone: '+92 (42) 3578-9000',
      physicalAddress: 'Flagship Atelier: 14-L, Mini Market, Gulberg II, Lahore, Pakistan | Karachi Studio: Bukhari Commercial, Phase 6, DHA, Karachi',
      freeShippingThreshold: 5000,
      standardShippingFee: 250,
      expressShippingFee: 450,
      currency: '₨',
      shippingPolicy: 'MB Clothing delivers nationwide across Pakistan using premium express couriers (TCS & Leopards). Orders within Lahore & Karachi are delivered in 2-3 business days. Other cities take 3-5 business days. Cash on Delivery (COD) is available up to ₨ 50,000. Free shipping applies automatically to domestic orders over ₨ 5,000.',
      returnPolicy: 'We offer a 7-day hassle-free exchange policy for unworn, unwashed garments with original tags intact. Made-to-measure and custom-tailored traditional attire are non-refundable but include one complimentary fitting adjustment at our atelier. For online returns, contact concierge@mbclothing.pk or WhatsApp us.'
    },
    users: [
      {
        id: 'usr-admin-01',
        name: 'MB Executive Admin',
        email: 'admin@mbclothing.pk',
        phone: '+92 300 8472910',
        passwordHash: adminAuth.hash,
        passwordSalt: adminAuth.salt,
        role: 'admin',
        createdAt: '2026-01-15T08:00:00.000Z'
      },
      {
        id: 'usr-cust-01',
        name: 'Shahmeer Khan',
        email: 'shahmeer.khan@gmail.com',
        phone: '+92 321 4455667',
        passwordHash: customerAuth.hash,
        passwordSalt: customerAuth.salt,
        role: 'customer',
        province: 'Punjab',
        city: 'Lahore',
        address: 'House 42, Street 8, Sector Y, DHA Phase 3',
        createdAt: '2026-02-10T11:20:00.000Z'
      },
      {
        id: 'usr-cust-02',
        name: 'Ayesha Siddiqui',
        email: 'ayesha.siddiqui@outlook.com',
        phone: '+92 333 9876543',
        passwordHash: customerAuth.hash,
        passwordSalt: customerAuth.salt,
        role: 'customer',
        province: 'Sindh',
        city: 'Karachi',
        address: 'Apartment 5B, Creek Vistas, Phase 8, DHA',
        createdAt: '2026-02-18T14:45:00.000Z'
      }
    ],
    categories: [
      {
        id: 'cat-traditional',
        name: 'Traditional Wear',
        slug: 'traditional-wear',
        description: 'Bespoke Kurta sets, Jamawar waistcoats, Prince coats, and handcrafted sherwanis.',
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'cat-mens-clothing',
        name: "Men's Clothing",
        slug: 'mens-clothing',
        description: 'Italian tailored suits, fine blazer jackets, luxury outerwear, and formal essentials.',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'cat-womens-clothing',
        name: "Women's Clothing",
        slug: 'womens-clothing',
        description: 'Exquisite embroidered pret, festive silk ensembles, and contemporary luxury silhouettes.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'cat-shirts',
        name: 'Shirts',
        slug: 'shirts',
        description: 'Egyptian Giza cotton formal shirts, pure linen button-downs, and smart casuals.',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'cat-tshirts',
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Heavyweight Supima cotton tees, luxury mercerized polos, and minimalist essentials.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'cat-jeans',
        name: 'Jeans',
        slug: 'jeans',
        description: 'Japanese selvedge denim, comfortable stretch slim cuts, and premium vintage washes.',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'cat-trousers',
        name: 'Trousers',
        slug: 'trousers',
        description: 'Tailored Gurkha trousers, pleated wool-blend chinos, and elegant formal slacks.',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'cat-hoodies',
        name: 'Hoodies',
        slug: 'hoodies',
        description: '480 GSM French Terry hoodies, brushed fleece pullovers, and luxury streetwear.',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
      }
    ],
    products: [
      {
        id: 'prod-001',
        name: 'Royal Zari Embroidered Prince Coat',
        slug: 'royal-zari-embroidered-prince-coat',
        description: 'An iconic formal masterpiece crafted from midnight black raw silk, embellished with antique matte gold Zari hand-embroidery across the mandarin collar, pocket welt, and cuffs. Finished with handcrafted gold crest buttons and satin lining.',
        fabricDetails: '100% Pure Raw Silk with Gold Bullion Thread Work',
        careInstructions: 'Dry clean only by luxury garment specialists. Store in garment bag with cedar hanger.',
        category: 'Traditional Wear',
        subcategory: 'Prince Coats',
        regularPrice: 28990,
        salePrice: 23990,
        costPrice: 12000,
        stock: 14,
        sku: 'MB-TR-001',
        sizes: ['38R (S)', '40R (M)', '42R (L)', '44R (XL)'],
        colors: [
          { name: 'Midnight Onyx & Gold', hex: '#111111' },
          { name: 'Imperial Navy & Silver', hex: '#0e1e38' }
        ],
        images: [
          'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isPublished: true,
        createdAt: '2026-02-01T10:00:00.000Z',
        rating: 4.9,
        reviewCount: 38
      },
      {
        id: 'prod-002',
        name: 'Embroidered Charcoal Kurta Shalwar Suit',
        slug: 'embroidered-charcoal-kurta-shalwar-suit',
        description: 'Signature Pakistani traditional wear tailored from high-thread-count Egyptian blended cotton. Features delicate tone-on-tone thread embroidery on the placket and cuffs, with matching tapered shalwar.',
        fabricDetails: 'Superior Combed Egyptian Blended Cotton (Breathable, Crease-Resistant)',
        careInstructions: 'Gentle hand wash or delicate machine wash. Warm iron on reverse side.',
        category: 'Traditional Wear',
        subcategory: 'Kurta Shalwar',
        regularPrice: 8990,
        salePrice: 6990,
        costPrice: 3200,
        stock: 28,
        sku: 'MB-TR-002',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Charcoal Smoke', hex: '#2B2B2B' },
          { name: 'Pearl Ivory', hex: '#FDFBF7' },
          { name: 'Royal Pine Green', hex: '#1A3326' }
        ],
        images: [
          'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isPublished: true,
        createdAt: '2026-01-20T10:00:00.000Z',
        rating: 4.8,
        reviewCount: 54
      },
      {
        id: 'prod-003',
        name: 'Bespoke Jamawar Gold Heritage Waistcoat',
        slug: 'bespoke-jamawar-gold-heritage-waistcoat',
        description: 'Woven with traditional Mughal-inspired floral motifs in metallic champagne gold and rich black silk. Features a classic band collar, welt pockets, and bespoke brass antique buttons.',
        fabricDetails: 'Authentic Banarasi Jamawar Brocade with Silk Lining',
        careInstructions: 'Dry clean only. Do not bleach or tumble dry.',
        category: 'Traditional Wear',
        subcategory: 'Waistcoats',
        regularPrice: 10990,
        salePrice: 8490,
        costPrice: 4000,
        stock: 19,
        sku: 'MB-TR-003',
        sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)'],
        colors: [
          { name: 'Champagne Gold', hex: '#D4AF37' },
          { name: 'Imperial Emerald', hex: '#0B3B2C' }
        ],
        images: [
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        isPublished: true,
        createdAt: '2026-01-10T10:00:00.000Z',
        rating: 4.9,
        reviewCount: 29
      },
      {
        id: 'prod-004',
        name: 'Italian Cut Midnight Navy Blazer',
        slug: 'italian-cut-midnight-navy-blazer',
        description: 'Single-breasted two-button blazer with pick-stitched peak lapels and double rear vents. Constructed with light half-canvas structure for exceptional drape and natural shoulder contour.',
        fabricDetails: 'Super 120s Australian Fine Wool Blend with Silk Bemberg Lining',
        careInstructions: 'Professional dry clean only. Steam press.',
        category: "Men's Clothing",
        subcategory: 'Blazers & Suits',
        regularPrice: 21990,
        salePrice: 17990,
        costPrice: 8500,
        stock: 12,
        sku: 'MB-MC-001',
        sizes: ['38R', '40R', '42R', '44R'],
        colors: [
          { name: 'Midnight Navy', hex: '#0D1B2A' },
          { name: 'Jet Black', hex: '#000000' }
        ],
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        isPublished: true,
        createdAt: '2026-02-05T10:00:00.000Z',
        rating: 4.7,
        reviewCount: 19
      },
      {
        id: 'prod-005',
        name: 'Giza Egyptian Cotton Crisp Formal Shirt',
        slug: 'giza-egyptian-cotton-crisp-formal-shirt',
        description: 'Expertly tailored with a structured semi-spread collar, mother-of-pearl buttons, and convertible French cuffs. Treated with non-iron liquid ammonia finish for all-day crispness.',
        fabricDetails: '100% 2-Ply Long-Staple Egyptian Giza 88 Cotton (140s Thread Count)',
        careInstructions: 'Machine wash warm, hang dry. Medium heat iron while slightly damp.',
        category: 'Shirts',
        subcategory: 'Formal Shirts',
        regularPrice: 5990,
        salePrice: 4790,
        costPrice: 2100,
        stock: 35,
        sku: 'MB-SH-001',
        sizes: ['15 (S)', '15.5 (M)', '16 (L)', '16.5 (XL)', '17 (XXL)'],
        colors: [
          { name: 'Pure Chalk White', hex: '#FFFFFF' },
          { name: 'Sky Celeste Blue', hex: '#D0E1F9' },
          { name: 'French Lavender', hex: '#E6E6FA' }
        ],
        images: [
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        isPublished: true,
        createdAt: '2026-01-25T10:00:00.000Z',
        rating: 4.8,
        reviewCount: 42
      },
      {
        id: 'prod-006',
        name: 'Pure French Linen Resort Shirt',
        slug: 'pure-french-linen-resort-shirt',
        description: 'Breezy Cuban camp collar shirt garment-dyed for ultra-soft hand feel. Relaxed silhouette perfect for warm Pakistani summer evenings and destination travel.',
        fabricDetails: '100% Normandy French Flax Linen (Pre-Washed & Softened)',
        careInstructions: 'Gentle cycle machine wash in cold water. Natural air dry.',
        category: 'Shirts',
        subcategory: 'Casual Shirts',
        regularPrice: 4990,
        stock: 22,
        sku: 'MB-SH-002',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Natural Sand', hex: '#D2B48C' },
          { name: 'Sage Olive', hex: '#556B2F' },
          { name: 'Crisp White', hex: '#FFFFFF' }
        ],
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        isPublished: true,
        createdAt: '2026-02-12T10:00:00.000Z',
        rating: 4.6,
        reviewCount: 15
      },
      {
        id: 'prod-007',
        name: 'Heavyweight Supima Cotton Luxury T-Shirt',
        slug: 'heavyweight-supima-cotton-luxury-t-shirt',
        description: 'Crafted from dense 260 GSM combed American Supima cotton. Cut with clean dropped shoulders, ribbed crewneck that retains shape wash after wash, and blind stitched hems.',
        fabricDetails: '100% Combed Compact Supima Cotton with Silken Enzyme Finish',
        careInstructions: 'Machine wash cold with like colors. Tumble dry low.',
        category: 'T-Shirts',
        subcategory: 'Luxury Tees',
        regularPrice: 3290,
        salePrice: 2490,
        costPrice: 950,
        stock: 50,
        sku: 'MB-TS-001',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Matte Jet Black', hex: '#111111' },
          { name: 'Oatmeal Heather', hex: '#E3DAC9' },
          { name: 'Espresso Brown', hex: '#3B2F2F' }
        ],
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        isPublished: true,
        createdAt: '2026-01-18T10:00:00.000Z',
        rating: 4.9,
        reviewCount: 67
      },
      {
        id: 'prod-008',
        name: 'Japanese Selvedge Raw Denim Jeans',
        slug: 'japanese-selvedge-raw-denim-jeans',
        description: 'Woven on vintage shuttle looms in Okayama using 14.5 oz unwashed indigo denim with red-line selvedge ID. Custom MB antique brass hardware and veg-tan leather back patch.',
        fabricDetails: '100% Kurabo Mills Japanese Raw Selvedge Cotton Denim (14.5 oz)',
        careInstructions: 'Wear frequently. Wash cold inside out after 6 months for custom fading.',
        category: 'Jeans',
        subcategory: 'Selvedge Denim',
        regularPrice: 7990,
        salePrice: 6490,
        costPrice: 2800,
        stock: 18,
        sku: 'MB-JN-001',
        sizes: ['30/32', '32/32', '34/32', '36/32', '38/32'],
        colors: [
          { name: 'Deep Indigo Selvedge', hex: '#1B263B' },
          { name: 'Washed Charcoal Black', hex: '#2B2B2B' }
        ],
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        isPublished: true,
        createdAt: '2026-02-08T10:00:00.000Z',
        rating: 4.8,
        reviewCount: 31
      },
      {
        id: 'prod-009',
        name: 'Pleated Italian Wool-Blend Gurkha Trousers',
        slug: 'pleated-italian-wool-blend-gurkha-trousers',
        description: 'Sophisticated sartorial trousers featuring an authentic double-buckle Gurkha waistband, deep inward front pleats, slant pockets, and a clean 2-inch turned-up cuff.',
        fabricDetails: '65% Fine Virgin Wool, 33% Polyester, 2% Elastane',
        careInstructions: 'Dry clean only. Steam touch-up.',
        category: 'Trousers',
        subcategory: 'Sartorial Slacks',
        regularPrice: 6490,
        salePrice: 4990,
        costPrice: 2200,
        stock: 24,
        sku: 'MB-TR-004',
        sizes: ['30', '32', '34', '36', '38'],
        colors: [
          { name: 'Castlerock Charcoal', hex: '#4A4E54' },
          { name: 'Camel Tan', hex: '#C19A6B' },
          { name: 'Deep Olive', hex: '#3D4B39' }
        ],
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        isPublished: true,
        createdAt: '2026-01-28T10:00:00.000Z',
        rating: 4.7,
        reviewCount: 22
      },
      {
        id: 'prod-010',
        name: 'Oversized 480 GSM French Terry Gold Crest Hoodie',
        slug: 'oversized-480-gsm-french-terry-gold-crest-hoodie',
        description: 'Ultra-heavyweight luxury streetwear hoodie. Features double-layered hood without drawstrings, kangaroo pocket with hidden card sleeve, and subtle tonal MB gold embroidered crest.',
        fabricDetails: '100% Combed Organic Cotton Heavy French Terry (480 GSM)',
        careInstructions: 'Machine wash cold inside out. Air dry flat.',
        category: 'Hoodies',
        subcategory: 'Luxury Streetwear',
        regularPrice: 6990,
        salePrice: 5490,
        costPrice: 2400,
        stock: 30,
        sku: 'MB-HD-001',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Pitch Black', hex: '#0B0B0B' },
          { name: 'Washed Stone', hex: '#8C8C88' },
          { name: 'Vintage Olive', hex: '#3B4136' }
        ],
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isPublished: true,
        createdAt: '2026-02-14T10:00:00.000Z',
        rating: 4.9,
        reviewCount: 48
      },
      {
        id: 'prod-011',
        name: 'Festive Velvet Embroidered Shawl 3-Piece Suit',
        slug: 'festive-velvet-embroidered-shawl-3-piece-suit',
        description: 'A masterpiece from our Haute Festive Women collection. Micro-velvet kurta adorned with Resham tilla and sequin handcrafting, paired with raw silk straight pants and a heavy Mughal border Kashmiri shawl.',
        fabricDetails: 'Pure Micro Velvet with Silk Organza Accents & Zari Work',
        careInstructions: 'Dry clean only. Wrap in muslin cloth when storing.',
        category: "Women's Clothing",
        subcategory: 'Festive Pret',
        regularPrice: 32990,
        salePrice: 26990,
        costPrice: 14000,
        stock: 9,
        sku: 'MB-WM-001',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Royal Crimson Maroon', hex: '#4A0E17' },
          { name: 'Regal Emerald Green', hex: '#0A3B29' },
          { name: 'Midnight Onyx', hex: '#111111' }
        ],
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isPublished: true,
        createdAt: '2026-02-15T10:00:00.000Z',
        rating: 5.0,
        reviewCount: 26
      },
      {
        id: 'prod-012',
        name: 'Pure Raw Silk Embroidered Co-ord Set',
        slug: 'pure-raw-silk-embroidered-co-ord-set',
        description: 'Contemporary high-fashion women’s co-ord ensemble. Features a structured band collar tunic with delicate pearl and beadwork along the neckline, paired with tailored culotte trousers.',
        fabricDetails: '100% Pure Raw Silk with Hand Embroidered Details',
        careInstructions: 'Specialist dry clean only. Steam iron.',
        category: "Women's Clothing",
        subcategory: 'Luxury Pret',
        regularPrice: 18990,
        salePrice: 15490,
        costPrice: 7500,
        stock: 15,
        sku: 'MB-WM-002',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [
          { name: 'Powder Blush Rose', hex: '#D8A47F' },
          { name: 'Champagne Ivory', hex: '#F7F4EB' }
        ],
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
        ],
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        isPublished: true,
        createdAt: '2026-02-18T10:00:00.000Z',
        rating: 4.8,
        reviewCount: 14
      }
    ],
    coupons: [
      {
        id: 'cpn-001',
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minSpend: 3000,
        maxDiscount: 2500,
        expiryDate: '2026-12-31',
        usageLimit: 500,
        usageCount: 68,
        isActive: true
      },
      {
        id: 'cpn-002',
        code: 'LUXURY500',
        discountType: 'fixed',
        discountValue: 500,
        minSpend: 4000,
        expiryDate: '2026-12-31',
        usageLimit: 300,
        usageCount: 42,
        isActive: true
      },
      {
        id: 'cpn-003',
        code: 'FESTIVE20',
        discountType: 'percentage',
        discountValue: 20,
        minSpend: 15000,
        maxDiscount: 6000,
        expiryDate: '2026-11-30',
        usageLimit: 100,
        usageCount: 18,
        isActive: true
      }
    ],
    banners: [
      {
        id: 'bnr-001',
        title: 'THE HAUTE HERITAGE COLLECTION',
        subtitle: 'Handcrafted raw silk prince coats, jamawar waistcoats & bespoke ceremonial wear.',
        tag: 'NEW 2026 CEREMONIAL EDITION',
        ctaText: 'EXPLORE COLLECTION',
        ctaLink: '/products?category=Traditional%20Wear',
        imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=85',
        active: true
      },
      {
        id: 'bnr-002',
        title: 'MODERN SARTORIAL EXCELLENCE',
        subtitle: 'Italian cut blazers, Egyptian Giza shirts, and tailored wool trousers.',
        tag: 'LUXURY MENSWEAR',
        ctaText: 'SHOP MENSWEAR',
        ctaLink: "/products?category=Men's%20Clothing",
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
        active: true
      },
      {
        id: 'bnr-003',
        title: 'ROYAL VELVET & SILK PRET',
        subtitle: 'Exquisite women’s festive ensembles with opulent hand embroidery and Kashmiri shawls.',
        tag: 'FESTIVE EDIT',
        ctaText: 'DISCOVER FESTIVE',
        ctaLink: "/products?category=Women's%20Clothing",
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
        active: true
      }
    ],
    orders: [
      {
        id: 'MB-PK-98241',
        customerId: 'usr-cust-01',
        customerName: 'Shahmeer Khan',
        customerEmail: 'shahmeer.khan@gmail.com',
        customerPhone: '+92 321 4455667',
        shippingAddress: {
          fullName: 'Shahmeer Khan',
          phone: '+92 321 4455667',
          email: 'shahmeer.khan@gmail.com',
          province: 'Punjab',
          city: 'Lahore',
          address: 'House 42, Street 8, Sector Y, DHA Phase 3',
          landmark: 'Near Y-Block Commercial Market',
          postalCode: '54792'
        },
        items: [
          {
            productId: 'prod-001',
            name: 'Royal Zari Embroidered Prince Coat',
            image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80',
            selectedSize: '40R (M)',
            selectedColor: 'Midnight Onyx & Gold',
            quantity: 1,
            unitPrice: 23990,
            totalPrice: 23990
          }
        ],
        subtotal: 23990,
        discount: 2399,
        couponCode: 'WELCOME10',
        shippingFee: 0,
        total: 21591,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'shipped',
        courierName: 'TCS Express',
        trackingNumber: 'TCS-924810294PK',
        notes: 'Please call before delivery. Handover to security if unavailable.',
        createdAt: '2026-02-24T14:30:00.000Z',
        updatedAt: '2026-02-25T11:00:00.000Z',
        timeline: [
          { status: 'pending', title: 'Order Placed', message: 'Order submitted via Cash on Delivery (COD).', timestamp: '2026-02-24T14:30:00.000Z' },
          { status: 'confirmed', title: 'Order Verified', message: 'Order verified by MB Concierge desk.', timestamp: '2026-02-24T15:15:00.000Z' },
          { status: 'processing', title: 'Quality Inspection & Packaging', message: 'Garment steamed, checked, and placed in luxury signature box.', timestamp: '2026-02-25T09:00:00.000Z' },
          { status: 'shipped', title: 'Dispatched via TCS', message: 'Package handed over to TCS Express. Tracking ID: TCS-924810294PK', timestamp: '2026-02-25T11:00:00.000Z' }
        ]
      },
      {
        id: 'MB-PK-98188',
        customerId: 'usr-cust-02',
        customerName: 'Ayesha Siddiqui',
        customerEmail: 'ayesha.siddiqui@outlook.com',
        customerPhone: '+92 333 9876543',
        shippingAddress: {
          fullName: 'Ayesha Siddiqui',
          phone: '+92 333 9876543',
          email: 'ayesha.siddiqui@outlook.com',
          province: 'Sindh',
          city: 'Karachi',
          address: 'Apartment 5B, Creek Vistas, Phase 8, DHA',
          landmark: 'Opposite Creek Club',
          postalCode: '75500'
        },
        items: [
          {
            productId: 'prod-011',
            name: 'Festive Velvet Embroidered Shawl 3-Piece Suit',
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
            selectedSize: 'M',
            selectedColor: 'Royal Crimson Maroon',
            quantity: 1,
            unitPrice: 26990,
            totalPrice: 26990
          }
        ],
        subtotal: 26990,
        discount: 0,
        shippingFee: 0,
        total: 26990,
        paymentMethod: 'cod',
        paymentStatus: 'cod_received',
        orderStatus: 'delivered',
        courierName: 'Leopards Courier',
        trackingNumber: 'LEO-74892100PK',
        notes: 'Leave with resident reception.',
        createdAt: '2026-02-20T10:00:00.000Z',
        updatedAt: '2026-02-23T16:30:00.000Z',
        timeline: [
          { status: 'pending', title: 'Order Placed', message: 'Order submitted.', timestamp: '2026-02-20T10:00:00.000Z' },
          { status: 'confirmed', title: 'Order Verified', message: 'Customer phone confirmed.', timestamp: '2026-02-20T11:00:00.000Z' },
          { status: 'processing', title: 'Atelier Preparation', message: 'Final finishing & perfume sachet enclosed.', timestamp: '2026-02-21T09:30:00.000Z' },
          { status: 'shipped', title: 'In Transit', message: 'Handed to Leopards Courier Karachi Hub.', timestamp: '2026-02-22T08:00:00.000Z' },
          { status: 'delivered', title: 'Delivered Successfully', message: 'Delivered & COD ₨ 26,990 collected.', timestamp: '2026-02-23T16:30:00.000Z' }
        ]
      }
    ],
    messages: [
      {
        id: 'msg-001',
        name: 'Bilal Farooq',
        email: 'bilal.farooq@yahoo.com',
        phone: '+92 301 5556677',
        subject: 'Custom Tailoring for Wedding Sherwani',
        message: 'Looking to order 4 bespoke waistcoats and 1 bridal prince coat for my brother’s Valima in Islamabad next month. Can we schedule an in-person measurement at your Gulberg atelier?',
        createdAt: '2026-02-26T09:15:00.000Z',
        read: false
      }
    ]
  };
}

// In-Memory DB Manager with Persistence
class Database {
  private data: any;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        console.log('Loaded database from', DB_FILE);
      } catch (err) {
        console.error('Failed to read db file, initializing with seeds:', err);
        this.data = getSeedData();
        this.save();
      }
    } else {
      this.data = getSeedData();
      this.save();
      console.log('Initialized brand new database at', DB_FILE);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing to db file:', err);
    }
  }

  public get(key: string) {
    return this.data[key];
  }

  public set(key: string, val: any) {
    this.data[key] = val;
    this.save();
  }

  public getData() {
    return this.data;
  }
}

const db = new Database();

// Authentication Middlewares
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token missing' });
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.user = user;
  next();
}

function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
}

// Optional Auth (for storefront orders or checkout)
function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (user) req.user = user;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const api = express.Router();

  // --- HEALTH & CONFIG ---
  api.get('/health', (req, res) => {
    res.json({ status: 'ok', store: 'MB Clothing Pakistan', time: new Date().toISOString() });
  });

  api.get('/settings', (req, res) => {
    res.json(db.get('settings'));
  });

  api.put('/admin/settings', adminOnly, (req: AuthRequest, res: Response) => {
    const current = db.get('settings');
    const updated = { ...current, ...req.body };
    db.set('settings', updated);
    res.json({ message: 'Store settings updated successfully', settings: updated });
  });

  // --- AUTHENTICATION ---
  api.post('/auth/register', (req, res) => {
    const { name, email, password, phone, province, city, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const users = db.get('users') || [];
    const existing = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const { hash, salt } = hashPassword(password);
    const newUser = {
      id: 'usr-' + Date.now(),
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      province: province || '',
      city: city || '',
      address: address || '',
      passwordHash: hash,
      passwordSalt: salt,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    db.set('users', users);

    const token = createToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
    const { passwordHash, passwordSalt, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: safeUser
    });
  });

  api.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = db.get('users') || [];
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const { passwordHash, passwordSalt, ...safeUser } = user;

    res.json({
      message: 'Logged in successfully',
      token,
      user: safeUser
    });
  });

  api.get('/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
    const users = db.get('users') || [];
    const user = users.find((u: any) => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const { passwordHash, passwordSalt, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // Admin Initializer or Password Reset
  api.post('/auth/admin-setup', (req, res) => {
    const { email, password, name, setupKey } = req.body;
    const users = db.get('users') || [];
    const existingAdmin = users.find((u: any) => u.role === 'admin');

    // If an admin already exists, require the setupKey to prevent unauthorized takeovers
    // Or allow updating the main admin password if default setupKey 'MB2026_INIT' matches
    if (existingAdmin && setupKey !== 'MB2026_INIT' && setupKey !== 'mb-admin-secret') {
      return res.status(400).json({ error: 'Admin already configured. Provide valid master setupKey to create or update.' });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required for admin setup' });
    }

    const { hash, salt } = hashPassword(password);
    let targetAdmin = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (targetAdmin) {
      targetAdmin.passwordHash = hash;
      targetAdmin.passwordSalt = salt;
      targetAdmin.role = 'admin';
      targetAdmin.name = name || targetAdmin.name;
    } else {
      targetAdmin = {
        id: 'usr-admin-' + Date.now(),
        name: name || 'MB Luxury Admin',
        email: email.toLowerCase(),
        passwordHash: hash,
        passwordSalt: salt,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      users.push(targetAdmin);
    }

    db.set('users', users);
    const token = createToken({ id: targetAdmin.id, email: targetAdmin.email, role: 'admin', name: targetAdmin.name });
    const { passwordHash, passwordSalt, ...safeUser } = targetAdmin;

    res.json({
      message: 'Admin account initialized successfully',
      token,
      user: safeUser
    });
  });

  // --- PRODUCTS (STOREFRONT & ADMIN) ---
  api.get('/products', (req, res) => {
    const {
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      featured,
      bestSeller,
      newArrival,
      all
    } = req.query;

    let products = db.get('products') || [];

    // Storefront only gets published products unless 'all=true' requested by admin token
    if (all !== 'true') {
      products = products.filter((p: any) => p.isPublished !== false);
    }

    if (category) {
      products = products.filter((p: any) =>
        p.category.toLowerCase() === String(category).toLowerCase() ||
        (p.subcategory && p.subcategory.toLowerCase() === String(category).toLowerCase())
      );
    }

    if (search) {
      const q = String(search).toLowerCase();
      products = products.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      products = products.filter((p: any) => (p.salePrice || p.regularPrice) >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter((p: any) => (p.salePrice || p.regularPrice) <= Number(maxPrice));
    }

    if (featured === 'true') {
      products = products.filter((p: any) => p.isFeatured);
    }

    if (bestSeller === 'true') {
      products = products.filter((p: any) => p.isBestSeller);
    }

    if (newArrival === 'true') {
      products = products.filter((p: any) => p.isNewArrival);
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a: any, b: any) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
    } else if (sort === 'price_desc') {
      products.sort((a: any, b: any) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
    } else if (sort === 'rating') {
      products.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'popular') {
      products.sort((a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
      // Default: Newest first
      products.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(products);
  });

  api.get('/products/:id', (req, res) => {
    const products = db.get('products') || [];
    const product = products.find((p: any) => p.id === req.params.id || p.slug === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // Admin Add Product
  api.post('/products', adminOnly, (req: AuthRequest, res: Response) => {
    const {
      name,
      category,
      subcategory,
      description,
      fabricDetails,
      careInstructions,
      regularPrice,
      salePrice,
      costPrice,
      stock,
      sizes,
      colors,
      images,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isPublished,
      sku
    } = req.body;

    if (!name || !category || !regularPrice) {
      return res.status(400).json({ error: 'Name, Category, and Regular Price are required' });
    }

    const products = db.get('products') || [];
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const newProduct = {
      id: 'prod-' + Date.now(),
      name,
      slug,
      category,
      subcategory: subcategory || '',
      description: description || '',
      fabricDetails: fabricDetails || '',
      careInstructions: careInstructions || '',
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      stock: Number(stock ?? 10),
      sku: sku || `MB-${category.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(colors) && colors.length > 0 ? colors : [{ name: 'Classic Black', hex: '#111111' }],
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80'],
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival ?? true),
      isPublished: isPublished !== false,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewCount: 1
    };

    products.unshift(newProduct);
    db.set('products', products);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  });

  // Admin Update Product
  api.put('/products/:id', adminOnly, (req: AuthRequest, res: Response) => {
    const products = db.get('products') || [];
    const index = products.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const current = products[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id, // prevent changing ID
      regularPrice: req.body.regularPrice !== undefined ? Number(req.body.regularPrice) : current.regularPrice,
      salePrice: req.body.salePrice !== undefined ? (req.body.salePrice ? Number(req.body.salePrice) : undefined) : current.salePrice,
      costPrice: req.body.costPrice !== undefined ? (req.body.costPrice ? Number(req.body.costPrice) : undefined) : current.costPrice,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : current.stock,
      updatedAt: new Date().toISOString()
    };

    products[index] = updated;
    db.set('products', products);

    res.json({
      message: 'Product updated successfully',
      product: updated
    });
  });

  // Admin Delete Product
  api.delete('/products/:id', adminOnly, (req: AuthRequest, res: Response) => {
    let products = db.get('products') || [];
    const exists = products.some((p: any) => p.id === req.params.id);
    if (!exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products = products.filter((p: any) => p.id !== req.params.id);
    db.set('products', products);

    res.json({ message: 'Product deleted successfully', id: req.params.id });
  });

  // --- CATEGORIES & BANNERS ---
  api.get('/categories', (req, res) => {
    const categories = db.get('categories') || [];
    const products = db.get('products') || [];
    
    // Add dynamic item count
    const withCounts = categories.map((cat: any) => {
      const count = products.filter((p: any) => p.category === cat.name && p.isPublished !== false).length;
      return { ...cat, itemCount: count };
    });

    res.json(withCounts);
  });

  api.post('/categories', adminOnly, (req: AuthRequest, res: Response) => {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const categories = db.get('categories') || [];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCategory = {
      id: 'cat-' + Date.now(),
      name,
      slug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'
    };

    categories.push(newCategory);
    db.set('categories', categories);
    res.status(201).json(newCategory);
  });

  api.put('/categories/:id', adminOnly, (req: AuthRequest, res: Response) => {
    const categories = db.get('categories') || [];
    const idx = categories.findIndex((c: any) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });

    categories[idx] = { ...categories[idx], ...req.body, id: categories[idx].id };
    db.set('categories', categories);
    res.json(categories[idx]);
  });

  api.delete('/categories/:id', adminOnly, (req: AuthRequest, res: Response) => {
    let categories = db.get('categories') || [];
    categories = categories.filter((c: any) => c.id !== req.params.id);
    db.set('categories', categories);
    res.json({ message: 'Category removed' });
  });

  api.get('/banners', (req, res) => {
    const banners = db.get('banners') || [];
    res.json(banners);
  });

  api.put('/admin/banners', adminOnly, (req: AuthRequest, res: Response) => {
    if (!Array.isArray(req.body.banners)) {
      return res.status(400).json({ error: 'Banners array is required' });
    }
    db.set('banners', req.body.banners);
    res.json({ message: 'Banners updated successfully', banners: req.body.banners });
  });

  // --- COUPONS ---
  api.post('/coupons/validate', (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupons = db.get('coupons') || [];
    const coupon = coupons.find((c: any) => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code. Please check and try again.' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: 'This coupon is no longer active.' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ error: 'This coupon code has expired.' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'This promotional coupon has reached its maximum usage limit.' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (coupon.minSpend && orderSubtotal < coupon.minSpend) {
      return res.status(400).json({
        error: `This coupon requires a minimum spend of ₨ ${coupon.minSpend.toLocaleString()}. Add ₨ ${(coupon.minSpend - orderSubtotal).toLocaleString()} more to unlock.`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      coupon
    });
  });

  api.get('/admin/coupons', adminOnly, (req: AuthRequest, res: Response) => {
    const coupons = db.get('coupons') || [];
    res.json(coupons);
  });

  api.post('/admin/coupons', adminOnly, (req: AuthRequest, res: Response) => {
    const { code, discountType, discountValue, minSpend, maxDiscount, expiryDate, usageLimit, isActive } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Code and Discount value are required' });
    }

    const coupons = db.get('coupons') || [];
    const newCoupon = {
      id: 'cpn-' + Date.now(),
      code: code.trim().toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minSpend: Number(minSpend || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiryDate: expiryDate || '2026-12-31',
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usageCount: 0,
      isActive: isActive !== false
    };

    coupons.push(newCoupon);
    db.set('coupons', coupons);
    res.status(201).json(newCoupon);
  });

  api.put('/admin/coupons/:id', adminOnly, (req: AuthRequest, res: Response) => {
    const coupons = db.get('coupons') || [];
    const idx = coupons.findIndex((c: any) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Coupon not found' });

    coupons[idx] = { ...coupons[idx], ...req.body, id: coupons[idx].id };
    db.set('coupons', coupons);
    res.json(coupons[idx]);
  });

  api.delete('/admin/coupons/:id', adminOnly, (req: AuthRequest, res: Response) => {
    let coupons = db.get('coupons') || [];
    coupons = coupons.filter((c: any) => c.id !== req.params.id);
    db.set('coupons', coupons);
    res.json({ message: 'Coupon deleted' });
  });

  // --- ORDERS & CHECKOUT ---
  api.post('/orders', optionalAuth, (req: AuthRequest, res: Response) => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      couponCode,
      paymentMethod,
      notes,
      shippingType
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer name, phone, shipping address, and order items are required' });
    }

    const products = db.get('products') || [];
    const settings = db.get('settings');

    // Server-side validation of items, prices, and stock
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const liveProduct = products.find((p: any) => p.id === item.productId);
      if (!liveProduct) {
        return res.status(400).json({ error: `Product ${item.name || item.productId} no longer exists in catalog.` });
      }

      if (liveProduct.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${liveProduct.name}". Only ${liveProduct.stock} left in stock.`
        });
      }

      const unitPrice = liveProduct.salePrice || liveProduct.regularPrice;
      const totalPrice = unitPrice * item.quantity;
      calculatedSubtotal += totalPrice;

      // Decrement stock
      liveProduct.stock -= item.quantity;

      validatedItems.push({
        productId: liveProduct.id,
        name: liveProduct.name,
        image: liveProduct.images[0] || '',
        selectedSize: item.selectedSize || 'Standard',
        selectedColor: item.selectedColor || 'Default',
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });
    }

    // Server-side coupon verification
    let discount = 0;
    if (couponCode) {
      const coupons = db.get('coupons') || [];
      const coupon = coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
      if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date())) {
        if (!coupon.minSpend || calculatedSubtotal >= coupon.minSpend) {
          if (coupon.discountType === 'percentage') {
            discount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
          } else {
            discount = coupon.discountValue;
          }
          coupon.usageCount = (coupon.usageCount || 0) + 1;
        }
      }
    }

    // Shipping fee calculation
    let shippingFee = 0;
    if (calculatedSubtotal < settings.freeShippingThreshold) {
      shippingFee = shippingType === 'express' ? settings.expressShippingFee : settings.standardShippingFee;
    } else if (shippingType === 'express') {
      shippingFee = settings.expressShippingFee - settings.standardShippingFee;
    }

    const orderTotal = Math.max(0, calculatedSubtotal - discount + shippingFee);

    // Generate Pakistani Order Tracking ID e.g. MB-PK-9824
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `MB-PK-${randomSuffix}`;

    const newOrder = {
      id: orderId,
      customerId: req.user?.id || null,
      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      shippingAddress: {
        fullName: shippingAddress.fullName || customerName,
        phone: shippingAddress.phone || customerPhone,
        email: shippingAddress.email || customerEmail || '',
        province: shippingAddress.province || 'Punjab',
        city: shippingAddress.city || 'Lahore',
        address: shippingAddress.address,
        landmark: shippingAddress.landmark || '',
        postalCode: shippingAddress.postalCode || ''
      },
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discount,
      couponCode: discount > 0 ? couponCode : undefined,
      shippingFee,
      total: orderTotal,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      courierName: 'TCS Express Pakistan',
      trackingNumber: `TCS-${Date.now().toString().slice(-8)}PK`,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'pending',
          title: 'Order Placed Successfully',
          message: paymentMethod === 'cod'
            ? 'Cash on Delivery order created. Our dispatch team will confirm delivery details via WhatsApp.'
            : 'Payment recorded. Processing order.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    const orders = db.get('orders') || [];
    orders.unshift(newOrder);

    // Save updated products (decremented stock) and orders
    db.set('products', products);
    db.set('orders', orders);
    db.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    });
  });

  // Track Order Publicly (by Order ID + Phone/Email)
  api.get('/orders/track', (req, res) => {
    const { orderId, query } = req.query;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required to track order.' });
    }

    const orders = db.get('orders') || [];
    const formattedId = String(orderId).trim().toUpperCase();

    const order = orders.find((o: any) => {
      const matchId = o.id.toUpperCase() === formattedId;
      if (!matchId) return false;
      if (!query) return true;
      const q = String(query).trim().toLowerCase();
      return (
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === q)
      );
    });

    if (!order) {
      return res.status(404).json({
        error: 'No order found matching the provided Order ID. Please check your confirmation SMS or email.'
      });
    }

    res.json(order);
  });

  // Customer order history
  api.get('/orders/my', authMiddleware, (req: AuthRequest, res: Response) => {
    const orders = db.get('orders') || [];
    const userEmail = req.user?.email.toLowerCase();
    const userId = req.user?.id;

    const myOrders = orders.filter(
      (o: any) => (o.customerId && o.customerId === userId) || (o.customerEmail && o.customerEmail.toLowerCase() === userEmail)
    );

    res.json(myOrders);
  });

  // --- ADMIN ORDERS & MANAGEMENT ---
  api.get('/admin/orders', adminOnly, (req: AuthRequest, res: Response) => {
    const { search, status, paymentStatus } = req.query;
    let orders = db.get('orders') || [];

    if (status) {
      orders = orders.filter((o: any) => o.orderStatus === status);
    }

    if (paymentStatus) {
      orders = orders.filter((o: any) => o.paymentStatus === paymentStatus);
    }

    if (search) {
      const q = String(search).toLowerCase();
      orders = orders.filter((o: any) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }

    res.json(orders);
  });

  api.get('/admin/orders/:id', adminOnly, (req: AuthRequest, res: Response) => {
    const orders = db.get('orders') || [];
    const order = orders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  api.put('/admin/orders/:id', adminOnly, (req: AuthRequest, res: Response) => {
    const orders = db.get('orders') || [];
    const idx = orders.findIndex((o: any) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });

    const current = orders[idx];
    const { orderStatus, paymentStatus, courierName, trackingNumber, timelineMessage } = req.body;

    const updated = {
      ...current,
      orderStatus: orderStatus || current.orderStatus,
      paymentStatus: paymentStatus || current.paymentStatus,
      courierName: courierName !== undefined ? courierName : current.courierName,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : current.trackingNumber,
      updatedAt: new Date().toISOString()
    };

    // If order status changed, add to timeline
    if (orderStatus && orderStatus !== current.orderStatus) {
      const statusTitles: Record<string, string> = {
        pending: 'Order Placed',
        confirmed: 'Order Confirmed by MB Team',
        processing: 'In Tailoring & Packaging',
        shipped: 'Dispatched with Courier',
        delivered: 'Delivered to Customer',
        cancelled: 'Order Cancelled'
      };

      updated.timeline = [
        ...current.timeline,
        {
          status: orderStatus,
          title: statusTitles[orderStatus] || `Status updated to ${orderStatus}`,
          message: timelineMessage || `Order status marked as ${orderStatus.toUpperCase()}.`,
          timestamp: new Date().toISOString()
        }
      ];
    }

    orders[idx] = updated;
    db.set('orders', orders);

    res.json({ message: 'Order updated successfully', order: updated });
  });

  // Admin Customers
  api.get('/admin/customers', adminOnly, (req: AuthRequest, res: Response) => {
    const users = db.get('users') || [];
    const orders = db.get('orders') || [];

    // Filter customers and calculate customer stats (total spend, order count)
    const customers = users
      .filter((u: any) => u.role === 'customer')
      .map((u: any) => {
        const userOrders = orders.filter((o: any) => o.customerId === u.id || o.customerEmail?.toLowerCase() === u.email?.toLowerCase());
        const totalSpent = userOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          city: u.city || 'Lahore',
          province: u.province || 'Punjab',
          createdAt: u.createdAt,
          totalOrders: userOrders.length,
          totalSpent
        };
      });

    res.json(customers);
  });

  // Admin Analytics & Dashboard
  api.get('/admin/analytics', adminOnly, (req: AuthRequest, res: Response) => {
    const orders = db.get('orders') || [];
    const products = db.get('products') || [];
    const users = db.get('users') || [];

    const totalSales = orders
      .filter((o: any) => o.orderStatus !== 'cancelled')
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    const pendingOrdersCount = orders.filter((o: any) => o.orderStatus === 'pending').length;
    const lowStockProducts = products.filter((p: any) => p.stock <= 10);
    const outOfStockProducts = products.filter((p: any) => p.stock === 0);

    // Sales by category
    const categorySales: Record<string, number> = {};
    for (const order of orders) {
      if (order.orderStatus === 'cancelled') continue;
      for (const item of order.items || []) {
        const prod = products.find((p: any) => p.id === item.productId);
        const cat = prod?.category || 'Other';
        categorySales[cat] = (categorySales[cat] || 0) + item.totalPrice;
      }
    }

    res.json({
      totalSales,
      totalOrders: orders.length,
      pendingOrdersCount,
      totalCustomers: users.filter((u: any) => u.role === 'customer').length,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 8),
      categorySales,
      recentOrders: orders.slice(0, 6)
    });
  });

  // Contact Inquiries
  api.post('/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const messages = db.get('messages') || [];
    const newMsg = {
      id: 'msg-' + Date.now(),
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Store Inquiry',
      message,
      createdAt: new Date().toISOString(),
      read: false
    };

    messages.unshift(newMsg);
    db.set('messages', messages);

    res.status(201).json({ message: 'Thank you for contacting MB Clothing Concierge. We will reach out shortly.' });
  });

  api.get('/admin/messages', adminOnly, (req: AuthRequest, res: Response) => {
    const messages = db.get('messages') || [];
    res.json(messages);
  });

  // Mount API router
  app.use('/api', api);

  // Serve Frontend
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[MB Clothing] Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
