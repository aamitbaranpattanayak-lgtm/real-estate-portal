import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoriteContext';
import { 
  Heart, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { favoriteCount } = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dismiss dropdowns and menus on route change, Escape key, or click outside
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FBFBF9]/95 backdrop-blur-md py-3.5 border-b border-stone-200/90 shadow-xs text-stone-900'
          : 'bg-[#FBFBF9]/90 backdrop-blur-xs py-5 border-b border-stone-200/60 text-stone-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          
          {/* Editorial Brand Mark */}
          <Link to="/" className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs">
            <div className="w-7 h-7 rounded-md bg-[#14532D] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-[#166534] transition-colors">
              <span className="font-serif text-sm">H</span>
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">
              HAVEN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#14532D] -ml-1 mt-2.5" />
          </Link>

          {/* Navigation Links with Editorial Spacing */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.14em]">
            <Link
              to="/properties?purpose=sale"
              className={`transition-colors hover:text-[#14532D] py-1 ${
                location.search.includes('purpose=sale')
                  ? 'text-[#14532D] border-b-2 border-[#14532D]'
                  : 'text-stone-700'
              }`}
            >
              Buy
            </Link>
            <Link
              to="/properties?purpose=rent"
              className={`transition-colors hover:text-[#14532D] py-1 ${
                location.search.includes('purpose=rent')
                  ? 'text-[#14532D] border-b-2 border-[#14532D]'
                  : 'text-stone-700'
              }`}
            >
              Rent
            </Link>
            <Link
              to="/properties"
              className={`transition-colors hover:text-[#14532D] py-1 ${
                location.pathname === '/properties' && !location.search
                  ? 'text-[#14532D] border-b-2 border-[#14532D]'
                  : 'text-stone-700'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-1.5 transition-colors hover:text-[#14532D] py-1 focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs ${
                location.pathname === '/favorites'
                  ? 'text-[#14532D] border-b-2 border-[#14532D]'
                  : 'text-stone-700'
              }`}
            >
              Saved
              {favoriteCount > 0 && (
                <span className="bg-[#14532D] text-white text-xs font-bold px-1.5 py-0.2 rounded-xs min-w-[18px] text-center">
                  {favoriteCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {/* Subtle Divider */}
            <div className="h-4 w-px bg-stone-300" />

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] cursor-pointer"
                  aria-expanded={profileDropdownOpen}
                  aria-label="User profile menu"
                >
                  <div className="w-6 h-6 rounded-md bg-[#14532D] text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[110px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-stone-200 py-1.5 z-50 text-stone-800"
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Signed In As</p>
                        <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold hover:bg-stone-50 text-[#14532D] transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D]"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/favorites"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-stone-50 text-stone-700 transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D]"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        Saved Residences ({favoriteCount})
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold hover:bg-rose-50 text-rose-600 transition-colors border-t border-stone-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-xs font-bold">
                <Link
                  to="/login"
                  className="text-stone-700 hover:text-[#14532D] transition-colors px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#14532D] hover:bg-[#166534] text-white px-4 py-2 rounded-md transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#14532D]"
                >
                  Join HAVEN
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md border border-stone-200 text-stone-800 hover:bg-stone-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-stone-200 shadow-lg overflow-hidden text-stone-900"
          >
            <div className="px-6 py-6 space-y-4 text-xs font-bold uppercase tracking-wider">
              <Link 
                to="/properties?purpose=sale" 
                className={`block py-2 transition-colors ${
                  location.search.includes('purpose=sale') ? 'text-[#14532D] font-black' : 'text-stone-700 hover:text-[#14532D]'
                }`}
              >
                Buy Residences
              </Link>
              <Link 
                to="/properties?purpose=rent" 
                className={`block py-2 transition-colors ${
                  location.search.includes('purpose=rent') ? 'text-[#14532D] font-black' : 'text-stone-700 hover:text-[#14532D]'
                }`}
              >
                Rent Residences
              </Link>
              <Link 
                to="/properties" 
                className={`block py-2 transition-colors ${
                  location.pathname === '/properties' && !location.search ? 'text-[#14532D] font-black' : 'text-stone-700 hover:text-[#14532D]'
                }`}
              >
                Explore Catalog
              </Link>
              <Link 
                to="/favorites" 
                className={`flex items-center justify-between py-2 transition-colors ${
                  location.pathname === '/favorites' ? 'text-[#14532D] font-black' : 'text-stone-700 hover:text-[#14532D]'
                }`}
              >
                <span>Saved Residences</span>
                {favoriteCount > 0 && (
                  <span className="bg-[#14532D] text-white text-xs font-bold px-2 py-0.5 rounded-xs">
                    {favoriteCount}
                  </span>
                )}
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`block py-2 transition-colors ${
                    location.pathname === '/admin' ? 'text-[#14532D] font-black' : 'text-stone-700 hover:text-[#14532D]'
                  }`}
                >
                  Admin Console
                </Link>
              )}

              <div className="pt-4 border-t border-stone-100 space-y-3">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-xs font-bold text-rose-600 py-2 cursor-pointer"
                  >
                    Sign Out ({user?.name})
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to="/login"
                      className="text-center text-xs font-bold py-2.5 rounded-md border border-stone-200 text-stone-800 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-[#14532D]"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="text-center text-xs font-bold py-2.5 rounded-md bg-[#14532D] text-white hover:bg-[#166534] focus-visible:ring-2 focus-visible:ring-[#14532D]"
                    >
                      Join HAVEN
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
