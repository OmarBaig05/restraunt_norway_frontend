import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, CheckCircle, Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { OrderItem, ShopInfo, Product } from '../types';

export function DeliveryPage() {
  const { t, currentLanguage } = useLanguage();
  const { items, updateQuantity, removeItem, getTotalAmount, clearCart } = useCart();
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderToken, setOrderToken] = useState('');
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
  const [isShopOpen, setIsShopOpen] = useState<boolean>(true);
  const [checkingShopStatus, setCheckingShopStatus] = useState(true);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    const getShopInfo = async () => {
      try {
        const info = await api.shop.getInfo();
        setShopInfo(info);
      } catch (err) {
        console.error('Error fetching shop info:', err);
      }
    };
    getShopInfo();
    checkLocationPermission();
    loadProductDetails();
    checkShopStatus();
  }, []);

  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      getCurrentLocation();
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(result.state);
      
      result.addEventListener('change', () => {
        setLocationPermission(result.state);
        if (result.state === 'granted') {
          getCurrentLocation();
        }
      });

      if (result.state === 'granted') {
        getCurrentLocation();
      }
    } catch (err) {
      console.error('Error checking location permission:', err);
      getCurrentLocation();
    }
  };

  const loadProductDetails = async () => {
    if (items.length === 0) return;
    
    try {
      const allProducts = await api.products.getAll();
      const productsMap: Record<string, Product> = {};
      
      allProducts.forEach(product => {
        productsMap[product.id] = product;
      });
      
      setProductDetails(productsMap);
    } catch (err) {
      console.error('Error loading product details:', err);
    }
  };

  const getProductName = (item: {product_id: string, product_name: string}) => {
    const product = productDetails[item.product_id];
    if (!product) return item.product_name;
    return currentLanguage.code === 'no' ? product.name_no : product.name_en;
  };

  const getCurrentLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError(t('geolocationNotSupported'));
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLat(position.coords.latitude);
        setCurrentLng(position.coords.longitude);
        setLocationPermission('granted');
        setError('');
        setLoading(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        
        if (err.code === err.PERMISSION_DENIED) {
          setLocationPermission('denied');
          setError(t('locationPermissionDenied') || 'Location access was denied. Please enable location access in your browser settings.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError(t('locationUnavailable') || 'Location information is unavailable. Please try again.');
        } else if (err.code === err.TIMEOUT) {
          setError(t('locationTimeout') || 'Location request timed out. Please try again.');
        } else {
          setError(t('allowLocationAccess'));
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const checkShopStatus = async () => {
    try {
      setCheckingShopStatus(true);
      const status = await api.shop.isOpen();
      setIsShopOpen(status.is_open);

      if (!status.is_open) {
        setError(t('deliveryNotAvailable'));
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Error checking shop status:', err);
      setIsShopOpen(true);
    } finally {
      setCheckingShopStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    try {
      const status = await api.shop.isOpen();
      setIsShopOpen(status.is_open);
      
      if (!status.is_open) {
        setError(t('deliveryNotAvailable'));
        return;
      }
    } catch (err) {
      console.error('Error checking shop status:', err);
      setError(t('error'));
      return;
    }

    if (currentLat === null || currentLng === null) {
      setError(t('locationRequiredForDelivery'));
      return;
    }

    if (!address.trim() || !postalCode.trim()) {
      setError(t('fillAddressPostal'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems: OrderItem[] = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const subtotal = getTotalAmount();
      const minOrder = shopInfo?.minimum_order ?? 200;
      const hasFreeDelivery = shopInfo?.minimum_order !== 1;
      const deliveryFee = (hasFreeDelivery && subtotal >= minOrder)
        ? 0
        : (shopInfo?.delivery_charges ?? 90);
      const totalAmount = subtotal + deliveryFee;

      const orderData = {
        customer_name: customerInfo.name,
        contact_number: customerInfo.phone || undefined,
        items: orderItems,
        delivery_address: address,
        postal_code: postalCode,
        lat: currentLat,
        lng: currentLng,
        delivery_fee: deliveryFee,
        subtotal: subtotal,
        total: totalAmount
      };

      const response = await api.orders.createDeliveryOrder(orderData);

      setOrderToken(response.token);
      setOrderId(response.order_id);
      setOrderSuccess(true);
      await clearCart();
    } catch (err: any) {
      console.error('Error creating delivery order:', err);
      const backendMsg = err?.message || err?.response?.data?.detail || '';
      if (backendMsg && backendMsg.toLowerCase().includes('outside')) {
        setError(t('deliveryNotAvailable'));
      } else if (backendMsg) {
        setError(backendMsg);
      } else {
        setError(t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const geoReady = currentLat !== null && currentLng !== null;

  if (checkingShopStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('checkingShopStatus')}</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('deliveryOrderedTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('deliveryConfirmed')}</p>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">{t('orderId')}</p>
              <p className="text-lg font-bold text-gray-900">{orderId}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-6 border-2 border-red-200">
              <p className="text-sm text-gray-600 mb-1">{t('orderTokenLabelDelivery')}</p>
              <p className="text-2xl font-bold text-red-600">{orderToken}</p>
            </div>

            <p className="text-sm text-gray-600 mb-6">{t('deliveryDesc')}</p>

            <button onClick={() => (window.location.href = '/')} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
              {t('backToHomeDelivery')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('deliveryTitle')}</h1>
          <p className="text-gray-600">{t('deliveryDesc')}</p>
        </motion.div>

        {!isShopOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          >
            <div className="flex items-start sm:items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-semibold">{t('shopClosedTitle')}</p>
                <p className="text-red-700 text-sm">{t('shopClosedDesc')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('cartEmptyTitle')}</h2>
            <p className="text-gray-500 mb-6">{t('cartEmptyDesc')}</p>
            <a href="/menu" className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              {t('browseMenu')}
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('deliveryTitle')}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deliveryAddress')}</h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">{t('deliveryAddress')} *</label>
                      <input 
                        type="text" 
                        id="address" 
                        required 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        placeholder={t('deliveryAddress')} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                        disabled={!geoReady || !isShopOpen} 
                      />
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">{t('postalCode')} *</label>
                      <input 
                        type="text" 
                        id="postalCode" 
                        required 
                        value={postalCode} 
                        onChange={(e) => setPostalCode(e.target.value)} 
                        placeholder="e.g. 0155" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                        disabled={!geoReady || !isShopOpen} 
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={getCurrentLocation} 
                      disabled={loading || !isShopOpen} 
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>
                        {locationPermission === 'denied' 
                          ? (t('enableLocationAccess') || 'Enable Location Access')
                          : t('useCurrentLocationRequired')
                        }
                      </span>
                    </button>

                    {locationPermission === 'denied' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-800 mb-2">
                              {t('locationAccessBlocked') || 'Location Access Blocked'}
                            </p>
                            <p className="text-sm text-orange-700 mb-3">
                              {t('locationAccessInstructions') || 'To enable location access:'}
                            </p>
                            <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                              <li>{t('locationStep1') || 'Tap the lock icon in your browser\'s address bar'}</li>
                              <li>{t('locationStep2') || 'Find "Location" or "Site permissions"'}</li>
                              <li>{t('locationStep3') || 'Change permission to "Allow"'}</li>
                              <li>{t('locationStep4') || 'Reload the page'}</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    )}

                    {shopInfo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          {t('deliveryRadiusLabel')}: {shopInfo.delivery_radius} km
                          <br />
                          {t('deliveryFeeLabel')}: {shopInfo.delivery_charges} kr
                          <br />
                          {shopInfo.minimum_order !== 1 && (
                            <>
                              {t('freeDeliveryLabel', 'Gratis levering ved bestilling over', 'Free delivery for orders over')}: {shopInfo.minimum_order} kr
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    {!geoReady && locationPermission !== 'denied' && (
                      <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-sm text-yellow-800">
                        {t('allowLocationAccess')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('customer')}</h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('name')} *</label>
                      <input 
                        type="text" 
                        id="name" 
                        required 
                        value={customerInfo.name} 
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                        disabled={!isShopOpen}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} *</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        required 
                        value={customerInfo.phone} 
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                        placeholder="+47 xxx xx xxx" 
                        disabled={!isShopOpen}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('email')} ({t('optional')})</label>
                      <input 
                        type="email" 
                        id="email" 
                        value={customerInfo.email} 
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                        placeholder="din@epost.no" 
                        disabled={!isShopOpen}
                      />
                    </div>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: (isShopOpen && geoReady) ? 1.02 : 1 }} 
                  whileTap={{ scale: (isShopOpen && geoReady) ? 0.98 : 1 }} 
                  type="submit" 
                  disabled={loading || !geoReady || !isShopOpen} 
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? t('processing') : (!isShopOpen ? t('shopClosedTitle') : t('confirmOrderBtn'))}
                </motion.button>
              </form>
            </div>

            {/* Cart Summary */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('orderSummaryLabel')}</h2>

              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div key={item.product_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{getProductName(item)}</h3>
                          <p className="text-sm text-gray-600">{item.price} kr {t('each', 'hver', 'each')}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-100">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <span className="font-semibold text-red-600 min-w-20 text-right">{(item.price * item.quantity).toFixed(2)} kr</span>

                          <button onClick={() => removeItem(item.product_id)} className="p-1 text-red-500 hover:bg-red-50 rounded-full">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="bg-white rounded-lg p-4 shadow-sm border-t-2 border-red-600">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('subtotalLabel')}</span>
                      <span>{getTotalAmount().toFixed(2)} kr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('deliveryFeeLabel')}</span>
                      <span>
                        {shopInfo?.minimum_order === 1
                          ? `${shopInfo?.delivery_charges || 90} kr`
                          : (getTotalAmount() >= (shopInfo?.minimum_order ?? 200)
                              ? t('freeLabel')
                              : `${shopInfo?.delivery_charges || 90} kr`)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                      <span>{t('total')}</span>
                      <span className="text-red-600">
                        {(
                          getTotalAmount() +
                          (shopInfo?.minimum_order === 1
                            ? (shopInfo?.delivery_charges ?? 90)
                            : (getTotalAmount() >= (shopInfo?.minimum_order ?? 200)
                                ? 0
                                : (shopInfo?.delivery_charges ?? 90)))
                        ).toFixed(2)} kr
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}