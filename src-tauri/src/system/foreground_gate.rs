use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

const FOREGROUND_TIMEOUT_MS: u128 = 60_000;

pub struct ForegroundGate {
    active: Mutex<HashMap<String, u128>>,
}

impl Default for ForegroundGate {
    fn default() -> Self {
        Self::new()
    }
}

impl ForegroundGate {
    pub fn new() -> Self {
        Self {
            active: Mutex::new(HashMap::new()),
        }
    }

    pub fn begin(&self, kind: &str) -> String {
        let now = self.current_time_ms();
        let token = format!("{}_{}_{}", kind, now, now % 10000);
        if let Ok(mut lock) = self.active.lock() {
            lock.insert(token.clone(), now);
        }
        token
    }

    pub fn end(&self, token: &str) {
        if let Ok(mut lock) = self.active.lock() {
            lock.remove(token);
        }
    }

    pub fn is_busy(&self) -> bool {
        let now = self.current_time_ms();
        if let Ok(mut lock) = self.active.lock() {
            lock.retain(|_, &mut started_at| now.saturating_sub(started_at) < FOREGROUND_TIMEOUT_MS);
            !lock.is_empty()
        } else {
            false
        }
    }

    fn current_time_ms(&self) -> u128 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct GateLifecycleTestCase {
        name: &'static str,
        requests: &'static [&'static str],
        expected_busy_during: bool,
        expected_busy_after: bool,
    }

    #[test]
    fn test_foreground_gate_lifecycle_table() {
        let cases = [
            GateLifecycleTestCase {
                name: "single_live_ai_prompt",
                requests: &["ai_assist"],
                expected_busy_during: true,
                expected_busy_after: false,
            },
            GateLifecycleTestCase {
                name: "multiple_concurrent_requests",
                requests: &["live_stt", "slide_ocr"],
                expected_busy_during: true,
                expected_busy_after: false,
            },
        ];

        for case in cases {
            let gate = ForegroundGate::new();
            assert!(!gate.is_busy(), "initial state for '{}'", case.name);

            let tokens: Vec<String> = case.requests.iter().map(|&k| gate.begin(k)).collect();
            assert_eq!(gate.is_busy(), case.expected_busy_during, "busy during '{}'", case.name);

            for token in tokens {
                gate.end(&token);
            }
            assert_eq!(gate.is_busy(), case.expected_busy_after, "busy after '{}'", case.name);
        }
    }
}
