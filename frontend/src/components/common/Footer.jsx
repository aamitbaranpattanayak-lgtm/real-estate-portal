import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#111827] text-gray-300 pt-20 pb-12 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-gray-800">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#14532D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L21 21H17L12 11L7 21H3L12 3Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-wider text-white">HAVEN</span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-normal">
              Built for living, not just listing.
            </p>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
              Discover thoughtfully selected homes and investment properties across India. Every listing verified. Every decision yours.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Find Your Place</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/properties?purpose=sale" className="hover:text-emerald-400 transition-colors">
                  Homes for Sale
                </Link>
              </li>
              <li>
                <Link to="/properties?purpose=rent" className="hover:text-emerald-400 transition-colors">
                  Rental Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-emerald-400 transition-colors">
                  All Curated Homes
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-emerald-400 transition-colors">
                  Saved Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Locations */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Featured Locations</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/properties?city=Bengaluru" className="hover:text-emerald-400 transition-colors">
                  Bengaluru
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Mumbai" className="hover:text-emerald-400 transition-colors">
                  Mumbai
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Delhi-NCR" className="hover:text-emerald-400 transition-colors">
                  Delhi NCR
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Hyderabad" className="hover:text-emerald-400 transition-colors">
                  Hyderabad
                </Link>
              </li>
              <li>
                <Link to="/properties?city=Goa" className="hover:text-emerald-400 transition-colors">
                  Goa
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} HAVEN. Built for living, not just listing.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
