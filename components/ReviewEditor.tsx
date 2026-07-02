"use client"; // 🔴 浏览器交互组件必须写这行

// ============================================================
// ReviewEditor —— 复盘编辑器（核心组件！）
// 功能：
//   1. 日期选择、标题输入、内容输入（Markdown）
//   2. 心情选择（引用 MoodSelector）
//   3. 标签输入（引用 TagInput）
//   4. 公开/私密切换
//   5. 表单校验（日期和标题必填）
//   6. 保存状态显示（保存中/成功/失败）
//   7. 暂时使用mock保存函数（等成员T完成数据层后替换）
// ============================================================

import { useState, type FormEvent } from "react";
import type { ReviewInput } from "@/lib/reviews"; // 成员T定义的输入类型
import type { SaveStatus } from "@/types/review"; // 我们自己定义的类型
import TagInput from "./TagInput";
import MoodSelector from "./MoodSelector";

// ================================================================
// 🧪 Mock 保存函数（临时用，等第7步时替换为真实Supabase写入）
//    模拟网络请求：等待1秒后返回成功
// ================================================================
async function mockSaveReview(
  data: ReviewInput
): Promise<{ success: boolean; message: string }> {
  console.log("📝 Mock保存的数据:", data); // 在浏览器控制台打印，方便调试

  // 模拟网络延迟（假装在和服务器通信）
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 假装总是保存成功
  return { success: true, message: "保存成功！" };

  // 💡 如果要模拟失败，改成：
  // return { success: false, message: "保存失败，请重试" };
}

// ================================================================
// 主组件
// ================================================================
export default function ReviewEditor() {
  // ========== State（状态）：记住表单中所有输入 ==========

  // 表单数据
  const [formData, setFormData] = useState<ReviewInput>({
    date: new Date().toISOString().split("T")[0], // 默认今天日期
    title: "", // 初始为空
    content: "", // 初始为空
    mood: undefined, // 初始未选择心情
    tags: [], // 初始标签为空数组
    is_public: false, // 默认私密
  });

  // 保存状态：idle(未保存) | saving(保存中) | success(成功) | error(失败)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // 错误信息（校验失败时显示）
  const [errors, setErrors] = useState<{ date?: string; title?: string }>({});

  // ========== 通用：更新表单中的某个字段 ==========
  const updateField = <K extends keyof ReviewInput>(
    field: K,
    value: ReviewInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 如果用户开始修改某个字段，清除该字段的错误提示
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ========== 表单校验 ==========
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // 日期必填
    if (!formData.date?.trim()) {
      newErrors.date = "请选择日期";
    }

    // 标题必填
    if (!formData.title?.trim()) {
      newErrors.title = "请输入标题";
    }

    setErrors(newErrors);

    // 如果没有任何错误，返回true（校验通过）
    return Object.keys(newErrors).length === 0;
  };

  // ========== 提交表单 ==========
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 阻止页面刷新（默认行为）

    // 1️⃣ 先校验
    if (!validate()) return;

    // 2️⃣ 设置状态为"保存中"
    setSaveStatus("saving");

    try {
      // 3️⃣ 调用保存函数（目前是mock）
      const result = await mockSaveReview(formData);

      // 4️⃣ 根据结果显示成功或失败
      if (result.success) {
        setSaveStatus("success");
        // 3秒后自动回到正常状态
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      // 如果保存过程出错
      setSaveStatus("error");
    }
  };

  // ========== 渲染界面 ==========
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6">
      {/* ---- 标题 ---- */}
      <h1 className="text-2xl font-bold text-gray-800">📝 写复盘</h1>

      {/* ---- 日期输入 ---- */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          日期 <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={formData.date ?? ""}
          onChange={(e) => updateField("date", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.date ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.date && (
          <p className="text-red-500 text-xs mt-1">{errors.date}</p>
        )}
      </div>

      {/* ---- 标题输入 ---- */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          标题 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title ?? ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="今天做了什么？学到了什么？"
          maxLength={100}
          className={`w-full px-3 py-2 border rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.title ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}
      </div>

      {/* ---- 心情选择 ---- */}
      <MoodSelector
        value={formData.mood}
        onChange={(mood) => updateField("mood", mood)}
      />

      {/* ---- 标签输入 ---- */}
      <TagInput
        tags={formData.tags ?? []}
        onChange={(tags) => updateField("tags", tags)}
      />

      {/* ---- Markdown 内容输入区域 ---- */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          内容 <span className="text-gray-400">（支持 Markdown 格式）</span>
        </label>
        <textarea
          id="content"
          value={formData.content ?? ""}
          onChange={(e) => updateField("content", e.target.value)}
          placeholder={`## 今天做了什么
- 完成了...
- 学习了...

## 收获与反思
今天最大的收获是...

## 明日计划
- [ ] 要完成...`}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     text-sm font-mono focus:outline-none focus:ring-2
                     focus:ring-blue-500 resize-y"
        />
      </div>

      {/* ---- 公开/私密切换 ---- */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div>
          <p className="font-medium text-gray-700">公开复盘</p>
          <p className="text-xs text-gray-500">
            {formData.is_public
              ? "所有人可以看到这篇复盘"
              : "只有你自己可以看到这篇复盘"}
          </p>
        </div>
        {/* 开关按钮 */}
        <button
          type="button"
          onClick={() => updateField("is_public", !formData.is_public)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200
            ${formData.is_public ? "bg-blue-500" : "bg-gray-300"}`}
          role="switch"
          aria-checked={formData.is_public}
          aria-label="公开/私密切换"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full
              bg-white transition-transform duration-200
              ${formData.is_public ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {/* ---- 保存按钮 & 状态提示 ---- */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saveStatus === "saving"} // 保存中时按钮不可点击
          className={`
            px-6 py-2 rounded-lg font-medium text-white
            transition-all duration-200
            ${
              saveStatus === "saving"
                ? "bg-gray-400 cursor-not-allowed" // 保存中：灰色
                : "bg-blue-600 hover:bg-blue-700 active:scale-95" // 正常：蓝色
            }
          `}
        >
          {saveStatus === "saving" ? "保存中..." : "💾 保存"}
        </button>

        {/* 状态提示信息 */}
        {saveStatus === "success" && (
          <span className="text-green-600 text-sm font-medium">
            ✅ 保存成功！
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-red-600 text-sm font-medium">
            ❌ 保存失败，请重试
          </span>
        )}
      </div>
    </form>
  );
}
