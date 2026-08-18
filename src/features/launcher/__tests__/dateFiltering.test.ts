import { describe, it, expect } from "vitest";

function filterMeetingByDateRange(dateStr: string, filterRange: "today" | "week" | "month" | "all_time"): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

  switch (filterRange) {
    case "today":
      return date.toDateString() === now.toDateString();
    case "week":
      return diffDays <= 7;
    case "month":
      return diffDays <= 30;
    case "all_time":
    default:
      return true;
  }
}

describe("Launcher - Date Range Filtering", () => {
  const testCases: Array<{
    description: string;
    hoursOffset: number;
    range: "today" | "week" | "month" | "all_time";
    expected: boolean;
  }> = [
    { description: "meeting 2 hours ago in 'today'", hoursOffset: 2, range: "today", expected: true },
    { description: "meeting 2 hours ago in 'week'", hoursOffset: 2, range: "week", expected: true },
    { description: "meeting 2 hours ago in 'month'", hoursOffset: 2, range: "month", expected: true },
    { description: "meeting 2 hours ago in 'all_time'", hoursOffset: 2, range: "all_time", expected: true },
    { description: "meeting 36 hours ago in 'today'", hoursOffset: 36, range: "today", expected: false },
    { description: "meeting 36 hours ago in 'week'", hoursOffset: 36, range: "week", expected: true },
    { description: "meeting 5 days ago in 'week'", hoursOffset: 5 * 24, range: "week", expected: true },
    { description: "meeting 10 days ago in 'week'", hoursOffset: 10 * 24, range: "week", expected: false },
    { description: "meeting 10 days ago in 'month'", hoursOffset: 10 * 24, range: "month", expected: true },
    { description: "meeting 45 days ago in 'month'", hoursOffset: 45 * 24, range: "month", expected: false },
    { description: "meeting 45 days ago in 'all_time'", hoursOffset: 45 * 24, range: "all_time", expected: true },
  ];

  it.each(testCases)("$description evaluates to $expected", ({ hoursOffset, range, expected }) => {
    const meetingDate = new Date(Date.now() - hoursOffset * 60 * 60 * 1000).toISOString();
    expect(filterMeetingByDateRange(meetingDate, range)).toBe(expected);
  });
});
