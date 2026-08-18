use std::sync::mpsc;

use block2::RcBlock;
use objc2_av_foundation::{AVAuthorizationStatus, AVCaptureDevice, AVMediaTypeAudio};

use super::PermissionStatus;

pub fn status() -> PermissionStatus {
    let media_type = unsafe { AVMediaTypeAudio }.expect("AVMediaTypeAudio unavailable");
    let status = unsafe { AVCaptureDevice::authorizationStatusForMediaType(media_type) };
    from_av_status(status)
}

pub fn request() -> PermissionStatus {
    let media_type = unsafe { AVMediaTypeAudio }.expect("AVMediaTypeAudio unavailable");
    let (tx, rx) = mpsc::channel::<bool>();

    let handler = RcBlock::new(move |granted: objc2::runtime::Bool| {
        let _ = tx.send(granted.as_bool());
    });

    unsafe {
        AVCaptureDevice::requestAccessForMediaType_completionHandler(media_type, &handler);
    }

    match rx.recv() {
        Ok(true) => PermissionStatus::Granted,
        Ok(false) => PermissionStatus::Denied,
        Err(_) => status(),
    }
}

fn from_av_status(status: AVAuthorizationStatus) -> PermissionStatus {
    match status {
        AVAuthorizationStatus::Authorized => PermissionStatus::Granted,
        AVAuthorizationStatus::Denied | AVAuthorizationStatus::Restricted => PermissionStatus::Denied,
        _ => PermissionStatus::NotDetermined,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_microphone_status_callable() {
        let current = status();
        assert!(matches!(
            current,
            PermissionStatus::Granted | PermissionStatus::Denied | PermissionStatus::NotDetermined
        ));
    }
}
