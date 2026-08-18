import { invoke } from "@tauri-apps/api/core";

export const onboardingStorage = {
  async isCompleted(): Promise<boolean> {
    try {
      const state = await invoke<{ completed: boolean }>("get_onboarding_state");
      return Boolean(state?.completed);
    } catch {
      return false;
    }
  },

  async setCompleted(): Promise<void> {
    return invoke("set_onboarding_completed");
  },
};
