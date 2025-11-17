import { supabase } from './supabase'
import type { Product, Category, CartItem, Address, Order } from '../types'

// 获取所有分类
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) throw error
  return data as Category[]
}

// 获取推荐商品
export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(20)

  if (error) throw error
  return data as Product[]
}

// 获取分类下的商品
export async function getProductsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)

  if (error) throw error
  return data as Product[]
}

// 获取今日特价
export async function getPromotions() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('promotions')
    .select(`
      *,
      product:products(*, category:categories(*))
    `)
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)

  if (error) throw error
  return data as any[]
}

// 获取用户购物车
export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*, category:categories(*))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as CartItem[]
}

// 添加到购物车
export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  // 检查是否已存在
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (existing) {
    // 更新数量
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    // 新增
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity })

    if (error) throw error
  }
}

// 更新购物车数量
export async function updateCartItem(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)

    if (error) throw error
  }
}

// 获取用户地址列表
export async function getAddresses(userId: string) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })

  if (error) throw error
  return data as Address[]
}

// 创建订单
export async function createOrder(orderData: {
  user_id: string;
  address_id: string;
  total_amount: number;
  items: Array<{
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    subtotal: number;
  }>;
}) {
  // 生成订单号
  const orderNumber = `ORD${Date.now()}`

  // 创建订单
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: orderData.user_id,
      address_id: orderData.address_id,
      total_amount: orderData.total_amount,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) throw orderError

  // 创建订单项
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    ...item,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  return order as Order
}

// 获取用户订单列表
export async function getOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      address:addresses(*),
      items:order_items(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Order[]
}
