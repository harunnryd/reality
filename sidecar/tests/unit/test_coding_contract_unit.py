from __future__ import annotations

import pytest
from app.graph.coding_contract import CodingContractVerifier, verify_code_snippet_contract
from app.graph.state import CodeSnippet


@pytest.mark.parametrize(
    ("lang", "raw_code", "technique", "complexity", "is_valid"),
    [
        (
            "typescript",
            "const buffer = new AudioStreamBuffer({ sampleRate: 16000 });",
            "Chunked Ring-Buffer Pipeline",
            "O(1) time · O(1) space",
            True,
        ),
        (
            "python",
            "def search(query: str) -> list[float]: return index.query(query)",
            "HNSW Vector Index",
            "O(log N) search",
            True,
        ),
        (
            "typescript",
            "const x = 1;",
            None,
            None,
            False,
        ),
        (
            "typescript",
            "",
            "Empty Technique",
            "O(1)",
            False,
        ),
    ],
)
def test_coding_contract_verification_table(
    lang: str,
    raw_code: str,
    technique: str | None,
    complexity: str | None,
    is_valid: bool,
) -> None:
    verifier = CodingContractVerifier()
    snippet = CodeSnippet(lang=lang, code=raw_code, technique=technique, complexity=complexity)
    result = verifier.verify(snippet)
    assert result.is_valid == is_valid
    if not is_valid:
        assert len(result.errors) > 0


@pytest.mark.parametrize(
    ("code_text", "detected_lang"),
    [
        ("interface UserConfig { id: string; name: string; }", "typescript"),
        ("def calculate_rms(samples: list[float]) -> float:", "python"),
        ("pub fn init_audio_stream() -> Result<(), AudioError> {", "rust"),
        ("SELECT id, title FROM meetings WHERE duration > 30;", "sql"),
    ],
)
def test_programming_language_detector_table(code_text: str, detected_lang: str) -> None:
    verifier = CodingContractVerifier()
    lang = verifier.detect_language(code_text)
    assert lang == detected_lang
