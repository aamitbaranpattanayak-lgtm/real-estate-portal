import API from './api';

export const propertyService = {
  // Get all properties with optional backend filters
  getProperties: async (params = {}) => {
    // Filter out empty params
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        cleanParams[key] = params[key];
      }
    });

    const response = await API.get('/properties', { params: cleanParams });
    return response.data;
  },

  // Get dynamic database-driven filter options (cities, price ranges, typologies)
  getFilterOptions: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        cleanParams[key] = params[key];
      }
    });

    const response = await API.get('/properties/filter-options', { params: cleanParams });
    return response.data;
  },

  // Get single property details
  getPropertyById: async (id) => {
    const response = await API.get(`/properties/${id}`);
    return response.data;
  },

  // Contact owner info for property
  contactOwner: async (id) => {
    const response = await API.get(`/properties/${id}/contact`);
    return response.data;
  },

  // Admin: Create new property
  createProperty: async (propertyData) => {
    const response = await API.post('/properties', propertyData);
    return response.data;
  },

  // Admin: Update existing property
  updateProperty: async (id, propertyData) => {
    const response = await API.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Admin: Delete property
  deleteProperty: async (id) => {
    const response = await API.delete(`/properties/${id}`);
    return response.data;
  },
};
