import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { OrderItem, Product } from '../types';

export function PreOrderPage() {
  const { t, currentLanguage } = useLanguage(); // Added currentLanguage
  const { items, updateQuantity, removeItem, getTotalAmount, clearCart } = useCart();
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
  const [isShopOpen, setIsShopOpen] = useState<boolean>(true);
  const [checkingShopStatus, setCheckingShopStatus] = useState(true);
  // Add state to store full product details
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});

  useEffect(() => {
    checkShopStatus();
    loadProductDetails();
  }, []);

  // Add function to load product details
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

  // Add helper function to get correct product name based on language
  const getProductName = (item: {product_id: string, product_name: string}) => {
    const product = productDetails[item.product_id];
    if (!product) return item.product_name;
    
    return currentLanguage.code === 'no' ? product.name_no : product.name_en;
  };

  const checkShopStatus = async () => {
    try {
      setCheckingShopStatus(true);
      const status = await api.shop.isOpen();
      setIsShopOpen(status.is_open);

      if (!status.is_open) {
        setError(t('shopClosedDesc'));
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

    // Re-check shop status before submitting
    try {
      const status = await api.shop.isOpen();
      setIsShopOpen(status.is_open);
      
      if (!status.is_open) {
        setError(t('shopClosedDesc'));
        return;
      }
    } catch (err) {
      console.error('Error checking shop status:', err);
      setError(t('error'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pickupDate = new Date();
      pickupDate.setMinutes(pickupDate.getMinutes() + 30);
      const pickupTime = pickupDate.toISOString();

      const orderItems: OrderItem[] = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: item.product_name,
        price: item.price
      }));

      const orderData = {
        customer_name: customerInfo.name,
        contact_number: customerInfo.phone || undefined,
        items: orderItems,
        pickup_time: pickupTime
      };

      const response = await api.orders.createPreorder(orderData);

      setOrderToken(response.token);
      setOrderId(response.order_id);
      setOrderSuccess(true);

      await clearCart();
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 sm:mx-0"
        >
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('orderSuccessTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('preorderConfirmed')}</p>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">{t('orderId')}</p>
              <p className="text-lg font-bold text-gray-900 break-words">{orderId}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-6 border-2 border-red-200">
              <p className="text-sm text-gray-600 mb-1">{t('pickupTokenLabel')}</p>
              <p className="text-2xl font-bold text-red-600 break-words">{orderToken}</p>
            </div>

            {/* <p className="text-sm text-gray-600 mb-6">{t('pickupTimeInfo')}</p> */}

            <button
              onClick={() => (window.location.href = '/')}
              className="w-full sm:w-auto sm:px-8 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              {t('backToHome')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('preorderTitle') || t('preorder')}</h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto px-2">{t('reviewOrderDesc')}</p>
        </motion.div>

        {!isShopOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
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
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">{t('cartEmptyTitle')}</h2>
            <p className="text-gray-500 mb-6">{t('cartEmptyDesc')}</p>
            <a href="/menu" className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
              {t('browseMenu')}
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cart Items */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('cart')}</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div key={item.product_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Use getProductName to display the correct language version */}
                          <h3 className="font-medium text-gray-900 truncate">{getProductName(item)}</h3>
                          <p className="text-sm text-gray-600">{item.price} kr {t('each', 'hver', 'each')}</p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                          <div className="flex items-center space-x-2 bg-gray-50 rounded-md px-2 py-1">
                            <button aria-label="decrease" onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-2 rounded-md hover:bg-gray-100">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button aria-label="increase" onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-2 rounded-md hover:bg-gray-100">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="ml-auto sm:ml-4 text-right">
                            <span className="font-semibold text-red-600 block">{(item.price * item.quantity).toFixed(2)} kr</span>
                          </div>

                          <button aria-label="remove" onClick={() => removeItem(item.product_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="bg-white rounded-lg p-4 shadow-sm border-t-2 border-red-600">
                  <div className="flex flex-col sm:flex-row items-center justify-between text-lg font-semibold">
                    <span>{t('total')}</span>
                    <span className="text-red-600">{getTotalAmount().toFixed(2)} kr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('customer')}</h2>
              <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm md:sticky md:top-20">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('name')} *</label>
                    <input type="text" id="name" required value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder={t('yourNamePlaceholder')} disabled={!isShopOpen} />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} *</label>
                    <input type="tel" id="phone" required value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="+47 xxx xx xxx" disabled={!isShopOpen} />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('email')} ({t('optional')})</label>
                    <input type="email" id="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="din@epost.no" disabled={!isShopOpen} />
                  </div>

                  {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">{t('pickupTimeInfo')}</p>
                  </div> */}
                </div>

                <motion.button whileHover={{ scale: isShopOpen ? 1.02 : 1 }} whileTap={{ scale: isShopOpen ? 0.98 : 1 }} type="submit" disabled={loading || items.length === 0 || !isShopOpen} className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {loading ? t('processing') : (!isShopOpen ? t('shopClosedTitle') : t('confirmOrderBtn'))}
                </motion.button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}