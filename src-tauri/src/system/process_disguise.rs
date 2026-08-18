#[cfg(target_os = "macos")]
use std::os::raw::{c_char, c_int, c_void};
#[cfg(target_os = "macos")]
use std::ptr;

#[cfg(target_os = "macos")]
type LSASNRef = *const c_void;
#[cfg(target_os = "macos")]
type LSGetCurrentApplicationASNFn = unsafe extern "C" fn() -> LSASNRef;
#[cfg(target_os = "macos")]
type LSSetApplicationInformationItemFn = unsafe extern "C" fn(
    c_int,
    LSASNRef,
    *const c_void,
    *const c_void,
    *mut *const c_void,
) -> c_int;

#[cfg(target_os = "macos")]
const K_LS_CURRENT_SESSION_ID: c_int = -1;

#[cfg(target_os = "macos")]
extern "C" {
    fn dlsym(handle: *mut c_void, symbol: *const c_char) -> *mut c_void;
}

#[cfg(target_os = "macos")]
unsafe fn global_sym(name: &[u8]) -> *mut c_void {
    let rtld_default: *mut c_void = -2isize as *mut c_void;
    dlsym(rtld_default, name.as_ptr() as *const c_char)
}

pub fn set_process_display_name(name: &str) -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        use objc2_foundation::NSString;

        unsafe {
            let get_asn_ptr = global_sym(b"_LSGetCurrentApplicationASN\0");
            let set_item_ptr = global_sym(b"_LSSetApplicationInformationItem\0");
            let display_key_ptr = global_sym(b"_kLSDisplayNameKey\0") as *const *const c_void;

            if get_asn_ptr.is_null() || set_item_ptr.is_null() || display_key_ptr.is_null() {
                return Ok(false);
            }

            let get_asn: LSGetCurrentApplicationASNFn = std::mem::transmute(get_asn_ptr);
            let set_item: LSSetApplicationInformationItemFn = std::mem::transmute(set_item_ptr);
            let display_name_key = *display_key_ptr;
            if display_name_key.is_null() {
                return Ok(false);
            }

            let asn = get_asn();
            if asn.is_null() {
                return Ok(false);
            }

            let ns_str = NSString::from_str(name);
            let value_ptr = &*ns_str as *const NSString as *const c_void;

            let status = set_item(
                K_LS_CURRENT_SESSION_ID,
                asn,
                display_name_key,
                value_ptr,
                ptr::null_mut(),
            );

            Ok(status == 0)
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = name;
        Ok(false)
    }
}

pub fn get_available_disguises() -> Vec<&'static str> {
    vec![
        "Reality",
        "System Settings",
        "Terminal",
        "Finder",
        "Activity Monitor",
        "Notes",
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    struct DisguiseTestCase<'a> {
        name: &'a str,
        input: &'a str,
        expected_valid: bool,
    }

    #[test]
    fn test_disguise_presets_table() {
        let cases = [
            DisguiseTestCase {
                name: "default_reality",
                input: "Reality",
                expected_valid: true,
            },
            DisguiseTestCase {
                name: "system_settings",
                input: "System Settings",
                expected_valid: true,
            },
            DisguiseTestCase {
                name: "terminal",
                input: "Terminal",
                expected_valid: true,
            },
            DisguiseTestCase {
                name: "finder",
                input: "Finder",
                expected_valid: true,
            },
        ];

        let available = get_available_disguises();
        for case in cases {
            let found = available.contains(&case.input);
            assert_eq!(found, case.expected_valid, "case '{}'", case.name);
        }
    }

    #[test]
    fn test_set_process_display_name_callable() {
        let result = set_process_display_name("Reality");
        assert!(result.is_ok());
    }
}
