// ============================================================
// ReviewDayPanel —— 日期详情面板组件
// 功能：点击热力图某一天后，展示那天的复盘信息；没数据时显示空状态
//
// 使用方式：
//   <ReviewDayPanel detail={dayDetail} />   // 有数据
//   <ReviewDayPanel detail={null} />        // 没选中任何一天 / 那天没复盘
//
// 说明：纯展示组件，不需要 "use client"。
//       内容用纯文本展示 summary，不做 Markdown 渲染
//      （Markdown 是成员D公开展示模块的活，这里不重复）。
// ============================================================

import type { DayDetail } from "@/types/review";

type ReviewDayPanelProps = {
  detail: DayDetail | null; // 当天详情；null 表示空状态
};

// 把心情的英文值转成中文+表情，方便展示
// （和成员A的 MoodSelector 选项对应，但这里只做展示）
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

export default function ReviewDayPanel({ detail }: ReviewDayPanelProps) {
  // ---- 空状态：没选中日期，或那天没有复盘 ----
  if (!detail) {
    return (
      <div className="flex h-full min-h-[8rem] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-center">
        <div className="text-3xl">🗓️</div>
        <p className="mt-2 text-sm text-slate-500">
          点击左侧热力图上的某一天，查看当天的复盘
        </p>
      </div>
    );
  }

  // ---- 有数据：展示当天复盘 ----
  return (
    <div className="rounded-lg border border-slate-200 bg-white/80 p-5 shadow-sm">
      {/* 日期 + 条数 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-emerald-700">
          {detail.date}
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
          {detail.count} 条复盘
        </span>
      </div>

      {/* 标题 */}
      <h3 className="mt-3 text-lg font-semibold text-slate-950">
        {detail.title}
      </h3>

      {/* 心情 */}
      {detail.mood && (
        <div className="mt-2 text-sm text-slate-600">
          心情：{MOOD_LABELS[detail.mood] ?? detail.mood}
        </div>
      )}

      {/* 摘要 */}
      <p className="mt-3 text-sm leading-6 text-slate-700">{detail.summary}</p>

      {/* 标签 */}
      {detail.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {detail.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
