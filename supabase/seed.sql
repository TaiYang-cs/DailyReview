-- ============================================================
-- DailyReview - Seed Data
-- 负责：成员 B
-- 分支：feature/supabase-schema
-- 说明：测试数据，用于验证表结构和权限策略
-- 使用方式：在 Supabase SQL Editor 中执行 schema.sql 后执行本文件
-- ============================================================

-- ------------------------------------------------------------
-- 前置说明
-- ------------------------------------------------------------
-- seed.sql 中的 user_id 使用 auth.users 表中的真实用户 ID。
-- 执行前请先注册至少一个测试账号，然后替换下方的 <your-test-user-id>。
-- 或者取消注释下方的 do 块，自动获取第一个注册用户作为测试用户。

-- 自动获取第一个注册用户 ID（推荐）
do $$
declare
  test_user_id uuid;
begin
  select id into test_user_id from auth.users order by created_at limit 1;

  if test_user_id is null then
    raise notice '未找到注册用户，请先在 Supabase Auth 中注册一个测试账号后重试';
    return;
  end if;

  -- 清空旧测试数据（可选，首次执行不需要）
  -- delete from public.reviews where user_id = test_user_id;

  -- ------------------------------------------------------------
  -- 插入公开测试数据
  -- ------------------------------------------------------------
  insert into public.reviews (date, title, content, mood, tags, is_public, user_id)
  values
    (
      current_date - interval '6 days',
      '项目初始化完成',
      '今天完成了 DailyReview 项目骨架搭建，配置了 Next.js + TypeScript + Tailwind CSS + Supabase 技术栈。目录结构清晰，npm run dev 可以正常启动。',
      'happy',
      array['项目', '初始化'],
      true,
      test_user_id
    ),
    (
      current_date - interval '5 days',
      '数据库 Schema 设计',
      '设计了 reviews 表结构，包含日期、标题、内容、心情、标签、公开/私密切换等字段。启用了 RLS 行级安全策略，确保公开复盘可被访客读取，私密复盘仅本人可见。',
      'focused',
      array['数据库', 'Supabase', 'RLS'],
      true,
      test_user_id
    ),
    (
      current_date - interval '4 days',
      '登录鉴权与数据访问层',
      '完成了 Supabase Auth 登录页面、getCurrentUser、getPublicReviews、getReviewByDate 等数据访问函数，以及 Server Actions 和 middleware 管理员页面保护。',
      'excited',
      array['鉴权', 'Supabase Auth'],
      true,
      test_user_id
    ),
    (
      current_date - interval '3 days',
      '管理端编辑模块开发',
      '开发了 ReviewEditor 组件，包含日期选择、标题输入、Markdown 内容编辑、标签输入、心情选择和公开/私密切换。表单校验和提交状态完整。',
      'productive',
      array['前端', '编辑器'],
      true,
      test_user_id
    ),
    (
      current_date - interval '2 days',
      '首页热力图模块',
      '完成了年度热力图组件，支持年份切换、点击日期查看当天复盘详情，以及统计卡片展示。移动端布局也做了适配。',
      'satisfied',
      array['前端', '热力图', '可视化'],
      true,
      test_user_id
    ),
    (
      current_date - interval '1 day',
      '公开复盘展示页面',
      '开发了公开复盘列表页和单日详情页，支持 Markdown 渲染，处理了空状态和响应式布局。',
      'content',
      array['前端', 'Markdown'],
      true,
      test_user_id
    ),
    (
      current_date,
      '项目部署上线',
      '配置了 Vercel 部署环境变量，完成最终测试，项目成功上线！回顾整个开发过程，团队协作和 PR 流程非常顺畅。',
      'celebrating',
      array['部署', 'Vercel', '里程碑'],
      true,
      test_user_id
    );

  -- ------------------------------------------------------------
  -- 插入私密测试数据
  -- ------------------------------------------------------------
  insert into public.reviews (date, title, content, mood, tags, is_public, user_id)
  values
    (
      current_date - interval '10 days',
      '个人周复盘（私密）',
      '本周完成了项目主要模块开发。下周计划：1. 优化首页加载性能；2. 补充更多测试用例；3. 整理技术文档。',
      'reflective',
      array['周复盘', '计划'],
      false,
      test_user_id
    ),
    (
      current_date - interval '7 days',
      '遇到的问题和解决方案（私密）',
      '在配置 RLS 策略时遇到了权限递归问题，通过分离公开读取策略和所有者管理策略解决了。记录下来以防再次遇到。',
      'thoughtful',
      array['问题', 'RLS', '经验'],
      false,
      test_user_id
    );

  raise notice '测试数据插入完成，共插入 9 条复盘记录（7 条公开 + 2 条私密），测试用户 ID: %', test_user_id;
end;
$$;

-- ============================================================
-- Seed 结束
-- ============================================================
