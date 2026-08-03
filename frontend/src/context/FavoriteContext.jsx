import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from './AuthContext';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoritesList, setFavoritesList] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Fetch favorites from backend whenever user is authenticated
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setFavoriteIds(new Set());
      setFavoritesList([]);
      return;
    }

    setLoadingFavorites(true);
    try {
      const res = await favoriteService.getFavorites();
      if (res.success && Array.isArray(res.data)) {
        setFavoritesList(res.data);
        const ids = new Set(res.data.map((item) => (typeof item === 'string' ? item : item._id)));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error('Error loading favorites:', error.message);
    } finally {
      setLoadingFavorites(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Check if a property ID is in favorites
  const isFavorite = (propertyId) => {
    if (!propertyId) return false;
    return favoriteIds.has(propertyId.toString());
  };

  // Toggle favorite property
  const toggleFavorite = async (property) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true };
    }

    const propId = typeof property === 'string' ? property : property._id;
    const currentlyFav = favoriteIds.has(propId);

    // Optimistic UI Update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (currentlyFav) {
        next.delete(propId);
      } else {
        next.add(propId);
      }
      return next;
    });

    if (currentlyFav) {
      setFavoritesList((prev) => prev.filter((item) => (item._id || item) !== propId));
    } else if (typeof property === 'object') {
      setFavoritesList((prev) => [property, ...prev]);
    }

    try {
      if (currentlyFav) {
        await favoriteService.removeFavorite(propId);
      } else {
        await favoriteService.addFavorite(propId);
      }
      // Refresh backend state to ensure perfect sync
      fetchFavorites();
      return { success: true, isFav: !currentlyFav };
    } catch (error) {
      // Revert optimistic update on error
      fetchFavorites();
      return { success: false, error: error.message };
    }
  };

  return (
    <FavoriteContext.Provider
      value={{
        favoriteIds,
        favoritesList,
        favoriteCount: favoriteIds.size,
        loadingFavorites,
        isFavorite,
        toggleFavorite,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
