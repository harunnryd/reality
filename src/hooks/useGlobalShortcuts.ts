import { useEffect } from "react";

export interface GlobalShortcutsHandlers {
  onSearchFocus?: () => void;
  onEscape?: () => void;
  onStartMeeting?: () => void;
}

export function useGlobalShortcuts(handlers: GlobalShortcutsHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handlers.onSearchFocus?.();
        return;
      }

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        handlers.onSearchFocus?.();
        return;
      }

      if (e.key === "Escape") {
        handlers.onEscape?.();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && !isInput) {
        e.preventDefault();
        handlers.onStartMeeting?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
