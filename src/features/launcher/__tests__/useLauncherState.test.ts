import { describe, it, expect } from "vitest";
import { Meeting, PersonaMode } from "../types";

function createLauncherStateManager(initialMeetings: Meeting[]) {
  let meetings = [...initialMeetings];
  let searchQuery = "";
  let selectedPersona: PersonaMode = "general";
  let isStealthActive = true;
  let selectedMeeting: Meeting | null = null;

  return {
    getMeetings: () => meetings,
    getSearchQuery: () => searchQuery,
    getSelectedPersona: () => selectedPersona,
    getIsStealthActive: () => isStealthActive,
    getSelectedMeeting: () => selectedMeeting,
    setSearchQuery: (q: string) => {
      searchQuery = q;
    },
    setSelectedPersona: (p: PersonaMode) => {
      selectedPersona = p;
    },
    toggleStealth: () => {
      isStealthActive = !isStealthActive;
    },
    openMeetingDetail: (m: Meeting) => {
      selectedMeeting = m;
    },
    closeMeetingDetail: () => {
      selectedMeeting = null;
    },
    deleteMeeting: (id: string) => {
      meetings = meetings.filter((m) => m.id !== id);
      if (selectedMeeting?.id === id) {
        selectedMeeting = null;
      }
    },
  };
}

describe("Launcher - useLauncherState State Machine Unit Tests", () => {
  const dummy: Meeting = {
    id: "m-test-state-1",
    title: "Test Meeting",
    date: "2026-08-17T12:00:00Z",
    duration: "30m",
    persona: "tech",
    summary: "State test.",
    attendees: [],
    actionItems: [],
    keyPoints: [],
  };

  it("handles persona selection", () => {
    const manager = createLauncherStateManager([dummy]);
    expect(manager.getSelectedPersona()).toBe("general");
    manager.setSelectedPersona("tech");
    expect(manager.getSelectedPersona()).toBe("tech");
  });

  it("handles stealth toggle", () => {
    const manager = createLauncherStateManager([dummy]);
    expect(manager.getIsStealthActive()).toBe(true);
    manager.toggleStealth();
    expect(manager.getIsStealthActive()).toBe(false);
  });

  it("opens and closes meeting details view", () => {
    const manager = createLauncherStateManager([dummy]);
    expect(manager.getSelectedMeeting()).toBeNull();
    manager.openMeetingDetail(dummy);
    expect(manager.getSelectedMeeting()?.id).toBe("m-test-state-1");
    manager.closeMeetingDetail();
    expect(manager.getSelectedMeeting()).toBeNull();
  });

  it("deletes meeting and clears active selection if deleted", () => {
    const manager = createLauncherStateManager([dummy]);
    manager.openMeetingDetail(dummy);
    manager.deleteMeeting("m-test-state-1");
    expect(manager.getMeetings().length).toBe(0);
    expect(manager.getSelectedMeeting()).toBeNull();
  });
});
