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
    // 检查本地存储的用户
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (phone: string, fullName: string) => {
    // 直接通过手机号查找用户
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      // 用户存在，更新姓名（如果不同）
      if (existingUser.full_name !== fullName) {
        const { data: updatedUser, error } = await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('phone', phone)
          .select()
          .single()

        if (error) throw error
        setUser(updatedUser)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      } else {
        setUser(existingUser)
        localStorage.setItem('currentUser', JSON.stringify(existingUser))
      }
    } else {
      // 新用户，创建记录（不依赖Supabase Auth）
      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert({
          phone,
          full_name: fullName,
        })
        .select()
        .single()

      if (error) throw error
      setUser(newUser)
      localStorage.setItem('currentUser', JSON.stringify(newUser))
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('currentUser')
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
