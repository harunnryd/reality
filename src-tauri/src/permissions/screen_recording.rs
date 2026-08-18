use super::PermissionStatus;

#[link(name = "CoreGraphics", kind = "framework")]
extern "C" {
    fn CGPreflightScreenCaptureAccess() -> bool;
    fn CGRequestScreenCaptureAccess() -> bool;
}

pub fn status() -> PermissionStatus {
    if unsafe { CGPreflightScreenCaptureAccess() } {
        PermissionStatus::Granted
    } else {
        PermissionStatus::Denied
    }
}

pub fn request() -> PermissionStatus {
    if unsafe { CGRequestScreenCaptureAccess() } {
        PermissionStatus::Granted
    } else {
        PermissionStatus::Denied
    }
}

pub fn open_system_settings() {
    let url = "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture";
    let _ = std::process::Command::new("open").arg(url).spawn();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_screen_recording_status_callable() {
        let current = status();
        assert!(matches!(current, PermissionStatus::Granted | PermissionStatus::Denied));
    }
}
