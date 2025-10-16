import  { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { ShopInfo, WorkingHours } from '../types';

export function Footer() {
  const { currentLanguage, getDayShort, formatTime } = useLanguage();
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      setLoading(true);
      const [shopData, hoursData] = await Promise.all([
        api.shop.getInfo(),
        api.shop.getWorkingHours()
      ]);
      
      setShopInfo(shopData);
      setWorkingHours(hoursData);
    } catch (error) {
      console.error('Error loading shop data in footer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center text-gray-400 text-sm sm:text-base">
            <p>{currentLanguage.code === 'no' ? 'Laster...' : 'Loading...'}</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Restaurant Info */}
          <div>
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">
                  {shopInfo?.shop_name?.charAt(0) || 'R'}
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold truncate max-w-[140px] sm:max-w-none">
                {shopInfo?.shop_name || 'Restaurant'}
              </span>
            </div>
            <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
              {currentLanguage.code === 'no'
                ? 'Opplev de fineste smakene i byen med våre autentiske retter laget fra ferske ingredienser.'
                : 'Experience the finest flavors in town with our authentic dishes made from fresh ingredients.'}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              {currentLanguage.code === 'no' ? 'Kontakt Oss' : 'Contact Us'}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {shopInfo?.phone && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <a 
                    href={`tel:${shopInfo.phone}`} 
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base break-all"
                  >
                    {shopInfo.phone}
                  </a>
                </div>
              )}
              {shopInfo?.email && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <a 
                    href={`mailto:${shopInfo.email}`} 
                    className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base break-all"
                  >
                    {shopInfo.email}
                  </a>
                </div>
              )}
              {shopInfo?.address && (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base break-words">{shopInfo.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              {currentLanguage.code === 'no' ? 'Åpningstider' : 'Opening Hours'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Clock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-300 space-y-1 w-full">
                  {workingHours.length > 0 ? (
                    workingHours.map((hour) => (
                      <div key={hour.id} className="flex justify-between gap-2 sm:gap-4 text-sm sm:text-base">
                        <span className="min-w-[40px]">{getDayShort(hour.day)}:</span>
                        <span className={hour.is_open ? 'text-gray-300' : 'text-red-400'}>
                          {hour.is_open && hour.opening_time && hour.closing_time
                            ? `${formatTime(hour.opening_time)} - ${formatTime(hour.closing_time)}`
                            : (currentLanguage.code === 'no' ? 'Stengt' : 'Closed')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base">
                      {currentLanguage.code === 'no'
                        ? 'Åpningstider ikke tilgjengelig'
                        : 'Opening hours not available'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {shopInfo && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800">
                <p className="text-xs sm:text-sm text-gray-400">
                  {currentLanguage.code === 'no'
                    ? `Leveringsradius: ${shopInfo.delivery_radius} km`
                    : `Delivery radius: ${shopInfo.delivery_radius} km`}
                </p>
                {shopInfo.minimum_order != null && Number(shopInfo.minimum_order) !== 1 && (
                  <p className="text-xs sm:text-sm text-gray-400">
                    {currentLanguage.code === 'no'
                      ? `Gratis levering over ${shopInfo.minimum_order} kr`
                      : `Free delivery over ${shopInfo.minimum_order} kr`}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>
            &copy; {new Date().getFullYear()} {shopInfo?.shop_name || 'Restaurant'}. 
            {currentLanguage.code === 'no' ? ' Alle rettigheter reservert.' : ' All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}