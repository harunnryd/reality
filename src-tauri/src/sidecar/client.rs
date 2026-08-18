use std::collections::HashMap;
use std::sync::Arc;

use serde_json::Value;
use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
use tokio::sync::{oneshot, Mutex};

use super::protocol::{RpcRequest, RpcResponse, SidecarMessage};

#[derive(Debug, thiserror::Error)]
pub enum SidecarError {
    #[error("sidecar process error: {0}")]
    Spawn(String),
    #[error("sidecar call failed: {0}")]
    Call(String),
    #[error("sidecar returned an error: {0}")]
    Remote(String),
}

type Pending = Arc<Mutex<HashMap<String, oneshot::Sender<RpcResponse>>>>;

pub struct SidecarClient {
    child: Mutex<CommandChild>,
    pending: Pending,
}

impl SidecarClient {
    pub fn spawn(app: &AppHandle) -> Result<Arc<Self>, SidecarError> {
        let (mut rx, child) = app
            .shell()
            .command("../sidecar/.venv/bin/python")
            .args(["../sidecar/app/main.py"])
            .spawn()
            .map_err(|e| SidecarError::Spawn(e.to_string()))?;

        let pending: Pending = Arc::new(Mutex::new(HashMap::new()));
        let client = Arc::new(Self {
            child: Mutex::new(child),
            pending: pending.clone(),
        });

        let app_handle = app.clone();
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                match event {
                    CommandEvent::Stdout(bytes) => {
                        for line in String::from_utf8_lossy(&bytes).lines() {
                            handle_line(line, &pending, &app_handle).await;
                        }
                    }
                    CommandEvent::Stderr(bytes) => {
                        eprintln!("[sidecar] {}", String::from_utf8_lossy(&bytes));
                    }
                    CommandEvent::Terminated(status) => {
                        eprintln!("[sidecar] terminated: {:?}", status);
                        break;
                    }
                    _ => {}
                }
            }
        });

        Ok(client)
    }

    pub async fn call(&self, method: &str, params: Value) -> Result<Value, SidecarError> {
        let (request, id) = RpcRequest::new(method, params);
        let (tx, rx) = oneshot::channel();
        self.pending.lock().await.insert(id.clone(), tx);

        let mut line = serde_json::to_string(&request).map_err(|e| SidecarError::Call(e.to_string()))?;
        line.push('\n');

        self.child
            .lock()
            .await
            .write(line.as_bytes())
            .map_err(|e| SidecarError::Call(e.to_string()))?;

        let response = rx.await.map_err(|_| SidecarError::Call("sidecar closed before responding".into()))?;

        match response.error {
            Some(err) => Err(SidecarError::Remote(format!("[{}] {}", err.code, err.message))),
            None => Ok(response.result.unwrap_or(Value::Null)),
        }
    }
}

async fn handle_line(line: &str, pending: &Pending, app: &AppHandle) {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return;
    }

    let message: SidecarMessage = match serde_json::from_str(trimmed) {
        Ok(m) => m,
        Err(e) => {
            eprintln!("[sidecar] malformed message: {e} ({trimmed})");
            return;
        }
    };

    match message {
        SidecarMessage::Response(response) => {
            if let Some(sender) = pending.lock().await.remove(&response.id) {
                let _ = sender.send(response);
            }
        }
        SidecarMessage::Notification(notification) => {
            let _ = app.emit(&notification.method, notification.params);
        }
    }
}
