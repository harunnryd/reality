import type { PermissionStatus, PermissionsSnapshot } from "@/services/permissionsService";

export type OnboardingStage = "permissions" | "api_key" | "ready" | "done";

export interface OnboardingState {
  stage: OnboardingStage;
  isLoading: boolean;
  apiKey: string;
  apiKeySaving: boolean;
  apiKeyError: string | null;
  permissions: PermissionsSnapshot;
}

export type OnboardingAction =
  | { type: "INIT_COMPLETED"; completed: boolean }
  | { type: "SET_STAGE"; stage: OnboardingStage }
  | { type: "SET_PERMISSIONS"; permissions: PermissionsSnapshot }
  | { type: "SET_API_KEY"; apiKey: string }
  | { type: "SET_API_KEY_SAVING"; isSaving: boolean }
  | { type: "SET_API_KEY_ERROR"; error: string | null };
