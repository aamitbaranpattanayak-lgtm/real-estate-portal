import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-20 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#14532D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <span className="font-serif text-base">H</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">HAVEN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-1 mt-2" />
            </Link>

            <p className="font-serif text-lg text-stone-200 leading-snug max-w-sm">
              Architecture crafted for modern living.
            </p>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              A curated collection of thoughtfully planned apartments, private villas, and urban penthouses across India's premier metropolitan centers. Direct owner representation with certified spatial metrics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em]">The Portfolio</h4>
            <ul className="space-y-2.5 text-xs text-stone-400 font-medium">
              <li>
                <Link to="/properties?purpose=sale" className="hover:text-emerald-400 transition-colors">
                  Residences for Purchase
                </Link>
              </li>
              <li>
                <Link to="/properties?purpose=rent" className="hover:text-emerald-400 transition-colors">
                  Leased & Rental Homes
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-emerald-400 transition-colors">
                  Complete Catalog
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-emerald-400 transition-colors">
                  Saved Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Enclaves */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em]">Enclaves</h4>
            <ul className="space-y-2.5 text-xs text-stone-400 font-medium">
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} HAVEN. Curated Monograph • Edition 2026.</p>
          <div className="flex items-center gap-6">
            <Link to="/properties" className="hover:text-stone-300 transition-colors">Catalog</Link>
            <Link to="/favorites" className="hover:text-stone-300 transition-colors">Saved</Link>
            <Link to="/login" className="hover:text-stone-300 transition-colors">Sign In</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
