import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { FiPackage, FiShoppingBag, FiInfo, FiChevronRight } from 'react-icons/fi';

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          throw new Error('Failed to fetch orders.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Error fetching order list.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-gray-400 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center space-y-6 max-w-md mx-auto">
        <div className="text-6xl text-gray-300">📦</div>
        <h2 className="text-3xl font-extrabold tracking-tight">No Orders Placed Yet</h2>
        <p className="text-gray-500 leading-relaxed">
          You haven't made any purchases yet. Head over to our catalog and buy some premium products to see them here!
        </p>
        <Link to="/products" className="btn btn-primary rounded-full px-8 shadow-lg shadow-primary/20">
          <FiShoppingBag /> Browse Shop Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>

      {errorMsg && (
        <div className="alert alert-error rounded-xl">
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Order Card Header banner */}
            <div className="bg-base-200/50 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-base-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
                <div>
                  <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider">Order ID</h4>
                  <p className="font-mono text-sm font-bold text-primary">#ORD-{order.id}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider">Placed On</h4>
                  <p className="text-sm font-semibold">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider">Total</h4>
                  <p className="text-sm font-extrabold text-base-content">${order.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider">Status</h4>
                  <span className={`badge badge-sm font-bold mt-0.5 ${
                    order.order_status === 'Pending' 
                      ? 'badge-warning text-white' 
                      : order.order_status === 'Processing'
                        ? 'badge-info text-white'
                        : 'badge-success text-white'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items list */}
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {order.items && order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-base-200 border border-base-200 flex-shrink-0">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link to={`/products/${item.product_id}`} className="font-bold hover:text-primary transition-colors text-xs md:text-sm line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Quantity: {item.quantity} &times; ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-700 whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order address detail */}
              <div className="divider my-2"></div>
              
              <div className="flex gap-2 items-start text-xs text-gray-500 bg-base-200/20 p-3 rounded-xl border border-base-200/50">
                <FiPackage className="text-lg text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-700">Shipping Details:</span> {order.shipping_address}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
