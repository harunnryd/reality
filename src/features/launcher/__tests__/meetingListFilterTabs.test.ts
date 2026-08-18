import { describe, it, expect } from "vitest";
import { Meeting } from "../types";

function calculateMeetingListTotals(meetings: Meeting[]): {
  totalMeetings: number;
  totalActionItems: number;
  totalDecisions: number;
} {
  const totalMeetings = meetings.length;
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0);
  const totalDecisions = meetings.reduce((acc, m) => acc + (m.keyPoints?.length || 0), 0);
  return { totalMeetings, totalActionItems, totalDecisions };
}

function filterMeetingsByQuery(meetings: Meeting[], query: string): Meeting[] {
  const q = query.toLowerCase().trim();
  if (!q) return meetings;
  return meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.actionItems?.some((a) => (typeof a === "string" ? a.toLowerCase().includes(q) : a.text.toLowerCase().includes(q)))
  );
}

describe("Launcher - Meeting List Filter Tabs & Aggregation", () => {
  const sampleMeetings: Meeting[] = [
    {
      id: "m-1",
      title: "Vector Search Review",
      date: "2026-08-17T10:00:00Z",
      duration: "45m",
      persona: "tech",
      summary: "HNSW quantization benchmarks.",
      attendees: [{ name: "Sarah Lin" }],
      actionItems: [
        { id: "a-1", text: "Benchmark VAD threshold", completed: false },
        { id: "a-2", text: "Update WebSocket buffer", completed: true },
      ],
      keyPoints: [
        { id: "d-1", decision: "Use 150ms audio chunk size", rationale: "Lowest latency" },
      ],
    },
    {
      id: "m-2",
      title: "Horizon FinTech Pilot",
      date: "2026-08-17T14:00:00Z",
      duration: "30m",
      persona: "sales",
      summary: "BaFin EU GDPR compliance discussion.",
      attendees: [{ name: "David Vance" }],
      actionItems: [
        { id: "a-3", text: "Send SLA addendum", completed: false },
      ],
      keyPoints: [
        { id: "d-2", decision: "250 seats approved", rationale: "Meets security audit" },
        { id: "d-3", decision: "Stripe billing monthly", rationale: "Standard terms" },
      ],
    },
  ];

  it("calculates totals across meetings, action items, and key decisions", () => {
    const totals = calculateMeetingListTotals(sampleMeetings);
    expect(totals.totalMeetings).toBe(2);
    expect(totals.totalActionItems).toBe(3);
    expect(totals.totalDecisions).toBe(3);
  });

  it("filters meetings accurately by title keyword", () => {
    const results = filterMeetingsByQuery(sampleMeetings, "Vector");
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe("m-1");
  });

  it("filters meetings accurately by action item content", () => {
    const results = filterMeetingsByQuery(sampleMeetings, "addendum");
    expect(results.length).toBe(1);
    expect(results[0]?.id).toBe("m-2");
  });

  it("returns empty array for non-matching search term (triggering empty state)", () => {
    const results = filterMeetingsByQuery(sampleMeetings, "nonexistent-query-12345");
    expect(results.length).toBe(0);
  });
});
