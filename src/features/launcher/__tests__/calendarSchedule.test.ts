import { describe, it, expect } from "vitest";

export interface CalendarEventItem {
  id: string;
  title: string;
  time: string;
  duration: string;
  platform: "Google Meet" | "Zoom" | "Microsoft Teams";
  attendees: Array<{ name: string; email: string }>;
  isNext?: boolean;
}

function findNextUpcomingEvent(events: CalendarEventItem[]): CalendarEventItem | undefined {
  return events.find((e) => e.isNext) || events[0];
}

function formatAttendeeList(attendees: Array<{ name: string; email: string }>): string {
  if (attendees.length === 0) return "No attendees";
  if (attendees.length <= 2) return attendees.map((a) => a.name).join(", ");
  return `${attendees[0]?.name || ""}, ${attendees[1]?.name || ""} +${attendees.length - 2} more`;
}

function getPlatformBadgeColor(platform: CalendarEventItem["platform"]): string {
  switch (platform) {
    case "Google Meet":
      return "green";
    case "Zoom":
      return "blue";
    case "Microsoft Teams":
      return "purple";
  }
}

describe("Launcher - Calendar & Schedule Unit Tests", () => {
  const sampleEvents: CalendarEventItem[] = [
    {
      id: "evt-1",
      title: "Vector Search Architecture",
      time: "2:00 PM - 2:45 PM",
      duration: "45m",
      platform: "Google Meet",
      isNext: true,
      attendees: [
        { name: "Sarah Lin", email: "sarah@acme.corp" },
        { name: "Dimas Prasetyo", email: "dimas@acme.corp" },
        { name: "Alex Chen", email: "alex@acme.corp" },
      ],
    },
    {
      id: "evt-2",
      title: "Horizon FinTech Enterprise Rollout",
      time: "3:30 PM - 4:15 PM",
      duration: "45m",
      platform: "Zoom",
      isNext: false,
      attendees: [
        { name: "David Vance", email: "david@horizon.io" },
        { name: "Elena Rostova", email: "elena@horizon.io" },
      ],
    },
    {
      id: "evt-3",
      title: "Q4 Strategy Sync",
      time: "5:00 PM - 5:45 PM",
      duration: "45m",
      platform: "Microsoft Teams",
      isNext: false,
      attendees: [{ name: "Maya Anderson", email: "maya@acme.corp" }],
    },
  ];

  describe("Next Event Resolution", () => {
    it("identifies the next upcoming event marked with isNext", () => {
      const next = findNextUpcomingEvent(sampleEvents);
      expect(next).toBeDefined();
      expect(next?.id).toBe("evt-1");
      expect(next?.title).toBe("Vector Search Architecture");
    });

    it("falls back to first event if none are marked isNext", () => {
      const unflagged = sampleEvents.map((e) => ({ ...e, isNext: false }));
      const next = findNextUpcomingEvent(unflagged);
      expect(next?.id).toBe("evt-1");
    });
  });

  describe("Attendee List Summary Formatting", () => {
    it("formats 1 attendee", () => {
      expect(formatAttendeeList([{ name: "Maya", email: "m@a.co" }])).toBe("Maya");
    });

    it("formats 2 attendees", () => {
      expect(formatAttendeeList([{ name: "David", email: "d@a.co" }, { name: "Elena", email: "e@a.co" }])).toBe("David, Elena");
    });

    it("formats 3+ attendees with compact overflow count", () => {
      expect(formatAttendeeList(sampleEvents[0]?.attendees || [])).toBe("Sarah Lin, Dimas Prasetyo +1 more");
    });
  });

  describe("Platform Badge Colors", () => {
    const platformCases: Array<{ platform: CalendarEventItem["platform"]; expectedColor: string }> = [
      { platform: "Google Meet", expectedColor: "green" },
      { platform: "Zoom", expectedColor: "blue" },
      { platform: "Microsoft Teams", expectedColor: "purple" },
    ];

    it.each(platformCases)("maps $platform to badge color $expectedColor", ({ platform, expectedColor }) => {
      expect(getPlatformBadgeColor(platform)).toBe(expectedColor);
    });
  });
});
