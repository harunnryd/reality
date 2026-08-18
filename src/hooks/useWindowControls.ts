import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

export interface UseWindowControlsReturn {
  close: () => Promise<void>;
  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
}

/**
 * Custom Hook for macOS Window Controls with Tauri v2 API and native IPC fallback.
 */
export function useWindowControls(): UseWindowControlsReturn {
  const close = useCallback(async () => {
    try {
      await getCurrentWindow().close();
    } catch {
      try {
        await invoke("close_window");
      } catch {
        // Fallback for non-Tauri / browser dev mode
      }
    }
  }, []);

  const minimize = useCallback(async () => {
    try {
      await getCurrentWindow().minimize();
    } catch {
      try {
        await invoke("minimize_window");
      } catch {
        // Fallback for non-Tauri / browser dev mode
      }
    }
  }, []);

  const toggleMaximize = useCallback(async () => {
    try {
      await getCurrentWindow().toggleMaximize();
    } catch {
      try {
        await invoke("toggle_maximize_window");
      } catch {
        // Fallback for non-Tauri / browser dev mode
      }
    }
  }, []);

  return { close, minimize, toggleMaximize };
}
