import { describe, it, expect, beforeEach, vi } from "vitest";

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) {
      delete mockStorage[k];
    }
  },
};
vi.stubGlobal("localStorage", localStorageMock);

const ONBOARDING_KEY = "reality_onboarding_completed_v1";

const onboardingStorage = {
  isCompleted(): boolean {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  },
  setCompleted(val: boolean): void {
    localStorage.setItem(ONBOARDING_KEY, String(val));
  },
  reset(): void {
    localStorage.removeItem(ONBOARDING_KEY);
  },
};

describe("Services - Onboarding Storage Unit Tests", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("defaults to false when not completed", () => {
    expect(onboardingStorage.isCompleted()).toBe(false);
  });

  it("sets and persists completed flag to true", () => {
    onboardingStorage.setCompleted(true);
    expect(onboardingStorage.isCompleted()).toBe(true);
  });

  it("resets onboarding status back to false", () => {
    onboardingStorage.setCompleted(true);
    onboardingStorage.reset();
    expect(onboardingStorage.isCompleted()).toBe(false);
  });
});
