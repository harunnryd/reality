import { invoke } from "@tauri-apps/api/core";

export interface AudioInputDevice {
  id: string;
  name: string;
  is_default: boolean;
}

export interface AudioOutputDevice {
  id: string;
  name: string;
  is_default: boolean;
}

export interface AudioSessionConfig {
  mic_device_id?: string;
  capture_system_audio: boolean;
  vad_enabled: boolean;
}

export interface AudioSessionState {
  is_running: boolean;
  current_device: string;
  frames_captured: number;
  is_speech_active: boolean;
}

export const audioService = {
  async listInputDevices(): Promise<AudioInputDevice[]> {
    try {
      return await invoke<AudioInputDevice[]>("list_audio_input_devices");
    } catch {
      return [
        {
          id: "default",
          name: "Default System Microphone",
          is_default: true,
        },
      ];
    }
  },

  async listOutputDevices(): Promise<AudioOutputDevice[]> {
    try {
      return await invoke<AudioOutputDevice[]>("list_audio_output_devices");
    } catch {
      return [
        {
          id: "default_speaker",
          name: "MacBook Pro Speakers",
          is_default: true,
        },
      ];
    }
  },

  async startSession(config: AudioSessionConfig): Promise<AudioSessionState> {
    try {
      return await invoke<AudioSessionState>("start_audio_session", { config });
    } catch {
      return {
        is_running: true,
        current_device: config.mic_device_id || "default",
        frames_captured: 0,
        is_speech_active: false,
      };
    }
  },

  async stopSession(): Promise<AudioSessionState> {
    try {
      return await invoke<AudioSessionState>("stop_audio_session");
    } catch {
      return {
        is_running: false,
        current_device: "none",
        frames_captured: 0,
        is_speech_active: false,
      };
    }
  },
};
