import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, Globe, ClipboardList, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { ShopInfo } from '../types';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, toggleLanguage, getNavLinks, getLanguageDisplay } = useLanguage();
  const { totalItems } = useCart();
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // new state/ref for cart dropdown
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchShopInfo();
  }, []);

  // close cart dropdown on route change
  useEffect(() => {
    setCartOpen(false);
  }, [location.pathname]);

  // click outside to close cart dropdown
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!cartRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const fetchShopInfo = async () => {
    try {
      setLoading(true);
      const shopData = await api.shop.getInfo();
      setShopInfo(shopData);
    } catch (error) {
      console.error('Error loading shop info in navbar:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Get nav links from language context
  const navLinks = getNavLinks();

  // exclude my-orders from the main nav so it only appears as the right-side icon
  const navLinksFiltered = navLinks.filter(link => link.path !== '/my-orders');
  
  // Get first letter of shop name for logo
  const shopFirstLetter = shopInfo?.shop_name ? shopInfo.shop_name.charAt(0) : 'F';
  
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8"> {/* px-2 for small screens */}
        <div className="flex flex-wrap justify-between items-center h-16 min-h-[4rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">{shopFirstLetter}</span>
            </div>
            <span className="text-base sm:text-xl font-bold text-gray-900 truncate max-w-[100px] sm:max-w-none">
              {loading ? (
                <span className="inline-block w-20 bg-gray-200 animate-pulse h-5 rounded"></span>
              ) : (
                shopInfo?.shop_name || 'Flavor Grill'
              )}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navLinksFiltered.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-red-600'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-700" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 uppercase">
                {getLanguageDisplay()}
              </span>
            </button>

            {/* Cart Button -> now opens dropdown with Pre-order / Delivery */}
            <div ref={cartRef} className="relative">
              <button
                onClick={() => setCartOpen((v) => !v)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
                aria-haspopup="true"
                aria-expanded={cartOpen}
                aria-label="Cart actions"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <ChevronDown className="w-4 h-4 text-gray-500" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {cartOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg z-50 ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <Link
                      to="/preorder"
                      onClick={() => setCartOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {t('preorder') || 'Pre-order'}
                    </Link>
                    <Link
                      to="/delivery"
                      onClick={() => setCartOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {t('delivery') || 'Delivery'}
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* My Orders Button (desktop only) */}
            <Link
              to="/my-orders"
              className="hidden md:flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-gray-700" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {t('myOrders')}
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-3 border-t border-gray-200"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-xs sm:text-sm font-medium transition-colors px-2 py-2 rounded ${
                    isActive(link.path)
                      ? 'text-red-600 bg-gray-100'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}