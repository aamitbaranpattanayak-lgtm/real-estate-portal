import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './ProtectedRoute';

// Lazy loading pages for optimal performance
const HomePage = lazy(() => import('../pages/Home/HomePage').then(m => ({ default: m.HomePage })));
const PropertiesPage = lazy(() => import('../pages/Properties/PropertiesPage').then(m => ({ default: m.PropertiesPage })));
const PropertyDetailsPage = lazy(() => import('../pages/PropertyDetails/PropertyDetailsPage').then(m => ({ default: m.PropertyDetailsPage })));
const FavoritesPage = lazy(() => import('../pages/Favorites/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const LoginPage = lazy(() => import('../pages/Login/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/Register/RegisterPage').then(m => ({ default: m.RegisterPage })));
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#14532D] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Loading HAVEN...</p>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected User Routes */}
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
