-- 社区购物系统数据库表结构
-- 创建时间: 2025-11-17

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 用户表 (扩展 Supabase 内置 auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 商品分类表
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon TEXT NOT NULL, -- 图标URL或emoji
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 商品表
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL, -- 价格
  original_price DECIMAL(10, 2), -- 原价
  unit VARCHAR(20) NOT NULL, -- 单位 (如: 斤、个、袋)
  image_url TEXT,
  stock INTEGER DEFAULT 0, -- 库存
  is_active BOOLEAN DEFAULT true, -- 是否上架
  is_featured BOOLEAN DEFAULT false, -- 是否推荐(首页显示)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. 购物车表
CREATE TABLE public.cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- 5. 收货地址表
CREATE TABLE public.addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  recipient_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  province VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  detail_address TEXT NOT NULL, -- 详细地址(小区名+楼号)
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. 订单表
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE, -- 订单号
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  address_id UUID REFERENCES public.addresses(id) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL, -- 总金额
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, shipped, delivered, completed, cancelled
  payment_method VARCHAR(20), -- wechat, alipay
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, refunded
  notes TEXT, -- 订单备注
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. 订单详情表
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_name VARCHAR(200) NOT NULL, -- 冗余存储商品名称(避免商品删除后订单无法查看)
  product_price DECIMAL(10, 2) NOT NULL, -- 下单时的价格
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL, -- 小计
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. 特价商品表(每日特价)
CREATE TABLE public.promotions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) NOT NULL UNIQUE,
  promotion_price DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_addresses_user ON public.addresses(user_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加更新时间触发器
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 设置行级安全策略 (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- profiles表策略：用户只能访问自己的信息
CREATE POLICY "用户只能查看自己的资料" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的资料" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- categories表策略：所有人可读
CREATE POLICY "所有人可以查看分类" ON public.categories
  FOR SELECT USING (true);

-- products表策略：所有人可以查看上架商品
CREATE POLICY "所有人可以查看上架商品" ON public.products
  FOR SELECT USING (is_active = true);

-- cart_items表策略：用户只能操作自己的购物车
CREATE POLICY "用户只能查看自己的购物车" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能添加自己的购物车" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的购物车" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的购物车" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- addresses表策略：用户只能操作自己的地址
CREATE POLICY "用户只能查看自己的地址" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能添加自己的地址" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的地址" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的地址" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- orders表策略：用户只能操作自己的订单
CREATE POLICY "用户只能查看自己的订单" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的订单" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的订单" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- order_items表策略：通过orders表关联验证
CREATE POLICY "用户只能查看自己的订单详情" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "用户只能创建自己的订单详情" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- promotions表策略：所有人可以查看有效的特价
CREATE POLICY "所有人可以查看有效特价" ON public.promotions
  FOR SELECT USING (is_active = true);

-- 插入初始数据

-- 插入三个主要分类
INSERT INTO public.categories (name, icon, sort_order) VALUES
  ('蔬菜', '🥬', 1),
  ('粮油', '🌾', 2),
  ('百货', '🧴', 3);

-- 插入示例商品
INSERT INTO public.products (category_id, name, description, price, original_price, unit, stock, is_featured) VALUES
  -- 蔬菜类
  ((SELECT id FROM public.categories WHERE name = '蔬菜'), '新鲜白菜', '农家自产，新鲜采摘', 2.99, 3.99, '斤', 100, true),
  ((SELECT id FROM public.categories WHERE name = '蔬菜'), '土豆', '黄心土豆，口感粉糯', 1.99, 2.49, '斤', 80, true),
  ((SELECT id FROM public.categories WHERE name = '蔬菜'), '西红柿', '自然熟透，酸甜多汁', 3.99, 4.99, '斤', 50, false),
  ((SELECT id FROM public.categories WHERE name = '蔬菜'), '胡萝卜', '富含维生素，营养丰富', 2.49, 2.99, '斤', 60, false),
  ((SELECT id FROM public.categories WHERE name = '蔬菜'), '茄子', '新鲜茄子，适合多种烹饪', 3.49, 4.29, '斤', 40, false),

  -- 粮油类
  ((SELECT id FROM public.categories WHERE name = '粮油'), '优质大米', '东北大米，颗粒饱满', 29.90, 35.00, '5斤', 50, true),
  ((SELECT id FROM public.categories WHERE name = '粮油'), '金龙鱼食用油', '非转基因，营养健康', 45.90, 52.90, '5升', 30, true),
  ((SELECT id FROM public.categories WHERE name = '粮油'), '面粉', '高筋面粉，适合做面条', 18.90, 22.00, '5斤', 40, false),
  ((SELECT id FROM public.categories WHERE name = '粮油'), '挂面', '手工挂面，口感爽滑', 8.90, 10.90, '500g', 100, false),
  ((SELECT id FROM public.categories WHERE name = '粮油'), '小米', '优质小米，营养滋补', 19.90, 24.90, '2斤', 30, false),

  -- 百货类
  ((SELECT id FROM public.categories WHERE name = '百货'), '抽纸', '3层抽纸，柔软卫生', 12.90, 15.90, '3包', 80, true),
  ((SELECT id FROM public.categories WHERE name = '百货'), '洗衣液', '去污力强，护色留香', 19.90, 25.90, '2kg', 60, true),
  ((SELECT id FROM public.categories WHERE name = '百货'), '牙膏', '清新口气，洁白牙齿', 9.90, 12.90, '120g', 50, false),
  ((SELECT id FROM public.categories WHERE name = '百货'), '牙刷', '软毛牙刷，保护牙龈', 5.90, 7.90, '2支装', 70, false),
  ((SELECT id FROM public.categories WHERE name = '百货'), '垃圾袋', '加厚垃圾袋，承重强', 8.90, 11.90, '60只', 100, false);

-- 插入今日特价
INSERT INTO public.promotions (product_id, promotion_price, start_date, end_date) VALUES
  ((SELECT id FROM public.products WHERE name = '新鲜白菜'), 1.99, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
  ((SELECT id FROM public.products WHERE name = '优质大米'), 26.90, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
  ((SELECT id FROM public.products WHERE name = '抽纸'), 9.90, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day');

