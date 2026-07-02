// ============================================================
// StatsCards —— 首页统计卡片组件
// 功能：一排小卡片，展示总复盘数、活跃天数、最长连续等基础统计
//
// 使用方式：
//   <StatsCards stats={[{ label: "总复盘数", value: 128 }, ...]} />
//
// 说明：这是纯展示组件（没有交互），所以不需要 "use client"。
//       数据从父组件传进来，本组件不关心数据是 mock 还是真实。
// ============================================================

import type { StatItem } from "@/types/review";

type StatsCardsProps = {
  stats: StatItem[]; // 要展示的统计项数组
};

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    // 手机上2列，桌面端自动铺开成一排（最多4列时刚好一行）
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm"
        >
          {/* 卡片标题 */}
          <div className="text-sm font-medium text-slate-600">
            {stat.label}
          </div>
          {/* 主数字 */}
          <div className="mt-2 text-2xl font-bold text-slate-950">
            {stat.value}
          </div>
          {/* 补充说明（可选） */}
          {stat.hint && (
            <div className="mt-1 text-xs text-slate-400">{stat.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}
