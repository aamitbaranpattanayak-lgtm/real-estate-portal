import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { useFavorites } from '../../context/FavoriteContext';
import { 
  formatPrice, 
  calculatePricingMetrics, 
  resolveVerificationBadge,
  formatPropertySpecifications,
  getDetailedSpecifications,
  capitalize 
} from '../../utils/formatters';
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
  Sparkles,
  Compass,
  Layers,
  Car,
  FileText,
  AlertCircle,
  Building,
  Printer,
  ChevronLeft,
  ChevronRight
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

  // Gallery view state
  const [activeMediaIndex, setActiveMediaIndex] = useState(0); // index in allImages or 'floorPlan'
  const [viewingFloorPlan, setViewingFloorPlan] = useState(false);

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
      setActiveMediaIndex(0);
      setViewingFloorPlan(false);
    }
  }, [id]);

  // Media Gallery Assembly (Declared before any early returns to satisfy React Rules of Hooks)
  const galleryImages = [
    property?.image,
    ...(Array.isArray(property?.images) ? property.images : [])
  ].filter((img, idx, arr) => img && arr.indexOf(img) === idx);

  // Keyboard navigation for Lightbox modal (Hook called unconditionally)
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        if (!viewingFloorPlan && galleryImages.length > 1) {
          setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
        }
      } else if (e.key === 'ArrowRight') {
        if (!viewingFloorPlan && galleryImages.length > 1) {
          setActiveMediaIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, viewingFloorPlan, galleryImages.length]);

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

  // P2 Pricing & Area Intelligence Calculations
  const pricingMetrics = calculatePricingMetrics(
    property.price,
    property.purpose,
    property.carpetArea,
    property.area
  );

  // P2 Adaptive Specifications & RERA Workflow
  const specs = formatPropertySpecifications(property);
  const detailedSpecs = getDetailedSpecifications(property);
  const verification = resolveVerificationBadge(property.verificationStatus, property.reraNumber);

  const currentDisplayImage = viewingFloorPlan
    ? property.floorPlan || DEFAULT_IMAGE
    : galleryImages[activeMediaIndex] || property.image || DEFAULT_IMAGE;

  // Space efficiency ratio (Carpet Area vs Super Built-up / General Area) with sanity bounding
  const totalAreaBasis = property.superBuiltUpArea || property.area;
  const spatialEfficiency = property.carpetArea && totalAreaBasis && property.carpetArea <= totalAreaBasis
    ? Math.round((property.carpetArea / totalAreaBasis) * 100)
    : null;

  return (
    <div className="min-h-screen bg-[#FBFBF9] pt-28 pb-20 text-stone-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Printable Monograph Letterhead (Visible ONLY in print / PDF generation) */}
        <div className="hidden print:block mb-8 pb-4 border-b-2 border-stone-900">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-serif text-2xl font-black tracking-widest uppercase">HAVEN</span>
              <span className="block text-[10px] uppercase tracking-wider text-stone-600">Architectural Real Estate Monograph</span>
            </div>
            <div className="text-right text-[10px] text-stone-500">
              <div>Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <div>Reference ID: {property._id}</div>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 no-print">
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
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-xs hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
              aria-label="Print or save architectural monograph specification"
              title="Print / Save Monograph PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Monograph PDF</span>
            </button>
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
        {/* P2 ARCHITECTURAL MULTI-IMAGE GALLERY & FLOOR PLAN VIEWER                  */}
        {/* ========================================================================= */}
        <div className="space-y-3 mb-10">
          
          {/* Gallery View Controls (Media Switcher) */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-2 no-print">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewingFloorPlan(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  !viewingFloorPlan
                    ? 'bg-[#14532D] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                Photography ({galleryImages.length})
              </button>

              {property.floorPlan && (
                <button
                  type="button"
                  onClick={() => setViewingFloorPlan(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    viewingFloorPlan
                      ? 'bg-[#14532D] text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Floor Plan
                </button>
              )}
            </div>

            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              {viewingFloorPlan ? 'Architectural Floor Layout' : `Showing photo ${activeMediaIndex + 1} of ${galleryImages.length}`}
            </span>
          </div>

          {/* Main Large Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Primary Viewport (8 cols in screen, full width in print) */}
            <div className="lg:col-span-8 print:col-span-12 relative aspect-[16/10] rounded-lg overflow-hidden border border-stone-200 shadow-sm bg-stone-100 group">
              <img
                src={currentDisplayImage}
                alt={viewingFloorPlan ? `${property.title} Floor Plan` : property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              />
              
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {property.featured && (
                  <span className="bg-[#14532D] text-white text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-xs">
                    Featured
                  </span>
                )}
                <span className="bg-[#FBFBF9]/95 text-stone-900 text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider border border-stone-200/90 shadow-xs">
                  {property.purpose === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
                {verification.isVerified && (
                  <span className="bg-emerald-800 text-white text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    RERA Verified
                  </span>
                )}
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

            {/* Thumbnail Strip / Secondary Views (4 cols) */}
            <div className="lg:col-span-4 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-print">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setViewingFloorPlan(false);
                    setActiveMediaIndex(idx);
                  }}
                  className={`relative rounded-md overflow-hidden border transition-all cursor-pointer aspect-[16/10] flex-shrink-0 w-32 sm:w-40 lg:w-full lg:h-32 bg-stone-100 ${
                    !viewingFloorPlan && activeMediaIndex === idx
                      ? 'border-[#14532D] ring-2 ring-[#14532D]'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Perspective ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-stone-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
                    {idx === 0 ? 'Primary' : `Angle 0${idx + 1}`}
                  </span>
                </button>
              ))}

              {property.floorPlan && (
                <button
                  type="button"
                  onClick={() => setViewingFloorPlan(true)}
                  className={`relative rounded-md overflow-hidden border transition-all cursor-pointer aspect-[16/10] flex-shrink-0 w-32 sm:w-40 lg:w-full lg:h-32 bg-stone-100 ${
                    viewingFloorPlan
                      ? 'border-[#14532D] ring-2 ring-[#14532D]'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={property.floorPlan}
                    alt="Floor Plan Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-[#14532D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-2.5 h-2.5" /> Floor Plan
                  </span>
                </button>
              )}
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
                    Listing Valuation
                  </span>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                    {formatPrice(property.price, property.purpose)}
                  </p>
                  {pricingMetrics.pricePerSqFt ? (
                    <div className="mt-1">
                      <span className="text-xs text-[#14532D] font-bold block">
                        {pricingMetrics.pricePerSqFt.toLocaleString('en-IN')} {pricingMetrics.unit}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Based on {pricingMetrics.basis}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SPECIFICATIONS: REFINED NUMERICAL HIERARCHY                               */}
            {/* ========================================================================= */}
            {detailedSpecs.numericalSpecs.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs space-y-6">
                <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    Specifications
                  </h2>
                  {spatialEfficiency && (
                    <span
                      className="bg-emerald-50 text-[#14532D] text-xs font-bold px-3 py-1 rounded-full border border-emerald-200"
                      title="Carpet Area to Super Built-up Area Ratio"
                    >
                      {spatialEfficiency}% Space Efficiency
                    </span>
                  )}
                </div>

                {/* Primary Numerical Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {detailedSpecs.numericalSpecs.map((spec, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-md bg-stone-50 border border-stone-200/80 flex flex-col justify-between"
                    >
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                          {spec.value}
                        </span>
                        {spec.unit && (
                          <span className="text-xs text-stone-500 font-semibold">{spec.unit}</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                          {spec.label}
                        </span>
                        {spec.highlight && (
                          <span className="text-[10px] bg-[#14532D] text-white px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-wider">
                            {spec.highlight}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Qualitative Specifications (Only rendered when present) */}
                {detailedSpecs.qualitativeSpecs.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2.5 text-xs">
                    {detailedSpecs.qualitativeSpecs.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-md bg-stone-100 text-stone-700 font-medium capitalize border border-stone-200/60"
                      >
                        <strong className="text-stone-900 font-semibold">{item.label}:</strong> {item.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* About the Residence */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  About the Residence
                </h2>
              </div>
              <div className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-prose space-y-3 font-normal whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Amenities
                </h2>
              </div>

              {property.amenities && property.amenities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {property.amenities.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 rounded-md bg-stone-50 border border-stone-100 text-xs sm:text-sm font-medium text-stone-800"
                    >
                      <Check className="w-4 h-4 text-[#14532D] flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-xs sm:text-sm italic py-2">
                  No specific amenities listed for this property.
                </p>
              )}
            </div>

            {/* ========================================================================= */}
            {/* P2 RERA & REGULATORY VERIFICATION CARD                                    */}
            {/* ========================================================================= */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    RERA & Title Verification Details
                  </h2>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-sm border uppercase tracking-wider ${verification.badgeClass}`}>
                  {verification.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                <div className="p-3.5 bg-stone-50 rounded-md border border-stone-200/70">
                  <p className="text-stone-500 font-bold uppercase tracking-wider text-[11px]">RERA Registration ID</p>
                  <p className="font-mono text-sm font-bold text-stone-900 mt-1 break-all">
                    {property.reraNumber || 'Not Disclosed / Exempt'}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-md border border-stone-200/70">
                  <p className="text-stone-500 font-bold uppercase tracking-wider text-[11px]">Regulatory State Authority</p>
                  <p className="text-sm font-bold text-stone-900 mt-1">
                    {property.reraAuthority || 'State Real Estate Regulatory Authority'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#14532D] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Verification Integrity Policy:</strong> HAVEN strictly distinguishes independent document audits from owner-supplied declarations. A property is labeled "RERA Verified" only when valid registration certificates have been verified against state regulatory portals.
                  </span>
                </p>
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
                  <span>Verified spatial measurements</span>
                </div>
              </div>

            </div>
          </aside>

        </div>

        {/* ========================================================================= */}
        {/* SIMILAR PROPERTIES IN SAME REGION                                        */}
        {/* ========================================================================= */}
        {similarProperties.length > 0 && (
          <section className="mt-24 pt-16 border-t border-stone-200 no-print print:hidden">
            <div className="mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Similar Properties in {property.city}
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
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md" 
            role="dialog" 
            aria-modal="true" 
            aria-label="Expanded Image View"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightboxOpen(false);
            }}
          >
            <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300 rounded-md focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                aria-label="Close fullscreen view (Press Escape)"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Prev / Next Chevrons (when photography mode with multiple images) */}
              {!viewingFloorPlan && galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                    className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-xs transition-all focus-visible:ring-2 focus-visible:ring-white cursor-pointer z-10"
                    aria-label="Previous photograph (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-xs transition-all focus-visible:ring-2 focus-visible:ring-white cursor-pointer z-10"
                    aria-label="Next photograph (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <img
                src={currentDisplayImage}
                alt={viewingFloorPlan ? `${property.title} Floor Plan` : property.title}
                className="w-full max-h-[80vh] object-contain rounded-md select-none"
              />
              <div className="flex items-center justify-between w-full mt-3 text-white text-xs font-semibold px-2">
                <span className="font-serif truncate max-w-md">
                  {property.title} • {property.city} {viewingFloorPlan ? '(Floor Plan Layout)' : ''}
                </span>
                {!viewingFloorPlan && galleryImages.length > 1 && (
                  <span className="text-stone-300 font-mono text-[11px] bg-stone-900/60 px-2 py-0.5 rounded-xs">
                    {activeMediaIndex + 1} / {galleryImages.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
