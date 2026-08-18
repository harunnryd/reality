import { describe, it, expect } from "vitest";

function getStealthBannerStatus(isStealth: boolean): { label: string; iconColor: string } {
  return isStealth
    ? { label: "Stealth Active", iconColor: "#0071E3" }
    : { label: "Stealth Off", iconColor: "#6E6E73" };
}

function getPersonaHeroSubtitle(personaId: "general" | "tech" | "sales" | "executive"): string {
  switch (personaId) {
    case "tech":
      return "Sub-350ms streaming teleprompter for system architecture & technical reviews.";
    case "sales":
      return "Real-time objection handling, pricing cues, and enterprise closing assistance.";
    case "executive":
      return "Executive briefings, high-level summaries, and strategic KPI synthesis.";
    case "general":
    default:
      return "Real-time AI assistance, live speech synthesis, and intelligent notes.";
  }
}

describe("Launcher - Hero Banner Logic Unit Tests", () => {
  describe("Stealth Mode State", () => {
    it("returns active state when stealth is true", () => {
      const status = getStealthBannerStatus(true);
      expect(status.label).toBe("Stealth Active");
      expect(status.iconColor).toBe("#0071E3");
    });

    it("returns off state when stealth is false", () => {
      const status = getStealthBannerStatus(false);
      expect(status.label).toBe("Stealth Off");
      expect(status.iconColor).toBe("#6E6E73");
    });
  });

  describe("Persona Subtitle Resolution", () => {
    const subtitleCases: Array<{
      persona: "general" | "tech" | "sales" | "executive";
      expectedKeyword: string;
    }> = [
      { persona: "tech", expectedKeyword: "architecture" },
      { persona: "sales", expectedKeyword: "objection" },
      { persona: "executive", expectedKeyword: "briefings" },
      { persona: "general", expectedKeyword: "synthesis" },
    ];

    it.each(subtitleCases)("resolves subtitle for $persona containing '$expectedKeyword'", ({ persona, expectedKeyword }) => {
      const subtitle = getPersonaHeroSubtitle(persona);
      expect(subtitle.toLowerCase()).toContain(expectedKeyword);
    });
  });
});
