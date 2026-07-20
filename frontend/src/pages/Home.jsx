import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { FiTrendingUp, FiShoppingBag, FiTruck, FiShield, FiRotateCcw, FiSmile } from 'react-icons/fi';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products?sort=latest`);
        if (res.ok) {
          const data = await res.json();
          // Take top 4 for the home page
          setProducts(data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 p-8 md:p-16 border border-base-200 shadow-sm mt-4">
        <div className="max-w-xl space-y-6 relative z-10">
          <span className="badge badge-primary font-bold px-3 py-1 uppercase tracking-wider text-xs">New Collection</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Discover Premium <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Smart Living
            </span>
          </h1>
          <p className="text-gray-500 md:text-lg leading-relaxed max-w-md">
            Explore curated design classics and smart tech essentials. Crafted to elevate your everyday routines.
          </p>
          <div className="flex gap-4 pt-2">
            <Link to="/products" className="btn btn-primary rounded-full px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
              Shop Now <FiShoppingBag />
            </Link>
            <Link to="/products?category=Electronics" className="btn btn-ghost rounded-full px-6 hover:bg-base-200">
              Browse Tech
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden md:block">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-1/3 left-2/3 -translate-y-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-secondary/10 blur-2xl"></div>
          
          {/* Abstract Floating UI mockup for premium aesthetic */}
          <div className="absolute top-1/2 right-12 -translate-y-1/2 w-80 p-6 glass-panel rounded-2xl border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" 
              alt="featured watch" 
              className="w-full aspect-video object-cover rounded-xl mb-4"
            />
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm">Minimalist Smart Watch</h4>
                <p className="text-xs text-gray-500">Premium design</p>
              </div>
              <span className="text-primary font-black">$149.99</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Badges Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-2">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-base-200/50 border border-base-200">
          <div className="p-3.5 bg-primary/10 rounded-xl text-primary text-xl"><FiTruck /></div>
          <div>
            <h4 className="font-bold text-sm md:text-base">Free Delivery</h4>
            <p className="text-xs text-gray-400">On all orders over $99</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-base-200/50 border border-base-200">
          <div className="p-3.5 bg-secondary/10 rounded-xl text-secondary text-xl"><FiShield /></div>
          <div>
            <h4 className="font-bold text-sm md:text-base">Secure Checkout</h4>
            <p className="text-xs text-gray-400">100% protected payments</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-base-200/50 border border-base-200">
          <div className="p-3.5 bg-accent/10 rounded-xl text-accent text-xl"><FiRotateCcw /></div>
          <div>
            <h4 className="font-bold text-sm md:text-base">30 Days Returns</h4>
            <p className="text-xs text-gray-400">Easy return & exchange</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-base-200/50 border border-base-200">
          <div className="p-3.5 bg-indigo-500/10 rounded-xl text-indigo-500 text-xl"><FiSmile /></div>
          <div>
            <h4 className="font-bold text-sm md:text-base">24/7 Support</h4>
            <p className="text-xs text-gray-400">Direct active helper chat</p>
          </div>
        </div>
      </section>

      {/* Featured/Latest Products Grid */}
      <section className="space-y-6 max-w-7xl mx-auto px-2">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
              <FiTrendingUp /> Trending Now
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Our Latest Arrivals</h2>
          </div>
          <Link to="/products" className="btn btn-ghost hover:bg-base-200 rounded-full px-5 text-sm">
            View All Shop
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card bg-base-200 h-80 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotion banner block */}
      <section className="relative bg-neutral rounded-3xl text-neutral-content p-8 md:p-12 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto px-6 border border-gray-800">
        <div className="space-y-4 max-w-lg">
          <span className="badge badge-accent font-bold text-xs uppercase tracking-widest px-2.5">Limited Time Promo</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Upgrade Your Office Space</h2>
          <p className="text-gray-400 leading-relaxed">
            Get an additional 15% discount on all ergonomic chairs and desk accessory lamps. Use code <span className="font-mono text-white bg-gray-800 px-2 py-0.5 rounded border border-gray-700">DESK15</span>.
          </p>
        </div>
        <div>
          <Link to="/products?category=Home%20Decor" className="btn btn-accent rounded-full px-8 font-bold shadow-lg shadow-accent/20">
            Shop Decor Deals
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
