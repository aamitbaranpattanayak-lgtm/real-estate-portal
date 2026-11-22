import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { PropertyCard } from '../../components/property/PropertyCard';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { 
  Search, 
  MapPin, 
  Building, 
  ArrowRight, 
  Check, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

export const HomePage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [purpose, setPurpose] = useState('sale');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await propertyService.getProperties();
        if (res.success && Array.isArray(res.data)) {
          setProperties(res.data);
        }
      } catch (err) {
        console.error('Failed to load properties for home page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties with featured === true strictly from MongoDB
  const featuredProperties = properties.filter((p) => p.featured === true);
  const latestProperties = properties.slice(0, 6);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (purpose) queryParams.set('purpose', purpose);
    if (city) queryParams.set('city', city);
    if (propertyType) queryParams.set('propertyType', propertyType);
    if (maxPrice) queryParams.set('maxPrice', maxPrice);

    navigate(`/properties?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#111827]">
      
      {/* HERO SECTION - REFINED ARCHITECTURAL FOCUS, NO HEAVY MUDDY OVERLAYS */}
      <section className="relative min-h-[82vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
        
        {/* Crisp Architectural Background with Soft Warm Gradient Only */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop"
            alt="Contemporary Architecture"
            className="w-full h-full object-cover filter brightness-95"
          />
          {/* Light Warm Scrim for Maximum Visual Clarity */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/30 to-stone-950/20" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center w-full">
          
          {/* Clean Editorial Eyebrow Text (NO pill badge, NO border, NO background) */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold text-white/90 uppercase tracking-[0.25em] mb-3"
          >
            Built for living, not just listing.
          </motion.p>

          {/* Calm Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.12] max-w-3xl mx-auto"
          >
            Find a home that feels right.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-white/85 max-w-xl mx-auto font-normal leading-relaxed"
          >
            Discover thoughtfully selected homes and investment properties across India.
          </motion.p>

          {/* Subtle Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-white/90"
          >
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Listings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Owners</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buy & Rent Across India</span>
            </div>
          </motion.div>

          {/* REFINED ARCHITECTURAL SEARCH CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-lg shadow-xl p-6 sm:p-8 border border-white/60 text-left text-stone-900"
          >
            {/* Purpose Toggle */}
            <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-3" role="group" aria-label="Transaction Purpose">
              <button
                type="button"
                onClick={() => setPurpose('sale')}
                className={`px-5 py-2 rounded-md text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] ${
                  purpose === 'sale'
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setPurpose('rent')}
                className={`px-5 py-2 rounded-md text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] ${
                  purpose === 'rent'
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Rent
              </button>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 items-end">
              
              {/* Location */}
              <div className="space-y-1">
                <label htmlFor="home-search-city" className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">Location</label>
                <select
                  id="home-search-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
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
              <div className="space-y-1">
                <label htmlFor="home-search-property-type" className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">Property Type</label>
                <select
                  id="home-search-property-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
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

              {/* Budget */}
              <div className="space-y-1">
                <label htmlFor="home-search-max-price" className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">Max Budget (₹)</label>
                <input
                  id="home-search-max-price"
                  type="number"
                  placeholder="e.g. 10000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                />
              </div>

              {/* Search Submit */}
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-5 rounded-md bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  Find your place
                </button>
              </div>

            </form>
          </motion.div>

        </div>
      </section>

      {/* HOMES WORTH EXPLORING (STRICTLY featured === true FROM MONGODB) */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#14532D] mb-1.5 block">
              Handpicked for you
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Homes worth exploring
            </h2>
            <p className="text-stone-500 text-xs mt-1">Spaces designed for everyday living.</p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#14532D] hover:text-[#166534] transition-colors group"
          >
            Browse all homes
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={3} />
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-lg border border-stone-200/80">
            <p className="text-stone-500 text-xs font-medium">No featured homes currently available.</p>
          </div>
        )}
      </section>

      {/* CURATED HOMES ACROSS INDIA */}
      <section className="py-24 bg-white border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-1.5 block">
                Fresh Inventory
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                Curated homes across India.
              </h2>
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-800 hover:text-[#14532D] transition-colors group"
            >
              Full catalog
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BROWSE BY PROPERTY TYPE */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-xl mb-12">
          <span className="text-xs font-bold text-[#14532D] uppercase tracking-[0.2em] mb-1.5 block">
            Layout Options
          </span>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
            Browse by Property Type
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Flat', type: 'flat' },
            { label: 'Apartment', type: 'apartment' },
            { label: 'Villa', type: 'villa' },
            { label: 'Bungalow', type: 'bungalow' },
            { label: 'Penthouse', type: 'penthouse' },
            { label: 'Commercial', type: 'commercial' },
          ].map((item) => (
            <Link
              key={item.type}
              to={`/properties?propertyType=${item.type}`}
              className="group p-5 rounded-md bg-white border border-stone-200/80 hover:border-[#14532D] shadow-xs hover:shadow-sm transition-all text-center flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-[#14532D]"
            >
              <h3 className="font-bold text-stone-900 text-xs group-hover:text-[#14532D] transition-colors">
                {item.label}
              </h3>
              <span className="text-xs text-stone-500 mt-1">Explore</span>
            </Link>
          ))}
        </div>
      </section>

      {/* EXPLORE BY LOCATION */}
      <section className="py-24 bg-[#0D2818] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-1.5 block">
              Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Explore by location
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: 'Bengaluru', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&auto=format&fit=crop' },
              { name: 'Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&auto=format&fit=crop' },
              { name: 'Delhi-NCR', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format&fit=crop' },
              { name: 'Hyderabad', img: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=500&auto=format&fit=crop' },
              { name: 'Pune', img: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=500&auto=format&fit=crop' },
            ].map((cityItem) => (
              <Link
                key={cityItem.name}
                to={`/properties?city=${cityItem.name}`}
                className="group relative h-64 rounded-md overflow-hidden border border-white/10 shadow-lg focus-visible:ring-2 focus-visible:ring-white"
              >
                <img
                  src={cityItem.img}
                  alt={cityItem.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {cityItem.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HAVEN */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <span className="text-xs font-bold text-[#14532D] uppercase tracking-[0.2em] block">
            Principles
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Every listing verified. Every decision yours.
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            HAVEN is crafted to strip away real estate noise, false claims, and invasive agent calls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Direct Connections',
              desc: 'Communicate directly with verified property owners and direct representatives.',
            },
            {
              title: 'Curated Standards',
              desc: 'High-definition photography, exact square footage, and verified city locations.',
            },
            {
              title: 'Calm Search',
              desc: 'No aggressive popups or spam. Search at your own pace.',
            },
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-md bg-white border border-stone-200/80 space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#14532D] flex items-center justify-center font-bold text-xs">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">{item.title}</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STORIES FROM HOMEOWNERS */}
      <section className="py-24 bg-white border-t border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-1.5 block">
              Reflections
            </span>
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
              Stories from Homeowners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'Finding our flat in Whitefield felt effortless. We spoke directly with Ramesh and finalized everything within a week.',
                author: 'Arjun M.',
                loc: 'Bengaluru',
              },
              {
                quote: 'The interface is clean and calm. No fake listings or endless broker calls.',
                author: 'Priya S.',
                loc: 'Mumbai',
              },
              {
                quote: 'As a villa owner in Goa, listing on HAVEN gave me genuine inquiries with full transparency.',
                author: 'Vikram S.',
                loc: 'Goa',
              },
            ].map((story, i) => (
              <div key={i} className="p-8 rounded-md bg-[#FBFBF9] border border-stone-200/80 space-y-4 shadow-xs">
                <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed">"{story.quote}"</p>
                <div className="pt-2 border-t border-stone-200/80">
                  <p className="font-bold text-stone-900 text-xs">{story.author}</p>
                  <p className="text-xs text-stone-500">{story.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <div className="bg-[#14532D] text-white rounded-lg p-10 sm:p-14 space-y-4 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Stay in touch with homes.
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Receive weekly curated property arrivals and thoughtful real estate insights.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto flex gap-2 pt-2">
            <label htmlFor="home-newsletter-email" className="sr-only">Email address for property updates</label>
            <input
              id="home-newsletter-email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-emerald-200/60 text-xs sm:text-sm focus:outline-none focus:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-md bg-white text-[#14532D] font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-colors focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};
