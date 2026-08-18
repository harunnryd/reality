import { describe, it, expect } from "vitest";
import { ActionItemDetail, MeetingTranscriptItem } from "../types";

function toggleActionItemCompletion(items: ActionItemDetail[], targetId: string): ActionItemDetail[] {
  return items.map((item) =>
    item.id === targetId ? { ...item, completed: !item.completed } : item
  );
}

function renameSpeakerInTranscript(
  transcript: MeetingTranscriptItem[],
  oldName: string,
  newName: string
): MeetingTranscriptItem[] {
  return transcript.map((t) =>
    t.speaker === oldName ? { ...t, speaker: newName } : t
  );
}

function formatEvidenceTimestamp(totalSeconds?: number): string {
  if (totalSeconds === undefined || totalSeconds === null) return "0:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function generateEmailDraft(
  title: string,
  consensus: string,
  actionItems: ActionItemDetail[],
  tone: "professional" | "warm" | "concise"
): string {
  const actionsList = actionItems.map((a) => `- ${a.text} (@${a.assignee || "Team"})`).join("\n");

  switch (tone) {
    case "concise":
      return `Subject: Recap: ${title}\n\nConsensus:\n${consensus}\n\nAction Items:\n${actionsList}`;
    case "warm":
      return `Subject: Great speaking today: ${title}\n\nHi team,\n\nThanks everyone for the energetic discussion today! Here is what we agreed on:\n${consensus}\n\nNext steps:\n${actionsList}\n\nBest,\nYour Copilot`;
    case "professional":
    default:
      return `Subject: Meeting Summary: ${title}\n\nDear Team,\n\nPlease find the executive summary and action items below.\n\nKey Consensus:\n${consensus}\n\nAction Items:\n${actionsList}\n\nRegards,\nMeeting Lead`;
  }
}

describe("Launcher - Meeting Details View Logic", () => {
  describe("Action Item Completion Toggle", () => {
    it("toggles action item completion status accurately", () => {
      const initial: ActionItemDetail[] = [
        { id: "act-1", text: "Task 1", completed: false, priority: "high" },
        { id: "act-2", text: "Task 2", completed: true, priority: "low" },
      ];

      const updated = toggleActionItemCompletion(initial, "act-1");
      expect(updated.find((a) => a.id === "act-1")?.completed).toBe(true);
      expect(updated.find((a) => a.id === "act-2")?.completed).toBe(true);

      const toggledBack = toggleActionItemCompletion(updated, "act-1");
      expect(toggledBack.find((a) => a.id === "act-1")?.completed).toBe(false);
    });
  });

  describe("Speaker Renaming Across Transcript", () => {
    it("updates all occurrences of renamed speaker", () => {
      const transcript: MeetingTranscriptItem[] = [
        { speaker: "Speaker 1", text: "Hello", timestamp: 5 },
        { speaker: "Speaker 2", text: "Hi there", timestamp: 12 },
        { speaker: "Speaker 1", text: "Let's review the code", timestamp: 25 },
      ];

      const renamed = renameSpeakerInTranscript(transcript, "Speaker 1", "Sarah Lin");
      expect(renamed[0]?.speaker).toBe("Sarah Lin");
      expect(renamed[1]?.speaker).toBe("Speaker 2");
      expect(renamed[2]?.speaker).toBe("Sarah Lin");
    });
  });

  describe("Evidence Timestamp Formatting", () => {
    const timestampCases = [
      { seconds: 0, expected: "0:00" },
      { seconds: 45, expected: "0:45" },
      { seconds: 60, expected: "1:00" },
      { seconds: 125, expected: "2:05" },
      { seconds: 1800, expected: "30:00" },
      { seconds: undefined, expected: "0:00" },
    ];

    it.each(timestampCases)("formats $seconds seconds as '$expected'", ({ seconds, expected }) => {
      expect(formatEvidenceTimestamp(seconds)).toBe(expected);
    });
  });

  describe("Email Follow-Up Draft Generation by Tone", () => {
    const actions: ActionItemDetail[] = [
      { id: "act-1", text: "Benchmark latency", completed: false, assignee: "Dimas" },
    ];

    it("generates professional tone email draft", () => {
      const draft = generateEmailDraft("Vector Architecture Review", "Consensus reached.", actions, "professional");
      expect(draft).toContain("Subject: Meeting Summary: Vector Architecture Review");
      expect(draft).toContain("Benchmark latency (@Dimas)");
    });

    it("generates concise tone email draft", () => {
      const draft = generateEmailDraft("Vector Architecture Review", "Consensus reached.", actions, "concise");
      expect(draft).toContain("Subject: Recap: Vector Architecture Review");
    });

    it("generates warm tone email draft", () => {
      const draft = generateEmailDraft("Vector Architecture Review", "Consensus reached.", actions, "warm");
      expect(draft).toContain("Subject: Great speaking today: Vector Architecture Review");
      expect(draft).toContain("Thanks everyone for the energetic discussion");
    });
  });
});
