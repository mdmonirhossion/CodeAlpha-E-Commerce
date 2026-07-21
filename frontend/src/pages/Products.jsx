import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { FiSearch, FiSliders, FiRefreshCw, FiGrid, FiChevronDown, FiCheckCircle } from 'react-icons/fi';

// Added 'Sports' to match new seed data
const CategoriesList = ['All', 'Electronics', 'Fashion', 'Accessories', 'Home Decor', 'Sports'];

// Number of products to load per page (matches backend default)
const PAGE_LIMIT = 8;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Product list state ───────────────────────────────────────────────────
  const [products, setProducts]       = useState([]);
  const [total, setTotal]             = useState(0);
  const [hasMore, setHasMore]         = useState(false);
  const [page, setPage]               = useState(1);

  // ── Loading state (two kinds) ────────────────────────────────────────────
  // `loading`     → full skeleton shown on first load / filter change
  // `loadingMore` → spinner inside "Load More" button only
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Filter & sort values (driven by URL search params) ───────────────────
  const searchQuery    = searchParams.get('search')    || '';
  const categoryFilter = searchParams.get('category') || 'All';
  const sortOption     = searchParams.get('sort')      || 'latest';
  const minPrice       = searchParams.get('min_price') || '';
  const maxPrice       = searchParams.get('max_price') || '';

  // Local input states (not committed to URL until user submits)
  const [searchInput,    setSearchInput]    = useState(searchQuery);
  const [minPriceInput,  setMinPriceInput]  = useState(minPrice);
  const [maxPriceInput,  setMaxPriceInput]  = useState(maxPrice);

  // Keep local search input synced when URL changes from outside
  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  // ── Core fetch function ───────────────────────────────────────────────────
  /**
   * @param {number}  pageNum  - Page number to fetch (1-indexed)
   * @param {boolean} append   - true  → append to existing list (Load More)
   *                           - false → replace list (filter/sort change)
   */
  const fetchProducts = useCallback(async (pageNum, append) => {
    // Use the full-skeleton spinner on page 1 replacements, button spinner otherwise
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Build query string — include all active filters + pagination params
      const queryParams = new URLSearchParams();
      queryParams.append('page',  pageNum);
      queryParams.append('limit', PAGE_LIMIT);
      if (searchQuery)                        queryParams.append('search',    searchQuery);
      if (categoryFilter && categoryFilter !== 'All') queryParams.append('category',  categoryFilter);
      if (sortOption)                         queryParams.append('sort',      sortOption);
      if (minPrice)                           queryParams.append('min_price', minPrice);
      if (maxPrice)                           queryParams.append('max_price', maxPrice);

      const res = await fetch(`${API_URL}/products?${queryParams.toString()}`);

      if (res.ok) {
        // API now returns { products, total, hasMore }
        const data = await res.json();

        if (append) {
          // Append new batch below existing cards
          setProducts(prev => [...prev, ...data.products]);
        } else {
          // Replace list entirely (filter change / initial load)
          setProducts(data.products);
        }

        setTotal(data.total);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, categoryFilter, sortOption, minPrice, maxPrice]);

  // Re-fetch from page 1 whenever any filter or sort param changes
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, sortOption, minPrice, maxPrice]);

  // ── "Load More" button handler ────────────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  // ── Filter / sort helpers ─────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handleCategorySelect = (category) => updateParam('category', category);
  const handleSortSelect     = (sort)     => updateParam('sort', sort);

  const handlePriceApply = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (minPriceInput) nextParams.set('min_price', minPriceInput);
    else               nextParams.delete('min_price');
    if (maxPriceInput) nextParams.set('max_price', maxPriceInput);
    else               nextParams.delete('max_price');
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
    if (value && value !== 'All') nextParams.set(key, value);
    else                          nextParams.delete(key);
    setSearchParams(nextParams);
  };

  return (
    <div className="py-8 space-y-8">
      {/* ── Page header & search bar ─────────────────────────────────────── */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Explore Our Catalogue</h1>
        <p className="text-gray-500">Filter premium high-end items by category, price, and query.</p>

        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto pt-2">
          <input
            type="text"
            placeholder="What are you looking for today?"
            className="input input-bordered w-full rounded-full pl-12 pr-28 focus:outline-none focus:border-primary shadow-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <FiSearch className="absolute left-4 top-5 text-gray-400 text-lg" />
          <button
            type="submit"
            className="btn btn-primary btn-sm rounded-full absolute right-2 top-2 h-9 px-6 text-xs uppercase font-bold tracking-wider"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── Filters sidebar ────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6 bg-base-200/40 border border-base-200 p-6 rounded-2xl h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-base-200">
            <h3 className="font-bold text-lg flex items-center gap-2"><FiSliders /> Filters</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <FiRefreshCw /> Reset All
            </button>
          </div>

          {/* Category list */}
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

          {/* Price range */}
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
              <button
                type="submit"
                className="btn btn-sm btn-outline btn-primary w-full rounded-lg text-xs font-semibold"
              >
                Apply Price
              </button>
            </form>
          </div>
        </div>

        {/* ── Products grid (right column) ───────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {/* List header: count + sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-4 border border-base-200 rounded-2xl">
            <div className="flex items-center gap-2 font-medium text-gray-500 text-sm">
              <FiGrid />
              {loading ? (
                <span>Loading products...</span>
              ) : (
                <span>
                  Showing <span className="font-bold text-base-content">{products.length}</span>
                  {' '}of{' '}
                  <span className="font-bold text-base-content">{total}</span>
                  {' '}{total === 1 ? 'product' : 'products'}
                </span>
              )}
            </div>

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

          {/* ── Product grid ─────────────────────────────────────────────── */}
          {loading ? (
            /* Skeleton placeholders on initial / filter-change load */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(PAGE_LIMIT)].map((_, i) => (
                <div key={i} className="card bg-base-200 h-80 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty state */
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* ── Load More / End of list ─────────────────────────────── */}
              <div className="flex flex-col items-center gap-4 pt-4">
                {hasMore ? (
                  <button
                    id="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="btn btn-primary btn-wide rounded-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        Loading more...
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="text-lg" />
                        Load More Products
                      </>
                    )}
                  </button>
                ) : (
                  /* All products have been loaded */
                  <div className="flex flex-col items-center gap-2 py-4 text-gray-400">
                    <FiCheckCircle className="text-2xl text-success" />
                    <p className="text-sm font-medium">
                      You've seen all <span className="font-bold text-base-content">{total}</span> products
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
