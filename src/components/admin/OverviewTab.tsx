import { useEffect, useState } from 'react';
import { BarChart3, Clock, Package, Users } from 'lucide-react';
import { OrderResponse, Category, Product, OverviewTabProps } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';


export function OverviewTab({ orders, categories, products }: OverviewTabProps) {
  const { t } = useLanguage();

  // local state to allow polling updates independent from parent
  const [localOrders, setLocalOrders] = useState<OrderResponse[]>(orders);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);

  // keep local state in sync when parent props change
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  // poll backend every 60s to refresh overview data
  useEffect(() => {
    let mounted = true;
    const fetchOverview = async () => {
      try {
        const [o, c, p] = await Promise.all([
          api.orders.getAllOrders?.() ?? api.orders.getAllPreorders?.().then(pre => pre || []), // fallback if implementations vary
          api.categories.getAll(),
          api.products.getAll()
        ]);
        if (!mounted) return;
        if (Array.isArray(o)) setLocalOrders(o);
        if (Array.isArray(c)) setLocalCategories(c);
        if (Array.isArray(p)) setLocalProducts(p);
      } catch (err) {
        console.error('Error polling overview data:', err);
      }
    };

    // initial fetch and interval
    fetchOverview();
    const id = setInterval(fetchOverview, 60000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">{t('totalOrders')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{localOrders.length}</p>
            </div>
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">{t('pendingOrders')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {localOrders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">{t('totalProducts')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{localProducts.length}</p>
            </div>
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">{t('categories')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{localCategories.length}</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{t('recentOrders')}</h3>
        <div className="space-y-3">
          {localOrders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{order.customer_name}</p>
                <p className="text-sm text-gray-600 truncate">
                  {order.order_type === 'preorder' ? t('preOrder') : t('deliveryLabel')} • {order.items.length} {t('items')}
                </p>
                {order.token && (
                  <p className="text-xs font-mono text-gray-700 mt-1 truncate max-w-[18rem] sm:max-w-[24rem]">
                    {t('token')}: {order.token}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 mt-2 sm:mt-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'approved' ? 'bg-blue-100 text-blue-800' : order.status === 'ready' ? 'bg-green-100 text-green-800' : order.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {t(order.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}