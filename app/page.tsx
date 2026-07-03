import HomeDashboard from "@/components/HomeDashboard";
import { getAvailableReviewYears, getHeatmapData } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function Home() {
  const currentYear = new Date().getFullYear();
  let availableYears = [currentYear];
  let heatmapData: Awaited<ReturnType<typeof getHeatmapData>> = [];
  let loadError = false;

  try {
    availableYears = await getAvailableReviewYears();
    heatmapData = await getHeatmapData(currentYear);
  } catch {
    loadError = true;
  }

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <HomeDashboard
        initialYear={currentYear}
        availableYears={availableYears}
        initialHeatmapData={heatmapData}
        initialLoadError={loadError}
      />
    </main>
  );
}
