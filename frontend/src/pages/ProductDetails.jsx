import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiCheck, FiArrowLeft, FiStar, FiInfo, FiTruck, FiShield } from 'react-icons/fi';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) {
          throw new Error('Product not found.');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setErrorMsg(err.message || 'Error loading product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQtyChange = (type) => {
    if (!product) return;
    if (type === 'inc') {
      if (quantity < product.stock) {
        setQuantity(q => q + 1);
      }
    } else {
      if (quantity > 1) {
        setQuantity(q => q - 1);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    setErrorMsg('');
    try {
      await addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col justify-center items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-gray-400 font-medium">Fetching product details...</p>
      </div>
    );
  }

  if (errorMsg && !product) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-2xl font-bold text-error">Product Error</h2>
        <p className="text-gray-500">{errorMsg}</p>
        <Link to="/products" className="btn btn-primary rounded-full px-6">
          <FiArrowLeft /> Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <Link to="/products" className="btn btn-ghost rounded-full gap-1 btn-sm pl-2">
        <FiArrowLeft /> Back to catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Image Grid Column */}
        <div className="md:col-span-6 bg-base-200/30 border border-base-200 rounded-3xl overflow-hidden aspect-square flex items-center justify-center p-4">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl shadow-sm hover:scale-102 transition-transform duration-500"
          />
        </div>

        {/* Right: Product details Grid Column */}
        <div className="md:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category and Stock status row */}
            <div className="flex justify-between items-center">
              <span className="badge badge-primary font-bold text-xs uppercase tracking-wider px-3 py-1.5">
                {product.category}
              </span>
              
              {product.stock > 5 ? (
                <span className="badge badge-success text-white font-bold text-xs">In Stock ({product.stock})</span>
              ) : product.stock > 0 ? (
                <span className="badge badge-warning text-white font-bold text-xs">Only {product.stock} items left!</span>
              ) : (
                <span className="badge badge-error text-white font-bold text-xs">Out of Stock</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating & reviews mock */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500 text-base">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={i < Math.floor(product.rating || 4.0) ? "fill-current" : ""}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-500">
                {(product.rating || 4.0).toFixed(1)} / 5.0 Rating
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-black tracking-tight text-primary">
              ${product.price.toFixed(2)}
            </div>

            <div className="divider my-2"></div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-base uppercase tracking-wider text-gray-400">Description</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {product.description}
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            {/* Quantity Picker & Add to cart button row */}
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Quantity picker */}
                <div className="flex items-center border border-base-300 rounded-full h-12 bg-base-100 overflow-hidden w-fit select-none">
                  <button
                    onClick={() => handleQtyChange('dec')}
                    className="btn btn-ghost rounded-none border-none hover:bg-base-200 h-full w-12 text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-base">{quantity}</span>
                  <button
                    onClick={() => handleQtyChange('inc')}
                    className="btn btn-ghost rounded-none border-none hover:bg-base-200 h-full w-12 text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add button */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`btn h-12 rounded-full flex-grow px-8 gap-2 shadow-lg transition-all duration-300 ${
                    added 
                      ? 'btn-success text-white shadow-success/20' 
                      : 'btn-primary text-white shadow-primary/20 hover:scale-101'
                  }`}
                >
                  {adding ? (
                    <span className="loading loading-spinner"></span>
                  ) : added ? (
                    <>
                      <FiCheck className="stroke-[3]" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <FiShoppingCart /> Add {quantity} to Cart
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button disabled className="btn btn-disabled w-full h-12 rounded-full uppercase tracking-wider font-bold">
                Out of Stock
              </button>
            )}

            {/* Error notifications */}
            {errorMsg && (
              <div className="alert alert-error text-sm rounded-xl py-2 px-3 flex gap-2">
                <FiInfo />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Shipping & trust details banner */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-base-200 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <FiTruck className="text-lg text-primary" />
                <span>Free global delivery for purchases over $99</span>
              </div>
              <div className="flex items-center gap-2">
                <FiShield className="text-lg text-primary" />
                <span>Simulated secure SSL merchant transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
