import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { FiSearch, FiSliders, FiRefreshCw, FiGrid } from 'react-icons/fi';

const CategoriesList = ['All', 'Electronics', 'Fashion', 'Accessories', 'Home Decor'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & sort states sync'd with query parameters
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'All';
  const sortOption = searchParams.get('sort') || 'latest';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  // Local inputs
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  useEffect(() => {
    // Keep local search input synced if searchParams changes from outside
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append('search', searchQuery);
        if (categoryFilter && categoryFilter !== 'All') queryParams.append('category', categoryFilter);
        if (sortOption) queryParams.append('sort', sortOption);
        if (minPrice) queryParams.append('min_price', minPrice);
        if (maxPrice) queryParams.append('max_price', maxPrice);

        const res = await fetch(`${API_URL}/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, categoryFilter, sortOption, minPrice, maxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handleCategorySelect = (category) => {
    updateParam('category', category);
  };

  const handleSortSelect = (sort) => {
    updateParam('sort', sort);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (minPriceInput) nextParams.set('min_price', minPriceInput);
    else nextParams.delete('min_price');
    if (maxPriceInput) nextParams.set('max_price', maxPriceInput);
    else nextParams.delete('max_price');
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
  };

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="py-8 space-y-8">
      {/* Search Header banner */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Explore Our Catalogue</h1>
        <p className="text-gray-500">Filter premium high-end items by category, price, and query.</p>
        
        {/* Search Input Form for Mobile / Main Shop */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto pt-2">
          <input
            type="text"
            placeholder="What are you looking for today?"
            className="input input-bordered w-full rounded-full pl-12 pr-28 focus:outline-none focus:border-primary shadow-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <FiSearch className="absolute left-4 top-5 text-gray-400 text-lg" />
          <button type="submit" className="btn btn-primary btn-sm rounded-full absolute right-2 top-2 h-9 px-6 text-xs uppercase font-bold tracking-wider">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel (Left Sidebar) */}
        <div className="lg:col-span-1 space-y-6 bg-base-200/40 border border-base-200 p-6 rounded-2xl h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-base-200">
            <h3 className="font-bold text-lg flex items-center gap-2"><FiSliders /> Filters</h3>
            <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
              <FiRefreshCw /> Reset All
            </button>
          </div>

          {/* Categories Filter list */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Category</h4>
            <div className="flex flex-col gap-1.5">
              {CategoriesList.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`btn btn-sm justify-start rounded-xl font-medium ${
                    categoryFilter === category
                      ? 'btn-primary text-white shadow-md shadow-primary/15'
                      : 'btn-ghost hover:bg-base-200 text-base-content/85'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter Form */}
          <div className="space-y-3 pt-4 border-t border-base-200">
            <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Price Range</h4>
            <form onSubmit={handlePriceApply} className="space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  className="input input-sm input-bordered w-full rounded-lg"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="input input-sm input-bordered w-full rounded-lg"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-sm btn-outline btn-primary w-full rounded-lg text-xs font-semibold">
                Apply Price
              </button>
            </form>
          </div>
        </div>

        {/* Products List (Right Grid) */}
        <div className="lg:col-span-3 space-y-6">
          {/* List header controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-4 border border-base-200 rounded-2xl">
            <div className="flex items-center gap-2 font-medium text-gray-500 text-sm">
              <FiGrid />
              <span>Showing {products.length} {products.length === 1 ? 'product' : 'products'}</span>
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <label className="text-sm font-medium text-gray-500 whitespace-nowrap">Sort by:</label>
              <select
                className="select select-sm select-bordered rounded-lg focus:outline-none w-full sm:w-auto"
                value={sortOption}
                onChange={(e) => handleSortSelect(e.target.value)}
              >
                <option value="latest">Latest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Grid render */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card bg-base-200 h-80 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-base-200/30 border border-base-200 rounded-2xl space-y-4">
              <span className="text-5xl text-gray-300">🔍</span>
              <h3 className="font-bold text-xl">No Products Found</h3>
              <p className="text-gray-500 max-w-sm text-center">
                We couldn't find any products matching your current filters. Try resetting them!
              </p>
              <button onClick={clearFilters} className="btn btn-primary rounded-full px-6">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
