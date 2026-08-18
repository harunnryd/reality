import { invoke } from "@tauri-apps/api/core";

export interface ActiveMeetingApp {
  name: string;
  platform: string;
  bundle_id: string;
  is_meeting_active: boolean;
}

export const systemService = {
  async detectActiveMeetingApps(): Promise<ActiveMeetingApp[]> {
    try {
      return await invoke<ActiveMeetingApp[]>("detect_active_meeting_apps");
    } catch {
      return [
        {
          name: "Zoom Workplace",
          platform: "zoom",
          bundle_id: "us.zoom.xos",
          is_meeting_active: true,
        },
      ];
    }
  },

  async setProcessDisguise(name: string): Promise<boolean> {
    try {
      return await invoke<boolean>("set_process_disguise", { name });
    } catch {
      return false;
    }
  },

  async getAvailableDisguises(): Promise<string[]> {
    try {
      return await invoke<string[]>("get_available_disguises");
    } catch {
      return [
        "Reality",
        "System Settings",
        "Terminal",
        "Finder",
        "Activity Monitor",
        "Notes",
      ];
    }
  },

  async isCompositionImeActive(): Promise<boolean> {
    try {
      return await invoke<boolean>("is_composition_ime_active");
    } catch {
      return false;
    }
  },
};
