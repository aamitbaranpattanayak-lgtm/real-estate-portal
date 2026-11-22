/**
 * Format currency in Indian Rupees
 * Handles Lakhs (L) and Crores (Cr) cleanly for real estate pricing, or standard format
 */
export const formatPrice = (price, purpose = '') => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  
  // For standard rendering:
  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${cr} Cr`;
  }
  if (price >= 100000) {
    const lakh = (price / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${lakh} Lakh`;
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
