import { PersonaMode } from "../launcher/types";

export interface LiveTranscriptMessage {
  id: string;
  speaker: string;
  text: string;
  timestamp: number;
  isPartial?: boolean;
}

export interface LiveAiSuggestion {
  id: string;
  title: string;
  summary: string;
  confidence?: number;
  codeSnippet?: {
    lang: string;
    code: string;
    technique?: string;
    complexity?: string;
  };
}

export interface LiveMeetingConfig {
  title?: string;
  persona?: PersonaMode;
  isStealth?: boolean;
}
