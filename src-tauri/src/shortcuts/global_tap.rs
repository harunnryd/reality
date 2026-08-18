use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ShortcutDefinition {
    pub id: String,
    pub name: String,
    pub key_combination: String,
    pub is_enabled: bool,
}

pub fn get_default_shortcuts() -> Vec<ShortcutDefinition> {
    vec![
        ShortcutDefinition {
            id: "toggle_hud".to_string(),
            name: "Toggle Meeting HUD Overlay".to_string(),
            key_combination: "CommandOrControl+Backslash".to_string(),
            is_enabled: true,
        },
        ShortcutDefinition {
            id: "capture_slide".to_string(),
            name: "Capture Slide OCR Snapshot".to_string(),
            key_combination: "CommandOrControl+S".to_string(),
            is_enabled: true,
        },
        ShortcutDefinition {
            id: "spotlight_search".to_string(),
            name: "Open Spotlight Launcher".to_string(),
            key_combination: "CommandOrControl+K".to_string(),
            is_enabled: true,
        },
        ShortcutDefinition {
            id: "instant_assist".to_string(),
            name: "Trigger Instant AI Suggestion".to_string(),
            key_combination: "CommandOrControl+Enter".to_string(),
            is_enabled: true,
        },
    ]
}

#[derive(Clone)]
pub struct GlobalShortcutManager {
    pub is_listening: Arc<AtomicBool>,
}

impl Default for GlobalShortcutManager {
    fn default() -> Self {
        Self::new()
    }
}

impl GlobalShortcutManager {
    pub fn new() -> Self {
        Self {
            is_listening: Arc::new(AtomicBool::new(true)),
        }
    }

    pub fn is_active(&self) -> bool {
        self.is_listening.load(Ordering::SeqCst)
    }

    pub fn set_active(&self, active: bool) {
        self.is_listening.store(active, Ordering::SeqCst);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct ShortcutTestCase<'a> {
        name: &'a str,
        expected_id: &'a str,
        expected_combo: &'a str,
    }

    #[test]
    fn test_default_shortcuts_table() {
        let cases = [
            ShortcutTestCase {
                name: "toggle_hud_shortcut",
                expected_id: "toggle_hud",
                expected_combo: "CommandOrControl+Backslash",
            },
            ShortcutTestCase {
                name: "capture_slide_shortcut",
                expected_id: "capture_slide",
                expected_combo: "CommandOrControl+S",
            },
            ShortcutTestCase {
                name: "spotlight_search_shortcut",
                expected_id: "spotlight_search",
                expected_combo: "CommandOrControl+K",
            },
            ShortcutTestCase {
                name: "instant_assist_shortcut",
                expected_id: "instant_assist",
                expected_combo: "CommandOrControl+Enter",
            },
        ];

        let shortcuts = get_default_shortcuts();
        assert_eq!(shortcuts.len(), cases.len());

        for (actual, case) in shortcuts.iter().zip(cases.iter()) {
            assert_eq!(actual.id, case.expected_id, "case '{}' id", case.name);
            assert_eq!(actual.key_combination, case.expected_combo, "case '{}' combo", case.name);
            assert!(actual.is_enabled, "case '{}' should be enabled", case.name);
        }
    }

    #[test]
    fn test_shortcut_manager_state() {
        let manager = GlobalShortcutManager::new();
        assert!(manager.is_active());

        manager.set_active(false);
        assert!(!manager.is_active());

        manager.set_active(true);
        assert!(manager.is_active());
    }
}
