// ============================================================
// 成员A的类型定义
// 说明：
//   HeatmapItem、PublicReview、ReviewInput 已在 @/lib/reviews 中定义
//   这里只放 MoodSelector 和 ReviewEditor 特有的类型
// ============================================================

// 🔵 MoodOption：心情选项（MoodSelector组件用）
export type MoodOption = {
  emoji: string; // 表情符号，例如 "😊"
  label: string; // 文字描述，例如 "开心"
  value: string; // 存储的值，例如 "happy"
};

// 🔵 SaveStatus：保存状态（ReviewEditor组件用）
//    "idle" = 还没保存
//    "saving" = 正在保存中
//    "success" = 保存成功
//    "error" = 保存失败
export type SaveStatus = "idle" | "saving" | "success" | "error";

// ============================================================
// 成员C的类型定义（首页热力图模块）
// 说明：
//   热力图的输入 HeatmapItem = { date; count } 已在 @/lib/reviews 定义，
//   直接从那里复用，这里不重复定义，保证和成员T的数据函数对齐。
// ============================================================

// 🟢 StatItem：一张统计卡片的数据（StatsCards组件用）
//    例如 { label: "总复盘数", value: 128, hint: "累计公开复盘" }
export type StatItem = {
  label: string; // 卡片标题，例如 "总复盘数"
  value: string | number; // 主数字，例如 128
  hint?: string; // 补充说明（可选），例如 "累计公开复盘"
};

// 🟢 DayDetail：点击热力图某一天后，右侧/下方面板要展示的当天信息
//    （ReviewDayPanel组件用）
//    mock 阶段自己造；真实接入时对应 getReviewByDate(date) 的返回。
export type DayDetail = {
  date: string; // 日期，格式 "2026-07-02"
  title: string; // 当天复盘标题
  summary: string; // 当天复盘摘要（一段纯文本，不做 Markdown 渲染，那是成员D的活）
  mood?: string; // 心情值（可选），例如 "happy"
  tags: string[]; // 标签数组
  count: number; // 当天复盘条数（和热力图格子的 count 对应）
};
