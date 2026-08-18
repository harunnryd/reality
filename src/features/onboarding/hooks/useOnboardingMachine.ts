import { useReducer, useEffect, useCallback } from "react";
import type { OnboardingState, OnboardingAction, OnboardingStage } from "@/features/onboarding/types";
import { onboardingStorage } from "@/services/onboardingStorage";
import { credentialsService } from "@/services/credentialsService";
import { deepgramService } from "@/services/deepgramService";
import { usePermissionsState } from "@/features/onboarding/hooks/usePermissionsState";

const initialState: OnboardingState = {
  stage: "permissions",
  isLoading: true,
  apiKey: "",
  deepgramApiKey: "",
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
    case "SET_DEEPGRAM_API_KEY":
      return {
        ...state,
        deepgramApiKey: action.apiKey,
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
      const storedDeepgram = deepgramService.getApiKey();
      if (storedDeepgram) {
        dispatch({ type: "SET_DEEPGRAM_API_KEY", apiKey: storedDeepgram });
      }
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

  const setDeepgramApiKey = useCallback((apiKey: string) => {
    dispatch({ type: "SET_DEEPGRAM_API_KEY", apiKey });
  }, []);

  const saveKeys = useCallback(async (openaiKey: string, deepgramKey: string) => {
    dispatch({ type: "SET_API_KEY_SAVING", isSaving: true });
    try {
      if (deepgramKey.trim()) {
        deepgramService.setApiKey(deepgramKey.trim());
        void deepgramService.configure(deepgramKey.trim());
      }
      if (openaiKey.trim()) {
        try {
          await credentialsService.validateAndStoreKey(openaiKey.trim());
        } catch {
          if (!deepgramKey.trim()) {
            throw new Error("Invalid OpenAI / Anthropic API key");
          }
        }
      }
      await onboardingStorage.setCompleted();
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
    setDeepgramApiKey,
    submitApiKey: (key: string) => saveKeys(key, state.deepgramApiKey),
    saveKeys,
    completeOnboarding,
  };
}
