import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  MapPin,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showManualPrice, setShowManualPrice] = useState(false);

  // Synchronized Filter State (Single source of truth initialized from URL)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState('newest');

  // Dynamic Database-Driven Filter Options State
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    priceRanges: [],
    propertyTypes: [],
    totalProperties: 0,
    priceStats: null,
  });
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Keep local form controls in sync whenever the URL changes
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setCity(searchParams.get('city') || '');
    setPurpose(searchParams.get('purpose') || '');
    setPropertyType(searchParams.get('propertyType') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // Fetch dynamic database-derived filter options based on listing type
  const fetchFilterOptions = useCallback(async (listingType) => {
    setOptionsLoading(true);
    try {
      const res = await propertyService.getFilterOptions({ listingType: listingType || '' });
      if (res.success && res.data) {
        setFilterOptions(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to load dynamic filter options:', err);
    } finally {
      setOptionsLoading(false);
    }
    return null;
  }, []);

  // Fetch filter options on mount and whenever listing type (purpose) changes
  useEffect(() => {
    fetchFilterOptions(purpose);
  }, [purpose, fetchFilterOptions]);

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

  // Keyboard dismissal for mobile filter drawer
  useEffect(() => {
    if (!mobileFilterOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileFilterOpen]);

  // Push full filter state to URL with validation guard
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

  // Section 4: Filter Dependencies - Purpose Change
  // Switching Buy / Rent / Lease refreshes dynamic options and clears incompatible city and price selections
  const handlePurposeChange = async (newPurpose) => {
    setPurpose(newPurpose);

    const params = new URLSearchParams(searchParams);
    if (newPurpose) {
      params.set('purpose', newPurpose);
    } else {
      params.delete('purpose');
    }

    // Refresh dynamic options for the target listing type
    const newOptions = await fetchFilterOptions(newPurpose);

    // 1. Incompatible city check: clear city if not in the new listing type's available cities
    if (newOptions && city) {
      const cityStillValid = newOptions.cities.some(
        (c) => c.name.toLowerCase() === city.trim().toLowerCase()
      );
      if (!cityStillValid) {
        setCity('');
        params.delete('city');
      }
    } else if (!newOptions) {
      setCity('');
      params.delete('city');
    }

    // 2. Clear incompatible price selection because sale (Crores) vs rent/lease (monthly) scales differ
    setMinPrice('');
    setMaxPrice('');
    params.delete('minPrice');
    params.delete('maxPrice');

    setSearchParams(params);
  };

  // Section 4: Changing city updates matching properties immediately
  const handleCityChange = (newCity) => {
    setCity(newCity);
    const params = new URLSearchParams(searchParams);
    if (newCity) {
      params.set('city', newCity);
    } else {
      params.delete('city');
    }
    setSearchParams(params);
  };

  // Section 4: Changing price range updates matching properties immediately
  const handlePriceRangeChange = (rangeKey) => {
    const params = new URLSearchParams(searchParams);
    if (!rangeKey) {
      setMinPrice('');
      setMaxPrice('');
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      const range = filterOptions.priceRanges.find((r) => r.key === rangeKey);
      if (range) {
        const min = range.minPrice !== null ? String(range.minPrice) : '';
        const max = range.maxPrice !== null ? String(range.maxPrice) : '';
        setMinPrice(min);
        setMaxPrice(max);
        if (min) params.set('minPrice', min);
        else params.delete('minPrice');
        if (max) params.set('maxPrice', max);
        else params.delete('maxPrice');
      }
    }
    setSearchParams(params);
  };

  // Section 4: Changing typology updates matching properties immediately
  const handlePropertyTypeChange = (newType) => {
    setPropertyType(newType);
    const params = new URLSearchParams(searchParams);
    if (newType) {
      params.set('propertyType', newType);
    } else {
      params.delete('propertyType');
    }
    setSearchParams(params);
  };

  // Section 4: Reset filters preserves the currently selected listing type
  const handleResetFilters = () => {
    setSearchInput('');
    setCity('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');

    const params = new URLSearchParams();
    if (purpose) {
      params.set('purpose', purpose);
    }
    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  const removeFilter = (key) => {
    const params = new URLSearchParams(searchParams);
    if (key === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
      setMinPrice('');
      setMaxPrice('');
    } else {
      params.delete(key);
      if (key === 'search') setSearchInput('');
      if (key === 'city') setCity('');
      if (key === 'purpose') {
        setPurpose('');
        fetchFilterOptions('');
      }
      if (key === 'propertyType') setPropertyType('');
    }
    setSearchParams(params);
  };

  // Calculate which dynamic price range key is currently selected
  const selectedPriceKey = useMemo(() => {
    const matched = filterOptions.priceRanges.find(
      (r) =>
        (r.minPrice === null ? !minPrice : String(r.minPrice) === String(minPrice)) &&
        (r.maxPrice === null ? !maxPrice : String(r.maxPrice) === String(maxPrice))
    );
    if (matched) return matched.key;
    if (minPrice || maxPrice) return 'custom';
    return '';
  }, [filterOptions.priceRanges, minPrice, maxPrice]);

  // Active filter badge labels
  const activePriceRange = filterOptions.priceRanges.find((r) => r.key === selectedPriceKey);
  const priceBadgeLabel = activePriceRange
    ? `Budget: ${activePriceRange.label}`
    : minPrice && maxPrice
    ? `Budget: ₹${Number(minPrice).toLocaleString('en-IN')} – ₹${Number(maxPrice).toLocaleString('en-IN')}`
    : minPrice
    ? `Min Budget: ₹${Number(minPrice).toLocaleString('en-IN')}`
    : maxPrice
    ? `Max Budget: ₹${Number(maxPrice).toLocaleString('en-IN')}`
    : null;

  const purposeBadgeLabel =
    searchParams.get('purpose') === 'sale'
      ? 'Buy'
      : searchParams.get('purpose') === 'rent'
      ? 'Rent'
      : searchParams.get('purpose') === 'lease'
      ? 'Lease'
      : null;

  const activeFilters = [
    searchParams.get('search') && { key: 'search', label: `Search: "${searchParams.get('search')}"` },
    searchParams.get('city') && { key: 'city', label: `City: ${searchParams.get('city')}` },
    purposeBadgeLabel && { key: 'purpose', label: `Listing Type: ${purposeBadgeLabel}` },
    searchParams.get('propertyType') && { key: 'propertyType', label: `Typology: ${searchParams.get('propertyType')}` },
    priceBadgeLabel && { key: 'price', label: priceBadgeLabel },
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
              Displaying <span className="font-bold text-stone-900">{properties.length}</span> verified residences across dynamic database filters
            </p>
          </div>

          {/* Quick Purpose Segmented Switch & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Purpose Switch: All | Buy | Rent | Lease */}
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
              <button
                type="button"
                onClick={() => handlePurposeChange('lease')}
                className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                  purpose === 'lease' ? 'bg-[#14532D] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Lease
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
              placeholder="Search by locality, development, city, or property type (e.g. 'Candolim', 'Gachibowli', 'Villa')..."
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
                className="text-xs font-bold text-[#14532D] hover:underline ml-2 cursor-pointer"
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
                <SlidersHorizontal className="w-4 h-4 text-[#14532D]" /> Dynamic Filters
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600 transition-colors font-semibold focus-visible:ring-2 focus-visible:ring-rose-500 rounded-xs cursor-pointer"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Section 3: Dynamic City Filter (Generated from real records with counts) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="filter-desktop-city" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Metropolitan Area
                </label>
                {optionsLoading && (
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-[#14532D]" /> Syncing
                  </span>
                )}
              </div>
              <select
                id="filter-desktop-city"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={optionsLoading}
                className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer disabled:opacity-60"
              >
                <option value="">
                  {optionsLoading
                    ? 'Loading verified locations...'
                    : filterOptions.cities.length === 0
                    ? 'No locations with matching listings'
                    : `All Locations (${filterOptions.totalProperties})`}
                </option>
                {filterOptions.cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Section 2: Dynamic Price Ranges (Generated from real records with counts) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="filter-desktop-price-range" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  {purpose === 'rent' || purpose === 'lease' ? 'Monthly Lease / Rent' : 'Acquisition Budget'}
                </label>
                {optionsLoading && (
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-[#14532D]" /> Syncing
                  </span>
                )}
              </div>
              <select
                id="filter-desktop-price-range"
                value={selectedPriceKey}
                onChange={(e) => handlePriceRangeChange(e.target.value)}
                disabled={optionsLoading}
                className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer disabled:opacity-60"
              >
                <option value="">
                  {filterOptions.priceRanges.length === 0
                    ? 'No price ranges available'
                    : 'All Price Ranges'}
                </option>
                {filterOptions.priceRanges.map((range) => (
                  <option key={range.key} value={range.key}>
                    {range.label} ({range.count})
                  </option>
                ))}
                {selectedPriceKey === 'custom' && (
                  <option value="custom">Custom Boundary (Active)</option>
                )}
              </select>
            </div>

            {/* Optional Manual Budget Boundaries Disclosure */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowManualPrice(!showManualPrice)}
                className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors focus-visible:ring-1 focus-visible:ring-[#14532D] rounded-xs cursor-pointer"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showManualPrice ? 'rotate-180' : ''}`} />
                <span>Custom numeric boundaries</span>
              </button>

              {showManualPrice && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-100">
                  <div>
                    <label htmlFor="filter-desktop-min-price" className="sr-only">Minimum Price</label>
                    <input
                      id="filter-desktop-min-price"
                      type="number"
                      min={0}
                      placeholder="Min INR"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full p-2 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-desktop-max-price" className="sr-only">Maximum Price</label>
                    <input
                      id="filter-desktop-max-price"
                      type="number"
                      min={0}
                      placeholder="Max INR"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full p-2 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Property Typology (Dynamic counts when available) */}
            <div className="space-y-1.5">
              <label htmlFor="filter-desktop-type" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Property Typology
              </label>
              <select
                id="filter-desktop-type"
                value={propertyType}
                onChange={(e) => handlePropertyTypeChange(e.target.value)}
                className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
              >
                <option value="">All Typologies</option>
                {filterOptions.propertyTypes.length > 0 ? (
                  filterOptions.propertyTypes.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name.charAt(0).toUpperCase() + t.name.slice(1)} ({t.count})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="flat">Flat</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="house">House</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="commercial">Commercial</option>
                  </>
                )}
              </select>
            </div>

            {/* Apply Action Button */}
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
                    No properties match your current combination of filters. Try broadening your location or budget range, or clear filters to view all listings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-md bg-[#14532D] text-white font-bold text-xs hover:bg-[#166534] transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
                >
                  Clear Filters (Preserve Listing Type)
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
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/60 backdrop-blur-sm" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="mobile-filter-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileFilterOpen(false);
            }}
          >
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

              {/* Purpose Selection: All | Buy | Rent | Lease */}
              <div className="space-y-1.5">
                <label htmlFor="filter-mobile-purpose" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Listing Type
                </label>
                <select
                  id="filter-mobile-purpose"
                  value={purpose}
                  onChange={(e) => handlePurposeChange(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900"
                >
                  <option value="">All Transactions (Buy, Rent & Lease)</option>
                  <option value="sale">Buy Only</option>
                  <option value="rent">Rent Only</option>
                  <option value="lease">Lease Only</option>
                </select>
              </div>

              {/* Dynamic City Filter */}
              <div className="space-y-1.5">
                <label htmlFor="filter-mobile-city" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  Metropolitan Area
                </label>
                <select
                  id="filter-mobile-city"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={optionsLoading}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900"
                >
                  <option value="">
                    {optionsLoading
                      ? 'Loading locations...'
                      : filterOptions.cities.length === 0
                      ? 'No locations with matching listings'
                      : `All Locations (${filterOptions.totalProperties})`}
                  </option>
                  {filterOptions.cities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Price Ranges */}
              <div className="space-y-1.5">
                <label htmlFor="filter-mobile-price-range" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                  {purpose === 'rent' || purpose === 'lease' ? 'Monthly Lease / Rent' : 'Acquisition Budget'}
                </label>
                <select
                  id="filter-mobile-price-range"
                  value={selectedPriceKey}
                  onChange={(e) => handlePriceRangeChange(e.target.value)}
                  disabled={optionsLoading}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900"
                >
                  <option value="">
                    {filterOptions.priceRanges.length === 0
                      ? 'No price ranges available'
                      : 'All Price Ranges'}
                  </option>
                  {filterOptions.priceRanges.map((range) => (
                    <option key={range.key} value={range.key}>
                      {range.label} ({range.count})
                    </option>
                  ))}
                  {selectedPriceKey === 'custom' && (
                    <option value="custom">Custom Boundary (Active)</option>
                  )}
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
                  onChange={(e) => handlePropertyTypeChange(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900"
                >
                  <option value="">All Typologies</option>
                  {filterOptions.propertyTypes.length > 0 ? (
                    filterOptions.propertyTypes.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name.charAt(0).toUpperCase() + t.name.slice(1)} ({t.count})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="flat">Flat</option>
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="bungalow">Bungalow</option>
                      <option value="house">House</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="commercial">Commercial</option>
                    </>
                  )}
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
                  Reset All (Keep Listing Type)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
