import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export type Review = {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string | null;
  tags: string[];
  is_public: boolean;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PublicReview = Omit<Review, "is_public" | "user_id" | "updated_at">;

export type HeatmapItem = {
  date: string;
  count: number;
};

export type ReviewInput = {
  date: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  is_public?: boolean;
};

export type ReviewUpdateInput = Partial<ReviewInput>;

const publicReviewColumns = "id,date,title,content,mood,tags,created_at";
const reviewColumns =
  "id,date,title,content,mood,tags,is_public,user_id,created_at,updated_at";

function normalizeTags(tags: string[] | undefined) {
  return Array.from(
    new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean)),
  );
}

export async function getPublicReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(publicReviewColumns)
    .eq("is_public", true)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load public reviews: ${error.message}`);
  }

  return (data ?? []) as PublicReview[];
}

export async function getReviewByDate(date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(publicReviewColumns)
    .eq("date", date)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load review for ${date}: ${error.message}`);
  }

  return data as PublicReview | null;
}

export async function getHeatmapData(year: number) {
  const supabase = await createClient();
  const start = `${year}-01-01`;
  const end = `${year + 1}-01-01`;

  const { data, error } = await supabase
    .from("reviews")
    .select("date")
    .eq("is_public", true)
    .gte("date", start)
    .lt("date", end);

  if (error) {
    throw new Error(`Failed to load heatmap data: ${error.message}`);
  }

  const counts = new Map<string, number>();

  for (const item of data ?? []) {
    counts.set(item.date, (counts.get(item.date) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date)) satisfies HeatmapItem[];
}

export async function createReview(input: ReviewInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to create a review.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      date: input.date,
      title: input.title,
      content: input.content,
      mood: input.mood?.trim() || null,
      tags: normalizeTags(input.tags),
      is_public: input.is_public ?? false,
      user_id: user.id,
    })
    .select(reviewColumns)
    .single();

  if (error) {
    throw new Error(`Failed to create review: ${error.message}`);
  }

  return data as Review;
}

export async function updateReview(id: string, input: ReviewUpdateInput) {
  const patch: Record<string, string | string[] | boolean | null> = {};

  if (input.date !== undefined) patch.date = input.date;
  if (input.title !== undefined) patch.title = input.title;
  if (input.content !== undefined) patch.content = input.content;
  if (input.mood !== undefined) patch.mood = input.mood.trim() || null;
  if (input.tags !== undefined) patch.tags = normalizeTags(input.tags);
  if (input.is_public !== undefined) patch.is_public = input.is_public;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .update(patch)
    .eq("id", id)
    .select(reviewColumns)
    .single();

  if (error) {
    throw new Error(`Failed to update review: ${error.message}`);
  }

  return data as Review;
}

export async function deleteReview(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}
