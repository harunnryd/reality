use std::fs::File;
use std::io::Read;
use std::path::Path;
use serde::{Deserialize, Serialize};

pub const SAFE_DOCUMENT_MAX_BYTES: u64 = 50 * 1024 * 1024;

const SAFE_EXTENSIONS: &[&str] = &[
    "txt", "md", "markdown", "json", "csv", "tsv", "xml", "html", "htm", "log", "pdf", "docx",
];

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentExtractionResult {
    pub file_name: String,
    pub extension: String,
    pub size_bytes: u64,
    pub text_content: String,
    pub is_truncated: bool,
}

pub fn is_safe_extension(ext: &str) -> bool {
    let clean = ext.trim_start_matches('.').to_lowercase();
    SAFE_EXTENSIONS.contains(&clean.as_str())
}

pub fn extract_document_text(path_str: &str) -> Result<DocumentExtractionResult, String> {
    let path = Path::new(path_str);
    if !path.exists() {
        return Err("file does not exist".to_string());
    }

    let ext = path
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();

    if !is_safe_extension(&ext) {
        return Err(format!("unsupported or unsafe file extension: .{}", ext));
    }

    let metadata = path.metadata().map_err(|e| e.to_string())?;
    let size_bytes = metadata.len();

    if size_bytes > SAFE_DOCUMENT_MAX_BYTES {
        return Err(format!(
            "file size {} exceeds maximum 50MB safety limit",
            size_bytes
        ));
    }

    let file_name = path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("document")
        .to_string();

    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;

    let text_content = String::from_utf8_lossy(&buffer).to_string();

    Ok(DocumentExtractionResult {
        file_name,
        extension: ext,
        size_bytes,
        text_content,
        is_truncated: false,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    struct ExtensionTestCase<'a> {
        name: &'a str,
        ext: &'a str,
        expected_safe: bool,
    }

    #[test]
    fn test_is_safe_extension_table() {
        let cases = [
            ExtensionTestCase {
                name: "markdown",
                ext: ".md",
                expected_safe: true,
            },
            ExtensionTestCase {
                name: "json",
                ext: "json",
                expected_safe: true,
            },
            ExtensionTestCase {
                name: "pdf",
                ext: ".pdf",
                expected_safe: true,
            },
            ExtensionTestCase {
                name: "executable_binary",
                ext: ".exe",
                expected_safe: false,
            },
            ExtensionTestCase {
                name: "dylib_binary",
                ext: ".dylib",
                expected_safe: false,
            },
        ];

        for case in cases {
            let actual = is_safe_extension(case.ext);
            assert_eq!(actual, case.expected_safe, "case '{}'", case.name);
        }
    }

    #[test]
    fn test_nonexistent_file_returns_error() {
        let result = extract_document_text("/nonexistent/path/file.md");
        assert!(result.is_err());
    }
}
