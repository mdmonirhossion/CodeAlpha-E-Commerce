import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB, Product, User, Order } from './db.js';
import { authenticateToken, requireAdmin } from './auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Helper to query products with mixed ID types (String and ObjectId)
const getProductQueryById = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: { $in: [id, new mongoose.Types.ObjectId(id)] } };
  }
  return { _id: id };
};

// ── CORS ─────────────────────────────────────────────────────────────────────
// Explicitly whitelist the deployed frontend origin so Vercel serverless
// correctly handles both simple requests AND preflight OPTIONS requests.
const ALLOWED_ORIGINS = [
  'https://simple-ecommerce-front-site.vercel.app', // production frontend
  'http://localhost:5173',                           // local Vite dev server
  'http://localhost:3000',                           // fallback local port
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Favicon 404 Error Handler (No Content Response)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Handle preflight OPTIONS requests for ALL routes BEFORE any other middleware
app.options('*', cors(corsOptions));

// Apply CORS to every subsequent request
app.use(cors(corsOptions));
app.use(express.json());

// Request logger for Vercel console debugging
app.use((req, res, next) => {
  console.log(`[Vercel Serverless Log] ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB Atlas (background pre-warm)
connectDB().catch(err => console.error('Database connection pre-warm failed:', err.message));

// Inline Database Connection Middleware (guarantees DB is ready before request reaches handlers)
const dbMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err);
    res.status(500).json({ message: 'Database connection failed.' });
  }
};

// Rewrite URLs that do not start with /api to prepend /api (except root path)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && req.url !== '/' && !req.url.startsWith('/api/')) {
    req.url = '/api' + req.url;
  }
  next();
});

// Ensure database connection is resolved before handling any request
app.use(dbMiddleware);

// --- AUTHENTICATION SYNC ---

// Get/Sync current authenticated user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json(req.user);
});


// --- PRODUCT ROUTES ---

// Get products with pagination, search, category, sort, and price range filters.
// Query params: page (default 1), limit (default 8), search, category, sort, min_price, max_price
// Response: { products, total, hasMore }
app.get('/api/products', async (req, res) => {
  const { search, category, sort, min_price, max_price } = req.query;

  // --- Pagination params ---
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 8);
  const skip  = (page - 1) * limit;

  // --- Build filter object (same logic as before) ---
  let filter = {};

  if (category && category !== 'All') {
    const cleanCategory = category.replace(/s$/i, '');
    filter.category = { $regex: new RegExp(`^${cleanCategory}s?$`, 'i') };
  }

  if (search) {
    filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (min_price || max_price) {
    filter.price = {};
    if (min_price) filter.price.$gte = parseFloat(min_price);
    if (max_price) filter.price.$lte = parseFloat(max_price);
  }

  try {
    // --- Build sorted query then apply skip + limit ---
    let baseQuery = Product.find(filter);

    if (sort === 'price-low') {
      baseQuery = baseQuery.sort({ price: 1 });
    } else if (sort === 'price-high') {
      baseQuery = baseQuery.sort({ price: -1 });
    } else if (sort === 'rating') {
      baseQuery = baseQuery.sort({ rating: -1 });
    } else {
      // Default: newest first (uses compound index { category, created_at })
      baseQuery = baseQuery.sort({ created_at: -1 });
    }

    // Run paginated fetch and total count in parallel for best performance
    const [products, total] = await Promise.all([
      baseQuery.skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    if (!products || products.length === 0) {
      return res.status(200).json({ products: [], total: 0, hasMore: false });
    }

    // hasMore = true when there are still products beyond this page
    const hasMore = skip + products.length < total;

    res.status(200).json({ products, total, hasMore });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(200).json({ products: [], total: 0, hasMore: false });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne(getProductQueryById(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Internal server error fetching product details.' });
  }
});

// Create product (Admin only)
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, price, category, image_url, stock } = req.body;

  if (!name || !description || price === undefined || !category || !image_url || stock === undefined) {
    return res.status(400).json({ message: 'All product fields are required.' });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      image_url,
      stock: parseInt(stock),
      rating: 4.0
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error creating product.' });
  }
});


// --- CART ROUTES (Protected) ---

// Get current cart items
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Map Mongoose populate result into uniform schema output
    const cartItems = user.cart
      .filter(item => item.product_id !== null) // Filter out deleted products
      .map(item => {
        const p = item.product_id;
        return {
          id: item._id,
          product_id: p._id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          stock: p.stock,
          quantity: item.quantity
        };
      });

    res.json(cartItems);
  } catch (error) {
    console.error('Get cart items error:', error);
    res.status(500).json({ message: 'Internal server error fetching cart.' });
  }
});

// Add or update cart item quantity
app.post('/api/cart', authenticateToken, async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Valid product_id and positive quantity are required.' });
  }

  try {
    // Check product stock
    const product = await Product.findOne(getProductQueryById(product_id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left.` });
    }

    const user = await User.findById(req.user.id);
    const itemIndex = user.cart.findIndex(item => item.product_id.toString() === product_id);

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity = quantity;
    } else {
      user.cart.push({ product_id, quantity });
    }

    await user.save();
    res.json({ message: 'Cart updated successfully.' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Internal server error updating cart.' });
  }
});

// Delete cart item
app.delete('/api/cart/:product_id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const initialLength = user.cart.length;
    user.cart = user.cart.filter(item => item.product_id && item.product_id.toString() !== req.params.product_id);

    if (user.cart.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    await user.save();
    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ message: 'Internal server error removing item from cart.' });
  }
});


// --- ORDER ROUTES (Protected) ---

// Get all orders of authenticated user
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    // Fetch user's orders and populate product data
    const ordersList = await Order.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .populate('items.product_id');

    // Format output
    const formattedOrders = ordersList.map(order => {
      const items = order.items
        .filter(item => item.product_id && typeof item.product_id === 'object' && item.product_id._id)
        .map(item => ({
          id: item._id,
          product_id: item.product_id._id,
          name: item.product_id.name,
          image_url: item.product_id.image_url,
          quantity: item.quantity,
          price: item.price
        }));

      return {
        id: order._id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        payment_status: order.payment_status,
        order_status: order.order_status,
        created_at: order.created_at,
        items
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error fetching orders.' });
  }
});

// Place order (simulated checkout)
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { shipping_address } = req.body;

  if (!shipping_address) {
    return res.status(400).json({ message: 'Shipping address is required.' });
  }

  try {
    const user = await User.findById(req.user.id).populate('cart.product_id');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cannot place order. Shopping cart is empty.' });
    }

    // 1. Validate stock
    for (let item of user.cart) {
      const product = item.product_id;
      if (!product || typeof product !== 'object' || !product._id) {
        return res.status(400).json({ message: 'Invalid product in cart. Please remove it and try again.' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for '${product.name}'. Only ${product.stock} left. Please adjust cart.`
        });
      }
    }

    // 2. Calculate totals
    let totalAmount = user.cart.reduce((sum, item) => sum + (item.product_id.price * item.quantity), 0);

    // 3. Create Order
    const newOrder = new Order({
      user_id: req.user.id,
      total_amount: totalAmount,
      shipping_address,
      payment_status: 'Paid',
      order_status: 'Processing',
      items: user.cart.map(item => ({
        product_id: item.product_id._id,
        quantity: item.quantity,
        price: item.product_id.price
      }))
    });

    const savedOrder = await newOrder.save();

    // 4. Deduct Stock & Update Products
    for (let item of user.cart) {
      await Product.findOneAndUpdate(getProductQueryById(item.product_id._id), {
        $inc: { stock: -item.quantity }
      });
    }

    // 5. Clear Cart
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: 'Order placed successfully.',
      orderId: savedOrder._id,
      total_amount: totalAmount
    });

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Internal server error placing order.', error: error.message });
  }
});

// Root API info route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the E-Commerce API! All endpoints are available at /api',
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      auth: '/api/auth/me'
    }
  });
});

// Fallback route
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Express server is running on http://localhost:${PORT}`);
  });
}

export default app;

