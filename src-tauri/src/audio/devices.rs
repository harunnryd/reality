use cpal::traits::{DeviceTrait, HostTrait};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioInputDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

pub fn normalize_device_name(s: &str) -> String {
    s.trim()
        .trim_start_matches(|c: char| c == '(' || c.is_ascii_digit() || c == '-' || c == ' ')
        .trim_end_matches([')', ' '])
        .chars()
        .map(|c| match c {
            '\u{2013}' | '\u{2014}' | '\u{2212}' => '-',
            other => other,
        })
        .collect::<String>()
        .to_lowercase()
}

#[allow(dead_code)]
pub fn resolve_device_name_tier(requested: &str, candidate: &str) -> Option<u8> {
    if candidate == requested {
        Some(0)
    } else if candidate.eq_ignore_ascii_case(requested) {
        Some(1)
    } else if normalize_device_name(candidate) == normalize_device_name(requested) {
        Some(2)
    } else {
        None
    }
}

#[allow(dead_code)]
pub fn resolve_best_device<'a>(requested: &str, candidates: &'a [String]) -> Option<&'a String> {
    let mut best: Option<(u8, &'a String)> = None;
    for candidate in candidates {
        if let Some(tier) = resolve_device_name_tier(requested, candidate) {
            if best.as_ref().map(|(b, _)| tier < *b).unwrap_or(true) {
                best = Some((tier, candidate));
                if tier == 0 {
                    break;
                }
            }
        }
    }
    best.map(|(_, name)| name)
}

pub fn list_input_devices() -> Result<Vec<AudioInputDevice>, String> {
    let host = cpal::default_host();
    let default_device_name = host.default_input_device().and_then(|d| d.name().ok());

    let mut devices = Vec::new();
    devices.push(AudioInputDevice {
        id: "default".to_string(),
        name: "Default System Microphone".to_string(),
        is_default: true,
    });

    if let Ok(available) = host.input_devices() {
        for device in available {
            if let Ok(name) = device.name() {
                let is_default = default_device_name.as_ref() == Some(&name);
                let normalized = normalize_device_name(&name);
                if !devices.iter().any(|d| d.name == name) {
                    devices.push(AudioInputDevice {
                        id: normalized,
                        name,
                        is_default,
                    });
                }
            }
        }
    }

    Ok(devices)
}

#[cfg(test)]
mod tests {
    use super::*;

    struct NormalizeTestCase<'a> {
        name: &'a str,
        input: &'a str,
        expected: &'a str,
    }

    #[test]
    fn test_normalize_device_name_table() {
        let cases = [
            NormalizeTestCase {
                name: "clean_name",
                input: "MacBook Pro Microphone",
                expected: "macbook pro microphone",
            },
            NormalizeTestCase {
                name: "wasapi_prefix",
                input: "(2- USB Audio Device)",
                expected: "usb audio device",
            },
            NormalizeTestCase {
                name: "en_dash_unicode",
                input: "AirPods Pro \u{2013} Hands-Free",
                expected: "airpods pro - hands-free",
            },
            NormalizeTestCase {
                name: "em_dash_unicode",
                input: "Mic \u{2014} Internal",
                expected: "mic - internal",
            },
            NormalizeTestCase {
                name: "padded_spaces",
                input: "   Yeti Stereo   ",
                expected: "yeti stereo",
            },
            NormalizeTestCase {
                name: "multiple_digits_wasapi",
                input: "(12- High Definition Audio)",
                expected: "high definition audio",
            },
        ];

        for case in cases {
            let actual = normalize_device_name(case.input);
            assert_eq!(
                actual, case.expected,
                "case '{}' failed: expected '{}', got '{}'",
                case.name, case.expected, actual
            );
        }
    }

    struct TierTestCase<'a> {
        name: &'a str,
        requested: &'a str,
        candidate: &'a str,
        expected_tier: Option<u8>,
    }

    #[test]
    fn test_resolve_device_name_tier_table() {
        let cases = [
            TierTestCase {
                name: "exact_match",
                requested: "MacBook Pro Microphone",
                candidate: "MacBook Pro Microphone",
                expected_tier: Some(0),
            },
            TierTestCase {
                name: "case_insensitive",
                requested: "macbook pro microphone",
                candidate: "MacBook Pro Microphone",
                expected_tier: Some(1),
            },
            TierTestCase {
                name: "fuzzy_wasapi_normalized",
                requested: "USB Audio Device",
                candidate: "(2- USB Audio Device)",
                expected_tier: Some(2),
            },
            TierTestCase {
                name: "no_match",
                requested: "AirPods Pro",
                candidate: "MacBook Pro Microphone",
                expected_tier: None,
            },
        ];

        for case in cases {
            let tier = resolve_device_name_tier(case.requested, case.candidate);
            assert_eq!(tier, case.expected_tier, "case '{}'", case.name);
        }
    }

    #[test]
    fn test_resolve_best_device_table() {
        let candidates = vec![
            "MacBook Pro Microphone".to_string(),
            "(2- USB Audio Device)".to_string(),
            "AirPods Pro".to_string(),
        ];

        let best = resolve_best_device("USB Audio Device", &candidates);
        assert_eq!(best, Some(&"(2- USB Audio Device)".to_string()));

        let unmatched = resolve_best_device("Unknown Mic", &candidates);
        assert_eq!(unmatched, None);
    }

    #[test]
    fn test_list_input_devices_contains_default() {
        let devices = list_input_devices().unwrap();
        assert!(!devices.is_empty());
        assert_eq!(devices[0].id, "default");
        assert!(devices[0].is_default);
    }
}
