import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart, Globe, ClipboardList } from 'lucide-react';
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

  useEffect(() => {
    fetchShopInfo();
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
            {navLinks.map((link) => (
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

            {/* Cart Button */}
            <Link
              to="/menu"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

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
              {/* My Orders Button (mobile only) */}
              <Link
                to="/my-orders"
                onClick={() => setIsOpen(false)}
                className="flex md:hidden items-center space-x-1 px-2 py-2 rounded text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                <ClipboardList className="w-4 h-4 text-gray-700" />
                <span>{t('myOrders')}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}