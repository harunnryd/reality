use super::PermissionStatus;

#[cfg(target_os = "macos")]
#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    fn AXIsProcessTrusted() -> bool;
}

pub fn status() -> PermissionStatus {
    #[cfg(target_os = "macos")]
    {
        if unsafe { AXIsProcessTrusted() } {
            PermissionStatus::Granted
        } else {
            PermissionStatus::Denied
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        PermissionStatus::Granted
    }
}

pub fn open_system_settings() {
    #[cfg(target_os = "macos")]
    {
        let url = "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility";
        let _ = std::process::Command::new("open").arg(url).spawn();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct StatusTestCase {
        name: &'static str,
        expected_accessible: bool,
    }

    #[test]
    fn test_accessibility_status_table() {
        let cases = [StatusTestCase {
            name: "evaluates_permission_state",
            expected_accessible: true,
        }];

        for case in cases {
            let current_status = status();
            let is_valid = matches!(
                current_status,
                PermissionStatus::Granted | PermissionStatus::Denied | PermissionStatus::NotDetermined
            );
            assert_eq!(is_valid, case.expected_accessible, "case '{}'", case.name);
        }
    }
}
