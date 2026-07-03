// ============================================================
// app/reviews/page.tsx —— 公开复盘列表页
// 访问地址：http://localhost:3000/reviews
//
// 功能：
//   1. 调用 getPublicReviews 拉取所有公开复盘
//   2. 用 ReviewCard 卡片网格展示
//   3. 没有数据时显示 EmptyState 空状态
//   4. 顶部提供返回首页的导航
//   5. 移动端单列、平板双列、桌面三列
//
// 说明：这是服务端组件（Server Component），直接 await 数据函数，
//       不需要 "use client"。不修改首页和核心文件。
// ============================================================

import Link from "next/link";
import { getPublicReviews } from "@/lib/reviews";
import ReviewCard from "@/components/ReviewCard";
import EmptyState from "@/components/EmptyState";

export default async function ReviewsPage() {
  // 拉取公开复盘列表
  //   数据函数在 Supabase 报错时会 throw，这里兜底成空数组，
  //   这样即使数据库还没连上，公开页也不会整个崩掉，而是显示空状态。
  let reviews: Awaited<ReturnType<typeof getPublicReviews>> = [];
  let loadError = false;

  try {
    reviews = await getPublicReviews();
  } catch {
    loadError = true;
  }

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-6xl py-8 lg:py-12">
        {/* ---- 顶部导航 + 标题 ---- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              ← 返回首页
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              公开复盘
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              浏览大家公开分享的每日复盘，点击卡片查看完整内容。
            </p>
          </div>

          {/* 右上角条数统计 */}
          {reviews.length > 0 && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
              共 {reviews.length} 篇
            </span>
          )}
        </div>

        {/* ---- 主体内容 ---- */}
        <div className="mt-8">
          {/* 加载出错 */}
          {loadError ? (
            <EmptyState
              icon="⚠️"
              title="暂时无法加载"
              description="数据读取失败，可能是 Supabase 还没配置好，请稍后再试。"
            />
          ) : /* 没有数据：空状态 */
          reviews.length === 0 ? (
            <EmptyState />
          ) : (
            /* 有数据：卡片网格，移动端1列、平板2列、桌面3列 */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
