import { describe, it, expect, beforeEach, vi } from "vitest";
import { meetingsService, PERSONA_CONFIGS } from "../services/meetingsService";
import { Meeting } from "../types";

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }
  },
};

vi.stubGlobal("localStorage", localStorageMock);

describe("Launcher - Meetings Service", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("Persona Configuration", () => {
    const personaCases = [
      { id: "general", label: "General Assistant", badge: "blue", icon: "sparkles" },
      { id: "tech", label: "Tech & Architecture", badge: "purple", icon: "code" },
      { id: "sales", label: "Sales & Client Pitch", badge: "green", icon: "trending-up" },
      { id: "executive", label: "Executive Briefing", badge: "amber", icon: "shield" },
    ];

    it.each(personaCases)("resolves config for persona $id", ({ id, label, badge, icon }) => {
      const config = PERSONA_CONFIGS[id];
      expect(config).toBeDefined();
      expect(config.label).toBe(label);
      expect(config.badgeColor).toBe(badge);
      expect(config.icon).toBe(icon);
    });
  });

  describe("Keyword Search & Filter", () => {
    const queryCases = [
      { query: "vector", minMatches: 1, sampleMatch: "Vector Search" },
      { query: "BaFin", minMatches: 1, sampleMatch: "Horizon FinTech" },
      { query: "ProductHunt", minMatches: 1, sampleMatch: "Growth & Marketing" },
      { query: "CoreML", minMatches: 1, sampleMatch: "CoreML Whisper" },
      { query: "PostgreSQL", minMatches: 1, sampleMatch: "Database Cutover" },
      { query: "HIPAA", minMatches: 1, sampleMatch: "Healthcare HIPAA" },
      { query: "unknown_term_xyz_123", minMatches: 0, sampleMatch: "" },
    ];

    it.each(queryCases)("filters meetings with query '$query'", async ({ query, minMatches, sampleMatch }) => {
      const meetings = await meetingsService.getMeetings();
      const lower = query.toLowerCase();
      const results = meetings.filter(
        (m) =>
          m.title.toLowerCase().includes(lower) ||
          m.summary.toLowerCase().includes(lower) ||
          m.actionItems?.some((a) => (typeof a === "string" ? a.toLowerCase().includes(lower) : a.text.toLowerCase().includes(lower)))
      );

      if (minMatches === 0) {
        expect(results.length).toBe(0);
      } else {
        expect(results.length).toBeGreaterThanOrEqual(minMatches);
        expect(results.some((m) => m.title.includes(sampleMatch) || m.summary.includes(sampleMatch))).toBe(true);
      }
    });
  });

  describe("CRUD State Persistence", () => {
    it("seeds default meetings on first load", async () => {
      const initial = await meetingsService.getMeetings();
      expect(initial.length).toBeGreaterThanOrEqual(10);
    });

    it("persists newly saved meeting to storage", async () => {
      const newMeeting: Meeting = {
        id: "m-unit-crud-1",
        title: "Test Unit Meeting",
        date: new Date().toISOString(),
        duration: "30m",
        persona: "tech",
        summary: "Testing save lifecycle in meetingsService.",
        attendees: [{ name: "Unit Tester", role: "QA" }],
        actionItems: [],
        keyPoints: [],
      };

      await meetingsService.saveMeeting(newMeeting);
      const retrieved = await meetingsService.getMeetings();
      expect(retrieved.some((m) => m.id === "m-unit-crud-1")).toBe(true);
    });

    it("deletes existing meeting from storage", async () => {
      await meetingsService.deleteMeeting("m-1");
      const remaining = await meetingsService.getMeetings();
      expect(remaining.some((m) => m.id === "m-1")).toBe(false);
    });
  });
});
