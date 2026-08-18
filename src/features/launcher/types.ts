import * as React from "react";

export type PersonaMode = "general" | "tech" | "sales" | "executive";

export interface PersonaConfig {
  id: PersonaMode;
  label: string;
  description: string;
  icon: string;
  badgeColor: "blue" | "purple" | "green" | "amber";
}

export interface MeetingTranscriptItem {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface ActionItemDetail {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
  priority?: "high" | "medium" | "low";
  dueDate?: string;
  evidenceTimestamp?: number;
}

export interface KeyDecisionDetail {
  id: string;
  decision: string;
  rationale?: string;
  category?: string;
  evidenceTimestamp?: number;
}

export interface OpenQuestionDetail {
  id: string;
  question: string;
  status: "open" | "answered" | "deferred";
  owner?: string;
}

export interface RiskDetail {
  id: string;
  risk: string;
  severity: "high" | "medium" | "low";
  mitigation?: string;
}

export interface AttendeeParticipant {
  name: string;
  role?: string;
  talkRatio?: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  persona: PersonaMode;
  summary: string;
  objective?: string;
  consensus?: string;
  actionItems: (string | ActionItemDetail)[];
  keyPoints: (string | KeyDecisionDetail)[];
  openQuestions?: OpenQuestionDetail[];
  risks?: RiskDetail[];
  attendees?: AttendeeParticipant[];
  transcript?: MeetingTranscriptItem[];
}

export interface LauncherState {
  searchQuery: string;
  selectedPersona: PersonaMode;
  isStealthActive: boolean;
  selectedMeeting: Meeting | null;
  isDetailModalOpen: boolean;
  meetings: Meeting[];
  isLoading: boolean;
}
