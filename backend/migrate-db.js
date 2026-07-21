import mongoose from 'mongoose';
import { connectDB, Product, User, Order } from './db.js';

async function migrate() {
  try {
    await connectDB();
    console.log('Database connected.');

    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products total.`);

    let migratedProductsCount = 0;

    for (const p of products) {
      if (typeof p._id === 'string') {
        const strId = p._id;
        console.log(`Migrating product: "${p.name}" (ID: ${strId})`);

        if (!mongoose.Types.ObjectId.isValid(strId)) {
          console.warn(`Warning: ID ${strId} is not a valid ObjectId string. Skipping.`);
          continue;
        }

        const newId = new mongoose.Types.ObjectId(strId);

        // Delete the product with the old String ID
        await Product.deleteOne({ _id: strId });

        // Create the product with the new ObjectId ID
        const productData = { ...p, _id: newId };
        await Product.create(productData);

        // Update any users' carts containing the String ID to the new ObjectId
        const usersResult = await User.updateMany(
          { 'cart.product_id': strId },
          { $set: { 'cart.$[elem].product_id': newId } },
          { arrayFilters: [{ 'elem.product_id': strId }] }
        );
        if (usersResult.modifiedCount > 0) {
          console.log(`  Updated ${usersResult.modifiedCount} users' carts.`);
        }

        // Update any orders containing the String ID to the new ObjectId
        const ordersResult = await Order.updateMany(
          { 'items.product_id': strId },
          { $set: { 'items.$[elem].product_id': newId } },
          { arrayFilters: [{ 'elem.product_id': strId }] }
        );
        if (ordersResult.modifiedCount > 0) {
          console.log(`  Updated ${ordersResult.modifiedCount} orders.`);
        }

        migratedProductsCount++;
      }
    }

    console.log(`\nMigration completed successfully. Migrated ${migratedProductsCount} products to ObjectId format.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
