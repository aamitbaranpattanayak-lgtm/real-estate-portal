import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoriteContext';
import { PropertyCard } from '../../components/property/PropertyCard';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { Heart, Search, LogIn } from 'lucide-react';

export const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const { favoritesList, loadingFavorites, favoriteCount } = useFavorites();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-36 pb-20 max-w-md mx-auto px-4 text-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Sign In to View Saved Homes</h2>
          <p className="text-stone-500 text-xs leading-relaxed">
            Please sign in to access your saved homes and synchronize across all your devices.
          </p>
          <Link
            to="/login"
            className="block w-full py-3.5 rounded-2xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-28 pb-20 text-[#111827]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#14532D] mb-1 block">
            Saved Homes
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Your Saved Collection
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            You have <span className="font-bold text-stone-900">{favoriteCount}</span> saved homes
          </p>
        </div>

        {loadingFavorites ? (
          <SkeletonGrid count={3} />
        ) : favoritesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoritesList.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-stone-200/80 shadow-xs max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">No Saved Homes Yet</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Explore our curated listings and click the heart icon on any property to save it to your collection.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs shadow-xs transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Find your place
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
