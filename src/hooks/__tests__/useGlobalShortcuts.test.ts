import { describe, it, expect } from "vitest";

function evaluateShortcutKey(
  e: { key: string; metaKey: boolean; ctrlKey: boolean; isInput: boolean }
): "search" | "start_meeting" | "escape" | "none" {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    return "search";
  }
  if (e.key === "/" && !e.isInput) {
    return "search";
  }
  if (e.key === "Escape") {
    return "escape";
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && !e.isInput) {
    return "start_meeting";
  }
  return "none";
}

describe("Hooks - Global Keyboard Shortcuts", () => {
  const shortcutCases = [
    {
      description: "⌘K pressed outside input",
      event: { key: "k", metaKey: true, ctrlKey: false, isInput: false },
      expected: "search",
    },
    {
      description: "Ctrl+K pressed inside input",
      event: { key: "k", metaKey: false, ctrlKey: true, isInput: true },
      expected: "search",
    },
    {
      description: "'/' pressed outside input",
      event: { key: "/", metaKey: false, ctrlKey: false, isInput: false },
      expected: "search",
    },
    {
      description: "'/' typed inside active text input",
      event: { key: "/", metaKey: false, ctrlKey: false, isInput: true },
      expected: "none",
    },
    {
      description: "⌘N pressed outside input",
      event: { key: "n", metaKey: true, ctrlKey: false, isInput: false },
      expected: "start_meeting",
    },
    {
      description: "⌘N typed inside active text input",
      event: { key: "n", metaKey: true, ctrlKey: false, isInput: true },
      expected: "none",
    },
    {
      description: "Escape key pressed",
      event: { key: "Escape", metaKey: false, ctrlKey: false, isInput: true },
      expected: "escape",
    },
    {
      description: "Regular character typed",
      event: { key: "a", metaKey: false, ctrlKey: false, isInput: false },
      expected: "none",
    },
  ];

  it.each(shortcutCases)("evaluates $description to '$expected'", ({ event, expected }) => {
    expect(evaluateShortcutKey(event)).toBe(expected);
  });
});
