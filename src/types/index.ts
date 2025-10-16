export type Language = {
  code: string;
  name: string;
};

export interface OrderItem {
  product_id: string;
  quantity: number;
  product_name?: string;
  price?: number;
}

export interface PreorderCreate {
  session_id: string;
  customer_name: string;
  contact_number?: string;
  items: OrderItem[];
  pickup_time: string;
}

export interface DeliveryOrderCreate {
  session_id: string;
  customer_name: string;
  contact_number?: string;
  items: OrderItem[];
  delivery_address: string;
  postal_code: string;
  lat: number;
  lng: number;
}

export interface OrderResponse {
  id: string;
  order_id: string;
  session_id: string;
  customer_name: string;
  contact_number?: string;
  items: OrderItem[];
  token: string;
  status: "pending" | "approved" | "ready" | "rejected" | "completed" | "delivered";
  pickup_time?: string;
  delivery_address?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  distance_from_shop?: number;
  created_at: string;
  order_type: "preorder" | "delivery";
}

export interface Category {
  id: string;
  name_en: string;
  name_no: string;
}

export interface Product {
  id: string;
  category_name: string;
  name_en: string;
  name_no: string;
  description_en?: string;
  description_no?: string;
  price: number;
  image_url?: string;
  prep_time: number;
}

// Extended Product interface for UI components
export interface ProductUI extends Product {
  name: string;
  description?: string;
  image?: string;
  available: boolean;
  preparationTime: number;
  categoryName: string;
  nameEn: string;
  nameNo: string;
  descriptionEn?: string;
  descriptionNo?: string;
  imageUrl?: string;
  prepTime: number;
}

// New: ProductCard props moved here
export interface ProductCardProps {
  product: ProductUI;
}

// CartItem from backend
export interface CartItem {
  product_id: string;
  quantity: number;
  product_name: string;
  price: number;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface ShopInfo {
  id: string;
  shop_name: string;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  delivery_radius: number;
  minimum_order: number;
  delivery_charges: number; // Add this field
}

export interface WorkingHours {
  id: string;
  day: string;
  is_open: boolean;
  opening_time?: string;
  closing_time?: string;
}

// New exported prop interfaces moved from components
import type { FormEvent } from 'react';

export interface ShopSettingsTabProps {
  shopInfo: ShopInfo | null;
  workingHours: WorkingHours[];
  onEditShopInfo: (shopInfo: ShopInfo | null) => void;
  onAddUpdateHours: () => void;
  onEditWorkingHours: (hours: WorkingHours | { day: string; is_open: boolean }) => void;
}

export interface OverviewTabProps {
  orders: OrderResponse[];
  categories: Category[];
  products: Product[];
}
export interface MenuTabProps {
  categories: Category[];
  products: Product[];
  onAddCategory: () => void;
  onAddProduct: () => void;
  onEditCategory: (category: Category) => void;
  onEditProduct: (product: Product) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteProduct: (productId: string) => void;
}


export interface AdminModalProps {
  isOpen: boolean;
  modalType: 'category' | 'product' | 'shopInfo' | 'workingHours' | null;
  editingItem: any;
  categories: Category[];
  saveSuccess: boolean;
  saveError: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

// Interfaces moved from OrdersTab.tsx
export interface EnrichedOrderItem {
  product_id: string;
  quantity: number;
  product_name: string;
  price: number;
  description_en?: string;
  description_no?: string;
  image_url?: string;
}

export interface OrdersTabProps {
  orders: OrderResponse[];
  onUpdateStatus: (
    orderId: string,
    orderIdString: string,
    orderType: 'preorder' | 'delivery',
    newStatus: "pending" | "approved" | "ready" | "rejected" | "completed" | "delivered"
  ) => void;
}

// New: LanguageContextType (moved from LanguageContext.tsx)
export interface LanguageContextType {
  currentLanguage: Language;
  toggleLanguage: () => void;
  t: (key: string, noText?: string, enText?: string) => string;
  getDayShort: (day: string) => string;
  formatTime: (time?: string) => string;
  getNavLinks: () => { path: string; label: string }[];
  getLanguageDisplay: () => string;
}

// New: CartContextType (moved from CartContext.tsx)
export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalAmount: () => number;
}

export interface ImageUploadResponse {
  image_url: string;
  message: string;
}