"use client"; // 🔴 格子可点击、可 hover，必须写

// ============================================================
// ReviewHeatmap —— 年度热力图组件（GitHub 贡献图风格）
// 功能：把一整年的复盘数据画成一张网格图，
//       每一列是一周，每一行是星期几（周日在最上，周六在最下），
//       格子颜色越深表示当天复盘越多；点击格子回调日期。
//
// 使用方式：
//   <ReviewHeatmap
//     data={heatmapItems}      // HeatmapItem[]，来自 getHeatmapData(year)
//     year={2026}
//     selectedDate={selected}  // 当前选中的日期（用来高亮），可选
//     onSelectDate={(date) => {...}}  // 点击某天时回调，可选
//   />
// ============================================================

import { useMemo } from "react";
import type { HeatmapItem } from "@/lib/reviews";

type ReviewHeatmapProps = {
  data: HeatmapItem[]; // 这一年有复盘的日期和条数
  year: number; // 要展示的年份
  selectedDate?: string | null; // 当前选中日期（高亮用）
  onSelectDate?: (date: string) => void; // 点击格子回调
};

// 一个「格子」的内部数据结构
type Cell = {
  date: string; // "YYYY-MM-DD"
  count: number; // 当天复盘条数（0 表示没有）
};

// 星期几的行标签（周日在第0行）
const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
// 月份缩写（画在顶部）
const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

// 把 Date 格式化成 "YYYY-MM-DD"（本地时区）
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 根据 count 决定格子的颜色深浅（0~4 档，绿色系，和项目主色 emerald 呼应）
function levelClass(count: number): string {
  if (count <= 0) return "bg-slate-100"; // 没复盘：浅灰
  if (count === 1) return "bg-emerald-200";
  if (count === 2) return "bg-emerald-300";
  if (count === 3) return "bg-emerald-500";
  return "bg-emerald-700"; // 4条及以上：最深
}

export default function ReviewHeatmap({
  data,
  year,
  selectedDate,
  onSelectDate,
}: ReviewHeatmapProps) {
  // ----------------------------------------------------------
  // 把 data 数组转成「日期 → 条数」的快速查表
  //   为什么用 Map？因为下面要按天查 count，Map 查找是 O(1)，
  //   比每次都 data.find() 快很多（一年365天）。
  //   用 useMemo 缓存，data 不变就不重新算。
  // ----------------------------------------------------------
  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data) {
      map.set(item.date, item.count);
    }
    return map;
  }, [data]);

  // ----------------------------------------------------------
  // 生成这一年的「周列」数据
  //   核心思路：
  //   - 从 1月1日 开始，一直到 12月31日
  //   - 每一列代表一周（周日→周六共7格）
  //   - 1月1日不一定是周日，所以第一列前面可能要空几格（null）
  //   用 useMemo 缓存，year 不变就不重算。
  // ----------------------------------------------------------
  const weeks = useMemo(() => {
    const result: (Cell | null)[][] = []; // 二维数组：result[周][星期几]
    const firstDay = new Date(year, 0, 1); // 1月1日
    const lastDay = new Date(year, 11, 31); // 12月31日

    // 当前正在填的这一周（7个位置）
    let currentWeek: (Cell | null)[] = new Array(7).fill(null);

    // 第一天是星期几（0=周日 ... 6=周六），前面的位置留空
    const firstWeekday = firstDay.getDay();

    for (
      let d = new Date(firstDay);
      d <= lastDay;
      d.setDate(d.getDate() + 1)
    ) {
      const weekday = d.getDay(); // 今天星期几
      const dateStr = formatDate(d);

      // 把今天放进当前周的对应星期位置
      currentWeek[weekday] = {
        date: dateStr,
        count: countMap.get(dateStr) ?? 0,
      };

      // 如果今天是周六（一周的最后一格），或者是最后一天，
      // 就把当前周收进结果，开一列新的周
      if (weekday === 6 || dateStr === formatDate(lastDay)) {
        result.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
    }

    // 提示：firstWeekday 已经通过「初始全 null + 按 weekday 定位」自然处理了，
    // 这里保留变量是为了让逻辑更好读（第一列前 firstWeekday 格就是 null）。
    void firstWeekday;

    return result;
  }, [year, countMap]);

  // ----------------------------------------------------------
  // 计算每个月标签大概画在第几列（用于顶部月份轴）
  //   做法：遍历每一周，看这周第一个有效日期属于哪个月，
  //   月份第一次出现时记下它的列号。
  // ----------------------------------------------------------
  const monthPositions = useMemo(() => {
    const positions: { month: number; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      // 找这一周第一个非空格子
      const firstCell = week.find((cell) => cell !== null);
      if (!firstCell) return;

      const month = new Date(firstCell.date).getMonth(); // 0~11
      if (month !== lastMonth) {
        positions.push({ month, weekIndex });
        lastMonth = month;
      }
    });

    return positions;
  }, [weeks]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
      {/* 横向滚动容器：手机屏幕放不下一整年，允许左右滑 */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-max">
          {/* ---- 顶部月份轴 ---- */}
          <div className="mb-1 flex pl-8">
            {weeks.map((_, weekIndex) => {
              // 看这一列是不是某个月的起始列
              const monthMark = monthPositions.find(
                (p) => p.weekIndex === weekIndex,
              );
              return (
                <div key={weekIndex} className="w-[15px] text-xs text-slate-400">
                  {monthMark ? MONTH_LABELS[monthMark.month] : ""}
                </div>
              );
            })}
          </div>

          {/* ---- 主体：左边星期标签 + 右边格子矩阵 ---- */}
          <div className="flex">
            {/* 左侧星期标签列（只显示 一/三/五 减少拥挤） */}
            <div className="mr-1 flex w-7 flex-col">
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className="h-[15px] text-[10px] leading-[15px] text-slate-400"
                >
                  {i % 2 === 1 ? label : ""}
                </div>
              ))}
            </div>

            {/* 格子矩阵：每一列是一周 */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((cell, dayIndex) => {
                    // 空格子（第一列/最后一列的补位）
                    if (!cell) {
                      return (
                        <div
                          key={dayIndex}
                          className="h-[12px] w-[12px] rounded-[2px]"
                        />
                      );
                    }

                    const isSelected = selectedDate === cell.date;

                    return (
                      <button
                        key={cell.date}
                        type="button"
                        onClick={() => onSelectDate?.(cell.date)}
                        title={`${cell.date}：${cell.count} 条复盘`}
                        aria-label={`${cell.date}，${cell.count} 条复盘`}
                        className={`
                          h-[12px] w-[12px] rounded-[2px] transition-all
                          ${levelClass(cell.count)}
                          ${
                            isSelected
                              ? "ring-2 ring-emerald-900 ring-offset-1"
                              : "hover:ring-1 hover:ring-slate-400"
                          }
                        `}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ---- 底部图例：少 → 多 ---- */}
          <div className="mt-3 flex items-center gap-1 pl-8 text-xs text-slate-400">
            <span>少</span>
            <span className="h-[12px] w-[12px] rounded-[2px] bg-slate-100" />
            <span className="h-[12px] w-[12px] rounded-[2px] bg-emerald-200" />
            <span className="h-[12px] w-[12px] rounded-[2px] bg-emerald-300" />
            <span className="h-[12px] w-[12px] rounded-[2px] bg-emerald-500" />
            <span className="h-[12px] w-[12px] rounded-[2px] bg-emerald-700" />
            <span>多</span>
          </div>
        </div>
      </div>
    </div>
  );
}
