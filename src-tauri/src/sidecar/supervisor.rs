use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SidecarHealthStatus {
    pub is_alive: bool,
    pub pid: Option<u32>,
    pub uptime_seconds: u64,
    pub engine_type: String,
    pub orchestrator: String,
}

pub struct SidecarSupervisor {
    start_time: std::time::Instant,
}

impl Default for SidecarSupervisor {
    fn default() -> Self {
        Self::new()
    }
}

impl SidecarSupervisor {
    pub fn new() -> Self {
        Self {
            start_time: std::time::Instant::now(),
        }
    }

    pub fn get_health_status(&self, is_alive: bool) -> SidecarHealthStatus {
        SidecarHealthStatus {
            is_alive,
            pid: None,
            uptime_seconds: self.start_time.elapsed().as_secs(),
            engine_type: "reality_neural_engine".to_string(),
            orchestrator: "Reality Intelligent Copilot Engine".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_supervisor_health_status() {
        let supervisor = SidecarSupervisor::new();
        let status = supervisor.get_health_status(true);
        assert!(status.is_alive);
        assert_eq!(status.engine_type, "reality_neural_engine");
        assert_eq!(status.orchestrator, "Reality Intelligent Copilot Engine");
    }

    #[test]
    fn test_supervisor_dead_status() {
        let supervisor = SidecarSupervisor::default();
        let status = supervisor.get_health_status(false);
        assert!(!status.is_alive);
    }
}
