"use client"; // 🔴 有点击交互，必须写

// ============================================================
// YearSwitcher —— 年份切换组件
// 功能：左右箭头切换年份，中间显示当前年份
//
// 使用方式：
//   <YearSwitcher
//     year={2026}
//     availableYears={[2024, 2025, 2026]}
//     onChange={(year) => {...}}
//   />
// ============================================================

type YearSwitcherProps = {
  year: number; // 当前选中的年份
  availableYears: number[]; // 可切换的年份列表（用来判断左右箭头是否可点）
  onChange: (year: number) => void; // 切换年份时通知父组件
};

export default function YearSwitcher({
  year,
  availableYears,
  onChange,
}: YearSwitcherProps) {
  // 找出可选年份里的最小和最大值，用来禁用到头的箭头
  const minYear = Math.min(...availableYears);
  const maxYear = Math.max(...availableYears);

  // 是否已经到最早/最晚（到头了箭头就禁用）
  const canGoPrev = year > minYear;
  const canGoNext = year < maxYear;

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 p-1 shadow-sm">
      {/* 上一年 */}
      <button
        type="button"
        onClick={() => canGoPrev && onChange(year - 1)}
        disabled={!canGoPrev}
        aria-label="上一年"
        className={`
          flex h-8 w-8 items-center justify-center rounded-md text-lg
          transition-colors
          ${
            canGoPrev
              ? "text-slate-700 hover:bg-slate-100"
              : "cursor-not-allowed text-slate-300"
          }
        `}
      >
        ‹
      </button>

      {/* 当前年份 */}
      <span className="min-w-[4rem] text-center text-base font-semibold text-slate-950">
        {year}
      </span>

      {/* 下一年 */}
      <button
        type="button"
        onClick={() => canGoNext && onChange(year + 1)}
        disabled={!canGoNext}
        aria-label="下一年"
        className={`
          flex h-8 w-8 items-center justify-center rounded-md text-lg
          transition-colors
          ${
            canGoNext
              ? "text-slate-700 hover:bg-slate-100"
              : "cursor-not-allowed text-slate-300"
          }
        `}
      >
        ›
      </button>
    </div>
  );
}
