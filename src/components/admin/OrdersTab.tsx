import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Eye, X, Clock, MapPin, Phone, User, Package } from 'lucide-react';
import { OrderResponse, Product, OrdersTabProps, EnrichedOrderItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

export function OrdersTab({ orders, onUpdateStatus }: OrdersTabProps) {
  const { t, currentLanguage } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [enrichedItems, setEnrichedItems] = useState<EnrichedOrderItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // local orders state to allow polling without relying on parent to update
  const [localOrders, setLocalOrders] = useState<OrderResponse[]>(orders);

  // keep localOrders synced with parent prop changes
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Poll orders list from backend every 60 seconds
  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      try {
        const all = await api.orders.getAllOrders?.() ?? ([] as OrderResponse[]);
        if (!mounted) return;
        if (Array.isArray(all)) setLocalOrders(all);
      } catch (err) {
        console.error('Error polling orders list:', err);
      }
    };

    // initial fetch + interval
    fetchOrders();
    const id = setInterval(fetchOrders, 60000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // fetch enriched items for a given order (extracted so it can be reused by polling)
  const fetchEnrichedItems = async (order: OrderResponse | null) => {
    if (!order) return;
    setLoadingDetails(true);

    try {
      const productPromises = order.items.map(async (item) => {
        try {
          const product: Product = await api.products.getById(item.product_id);
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            product_name: product.name_en,
            price: product.price,
            description_en: product.description_en,
            description_no: product.description_no,
            image_url: product.image_url,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product_id}:`, error);
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            product_name: item.product_name || 'Unknown Product',
            price: item.price || 0,
          };
        }
      });

      const enrichedItemsData = await Promise.all(productPromises);
      setEnrichedItems(enrichedItemsData);
    } catch (error) {
      console.error('Error enriching order items:', error);
      if (order) {
        setEnrichedItems(order.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          product_name: item.product_name || 'Unknown Product',
          price: item.price || 0,
        })));
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (order: OrderResponse) => {
    // prefer the latest version from localOrders if available
    const latest = localOrders.find(o => o.id === order.id) ?? order;
    setSelectedOrder(latest);
    setShowDetailsModal(true);
    await fetchEnrichedItems(latest);
  };

  // Poll details when modal is open — refresh every 20 seconds
  useEffect(() => {
    if (!showDetailsModal || !selectedOrder) return;
    const interval = setInterval(() => {
      // re-fetch enriched items for the selected order
      const latest = localOrders.find(o => o.id === selectedOrder.id) ?? selectedOrder;
      fetchEnrichedItems(latest);
    }, 20000);

    return () => clearInterval(interval);
  }, [showDetailsModal, selectedOrder, localOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add this helper function at the component level
  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(currentLanguage.code === 'no' ? 'nb-NO' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Oslo',
      hour12: false
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('orderManagement')}</h3>
          <p className="text-sm text-gray-600 mt-1">{t('totalOrders')}: {localOrders.length}</p>
        </div>

        {/* Desktop table (md and up) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('orderId')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customer')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('items')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('token')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {localOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.contact_number}</p>
                      {order.delivery_address && (
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {order.delivery_address}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.order_type === 'preorder' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.order_type === 'preorder' ? t('preOrder') : t('deliveryLabel')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.items.length}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{order.token}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {t(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-800"
                        title={t('viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(order.id, order.order_id, order.order_type, 'approved')}
                            className="text-green-600 hover:text-green-800"
                            title={t('approve')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(order.id, order.order_id, order.order_type, 'rejected')}
                            className="text-red-600 hover:text-red-800"
                            title={t('reject')}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {order.status === 'approved' && order.order_type === 'preorder' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, order.order_id, order.order_type, 'completed')}
                          className="text-blue-600 hover:text-blue-800"
                          title={t('markAsCompleted')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {order.status === 'approved' && order.order_type === 'delivery' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, order.order_id, order.order_type, 'delivered')}
                          className="text-purple-600 hover:text-purple-800"
                          title={t('markAsDelivered')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {localOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">{t('noOrdersFound')}</p>
            </div>
          )}
        </div>

        {/* Mobile list (smaller screens) */}
        <div className="md:hidden p-4 space-y-3">
          {localOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">{t('noOrdersFound')}</p>
            </div>
          ) : (
            localOrders.map(order => (
              <div key={order.id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t('orderId')}</p>
                    <p className="font-medium text-gray-900 truncate">{order.order_id}</p>
                    <p className="text-sm text-gray-600 truncate">{order.customer_name}</p>
                    {order.delivery_address && <p className="text-sm text-gray-500 truncate">{order.delivery_address}</p>}
                  </div>

                  <div className="flex-shrink-0 text-right space-y-2">
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {t(order.status)}
                      </span>
                    </div>
                    <div>
                      <button onClick={() => handleViewDetails(order)} className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200">
                        <Eye className="w-4 h-4 mr-2" /> {t('view')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${order.order_type === 'preorder' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'}`}>
                      {order.order_type === 'preorder' ? t('preOrder') : t('deliveryLabel')}
                    </span>
                    <span>{order.items.length} {t('items')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => onUpdateStatus(order.id, order.order_id, order.order_type, 'approved')} className="text-green-600">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => onUpdateStatus(order.id, order.order_id, order.order_type, 'rejected')} className="text-red-600">
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('orderDetails')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('orderId')}: {selectedOrder.order_id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('status')}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                        {t(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <p className="text-sm text-gray-600">{t('type')}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                      selectedOrder.order_type === 'preorder' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedOrder.order_type === 'preorder' ? t('preOrder') : t('deliveryLabel')}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('customer')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <User className="w-4 h-4" />
                      <span>{selectedOrder.customer_name}</span>
                    </div>
                    {selectedOrder.contact_number && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Phone className="w-4 h-4" />
                        <span>{selectedOrder.contact_number}</span>
                      </div>
                    )}
                    {selectedOrder.delivery_address && (
                      <div className="flex items-start space-x-2 text-gray-700">
                        <MapPin className="w-4 h-4 mt-1" />
                        <div>
                          <p>{selectedOrder.delivery_address}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.postal_code}</p>
                          {selectedOrder.distance_from_shop && (
                            <p className="text-sm text-gray-600 mt-1">
                              {t('orderCreatedLabel')}: {selectedOrder.distance_from_shop.toFixed(2)} km
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedOrder.pickup_time && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span>{t('orderCreatedLabel')}: {new Date(selectedOrder.pickup_time).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('items')}</h4>
                  
                  {loadingDetails ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">{t('loadingProductDetails')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enrichedItems.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                          {/* Product Image */}
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-full sm:w-20 h-20 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full sm:w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 mb-1 line-clamp-2">
                              {item.product_name}
                            </h5>
                            
                            {item.description_en && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.description_en}
                              </p>
                            )}
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-3">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{t('quantityLabel')}: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                                <span>{t('priceLabel')}: <span className="font-medium text-gray-900">{item.price} kr</span></span>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{t('subtotal')}</p>
                                <p className="font-semibold text-gray-900">
                                  {(item.price * item.quantity).toFixed(2)} kr
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-2">
                              ID: {item.product_id}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order Total */}
                  {!loadingDetails && enrichedItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">{t('orderTotal')}</span>
                        <span className="text-xl font-bold text-red-600">
                          {enrichedItems.reduce((sum, item) => 
                            sum + (item.price * item.quantity), 0
                          ).toFixed(2)} kr
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Token */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('orderTokenLabel')}</h4>
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-center font-mono text-2xl font-bold text-red-600">
                      {selectedOrder.token}
                    </p>
                  </div>
                </div>

                {/* Order Date */}
                <div className="border-t pt-4 text-sm text-gray-600">
                  <p>{t('orderCreatedLabel')}: {formatOrderDate(selectedOrder.created_at)}</p>
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 gap-3">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          onUpdateStatus(selectedOrder.id, selectedOrder.order_id, selectedOrder.order_type, 'approved');
                          setShowDetailsModal(false);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('approve')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onUpdateStatus(selectedOrder.id, selectedOrder.order_id, selectedOrder.order_type, 'rejected');
                          setShowDetailsModal(false);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{t('reject')}</span>
                      </button>
                    </>
                  )}
                  
                  {selectedOrder.status === 'approved' && selectedOrder.order_type === 'preorder' && (
                    <button
                      onClick={() => {
                        onUpdateStatus(selectedOrder.id, selectedOrder.order_id, selectedOrder.order_type, 'completed');
                        setShowDetailsModal(false);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('markAsCompleted')}</span>
                    </button>
                  )}
                  
                  {selectedOrder.status === 'approved' && selectedOrder.order_type === 'delivery' && (
                    <button
                      onClick={() => {
                        onUpdateStatus(selectedOrder.id, selectedOrder.order_id, selectedOrder.order_type, 'delivered');
                        setShowDetailsModal(false);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('markAsDelivered')}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}