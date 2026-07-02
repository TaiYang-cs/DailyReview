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
