"use client";

import { useMemo, useState, useTransition } from "react";
import {
  loadHomeHeatmapAction,
  loadHomeReviewAction,
} from "@/app/home-actions";
import ReviewDayPanel from "@/components/ReviewDayPanel";
import ReviewHeatmap from "@/components/ReviewHeatmap";
import StatsCards from "@/components/StatsCards";
import YearSwitcher from "@/components/YearSwitcher";
import type { HeatmapItem, PublicReview } from "@/lib/reviews";
import type { DayDetail, StatItem } from "@/types/review";

type HomeDashboardProps = {
  initialYear: number;
  availableYears: number[];
  initialHeatmapData: HeatmapItem[];
  initialLoadError?: boolean;
};

function computeLongestStreak(data: HeatmapItem[]) {
  const dates = Array.from(new Set(data.map((item) => item.date))).sort();
  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays =
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function buildStats(data: HeatmapItem[]): StatItem[] {
  const activeDays = data.length;
  const totalReviews = data.reduce((sum, item) => sum + item.count, 0);
  const longestStreak = computeLongestStreak(data);

  return [
    { label: "总复盘数", value: totalReviews, hint: "今年累计公开复盘" },
    { label: "活跃天数", value: activeDays, hint: "有复盘记录的天数" },
    { label: "最长连续", value: `${longestStreak} 天`, hint: "连续复盘天数" },
    {
      label: "平均每天",
      value: activeDays === 0 ? 0 : (totalReviews / activeDays).toFixed(1),
      hint: "活跃日平均条数",
    },
  ];
}

function toDayDetail(
  review: PublicReview | null,
  date: string,
  count: number,
): DayDetail | null {
  if (!review) return null;

  const summary =
    review.content.trim().replace(/\s+/g, " ").slice(0, 160) ||
    "这篇复盘还没有正文内容。";

  return {
    date,
    title: review.title,
    summary,
    mood: review.mood ?? undefined,
    tags: review.tags,
    count,
  };
}

export default function HomeDashboard({
  initialYear,
  availableYears,
  initialHeatmapData,
  initialLoadError = false,
}: HomeDashboardProps) {
  const [year, setYear] = useState(initialYear);
  const [heatmapData, setHeatmapData] = useState(initialHeatmapData);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [isPending, startTransition] = useTransition();

  const years = useMemo(() => {
    return Array.from(new Set([...availableYears, initialYear, year])).sort(
      (a, b) => a - b,
    );
  }, [availableYears, initialYear, year]);

  const stats = useMemo(() => buildStats(heatmapData), [heatmapData]);
  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of heatmapData) {
      map.set(item.date, item.count);
    }
    return map;
  }, [heatmapData]);

  function handleYearChange(nextYear: number) {
    setYear(nextYear);
    setSelectedDate(null);
    setDayDetail(null);
    setLoadError(false);

    startTransition(async () => {
      try {
        const nextData = await loadHomeHeatmapAction(nextYear);
        setHeatmapData(nextData);
      } catch {
        setHeatmapData([]);
        setLoadError(true);
      }
    });
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setDayDetail(null);
    setLoadError(false);

    startTransition(async () => {
      try {
        const review = await loadHomeReviewAction(date);
        setDayDetail(toDayDetail(review, date, countByDate.get(date) ?? 0));
      } catch {
        setLoadError(true);
      }
    });
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 py-8 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            DailyReview
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
            年度复盘热力图
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            查看公开复盘的年度分布，切换年份或点击日期查看当天内容。
          </p>
        </div>

        <YearSwitcher
          year={year}
          availableYears={years}
          onChange={handleYearChange}
        />
      </div>

      <StatsCards stats={stats} />

      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          数据暂时无法加载，请确认 Supabase 环境变量和表数据已配置。
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="min-w-0">
          <ReviewHeatmap
            data={heatmapData}
            year={year}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
          {isPending && (
            <p className="mt-2 text-xs text-slate-500">正在加载真实数据...</p>
          )}
        </div>

        <ReviewDayPanel detail={dayDetail} />
      </div>
    </section>
  );
}
