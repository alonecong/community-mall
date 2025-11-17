import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { getAddresses, createOrder } from '../lib/api'
import type { Address } from '../types'

export default function Checkout() {
  const { items, getTotalPrice } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return
      const data = await getAddresses(user.id)
      setAddresses(data)
      const defaultAddress = data.find(addr => addr.is_default) || data[0]
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      }
    }
    fetchAddresses()
  }, [user])

  const handlePayment = async () => {
    if (!selectedAddressId) {
      alert('请选择收货地址')
      return
    }

    setLoading(true)
    try {
      const orderItems = items.map(item => {
        const price = item.product.promotion
          ? item.product.promotion.promotion_price
          : item.product.price
        return {
          product_id: item.product_id,
          product_name: item.product.name,
          product_price: price,
          quantity: item.quantity,
          subtotal: price * item.quantity,
        }
      })

      await createOrder({
        user_id: user!.id,
        address_id: selectedAddressId,
        total_amount: getTotalPrice(),
        items: orderItems,
      })

      alert('下单成功！')
      navigate('/orders')
    } catch (error) {
      alert('下单失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">购物车为空</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            去购物
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <header className="bg-green-500 text-white p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/cart')} className="text-3xl">&larr;</button>
          <h1 className="text-2xl font-bold">结算</h1>
          <div></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 收货地址 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-bold mb-4">收货地址</h2>
          {addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer ${
                    selectedAddressId === address.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">
                        {address.recipient_name} {address.phone}
                      </p>
                      <p className="text-gray-600">
                        {address.province} {address.city} {address.district} {address.detail_address}
                      </p>
                    </div>
                    {address.is_default && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                        默认
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">暂无收货地址</p>
          )}
        </div>

        {/* 商品清单 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-bold mb-4">商品清单</h2>
          <div className="space-y-3">
            {items.map((item) => {
              const price = item.product.promotion
                ? item.product.promotion.promotion_price
                : item.product.price

              return (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.product.image_url || 'https://via.placeholder.com/80'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-gray-600">
                      ¥{price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-lg">¥{(price * item.quantity).toFixed(2)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 支付方式 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-bold mb-4">支付方式</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border-2 border-green-500 rounded-lg bg-green-50">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💚</span>
                <span className="font-bold text-lg">微信支付</span>
              </div>
              <span className="text-sm text-gray-500">推荐</span>
            </div>
            <div className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg">
              <span className="text-2xl">💙</span>
              <span className="font-bold text-lg">支付宝</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部支付 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg text-gray-600">应付金额：</p>
              <p className="text-3xl font-bold text-red-500">¥{getTotalPrice().toFixed(2)}</p>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading || !selectedAddressId}
              className="bg-green-500 text-white px-12 py-4 rounded-lg text-2xl font-bold disabled:bg-gray-300"
            >
              {loading ? '支付中...' : '立即支付'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
