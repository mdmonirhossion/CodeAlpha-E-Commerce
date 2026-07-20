import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiUser, FiPackage, FiShoppingCart, FiLogOut, FiCalendar, FiMail } from 'react-icons/fi';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const { totalItems } = useCart();
  const [orderCount, setOrderCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=profile');
      return;
    }

    const fetchOrderCount = async () => {
      try {
        const res = await fetch(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrderCount(data.length);
        }
      } catch (err) {
        console.error('Error fetching orders count:', err);
      }
    };

    fetchOrderCount();
  }, [token, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Main user badge */}
        <div className="md:col-span-1 bg-base-100 border border-base-200 shadow-sm rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold border border-primary/20 shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <span className="badge badge-primary font-bold text-xs uppercase tracking-widest mt-1">
              {user.role} Account
            </span>
          </div>
          <p className="text-gray-400 text-xs">Member since {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</p>

          <button onClick={logout} className="btn btn-error btn-outline rounded-full w-full gap-2 mt-4 text-xs font-bold uppercase tracking-wider h-10 min-h-0">
            <FiLogOut /> Logout Session
          </button>
        </div>

        {/* Right Card: User detailed stats and details */}
        <div className="md:col-span-2 space-y-6">
          {/* Information Card */}
          <div className="bg-base-100 border border-base-200 shadow-sm rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="font-bold text-lg border-b border-base-200 pb-3 flex items-center gap-2">
              <FiUser className="text-primary" /> Account Information
            </h3>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="p-3 bg-base-200 rounded-xl text-gray-500"><FiUser /></div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider">Full Name</h4>
                  <p className="font-semibold text-base">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="p-3 bg-base-200 rounded-xl text-gray-500"><FiMail /></div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email Address</h4>
                  <p className="font-semibold text-base">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="p-3 bg-base-200 rounded-xl text-gray-500"><FiCalendar /></div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider">Account Role</h4>
                  <p className="font-semibold text-base capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Statistics Row */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/orders" className="bg-base-200/50 hover:bg-base-200/80 border border-base-200 rounded-2xl p-5 flex items-center gap-4 transition-colors">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary text-2xl"><FiPackage /></div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Orders Placed</p>
                <h4 className="text-2xl font-black">{orderCount}</h4>
              </div>
            </Link>

            <Link to="/cart" className="bg-base-200/50 hover:bg-base-200/80 border border-base-200 rounded-2xl p-5 flex items-center gap-4 transition-colors">
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary text-2xl"><FiShoppingCart /></div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cart Items</p>
                <h4 className="text-2xl font-black">{totalItems}</h4>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
