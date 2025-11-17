import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查当前用户
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        setUser(profile)
      }
      setLoading(false)
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser(profile)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (phone: string, fullName: string) => {
    // 使用手机号作为用户名（简化版，不记密码）
    const email = `${phone}@temp.local`

    // 尝试登录
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'temp_password',
    })

    if (error) {
      // 如果用户不存在，则注册新用户
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: 'temp_password',
      })

      if (signUpError) throw signUpError

      if (signUpData.user) {
        // 创建用户资料
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            phone,
            full_name: fullName,
          })

        if (profileError) throw profileError
      }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
