import { invoke } from "@tauri-apps/api/core";

export type PermissionStatus = "granted" | "denied" | "not_determined";

export interface PermissionsSnapshot {
  microphone: PermissionStatus;
  screen_recording: PermissionStatus;
  accessibility: PermissionStatus;
}

export const permissionsService = {
  async checkPermissions(): Promise<PermissionsSnapshot> {
    try {
      return await invoke<PermissionsSnapshot>("check_permissions");
    } catch {
      return {
        microphone: "not_determined",
        screen_recording: "not_determined",
        accessibility: "not_determined",
      };
    }
  },

  async requestMicrophone(): Promise<PermissionStatus> {
    return invoke<PermissionStatus>("request_microphone_access");
  },

  async requestScreenRecording(): Promise<PermissionStatus> {
    return invoke<PermissionStatus>("request_screen_recording_access");
  },

  async openScreenRecordingSettings(): Promise<void> {
    return invoke("open_screen_recording_settings");
  },

  async openAccessibilitySettings(): Promise<void> {
    return invoke("open_accessibility_settings");
  },
};
