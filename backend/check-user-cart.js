import { connectDB, User } from './db.js';

async function checkUserCart() {
  await connectDB();
  const users = await User.find({}).lean();
  console.log(`Total users in DB: ${users.length}`);

  users.forEach((user, uIndex) => {
    console.log(`\n[User ${uIndex + 1}] ID: ${user._id}, Name: ${user.name}`);
    if (user.cart && user.cart.length > 0) {
      user.cart.forEach((item, cIndex) => {
        const pId = item.product_id;
        const type = typeof pId;
        const constructorName = pId?.constructor?.name;
        console.log(`  - [Cart Item ${cIndex + 1}] Product ID: ${pId}, Type: ${type}, Constructor: ${constructorName}, Qty: ${item.quantity}`);
      });
    } else {
      console.log('  - Cart is empty');
    }
  });

  process.exit(0);
}

checkUserCart();
