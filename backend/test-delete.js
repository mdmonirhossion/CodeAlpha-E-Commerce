import { connectDB, User } from './db.js';

async function testDelete() {
  await connectDB();
  const userId = 'LgEt9fThtpcC9dAXTvNA8j8cebk2';
  const targetProductId = '6a5e22315762a47064b81fe2';

  const user = await User.findById(userId);
  if (!user) {
    console.log('User not found!');
    process.exit(1);
  }

  console.log('User found:', user.name);
  console.log('Cart length before:', user.cart.length);

  user.cart.forEach((item, index) => {
    const pId = item.product_id;
    console.log(`[Cart Item ${index + 1}]`);
    console.log(`  product_id:`, pId);
    console.log(`  product_id type:`, typeof pId);
    console.log(`  product_id constructor:`, pId?.constructor?.name);
    console.log(`  product_id.toString():`, pId?.toString());
    console.log(`  Target product_id:`, targetProductId);
    console.log(`  Comparison result (toString() !== target):`, pId?.toString() !== targetProductId);
  });

  const filteredCart = user.cart.filter(item => item.product_id?.toString() !== targetProductId);
  console.log('Cart length after filter:', filteredCart.length);

  process.exit(0);
}

testDelete();
