import { invoke } from "@tauri-apps/api/core";

export interface ShortcutDefinition {
  id: string;
  name: string;
  key_combination: string;
  is_enabled: boolean;
}

export const shortcutsService = {
  async getGlobalShortcuts(): Promise<ShortcutDefinition[]> {
    try {
      return await invoke<ShortcutDefinition[]>("get_global_shortcuts");
    } catch {
      return [
        {
          id: "toggle_hud",
          name: "Toggle Meeting HUD Overlay",
          key_combination: "CommandOrControl+Backslash",
          is_enabled: true,
        },
        {
          id: "capture_slide",
          name: "Capture Slide OCR Snapshot",
          key_combination: "CommandOrControl+S",
          is_enabled: true,
        },
        {
          id: "spotlight_search",
          name: "Open Spotlight Launcher",
          key_combination: "CommandOrControl+K",
          is_enabled: true,
        },
      ];
    }
  },
};
