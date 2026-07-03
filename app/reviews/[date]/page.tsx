// ============================================================
// app/reviews/[date]/page.tsx —— 单日复盘详情页
// 访问地址：http://localhost:3000/reviews/2026-07-02
//
// 功能：
//   1. 从 URL 取日期参数，校验格式（YYYY-MM-DD）
//   2. 调用 getReviewByDate(date) 拉取当天公开复盘
//   3. 用 MarkdownRenderer 渲染正文
//   4. 当天没有公开复盘时显示 EmptyState
//   5. 顶部返回公开复盘列表
//   6. 移动端和桌面端都能正常阅读
//
// 说明：服务端组件，直接 await 数据函数，不需要 "use client"。
//       不修改首页和核心文件。
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { getReviewByDate } from "@/lib/reviews";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import EmptyState from "@/components/EmptyState";

// 心情值 → 表情+中文（和 ReviewCard / ReviewDayPanel 保持一致）
const MOOD_LABELS: Record<string, string> = {
  happy: "😊 开心",
  excited: "😄 超开心",
  neutral: "😐 一般",
  sad: "😢 难过",
  angry: "😡 生气",
  amazed: "🤩 惊喜",
  tired: "😴 疲惫",
  productive: "💪 充实",
};

type ReviewDetailPageProps = {
  params: Promise<{ date: string }>;
};

// 校验日期字符串是否是合法的 YYYY-MM-DD
function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));

  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  const { date } = await params;

  // 日期格式不合法，直接 404（避免拿奇怪的字符串去查数据库）
  if (!isValidDate(date)) {
    notFound();
  }

  // 拉取当天公开复盘；数据函数出错时兜底为 null，展示空状态而非整页崩溃
  let review: Awaited<ReturnType<typeof getReviewByDate>> = null;
  let loadError = false;
  try {
    review = await getReviewByDate(date);
  } catch {
    loadError = true;
  }

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <article className="mx-auto max-w-3xl py-8 lg:py-12">
        {/* ---- 顶部返回导航 ---- */}
        <Link
          href="/reviews"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ← 返回公开复盘列表
        </Link>

        {/* ---- 主体 ---- */}
        {loadError ? (
          <div className="mt-8">
            <EmptyState
              icon="⚠️"
              title="暂时无法加载"
              description="数据读取失败，可能是 Supabase 还没配置好，请稍后再试。"
            />
          </div>
        ) : !review ? (
          /* 当天没有公开复盘：空状态 */
          <div className="mt-8">
            <EmptyState
              icon="🗓️"
              title="这一天还没有公开复盘"
              description={`${date} 暂时没有公开的复盘记录，去列表里看看其他日期吧。`}
            />
          </div>
        ) : (
          /* 有复盘：展示完整内容 */
          <div className="mt-6">
            {/* 元信息：日期 + 心情 */}
            <div className="flex flex-wrap items-center gap-3">
              <time
                dateTime={review.date}
                className="text-sm font-semibold text-emerald-700"
              >
                {review.date}
              </time>
              {review.mood && (
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs text-slate-600">
                  {MOOD_LABELS[review.mood] ?? review.mood}
                </span>
              )}
            </div>

            {/* 标题 */}
            <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              {review.title}
            </h1>

            {/* 标签 */}
            {review.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {review.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 正文（Markdown 渲染） */}
            <div className="mt-8 rounded-lg border border-slate-200 bg-white/80 p-6 shadow-sm sm:p-8">
              {review.content.trim() ? (
                <MarkdownRenderer content={review.content} />
              ) : (
                <p className="text-sm text-slate-400">这篇复盘还没有正文内容。</p>
              )}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
