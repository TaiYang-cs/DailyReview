"use client"; // 🔴 这行必须写！浏览器交互组件

// ============================================================
// MoodSelector —— 心情选择组件
// 功能：用户点击一个表情来表示当天的心情
//
// 使用方式：
//   <MoodSelector value="happy" onChange={(心情值) => {...}} />
// ============================================================

import type { MoodOption } from "@/types/review";

// ---- 预定义的心情选项列表 ----
//     你可以随意增删或修改这些表情
const MOOD_OPTIONS: MoodOption[] = [
  { emoji: "😊", label: "开心", value: "happy" },
  { emoji: "😄", label: "超开心", value: "excited" },
  { emoji: "😐", label: "一般", value: "neutral" },
  { emoji: "😢", label: "难过", value: "sad" },
  { emoji: "😡", label: "生气", value: "angry" },
  { emoji: "🤩", label: "惊喜", value: "amazed" },
  { emoji: "😴", label: "疲惫", value: "tired" },
  { emoji: "💪", label: "充实", value: "productive" },
];

// ---- 定义组件接收的参数 ----
type MoodSelectorProps = {
  value?: string; // 当前选中的心情值（可选，因为可能还没选）
  onChange: (mood: string) => void; // 选择改变时触发
};

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="w-full">
      {/* 标签 */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        今日心情
      </label>

      {/* 心情选项网格：手机上4列，桌面端8列 */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {MOOD_OPTIONS.map((option) => {
          // 判断当前选项是否被选中
          const isSelected = value === option.value;

          return (
            <button
              key={option.value} // React要求的唯一key
              type="button"
              onClick={() => onChange(option.value)} // 点击时通知父组件
              className={`
                flex flex-col items-center justify-center
                p-2 rounded-xl border-2 transition-all duration-200
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 scale-105 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }
              `}
              // ↑ Tailwind的条件样式：
              //   选中时  → 蓝色边框、蓝色背景、略微放大、有阴影
              //   未选中时 → 灰色边框、白色背景
              aria-label={`心情：${option.label}`}
            >
              {/* 表情符号 */}
              <span className="text-2xl">{option.emoji}</span>
              {/* 文字描述 */}
              <span className="text-xs mt-1 text-gray-600">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
