import { describe, it, expect } from "vitest";

export type OnboardingStage = "welcome" | "permissions" | "persona" | "shortcuts" | "finished";

function getNextStage(current: OnboardingStage): OnboardingStage {
  switch (current) {
    case "welcome":
      return "permissions";
    case "permissions":
      return "persona";
    case "persona":
      return "shortcuts";
    case "shortcuts":
      return "finished";
    case "finished":
      return "finished";
  }
}

function getPreviousStage(current: OnboardingStage): OnboardingStage {
  switch (current) {
    case "permissions":
      return "welcome";
    case "persona":
      return "permissions";
    case "shortcuts":
      return "persona";
    case "finished":
      return "shortcuts";
    case "welcome":
    default:
      return "welcome";
  }
}

function areRequiredPermissionsGranted(micGranted: boolean, screenGranted: boolean): boolean {
  return micGranted && screenGranted;
}

describe("Onboarding - Stage Transition & Permissions Logic", () => {
  describe("Sequential Stage Transitions", () => {
    const forwardCases: Array<{ from: OnboardingStage; to: OnboardingStage }> = [
      { from: "welcome", to: "permissions" },
      { from: "permissions", to: "persona" },
      { from: "persona", to: "shortcuts" },
      { from: "shortcuts", to: "finished" },
      { from: "finished", to: "finished" },
    ];

    it.each(forwardCases)("transitions forward from $from to $to", ({ from, to }) => {
      expect(getNextStage(from)).toBe(to);
    });

    const backwardCases: Array<{ from: OnboardingStage; to: OnboardingStage }> = [
      { from: "finished", to: "shortcuts" },
      { from: "shortcuts", to: "persona" },
      { from: "persona", to: "permissions" },
      { from: "permissions", to: "welcome" },
      { from: "welcome", to: "welcome" },
    ];

    it.each(backwardCases)("transitions backward from $from to $to", ({ from, to }) => {
      expect(getPreviousStage(from)).toBe(to);
    });
  });

  describe("Permission Verification Gate", () => {
    const permCases = [
      { mic: false, screen: false, allowed: false },
      { mic: true, screen: false, allowed: false },
      { mic: false, screen: true, allowed: false },
      { mic: true, screen: true, allowed: true },
    ];

    it.each(permCases)(
      "evaluates mic=$mic, screen=$screen as allowed=$allowed",
      ({ mic, screen, allowed }) => {
        expect(areRequiredPermissionsGranted(mic, screen)).toBe(allowed);
      }
    );
  });
});
