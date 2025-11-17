import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { getAddresses } from '../lib/api'
import type { Address } from '../types'

export default function Addresses() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return
      try {
        const data = await getAddresses(user.id)
        setAddresses(data)
      } catch (error) {
        console.error('获取地址失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAddresses()
  }, [user])

  const getFullAddress = (address: Address) => {
    return `${address.province} ${address.city} ${address.district} ${address.detail_address}`
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
          <h1 className="text-2xl font-bold">收货地址</h1>
          <div></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {addresses.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-2xl text-gray-500">暂无地址</p>
            <button className="btn-primary mt-4">添加地址</button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-xl">
                      {address.recipient_name} {address.phone}
                    </p>
                    <p className="text-gray-600 mt-1">{getFullAddress(address)}</p>
                  </div>
                  {address.is_default && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      默认
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold text-lg">
                    编辑
                  </button>
                  <button className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg">
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
