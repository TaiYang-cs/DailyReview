# Supabase 配置说明

本文档指导团队成员完成 DailyReview 项目的 Supabase 配置。

> 负责：成员 B | 分支：`feature/supabase-schema`

---

## 一、创建 Supabase 项目

1. 打开 [https://supabase.com](https://supabase.com)，注册或登录账号。
2. 点击 **New Project**，填写项目名称（如 `daily-review`）。
3. 设置数据库密码（请妥善保存）。
4. 选择离团队最近的区域（如 Southeast Asia / Singapore）。
5. 点击 **Create new project**，等待项目初始化完成（约 1-2 分钟）。

---

## 二、获取环境变量

项目创建完成后，获取以下两个值：

1. 进入 **Project Settings** → **API**。
2. 找到以下两项：
   - **Project URL** — 形如 `https://xxxxxxxxxxxx.supabase.co`
   - **Project API keys** → **anon public** — 以 `eyJ...` 开头的长字符串

> ⚠️ 使用 **anon public** 密钥（即 publishable key），**不要**使用 service_role key。

---

## 三、配置本地环境变量

1. 在项目根目录复制 `.env.example`：

   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local`，填入你的 Supabase 信息：

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```

3. `.env.local` 已在 `.gitignore` 中，不会被提交到仓库。

---

## 四、执行数据库 Schema

### 方式一：Supabase SQL Editor（推荐）

1. 进入 Supabase Dashboard → **SQL Editor**。
2. 点击 **New query**。
3. 打开项目根目录的 `schema.sql` 文件，复制全部内容粘贴到编辑器中。
4. 点击 **Run**（或按 `Ctrl + Enter`）执行。
5. 确认输出无报错，提示 `Success`。

### 方式二：Supabase CLI

```bash
# 安装 Supabase CLI（如果尚未安装）
npm install -g supabase

# 登录并关联项目
supabase login
supabase link --project-ref your-project-ref

# 执行 schema
supabase db execute --file schema.sql
```

---

## 五、导入测试数据

1. 进入 Supabase Dashboard → **SQL Editor**。
2. 点击 **New query**。
3. 打开 `supabase/seed.sql`，复制全部内容粘贴执行。
4. 如果提示 `未找到注册用户`，请先完成下一步（注册测试账号）后重新执行。

---

## 六、注册测试账号

1. 进入 Supabase Dashboard → **Authentication** → **Users**。
2. 点击 **Add user** → **Create new user**。
3. 填写邮箱和密码（如 `test@dailyreview.com` / `testpass123`）。
4. 取消勾选 **Auto Confirm User**（可选，如需跳过邮箱验证可勾选）。
5. 点击 **Create user**。
6. 注册完成后，重新执行 `supabase/seed.sql` 即可成功插入测试数据。

---

## 七、验证配置

### 7.1 验证表结构

进入 **Table Editor** → 选择 `reviews` 表，确认字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键，自动生成 |
| date | date | 复盘日期 |
| title | text | 标题 |
| content | text | 内容（Markdown） |
| mood | text | 心情 |
| tags | text[] | 标签数组 |
| is_public | boolean | 是否公开 |
| user_id | uuid | 关联 auth.users |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间（自动） |

### 7.2 验证 RLS 策略

进入 **Authentication** → **Policies** → 选择 `reviews` 表，确认以下 5 条策略：

| 策略名 | 操作 | 角色 | 规则 |
| --- | --- | --- | --- |
| reviews_public_select | SELECT | anon, authenticated | is_public = true |
| reviews_owner_select | SELECT | authenticated | auth.uid() = user_id |
| reviews_owner_insert | INSERT | authenticated | auth.uid() = user_id |
| reviews_owner_update | UPDATE | authenticated | auth.uid() = user_id |
| reviews_owner_delete | DELETE | authenticated | auth.uid() = user_id |

### 7.3 验证数据

进入 **Table Editor** → `reviews` 表，应能看到 seed 数据。

### 7.4 验证权限

- **未登录状态**：只能看到 `is_public = true` 的记录。
- **登录状态**：能看到自己创建的全部记录（包括私密），且只能增删改自己的记录。

---

## 八、reviews 表结构说明

```sql
create table reviews (
  id          uuid primary key default gen_random_uuid(),  -- 主键
  date        date not null,                                -- 复盘日期
  title       text not null,                                -- 标题
  content     text not null,                                -- Markdown 内容
  mood        text,                                         -- 心情（如 happy/focused）
  tags        text[] default '{}',                          -- 标签数组
  is_public   boolean default false,                        -- 公开/私密
  user_id     uuid references auth.users(id),               -- 创建者
  created_at  timestamptz default now(),                    -- 创建时间
  updated_at  timestamptz default now()                     -- 更新时间（触发器自动维护）
);
```

### 索引

| 索引名 | 字段 | 用途 |
| --- | --- | --- |
| idx_reviews_date | date | 热力图按年查询 |
| idx_reviews_user_id | user_id | 用户查询自己的复盘 |
| idx_reviews_public_date | date desc (where is_public) | 公开列表分页查询 |

### 触发器

- `trg_reviews_updated_at`：更新记录时自动刷新 `updated_at` 字段。

---

## 九、RLS 权限设计说明

```
┌─────────────────────────────────────────────────────────┐
│                     reviews 表 RLS                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SELECT (读取)                                          │
│  ├── 公开复盘：所有人可读 (is_public = true)            │
│  └── 私密复盘：仅本人可读 (auth.uid() = user_id)        │
│                                                         │
│  INSERT (新增)                                          │
│  └── 仅本人可新增 (auth.uid() = user_id)                │
│                                                         │
│  UPDATE (更新)                                          │
│  └── 仅本人可更新 (auth.uid() = user_id)                │
│                                                         │
│  DELETE (删除)                                          │
│  └── 仅本人可删除 (auth.uid() = user_id)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**核心原则**：
- 未登录访客只能浏览公开复盘。
- 登录用户可以管理自己的全部复盘（公开和私密）。
- 任何用户都不能操作他人的复盘数据。

---

## 十、常见问题

### Q: 执行 seed.sql 报错 "未找到注册用户"

A: 请先在 Authentication → Users 中注册一个测试账号，然后重新执行 seed.sql。

### Q: 前端连接 Supabase 报 401

A: 检查 `.env.local` 中的 URL 和 Key 是否正确，确保使用的是 anon public key 而非 service_role key。

### Q: RLS 策略不生效

A: 确认已执行 `alter table public.reviews enable row level security;`，可在 SQL Editor 中运行 `select relrowsecurity from pg_class where relname = 'reviews';` 检查（返回 `true` 表示已启用）。

### Q: 如何重置数据库

A: 在 SQL Editor 中执行：
```sql
drop table if exists public.reviews cascade;
```
然后重新执行 `schema.sql` 和 `supabase/seed.sql`。
