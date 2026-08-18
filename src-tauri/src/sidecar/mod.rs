mod client;
mod protocol;
mod supervisor;

pub use client::SidecarClient;
pub use supervisor::{SidecarHealthStatus, SidecarSupervisor};
