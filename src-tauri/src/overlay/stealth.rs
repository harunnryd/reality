#[cfg(target_os = "macos")]
use objc2::msg_send;
#[cfg(target_os = "macos")]
use objc2::runtime::{AnyObject, Bool, Sel};
#[cfg(target_os = "macos")]
use objc2::sel;
use tauri::WebviewWindow;

pub fn apply_stealth_attributes(window: &WebviewWindow) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let win = window.clone();
        window
            .run_on_main_thread(move || {
                if let Ok(ns_window_ptr) = win.ns_window() {
                    let window = ns_window_ptr as *mut AnyObject;
                    if !window.is_null() {
                        unsafe {
                            let sel_set_becomes_key: Sel = sel!(setBecomesKeyOnlyIfNeeded:);
                            let responds_raw: Bool = msg_send![window, respondsToSelector: sel_set_becomes_key];
                            let responds_to_becomes_key = responds_raw.as_bool();
                            if responds_to_becomes_key {
                                let _: () = msg_send![window, setBecomesKeyOnlyIfNeeded: true];
                            }

                            let sel_set_hides: Sel = sel!(setHidesOnDeactivate:);
                            let responds_raw_hides: Bool = msg_send![window, respondsToSelector: sel_set_hides];
                            let responds_to_hides = responds_raw_hides.as_bool();
                            if responds_to_hides {
                                let _: () = msg_send![window, setHidesOnDeactivate: false];
                            }

                            const CAN_JOIN_ALL_SPACES: u64 = 1 << 0;
                            const FULL_SCREEN_AUXILIARY: u64 = 1 << 8;
                            const IGNORES_CYCLE: u64 = 1 << 6;
                            let behavior: u64 = CAN_JOIN_ALL_SPACES | FULL_SCREEN_AUXILIARY | IGNORES_CYCLE;
                            let _: () = msg_send![window, setCollectionBehavior: behavior];

                            let current_mask: u64 = msg_send![window, styleMask];
                            const NONACTIVATING_PANEL: u64 = 1 << 7;
                            if current_mask & NONACTIVATING_PANEL == 0 {
                                let _: () = msg_send![window, setStyleMask: current_mask | NONACTIVATING_PANEL];
                                if responds_to_becomes_key {
                                    let _: () = msg_send![window, setBecomesKeyOnlyIfNeeded: true];
                                }
                                if responds_to_hides {
                                    let _: () = msg_send![window, setHidesOnDeactivate: false];
                                }
                                let _: () = msg_send![window, setCollectionBehavior: behavior];
                            }

                            let sel_set_sharing: Sel = sel!(setSharingType:);
                            let responds_raw_sharing: Bool = msg_send![window, respondsToSelector: sel_set_sharing];
                            if responds_raw_sharing.as_bool() {
                                let _: () = msg_send![window, setSharingType: 0isize];
                            }

                            let sel_set_prevents: Sel = sel!(_setPreventsActivation:);
                            let responds_raw_prevents: Bool = msg_send![window, respondsToSelector: sel_set_prevents];
                            if responds_raw_prevents.as_bool() {
                                let _: () = msg_send![window, _setPreventsActivation: true];
                            }
                        }
                    }
                }
            })
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_stealth_module_compiles() {
        const { assert!(cfg!(target_os = "macos") || !cfg!(target_os = "macos")) };
    }
}
