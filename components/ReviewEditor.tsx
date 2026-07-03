"use client";

import { useState, type FormEvent } from "react";
import { createReviewAction } from "@/app/admin/actions";
import type { ReviewInput } from "@/lib/reviews";
import type { SaveStatus } from "@/types/review";
import MoodSelector from "./MoodSelector";
import TagInput from "./TagInput";

const initialFormData = (): ReviewInput => ({
  date: new Date().toISOString().split("T")[0],
  title: "",
  content: "",
  mood: undefined,
  tags: [],
  is_public: false,
});

function buildReviewFormData(input: ReviewInput) {
  const formData = new FormData();

  formData.set("date", input.date);
  formData.set("title", input.title);
  formData.set("content", input.content);
  formData.set("mood", input.mood ?? "");
  formData.set("tags", (input.tags ?? []).join(","));

  if (input.is_public) {
    formData.set("is_public", "on");
  }

  return formData;
}

export default function ReviewEditor() {
  const [formData, setFormData] = useState<ReviewInput>(() =>
    initialFormData(),
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState<{ date?: string; title?: string }>({});

  const updateField = <K extends keyof ReviewInput>(
    field: K,
    value: ReviewInput[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatusMessage("");

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!formData.date?.trim()) {
      nextErrors.date = "请选择日期";
    }

    if (!formData.title?.trim()) {
      nextErrors.title = "请输入标题";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    setSaveStatus("saving");
    setStatusMessage("正在保存...");

    try {
      const result = await createReviewAction(buildReviewFormData(formData));

      if (result.success) {
        setSaveStatus("success");
        setStatusMessage(result.message);
        setFormData(initialFormData());
        setTimeout(() => {
          setSaveStatus("idle");
          setStatusMessage("");
        }, 3000);
        return;
      }

      setSaveStatus("error");
      setStatusMessage(result.message);
    } catch {
      setSaveStatus("error");
      setStatusMessage("保存失败，请检查登录状态或 Supabase 配置。");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">写复盘</h1>

      <div>
        <label
          htmlFor="date"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          日期 <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          value={formData.date ?? ""}
          onChange={(event) => updateField("date", event.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.date ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.date && (
          <p className="mt-1 text-xs text-red-500">{errors.date}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          标题 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title ?? ""}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="今天做了什么？学到了什么？"
          maxLength={100}
          className={`w-full rounded-lg border px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.title ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title}</p>
        )}
      </div>

      <MoodSelector
        value={formData.mood}
        onChange={(mood) => updateField("mood", mood)}
      />

      <TagInput
        tags={formData.tags ?? []}
        onChange={(tags) => updateField("tags", tags)}
      />

      <div>
        <label
          htmlFor="content"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          内容 <span className="text-gray-400">（支持 Markdown 格式）</span>
        </label>
        <textarea
          id="content"
          value={formData.content ?? ""}
          onChange={(event) => updateField("content", event.target.value)}
          placeholder={`## 今天做了什么
- 完成了...
- 学习了...

## 收获与反思
今天最大的收获是...

## 明日计划
- [ ] 要完成...`}
          rows={12}
          className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
          <p className="font-medium text-gray-700">公开复盘</p>
          <p className="text-xs text-gray-500">
            {formData.is_public
              ? "所有人可以看到这篇复盘"
              : "只有你自己可以看到这篇复盘"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateField("is_public", !formData.is_public)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
            ${formData.is_public ? "bg-blue-500" : "bg-gray-300"}`}
          role="switch"
          aria-checked={formData.is_public}
          aria-label="公开/私密切换"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
              ${formData.is_public ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saveStatus === "saving"}
          className={`rounded-lg px-6 py-2 font-medium text-white transition-all duration-200
            ${
              saveStatus === "saving"
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }
          `}
        >
          {saveStatus === "saving" ? "保存中..." : "保存"}
        </button>

        {saveStatus === "success" && (
          <span className="text-sm font-medium text-green-600">
            {statusMessage || "保存成功。"}
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm font-medium text-red-600">
            {statusMessage || "保存失败，请重试。"}
          </span>
        )}
      </div>
    </form>
  );
}
