import axios from 'axios';

// Create one reusable Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return structured error message from Express backend
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
      
    return Promise.reject(new Error(message));
  }
);

export default API;
