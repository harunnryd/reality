#[derive(Debug, Clone)]
pub struct AdaptiveNoiseTracker {
    pub noise_floor_ema: f32,
    pub alpha: f32,
    pub multiplier: f32,
    pub min_floor: f32,
}

impl Default for AdaptiveNoiseTracker {
    fn default() -> Self {
        Self::new()
    }
}

impl AdaptiveNoiseTracker {
    pub fn new() -> Self {
        Self {
            noise_floor_ema: 50.0,
            alpha: 0.02,
            multiplier: 3.0,
            min_floor: 40.0,
        }
    }

    pub fn update(&mut self, rms: f32) -> f32 {
        if rms < self.threshold() {
            self.noise_floor_ema = (1.0 - self.alpha) * self.noise_floor_ema + self.alpha * rms;
            if self.noise_floor_ema < self.min_floor {
                self.noise_floor_ema = self.min_floor;
            }
        }
        self.threshold()
    }

    pub fn threshold(&self) -> f32 {
        (self.noise_floor_ema * self.multiplier).max(self.min_floor * self.multiplier)
    }

    pub fn reset(&mut self) {
        self.noise_floor_ema = 50.0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct AdaptiveNoiseTestCase {
        name: &'static str,
        input_rms_sequence: &'static [f32],
        expected_min_threshold: f32,
        expected_max_threshold: f32,
    }

    #[test]
    fn test_adaptive_noise_tracker_table() {
        let cases = [
            AdaptiveNoiseTestCase {
                name: "quiet_room_baseline",
                input_rms_sequence: &[20.0, 25.0, 30.0, 20.0],
                expected_min_threshold: 110.0,
                expected_max_threshold: 160.0,
            },
            AdaptiveNoiseTestCase {
                name: "moderate_ambient_noise",
                input_rms_sequence: &[80.0, 85.0, 90.0, 85.0],
                expected_min_threshold: 140.0,
                expected_max_threshold: 280.0,
            },
        ];

        for case in cases {
            let mut tracker = AdaptiveNoiseTracker::new();
            let mut last_threshold = 0.0;
            for &rms in case.input_rms_sequence {
                last_threshold = tracker.update(rms);
            }

            assert!(
                last_threshold >= case.expected_min_threshold && last_threshold <= case.expected_max_threshold,
                "case '{}': threshold {} not in range [{}, {}]",
                case.name,
                last_threshold,
                case.expected_min_threshold,
                case.expected_max_threshold
            );
        }
    }

    #[test]
    fn test_tracker_reset() {
        let mut tracker = AdaptiveNoiseTracker::new();
        tracker.update(200.0);
        tracker.reset();
        assert_eq!(tracker.noise_floor_ema, 50.0);
    }
}
