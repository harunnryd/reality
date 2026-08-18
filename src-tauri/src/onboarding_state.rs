use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct OnboardingState {
    pub completed: bool,
}

#[tauri::command]
pub fn get_onboarding_state() -> OnboardingState {
    OnboardingState::default()
}

#[tauri::command]
pub fn set_onboarding_completed() -> OnboardingState {
    OnboardingState { completed: true }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_onboarding_state_default() {
        let state = OnboardingState::default();
        assert!(!state.completed);
    }

    #[test]
    fn test_onboarding_state_serialization() {
        let state = OnboardingState { completed: true };
        let json = serde_json::to_string(&state).unwrap();
        assert_eq!(json, "{\"completed\":true}");
    }
}
