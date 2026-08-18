import { describe, it, expect } from "vitest";

export interface OcrDetectionResult {
  hasSlideTitle: boolean;
  detectedKeywords: string[];
  suggestedPrompt: string;
}

function parseOcrSnapshotText(rawOcrText: string): OcrDetectionResult {
  const lower = rawOcrText.toLowerCase();
  const keywords: string[] = [];

  if (lower.includes("websocket")) keywords.push("websocket");
  if (lower.includes("latency") || lower.includes("p99")) keywords.push("latency");
  if (lower.includes("vector") || lower.includes("hnsw")) keywords.push("vector_search");
  if (lower.includes("bafin") || lower.includes("compliance")) keywords.push("compliance");

  const hasSlideTitle = rawOcrText.trim().length > 10;
  const suggestedPrompt = keywords.length > 0
    ? `Analyze architecture diagram focusing on: ${keywords.join(", ")}`
    : "Summarize active screen slide contents";

  return {
    hasSlideTitle,
    detectedKeywords: keywords,
    suggestedPrompt,
  };
}

describe("Meeting HUD - Screen OCR Logic", () => {
  const ocrCases = [
    {
      description: "Architecture slide with WebSocket & latency",
      rawText: "Slide 4: WebSocket Ingestion Pipeline & Sub-350ms p99 Latency SLA",
      expectedKeywords: ["websocket", "latency"],
      expectedPrompt: "Analyze architecture diagram focusing on: websocket, latency",
    },
    {
      description: "Vector database indexing slide",
      rawText: "Qdrant HNSW Vector Search Architecture & Quantized Indexing",
      expectedKeywords: ["vector_search"],
      expectedPrompt: "Analyze architecture diagram focusing on: vector_search",
    },
    {
      description: "Generic slide without recognized keywords",
      rawText: "Welcome everyone to our weekly team sync",
      expectedKeywords: [],
      expectedPrompt: "Summarize active screen slide contents",
    },
  ];

  it.each(ocrCases)("accurately analyzes $description", ({ rawText, expectedKeywords, expectedPrompt }) => {
    const result = parseOcrSnapshotText(rawText);
    expect(result.hasSlideTitle).toBe(true);
    expect(result.detectedKeywords).toEqual(expectedKeywords);
    expect(result.suggestedPrompt).toBe(expectedPrompt);
  });
});
