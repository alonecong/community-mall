-- 删除旧的RLS策略
DROP POLICY IF EXISTS "用户只能查看自己的资料" ON public.profiles;
DROP POLICY IF EXISTS "用户只能更新自己的资料" ON public.profiles;
DROP POLICY IF EXISTS "用户可以插入自己的资料" ON public.profiles;

-- 创建新的简化RLS策略（基于手机号）
-- 注意：这在生产环境中不安全，仅用于演示
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（简化模式，方便测试）
CREATE POLICY "所有人可以操作profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);
