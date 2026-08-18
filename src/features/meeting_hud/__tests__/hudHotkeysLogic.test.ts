import { describe, it, expect } from "vitest";

export interface HotkeyAction {
  id: string;
  label: string;
  promptIntent: string;
}

const HUD_HOTKEYS: HotkeyAction[] = [
  { id: "what_to_answer", label: "What should I answer?", promptIntent: "answer_cue" },
  { id: "clarify", label: "Clarify", promptIntent: "clarification" },
  { id: "recap", label: "Recap", promptIntent: "summary_recap" },
  { id: "follow_up", label: "Follow up", promptIntent: "follow_up_question" },
  { id: "answer", label: "Answer", promptIntent: "direct_answer" },
];

function findHotkeyByLabel(label: string): HotkeyAction | undefined {
  return HUD_HOTKEYS.find((h) => h.label.toLowerCase() === label.toLowerCase());
}

function generateHotkeyPrompt(label: string, activeContextSnippet?: string): string {
  const hotkey = findHotkeyByLabel(label);
  if (!hotkey) return label;

  switch (hotkey.promptIntent) {
    case "answer_cue":
      return `Suggest the best answer for: "${activeContextSnippet || "latest speaker inquiry"}"`;
    case "clarification":
      return "Clarify the technical requirements and architecture constraints.";
    case "summary_recap":
      return "Generate a concise bulleted recap of key points discussed so far.";
    case "follow_up_question":
      return "Suggest 2 impactful follow-up questions to ask the speaker.";
    case "direct_answer":
      return "Provide immediate direct answer synthesis.";
    default:
      return label;
  }
}

describe("Meeting HUD - Hotkeys Logic Unit Tests", () => {
  it("defines all 5 standard teleprompter quick action hotkeys", () => {
    expect(HUD_HOTKEYS.length).toBe(5);
    expect(HUD_HOTKEYS.map((h) => h.id)).toEqual([
      "what_to_answer",
      "clarify",
      "recap",
      "follow_up",
      "answer",
    ]);
  });

  const promptCases = [
    { label: "What should I answer?", snippet: "How does HNSW quantization work?", expectedKeyword: "HNSW quantization" },
    { label: "Clarify", snippet: undefined, expectedKeyword: "architecture constraints" },
    { label: "Recap", snippet: undefined, expectedKeyword: "bulleted recap" },
    { label: "Follow up", snippet: undefined, expectedKeyword: "follow-up questions" },
  ];

  it.each(promptCases)("generates prompt for '$label'", ({ label, snippet, expectedKeyword }) => {
    const prompt = generateHotkeyPrompt(label, snippet);
    expect(prompt).toContain(expectedKeyword);
  });
});
