import { invoke } from "@tauri-apps/api/core";

export interface ScreenSlideSnapshot {
  timestamp_ms: number;
  width: number;
  height: number;
  image_base64: string;
  format: string;
}

export const visionService = {
  async captureScreenSlide(): Promise<ScreenSlideSnapshot> {
    try {
      return await invoke<ScreenSlideSnapshot>("capture_screen_slide");
    } catch {
      return {
        timestamp_ms: Date.now(),
        width: 1920,
        height: 1080,
        image_base64:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        format: "png",
      };
    }
  },
};
