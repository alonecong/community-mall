import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCartItems, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem } from './api'
import { useAuth } from './auth'
import type { CartItem } from '../types'

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const refreshCart = async () => {
    if (!user) {
      setItems([])
      return
    }

    setLoading(true)
    try {
      const data = await getCartItems(user.id)
      setItems(data)
    } catch (error) {
      console.error('获取购物车失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [user])

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) return

    try {
      await apiAddToCart(user.id, productId, quantity)
      await refreshCart()
    } catch (error) {
      console.error('添加到购物车失败:', error)
      throw error
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await apiUpdateCartItem(cartItemId, quantity)
      await refreshCart()
    } catch (error) {
      console.error('更新购物车失败:', error)
      throw error
    }
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product.promotion
        ? item.product.promotion.promotion_price
        : item.product.price
      return total + price * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        updateQuantity,
        refreshCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
