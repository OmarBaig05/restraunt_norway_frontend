import { Plus, Edit2, Store, Clock } from 'lucide-react';
import { WorkingHours, ShopSettingsTabProps } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ShopSettingsTab({
  shopInfo,
  workingHours,
  onEditShopInfo,
  onAddUpdateHours,
  onEditWorkingHours
}: ShopSettingsTabProps) {
  const { t } = useLanguage();

  // Helper function to format time display
  const formatTimeDisplay = (openingTime?: string, closingTime?: string): string => {
    if (!openingTime || !closingTime) return t('notSet');

    // Format time from HH:MM:SS to HH:MM if needed
    const formatTime = (time: string) => {
      return time.substring(0, 5); // Extract HH:MM from HH:MM:SS or HH:MM
    };

    const opening = formatTime(openingTime);
    const closing = formatTime(closingTime);

    // Check if it's 24-hour operation
    if (
      (opening === '00:00' && closing === '23:59') ||
      (opening === '00:00' && closing === '00:00') ||
      (opening === closing)
    ) {
      return t('hours24Label');
    }

    return `${opening} - ${closing}`;
  };

  // Helper function to check if a day is 24 hours
  const is24Hours = (dayHours?: WorkingHours): boolean => {
    if (!dayHours || !dayHours.opening_time || !dayHours.closing_time) return false;

    const opening = dayHours.opening_time.substring(0, 5);
    const closing = dayHours.closing_time.substring(0, 5);

    return (
      (opening === '00:00' && closing === '23:59') ||
      (opening === '00:00' && closing === '00:00') ||
      (opening === closing)
    );
  };

  return (
    <div className="space-y-6">
      {/* Shop Information */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('shopInformation')}</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onEditShopInfo(shopInfo)}
              className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm">{t('editShopInfo')}</span>
            </button>
          </div>
        </div>

        {shopInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">{t('shopName')}</label>
                <p className="text-gray-900 truncate">{shopInfo.shop_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('address')}</label>
                <p className="text-gray-900 break-words">{shopInfo.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('phone')}</label>
                <p className="text-gray-900">{shopInfo.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('email')}</label>
                <p className="text-gray-900 truncate">{shopInfo.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">{t('coordinates')}</label>
                <p className="text-gray-900 truncate">Lat: {shopInfo.lat}, Lng: {shopInfo.lng}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('deliveryRadiusLabel')}</label>
                <p className="text-gray-900">{shopInfo.delivery_radius} km</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('minimumOrderLabel')}</label>
                <p className="text-gray-900">{shopInfo.minimum_order} kr</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('deliveryFeeLabel')}</label>
                <p className="text-gray-900">{shopInfo.delivery_charges} kr</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Store className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>{t('noShopInfoFound')}</p>
          </div>
        )}
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('workingHoursTitle')}</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onAddUpdateHours}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">{t('addUpdateHours')}</span>
            </button>
          </div>
        </div>

        {/* Info banner for 24-hour operation */}
        {workingHours.some(h => h.is_open && is24Hours(h)) && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">{t('hours24DetectedTitle')}</p>
              <p className="text-green-700">
                {t('hours24DetectedDesc')}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = workingHours.find(h => h.day === day);
            const is24HoursDay = is24Hours(dayHours);

            return (
              <div
                key={day}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  is24HoursDay
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{t(day.toLowerCase()) || day}</p>
                    {is24HoursDay && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {t('hours24Label')}
                      </span>
                    )}
                  </div>
                  {dayHours && dayHours.is_open ? (
                    <p className={`text-sm ${is24HoursDay ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                      {formatTimeDisplay(dayHours.opening_time, dayHours.closing_time)}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 font-medium">{t('closedLabel')}</p>
                  )}
                </div>

                <div className="ml-3 flex-shrink-0">
                  <button
                    onClick={() => onEditWorkingHours(dayHours || { day, is_open: false })}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title={`${t('editLabel')} ${day} ${t('workingHoursLabel')}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helper text */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{t('tip24Hours').split(':')[0]}:</strong> {t('tip24Hours').split(':').slice(1).join(':').trim()}
          </p>
        </div>
      </div>
    </div>
  );
}