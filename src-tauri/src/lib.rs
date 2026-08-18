mod audio;
mod commands;
mod credentials;
mod onboarding_state;
mod overlay;
mod permissions;
mod shortcuts;
mod sidecar;
mod system;
mod vision;

use std::sync::Arc;
use audio::AudioPipeline;
use shortcuts::GlobalShortcutManager;
use sidecar::{SidecarClient, SidecarSupervisor};
use system::ForegroundGate;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let client = SidecarClient::spawn(app.handle())?;
            app.manage(client);
            let supervisor = Arc::new(SidecarSupervisor::new());
            app.manage(supervisor);
            let pipeline = Arc::new(AudioPipeline::new());
            app.manage(pipeline);
            let shortcuts = Arc::new(GlobalShortcutManager::new());
            app.manage(shortcuts);
            let gate = Arc::new(ForegroundGate::new());
            app.manage(gate);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::ping_sidecar,
            commands::process_ai_utterance,
            commands::finalize_ai_meeting,
            commands::reset_ai_session,
            commands::get_sidecar_status,
            commands::list_audio_input_devices,
            commands::list_audio_output_devices,
            commands::get_global_shortcuts,
            commands::set_global_shortcuts_active,
            commands::detect_active_meeting_apps,
            commands::set_process_disguise,
            commands::get_available_disguises,
            commands::is_composition_ime_active,
            commands::foreground_gate_begin,
            commands::foreground_gate_end,
            commands::foreground_gate_is_busy,
            commands::extract_document_text,
            commands::start_audio_session,
            commands::stop_audio_session,
            commands::is_audio_session_active,
            commands::process_audio_chunk,
            commands::apply_stealth_mode,
            commands::capture_screen_slide,
            commands::has_openai_key,
            commands::delete_openai_key,
            commands::validate_and_store_openai_key,
            commands::close_window,
            commands::minimize_window,
            commands::toggle_maximize_window,
            permissions::check_permissions,
            permissions::request_microphone_access,
            permissions::request_screen_recording_access,
            permissions::open_screen_recording_settings,
            permissions::open_accessibility_settings,
            onboarding_state::get_onboarding_state,
            onboarding_state::set_onboarding_completed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
