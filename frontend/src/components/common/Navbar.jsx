import React, { useState, useEffect } from 'react';
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

  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHomePage
          ? 'glass-nav-scrolled py-4 text-stone-900 shadow-xs'
          : 'bg-gradient-to-b from-black/40 via-black/10 to-transparent py-6 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          
          {/* Logo Mark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#14532D] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L21 21H17L12 11L7 21H3L12 3Z" fill="currentColor"/>
              </svg>
            </div>
            <span className={`text-xl font-bold tracking-widest ${
              scrolled || !isHomePage ? 'text-stone-900' : 'text-white'
            }`}>
              HAVEN
            </span>
          </Link>

          {/* Nav Links with Generous Spacing */}
          <nav className="hidden md:flex items-center gap-10 text-xs font-semibold uppercase tracking-wider">
            <Link
              to="/properties?purpose=sale"
              className={`transition-colors hover:text-[#22C55E] ${
                location.search.includes('purpose=sale')
                  ? 'text-[#22C55E]'
                  : scrolled || !isHomePage ? 'text-stone-700' : 'text-white/90'
              }`}
            >
              Buy
            </Link>
            <Link
              to="/properties?purpose=rent"
              className={`transition-colors hover:text-[#22C55E] ${
                location.search.includes('purpose=rent')
                  ? 'text-[#22C55E]'
                  : scrolled || !isHomePage ? 'text-stone-700' : 'text-white/90'
              }`}
            >
              Rent
            </Link>
            <Link
              to="/properties"
              className={`transition-colors hover:text-[#22C55E] ${
                location.pathname === '/properties' && !location.search
                  ? 'text-[#22C55E]'
                  : scrolled || !isHomePage ? 'text-stone-700' : 'text-white/90'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/favorites"
              className={`relative flex items-center gap-1.5 transition-colors hover:text-[#22C55E] focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs ${
                location.pathname === '/favorites'
                  ? 'text-[#22C55E]'
                  : scrolled || !isHomePage ? 'text-stone-700' : 'text-white/90'
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

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#14532D] ${
                    scrolled || !isHomePage
                      ? 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50'
                      : 'border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
                  }`}
                  aria-expanded={profileDropdownOpen}
                  aria-label="User profile menu"
                >
                  <div className="w-6 h-6 rounded-md bg-[#14532D] text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-stone-200 py-2 z-50 text-stone-800"
                    >
                      <div className="px-4 py-2.5 border-b border-stone-100">
                        <p className="text-xs text-stone-500 font-semibold uppercase">Signed in as</p>
                        <p className="text-xs font-bold text-stone-900 truncate">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-stone-50 text-stone-700 transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D]"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#14532D]" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/favorites"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-stone-50 text-stone-700 transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D]"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        Saved Homes ({favoriteCount})
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-rose-50 text-rose-600 transition-colors border-t border-stone-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-5 text-xs font-semibold">
                <Link
                  to="/login"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D] rounded-xs ${
                    scrolled || !isHomePage
                      ? 'text-stone-800 hover:text-[#14532D]'
                      : 'text-white hover:text-emerald-300'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#14532D] text-white px-4 py-2 rounded-md hover:bg-[#166534] transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-white"
                >
                  Let's Find Your Place
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md border transition-colors focus-visible:ring-2 focus-visible:ring-[#14532D] ${
                scrolled || !isHomePage
                  ? 'border-stone-200 text-stone-800 hover:bg-stone-100'
                  : 'border-white/20 text-white hover:bg-white/10'
              }`}
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
            className="md:hidden bg-white border-b border-stone-200 shadow-xl overflow-hidden text-stone-900"
          >
            <div className="px-6 py-6 space-y-4 text-xs font-semibold uppercase tracking-wider">
              <Link to="/properties?purpose=sale" className="block py-2">
                Buy
              </Link>
              <Link to="/properties?purpose=rent" className="block py-2">
                Rent
              </Link>
              <Link to="/properties" className="block py-2">
                Explore
              </Link>
              <Link to="/favorites" className="flex items-center justify-between py-2">
                Saved Homes
                <span className="bg-[#14532D] text-white text-xs font-bold px-2 py-0.5 rounded-xs">
                  {favoriteCount}
                </span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block py-2 text-[#14532D]">
                  Admin Dashboard
                </Link>
              )}

              <div className="pt-4 border-t border-stone-100 space-y-3">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-xs font-bold text-rose-600 py-2"
                  >
                    Log Out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to="/login"
                      className="text-center text-xs font-bold py-2.5 rounded-md border border-stone-200 text-stone-800 focus-visible:ring-2 focus-visible:ring-[#14532D]"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="text-center text-xs font-bold py-2.5 rounded-md bg-[#14532D] text-white focus-visible:ring-2 focus-visible:ring-[#14532D]"
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
