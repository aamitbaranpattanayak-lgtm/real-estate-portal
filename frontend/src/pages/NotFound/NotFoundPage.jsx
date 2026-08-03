import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-28 pb-20 px-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-6xl font-black text-emerald-600">404</div>
        <h1 className="text-2xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-500">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            to="/properties"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
          >
            <Compass className="w-4 h-4 text-emerald-600" /> Browse
          </Link>
        </div>
      </div>
    </div>
  );
};
