# DailyReview

DailyReview 是一个日常复盘与任务追踪系统，用于记录每日计划、完成情况、问题复盘和阶段总结。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase

## 本地启动

```bash
npm install
npm run dev
```

启动后访问 http://localhost:3000。

## 环境变量

复制 `.env.example` 为 `.env.local`，并填入 Supabase 项目配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## 基础目录

```text
app/                 Next.js App Router 页面和全局布局
components/          可复用 React 组件
lib/supabase/        Supabase browser/server client
public/              静态资源
docs/                项目文档
```

## 常用命令

```bash
npm run dev      # 启动开发服务
npm run build    # 生产构建
npm run start    # 启动生产服务
npm run lint     # 运行 ESLint
```
