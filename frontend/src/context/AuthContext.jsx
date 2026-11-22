import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize auth state on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getCurrentUser();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to authenticate stored token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = (authData) => {
    // authData from API: { _id, name, email, phone, role, token }
    localStorage.setItem('token', authData.token);
    setToken(authData.token);
    setUser({
      _id: authData._id,
      name: authData.name,
      email: authData.email,
      phone: authData.phone,
      role: authData.role,
    });
  };

  const register = (authData) => {
    localStorage.setItem('token', authData.token);
    setToken(authData.token);
    setUser({
      _id: authData._id,
      name: authData.name,
      email: authData.email,
      phone: authData.phone,
      role: authData.role,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
