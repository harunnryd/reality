#[cfg(test)]
mod tests {
    use crate::audio::vad::*;

    struct RmsTestCase<'a> {
        name: &'a str,
        samples: Vec<i16>,
        expected_min: f32,
        expected_max: f32,
    }

    #[test]
    fn test_calculate_rms_table() {
        let cases = [
            RmsTestCase {
                name: "silence",
                samples: vec![0; 320],
                expected_min: 0.0,
                expected_max: 0.0,
            },
            RmsTestCase {
                name: "empty_buffer",
                samples: vec![],
                expected_min: 0.0,
                expected_max: 0.0,
            },
            RmsTestCase {
                name: "moderate_speech",
                samples: vec![500; 320],
                expected_min: 490.0,
                expected_max: 510.0,
            },
            RmsTestCase {
                name: "loud_speech",
                samples: vec![3000; 320],
                expected_min: 2990.0,
                expected_max: 3010.0,
            },
        ];

        let vad = VadDetector::new();
        for case in cases {
            let rms = vad.calculate_rms(&case.samples);
            assert!(
                rms >= case.expected_min && rms <= case.expected_max,
                "case '{}' failed: rms was {}",
                case.name,
                rms
            );
        }
    }

    struct VadTransitionTestCase<'a> {
        name: &'a str,
        samples: Vec<i16>,
        expected_state: VadState,
        expected_is_speech: bool,
    }

    #[test]
    fn test_vad_transitions_table() {
        let mut vad = VadDetector::new();

        let cases = [
            VadTransitionTestCase {
                name: "initial_silence",
                samples: vec![0; 320],
                expected_state: VadState::Idle,
                expected_is_speech: false,
            },
            VadTransitionTestCase {
                name: "onset_of_speech",
                samples: vec![2000; 320],
                expected_state: VadState::Speech,
                expected_is_speech: true,
            },
            VadTransitionTestCase {
                name: "continuation_of_speech",
                samples: vec![2500; 320],
                expected_state: VadState::Speech,
                expected_is_speech: true,
            },
            VadTransitionTestCase {
                name: "drop_to_hangover",
                samples: vec![50; 320],
                expected_state: VadState::Hangover,
                expected_is_speech: true,
            },
        ];

        for case in cases {
            let state = vad.update(&case.samples);
            assert_eq!(
                state, case.expected_state,
                "case '{}' state mismatch",
                case.name
            );
            assert_eq!(
                vad.is_speech(),
                case.expected_is_speech,
                "case '{}' is_speech mismatch",
                case.name
            );
        }
    }

    #[test]
    fn test_vad_reset() {
        let mut vad = VadDetector::new();
        vad.update(&vec![3000; 320]);
        assert!(vad.is_speech());

        vad.reset();
        assert_eq!(vad.state, VadState::Idle);
        assert_eq!(vad.last_rms, 0.0);
    }
}
