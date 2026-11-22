/**
 * Format currency in Indian Rupees
 * Handles Lakhs (L) and Crores (Cr) cleanly for real estate pricing, or standard format
 * Note: If purpose === 'rent', appends '/mo' exactly once.
 */
export const formatPrice = (price, purpose = '') => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  
  // For high-value purchase pricing:
  if (purpose !== 'rent') {
    if (price >= 10000000) {
      const cr = (price / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${cr} Cr`;
    }
    if (price >= 100000) {
      const lakh = (price / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakh} Lakh`;
    }
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  return purpose === 'rent' ? `${formatted}/mo` : formatted;
};

/**
 * Format full numbers with commas (en-IN)
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * P2 Real Estate Pricing & Rate per Square Foot Intelligence
 * Prioritizes Carpet Area when genuine data exists, falling back to Total Area with explicit attribution.
 */
export const calculatePricingMetrics = (price, purpose, carpetArea, totalArea) => {
  if (!price || price <= 0) {
    return { pricePerSqFt: null, basis: null, unit: '' };
  }

  const hasCarpet = carpetArea && Number(carpetArea) > 0;
  const hasTotal = totalArea && Number(totalArea) > 0;

  if (!hasCarpet && !hasTotal) {
    return { pricePerSqFt: null, basis: null, unit: '' };
  }

  const effectiveArea = hasCarpet ? Number(carpetArea) : Number(totalArea);
  const basis = hasCarpet ? 'Carpet Area' : 'Total Area';
  const pricePerSqFt = Math.round(price / effectiveArea);
  const unit = purpose === 'rent' ? '₹/sq.ft/mo' : '₹/sq.ft';

  return {
    pricePerSqFt,
    basis,
    unit,
    effectiveArea,
  };
};

/**
 * P2 RERA & Verification Workflow Resolver
 * Enforces genuine verification standards without false claims.
 */
export const resolveVerificationBadge = (verificationStatus, reraNumber) => {
  if (verificationStatus === 'verified') {
    return {
      status: 'verified',
      label: 'RERA Verified',
      fullLabel: 'RERA Registration Verified',
      isVerified: true,
      badgeClass: 'bg-emerald-50 text-[#14532D] border-emerald-200',
    };
  }

  if (reraNumber && reraNumber.trim() && verificationStatus !== 'verified') {
    return {
      status: 'self_reported',
      label: 'RERA Self-Reported',
      fullLabel: 'Self-Reported RERA (Pending Verification)',
      isVerified: false,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  return {
    status: 'unverified',
    label: 'Unverified Listing',
    fullLabel: 'RERA Details Not Disclosed',
    isVerified: false,
    badgeClass: 'bg-stone-50 text-stone-600 border-stone-200',
  };
};

/**
 * P2 Adaptive Property Specifications
 * Dynamically switches representation between residential homes and commercial workplaces.
 */
export const formatPropertySpecifications = (property) => {
  if (!property) return {};

  const isCommercial = property.propertyType === 'commercial';

  if (isCommercial) {
    return {
      isCommercial: true,
      leadSpec: 'Commercial Space',
      primaryMetrics: [
        { label: 'Washrooms', value: property.bathrooms ? `${property.bathrooms} Washrooms` : 'Private Washroom' },
        { label: 'Usable Area', value: `${(property.carpetArea || property.area)?.toLocaleString('en-IN')} sq.ft` },
        property.floorNumber !== null && property.floorNumber !== undefined
          ? { label: 'Floor Level', value: `Floor ${property.floorNumber}${property.totalFloors ? ` of ${property.totalFloors}` : ''}` }
          : null,
      ].filter(Boolean),
      ribbonText: `${property.bathrooms ? `${property.bathrooms} Washrooms • ` : ''}${(property.carpetArea || property.area)?.toLocaleString('en-IN')} sq.ft`,
    };
  }

  // Residential
  return {
    isCommercial: false,
    leadSpec: `${property.bedrooms || 1} BHK`,
    primaryMetrics: [
      property.bedrooms !== undefined && property.bedrooms !== null && property.bedrooms > 0
        ? { label: 'Bedrooms', value: `${property.bedrooms} BHK` }
        : null,
      property.bathrooms !== undefined && property.bathrooms !== null && property.bathrooms > 0
        ? { label: 'Bathrooms', value: `${property.bathrooms} Baths` }
        : null,
      { label: property.carpetArea ? 'Carpet Area' : 'Floor Area', value: `${(property.carpetArea || property.area)?.toLocaleString('en-IN')} sq.ft` },
      { label: 'Typology', value: property.propertyType ? capitalize(property.propertyType) : 'Residence' },
    ].filter(Boolean),
    ribbonText: `${property.bedrooms ? `${property.bedrooms} Beds • ` : ''}${property.bathrooms ? `${property.bathrooms} Baths • ` : ''}${(property.carpetArea || property.area)?.toLocaleString('en-IN')} sq.ft`,
  };
};
