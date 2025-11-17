// TypeScript 类型定义

export interface User {
  id: string;
  phone: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  unit: string;
  image_url?: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  category?: Category;
  promotion?: Promotion;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: Product;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail_address: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  address_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  payment_method?: 'wechat' | 'alipay';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  notes?: string;
  created_at: string;
  address: Address;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Promotion {
  id: string;
  product_id: string;
  promotion_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}
