// ============================================================
// 成员C的 mock 数据（首页热力图模块）
// 说明：
//   这个文件只服务于「开发和自测」，让 4 个组件在没有真实数据库时
//   也能在浏览器里跑起来。成员T第6步接入首页时会用 lib/reviews.ts 里的
//   真实函数（getHeatmapData / getReviewByDate）替换这些 mock，
//   所以这里产出的数据结构必须和真实函数一致。
//
//   ⚠️ 提 PR 时这个文件可以保留（不影响构建，也方便成员T对照），
//      但真正接入首页时不再引用它。
// ============================================================

import type { HeatmapItem } from "@/lib/reviews";
import type { DayDetail, StatItem } from "@/types/review";

// ------------------------------------------------------------
// 一个确定性的伪随机函数
// 为什么不用 Math.random？
//   因为热力图希望「同一天格子的颜色深浅每次刷新都一样」，
//   如果用 Math.random，每次刷新数据都会变，自测时不好对照。
//   这里用「日期数字」当种子，算出一个 0~1 之间的稳定数值。
// ------------------------------------------------------------
function seededValue(seed: number): number {
  // 一个常见的小技巧：用 sin 放大后取小数部分，得到看起来随机但可复现的值
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 把 Date 格式化成 "YYYY-MM-DD"（本地时区，避免用 toISOString 掉时区的坑）
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ------------------------------------------------------------
// 生成某一年的热力图数据
//   返回：只包含「有复盘的那些天」的数组（和真实 getHeatmapData 一致，
//         真实函数也是只返回有数据的日期，没数据的日期不出现在数组里）
// ------------------------------------------------------------
export function getMockHeatmapData(year: number): HeatmapItem[] {
  const items: HeatmapItem[] = [];
  const start = new Date(year, 0, 1); // 1月1日
  const end = new Date(year + 1, 0, 1); // 下一年1月1日（不含）

  for (
    let d = new Date(start);
    d < end;
    d.setDate(d.getDate() + 1) // 一天天往后走
  ) {
    // 用「年+一年中的第几天」当种子，保证每天稳定
    const dayOfYear = Math.floor(
      (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const r = seededValue(year * 1000 + dayOfYear);

    // 大约 55% 的天数没有复盘（跳过），其余按概率给 1~4 条
    if (r < 0.55) continue;

    let count: number;
    if (r < 0.75) count = 1;
    else if (r < 0.9) count = 2;
    else if (r < 0.97) count = 3;
    else count = 4;

    items.push({ date: formatDate(new Date(d)), count });
  }

  return items;
}

// ------------------------------------------------------------
// mock：可切换的年份列表（给 YearSwitcher 用）
// ------------------------------------------------------------
export const MOCK_AVAILABLE_YEARS: number[] = [2024, 2025, 2026];

// ------------------------------------------------------------
// mock：根据某个年份的热力图数据，算出统计卡片
//   真实接入时这些统计可以由成员T在首页用真实数据算，
//   这里先演示 StatsCards 组件长什么样。
// ------------------------------------------------------------
export function getMockStats(data: HeatmapItem[]): StatItem[] {
  const activeDays = data.length; // 有复盘的天数
  const totalReviews = data.reduce((sum, item) => sum + item.count, 0); // 总条数
  const longestStreak = computeLongestStreak(data); // 最长连续天数

  return [
    { label: "总复盘数", value: totalReviews, hint: "今年累计公开复盘" },
    { label: "活跃天数", value: activeDays, hint: "有复盘记录的天数" },
    { label: "最长连续", value: `${longestStreak} 天`, hint: "连续复盘天数" },
    {
      label: "平均每天",
      value: activeDays === 0 ? 0 : (totalReviews / activeDays).toFixed(1),
      hint: "活跃日的平均条数",
    },
  ];
}

// 计算最长连续复盘天数（辅助函数）
function computeLongestStreak(data: HeatmapItem[]): number {
  if (data.length === 0) return 0;

  // 先把日期排序、去重
  const dates = Array.from(new Set(data.map((item) => item.date))).sort();

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays =
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      current += 1; // 连着的一天
      longest = Math.max(longest, current);
    } else {
      current = 1; // 断了，重新数
    }
  }

  return longest;
}

// ------------------------------------------------------------
// mock：根据日期返回当天详情（给 ReviewDayPanel 用）
//   真实接入时对应 getReviewByDate(date)。
//   这里对「有 count 的日期」造一段假内容，没数据的返回 null。
// ------------------------------------------------------------
const MOCK_MOODS = ["happy", "productive", "neutral", "excited", "tired"];
const MOCK_TAG_POOL = ["学习", "工作", "运动", "读书", "复盘", "生活"];

export function getMockDayDetail(
  date: string,
  data: HeatmapItem[],
): DayDetail | null {
  // 在这一年的数据里找这一天
  const hit = data.find((item) => item.date === date);
  if (!hit) return null; // 这天没复盘 → 面板显示空状态

  // 用日期字符串生成一个稳定种子，造点不一样的假内容
  const seed = Number(date.replace(/-/g, "")); // "2026-07-02" → 20260702
  const moodIndex = seed % MOCK_MOODS.length;
  const tagCount = (seed % 3) + 1;

  const tags: string[] = [];
  for (let i = 0; i < tagCount; i++) {
    tags.push(MOCK_TAG_POOL[(seed + i) % MOCK_TAG_POOL.length]);
  }

  return {
    date,
    title: `${date} 的复盘`,
    summary:
      "这是一条示例复盘摘要。今天完成了既定任务，记录了一些想法和收获，" +
      "整体状态不错，明天继续保持节奏。",
    mood: MOCK_MOODS[moodIndex],
    tags: Array.from(new Set(tags)),
    count: hit.count,
  };
}
