import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { getOrders } from '../lib/api'
import type { Order } from '../types'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return
      try {
        const data = await getOrders(user.id)
        setOrders(data)
      } catch (error) {
        console.error('获取订单失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter)

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待支付',
      paid: '已支付',
      shipped: '已发货',
      delivered: '已送达',
      completed: '已完成',
      cancelled: '已取消',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
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
          <button onClick={() => window.history.back()} className="text-3xl">&larr;</button>
          <h1 className="text-2xl font-bold">我的订单</h1>
          <div></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* 筛选标签 */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待支付' },
            { key: 'paid', label: '待发货' },
            { key: 'shipped', label: '待收货' },
            { key: 'delivered', label: '待评价' },
            { key: 'completed', label: '已完成' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-lg font-bold whitespace-nowrap ${
                filter === item.key
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 订单列表 */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">暂无订单</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <p className="text-lg text-gray-600">订单号：{order.order_number}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {/* 订单商品 */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{item.product_name}</p>
                          <p className="text-gray-600">
                            ¥{item.product_price} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-lg">¥{item.subtotal}</p>
                      </div>
                    ))}
                  </div>

                  {/* 收货地址 */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-1">收货地址</p>
                    <p className="font-semibold">
                      {order.address.province} {order.address.city} {order.address.district}{' '}
                      {order.address.detail_address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.address.recipient_name} {order.address.phone}
                    </p>
                  </div>

                  {/* 总金额 */}
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">订单时间</p>
                    <p className="text-gray-600">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-semibold">合计</p>
                    <p className="text-2xl font-bold text-red-500">¥{order.total_amount}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
