use std::sync::Arc;

use serde::Deserialize;
use serde_json::{json, Value};
use tauri::{State, WebviewWindow};

use crate::audio::{
    self, AudioInputDevice, AudioOutputDevice, AudioPipeline, AudioSessionConfig, AudioSessionState,
};
use crate::credentials;
use crate::overlay;
use crate::shortcuts::{self, GlobalShortcutManager, ShortcutDefinition};
use crate::sidecar::{SidecarClient, SidecarHealthStatus, SidecarSupervisor};
use crate::system::{self, ActiveMeetingApp, DocumentExtractionResult, ForegroundGate};
use crate::vision::{self, ScreenSlideSnapshot};

#[tauri::command]
pub async fn ping_sidecar(sidecar: State<'_, Arc<SidecarClient>>, message: String) -> Result<Value, String> {
    sidecar
        .call("system.ping", json!({ "message": message }))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_sidecar_status(
    supervisor: State<'_, Arc<SidecarSupervisor>>,
) -> Result<SidecarHealthStatus, String> {
    Ok(supervisor.get_health_status(true))
}

#[tauri::command]
pub async fn list_audio_input_devices() -> Result<Vec<AudioInputDevice>, String> {
    audio::list_input_devices()
}

#[tauri::command]
pub async fn list_audio_output_devices() -> Result<Vec<AudioOutputDevice>, String> {
    audio::list_output_devices()
}

#[tauri::command]
pub async fn get_global_shortcuts(
    manager: State<'_, Arc<GlobalShortcutManager>>,
) -> Result<Vec<ShortcutDefinition>, String> {
    let mut shortcuts = shortcuts::get_default_shortcuts();
    let is_active = manager.is_active();
    for s in &mut shortcuts {
        s.is_enabled = is_active;
    }
    Ok(shortcuts)
}

#[tauri::command]
pub async fn set_global_shortcuts_active(
    manager: State<'_, Arc<GlobalShortcutManager>>,
    active: bool,
) -> Result<bool, String> {
    manager.set_active(active);
    Ok(manager.is_active())
}

#[tauri::command]
pub async fn detect_active_meeting_apps() -> Result<Vec<ActiveMeetingApp>, String> {
    Ok(system::detect_active_meeting_apps())
}

#[tauri::command]
pub async fn set_process_disguise(name: String) -> Result<bool, String> {
    system::set_process_display_name(&name)
}

#[tauri::command]
pub async fn get_available_disguises() -> Result<Vec<String>, String> {
    Ok(system::get_available_disguises()
        .into_iter()
        .map(|s| s.to_string())
        .collect())
}

#[tauri::command]
pub async fn is_composition_ime_active() -> Result<bool, String> {
    Ok(system::is_composition_ime_active())
}

#[tauri::command]
pub async fn foreground_gate_begin(
    gate: State<'_, Arc<ForegroundGate>>,
    kind: String,
) -> Result<String, String> {
    Ok(gate.begin(&kind))
}

#[tauri::command]
pub async fn foreground_gate_end(
    gate: State<'_, Arc<ForegroundGate>>,
    token: String,
) -> Result<(), String> {
    gate.end(&token);
    Ok(())
}

#[tauri::command]
pub async fn foreground_gate_is_busy(
    gate: State<'_, Arc<ForegroundGate>>,
) -> Result<bool, String> {
    Ok(gate.is_busy())
}

#[tauri::command]
pub async fn extract_document_text(path: String) -> Result<DocumentExtractionResult, String> {
    system::extract_document_text(&path)
}

#[tauri::command]
pub async fn start_audio_session(
    pipeline: State<'_, Arc<AudioPipeline>>,
    config: AudioSessionConfig,
) -> Result<AudioSessionState, String> {
    pipeline.start_session(&config)
}

#[tauri::command]
pub async fn stop_audio_session(
    pipeline: State<'_, Arc<AudioPipeline>>,
) -> Result<AudioSessionState, String> {
    pipeline.stop_session()
}

#[tauri::command]
pub async fn is_audio_session_active(
    pipeline: State<'_, Arc<AudioPipeline>>,
) -> Result<bool, String> {
    Ok(pipeline.is_active())
}

#[tauri::command]
pub async fn process_audio_chunk(
    pipeline: State<'_, Arc<AudioPipeline>>,
    samples: Vec<f32>,
) -> Result<bool, String> {
    let (_pcm, is_speech) = pipeline.process_samples(&samples);
    Ok(is_speech)
}

#[tauri::command]
pub async fn apply_stealth_mode(window: WebviewWindow) -> Result<(), String> {
    overlay::apply_stealth_attributes(&window)
}

#[tauri::command]
pub async fn capture_screen_slide() -> Result<ScreenSlideSnapshot, String> {
    vision::capture_screen_slide()
}

#[derive(Debug, Deserialize)]
struct ValidateKeyResult {
    valid: bool,
    error: Option<String>,
}

#[tauri::command]
pub async fn has_openai_key() -> bool {
    credentials::has_api_key("openai")
}

#[tauri::command]
pub async fn delete_openai_key() -> Result<(), String> {
    credentials::delete_api_key("openai").map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_and_store_openai_key(
    sidecar: State<'_, Arc<SidecarClient>>,
    key: String,
) -> Result<(), String> {
    let result = sidecar
        .call("credentials.validate_openai_key", json!({ "api_key": key }))
        .await
        .map_err(|e| e.to_string())?;

    let parsed: ValidateKeyResult = serde_json::from_value(result).map_err(|e| e.to_string())?;

    if !parsed.valid {
        return Err(parsed.error.unwrap_or_else(|| "invalid API key".to_string()));
    }

    credentials::store_api_key("openai", &key).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn close_window(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn toggle_maximize_window(window: tauri::Window) -> Result<(), String> {
    if window.is_maximized().unwrap_or(false) {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}
