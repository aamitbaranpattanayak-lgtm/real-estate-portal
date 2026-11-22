import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { PropertyCard } from '../../components/property/PropertyCard';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Search, 
  ArrowUpDown, 
  X, 
  Filter,
  Building2,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Synchronized Filter State (Single source of truth initialized from URL)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState('newest');

  // Keep local form controls in sync whenever the URL changes (e.g. back/forward navigation or home search)
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setCity(searchParams.get('city') || '');
    setPurpose(searchParams.get('purpose') || '');
    setPropertyType(searchParams.get('propertyType') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // Fetch properties strictly based on URL search parameters (Single Source of Truth)
  const fetchFilteredProperties = useCallback(async () => {
    setLoading(true);

    const query = {};
    const urlSearch = searchParams.get('search');
    const urlCity = searchParams.get('city');
    const urlPurpose = searchParams.get('purpose');
    const urlType = searchParams.get('propertyType');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    const urlVerification = searchParams.get('verificationStatus');

    if (urlSearch && urlSearch.trim()) query.search = urlSearch.trim();
    if (urlCity) query.city = urlCity;
    if (urlPurpose) query.purpose = urlPurpose;
    if (urlType) query.propertyType = urlType;
    if (urlMinPrice) query.minPrice = urlMinPrice;
    if (urlMaxPrice) query.maxPrice = urlMaxPrice;
    if (urlVerification) query.verificationStatus = urlVerification;

    try {
      const res = await propertyService.getProperties(query);
      if (res.success && Array.isArray(res.data)) {
        let sorted = [...res.data];
        if (sortBy === 'price-low') {
          sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          sorted.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'area') {
          sorted.sort((a, b) => (b.area || 0) - (a.area || 0));
        }
        setProperties(sorted);
      }
    } catch (err) {
      console.error('Error fetching filtered properties:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, sortBy]);

  useEffect(() => {
    fetchFilteredProperties();
  }, [fetchFilteredProperties]);

  // Push filter state to URL with validation guard
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (city) params.set('city', city);
    if (purpose) params.set('purpose', purpose);
    if (propertyType) params.set('propertyType', propertyType);

    // Guard: ensure minPrice <= maxPrice if both are populated
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      params.set('minPrice', maxPrice);
      params.set('maxPrice', minPrice);
      setMinPrice(maxPrice);
      setMaxPrice(minPrice);
    } else {
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
    }

    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  const handlePurposeChange = (newPurpose) => {
    setPurpose(newPurpose);
    const params = new URLSearchParams(searchParams);
    if (newPurpose) {
      params.set('purpose', newPurpose);
    } else {
      params.delete('purpose');
    }
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setCity('');
    setPurpose('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const removeFilter = (key) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    if (key === 'search') setSearchInput('');
    if (key === 'city') setCity('');
    if (key === 'purpose') setPurpose('');
    if (key === 'propertyType') setPropertyType('');
    if (key === 'minPrice') setMinPrice('');
    if (key === 'maxPrice') setMaxPrice('');
    setSearchParams(params);
  };

  // Active filters count
  const activeFilters = [
    searchParams.get('search') && { key: 'search', label: `Search: "${searchParams.get('search')}"` },
    searchParams.get('city') && { key: 'city', label: `City: ${searchParams.get('city')}` },
    searchParams.get('purpose') && { key: 'purpose', label: `Purpose: ${searchParams.get('purpose') === 'sale' ? 'Buy' : 'Rent'}` },
    searchParams.get('propertyType') && { key: 'propertyType', label: `Type: ${searchParams.get('propertyType')}` },
    searchParams.get('minPrice') && { key: 'minPrice', label: `Min: ₹${Number(searchParams.get('minPrice')).toLocaleString('en-IN')}` },
    searchParams.get('maxPrice') && { key: 'maxPrice', label: `Max: ₹${Number(searchParams.get('maxPrice')).toLocaleString('en-IN')}` },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FBFBF9] pt-28 pb-20 text-stone-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* ========================================================================= */}
        {/* CATALOG HEADER & SORT BAR                                                */}
        {/* ========================================================================= */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#14532D] mb-1.5 block">
              The Residences Catalog
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              Curated Properties in India
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Displaying <span className="font-bold text-stone-900">{properties.length}</span> certified direct listings
            </p>
          </div>

          {/* Quick Purpose Segmented Switch & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Purpose Switch */}
            <div className="flex items-center rounded-md border border-stone-200 bg-white p-1 text-xs font-bold shadow-xs">
              <button
                type="button"
                onClick={() => handlePurposeChange('')}
                className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                  !purpose ? 'bg-[#14532D] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handlePurposeChange('sale')}
                className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                  purpose === 'sale' ? 'bg-[#14532D] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => handlePurposeChange('rent')}
                className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                  purpose === 'rent' ? 'bg-[#14532D] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Rent
              </button>
            </div>

            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-md border border-stone-200 bg-white text-stone-800 text-xs font-bold shadow-xs hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
              aria-label="Open filter drawer"
            >
              <Filter className="w-4 h-4 text-[#14532D]" /> 
              <span>Filters {activeFilters.length > 0 && `(${activeFilters.length})`}</span>
            </button>

            {/* Sort Control */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-stone-200 bg-white text-xs font-bold text-stone-700 shadow-xs">
              <label htmlFor="sort-by-select" className="sr-only">Sort properties</label>
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-stone-800 font-semibold focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="area">Area: Largest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SYNCHRONIZED SEARCH BAR & ACTIVE FILTER PILLS                             */}
        {/* ========================================================================= */}
        <div className="mb-6 space-y-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              applyFilters();
            }}
            className="relative"
          >
            <label htmlFor="properties-search-input" className="sr-only">Search properties</label>
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
            <input
              id="properties-search-input"
              type="text"
              placeholder="Search by locality, development, city, or property type (e.g. 'Whitefield', 'Villa', 'Bengaluru')..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-28 py-3 rounded-md border border-stone-200 bg-white text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] shadow-xs transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  removeFilter('search');
                }}
                className="absolute right-24 top-2.5 text-stone-400 hover:text-stone-600 p-1 focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-2 px-5 py-1.5 rounded-md bg-[#14532D] text-white text-xs font-bold hover:bg-[#166534] transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Active Filter Badges */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-1">
                Active Parameters:
              </span>
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className="inline-flex items-center gap-1.5 bg-stone-200/80 text-stone-800 text-xs font-semibold px-2.5 py-1 rounded-sm"
                >
                  <span>{f.label}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter(f.key)}
                    className="hover:text-rose-600 focus-visible:ring-1 focus-visible:ring-rose-500 rounded-xs"
                    aria-label={`Remove filter: ${f.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#14532D] hover:underline ml-2"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MAIN LAYOUT: SIDEBAR + CATALOG GRID                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-lg border border-stone-200 shadow-xs sticky top-28">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-[#14532D]" /> Filter Parameters
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600 transition-colors font-semibold focus-visible:ring-2 focus-visible:ring-rose-500 rounded-xs cursor-pointer"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* City Selection */}
            <div className="space-y-1.5">
              <label htmlFor="filter-desktop-city" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Metropolitan Area
              </label>
              <select
                id="filter-desktop-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
              >
                <option value="">All Metropolitan Areas</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi-NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Goa">Goa</option>
              </select>
            </div>

            {/* Property Typology */}
            <div className="space-y-1.5">
              <label htmlFor="filter-desktop-type" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Property Typology
              </label>
              <select
                id="filter-desktop-type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
              >
                <option value="">All Typologies</option>
                <option value="flat">Flat</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="bungalow">Bungalow</option>
                <option value="house">House</option>
                <option value="penthouse">Penthouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Budget Range */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Budget Boundaries (INR)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="filter-desktop-min-price" className="sr-only">Minimum Price</label>
                  <input
                    id="filter-desktop-min-price"
                    type="number"
                    min={0}
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                  />
                </div>
                <div>
                  <label htmlFor="filter-desktop-max-price" className="sr-only">Maximum Price</label>
                  <input
                    id="filter-desktop-max-price"
                    type="number"
                    min={0}
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                  />
                </div>
              </div>
            </div>

            {/* Apply Action */}
            <button
              onClick={applyFilters}
              className="w-full py-2.5 bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs rounded-md shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
            >
              Apply Filter Parameters
            </button>
          </aside>

          {/* Catalog Listing Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <SkeletonGrid count={6} />
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-lg border border-stone-200 space-y-4">
                <div className="w-12 h-12 rounded-md bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    No Matching Residences Found
                  </h2>
                  <p className="text-stone-600 text-xs max-w-sm mx-auto leading-relaxed">
                    Try broadening your search parameters or reset your filters to view the complete portfolio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-md bg-[#14532D] text-white font-bold text-xs hover:bg-[#166534] transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D]"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM SHEET FILTER DRAWER                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-xl sm:rounded-lg max-w-lg w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto border border-stone-200 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 id="mobile-filter-title" className="font-serif text-lg font-bold text-stone-900">
                  Refine Residences
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-[#14532D]"
                  aria-label="Close filter drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Purpose Selection */}
              <div className="space-y-1.5">
                <label htmlFor="filter-mobile-purpose" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Purpose
                </label>
                <select
                  id="filter-mobile-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900"
                >
                  <option value="">All (Buy & Rent)</option>
                  <option value="sale">Buy Only</option>
                  <option value="rent">Rent Only</option>
                </select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label htmlFor="filter-mobile-city" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Metropolitan Area
                </label>
                <select
                  id="filter-mobile-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900"
                >
                  <option value="">All Metropolitan Areas</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi-NCR">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Goa">Goa</option>
                </select>
              </div>

              {/* Typology */}
              <div className="space-y-1.5">
                <label htmlFor="filter-mobile-type" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Property Typology
                </label>
                <select
                  id="filter-mobile-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900"
                >
                  <option value="">All Typologies</option>
                  <option value="flat">Flat</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="house">House</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full py-3 rounded-md bg-[#14532D] text-white font-bold text-xs shadow-xs hover:bg-[#166534] transition-colors cursor-pointer"
                >
                  Apply Filter Parameters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-2.5 rounded-md border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
