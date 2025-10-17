import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Package, AlertCircle, CheckCircle, Truck, ChevronRight, X, MapPin, Loader, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import { OrderResponse } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { DateTime } from 'luxon';

export function MyOrdersPage() {
  const { t, currentLanguage } = useLanguage();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  // Periodically refresh statuses only (every 60s)
  useEffect(() => {
    const refreshStatuses = async () => {
      try {
        const latest = await api.orders.getMyOrders();
        if (!Array.isArray(latest) || latest.length === 0) return;

        setOrders(prev => {
          const statusMap = new Map<string, string>();
          latest.forEach(o => statusMap.set(o.id, o.status));

          const validStatuses = new Set<OrderResponse['status']>([
            'pending', 'approved', 'ready', 'rejected', 'completed', 'delivered',
          ]);
          const isValidStatus = (s: string): s is OrderResponse['status'] => validStatuses.has(s as OrderResponse['status']);

          return prev.map(o => {
            const newStatus = statusMap.get(o.id);
            if (newStatus && newStatus !== o.status && isValidStatus(newStatus)) {
              return { ...o, status: newStatus };
            }
            return o;
          });
        });
      } catch (err) {
        console.error('Error refreshing order statuses:', err);
      }
    };

    const interval = setInterval(refreshStatuses, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const myOrders = await api.orders.getMyOrders();
      console.log("all orders",myOrders)

      myOrders.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(myOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(t('couldNotLoadOrders', 'Kunne ikke laste bestillingene dine. Vennligst prøv igjen senere.', 'Could not load your orders. Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: OrderResponse) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <Loader className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    const translated = t(status);
    if (translated && translated !== status) return translated;
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Prefer Luxon to reliably parse ISO timestamps and render Oslo wall-clock time
    const dt = DateTime.fromISO(dateString);
    if (dt.isValid) {
      const oslo = dt.setZone('Europe/Oslo');
      const locale = currentLanguage?.code === 'no' ? 'nb-NO' : 'en-US';
      return oslo.setLocale(locale).toFormat('dd LLL yyyy HH:mm');
    }
    // Fallback to native Intl
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(
      currentLanguage.code === 'no' ? 'nb-NO' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }
    ).format(d);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingOrders', 'Laster bestillinger...', 'Loading orders...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('myOrders')}</h1>
            <Link to="/" className="text-red-600 hover:text-red-800 font-medium text-sm">
              {t('backToHome')}
            </Link>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">{t('myOrdersDesc', 'Se status og detaljer for alle dine bestillinger', 'View status and details for all your orders')}</p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {orders.length === 0 && !error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
            <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">{t('noOrdersYet', 'Ingen bestillinger ennå', 'No orders yet')}</h2>
            <p className="text-gray-500 mb-4">{t('noOrdersDesc', 'Du har ikke plassert noen bestillinger ennå', "You haven't placed any orders yet")}</p>
            <Link to="/menu" className="inline-flex items-center px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
              {t('browseMenu')}
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs text-gray-500">{t('orderId')}</span>
                      <p className="font-mono text-sm font-medium text-gray-700 truncate">{order.order_id}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${order.order_type === 'preorder' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'}`}>
                        <span className="text-xs">{order.order_type === 'preorder' ? t('preOrder') : t('delivery')}</span>
                      </span>

                      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <span className="flex items-center">{getStatusIcon(order.status)}</span>
                        <span className="text-xs">{getStatusText(order.status)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{formatDate(order.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{order.items.length} {t('items')}</span>
                      </div>

                      {order.delivery_address && (
                        <div className="flex items-center gap-2 text-sm max-w-full">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 text-sm truncate max-w-[18rem] sm:max-w-[28rem] break-words">{order.delivery_address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <button onClick={() => handleViewDetails(order)} className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm w-full sm:w-auto">
                        <span>{t('viewDetails')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-sm text-gray-500">
                      {t('pickupTokenLabel')}: <span className="ml-2 font-mono font-medium text-red-600">{order.token}</span>
                    </div>
                    {/* reserved for possible actions / totals on larger screens */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedOrder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailsModal(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{t('orderDetails')}</h3>
                    <p className="text-sm text-gray-600 mt-1 truncate">ID: {selectedOrder.order_id}</p>
                  </div>
                  <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('status')}</p>
                        <p className="font-medium text-gray-900">{getStatusText(selectedOrder.status)}</p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-0">
                      <p className="text-sm text-gray-600">{t('type')}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${selectedOrder.order_type === 'preorder' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'}`}>
                        {selectedOrder.order_type === 'preorder' ? t('preOrder') : t('delivery')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{t('orderedItems', 'Bestilte Varer', 'Ordered Items')}</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                            <p className="text-sm text-gray-600">{t('quantity')}: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{t('orderDetails')}</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>{t('orderedOn', 'Bestilt den', 'Ordered on')}</span>
                        <span className="text-gray-900">{formatDate(selectedOrder.created_at)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>{t('pickupTokenLabel')}</span>
                        <span className="font-mono font-medium text-red-600">{selectedOrder.token}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.order_type === 'delivery' && selectedOrder.delivery_address && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">{t('deliveryInformation', 'Leveringsinformasjon', 'Delivery Information')}</h4>
                      <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{selectedOrder.delivery_address}</p>
                            {selectedOrder.postal_code && <p className="text-sm text-gray-600">{selectedOrder.postal_code}</p>}
                          </div>
                        </div>
                        {selectedOrder.distance_from_shop && (
                          <p className="text-sm text-gray-600">{t('distanceLabel', 'Avstand', 'Distance')}: {selectedOrder.distance_from_shop.toFixed(2)} km</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{t('orderTracking', 'Ordresporing', 'Order Tracking')}</h4>
                    <div className="relative">
                      <div className="absolute top-0 left-4 h-full w-0.5 bg-gray-200"></div>
                      <div className="space-y-6 relative pl-8">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full p-2 ${getStatusColor(selectedOrder.status)} z-10`}>{getStatusIcon(selectedOrder.status)}</div>
                          <div>
                            <p className="font-medium">{getStatusText(selectedOrder.status)}</p>
                            <p className="text-sm text-gray-600">{formatDate(selectedOrder.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setShowDetailsModal(false)} className="mt-4 w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">
                    {t('close')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}