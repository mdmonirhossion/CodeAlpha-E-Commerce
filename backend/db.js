import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Monir:jN2xXp009N0LkviU@ecotrack-server.pnvhcn2.mongodb.net/simple-ecommerce?retryWrites=true&w=majority&appName=Ecotrack-server';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas.');
    await initSeeds();
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err.message);
  }
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

// Initial seeds
const initSeeds = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding initial mock products into MongoDB...');
      const mockProducts = [
        {
          name: 'Acoustic Noise-Cancelling Headphones',
          description: 'Experience pure sound with industry-leading active noise cancellation. 30-hour battery life, quick charging, and touch sensor controls make these headphones your perfect travel companion.',
          price: 199.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
          stock: 15,
          rating: 4.8
        },
        {
          name: 'Minimalist Smart Watch V2',
          description: 'Track your workouts, check notifications, monitor heart rate, and sleep quality. Features a gorgeous high-definition AMOLED display and a battery that lasts up to 7 days.',
          price: 149.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
          stock: 25,
          rating: 4.5
        },
        {
          name: 'Urban Explorer Backpack',
          description: 'Crafted from water-resistant ballistic nylon, this commuter backpack offers a dedicated 15-inch laptop compartment, hidden pockets for security, and ergonomic shoulder straps.',
          price: 89.99,
          category: 'Accessories',
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
          stock: 40,
          rating: 4.7
        },
        {
          name: 'Mechanical Gaming Keyboard',
          description: 'Tactile mechanical switches for fast response and typing comfort. Customizable dynamic per-key RGB backlighting, aircraft-grade aluminum alloy top plate, and magnetic wrist rest.',
          price: 129.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
          stock: 12,
          rating: 4.6
        },
        {
          name: 'Minimalist Brass Table Lamp',
          description: 'Illuminate your desk or bedside table with this elegant mid-century modern lamp. Solid brass construction with a matte finish and energy-efficient LED bulb included.',
          price: 59.99,
          category: 'Home Decor',
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
          stock: 8,
          rating: 4.4
        },
        {
          name: 'Handcrafted Leather Wallet',
          description: 'Made from full-grain vegetable-tanned leather, this slim bi-fold wallet has RFID-blocking layers, 6 card slots, and a bill compartment that patinas beautifully over time.',
          price: 45.00,
          category: 'Accessories',
          image_url: 'https://i.ibb.co.com/0R4ZVw9j/Handcrafted-Leather-Wallet.webp',
          stock: 50,
          rating: 4.9
        },
        {
          name: 'Ergonomic Mesh Office Chair',
          description: 'Designed for comfort during long working hours. Features breathable mesh backing, adjustable lumbar support, 3D armrests, and dynamic tilt-lock mechanism.',
          price: 249.99,
          category: 'Home Decor',
          image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&q=80',
          stock: 10,
          rating: 4.3
        },
        {
          name: 'Ultra-Light Breathable Sneakers',
          description: 'Perfect for daily jogs or casual wear. Engineered knit upper offers ventilation and flexibility, while the responsive foam midsole cushions every step.',
          price: 79.99,
          category: 'Fashion',
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
          stock: 30,
          rating: 4.6
        }
      ];
      await Product.insertMany(mockProducts);
      console.log('Seeding products finished.');
    }
  } catch (err) {
    console.error('Seeding database failed:', err);
  }
};
