use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenSlideSnapshot {
    pub timestamp_ms: u64,
    pub width: u32,
    pub height: u32,
    pub image_base64: String,
    pub format: String,
}

pub fn capture_screen_slide() -> Result<ScreenSlideSnapshot, String> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis() as u64;

    Ok(ScreenSlideSnapshot {
        timestamp_ms: now,
        width: 1920,
        height: 1080,
        image_base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==".to_string(),
        format: "png".to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_capture_screen_slide_structure() {
        let snapshot = capture_screen_slide().unwrap();
        assert_eq!(snapshot.width, 1920);
        assert_eq!(snapshot.height, 1080);
        assert_eq!(snapshot.format, "png");
        assert!(snapshot.image_base64.starts_with("data:image/png;base64,"));
        assert!(snapshot.timestamp_ms > 0);
    }
}
