import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, API_URL } from '../context/AuthContext';
import { FiCreditCard, FiTruck, FiShoppingBag, FiInfo } from 'react-icons/fi';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);

  // Redirect users who reach checkout with an empty cart
  useEffect(() => {
    if (cartItems.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
    // Redirect if not authenticated
    if (!token) {
      navigate('/login?redirect=checkout');
    }
  }, [cartItems, token, navigate, orderSuccess]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !zipCode.trim()) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const fullShippingAddress = `${address.trim()}, ${city.trim()}, ${zipCode.trim()}`;

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shipping_address: fullShippingAddress,
          payment_info: {
            cardNumber,
            expiry,
            cvv
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      // Success
      setNewOrderId(data.orderId);
      setOrderSuccess(true);
      clearCart(); // Clear local/context cart state
    } catch (err) {
      setErrorMsg(err.message || 'Error processing checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="py-16 text-center space-y-6 max-w-md mx-auto">
        <div className="text-7xl text-success animate-bounce">🎉</div>
        <h2 className="text-3xl font-extrabold tracking-tight">Order Placed Successfully!</h2>
        <p className="text-gray-500 leading-relaxed">
          Thank you for your purchase! Your order <span className="font-mono font-bold text-primary">#ORD-{newOrderId}</span> has been received and is currently being processed.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link to="/orders" className="btn btn-primary rounded-full px-8 shadow-lg shadow-primary/20">
            View My Orders
          </Link>
          <Link to="/products" className="btn btn-ghost rounded-full px-6 hover:bg-base-200">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Checkout details forms */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Shipping Address panel */}
            <div className="bg-base-100 border border-base-200 rounded-2xl p-6 md:p-8 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b border-base-200">
                <FiTruck className="text-primary" /> 1. Shipping Address
              </h3>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-xs uppercase text-gray-400">Street Address</span>
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street, Apt 4B"
                  className="input input-bordered rounded-xl w-full"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold text-xs uppercase text-gray-400">City</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Dhaka"
                    className="input input-bordered rounded-xl w-full"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold text-xs uppercase text-gray-400">Zip / Postal Code</span>
                  </label>
                  <input
                    type="text"
                    placeholder="1212"
                    className="input input-bordered rounded-xl w-full"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Details panel */}
            <div className="bg-base-100 border border-base-200 rounded-2xl p-6 md:p-8 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2 pb-2 border-b border-base-200">
                <FiCreditCard className="text-primary" /> 2. Payment Information (Simulated)
              </h3>

              <div className="alert alert-info text-xs rounded-xl py-2 px-3 flex gap-2">
                <FiInfo className="flex-shrink-0 text-base" />
                <span>This checkout is a simulation. You can use standard mock credentials or edit them.</span>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold text-xs uppercase text-gray-400">Card Number</span>
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="input input-bordered rounded-xl w-full font-mono"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold text-xs uppercase text-gray-400">Expiry Date</span>
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="input input-bordered rounded-xl w-full font-mono"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold text-xs uppercase text-gray-400">CVV</span>
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    className="input input-bordered rounded-xl w-full font-mono"
                    maxLength="3"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="alert alert-error text-sm rounded-xl py-2.5 px-3">
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-12 rounded-full text-white font-bold tracking-wide shadow-lg shadow-primary/20 hover:scale-101 transition-transform"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                `Complete Secure Order - $${totalPrice.toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Checkout item summary */}
        <div className="lg:col-span-4 bg-base-200/50 border border-base-200 rounded-3xl p-6 h-fit space-y-6">
          <h3 className="font-bold text-xl tracking-tight">Your Order Items</h3>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg border border-base-200 overflow-hidden bg-base-200 flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-xs truncate">{item.name}</h4>
                  <p className="text-gray-400 text-xs mt-0.5">{item.quantity} &times; ${item.price.toFixed(2)}</p>
                </div>
                <div className="font-bold text-xs text-primary whitespace-nowrap">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="divider my-2"></div>

          <div className="flex justify-between font-extrabold text-sm uppercase text-gray-500">
            <span>Subtotal</span>
            <span className="text-base-content">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm uppercase text-gray-500">
            <span>Shipping</span>
            <span className="text-success">FREE</span>
          </div>

          <div className="divider my-2"></div>

          <div className="flex justify-between font-extrabold text-base uppercase">
            <span>Grand Total</span>
            <span className="text-primary text-lg font-black">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
