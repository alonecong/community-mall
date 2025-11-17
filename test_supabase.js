// 测试Supabase连接
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ruqgvpfhdkkbsajhkfqm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cWd2cGZoZGtrYnNhamhrZnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDc1NTAsImV4cCI6MjA3ODkyMzU1MH0.nzHg5XDuvoFrBWI-SuiF6v90XhnXF2aJrtVD225T4Yw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 测试Supabase连接...')
  
  try {
    // 测试获取分类
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(3)
    
    if (catError) {
      console.error('❌ 分类表错误:', catError.message)
      return false
    }
    
    console.log('✅ 分类表正常, 数量:', categories?.length || 0)
    console.log('📦 分类数据:', categories)
    
    // 测试获取商品
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    if (prodError) {
      console.error('❌ 商品表错误:', prodError.message)
      return false
    }
    
    console.log('✅ 商品表正常, 数量:', products?.length || 0)
    
    console.log('\n🎉 Supabase数据库连接成功！')
    return true
    
  } catch (err) {
    console.error('❌ 连接失败:', err.message)
    return false
  }
}

testConnection()
