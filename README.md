# 社区购物网页系统

## 项目简介

专为45岁以上社区用户设计的购物网站，参考拼多多买菜，简化交互、放大字号、减少点击。

## 技术栈

- **前端**: React + Vite + TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **部署**: Cloudflare Pages

## 功能模块

1. **用户登录** - 手机号+姓名快速登录
2. **首页** - 今日特价 + 三大分类（蔬菜/粮油/百货）
3. **购物车** - 大按钮加减，实时金额显示
4. **支付页** - 微信/支付宝模拟支付
5. **订单查看** - 待发货/待收货/已完成
6. **地址管理** - 默认地址保存

## 开发环境配置

### 1. 安装依赖

```bash
yarn install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填入您的 Supabase 配置：

```
VITE_SUPABASE_URL=你的_supabase_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

### 3. 启动开发服务器

```bash
yarn dev
```

## 项目结构

```
├── public/          # 静态资源
├── src/
│   ├── components/  # 可复用组件
│   ├── pages/       # 页面组件
│   ├── lib/         # 工具库
│   ├── App.tsx      # 主应用
│   └── main.tsx     # 入口文件
├── tailwind.config.js
└── package.json
```

## 部署

项目已配置自动部署到 Cloudflare Pages。

推送到 GitHub 仓库后，Cloudflare Pages 将自动构建并部署。

## 数据库设计

详见 `database/schema.sql`

## 许可证

MIT
