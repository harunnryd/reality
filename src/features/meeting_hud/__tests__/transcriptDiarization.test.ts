import { describe, it, expect } from "vitest";
import { LiveTranscriptMessage } from "../types";

function classifySpeakerRole(speakerName: string): "ai" | "user" | "external" {
  const lower = speakerName.toLowerCase();
  if (lower.includes("reality") || lower.includes("ai") || lower.includes("copilot")) return "ai";
  if (lower === "you" || lower === "user") return "user";
  return "external";
}

function calculateTalkRatios(messages: LiveTranscriptMessage[]): Record<string, number> {
  if (messages.length === 0) return {};
  const counts: Record<string, number> = {};
  for (const m of messages) {
    counts[m.speaker] = (counts[m.speaker] || 0) + 1;
  }
  const ratios: Record<string, number> = {};
  for (const speaker of Object.keys(counts)) {
    ratios[speaker] = Math.round((counts[speaker] / messages.length) * 100);
  }
  return ratios;
}

describe("Meeting HUD - Transcript Diarization & Role Classification", () => {
  const speakerCases: Array<{ speaker: string; expectedRole: "ai" | "user" | "external" }> = [
    { speaker: "Sarah Lin", expectedRole: "external" },
    { speaker: "Dimas Prasetyo", expectedRole: "external" },
    { speaker: "You", expectedRole: "user" },
    { speaker: "Reality AI", expectedRole: "ai" },
    { speaker: "AI Copilot", expectedRole: "ai" },
  ];

  it.each(speakerCases)("classifies $speaker as role $expectedRole", ({ speaker, expectedRole }) => {
    expect(classifySpeakerRole(speaker)).toBe(expectedRole);
  });

  it("calculates talk ratio breakdown accurately", () => {
    const sampleStream: LiveTranscriptMessage[] = [
      { id: "1", speaker: "Sarah Lin", text: "Hello", timestamp: 1 },
      { id: "2", speaker: "Sarah Lin", text: "How is latency?", timestamp: 5 },
      { id: "3", speaker: "You", text: "Latency is 38ms", timestamp: 10 },
      { id: "4", speaker: "Reality AI", text: "Confirmed", timestamp: 15 },
    ];

    const ratios = calculateTalkRatios(sampleStream);
    expect(ratios["Sarah Lin"]).toBe(50);
    expect(ratios["You"]).toBe(25);
    expect(ratios["Reality AI"]).toBe(25);
  });
});
