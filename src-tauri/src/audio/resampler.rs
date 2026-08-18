pub struct LinearResampler {
    pub in_rate: f64,
    pub out_rate: f64,
    pub channels: usize,
    fraction: f64,
    last_sample: f32,
}

impl LinearResampler {
    pub fn new(in_rate: u32, channels: u16) -> Self {
        Self {
            in_rate: in_rate as f64,
            out_rate: 16_000.0,
            channels: (channels as usize).max(1),
            fraction: 0.0,
            last_sample: 0.0,
        }
    }

    pub fn resample_to_i16(&mut self, input: &[f32]) -> Vec<i16> {
        if input.is_empty() {
            return Vec::new();
        }

        let mono_samples: Vec<f32> = if self.channels == 1 {
            input.to_vec()
        } else {
            input
                .chunks(self.channels)
                .map(|frame| frame.iter().sum::<f32>() / self.channels as f32)
                .collect()
        };

        if (self.in_rate - self.out_rate).abs() < 1.0 {
            return mono_samples
                .into_iter()
                .map(|s| (s.clamp(-1.0, 1.0) * 32767.0) as i16)
                .collect();
        }

        let step = self.in_rate / self.out_rate;
        let mut output = Vec::with_capacity((mono_samples.len() as f64 / step) as usize + 2);

        let mut idx = 0;
        while idx < mono_samples.len() {
            let current = mono_samples[idx];
            while self.fraction < 1.0 {
                let interpolated = self.last_sample + (current - self.last_sample) * (self.fraction as f32);
                let scaled = (interpolated.clamp(-1.0, 1.0) * 32767.0) as i16;
                output.push(scaled);
                self.fraction += step;
            }
            self.fraction -= 1.0;
            self.last_sample = current;
            idx += 1;
        }

        output
    }

    pub fn reset(&mut self) {
        self.fraction = 0.0;
        self.last_sample = 0.0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct ResampleTestCase {
        name: &'static str,
        in_rate: u32,
        channels: u16,
        input_len: usize,
        expected_approx_out_len: usize,
    }

    #[test]
    fn test_resampler_ratio_table() {
        let cases = [
            ResampleTestCase {
                name: "48khz_mono_1sec",
                in_rate: 48_000,
                channels: 1,
                input_len: 48_000,
                expected_approx_out_len: 16_000,
            },
            ResampleTestCase {
                name: "44100hz_stereo_1sec",
                in_rate: 44_100,
                channels: 2,
                input_len: 88_200,
                expected_approx_out_len: 16_000,
            },
            ResampleTestCase {
                name: "16khz_passthrough_mono",
                in_rate: 16_000,
                channels: 1,
                input_len: 16_000,
                expected_approx_out_len: 16_000,
            },
            ResampleTestCase {
                name: "96khz_mono_half_sec",
                in_rate: 96_000,
                channels: 1,
                input_len: 48_000,
                expected_approx_out_len: 8_000,
            },
        ];

        for case in cases {
            let mut resampler = LinearResampler::new(case.in_rate, case.channels);
            let input = vec![0.5f32; case.input_len];
            let out = resampler.resample_to_i16(&input);
            let diff = (out.len() as isize - case.expected_approx_out_len as isize).abs();
            assert!(
                diff <= 5,
                "case '{}' failed: expected approx {}, got {}",
                case.name,
                case.expected_approx_out_len,
                out.len()
            );
            assert_eq!(resampler.in_rate, case.in_rate as f64);
            assert_eq!(resampler.out_rate, 16000.0);
            assert_eq!(resampler.channels, case.channels as usize);
        }
    }

    #[test]
    fn test_resampler_empty_input() {
        let mut resampler = LinearResampler::new(48_000, 1);
        let out = resampler.resample_to_i16(&[]);
        assert!(out.is_empty());
    }

    #[test]
    fn test_resampler_reset() {
        let mut resampler = LinearResampler::new(48_000, 1);
        resampler.resample_to_i16(&vec![0.8; 480]);
        resampler.reset();
        assert_eq!(resampler.fraction, 0.0);
        assert_eq!(resampler.last_sample, 0.0);
    }
}
