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
  Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States initialized from URL query parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setCity(searchParams.get("city") || "");
    setPurpose(searchParams.get("purpose") || "");
    setPropertyType(searchParams.get("propertyType") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Fetch properties from backend with explicit backend filter params
  const fetchFilteredProperties = useCallback(async () => {
    setLoading(true);

    const query = {};
    if (searchTerm.trim()) query.search = searchTerm.trim();
    if (city) query.city = city;
    if (purpose) query.purpose = purpose;
    if (propertyType) query.propertyType = propertyType;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;

    try {
      const res = await propertyService.getProperties(query);
      if (res.success && Array.isArray(res.data)) {
        let sorted = [...res.data];
        if (sortBy === 'price-low') {
          sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          sorted.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'area') {
          sorted.sort((a, b) => b.area - a.area);
        }
        setProperties(sorted);
      }
    } catch (err) {
      console.error('Error fetching filtered properties:', err);
    } finally {
      setLoading(false);
    }
  }, [city, purpose, propertyType, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchFilteredProperties();
  }, [fetchFilteredProperties]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (city) params.set('city', city);
    if (purpose) params.set('purpose', purpose);
    if (propertyType) params.set('propertyType', propertyType);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCity('');
    setPurpose('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-28 pb-20 text-[#111827]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#14532D] mb-1 block">
              Curated Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Curated homes across India.
            </h1>
            <p className="text-stone-500 text-xs mt-1">
              Showing <span className="font-bold text-stone-900">{properties.length}</span> verified property listings
            </p>
          </div>

          {/* Sort & Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-bold shadow-xs hover:bg-stone-50"
            >
              <Filter className="w-4 h-4 text-[#14532D]" /> Filter
            </button>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-700 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="area">Area: Largest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Search Bar */}
        <div className="mb-8 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search properties by title, location, landmark, or features (e.g. 'Whitefield', 'Villa', 'Sea-View')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyFilters();
            }}
            className="w-full pl-11 pr-28 py-3 rounded-2xl border border-stone-200/80 bg-white text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#14532D] shadow-xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                setSearchParams(params);
              }}
              className="absolute right-24 top-2.5 text-stone-400 hover:text-stone-600 p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={applyFilters}
            className="absolute right-2 top-2 px-5 py-1.5 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#166534] transition-all shadow-xs"
          >
            Search
          </button>
        </div>

        {/* Main Grid: Filter Sidebar + Property Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs h-fit sticky top-28">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-[#14532D]" /> Filter Options
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-rose-600 transition-colors font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Purpose</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'All', value: '' },
                  { label: 'Buy', value: 'sale' },
                  { label: 'Rent', value: 'rent' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPurpose(opt.value)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      purpose === opt.value
                        ? 'bg-[#14532D] text-white border-[#14532D] shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D]"
              >
                <option value="">All Cities</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi-NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Goa">Goa</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D]"
              >
                <option value="">All Types</option>
                <option value="flat">Flat</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="bungalow">Bungalow</option>
                <option value="house">House</option>
                <option value="penthouse">Penthouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Budget Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D]"
                />
              </div>
            </div>

            {/* Apply Action */}
            <button
              onClick={applyFilters}
              className="w-full py-3 bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Apply Filter Parameters
            </button>
          </div>

          {/* Cards Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <SkeletonGrid count={6} />
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#14532D] flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">No matching homes found</h3>
                <p className="text-stone-500 text-xs max-w-sm mx-auto">
                  Try adjusting your filter selection or clearing price bounds.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#14532D] text-white text-xs font-bold shadow-xs hover:bg-[#166534] transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Filter className="w-4 h-4 text-[#14532D]" /> Filters
                </div>
                <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold"
                >
                  <option value="">All</option>
                  <option value="sale">Buy</option>
                  <option value="rent">Rent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold"
                >
                  <option value="">All Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi-NCR">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div className="pt-6 space-y-3">
                <button
                  onClick={applyFilters}
                  className="w-full py-3 rounded-xl bg-[#14532D] text-white font-bold text-xs shadow-xs"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="w-full py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
