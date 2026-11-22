import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center pt-28 pb-20 px-4 text-center text-[#111827]">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-lg border border-stone-200 shadow-sm space-y-6">
        <div className="font-serif text-6xl font-bold tracking-tight text-[#14532D]">404</div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Property Not Found</h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal">
            The property you are seeking might have been removed, archived, or is temporarily unavailable.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#14532D] text-white font-bold text-xs shadow-xs hover:bg-[#166534] transition-all focus-visible:ring-2 focus-visible:ring-[#14532D]"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            to="/properties"
            className="flex items-center justify-center gap-2 py-2.5 rounded-md border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-all focus-visible:ring-2 focus-visible:ring-[#14532D]"
          >
            <Compass className="w-4 h-4 text-[#14532D]" /> Explore Homes
          </Link>
        </div>
      </div>
    </div>
  );
};
