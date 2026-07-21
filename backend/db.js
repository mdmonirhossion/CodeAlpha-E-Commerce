import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Monir:L3rOsjGf88vPYSeH@ecotrack-server.pnvhcn2.mongodb.net/simple-ecommerce?retryWrites=true&w=majority&appName=Ecotrack-server';

// Cache the connection for Vercel serverless (prevents re-connecting on every warm invocation)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If already connected, reuse the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // If no pending connection, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB Atlas.');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    await initSeeds();
  } catch (err) {
    cached.promise = null;
    console.error('Error connecting to MongoDB Atlas:', err.message);
    throw err;
  }

  return cached.conn;
};


const Schema = mongoose.Schema;

// User Schema (Auth is handled by Firebase, User profile and Cart in MongoDB)
const UserSchema = new Schema({
  _id: { type: String, required: true }, // Store Firebase UID here as primary key
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  cart: [
    {
      product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ],
  created_at: { type: Date, default: Date.now }
});

// Product Schema
const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image_url: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 4.0 },
  created_at: { type: Date, default: Date.now }
});

// ── Performance indexes ──────────────────────────────────────────────────────
// Compound index: powers category-filtered + newest-first paginated queries
ProductSchema.index({ category: 1, created_at: -1 });
// Text index: powers full-text search on name & description
ProductSchema.index({ name: 'text', description: 'text' });

// Order Schema
const OrderSchema = new Schema({
  user_id: { type: String, required: true, ref: 'User' },
  total_amount: { type: Number, required: true },
  shipping_address: { type: String, required: true },
  payment_status: { type: String, default: 'Pending' },
  order_status: { type: String, default: 'Pending' },
  items: [
    {
      product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  created_at: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Order = mongoose.model('Order', OrderSchema);

// ── Initial seed data (runs only when collection is empty) ──────────────────
const initSeeds = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding 20 Daraz-style products into MongoDB...');

      // Images sourced from Daraz Bangladesh CDN & Unsplash (royalty-free)
      const mockProducts = [
        // ── Electronics (7) ─────────────────────────────────────────────────
        {
          name: 'Sony WH-1000XM5 Wireless Headphones',
          description: 'Industry-leading noise cancellation with 30-hour battery, multipoint Bluetooth, and crystal-clear call quality with 8 microphones. The ultimate travel companion.',
          price: 279.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
          stock: 18,
          rating: 4.9
        },
        {
          name: 'Samsung Galaxy Watch 6 Classic',
          description: 'Rotating bezel, advanced health monitoring with body composition analysis, blood pressure tracking, and a vibrant 1.4-inch Super AMOLED display. 40-hour battery life.',
          price: 199.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
          stock: 22,
          rating: 4.7
        },
        {
          name: 'Keychron Q2 Mechanical Keyboard',
          description: 'Gasket-mount 65% layout with QMK/VIA support, double-shot PBT keycaps, and triple-mode connectivity. Hot-swappable Gateron G Pro switches included.',
          price: 149.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
          stock: 14,
          rating: 4.8
        },
        {
          name: 'Logitech MX Master 3S Mouse',
          description: 'Ultra-fast MagSpeed electromagnetic scroll wheel, 8K DPI sensor, ergonomic shape, and silent clicks. Works across 3 devices simultaneously with Easy-Switch.',
          price: 99.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
          stock: 35,
          rating: 4.8
        },
        {
          name: 'Anker 737 Power Bank 24000mAh',
          description: '140W total output charges a MacBook Pro in 1.5 hours. Smart digital display shows exact wattage, voltage, and remaining charge. Charges 3 devices simultaneously.',
          price: 89.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80',
          stock: 50,
          rating: 4.6
        },
        {
          name: 'JBL Charge 5 Portable Speaker',
          description: 'IP67 waterproof and dustproof with 20-hour playtime. Powerful stereo sound with deep bass. Built-in power bank charges your devices on the go. PartyBoost compatible.',
          price: 119.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
          stock: 28,
          rating: 4.7
        },
        {
          name: 'Xiaomi Mi 4K Webcam Pro',
          description: '4K 30fps video with auto-light correction, AI noise suppression, and a 90° wide-angle lens. Perfect for WFH meetings, live streaming, and content creation.',
          price: 69.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80',
          stock: 40,
          rating: 4.5
        },

        // ── Fashion (4) ─────────────────────────────────────────────────────
        {
          name: 'Nike Air Max 270 Sneakers',
          description: 'Iconic 270° Air unit in the heel for all-day cushioning. Engineered mesh upper for breathability. Available in bold colorways that make a statement on and off the court.',
          price: 139.99,
          category: 'Fashion',
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
          stock: 30,
          rating: 4.7
        },
        {
          name: 'Levi's 511 Slim Fit Jeans'
          description: 'The perfect slim — sits below the waist, slim through hip and thigh, with a narrow leg opening. Made from flexible stretch denim for all-day comfort. Classic 5-pocket styling.',
          price: 59.99,
          category: 'Fashion',
          image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
          stock: 55,
          rating: 4.5
        },
        {
          name: 'Premium Cotton Polo Shirt',
          description: 'Crafted from 100% Pima cotton with a refined two-button placket. Moisture-wicking finish keeps you cool all day. Available in 8 colors. Machine washable.',
          price: 39.99,
          category: 'Fashion',
          image_url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80',
          stock: 80,
          rating: 4.4
        },
        {
          name: 'Ray-Ban Aviator Classic Sunglasses',
          description: 'Iconic metal frame with crystal glass lenses offering 100% UV protection. Timeless teardrop shape that flatters every face. Polarized lens option available.',
          price: 154.99,
          category: 'Fashion',
          image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
          stock: 20,
          rating: 4.8
        },

        // ── Accessories (4) ──────────────────────────────────────────────────
        {
          name: 'Osprey Farpoint 40 Travel Pack',
          description: 'TSA carry-on compliant with a stowable harness and lockable zipper. Internal frame transfers weight to hips, StraightJacket compression straps keep load stable.',
          price: 159.99,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
          stock: 15,
          rating: 4.8
        },
        {
          name: 'Bellroy Slim Sleeve Wallet',
          description: 'Holds 4–12 cards with a quick-access pull-tab. Slim profile fits in a front pocket. Made from certified ethical leather with RFID protection. 3-year warranty.',
          price: 79.99,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1627123424574-724758594913?w=600&q=80',
          stock: 45,
          rating: 4.7
        },
        {
          name: 'Peak Design Capture Clip V3',
          description: 'Attach any camera to your belt, bag strap, or backpack shoulder. Locks securely, releases in an instant. Supports DSLR, mirrorless, and any Arca-Swiss compatible camera.',
          price: 79.99,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80',
          stock: 25,
          rating: 4.6
        },
        {
          name: 'Tile Pro Bluetooth Tracker (4-Pack)',
          description: '400ft Bluetooth range — the farthest of any Tile. Loud 105dB ring to find your keys, bag, or luggage. Water-resistant. Works with Alexa and Google Assistant.',
          price: 54.99,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
          stock: 60,
          rating: 4.4
        },

        // ── Home Decor (3) ────────────────────────────────────────────────────
        {
          name: 'Herman Miller Aeron Chair (Size B)',
          description: '8Z Pellicle suspension eliminates pressure points. PostureFit SL supports both sacrum and lumbar. Fully adjustable armrests, tilt limiter, and forward-tilt capability. 12-year warranty.',
          price: 399.99,
          category: 'Home Decor',
          image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&q=80',
          stock: 6,
          rating: 4.9
        },
        {
          name: 'Flos Arco Floor Lamp',
          description: 'Iconic arc design by Achille Castiglioni. Marble base, stainless steel arch, and a hand-polished aluminum dome shade. Compatible with E26 LED bulbs up to 150W.',
          price: 129.99,
          category: 'Home Decor',
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
          stock: 9,
          rating: 4.6
        },
        {
          name: 'MUJI Aroma Diffuser & Humidifier',
          description: 'Ultrasonic diffuser with timer settings (1/3/6 hours). BPA-free 500ml tank runs 8 hours continuously. Whisper-quiet operation. LED mood light with 7 color options.',
          price: 49.99,
          category: 'Home Decor',
          image_url: 'https://images.unsplash.com/photo-1600298882525-0f74b1e06c11?w=600&q=80',
          stock: 35,
          rating: 4.5
        },

        // ── Sports (2) ───────────────────────────────────────────────────────
        {
          name: 'Garmin Forerunner 265 GPS Watch',
          description: 'Training Readiness score uses sleep, HRV, and recovery data. AMOLED display. Multi-band GPS for pinpoint accuracy. Swim, bike, run metrics with animated on-device workouts.',
          price: 349.99,
          category: 'Sports',
          image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80',
          stock: 12,
          rating: 4.8
        },
        {
          name: 'TRX HOME2 Suspension Trainer',
          description: 'Build strength, balance, and flexibility anywhere. Adjusts to over 300 exercises. Supports up to 350 lbs. Comes with 8 TRX anchor solutions and a workout guide.',
          price: 179.99,
          category: 'Sports',
          image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
          stock: 20,
          rating: 4.7
        }
      ];

      await Product.insertMany(mockProducts);
      console.log(`Seeding complete — ${mockProducts.length} products inserted.`);
    }
  } catch (err) {
    console.error('Seeding database failed:', err);
  }
};
