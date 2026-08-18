import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export interface UseWindowDragOptions {
  ignoreSelector?: string;
}

/**
 * Custom Hook for smooth Tauri frameless window dragging.
 * Filters out interactive elements (buttons, inputs, links, .no-drag).
 */
export function useWindowDrag(options?: UseWindowDragOptions) {
  const selector =
    options?.ignoreSelector ||
    "button, input, textarea, a, select, [role='button'], .no-drag";

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only drag on left click and when not clicking an interactive element
      if (
        e.button === 0 &&
        !(e.target as HTMLElement).closest(selector)
      ) {
        try {
          void getCurrentWindow().startDragging();
        } catch {
          // Non-Tauri fallback
        }
      }
    },
    [selector]
  );

  return {
    onMouseDown,
    "data-tauri-drag-region": true as const,
  };
}
