import { describe, it, expect } from "vitest";

type SpotlightTab = "hud" | "ocr" | "memory";

function getSpotlightTabData(tab: SpotlightTab): {
  headline: string;
  badgeLabel?: string;
  cueSnippet: string;
} {
  switch (tab) {
    case "ocr":
      return {
        headline: "[Slide 4] HNSW FP16 Quantized Indexing",
        badgeLabel: "Diagram detected",
        cueSnippet: "Sub-350ms buffer SLA verified",
      };
    case "memory":
      return {
        headline: "[Recall 14 Aug] Horizon FinTech BaFin SLA",
        badgeLabel: "Cross-meeting consensus",
        cueSnippet: "99.95% uptime confirmed",
      };
    case "hud":
    default:
      return {
        headline: "Speaking • Sarah Lin (VP Eng)",
        badgeLabel: "38ms p99",
        cueSnippet: "Cue: Propose 150ms buffer for <350ms latency.",
      };
  }
}

describe("Launcher - Feature Spotlight Widget Logic Unit Tests", () => {
  const tabCases: Array<{ tab: SpotlightTab; expectedHeadlineKeyword: string }> = [
    { tab: "hud", expectedHeadlineKeyword: "Sarah Lin" },
    { tab: "ocr", expectedHeadlineKeyword: "HNSW FP16" },
    { tab: "memory", expectedHeadlineKeyword: "Horizon FinTech" },
  ];

  it.each(tabCases)("resolves tab content for '$tab'", ({ tab, expectedHeadlineKeyword }) => {
    const data = getSpotlightTabData(tab);
    expect(data.headline).toContain(expectedHeadlineKeyword);
    expect(data.badgeLabel).toBeDefined();
    expect(data.cueSnippet.length).toBeGreaterThan(5);
  });
});
