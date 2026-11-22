import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoriteContext';
import { formatPrice } from '../../utils/formatters';
import { Heart, MapPin, Bed, Bath, Square, ArrowRight } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl border border-stone-200/70 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Image Banner */}
      <div className="relative w-full h-64 overflow-hidden bg-stone-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-shimmer" />
        )}

        <img
          src={imageError || !property.image ? DEFAULT_IMAGE : property.image}
          alt={property.title}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Top Badges & Heart */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {property.featured && (
              <span className="bg-[#14532D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                Featured
              </span>
            )}
            <span className="bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
            {property.status && property.status !== 'available' && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                property.status === 'sold'
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}>
                {property.status}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleFavoriteClick}
            className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
              fav
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 text-stone-700 hover:bg-white hover:text-rose-500'
            }`}
            aria-label="Save property"
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
          </motion.button>
        </div>

        {/* Property Type Badge */}
        <div className="absolute bottom-3 left-4">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">
              {formatPrice(property.price, property.purpose)}
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              {property.city}
            </span>
          </div>

          <Link to={`/properties/${property._id}`} className="block">
            <h4 className="text-base font-semibold text-stone-800 line-clamp-1 group-hover:text-[#14532D] transition-colors">
              {property.title}
            </h4>
          </Link>

          <p className="flex items-center gap-1.5 text-xs text-stone-500 line-clamp-1 font-normal">
            <MapPin className="w-3.5 h-3.5 text-[#14532D] flex-shrink-0" />
            {property.address}, {property.city}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 text-xs text-stone-600 font-medium">
          <div className="flex items-center gap-1.5 justify-center py-1.5 rounded-lg bg-stone-50">
            <Bed className="w-3.5 h-3.5 text-[#14532D]" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center py-1.5 rounded-lg bg-stone-50">
            <Bath className="w-3.5 h-3.5 text-[#14532D]" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center py-1.5 rounded-lg bg-stone-50">
            <Square className="w-3.5 h-3.5 text-[#14532D]" />
            <span>{property.area} sq.ft</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="flex items-center justify-between pt-1">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            property.status === 'sold'
              ? 'text-rose-600'
              : property.status === 'rented'
              ? 'text-amber-600'
              : 'text-stone-400'
          }`}>
            {property.status || 'Available'}
          </span>
          <Link
            to={`/properties/${property._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14532D] hover:text-[#166534] transition-colors group/btn"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>

      </div>
    </motion.div>
  );
};
