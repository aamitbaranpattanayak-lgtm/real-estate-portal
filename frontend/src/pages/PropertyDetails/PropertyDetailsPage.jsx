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
  ArrowLeft
} from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-28 pb-20 max-w-7xl mx-auto px-6">
        <div className="h-96 w-full animate-shimmer rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-stone-200 rounded-xl animate-shimmer" />
            <div className="h-6 w-1/2 bg-stone-200 rounded-xl animate-shimmer" />
          </div>
          <div className="h-64 bg-stone-200 rounded-3xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-36 pb-20 text-center max-w-md mx-auto px-4">
        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">Property Not Found</h2>
          <p className="text-stone-500 text-xs">{error || 'The property listing you are looking for does not exist.'}</p>
          <Link
            to="/properties"
            className="inline-block px-6 py-3 rounded-xl bg-[#14532D] text-white font-bold text-xs shadow-xs"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-28 pb-20 text-[#111827]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#14532D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Properties
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs hover:bg-stone-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={handleFavoriteToggle}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                fav
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-rose-50 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-white' : ''}`} />
              {fav ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Hero Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
          <div className="lg:col-span-2 relative h-[440px] rounded-3xl overflow-hidden shadow-sm bg-stone-200">
            <img
              src={property.image || DEFAULT_IMAGE}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {property.featured && (
                <span className="bg-[#14532D] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  Featured Home
                </span>
              )}
              <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
            </div>
          </div>

          <div className="hidden lg:grid grid-rows-2 gap-4 h-[440px]">
            <div className="rounded-3xl overflow-hidden bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop"
                alt="Interior"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-3xl overflow-hidden bg-stone-200">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop"
                alt="Living Space"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Details & Owner Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Title & Price Header */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-[#14532D] text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                      {property.propertyType}
                    </span>
                    {property.status && property.status !== 'available' && (
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider ${
                        property.status === 'sold'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {property.status}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-2">
                    {property.title}
                  </h1>
                  <p className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#14532D]" />
                    {property.address}, {property.city}, {property.state}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Price</span>
                  <p className="text-3xl font-bold text-[#14532D]">
                    {formatPrice(property.price, property.purpose)}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-100 text-stone-700">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-50/50 border border-stone-100">
                  <Bed className="w-5 h-5 text-[#14532D]" />
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Bedrooms</p>
                    <p className="font-bold text-stone-900 text-sm">{property.bedrooms} BHK</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-50/50 border border-stone-100">
                  <Bath className="w-5 h-5 text-[#14532D]" />
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Bathrooms</p>
                    <p className="font-bold text-stone-900 text-sm">{property.bathrooms} Baths</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-50/50 border border-stone-100">
                  <Square className="w-5 h-5 text-[#14532D]" />
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Area</p>
                    <p className="font-bold text-stone-900 text-sm">{property.area} sq.ft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <h3 className="text-xl font-bold text-stone-900">About this home</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <h3 className="text-xl font-bold text-stone-900">Features & Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(property.amenities && property.amenities.length > 0
                  ? property.amenities
                  : [
                      '24/7 Security Guards',
                      '100% Power Backup',
                      'Covered Car Parking',
                      'Modular Fitted Kitchen',
                      'High-Speed Elevators',
                      'Clubhouse & Gym',
                      'Swimming Pool Access',
                      'Vastu Compliant',
                    ]
                ).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-stone-700 p-2.5 rounded-xl bg-stone-50">
                    <Check className="w-3.5 h-3.5 text-[#14532D]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Owner Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-6 sticky top-28">
              
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#14532D] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Verified Owner Listing
              </div>

              <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="w-11 h-11 rounded-full bg-[#14532D] text-white flex items-center justify-center font-bold text-sm">
                  {property.ownerName?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{property.ownerName}</h4>
                  <p className="text-[11px] text-stone-400">Property Representative</p>
                </div>
              </div>

              <button
                onClick={() => setContactModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all"
              >
                Contact Owner
              </button>

              <p className="text-[11px] text-stone-400 text-center pt-2 border-t border-stone-100">
                Listed on HAVEN • Verified Documentation
              </p>

            </div>
          </div>

        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-8">
              Similar properties in {property.city}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProperties.map((simProp) => (
                <PropertyCard key={simProp._id} property={simProp} />
              ))}
            </div>
          </div>
        )}

      </div>

      <ContactOwnerModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        propertyId={property._id}
        ownerData={contactData || { ownerName: property.ownerName, ownerEmail: property.ownerEmail, ownerPhone: property.ownerPhone }}
        propertyTitle={property.title}
      />
    </div>
  );
};
