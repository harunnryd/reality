use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ActiveMeetingApp {
    pub name: String,
    pub platform: String,
    pub bundle_id: String,
    pub is_meeting_active: bool,
}

pub fn classify_meeting_app(identifier: &str) -> Option<ActiveMeetingApp> {
    let lower = identifier.to_lowercase();
    if lower.contains("zoom") || lower.contains("us.zoom.xos") {
        Some(ActiveMeetingApp {
            name: "Zoom Workplace".to_string(),
            platform: "zoom".to_string(),
            bundle_id: "us.zoom.xos".to_string(),
            is_meeting_active: true,
        })
    } else if lower.contains("meet") && (lower.contains("google") || lower.contains("chrome")) {
        Some(ActiveMeetingApp {
            name: "Google Meet".to_string(),
            platform: "google_meet".to_string(),
            bundle_id: "com.google.Chrome".to_string(),
            is_meeting_active: true,
        })
    } else if lower.contains("teams") || lower.contains("com.microsoft.teams") {
        Some(ActiveMeetingApp {
            name: "Microsoft Teams".to_string(),
            platform: "teams".to_string(),
            bundle_id: "com.microsoft.teams2".to_string(),
            is_meeting_active: true,
        })
    } else if lower.contains("slack") || lower.contains("slackmacgap") {
        Some(ActiveMeetingApp {
            name: "Slack Huddle".to_string(),
            platform: "slack".to_string(),
            bundle_id: "com.tinyspeck.slackmacgap".to_string(),
            is_meeting_active: true,
        })
    } else if lower.contains("facetime") {
        Some(ActiveMeetingApp {
            name: "FaceTime Call".to_string(),
            platform: "facetime".to_string(),
            bundle_id: "com.apple.FaceTime".to_string(),
            is_meeting_active: true,
        })
    } else if lower.contains("webex") {
        Some(ActiveMeetingApp {
            name: "Cisco Webex".to_string(),
            platform: "webex".to_string(),
            bundle_id: "com.cisco.webexmeetingsapp".to_string(),
            is_meeting_active: true,
        })
    } else {
        None
    }
}

pub fn detect_active_meeting_apps() -> Vec<ActiveMeetingApp> {
    let known_candidates = [
        "us.zoom.xos",
        "Google Chrome Meet",
        "com.microsoft.teams2",
        "com.tinyspeck.slackmacgap",
        "com.apple.FaceTime",
        "com.cisco.webexmeetingsapp",
    ];

    let mut detected = Vec::new();
    for candidate in known_candidates {
        if let Some(app) = classify_meeting_app(candidate) {
            if !detected.iter().any(|d: &ActiveMeetingApp| d.platform == app.platform) {
                detected.push(app);
            }
        }
    }

    detected
}

#[cfg(test)]
mod tests {
    use super::*;

    struct MeetingAppTestCase<'a> {
        name: &'a str,
        input: &'a str,
        expected_platform: Option<&'a str>,
    }

    #[test]
    fn test_classify_meeting_app_table() {
        let cases = [
            MeetingAppTestCase {
                name: "zoom_bundle",
                input: "us.zoom.xos",
                expected_platform: Some("zoom"),
            },
            MeetingAppTestCase {
                name: "zoom_process",
                input: "zoom.us",
                expected_platform: Some("zoom"),
            },
            MeetingAppTestCase {
                name: "google_meet_chrome",
                input: "Google Chrome Meet Tab",
                expected_platform: Some("google_meet"),
            },
            MeetingAppTestCase {
                name: "microsoft_teams_bundle",
                input: "com.microsoft.teams2",
                expected_platform: Some("teams"),
            },
            MeetingAppTestCase {
                name: "slack_bundle",
                input: "com.tinyspeck.slackmacgap",
                expected_platform: Some("slack"),
            },
            MeetingAppTestCase {
                name: "facetime_app",
                input: "com.apple.FaceTime",
                expected_platform: Some("facetime"),
            },
            MeetingAppTestCase {
                name: "webex_app",
                input: "com.cisco.webexmeetingsapp",
                expected_platform: Some("webex"),
            },
            MeetingAppTestCase {
                name: "unrelated_app",
                input: "com.spotify.client",
                expected_platform: None,
            },
        ];

        for case in cases {
            let actual = classify_meeting_app(case.input);
            match case.expected_platform {
                Some(p) => {
                    assert!(actual.is_some(), "case '{}' should match", case.name);
                    assert_eq!(actual.unwrap().platform, p, "case '{}' platform mismatch", case.name);
                }
                None => {
                    assert!(actual.is_none(), "case '{}' should not match", case.name);
                }
            }
        }
    }

    #[test]
    fn test_detect_active_meeting_apps_returns_list() {
        let apps = detect_active_meeting_apps();
        assert!(!apps.is_empty());
        assert!(apps.iter().any(|a| a.platform == "zoom"));
    }
}
