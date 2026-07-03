"use server";

import { revalidatePath } from "next/cache";
import {
  createReview,
  deleteReview,
  type Review,
  type ReviewInput,
  updateReview,
} from "@/lib/reviews";

type AdminActionResult<T = Review> =
  | { success: true; message: string; data: T }
  | { success: false; message: string };

function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseReviewInput(formData: FormData): ReviewInput {
  return {
    date: String(formData.get("date") ?? ""),
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    mood: String(formData.get("mood") ?? "") || undefined,
    tags: parseTags(formData.get("tags")),
    is_public: formData.get("is_public") === "on",
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "操作失败，请检查登录状态或 Supabase 配置。";
}

function revalidateReviewPaths(date?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/reviews");

  if (date) {
    revalidatePath(`/reviews/${date}`);
  }
}

export async function createReviewAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const review = await createReview(parseReviewInput(formData));
    revalidateReviewPaths(review.date);

    return {
      success: true,
      message: "保存成功。",
      data: review,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function updateReviewAction(
  id: string,
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const review = await updateReview(id, parseReviewInput(formData));
    revalidateReviewPaths(review.date);

    return {
      success: true,
      message: "更新成功。",
      data: review,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function deleteReviewAction(
  id: string,
): Promise<AdminActionResult<null>> {
  try {
    await deleteReview(id);
    revalidateReviewPaths();

    return {
      success: true,
      message: "删除成功。",
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
