import { describe, it, expect } from "vitest";
import { Meeting } from "../../launcher/types";
import { LiveTranscriptMessage } from "../types";

function synthesizeMeetingData(
  elapsedSeconds: number,
  persona: "tech" | "sales" | "executive" | "general",
  messages: LiveTranscriptMessage[],
  customTitle?: string
): Meeting {
  const durationFormatted = `${Math.max(1, Math.round(elapsedSeconds / 60))}m`;
  return {
    id: `m-finalized-${Date.now()}`,
    title: customTitle || "Live Architecture Review & Sync",
    date: new Date().toISOString(),
    duration: durationFormatted,
    persona,
    objective: "Establish sub-350ms transcription latency and architecture consensus.",
    summary: `Synthesized meeting with ${messages.length} utterances across session.`,
    consensus: "Deploy chunked 150ms buffer architecture and schedule release.",
    attendees: [
      { name: "Sarah Lin", role: "VP Engineering", talkRatio: 50 },
      { name: "You", role: "Lead Engineer", talkRatio: 50 },
    ],
    actionItems: [
      {
        id: "act-test-1",
        text: "Benchmark VAD threshold on Apple Silicon Neural Engine",
        completed: false,
        assignee: "You",
        priority: "high",
        dueDate: "Tomorrow",
      },
    ],
    keyPoints: [
      {
        id: "dec-test-1",
        decision: "150ms audio chunk buffer adopted",
        rationale: "Zero packet loss over WebSocket connection",
      },
    ],
    transcript: messages.map((m) => ({
      speaker: m.speaker,
      text: m.text,
      timestamp: m.timestamp,
    })),
  };
}

describe("Meeting HUD - Meeting Finalization", () => {
  const finalizationCases = [
    {
      description: "Short 2-minute technical sync",
      seconds: 120,
      persona: "tech" as const,
      messageCount: 5,
      expectedDuration: "2m",
    },
    {
      description: "45-minute enterprise sales pitch",
      seconds: 2700,
      persona: "sales" as const,
      messageCount: 18,
      expectedDuration: "45m",
    },
    {
      description: "60-minute executive briefing",
      seconds: 3600,
      persona: "executive" as const,
      messageCount: 24,
      expectedDuration: "60m",
    },
  ];

  it.each(finalizationCases)(
    "synthesizes $description into compliant Meeting record",
    ({ seconds, persona, messageCount, expectedDuration }) => {
      const dummyMessages: LiveTranscriptMessage[] = Array.from({ length: messageCount }, (_, i) => ({
        id: `msg-${i}`,
        speaker: i % 2 === 0 ? "Sarah Lin" : "You",
        text: `Utterance ${i} regarding technical system performance.`,
        timestamp: i * 10,
      }));

      const meeting = synthesizeMeetingData(seconds, persona, dummyMessages);
      expect(meeting.id).toBeDefined();
      expect(meeting.duration).toBe(expectedDuration);
      expect(meeting.persona).toBe(persona);
      expect(meeting.transcript?.length).toBe(messageCount);
      expect(meeting.actionItems?.length).toBeGreaterThan(0);
      expect(meeting.keyPoints?.length).toBeGreaterThan(0);
    }
  );
});
