import { connectDB, Product } from './db.js';

async function listProducts() {
  await connectDB();
  const products = await Product.find({}).lean();
  console.log(`Total products in DB: ${products.length}`);
  products.forEach((p, idx) => {
    console.log(`[Product ${idx + 1}] ID: ${p._id}, Type: ${typeof p._id}, Constructor: ${p._id?.constructor?.name}, Name: ${p.name}, Stock: ${p.stock}`);
  });
  process.exit(0);
}

listProducts();
