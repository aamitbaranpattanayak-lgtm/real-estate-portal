import API from './api';

export const authService = {
  // Register User
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  // Login User
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  // Get Current User Profile
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
};
