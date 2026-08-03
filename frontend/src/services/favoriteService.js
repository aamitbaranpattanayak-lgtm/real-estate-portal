import API from './api';

export const favoriteService = {
  // Get all user favorites
  getFavorites: async () => {
    const response = await API.get('/favorites');
    return response.data;
  },

  // Add a property to favorites
  addFavorite: async (propertyId) => {
    const response = await API.post(`/favorites/${propertyId}`);
    return response.data;
  },

  // Remove a property from favorites
  removeFavorite: async (propertyId) => {
    const response = await API.delete(`/favorites/${propertyId}`);
    return response.data;
  },
};
