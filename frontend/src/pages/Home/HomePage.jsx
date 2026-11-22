import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { PropertyCard } from '../../components/property/PropertyCard';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { formatPrice, calculatePricingMetrics, formatPropertySpecifications } from '../../utils/formatters';
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  ArrowUpRight, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Building2,
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

  // Filter properties from live MongoDB dataset
  const featuredProperties = properties.filter((p) => p.featured === true);
  const leadFeatured = featuredProperties[0] || properties[0] || null;
  const supportingFeatured = featuredProperties.slice(1, 3).length > 0
    ? featuredProperties.slice(1, 3)
    : properties.slice(1, 3);

  // Curated collections based on actual property types and purposes
  const architecturalHomes = properties.filter((p) => 
    ['villa', 'bungalow', 'penthouse'].includes(p.propertyType)
  ).slice(0, 3);

  const urbanFlats = properties.filter((p) => 
    ['apartment', 'flat'].includes(p.propertyType)
  ).slice(0, 3);

  const rentalResidences = properties.filter((p) => 
    p.purpose === 'rent'
  ).slice(0, 3);

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
    <div className="min-h-screen bg-[#FBFBF9] text-stone-900">
      
      {/* ========================================================================= */}
      {/* PHASE 1B: ASYMMETRIC ARCHITECTURAL HERO SECTION                           */}
      {/* ========================================================================= */}
      <section className="pt-32 pb-20 border-b border-stone-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT COLUMN: Editorial Narrative & Search Console (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#14532D] block">
                  Curated Real Estate Catalog • 2026
                </span>
                
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1]">
                  Architecture crafted for modern living.
                </h1>
                
                <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed font-normal">
                  A curated collection of thoughtfully planned apartments, private villas, and urban penthouses across India's major enclaves. Direct owner representations with certified spatial metrics.
                </p>
              </div>

              {/* INTEGRATED ARCHITECTURAL SEARCH EXPERIENCE */}
              <div className="pt-2">
                <div className="bg-white rounded-lg border border-stone-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                  
                  {/* Purpose Switch */}
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-3" role="group" aria-label="Transaction Purpose">
                    <button
                      type="button"
                      onClick={() => setPurpose('sale')}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer ${
                        purpose === 'sale'
                          ? 'bg-[#14532D] text-white shadow-xs'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Buy Residences
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurpose('rent')}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer ${
                        purpose === 'rent'
                          ? 'bg-[#14532D] text-white shadow-xs'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Lease & Rent
                    </button>
                  </div>

                  {/* Search Inputs */}
                  <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <div className="space-y-1">
                      <label htmlFor="home-search-city" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                        Location
                      </label>
                      <select
                        id="home-search-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
                      >
                        <option value="">All Locations</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi-NCR">Delhi NCR</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Goa">Goa</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="home-search-property-type" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                        Typology
                      </label>
                      <select
                        id="home-search-property-type"
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

                    <div className="space-y-1">
                      <label htmlFor="home-search-max-price" className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                        Max Budget (INR)
                      </label>
                      <input
                        id="home-search-max-price"
                        type="number"
                        min={0}
                        placeholder="e.g. 15000000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full p-2.5 rounded-md border border-stone-200 bg-stone-50/60 text-xs font-semibold text-stone-900 focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                      />
                    </div>

                    <div className="sm:col-span-3 pt-1">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-6 rounded-md bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search Curated Residences</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Verified Editorial Trust Ribbon */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-stone-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#14532D]" />
                  <span>Direct Owner Inquiries</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#14532D]" />
                  <span>Documented Spatial Metrics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#14532D]" />
                  <span>Zero Intermediary Markups</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Featured Property Architectural Photograph (5 Cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-lg overflow-hidden border border-stone-200 shadow-md bg-stone-100 aspect-[4/5] max-h-[580px] w-full">
                <img
                  src={leadFeatured?.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop"}
                  alt={leadFeatured?.title || "Featured Architecture"}
                  className="w-full h-full object-cover"
                />

                {/* Subtle Editorial Framing Border */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none" />

                {/* Live Property Caption Card */}
                {leadFeatured && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-md p-4 border border-stone-200/90 shadow-lg text-stone-900">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                          Featured Property
                        </span>
                        <h2 className="font-serif text-base font-bold text-stone-900 line-clamp-1 mt-0.5">
                          {leadFeatured.title}
                        </h2>
                        <p className="text-xs text-stone-500 font-medium">
                          {leadFeatured.city} • {formatPropertySpecifications(leadFeatured).ribbonText}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-serif text-lg font-bold text-stone-900 block">
                          {formatPrice(leadFeatured.price, leadFeatured.purpose)}
                        </span>
                        <Link
                          to={`/properties/${leadFeatured._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#14532D] hover:underline mt-1"
                        >
                          Explore <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHASE 2A: ASYMMETRIC FEATURED PROPERTY SPREAD                             */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#14532D] mb-1.5 block">
              Architectural Spread
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Featured Residences
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 font-normal">
              Distinctive spaces verified for design integrity and certified direct ownership.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 hover:text-[#14532D] transition-colors group"
          >
            <span>View Full Collection</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={3} />
        ) : leadFeatured ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 2/3 Composition: Expansive Lead Property */}
            <div className="lg:col-span-8">
              <motion.article 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-stone-100">
                  <img
                    src={leadFeatured.image}
                    alt={leadFeatured.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-[#14532D] text-white text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                      Featured Property
                    </span>
                    <span className="bg-white/95 text-stone-900 text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider border border-stone-200/90">
                      {leadFeatured.purpose === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone-100 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        {leadFeatured.propertyType} • {leadFeatured.city}
                      </span>
                      <Link to={`/properties/${leadFeatured._id}`} className="block focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs mt-1">
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 group-hover:text-[#14532D] transition-colors">
                          {leadFeatured.title}
                        </h3>
                      </Link>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                        {formatPrice(leadFeatured.price, leadFeatured.purpose)}
                      </span>
                      {(() => {
                        const leadMetrics = calculatePricingMetrics(
                          leadFeatured.price,
                          leadFeatured.purpose,
                          leadFeatured.carpetArea,
                          leadFeatured.area
                        );
                        return leadMetrics.pricePerSqFt ? (
                          <p className="text-xs text-stone-500 font-medium">
                            {leadMetrics.pricePerSqFt.toLocaleString('en-IN')} {leadMetrics.unit} ({leadMetrics.basis})
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                    {leadFeatured.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-stone-700 font-medium">
                      <span>{formatPropertySpecifications(leadFeatured).ribbonText}</span>
                    </div>

                    <Link
                      to={`/properties/${leadFeatured._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#14532D] text-white font-bold text-xs hover:bg-[#166534] transition-colors"
                    >
                      <span>View Property</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            </div>

            {/* 1/3 Composition: Two Supporting Residences */}
            <div className="lg:col-span-4 space-y-6">
              {supportingFeatured.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>

          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-lg border border-stone-200">
            <p className="text-stone-500 text-xs font-semibold">No featured residences available.</p>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* PHASE 2B: CURATED PROPERTY COLLECTIONS                                    */}
      {/* ========================================================================= */}
      
      {/* COLLECTION 1: ARCHITECTURE WORTH DISCOVERING (Villas & Penthouses) */}
      {architecturalHomes.length > 0 && (
        <section className="py-20 bg-stone-100/70 border-y border-stone-200/80">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#14532D] mb-1 block">
                  Collection 01
                </span>
                <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
                  Architecture Worth Discovering
                </h2>
                <p className="text-xs text-stone-500 mt-1">Standalone villas, private bungalows, and panoramic penthouses.</p>
              </div>
              <Link
                to="/properties?propertyType=villa"
                className="text-xs font-bold text-[#14532D] hover:underline inline-flex items-center gap-1"
              >
                <span>View Villas & Penthouses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {architecturalHomes.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COLLECTION 2: CONTEMPORARY URBAN RESIDENCES (Apartments & Flats) */}
      {urbanFlats.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-1 block">
                Collection 02
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
                Contemporary Urban Residences
              </h2>
              <p className="text-xs text-stone-500 mt-1">Efficient, modern flats and apartments near key metropolitan centers.</p>
            </div>
            <Link
              to="/properties?propertyType=apartment"
              className="text-xs font-bold text-stone-800 hover:text-[#14532D] inline-flex items-center gap-1"
            >
              <span>Explore Urban Living</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {urbanFlats.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* COLLECTION 3: VERIFIED LEASE & RENTAL PORTFOLIO */}
      {rentalResidences.length > 0 && (
        <section className="py-20 bg-white border-t border-stone-200/80">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#14532D] mb-1 block">
                  Collection 03
                </span>
                <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
                  Verified Rental Residences
                </h2>
                <p className="text-xs text-stone-500 mt-1">Direct long-term leases with transparent monthly terms and verified amenities.</p>
              </div>
              <Link
                to="/properties?purpose=rent"
                className="text-xs font-bold text-[#14532D] hover:underline inline-flex items-center gap-1"
              >
                <span>View All Rentals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rentalResidences.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* METROPOLITAN ENCLAVES / GEOGRAPHY                                        */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#14532D] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-xl mb-10">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-[0.2em] mb-1 block">
              Geography
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Metropolitan Enclaves
            </h2>
            <p className="text-xs text-emerald-100 mt-1">Explore residences in India's leading economic and cultural centers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'Bengaluru', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&auto=format&fit=crop' },
              { name: 'Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&auto=format&fit=crop' },
              { name: 'Delhi-NCR', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format&fit=crop' },
              { name: 'Hyderabad', img: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=500&auto=format&fit=crop' },
              { name: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop' },
            ].map((cityItem) => (
              <Link
                key={cityItem.name}
                to={`/properties?city=${cityItem.name}`}
                className="group relative h-60 rounded-md overflow-hidden border border-white/10 shadow-md focus-visible:ring-2 focus-visible:ring-white"
              >
                <img
                  src={cityItem.img}
                  alt={cityItem.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {cityItem.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHASE 6: AUTHENTIC ARCHITECTURAL STANDARDS (REPLACES FAKE REVIEWS)        */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <span className="text-xs font-bold text-[#14532D] uppercase tracking-[0.2em] block">
            The HAVEN Principles
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Curated standards. Direct integrity.
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Eliminating broker noise, deceptive wide-angle distortion, and automated phone spam through transparent property cataloging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Direct Representation',
              desc: 'Every listed residence connects directly with certified owners or authorized legal representatives, eliminating opaque commission markups.',
            },
            {
              title: 'Analytical Pricing',
              desc: 'Live price-per-square-foot ratios calculated directly from verified dimensions, enabling objective valuation comparisons.',
            },
            {
              title: 'Quiet Interaction',
              desc: 'No intrusive popups, synthetic urgency timers, or forced data gates. Discover and evaluate residences on your own terms.',
            },
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-md bg-white border border-stone-200/90 space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-md bg-stone-100 text-[#14532D] flex items-center justify-center font-bold text-xs">
                <Check className="w-4 h-4 text-[#14532D]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">{item.title}</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* EDITORIAL DISPATCH / NEWSLETTER                                           */}
      {/* ========================================================================= */}
      <section className="py-20 border-t border-stone-200 bg-stone-100/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 block">
            The Architectural Dispatch
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Receive weekly curated arrivals.
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            New architectural residences and verified market additions delivered directly to your inbox.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto flex gap-2 pt-2">
            <label htmlFor="home-newsletter-email" className="sr-only">Email address for property updates</label>
            <input
              id="home-newsletter-email"
              type="email"
              placeholder="Enter your email address"
              className="w-full px-4 py-2.5 rounded-md bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-none focus:border-[#14532D] focus-visible:ring-2 focus-visible:ring-[#14532D]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-md bg-[#14532D] text-white font-bold text-xs sm:text-sm hover:bg-[#166534] transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};
