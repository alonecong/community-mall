import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart'

export default function Cart() {
  const { items, loading, updateQuantity, getTotalPrice } = useCart()

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateQuantity(cartItemId, newQuantity)
    } catch (error) {
      alert('更新失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">加载中...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-green-500 text-white p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="text-3xl">&larr;</Link>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-2xl text-gray-500 mt-4">购物车是空的</p>
          <Link to="/" className="btn-primary mt-6">
            去购物
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 头部 */}
      <header className="bg-green-500 text-white p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-3xl">&larr;</Link>
          <h1 className="text-2xl font-bold">购物车</h1>
          <div></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* 购物车列表 */}
        <div className="space-y-4">
          {items.map((item) => {
            const price = item.product.promotion
              ? item.product.promotion.promotion_price
              : item.product.price

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-4xl">{item.product.category?.icon || '🛍️'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-red-500 font-bold text-xl">¥{price}</span>
                        <span className="text-gray-500 text-sm ml-1">/{item.product.unit}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full text-2xl font-bold flex items-center justify-center active:scale-95 transition"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full text-2xl font-bold flex items-center justify-center text-white active:scale-95 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 底部结算 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg text-gray-600">合计：</p>
              <p className="text-3xl font-bold text-red-500">¥{getTotalPrice().toFixed(2)}</p>
            </div>
            <Link
              to="/checkout"
              className="bg-green-500 text-white px-12 py-4 rounded-lg text-2xl font-bold"
            >
              去结算
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
