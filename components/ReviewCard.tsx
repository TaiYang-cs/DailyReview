// ============================================================
// ReviewCard —— 公开复盘列表中的单张卡片
// 功能：展示一条公开复盘的摘要信息（日期、标题、心情、内容预览、标签），
//       点击整张卡片跳转到 /reviews/[date] 单日详情页
//
// 使用方式：
//   <ReviewCard review={publicReview} />
//
// 说明：纯展示组件，不需要 "use client"。
//       数据类型 PublicReview 来自 @/lib/reviews（成员T定义）。
// ============================================================

import Link from "next/link";
import type { PublicReview } from "@/lib/reviews";

type ReviewCardProps = {
  review: PublicReview; // 一条公开复盘
};

// 心情值 → 表情+中文（和成员C的 ReviewDayPanel 保持一致，方便统一展示）
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

// 取内容的前 N 个字符作为预览（去掉 Markdown 标记，粗略处理）
function makeExcerpt(content: string, max = 120): string {
  // 去掉常见的 Markdown 符号，只留纯文本做预览
  const plain = content
    .replace(/^#{1,6}\s+/gm, "") // 标题
    .replace(/\*\*([^*]+)\*\*/g, "$1") // 粗体
    .replace(/\*([^*]+)\*/g, "$1") // 斜体
    .replace(/`([^`]+)`/g, "$1") // 行内代码
    .replace(/^\s*[-*]\s+/gm, "") // 列表符号
    .replace(/^\s*\d+\.\s+/gm, "") // 有序列表符号
    .replace(/^\s*>\s?/gm, "") // 引用
    .replace(/\n+/g, " ") // 换行变空格
    .trim();

  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const excerpt = makeExcerpt(review.content);

  return (
    <Link
      href={`/reviews/${review.date}`}
      className="block rounded-lg border border-slate-200 bg-white/80 p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
    >
      {/* 顶部：日期 + 心情 */}
      <div className="flex items-center justify-between">
        <time
          dateTime={review.date}
          className="text-sm font-medium text-emerald-700"
        >
          {review.date}
        </time>
        {review.mood && (
          <span className="text-xs text-slate-500">
            {MOOD_LABELS[review.mood] ?? review.mood}
          </span>
        )}
      </div>

      {/* 标题 */}
      <h3 className="mt-2 text-base font-semibold text-slate-950">
        {review.title}
      </h3>

      {/* 内容预览 */}
      {excerpt && (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {excerpt}
        </p>
      )}

      {/* 底部：标签 */}
      {review.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
