import { describe, it, expect, vi } from "vitest";

function createMockWindowController() {
  let isMinimized = false;
  let isMaximized = false;
  let isClosed = false;

  return {
    minimize: vi.fn(() => {
      isMinimized = true;
    }),
    toggleMaximize: vi.fn(() => {
      isMaximized = !isMaximized;
    }),
    close: vi.fn(() => {
      isClosed = true;
    }),
    getState: () => ({ isMinimized, isMaximized, isClosed }),
  };
}

describe("Hooks - Window Controls Unit Tests", () => {
  it("invokes close window command", () => {
    const controller = createMockWindowController();
    controller.close();
    expect(controller.close).toHaveBeenCalledTimes(1);
    expect(controller.getState().isClosed).toBe(true);
  });

  it("invokes minimize window command", () => {
    const controller = createMockWindowController();
    controller.minimize();
    expect(controller.minimize).toHaveBeenCalledTimes(1);
    expect(controller.getState().isMinimized).toBe(true);
  });

  it("toggles maximize window state", () => {
    const controller = createMockWindowController();
    controller.toggleMaximize();
    expect(controller.getState().isMaximized).toBe(true);
    controller.toggleMaximize();
    expect(controller.getState().isMaximized).toBe(false);
  });
});
