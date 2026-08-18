import { describe, it, expect } from "vitest";

function formatHudTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

describe("Meeting HUD - Timer Formatting", () => {
  const timerTestCases = [
    { seconds: 0, expected: "00:00" },
    { seconds: 1, expected: "00:01" },
    { seconds: 9, expected: "00:09" },
    { seconds: 10, expected: "00:10" },
    { seconds: 59, expected: "00:59" },
    { seconds: 60, expected: "01:00" },
    { seconds: 125, expected: "02:05" },
    { seconds: 599, expected: "09:59" },
    { seconds: 600, expected: "10:00" },
    { seconds: 3599, expected: "59:59" },
    { seconds: 3600, expected: "01:00:00" },
    { seconds: 3661, expected: "01:01:01" },
    { seconds: 7325, expected: "02:02:05" },
  ];

  it.each(timerTestCases)("formats $seconds seconds as '$expected'", ({ seconds, expected }) => {
    expect(formatHudTimer(seconds)).toBe(expected);
  });
});
