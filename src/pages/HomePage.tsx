import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChefHat, Truck, ShoppingBag, AlertCircle, ClipboardList } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { ShopInfo } from '../types';

export function HomePage() {
  const { t } = useLanguage();
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopInfo();
  }, []);

  const loadShopInfo = async () => {
    try {
      setLoading(true);
      const [shopData, openStatus] = await Promise.all([
        api.shop.getInfo(),
        api.shop.isOpen()
      ]);
      
      console.log('Shop open status:', openStatus);
      setShopInfo(shopData);
      setIsOpen(openStatus.is_open);
    } catch (error) {
      console.error('Error loading shop info:', error);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            {t('loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-orange-600 text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight break-words">
              {t('heroWelcome', `Velkommen til ${shopInfo?.shop_name || 'Flavor Grill'}`, `Welcome to ${shopInfo?.shop_name || 'Flavor Grill'}`)}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto break-words">
              {t('heroSubtitle', 'Opplev de fineste smakene i byen', 'Experience the finest flavors in town')}
            </p>

            {/* Shop Status Alert */}
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-100 border-2 border-yellow-300 text-yellow-900 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="font-semibold break-words">
                    {t('shopClosedAlert',
                      'Vi er for øyeblikket stengt. Vennligst sjekk våre åpningstider.',
                      'We are currently closed. Please check our opening hours.')}
                  </span>
                </div>
              </motion.div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/menu"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-red-600 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  <ChefHat className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {t('viewMenu')}
                </Link>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: isOpen ? 1.05 : 1 }} 
                whileTap={{ scale: isOpen ? 0.95 : 1 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/preorder"
                  className={`inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base whitespace-nowrap ${
                    isOpen
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                  }`}
                  onClick={(e) => !isOpen && e.preventDefault()}
                >
                  <ShoppingBag className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {t('preorder')}
                  {!isOpen && (
                    <span className="ml-2 text-xs">
                      ({t('closedLabel')})
                    </span>
                  )}
                </Link>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: isOpen ? 1.05 : 1 }} 
                whileTap={{ scale: isOpen ? 0.95 : 1 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/delivery"
                  className={`inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base whitespace-nowrap ${
                    isOpen
                      ? 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600'
                      : 'bg-gray-700 border-2 border-gray-600 text-gray-400 cursor-not-allowed pointer-events-none'
                  }`}
                  onClick={(e) => !isOpen && e.preventDefault()}
                >
                  <Truck className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {t('delivery')}
                  {!isOpen && (
                    <span className="ml-2 text-xs">
                      ({t('closedLabel')})
                    </span>
                  )}
                </Link>
              </motion.div>
              
              {/* My Orders Button */}
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/my-orders"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white bg-opacity-20 border-2 border-white text-white font-semibold rounded-lg sm:rounded-xl hover:bg-white hover:text-red-600 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  <ClipboardList className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {t('myOrders')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            <div className="text-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ChefHat className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 break-words">
                {t('featureFreshIngredientsTitle', 'Ferske Ingredienser', 'Fresh Ingredients')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 break-words">
                {t('featureFreshIngredientsDesc',
                  'Vi bruker kun de ferskeste ingrediensene fra lokale leverandører.',
                  'We use only the freshest ingredients sourced from local suppliers.')}
              </p>
            </div>
            
            <div className="text-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 break-words">
                {t('featurePreorderTitle', 'Enkel Forhåndsbestilling', 'Easy Pre-ordering')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 break-words">
                {t('featurePreorderDesc',
                  'Hopp over køen med vårt praktiske forhåndsbestillingssystem.',
                  'Skip the wait with our convenient pre-ordering system.')}
              </p>
            </div>
            
            <div className="text-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 break-words">
                {t('featureDeliveryTitle', 'Hjemlevering', 'Home Delivery')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 break-words">
                {t('featureDeliveryDesc',
                  'Få dine favorittretter levert rett til døren.',
                  'Get your favorite dishes delivered right to your door.')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}