import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { useFavorites } from '../../context/FavoriteContext';
import { formatPrice } from '../../utils/formatters';
import { ContactOwnerModal } from '../../components/property/ContactOwnerModal';
import { PropertyCard } from '../../components/property/PropertyCard';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  ShieldCheck, 
  Share2, 
  Check, 
  ArrowLeft,
  Maximize2,
  X,
  Phone,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop";

export const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await propertyService.getPropertyById(id);
        if (res.success && res.data) {
          setProperty(res.data);
          
          try {
            const contactRes = await propertyService.contactOwner(id);
            if (contactRes.success) {
              setContactData(contactRes.data);
            }
          } catch (cErr) {
            setContactData({
              ownerName: res.data.ownerName,
              ownerEmail: res.data.ownerEmail,
              ownerPhone: res.data.ownerPhone,
            });
          }

          // Fetch similar residences in the same metropolitan area
          const allRes = await propertyService.getProperties({ city: res.data.city });
          if (allRes.success && Array.isArray(allRes.data)) {
            setSimilarProperties(allRes.data.filter((p) => p._id !== id).slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Error loading property details:', err);
        setError(err.message || 'Property not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fav = isFavorite(property?._id);

  const handleFavoriteToggle = async () => {
    if (!property) return;
    const res = await toggleFavorite(property);
    if (res?.requireAuth) {
      navigate('/login');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Analytical Price per sq.ft calculation
  const pricePerSqFt = property?.area && property.price
    ? Math.round(property.price / property.area)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] pt-28 pb-20 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="h-96 w-full animate-shimmer rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-stone-200 rounded-md animate-shimmer" />
            <div className="h-6 w-1/2 bg-stone-200 rounded-md animate-shimmer" />
          </div>
          <div className="h-64 bg-stone-200 rounded-lg animate-shimmer" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] pt-36 pb-20 text-center max-w-md mx-auto px-4">
        <div className="bg-white p-8 rounded-lg border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Residence Not Found</h2>
          <p className="text-stone-600 text-xs sm:text-sm">{error || 'The property listing you are seeking does not exist or has been archived.'}</p>
          <Link
            to="/properties"
            className="inline-block px-6 py-2.5 rounded-md bg-[#14532D] text-white font-bold text-xs shadow-xs focus-visible:ring-2 focus-visible:ring-[#14532D]"
          >
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] pt-28 pb-20 text-stone-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-[#14532D] transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Residences
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-500">{property.city}</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 font-bold max-w-[200px] sm:max-w-xs truncate">{property.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
              aria-label="Share property link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
            <button
              onClick={handleFavoriteToggle}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer ${
                fav
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-rose-50 hover:text-rose-600'
              }`}
              aria-label={fav ? "Remove from saved collection" : "Save to collection"}
            >
              <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-white' : ''}`} />
              <span>{fav ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ARCHITECTURAL IMAGE GALLERY                                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          
          {/* Main Lead Monograph Photo (8 Cols) */}
          <div className="lg:col-span-8 relative aspect-[16/10] rounded-lg overflow-hidden border border-stone-200 shadow-sm bg-stone-100 group">
            <img
              src={property.image || DEFAULT_IMAGE}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />
            
            <div className="absolute top-4 left-4 flex gap-2">
              {property.featured && (
                <span className="bg-[#14532D] text-white text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-xs">
                  Featured Monograph
                </span>
              )}
              <span className="bg-[#FBFBF9]/95 text-stone-900 text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider border border-stone-200/90 shadow-xs">
                {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-stone-800 p-2.5 rounded-md shadow-md backdrop-blur-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
              aria-label="Expand image to fullscreen lightbox"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary Monograph Pair (4 Cols) */}
          <div className="hidden lg:grid grid-rows-2 gap-4 lg:col-span-4">
            <div className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-100 h-full">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop"
                alt="Interior Living Space"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-3 left-3 bg-stone-900/80 text-white text-xs font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                Interior
              </span>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-100 h-full">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop"
                alt="Architectural Detailing"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-3 left-3 bg-stone-900/80 text-white text-xs font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                Elevation
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* PROPERTY DETAILS & DIRECT OWNER REPRESENTATIVE                            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Specifications & Narrative (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Block: Title, Location & Price */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-100 pb-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-100 text-stone-800 text-xs font-bold px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                      {property.propertyType}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      property.status === 'sold'
                        ? 'bg-rose-50 text-rose-700'
                        : property.status === 'rented'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-[#14532D]'
                    }`}>
                      {property.status === 'available' ? 'Available' : property.status || 'Available'}
                    </span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
                    {property.title}
                  </h1>

                  <p className="flex items-center gap-1.5 text-xs text-stone-600 font-medium pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#14532D] flex-shrink-0" />
                    <span>{property.address}, {property.city}, {property.state}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right flex-shrink-0">
                  <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">
                    Listing Price
                  </span>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                    {formatPrice(property.price, property.purpose)}
                  </p>
                  {property.purpose === 'rent' ? (
                    <span className="text-xs text-stone-500 font-medium">Monthly Rental</span>
                  ) : pricePerSqFt ? (
                    <span className="text-xs text-[#14532D] font-bold">
                      ₹{pricePerSqFt.toLocaleString('en-IN')} / sq.ft
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Architectural Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-stone-700">
                <div className="p-3.5 rounded-md bg-stone-50 border border-stone-200/70">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Bedrooms</p>
                  <p className="font-serif text-xl font-bold text-stone-900 mt-1">{property.bedrooms} BHK</p>
                </div>
                <div className="p-3.5 rounded-md bg-stone-50 border border-stone-200/70">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Bathrooms</p>
                  <p className="font-serif text-xl font-bold text-stone-900 mt-1">{property.bathrooms} Baths</p>
                </div>
                <div className="p-3.5 rounded-md bg-stone-50 border border-stone-200/70">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Floor Area</p>
                  <p className="font-serif text-xl font-bold text-stone-900 mt-1">{property.area?.toLocaleString('en-IN')} sq.ft</p>
                </div>
                <div className="p-3.5 rounded-md bg-stone-50 border border-stone-200/70">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Typology</p>
                  <p className="font-serif text-xl font-bold text-stone-900 mt-1 capitalize">{property.propertyType}</p>
                </div>
              </div>
            </div>

            {/* Architectural Monograph Description */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
                  Monograph Statement
                </span>
                <span className="text-stone-300">•</span>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  About this Residence
                </h2>
              </div>
              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                {property.description}
              </p>
            </div>

            {/* Authentic Amenities Grid (from MongoDB dataset) */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] block">
                  Documented Amenities
                </span>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Residence Features & Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {(property.amenities && property.amenities.length > 0
                  ? property.amenities
                  : [
                      '24/7 Security Personnel',
                      '100% Power Backup',
                      'Covered Car Parking',
                      'Modular Fitted Kitchen',
                      'High-Speed Elevators',
                      'Clubhouse & Fitness Studio',
                      'Swimming Pool Access',
                      'Vastu Compliant Layout',
                    ]
                ).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-md bg-stone-50 border border-stone-100 text-xs font-semibold text-stone-800">
                    <Check className="w-4 h-4 text-[#14532D] flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Direct Representative Card (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm space-y-5 sticky top-28">
              
              <div className="flex items-center gap-2 text-xs font-bold text-[#14532D] uppercase tracking-wider border-b border-stone-100 pb-3">
                <ShieldCheck className="w-4 h-4" /> Direct Owner Representation
              </div>

              {/* Representative Information */}
              <div className="flex items-center gap-3.5 p-4 bg-stone-50 rounded-md border border-stone-200/80">
                <div className="w-11 h-11 rounded-md bg-[#14532D] text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
                  {property.ownerName?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">{property.ownerName}</h3>
                  <p className="text-xs text-stone-500 font-medium">Direct Property Representative</p>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="w-full py-3 rounded-md bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
              >
                <span>Inquire With Owner Directly</span>
              </button>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#14532D]" />
                  <span>Direct submission without broker fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#14532D]" />
                  <span>Direct phone & email communication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#14532D]" />
                  <span>Verified listing authenticity</span>
                </div>
              </div>

            </div>
          </aside>

        </div>

        {/* ========================================================================= */}
        {/* SIMILAR RESIDENCES IN SAME REGION                                        */}
        {/* ========================================================================= */}
        {similarProperties.length > 0 && (
          <section className="mt-24 pt-16 border-t border-stone-200">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#14532D] block">
                Regional Monograph
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
                Similar Residences in {property.city}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProperties.map((simProp) => (
                <PropertyCard key={simProp._id} property={simProp} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Direct Contact Modal */}
      <ContactOwnerModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        propertyId={property._id}
        ownerData={contactData || { ownerName: property.ownerName, ownerEmail: property.ownerEmail, ownerPhone: property.ownerPhone }}
        propertyTitle={property.title}
      />

      {/* Accessible Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Expanded Image View">
            <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300 rounded-md focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                aria-label="Close fullscreen view"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={property.image || DEFAULT_IMAGE}
                alt={property.title}
                className="w-full max-h-[80vh] object-contain rounded-md"
              />
              <p className="text-white text-xs mt-3 font-semibold font-serif">
                {property.title} • {property.city}
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
