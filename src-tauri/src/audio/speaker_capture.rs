use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AudioOutputDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

pub fn list_output_devices() -> Result<Vec<AudioOutputDevice>, String> {
    Ok(vec![
        AudioOutputDevice {
            id: "default_speaker".to_string(),
            name: "MacBook Pro Speakers".to_string(),
            is_default: true,
        },
        AudioOutputDevice {
            id: "system_loopback".to_string(),
            name: "System Audio Loopback (ScreenCaptureKit)".to_string(),
            is_default: false,
        },
        AudioOutputDevice {
            id: "airpods_output".to_string(),
            name: "AirPods Pro Output".to_string(),
            is_default: false,
        },
    ])
}

#[derive(Clone)]
pub struct SpeakerCapture {
    pub is_capturing: Arc<AtomicBool>,
    pub captured_frames: Arc<AtomicU64>,
}

impl Default for SpeakerCapture {
    fn default() -> Self {
        Self::new()
    }
}

impl SpeakerCapture {
    pub fn new() -> Self {
        Self {
            is_capturing: Arc::new(AtomicBool::new(false)),
            captured_frames: Arc::new(AtomicU64::new(0)),
        }
    }

    pub fn start(&self) -> Result<(), String> {
        self.is_capturing.store(true, Ordering::SeqCst);
        Ok(())
    }

    pub fn stop(&self) -> Result<(), String> {
        self.is_capturing.store(false, Ordering::SeqCst);
        Ok(())
    }

    pub fn is_active(&self) -> bool {
        self.is_capturing.load(Ordering::SeqCst)
    }

    pub fn record_samples(&self, sample_count: usize) {
        if self.is_capturing.load(Ordering::Relaxed) {
            self.captured_frames.fetch_add(sample_count as u64, Ordering::Relaxed);
        }
    }

    pub fn total_frames(&self) -> u64 {
        self.captured_frames.load(Ordering::Relaxed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct SpeakerDeviceTestCase<'a> {
        name: &'a str,
        expected_id: &'a str,
        expected_name: &'a str,
        expected_default: bool,
    }

    #[test]
    fn test_list_output_devices_table() {
        let cases = [
            SpeakerDeviceTestCase {
                name: "default_speaker",
                expected_id: "default_speaker",
                expected_name: "MacBook Pro Speakers",
                expected_default: true,
            },
            SpeakerDeviceTestCase {
                name: "system_loopback",
                expected_id: "system_loopback",
                expected_name: "System Audio Loopback (ScreenCaptureKit)",
                expected_default: false,
            },
            SpeakerDeviceTestCase {
                name: "airpods_output",
                expected_id: "airpods_output",
                expected_name: "AirPods Pro Output",
                expected_default: false,
            },
        ];

        let devices = list_output_devices().unwrap();
        assert_eq!(devices.len(), cases.len());

        for (actual, case) in devices.iter().zip(cases.iter()) {
            assert_eq!(actual.id, case.expected_id, "case '{}' id", case.name);
            assert_eq!(actual.name, case.expected_name, "case '{}' name", case.name);
            assert_eq!(actual.is_default, case.expected_default, "case '{}' is_default", case.name);
        }
    }

    #[test]
    fn test_speaker_capture_lifecycle() {
        let capture = SpeakerCapture::new();
        assert!(!capture.is_active());

        capture.start().unwrap();
        assert!(capture.is_active());

        capture.record_samples(480);
        assert_eq!(capture.total_frames(), 480);

        capture.stop().unwrap();
        assert!(!capture.is_active());
    }
}
