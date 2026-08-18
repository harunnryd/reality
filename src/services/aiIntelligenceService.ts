import { invoke } from "@tauri-apps/api/core";

export interface CodeSnippet {
  lang: string;
  code: string;
  technique?: string | null;
  complexity?: string | null;
}

export interface LiveSuggestion {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  code_snippet?: CodeSnippet | null;
  key_takeaways: string[];
}

export interface ActionItem {
  id: string;
  text: string;
  assignee?: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

export interface KeyDecision {
  id: string;
  decision: string;
  rationale?: string | null;
}

export interface ProcessUtteranceResponse {
  session_id: string;
  moment_action: string;
  latest_detected_question?: string | null;
  current_suggestion?: LiveSuggestion | null;
}

export interface FinalizeMeetingResponse {
  session_id: string;
  executive_summary: string;
  action_items: ActionItem[];
  key_decisions: KeyDecision[];
}

export const aiIntelligenceService = {
  async processUtterance(params: {
    sessionId: string;
    speaker: string;
    text: string;
    channel?: "mic" | "speaker";
    isInterim?: boolean;
  }): Promise<ProcessUtteranceResponse> {
    return await invoke<ProcessUtteranceResponse>("process_ai_utterance", {
      sessionId: params.sessionId,
      speaker: params.speaker,
      text: params.text,
      channel: params.channel ?? "speaker",
      isInterim: params.isInterim ?? false,
    });
  },

  async finalizeMeeting(sessionId: string): Promise<FinalizeMeetingResponse> {
    return await invoke<FinalizeMeetingResponse>("finalize_ai_meeting", {
      sessionId,
    });
  },

  async resetSession(sessionId: string): Promise<{ session_id: string; status: string }> {
    return await invoke<{ session_id: string; status: string }>("reset_ai_session", {
      sessionId,
    });
  },
};
