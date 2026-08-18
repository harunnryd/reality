#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InputSourceKind {
    Standard,
    CompositionIme,
}

pub fn is_composition_ime_active() -> bool {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let output = Command::new("defaults")
            .args(["read", "com.apple.HIToolbox"])
            .output();

        if let Ok(out) = output {
            let text = String::from_utf8_lossy(&out.stdout);
            return classify_input_source_text(&text) == InputSourceKind::CompositionIme;
        }
        false
    }
    #[cfg(not(target_os = "macos"))]
    {
        false
    }
}

pub fn classify_input_source_text(raw_plist_snippet: &str) -> InputSourceKind {
    if raw_plist_snippet.contains("Keyboard Input Method")
        || raw_plist_snippet.contains("com.apple.inputmethod.")
    {
        InputSourceKind::CompositionIme
    } else {
        InputSourceKind::Standard
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct ImeTestCase<'a> {
        name: &'a str,
        snippet: &'a str,
        expected: InputSourceKind,
    }

    #[test]
    fn test_classify_input_source_table() {
        let cases = [
            ImeTestCase {
                name: "standard_us_layout",
                snippet: "InputSourceKind = \"Keyboard Layout\"; \"KeyboardLayout Name\" = \"U.S.\";",
                expected: InputSourceKind::Standard,
            },
            ImeTestCase {
                name: "simplified_pinyin",
                snippet: "InputSourceKind = \"Keyboard Input Method\"; BundleID = \"com.apple.inputmethod.SCIM\";",
                expected: InputSourceKind::CompositionIme,
            },
            ImeTestCase {
                name: "japanese_kotoeri",
                snippet: "InputSourceKind = \"Keyboard Input Method\"; BundleID = \"com.apple.inputmethod.Kotoeri\";",
                expected: InputSourceKind::CompositionIme,
            },
            ImeTestCase {
                name: "korean_hangul",
                snippet: "BundleID = \"com.apple.inputmethod.Korean\";",
                expected: InputSourceKind::CompositionIme,
            },
            ImeTestCase {
                name: "german_standard",
                snippet: "\"KeyboardLayout Name\" = \"German\"; InputSourceKind = \"Keyboard Layout\";",
                expected: InputSourceKind::Standard,
            },
        ];

        for case in cases {
            let actual = classify_input_source_text(case.snippet);
            assert_eq!(actual, case.expected, "case '{}'", case.name);
        }
    }

    #[test]
    fn test_is_composition_ime_active_callable() {
        let _ = is_composition_ime_active();
    }
}
