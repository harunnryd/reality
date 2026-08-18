import { describe, it, expect } from "vitest";

export interface PermissionStatus {
  microphone: "granted" | "denied" | "prompt";
  screenRecording: "granted" | "denied" | "prompt";
  accessibility: "granted" | "denied" | "prompt";
}

function evaluateAppReadiness(status: PermissionStatus): { isReady: boolean; missing: string[] } {
  const missing: string[] = [];
  if (status.microphone !== "granted") missing.push("Microphone");
  if (status.screenRecording !== "granted") missing.push("Screen Recording");
  if (status.accessibility !== "granted") missing.push("Accessibility");
  return {
    isReady: missing.length === 0,
    missing,
  };
}

describe("Services - Permissions Evaluation Unit Tests", () => {
  const cases = [
    {
      status: { microphone: "granted" as const, screenRecording: "granted" as const, accessibility: "granted" as const },
      expectedReady: true,
      expectedMissing: [],
    },
    {
      status: { microphone: "denied" as const, screenRecording: "granted" as const, accessibility: "granted" as const },
      expectedReady: false,
      expectedMissing: ["Microphone"],
    },
    {
      status: { microphone: "granted" as const, screenRecording: "denied" as const, accessibility: "granted" as const },
      expectedReady: false,
      expectedMissing: ["Screen Recording"],
    },
    {
      status: { microphone: "granted" as const, screenRecording: "granted" as const, accessibility: "denied" as const },
      expectedReady: false,
      expectedMissing: ["Accessibility"],
    },
    {
      status: { microphone: "prompt" as const, screenRecording: "prompt" as const, accessibility: "prompt" as const },
      expectedReady: false,
      expectedMissing: ["Microphone", "Screen Recording", "Accessibility"],
    },
  ];

  it.each(cases)("evaluates permissions readiness correctly", ({ status, expectedReady, expectedMissing }) => {
    const result = evaluateAppReadiness(status);
    expect(result.isReady).toBe(expectedReady);
    expect(result.missing).toEqual(expectedMissing);
  });
});
