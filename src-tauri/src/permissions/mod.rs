mod accessibility;
mod microphone;
mod screen_recording;

use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum PermissionStatus {
    Granted,
    Denied,
    NotDetermined,
}

#[derive(Debug, Clone, Serialize)]
pub struct PermissionsSnapshot {
    pub microphone: PermissionStatus,
    pub screen_recording: PermissionStatus,
    pub accessibility: PermissionStatus,
}

#[tauri::command]
pub fn check_permissions() -> PermissionsSnapshot {
    PermissionsSnapshot {
        microphone: microphone::status(),
        screen_recording: screen_recording::status(),
        accessibility: accessibility::status(),
    }
}

#[tauri::command]
pub fn request_microphone_access() -> PermissionStatus {
    microphone::request()
}

#[tauri::command]
pub fn request_screen_recording_access() -> PermissionStatus {
    screen_recording::request()
}

#[tauri::command]
pub fn open_screen_recording_settings() {
    screen_recording::open_system_settings();
}

#[tauri::command]
pub fn open_accessibility_settings() {
    accessibility::open_system_settings();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_permissions_snapshot_integrity() {
        let snapshot = check_permissions();
        let valid_states = [
            PermissionStatus::Granted,
            PermissionStatus::Denied,
            PermissionStatus::NotDetermined,
        ];

        assert!(valid_states.contains(&snapshot.microphone));
        assert!(valid_states.contains(&snapshot.screen_recording));
        assert!(valid_states.contains(&snapshot.accessibility));
    }
}
