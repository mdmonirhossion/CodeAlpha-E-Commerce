import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiGithub } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-neutral text-neutral-content pt-16 pb-8 px-4 md:px-8 border-t border-base-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Branding & Bio */}
        <div className="md:col-span-2">
          <Link to="/" className="text-3xl font-black tracking-tight text-white mb-4 block">
            E<span className="text-secondary font-light">SHOP</span>
          </Link>
          <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
            Your destination for premium handpicked goods. We deliver comfort, style, and quality straight to your door step.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors text-xl" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" className="hover:text-primary transition-colors text-xl" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" className="hover:text-primary transition-colors text-xl" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" className="hover:text-primary transition-colors text-xl" aria-label="GitHub"><FiGithub /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/products?category=Electronics" className="text-gray-400 hover:text-white transition-colors">Electronics</Link></li>
            <li><Link to="/products?category=Fashion" className="text-gray-400 hover:text-white transition-colors">Fashion</Link></li>
            <li><Link to="/cart" className="text-gray-400 hover:text-white transition-colors">View Cart</Link></li>
          </ul>
        </div>

        {/* Contact/Support */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Support</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Customer Help Desk</li>
            <li>FAQ & Shipping Guidelines</li>
            <li>Return Policy</li>
            <li>Email: support@eshop.com</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 text-center text-gray-500 text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} ESHOP Inc. All rights reserved.</p>
        <p>Built with React, Express & Tailwind CSS.</p>
      </div>
    </footer>
  );
};

export default Footer;
