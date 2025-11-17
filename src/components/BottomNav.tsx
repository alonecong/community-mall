import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../lib/cart'

export default function BottomNav() {
  const location = useLocation()
  const { getTotalItems } = useCart()

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/category/1', label: '分类', icon: '📋' },
    { path: '/cart', label: '购物车', icon: '🛒', badge: getTotalItems() },
    { path: '/orders', label: '订单', icon: '📦' },
  ]

  // 首页和登录页不显示底部导航
  if (location.pathname === '/' || location.pathname === '/login') {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-4xl mx-auto grid grid-cols-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-3 ${
              location.pathname === item.path
                ? 'text-green-500'
                : 'text-gray-600'
            }`}
          >
            <div className="relative">
              <span className="text-2xl">{item.icon}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-sm mt-1 font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
