import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiIntelligenceService } from "../aiIntelligenceService";
import { invoke } from "@tauri-apps/api/core";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("aiIntelligenceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      sessionId: "session-1",
      speaker: "Interviewer",
      text: "How do you optimize vector search latency?",
      expectedCommand: "process_ai_utterance",
      mockResult: {
        session_id: "session-1",
        moment_action: "TECHNICAL_EXPLANATION",
        current_suggestion: {
          id: "sug-1",
          title: "HNSW Quantization",
          summary: "Use scalar quantization FP16",
          confidence: 0.95,
          key_takeaways: ["Sub-35ms p99"],
        },
      },
    },
    {
      sessionId: "session-2",
      speaker: "Client",
      text: "Why is your platform priced higher than competitor X?",
      expectedCommand: "process_ai_utterance",
      mockResult: {
        session_id: "session-2",
        moment_action: "OBJECTION_OR_NEGOTIATION",
        current_suggestion: {
          id: "sug-2",
          title: "Value Framing",
          summary: "Emphasize 12+ dev hours saved",
          confidence: 0.92,
          key_takeaways: ["Tiered discount"],
        },
      },
    },
  ])(
    "invokes $expectedCommand with correct payload for $speaker",
    async ({ sessionId, speaker, text, expectedCommand, mockResult }) => {
      vi.mocked(invoke).mockResolvedValueOnce(mockResult);

      const res = await aiIntelligenceService.processUtterance({
        sessionId,
        speaker,
        text,
      });

      expect(invoke).toHaveBeenCalledWith(expectedCommand, {
        sessionId,
        speaker,
        text,
        channel: "speaker",
        isInterim: false,
      });
      expect(res.session_id).toBe(sessionId);
      expect(res.moment_action).toBe(mockResult.moment_action);
      expect(res.current_suggestion?.title).toBe(mockResult.current_suggestion.title);
    }
  );

  it("finalizes meeting and retrieves executive summary with action items", async () => {
    const mockFinalize = {
      session_id: "session-finalize",
      executive_summary: "Meeting concluded with key architecture consensus.",
      action_items: [
        {
          id: "act-1",
          text: "Update Kafka broker configuration",
          assignee: "Sarah Lin",
          completed: false,
          priority: "high" as const,
        },
      ],
      key_decisions: [
        {
          id: "dec-1",
          decision: "Use 150ms buffer size",
          rationale: "Ensures sub-350ms end-to-end latency",
        },
      ],
    };

    vi.mocked(invoke).mockResolvedValueOnce(mockFinalize);

    const res = await aiIntelligenceService.finalizeMeeting("session-finalize");
    expect(invoke).toHaveBeenCalledWith("finalize_ai_meeting", {
      sessionId: "session-finalize",
    });
    expect(res.action_items.length).toBe(1);
    expect(res.key_decisions.length).toBe(1);
    expect(res.executive_summary).toContain("consensus");
  });

  it("resets meeting session state", async () => {
    vi.mocked(invoke).mockResolvedValueOnce({
      session_id: "sess-reset",
      status: "cleared",
    });

    const res = await aiIntelligenceService.resetSession("sess-reset");
    expect(invoke).toHaveBeenCalledWith("reset_ai_session", {
      sessionId: "sess-reset",
    });
    expect(res.status).toBe("cleared");
  });
});
