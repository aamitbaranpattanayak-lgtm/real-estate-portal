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

  if (verificationStatus === 'rejected') {
    return {
      status: 'rejected',
      label: 'Registration Rejected',
      fullLabel: 'RERA Registration Rejected / Invalid',
      isVerified: false,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  }

  if (verificationStatus === 'self_reported' || (reraNumber && reraNumber.trim() && verificationStatus !== 'unverified')) {
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
 * Formats a clean, prominent numerical card specifications string.
 * Residential example: "4 Beds • 4 Baths • 3,800 sq.ft."
 * Commercial example: "3,000 sq.ft. • 2 Washrooms • Floor 4"
 * Unavailable fields are omitted cleanly without placeholder tokens or empty bullets.
 */
export const formatCardSpecifications = (property) => {
  if (!property) return '';
  const isCommercial = property.propertyType === 'commercial';

  if (isCommercial) {
    const parts = [];
    const area = property.carpetArea || property.builtUpArea || property.area;
    if (area && area > 0) {
      parts.push(`${area.toLocaleString('en-IN')} sq.ft.`);
    }
    if (property.bathrooms && property.bathrooms > 0) {
      parts.push(`${property.bathrooms} Washroom${property.bathrooms > 1 ? 's' : ''}`);
    }
    if (property.floorNumber !== null && property.floorNumber !== undefined) {
      parts.push(property.floorNumber === 0 ? 'Ground Floor' : `Floor ${property.floorNumber}`);
    } else if (property.parkingSpaces && property.parkingSpaces > 0) {
      parts.push(`${property.parkingSpaces} Parking`);
    }
    return parts.join(' • ');
  }

  // Residential
  const parts = [];
  if (property.bedrooms && property.bedrooms > 0) {
    parts.push(`${property.bedrooms} Beds`);
  }
  if (property.bathrooms && property.bathrooms > 0) {
    parts.push(`${property.bathrooms} Baths`);
  }
  const area = property.carpetArea || property.builtUpArea || property.area;
  if (area && area > 0) {
    parts.push(`${area.toLocaleString('en-IN')} sq.ft.`);
  }
  return parts.join(' • ');
};

/**
 * P2 Refinement: Detailed Numerical Specifications Extractor
 * Extracts genuine, prominent numerical specifications for the property details view.
 * Strictly excludes placeholders ("Unspecified", "Common Parking", "Monthly Lease", "0 Beds").
 */
export const getDetailedSpecifications = (property) => {
  if (!property) return { isCommercial: false, numericalSpecs: [], qualitativeSpecs: [] };

  const isCommercial = property.propertyType === 'commercial';
  const numericalSpecs = [];

  if (isCommercial) {
    // 1. Carpet Area (RERA Primary) or Usable Area
    if (property.carpetArea && property.carpetArea > 0) {
      numericalSpecs.push({
        value: property.carpetArea.toLocaleString('en-IN'),
        unit: 'sq.ft.',
        label: 'Carpet Area',
        highlight: 'RERA Primary',
      });
    } else if (property.area && property.area > 0) {
      numericalSpecs.push({
        value: property.area.toLocaleString('en-IN'),
        unit: 'sq.ft.',
        label: 'Usable Area',
      });
    }

    // 2. Built-up Area
    if (property.builtUpArea && property.builtUpArea > 0) {
      numericalSpecs.push({
        value: property.builtUpArea.toLocaleString('en-IN'),
        unit: 'sq.ft.',
        label: 'Built-up Area',
      });
    }

    // 3. Super Built-up Area
    if (property.superBuiltUpArea && property.superBuiltUpArea > 0) {
      numericalSpecs.push({
        value: property.superBuiltUpArea.toLocaleString('en-IN'),
        unit: 'sq.ft.',
        label: 'Super Built-up Area',
      });
    }

    // 4. Washrooms (where applicable)
    if (property.bathrooms && property.bathrooms > 0) {
      numericalSpecs.push({
        value: property.bathrooms,
        unit: '',
        label: property.bathrooms === 1 ? 'Washroom' : 'Washrooms',
      });
    }

    // 5. Floor Level
    if (property.floorNumber !== null && property.floorNumber !== undefined) {
      numericalSpecs.push({
        value: property.floorNumber === 0 ? 'Ground Floor' : `Floor ${property.floorNumber}`,
        unit: property.totalFloors ? `of ${property.totalFloors}` : '',
        label: 'Floor Level',
      });
    }

    // 6. Parking Spaces
    if (property.parkingSpaces && property.parkingSpaces > 0) {
      numericalSpecs.push({
        value: property.parkingSpaces,
        unit: '',
        label: property.parkingSpaces === 1 ? 'Parking Space' : 'Parking Spaces',
      });
    }
  } else {
    // Residential:
    // 1. Bedrooms
    if (property.bedrooms && property.bedrooms > 0) {
      numericalSpecs.push({
        value: property.bedrooms,
        unit: '',
        label: property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms',
      });
    }

    // 2. Bathrooms
    if (property.bathrooms && property.bathrooms > 0) {
      numericalSpecs.push({
        value: property.bathrooms,
        unit: '',
        label: property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms',
      });
    }

    // 3. Carpet Area (RERA Primary)
    if (property.carpetArea && property.carpetArea > 0) {
      numericalSpecs.push({
        value: property.carpetArea.toLocaleString('en-IN'),
        unit: 'sq.ft.',
        label: 'Carpet Area',
        highlight: 'RERA Primary',
      });
    }

    // 4. Built-up Area
    if (property.builtUpArea && property.builtUpArea > 0) {
      numericalSpecs.push({
        value: property.builtUpArea.toLocaleString('en-IN'),
        unit: 'sq.ft.',
        label: 'Built-up Area',
      });
    }

    // 5. Super Built-up Area
    if (property.superBuiltUpArea && property.superBuiltUpArea > 0) {
      numericalSpecs.push({
        value: property.superBuiltUpArea.toLocaleString('en-IN'),
        unit: 'sq.ft.',
        label: 'Super Built-up Area',
      });
    } else if (!property.carpetArea && !property.builtUpArea && property.area && property.area > 0) {
      numericalSpecs.push({
        value: property.area.toLocaleString('en-IN'),
        unit: 'sq.ft.',
        label: 'Total Area',
      });
    }

    // 6. Floor Level
    if (property.floorNumber !== null && property.floorNumber !== undefined) {
      numericalSpecs.push({
        value: property.floorNumber === 0 ? 'Ground Floor' : `Floor ${property.floorNumber}`,
        unit: property.totalFloors ? `of ${property.totalFloors}` : '',
        label: 'Floor Level',
      });
    }

    // 7. Balconies
    if (property.balconies && property.balconies > 0) {
      numericalSpecs.push({
        value: property.balconies,
        unit: '',
        label: property.balconies === 1 ? 'Balcony' : 'Balconies',
      });
    }

    // 8. Parking Spaces
    if (property.parkingSpaces && property.parkingSpaces > 0) {
      numericalSpecs.push({
        value: property.parkingSpaces,
        unit: '',
        label: property.parkingSpaces === 1 ? 'Parking Space' : 'Parking Spaces',
      });
    }
  }

  // Qualitative Specifications (ONLY included if genuinely defined and non-placeholder)
  const qualitativeSpecs = [];
  if (
    property.furnishing &&
    typeof property.furnishing === 'string' &&
    property.furnishing.trim() &&
    property.furnishing.toLowerCase() !== 'unspecified'
  ) {
    qualitativeSpecs.push({
      label: 'Furnishing',
      value: property.furnishing.replace('-', ' '),
    });
  }
  if (
    property.facing &&
    typeof property.facing === 'string' &&
    property.facing.trim() &&
    property.facing.toLowerCase() !== 'unspecified'
  ) {
    qualitativeSpecs.push({
      label: 'Orientation',
      value: `${property.facing} Facing`,
    });
  }

  return { isCommercial, numericalSpecs, qualitativeSpecs };
};

/**
 * P2 Adaptive Property Specifications
 * Dynamically switches representation between residential homes and commercial workplaces.
 */
export const formatPropertySpecifications = (property) => {
  if (!property) return {};

  const isCommercial = property.propertyType === 'commercial';
  const ribbonText = formatCardSpecifications(property);

  if (isCommercial) {
    return {
      isCommercial: true,
      leadSpec: 'Commercial Space',
      primaryMetrics: [
        property.bathrooms ? { label: 'Washrooms', value: `${property.bathrooms} Washrooms` } : null,
        (property.carpetArea || property.area) ? { label: 'Usable Area', value: `${(property.carpetArea || property.area).toLocaleString('en-IN')} sq.ft.` } : null,
        property.floorNumber !== null && property.floorNumber !== undefined
          ? { label: 'Floor Level', value: `Floor ${property.floorNumber}${property.totalFloors ? ` of ${property.totalFloors}` : ''}` }
          : null,
      ].filter(Boolean),
      ribbonText,
    };
  }

  // Residential
  return {
    isCommercial: false,
    leadSpec: property.bedrooms ? `${property.bedrooms} BHK` : 'Residence',
    primaryMetrics: [
      property.bedrooms !== undefined && property.bedrooms !== null && property.bedrooms > 0
        ? { label: 'Bedrooms', value: `${property.bedrooms} BHK` }
        : null,
      property.bathrooms !== undefined && property.bathrooms !== null && property.bathrooms > 0
        ? { label: 'Bathrooms', value: `${property.bathrooms} Baths` }
        : null,
      (property.carpetArea || property.area)
        ? { label: property.carpetArea ? 'Carpet Area' : 'Total Area', value: `${(property.carpetArea || property.area).toLocaleString('en-IN')} sq.ft.` }
        : null,
      property.propertyType ? { label: 'Typology', value: capitalize(property.propertyType) } : null,
    ].filter(Boolean),
    ribbonText,
  };
};
