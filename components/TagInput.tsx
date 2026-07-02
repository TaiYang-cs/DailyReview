"use client"; // 🔴 这行必须写！表示这个组件在浏览器中运行（有交互）

// ============================================================
// TagInput —— 标签输入组件
// 功能：用户可以输入标签，按回车添加，点击X删除
//
// 使用方式：<TagInput tags={['学习']} onChange={(新标签数组) => {...}} />
// ============================================================

import { useState, type KeyboardEvent } from "react";

// ---- 定义这个组件接收的参数（props） ----
type TagInputProps = {
  tags: string[]; // 当前的标签数组
  onChange: (tags: string[]) => void; // 标签变化时调用的函数（回调函数）
};

export default function TagInput({ tags, onChange }: TagInputProps) {
  // ---- state（状态）：记住输入框中用户正在输入的内容 ----
  const [inputValue, setInputValue] = useState<string>("");
  // 初始值为空字符串 ""，用户打字后实时更新

  // ---- 处理键盘事件：按回车添加标签 ----
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // 只有按下回车键才处理
    if (event.key !== "Enter") return;

    event.preventDefault(); // 阻止默认行为（如表单提交）

    const newTag = inputValue.trim(); // 去掉首尾空格

    // 如果输入为空，或者标签已存在，就不添加
    if (!newTag || tags.includes(newTag)) {
      setInputValue(""); // 清空输入框
      return;
    }

    // 把新标签加到数组里，通知父组件
    onChange([...tags, newTag]);
    setInputValue(""); // 清空输入框
  };

  // ---- 删除标签 ----
  const removeTag = (tagToRemove: string) => {
    // 过滤掉要删除的标签，保留其余
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  // ---- 渲染界面 ----
  return (
    <div className="w-full">
      {/* 标签文字 */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        标签
      </label>

      {/* 已添加的标签（一排小气泡） */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag} // React要求每个循环元素有唯一的key
            className="inline-flex items-center gap-1 px-3 py-1
                       bg-blue-100 text-blue-700 rounded-full text-sm"
          >
            {tag}
            {/* X 删除按钮 */}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 font-bold"
              aria-label={`删除标签 ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* 输入框 */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} // 用户打字时更新state
        onKeyDown={handleKeyDown} // 监听键盘事件
        placeholder="输入标签，按回车添加"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-blue-500 text-sm"
      />
      <p className="text-xs text-gray-400 mt-1">
        按回车键添加标签，点击 × 删除
      </p>
    </div>
  );
}
