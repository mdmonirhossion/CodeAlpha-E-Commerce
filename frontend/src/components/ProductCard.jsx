import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiCheck, FiStar } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault(); // Prevent navigating to details page when clicking button
    setLoading(true);
    setErrorMsg('');
    try {
      await addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Error adding to cart.');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-compact bg-base-100 shadow-md hover:shadow-xl border border-base-200 transition-all duration-300 group flex flex-col h-full rounded-2xl overflow-hidden">
      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden aspect-video bg-base-200">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 badge badge-primary text-xs uppercase font-bold tracking-wider px-2.5 py-1">
          {product.category}
        </span>
        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-base-300/80 backdrop-blur-sm flex items-center justify-center">
            <span className="badge badge-error badge-lg font-bold text-white uppercase tracking-wider">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Product Body */}
      <div className="card-body flex flex-col justify-between p-5 flex-grow">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500 mb-1 text-sm font-semibold">
            <FiStar className="fill-current" />
            <span>{product.rating ? product.rating.toFixed(1) : '4.0'}</span>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product._id}`} className="hover:text-primary transition-colors">
            <h3 className="font-bold text-base md:text-lg tracking-tight line-clamp-1 mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Product Description */}
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Price & Cart Actions */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-extrabold tracking-tight">
            ${product.price.toFixed(2)}
          </span>

          {product.stock > 0 && (
            <button
              onClick={handleAdd}
              disabled={loading}
              className={`btn btn-sm rounded-full px-4 gap-1.5 transition-all duration-300 ${
                added 
                  ? 'btn-success text-white' 
                  : errorMsg 
                    ? 'btn-error text-white' 
                    : 'btn-outline btn-primary hover:text-white'
              }`}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : added ? (
                <>
                  <FiCheck className="stroke-[3]" /> Added
                </>
              ) : errorMsg ? (
                'Error!'
              ) : (
                <>
                  <FiShoppingCart /> Add
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Error message under details */}
        {errorMsg && (
          <div className="text-error text-xs font-semibold mt-2 text-right">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
