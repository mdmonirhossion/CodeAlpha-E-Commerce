import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiInfo } from 'react-icons/fi';

const Cart = () => {
  const { cartItems, totalPrice, totalItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    if (user) {
      navigate('/checkout');
    } else {
      // Direct guest user to login before checkout, but save a redirect state
      navigate('/login?redirect=checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center space-y-6 max-w-md mx-auto">
        <div className="text-6xl text-gray-300">🛒</div>
        <h2 className="text-3xl font-extrabold tracking-tight">Your Cart is Empty</h2>
        <p className="text-gray-500 leading-relaxed">
          Looks like you haven't added any products to your cart yet. Head over to our catalog to discover premium deals.
        </p>
        <Link to="/products" className="btn btn-primary rounded-full px-8 shadow-lg shadow-primary/20">
          <FiShoppingBag /> Browse Shop Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="overflow-x-auto bg-base-100 border border-base-200 rounded-2xl p-4 md:p-6">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-base-200 text-gray-400 text-xs uppercase tracking-wider">
                  <th>Product</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200/50">
                {cartItems.map((item) => (
                  <tr key={item.product_id} className="border-none">
                    {/* Product cell */}
                    <td className="py-4 pl-0">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-16 h-16 rounded-xl border border-base-200 overflow-hidden bg-base-200">
                            <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                          </div>
                        </div>
                        <div>
                          <Link to={`/products/${item.product_id}`} className="font-bold hover:text-primary transition-colors line-clamp-1 max-w-xs text-sm md:text-base">
                            {item.name}
                          </Link>
                          {item.stock < item.quantity && (
                            <span className="text-error font-semibold text-xs block mt-0.5">Insufficient Stock! Limit: {item.stock}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Quantity Selector cell */}
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center border border-base-200 rounded-full h-9 bg-base-100 overflow-hidden w-28 mx-auto">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="btn btn-ghost btn-xs rounded-none border-none h-full w-8 font-bold"
                          aria-label="Decrease Quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => {
                            try {
                              updateQuantity(item.product_id, item.quantity + 1);
                            } catch (err) {
                              alert(err.message);
                            }
                          }}
                          className="btn btn-ghost btn-xs rounded-none border-none h-full w-8 font-bold"
                          aria-label="Increase Quantity"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Price cell */}
                    <td className="py-4 text-right font-medium text-sm md:text-base">
                      ${item.price.toFixed(2)}
                    </td>

                    {/* Total Subtotal cell */}
                    <td className="py-4 text-right font-bold text-sm md:text-base text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>

                    {/* Delete cell */}
                    <td className="py-4 pr-0 text-right">
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="btn btn-ghost btn-circle btn-xs text-error hover:bg-error/10"
                        aria-label="Remove Item"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-2">
            <Link to="/products" className="btn btn-ghost rounded-full text-sm font-semibold">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-base-200/50 border border-base-200 rounded-3xl p-6 h-fit space-y-6">
          <h3 className="font-bold text-xl tracking-tight">Order Summary</h3>

          <div className="space-y-4">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Total Items</span>
              <span className="font-semibold text-base-content">{totalItems}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal</span>
              <span className="font-semibold text-base-content">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Shipping Fee</span>
              <span className="font-semibold text-success">FREE</span>
            </div>

            <div className="divider my-2"></div>

            <div className="flex justify-between font-extrabold text-lg">
              <span>Total Amount</span>
              <span className="text-primary text-xl font-black">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Warning for guests */}
          {!user && (
            <div className="alert alert-warning text-xs p-3 rounded-xl flex gap-2">
              <FiInfo className="text-base flex-shrink-0" />
              <span>You are checking out as guest. You will be prompted to login or register.</span>
            </div>
          )}

          <button
            onClick={handleCheckoutRedirect}
            className="btn btn-primary w-full rounded-full h-12 text-white font-bold tracking-wide shadow-lg shadow-primary/20 hover:scale-101 transition-transform"
          >
            Proceed to Checkout <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
