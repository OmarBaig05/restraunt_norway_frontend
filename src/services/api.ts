import {
  OrderResponse,
  PreorderCreate,
  DeliveryOrderCreate,
  Category,
  Product,
  CartResponse,
  ShopInfo,
  WorkingHours,
  ImageUploadResponse,
} from '../types';
import {
  checkAndRefreshSession,
  clearSessionId
} from '../utils/sessionManager';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function to make fetch requests with session handling
const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const sessionId = checkAndRefreshSession();
  
  const headers = {
    'Content-Type': 'application/json',
    'session-id': sessionId,
    'x-session-id': sessionId,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      clearSessionId();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Helper function for file uploads (without JSON content-type)
const apiUpload = async (endpoint: string, formData: FormData): Promise<any> => {
  const sessionId = checkAndRefreshSession();
  
  const headers = {
    'session-id': sessionId,
    'x-session-id': sessionId,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      clearSessionId();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Upload Error:', error);
    throw error;
  }
};

// API Methods
export const api = {
  // Categories
  categories: {
    getAll: async (): Promise<Category[]> => {
      return await apiFetch('/menu/categories/');
    },
    getById: async (id: string): Promise<Category> => {
      return await apiFetch(`/menu/categories/${id}`);
    },
    create: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
      return await apiFetch('/menu/categories/', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
    },
    update: async (id: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<Category> => {
      return await apiFetch(`/menu/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });
    },
    delete: async (id: string): Promise<{ message: string }> => {
      return await apiFetch(`/menu/categories/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Products
  products: {
    getAll: async (): Promise<Product[]> => {
      return await apiFetch('/menu/products/');
    },
    getById: async (id: string): Promise<Product> => {
      return await apiFetch(`/menu/products/${id}`);
    },
    getByCategory: async (categoryName: string): Promise<Product[]> => {
      return await apiFetch(`/menu/products/categories/${categoryName}`);
    },
    create: async (productData: Omit<Product, 'id'>): Promise<Product> => {
      return await apiFetch('/menu/products/', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },
    update: async (id: string, productData: Partial<Omit<Product, 'id'>>): Promise<Product> => {
      return await apiFetch(`/menu/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    },
    delete: async (id: string): Promise<{ message: string }> => {
      return await apiFetch(`/menu/products/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Cart
  cart: {
    get: async (): Promise<CartResponse> => {
      return await apiFetch('/cart/');
    },
    add: async (productId: string, quantity: number = 1): Promise<{ message: string }> => {
      return await apiFetch('/cart/add/', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });
    },
    update: async (productId: string, quantity: number): Promise<{ message: string }> => {
      return await apiFetch('/cart/update/', {
        method: 'PUT',
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });
    },
    remove: async (productId: string): Promise<{ message: string }> => {
      return await apiFetch(`/cart/${productId}`, {
        method: 'DELETE',
      });
    },
    clear: async (): Promise<{ message: string }> => {
      return await apiFetch('/cart/clear/', {
        method: 'POST',
      });
    },
  },

  // Orders
  orders: {
    createPreorder: async (
      orderData: Omit<PreorderCreate, 'session_id'>
    ): Promise<{ order_id: string; token: string; message: string }> => {
      const sessionId = checkAndRefreshSession();
      return await apiFetch('/orders/preorder/', {
        method: 'POST',
        body: JSON.stringify({
          ...orderData,
          session_id: sessionId,
        }),
      });
    },
    
    createDeliveryOrder: async (
      orderData: Omit<DeliveryOrderCreate, 'session_id'>
    ): Promise<{ order_id: string; token: string; distance: number; message: string }> => {
      const sessionId = checkAndRefreshSession();
      return await apiFetch('/orders/delivery/', {
        method: 'POST',
        body: JSON.stringify({
          ...orderData,
          session_id: sessionId,
        }),
      });
    },
    
    getBySessionId: async (sessionId?: string): Promise<OrderResponse[]> => {
      const sid = sessionId || checkAndRefreshSession();
      return await apiFetch(`/orders/session/${sid}`);
    },
    
    getMyOrders: async (): Promise<OrderResponse[]> => {
      return api.orders.getBySessionId();
    },
    
    getAllPreorders: async (): Promise<OrderResponse[]> => {
      // Replace the session-filtered approach with an admin endpoint call
      return await apiFetch('/orders/preorder/');
    },
    
    getAllDeliveryOrders: async (): Promise<OrderResponse[]> => {
      return await apiFetch('/orders/delivery/');
    },
    
    getAllOrders: async (): Promise<OrderResponse[]> => {
      // For admin: get all orders from both types
      const [preorders, deliveryOrders] = await Promise.all([
        api.orders.getAllPreorders(),
        api.orders.getAllDeliveryOrders()
      ]);
      return [...preorders, ...deliveryOrders].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    
    approvePreorder: async (orderId: string): Promise<{ message: string }> => {
      return await apiFetch(`/orders/preorder/${orderId}/approve/`, {
        method: 'PUT',
      });
    },
    
    completePreorder: async (orderId: string): Promise<{ message: string }> => {
      return await apiFetch(`/orders/preorder/${orderId}/complete/`, {
        method: 'PUT',
      });
    },
    
    approveDeliveryOrder: async (orderId: string): Promise<{ message: string }> => {
      return await apiFetch(`/orders/delivery/${orderId}/approve/`, {
        method: 'PUT',
      });
    },
    
    rejectDeliveryOrder: async (orderId: string): Promise<{ message: string }> => {
      return await apiFetch(`/orders/delivery/${orderId}/reject/`, {
        method: 'PUT',
      });
    },
    
    completeDeliveryOrder: async (orderId: string): Promise<{ message: string }> => {
      return await apiFetch(`/orders/delivery/${orderId}/complete/`, {
        method: 'PUT',
      });
    },
    
    rejectPreorder: async (orderId: string): Promise<{ message: string }> => {
      return await apiFetch(`/orders/preorder/${orderId}/reject/`, {
        method: 'PUT',
      });
    },
    
    cleanupSession: async (sessionId?: string): Promise<{ message: string; deleted_count: number }> => {
      const sid = sessionId || checkAndRefreshSession();
      return await apiFetch(`/orders/cleanup/${sid}`, {
        method: 'DELETE',
      });
    },
  },

  // Shop Info
  shop: {
    getInfo: async (): Promise<ShopInfo> => {
      return await apiFetch('/shop/info/');
    },
    updateInfo: async (shopData: Omit<ShopInfo, 'id'>): Promise<ShopInfo> => {
      return await apiFetch('/shop/info/', {
        method: 'POST',
        body: JSON.stringify(shopData),
      });
    },
    getWorkingHours: async (): Promise<WorkingHours[]> => {
      return await apiFetch('/shop/hours/');
    },
    updateWorkingHours: async (hoursData: Omit<WorkingHours, 'id'>): Promise<WorkingHours> => {
      return await apiFetch('/shop/hours/', {
        method: 'POST',
        body: JSON.stringify(hoursData),
      });
    },
    isOpen: async (): Promise<{ is_open: boolean; message: string }> => {
      return await apiFetch('/shop/is-open/');
    },
  },

  // Admin
  admin: {
    login: async (email: string, password: string): Promise<{ message: string }> => {
      return await apiFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });
    },
  },

  // Images
  images: {
    upload: async (file: File): Promise<ImageUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      return await apiUpload('/images/upload/', formData);
    },
    delete: async (imageUrl: string): Promise<{ message: string }> => {
      return await apiFetch(`/images/delete/?image_url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });
    },
  },
};

// normalize admin login for frontend components
export const apiService = {
  async adminLogin(email: string, password: string): Promise<{ token: string }> {
    try {
      const response = await api.admin.login(email, password) as any;

      if (response && typeof response.token === 'string' && response.token.length > 0) {
        return { token: response.token };
      }

      const message = typeof response?.message === 'string' ? response.message : '';
      if (/success/i.test(message)) {
        const token = btoa(`${email}:${Date.now()}`);
        return { token };
      }

      throw new Error('Authentication failed');
    } catch (err) {
      console.error('Admin login API Error:', err);
      throw err;
    }
  },

  async getCart(): Promise<CartResponse> {
    return await api.cart.get();
  },

  async addToCart(productId: string, quantity: number): Promise<{ message: string }> {
    return await api.cart.add(productId, quantity);
  },

  async updateCartItem(productId: string, quantity: number): Promise<{ message: string }> {
    return await api.cart.update(productId, quantity);
  },

  async removeFromCart(productId: string): Promise<{ message: string }> {
    return await api.cart.remove(productId);
  },

  async clearCart(): Promise<{ message: string }> {
    return await api.cart.clear();
  },

  // Categories methods
  async getCategories(): Promise<Category[]> {
    return await api.categories.getAll();
  },

  async getCategoryById(id: string): Promise<Category> {
    return await api.categories.getById(id);
  },

  // Products methods
  async getProducts(): Promise<Product[]> {
    return await api.products.getAll();
  },

  async getProductById(id: string): Promise<Product> {
    return await api.products.getById(id);
  },

  async getProductsByCategory(categoryName: string): Promise<Product[]> {
    return await api.products.getByCategory(categoryName);
  },

  // Orders methods
  async createPreorder(orderData: Omit<PreorderCreate, 'session_id'>): Promise<{ order_id: string; token: string; message: string }> {
    return await api.orders.createPreorder(orderData);
  },

  async createDeliveryOrder(orderData: Omit<DeliveryOrderCreate, 'session_id'>): Promise<{ order_id: string; token: string; distance: number; message: string }> {
    return await api.orders.createDeliveryOrder(orderData);
  },

  async getMyOrders(): Promise<OrderResponse[]> {
    return await api.orders.getMyOrders();
  },

  // Shop methods
  async getShopInfo(): Promise<ShopInfo> {
    return await api.shop.getInfo();
  },

  async getWorkingHours(): Promise<WorkingHours[]> {
    return await api.shop.getWorkingHours();
  },

  async isShopOpen(): Promise<{ is_open: boolean; message: string }> {
    return await api.shop.isOpen();
  },

  // Image upload methods
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    return await api.images.upload(file);
  },

  async deleteImage(imageUrl: string): Promise<{ message: string }> {
    return await api.images.delete(imageUrl);
  },
};

export default api;