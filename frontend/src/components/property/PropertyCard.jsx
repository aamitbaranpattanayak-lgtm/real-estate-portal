import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoriteContext';
import { formatPrice } from '../../utils/formatters';
import { Heart, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop";

export const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fav = isFavorite(property._id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggleFavorite(property);
    if (res?.requireAuth) {
      navigate('/login');
    }
  };

  // Price per square foot calculation for sale properties
  const pricePerSqFt = property.area && property.purpose === 'sale' && property.price
    ? Math.round(property.price / property.area)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group bg-white rounded-lg border border-stone-200 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Architectural Image Container */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-stone-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-shimmer" />
        )}

        <img
          src={imageError || !property.image ? DEFAULT_IMAGE : property.image}
          alt={property.title}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Subtle Top Scrim for Badges */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-stone-950/40 to-transparent pointer-events-none" />

        {/* Top Badges & Heart Action */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {property.featured && (
              <span className="bg-[#14532D] text-white text-xs font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs">
                Featured
              </span>
            )}
            <span className="bg-[#FBFBF9]/95 text-stone-900 text-xs font-semibold px-2.5 py-0.5 rounded-sm uppercase tracking-wider shadow-xs border border-stone-200/90">
              {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
            {property.status && property.status !== 'available' && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs ${
                property.status === 'sold'
                  ? 'bg-rose-700 text-white'
                  : 'bg-amber-700 text-white'
              }`}>
                {property.status}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleFavoriteClick}
            className={`pointer-events-auto p-2 rounded-md transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#14532D] ${
              fav
                ? 'bg-rose-600 text-white'
                : 'bg-white/90 text-stone-700 hover:bg-white hover:text-rose-600'
            }`}
            aria-label={fav ? `Remove ${property.title} from favorites` : `Save ${property.title} to favorites`}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
          </motion.button>
        </div>

        {/* Property Type Architectural Indicator */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="bg-stone-900/85 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-0.5 rounded-sm uppercase tracking-wider border border-white/10">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Editorial Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Price & Rate Presentation */}
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                {formatPrice(property.price, property.purpose)}
              </span>
              {property.purpose === 'rent' && (
                <span className="text-xs text-stone-500 font-medium ml-1">/ month</span>
              )}
            </div>

            {pricePerSqFt ? (
              <span className="text-xs text-stone-500 font-medium" title="Calculated rate per square foot">
                ₹{pricePerSqFt.toLocaleString('en-IN')}/sq.ft
              </span>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {property.city}
              </span>
            )}
          </div>

          {/* Title Link */}
          <Link 
            to={`/properties/${property._id}`} 
            className="block group/title focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs"
          >
            <h3 className="text-base font-semibold text-stone-900 line-clamp-1 group-hover/title:text-[#14532D] transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <p className="flex items-center gap-1.5 text-xs text-stone-600 line-clamp-1 font-normal">
            <MapPin className="w-3.5 h-3.5 text-[#14532D] flex-shrink-0" />
            <span>{property.address}, {property.city}</span>
          </p>
        </div>

        {/* Monograph Specifications Ribbon */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-700">
          <div className="flex items-center gap-2 font-medium">
            <span>{property.bedrooms} Beds</span>
            <span className="text-stone-300">•</span>
            <span>{property.bathrooms} Baths</span>
            <span className="text-stone-300">•</span>
            <span>{property.area?.toLocaleString('en-IN')} sq.ft</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider ${
            property.status === 'sold'
              ? 'text-rose-700'
              : property.status === 'rented'
              ? 'text-amber-700'
              : 'text-[#14532D]'
          }`}>
            {property.status === 'available' ? 'Verified Direct' : property.status || 'Available'}
          </span>

          <Link
            to={`/properties/${property._id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-[#14532D] transition-colors group/link focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs"
          >
            <span>View Residence</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>

      </div>
    </motion.article>
  );
};
