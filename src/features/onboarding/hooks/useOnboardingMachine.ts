import { useReducer, useEffect, useCallback } from "react";
import type { OnboardingState, OnboardingAction, OnboardingStage } from "@/features/onboarding/types";
import { onboardingStorage } from "@/services/onboardingStorage";
import { credentialsService } from "@/services/credentialsService";
import { usePermissionsState } from "@/features/onboarding/hooks/usePermissionsState";

const initialState: OnboardingState = {
  stage: "permissions",
  isLoading: true,
  apiKey: "",
  apiKeySaving: false,
  apiKeyError: null,
  permissions: {
    microphone: "not_determined",
    screen_recording: "not_determined",
    accessibility: "not_determined",
  },
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "INIT_COMPLETED":
      return {
        ...state,
        stage: action.completed ? "done" : "permissions",
        isLoading: false,
      };
    case "SET_STAGE":
      return {
        ...state,
        stage: action.stage,
      };
    case "SET_PERMISSIONS":
      return {
        ...state,
        permissions: action.permissions,
      };
    case "SET_API_KEY":
      return {
        ...state,
        apiKey: action.apiKey,
        apiKeyError: null,
      };
    case "SET_API_KEY_SAVING":
      return {
        ...state,
        apiKeySaving: action.isSaving,
      };
    case "SET_API_KEY_ERROR":
      return {
        ...state,
        apiKeyError: action.error,
        apiKeySaving: false,
      };
    default:
      return state;
  }
}

export function useOnboardingMachine() {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const permissionsHook = usePermissionsState();

  useEffect(() => {
    async function init() {
      const isDone = await onboardingStorage.isCompleted();
      dispatch({ type: "INIT_COMPLETED", completed: isDone });
    }
    void init();
  }, []);

  useEffect(() => {
    dispatch({ type: "SET_PERMISSIONS", permissions: permissionsHook.permissions });
  }, [permissionsHook.permissions]);

  const setStage = useCallback((stage: OnboardingStage) => {
    dispatch({ type: "SET_STAGE", stage });
  }, []);

  const setApiKey = useCallback((apiKey: string) => {
    dispatch({ type: "SET_API_KEY", apiKey });
  }, []);

  const saveApiKey = useCallback(async (key: string) => {
    dispatch({ type: "SET_API_KEY_SAVING", isSaving: true });
    try {
      await credentialsService.validateAndStoreKey(key);
      dispatch({ type: "SET_STAGE", stage: "done" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Validation failed";
      dispatch({ type: "SET_API_KEY_ERROR", error: msg });
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    await onboardingStorage.setCompleted();
    dispatch({ type: "SET_STAGE", stage: "done" });
  }, []);

  return {
    state,
    permissionsManager: permissionsHook,
    goToStage: setStage,
    setStage,
    setApiKey,
    submitApiKey: saveApiKey,
    saveApiKey,
    completeOnboarding,
  };
}
