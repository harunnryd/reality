use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use crate::audio::devices::resolve_best_device;
use crate::audio::resampler::LinearResampler;
use crate::audio::speaker_capture::SpeakerCapture;
use crate::audio::vad::VadDetector;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioSessionConfig {
    pub mic_device_id: Option<String>,
    pub capture_system_audio: bool,
    pub vad_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioSessionState {
    pub is_running: bool,
    pub current_device: String,
    pub frames_captured: u64,
    pub is_speech_active: bool,
}

#[derive(Clone)]
pub struct AudioPipeline {
    is_running: Arc<AtomicBool>,
    frames_count: Arc<AtomicU64>,
    resampler: Arc<Mutex<LinearResampler>>,
    vad: Arc<Mutex<VadDetector>>,
    speaker: Arc<SpeakerCapture>,
}

impl Default for AudioPipeline {
    fn default() -> Self {
        Self::new()
    }
}

impl AudioPipeline {
    pub fn new() -> Self {
        Self {
            is_running: Arc::new(AtomicBool::new(false)),
            frames_count: Arc::new(AtomicU64::new(0)),
            resampler: Arc::new(Mutex::new(LinearResampler::new(48_000, 1))),
            vad: Arc::new(Mutex::new(VadDetector::new())),
            speaker: Arc::new(SpeakerCapture::new()),
        }
    }

    pub fn start_session(&self, config: &AudioSessionConfig) -> Result<AudioSessionState, String> {
        self.is_running.store(true, Ordering::SeqCst);
        if let Ok(mut r) = self.resampler.lock() {
            r.reset();
        }
        if let Ok(mut v) = self.vad.lock() {
            v.reset();
        }

        if config.capture_system_audio {
            let _ = self.speaker.start();
        }

        let device_name = match &config.mic_device_id {
            Some(id) => {
                let candidates = vec![id.clone(), "MacBook Pro Microphone".to_string()];
                resolve_best_device(id, &candidates)
                    .cloned()
                    .unwrap_or_else(|| id.clone())
            }
            None => "default".to_string(),
        };

        Ok(AudioSessionState {
            is_running: true,
            current_device: device_name,
            frames_captured: self.total_captured_frames(),
            is_speech_active: false,
        })
    }

    pub fn stop_session(&self) -> Result<AudioSessionState, String> {
        self.is_running.store(false, Ordering::SeqCst);
        let _ = self.speaker.stop();
        Ok(AudioSessionState {
            is_running: false,
            current_device: "none".to_string(),
            frames_captured: self.total_captured_frames(),
            is_speech_active: false,
        })
    }

    pub fn process_samples(&self, raw_samples: &[f32]) -> (Vec<i16>, bool) {
        if !self.is_running.load(Ordering::Relaxed) || raw_samples.is_empty() {
            return (Vec::new(), false);
        }

        self.frames_count.fetch_add(1, Ordering::Relaxed);
        self.speaker.record_samples(raw_samples.len());

        let pcm = if let Ok(mut r) = self.resampler.lock() {
            r.resample_to_i16(raw_samples)
        } else {
            Vec::new()
        };

        let is_speech = if let Ok(mut v) = self.vad.lock() {
            v.update(&pcm);
            v.is_speech()
        } else {
            false
        };

        (pcm, is_speech)
    }

    pub fn is_active(&self) -> bool {
        self.is_running.load(Ordering::SeqCst) || self.speaker.is_active()
    }

    pub fn total_captured_frames(&self) -> u64 {
        self.frames_count.load(Ordering::Relaxed) + self.speaker.total_frames()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct PipelineStateTestCase {
        name: &'static str,
        config: AudioSessionConfig,
        expect_running: bool,
        expect_device: &'static str,
    }

    #[test]
    fn test_pipeline_session_lifecycle_table() {
        let cases = [
            PipelineStateTestCase {
                name: "default_device_session",
                config: AudioSessionConfig {
                    mic_device_id: None,
                    capture_system_audio: true,
                    vad_enabled: true,
                },
                expect_running: true,
                expect_device: "default",
            },
            PipelineStateTestCase {
                name: "specific_mic_session",
                config: AudioSessionConfig {
                    mic_device_id: Some("airpods-pro".to_string()),
                    capture_system_audio: false,
                    vad_enabled: true,
                },
                expect_running: true,
                expect_device: "airpods-pro",
            },
        ];

        let pipeline = AudioPipeline::new();
        for case in cases {
            let state = pipeline.start_session(&case.config).unwrap();
            assert_eq!(state.is_running, case.expect_running, "case '{}'", case.name);
            assert_eq!(state.current_device, case.expect_device, "case '{}'", case.name);
            assert!(pipeline.is_active());

            let (pcm, _is_speech) = pipeline.process_samples(&vec![0.5f32; 480]);
            assert!(!pcm.is_empty());
            assert!(pipeline.total_captured_frames() > 0);

            let stopped = pipeline.stop_session().unwrap();
            assert!(!stopped.is_running);
            assert!(!pipeline.is_active());
        }
    }

    #[test]
    fn test_pipeline_inactive_processing() {
        let pipeline = AudioPipeline::new();
        let (pcm, is_speech) = pipeline.process_samples(&vec![0.5f32; 480]);
        assert!(pcm.is_empty());
        assert!(!is_speech);
    }
}
