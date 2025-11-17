import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getCategories, getFeaturedProducts, getPromotions } from '../lib/api'
import { useCart } from '../lib/cart'
import type { Category, Product } from '../types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart, getTotalItems } = useCart()

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesData, productsData, promotionsData] = await Promise.all([
          getCategories(),
          getFeaturedProducts(),
          getPromotions(),
        ])
        setCategories(categoriesData)
        setFeaturedProducts(productsData)
        setPromotions(promotionsData)
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId)
      const product = featuredProducts.find(p => p.id === productId)
      toast.success(`${product?.name || '商品'} 已加入购物车`)
    } catch (error) {
      console.error('添加到购物车失败:', error)
      toast.error('添加失败，请检查登录状态')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <header className="bg-green-500 text-white p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">社区购物</h1>
          <Link to="/cart" className="relative">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* 今日特价 */}
      {promotions.length > 0 && (
        <div className="bg-red-500 text-white p-4">
          <h2 className="text-2xl font-bold mb-3">🎉 今日特价</h2>
          <div className="grid grid-cols-3 gap-2">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-white rounded-lg p-2 text-gray-900">
                <div className="w-full h-20 bg-gray-100 rounded mb-1 flex items-center justify-center">
                  <span className="text-4xl">{promo.product.category?.icon || '🛍️'}</span>
                </div>
                <p className="text-sm font-bold truncate">{promo.product.name}</p>
                <p className="text-red-500 font-bold">¥{promo.promotion_price}</p>
                <button
                  onClick={() => handleAddToCart(promo.product_id)}
                  className="w-full bg-red-500 text-white py-1 rounded text-sm mt-1"
                >
                  抢购
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分类导航 */}
      <div className="bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">商品分类</h2>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-5xl mb-2">{category.icon}</span>
              <span className="text-lg font-semibold text-gray-700">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 推荐商品 */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">精选推荐</h2>
        <div className="grid grid-cols-2 gap-4">
          {featuredProducts.map((product) => {
            const promotion = promotions.find(p => p.product_id === product.id)
            const price = promotion ? promotion.promotion_price : product.price

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                  <span className="text-6xl">{product.category?.icon || '🛍️'}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-red-500 font-bold text-xl">¥{price}</span>
                      {product.original_price && product.original_price > price && (
                        <span className="text-gray-400 text-sm line-through ml-2">
                          ¥{product.original_price}
                        </span>
                      )}
                      <span className="text-gray-500 text-sm ml-1">/{product.unit}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg active:scale-95 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
