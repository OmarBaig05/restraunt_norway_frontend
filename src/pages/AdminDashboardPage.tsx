import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Package, Clock, LogOut, Settings, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { Category, Product, OrderResponse, ShopInfo, WorkingHours } from '../types';
import { OverviewTab } from '../components/admin/OverviewTab';
import { OrdersTab } from '../components/admin/OrdersTab';
import { MenuTab } from '../components/admin/MenuTab';
import { ShopSettingsTab } from '../components/admin/ShopSettingsTab';
import { AdminModal } from '../components/admin/AdminModal';
import { useLanguage } from '../contexts/LanguageContext';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'product' | 'shopInfo' | 'workingHours' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // language
  const { t, toggleLanguage, getLanguageDisplay } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [allOrders, categoriesData, productsData, shopInfoData, workingHoursData] = await Promise.all([
        api.orders.getAllOrders(),
        api.categories.getAll(),
        api.products.getAll(),
        api.shop.getInfo().catch(() => null),
        api.shop.getWorkingHours().catch(() => [])
      ]);
      
      setOrders(allOrders);
      setCategories(categoriesData);
      setProducts(productsData);
      setShopInfo(shopInfoData);
      setWorkingHours(workingHoursData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const updateOrderStatus = async (
    orderId: string,
    orderIdString: string,
    orderType: 'preorder' | 'delivery', 
    newStatus: "pending" | "approved" | "ready" | "rejected" | "completed" | "delivered"
  ) => {
    try {
      setLoading(true);
      
      let response;
      
      if (orderType === 'preorder') {
        if (newStatus === 'approved') {
          response = await api.orders.approvePreorder(orderIdString);
        } else if (newStatus === 'completed') {
          response = await api.orders.completePreorder(orderIdString);
        } else if (newStatus === 'rejected') {
          response = await api.orders.rejectPreorder(orderIdString);
        }
      } else if (orderType === 'delivery') {
        if (newStatus === 'approved') {
          response = await api.orders.approveDeliveryOrder(orderIdString);
        } else if (newStatus === 'delivered') {
          response = await api.orders.completeDeliveryOrder(orderIdString);
        } else if (newStatus === 'rejected') {
          response = await api.orders.rejectDeliveryOrder(orderIdString);
        }
      }
      
      if (response) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? {...order, status: newStatus} : order
          )
        );
      }
    } catch (error) {
      console.error(`Error updating order ${orderIdString} status to ${newStatus}:`, error);
      alert(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setSaveSuccess(false);
    setSaveError('');
    
    try {
      if (modalType === 'category') {
        const categoryData = {
          name_en: formData.get('nameEn') as string,
          name_no: formData.get('nameNo') as string,
        };

        if (editingItem) {
          await api.categories.update(editingItem.id, categoryData);
        } else {
          await api.categories.create(categoryData);
        }
        await loadDashboardData();
        setSaveSuccess(true);
        setTimeout(() => closeModal(), 1500);
      } else if (modalType === 'product') {
        let imageUrl = formData.get('imageUrl') as string;
        const hasUploadedFile = formData.get('uploadedFile') === 'true';
        
        if (hasUploadedFile) {
          const fileInput = document.getElementById('image-upload') as HTMLInputElement;
          const file = fileInput?.files?.[0];
          
          if (file) {
            try {
              const uploadResponse = await api.images.upload(file);
              imageUrl = uploadResponse.image_url;
              
              if (editingItem?.image_url && editingItem.image_url.includes('/static/images/')) {
                await api.images.delete(editingItem.image_url).catch(err => 
                  console.warn('Failed to delete old image:', err)
                );
              }
            } catch (uploadError) {
              setSaveError('Failed to upload image: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'));
              return;
            }
          }
        }

        const productData = {
          category_name: formData.get('categoryName') as string,
          name_en: formData.get('nameEn') as string,
          name_no: formData.get('nameNo') as string,
          description_en: formData.get('descriptionEn') as string,
          description_no: formData.get('descriptionNo') as string,
          price: parseFloat(formData.get('price') as string),
          image_url: imageUrl || '',
          prep_time: parseInt(formData.get('prepTime') as string) || 30,
        };

        if (editingItem) {
          await api.products.update(editingItem.id, productData);
        } else {
          await api.products.create(productData);
        }
        await loadDashboardData();
        setSaveSuccess(true);
        setTimeout(() => closeModal(), 1500);
      } else if (modalType === 'shopInfo') {
        const shopData = {
          shop_name: formData.get('shopName') as string,
          address: formData.get('address') as string,
          phone: formData.get('phone') as string,
          email: formData.get('email') as string,
          lat: parseFloat(formData.get('lat') as string),
          lng: parseFloat(formData.get('lng') as string),
          delivery_radius: parseFloat(formData.get('deliveryRadius') as string),
          minimum_order: parseFloat(formData.get('minimumOrder') as string),
          delivery_charges: parseFloat(formData.get('deliveryCharges') as string),
        };

        await api.shop.updateInfo(shopData);
        await loadDashboardData();
        setSaveSuccess(true);
        setTimeout(() => closeModal(), 1500);
      } else if (modalType === 'workingHours') {
        const hoursData = {
          day: formData.get('day') as string,
          is_open: formData.get('isOpen') === 'true',
          opening_time: formData.get('openingTime') as string,
          closing_time: formData.get('closingTime') as string,
        };

        await api.shop.updateWorkingHours(hoursData);
        await loadDashboardData();
        setSaveSuccess(true);
        setTimeout(() => closeModal(), 1500);
      }
    } catch (error) {
      console.error('Error saving:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const msg = t('confirmDeleteCategory');
    if (!confirm(msg)) return;
    
    try {
      await api.categories.delete(categoryId);
      await loadDashboardData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to delete category');
      setTimeout(() => setSaveError(''), 3000);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const msg = t('confirmDeleteProduct');
    if (!confirm(msg)) return;
    
    try {
      await api.products.delete(productId);
      await loadDashboardData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to delete product');
      setTimeout(() => setSaveError(''), 3000);
    }
  };

  const openModal = (type: 'category' | 'product' | 'shopInfo' | 'workingHours', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setSaveSuccess(false);
    setSaveError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setEditingItem(null);
    setSaveSuccess(false);
    setSaveError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {(saveSuccess || saveError) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-3 rounded-lg shadow-lg ${saveSuccess ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {saveSuccess ? t('savedSuccess') : saveError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">FG</span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{t('admin')} {t('dashboard')}</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 justify-end">
              <button
                onClick={toggleLanguage}
                title="Toggle language"
                className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 transition-colors text-sm"
              >
                <span className="text-sm font-medium text-gray-700 uppercase">{getLanguageDisplay()}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1 text-gray-700 hover:text-red-600 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm mb-4">
          {/* Desktop tab nav */}
          <nav className="hidden sm:flex items-center gap-4 px-4 overflow-x-auto whitespace-nowrap">
            {[
              { id: 'overview', label: t('dashboard'), icon: BarChart3 },
              { id: 'orders', label: t('orders'), icon: Clock },
              { id: 'menu', label: t('menu'), icon: Package },
              { id: 'shop', label: t('manageMenu'), icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden sr-only">{label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile tab selector - styled and responsive */}
          <div className="sm:hidden px-3 py-2">
            <label htmlFor="admin-tab-select" className="sr-only">Select tab</label>
            <div className="relative">
              <select
                id="admin-tab-select"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="block w-full appearance-none bg-white border border-gray-200 rounded-md py-2 pl-3 pr-10 text-sm text-gray-700 shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                aria-label={t('selectTab') || 'Select tab'}
              >
                <option value="overview">{t('dashboard')}</option>
                <option value="orders">{t('orders')}</option>
                <option value="menu">{t('menu')}</option>
                <option value="shop">{t('manageMenu')}</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="space-y-6">
            {/* Each tab content should be responsible for its own responsiveness.
                We wrap tabs in responsive container classes to ensure consistent spacing. */}
            <div className="w-full">
              {activeTab === 'overview' && (
                <OverviewTab 
                  orders={orders}
                  categories={categories}
                  products={products}
                />
              )}
              {activeTab === 'orders' && (
                <OrdersTab 
                  orders={orders}
                  onUpdateStatus={updateOrderStatus}
                />
              )}
              {activeTab === 'menu' && (
                <MenuTab
                  categories={categories}
                  products={products}
                  onAddCategory={() => openModal('category')}
                  onAddProduct={() => openModal('product')}
                  onEditCategory={(category) => openModal('category', category)}
                  onEditProduct={(product) => openModal('product', product)}
                  onDeleteCategory={handleDeleteCategory}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}
              {activeTab === 'shop' && (
                <ShopSettingsTab
                  shopInfo={shopInfo}
                  workingHours={workingHours}
                  onEditShopInfo={(info) => openModal('shopInfo', info)}
                  onAddUpdateHours={() => openModal('workingHours')}
                  onEditWorkingHours={(hours) => openModal('workingHours', hours)}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        <AdminModal
          isOpen={showModal}
          modalType={modalType}
          editingItem={editingItem}
          categories={categories}
          saveSuccess={saveSuccess}
          saveError={saveError}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
        />
      </AnimatePresence>
    </div>
  );
}