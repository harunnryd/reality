use std::time::{SystemTime, UNIX_EPOCH};

use crate::audio::adaptive_vad::AdaptiveNoiseTracker;

pub const VAD_HANGOVER_MS: u128 = 500;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VadState {
    Idle,
    Speech,
    Hangover,
}

pub struct VadDetector {
    pub state: VadState,
    pub tracker: AdaptiveNoiseTracker,
    hangover_duration_ms: u128,
    hangover_start_time: u128,
    pub last_rms: f32,
}

impl Default for VadDetector {
    fn default() -> Self {
        Self::new()
    }
}

impl VadDetector {
    pub fn new() -> Self {
        Self {
            state: VadState::Idle,
            tracker: AdaptiveNoiseTracker::new(),
            hangover_duration_ms: VAD_HANGOVER_MS,
            hangover_start_time: 0,
            last_rms: 0.0,
        }
    }

    pub fn update(&mut self, chunk: &[i16]) -> VadState {
        let rms = self.calculate_rms(chunk);
        self.last_rms = rms;
        let start_threshold = self.tracker.update(rms);
        let end_threshold = start_threshold * 0.6;
        let now = self.current_time_ms();

        match self.state {
            VadState::Idle => {
                if rms > start_threshold {
                    self.state = VadState::Speech;
                }
            }
            VadState::Speech => {
                if rms < end_threshold {
                    self.state = VadState::Hangover;
                    self.hangover_start_time = now;
                }
            }
            VadState::Hangover => {
                if rms > start_threshold {
                    self.state = VadState::Speech;
                } else if now.saturating_sub(self.hangover_start_time) > self.hangover_duration_ms {
                    self.state = VadState::Idle;
                }
            }
        }

        self.state
    }

    pub fn is_speech(&self) -> bool {
        matches!(self.state, VadState::Speech | VadState::Hangover)
    }

    pub fn reset(&mut self) {
        self.state = VadState::Idle;
        self.tracker.reset();
        self.last_rms = 0.0;
    }

    pub fn calculate_rms(&self, data: &[i16]) -> f32 {
        if data.is_empty() {
            return 0.0;
        }

        let mut sum: f32 = 0.0;
        let mut count = 0;
        for &sample in data.iter().step_by(8) {
            let s = sample as f32;
            sum += s * s;
            count += 1;
        }

        if count == 0 {
            0.0
        } else {
            (sum / count as f32).sqrt()
        }
    }

    fn current_time_ms(&self) -> u128 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0)
    }
}
