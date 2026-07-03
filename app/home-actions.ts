"use server";

import { getHeatmapData, getReviewByDate } from "@/lib/reviews";

export async function loadHomeHeatmapAction(year: number) {
  return getHeatmapData(year);
}

export async function loadHomeReviewAction(date: string) {
  return getReviewByDate(date);
}
