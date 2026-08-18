from __future__ import annotations

import re
from pydantic import BaseModel, Field
from app.graph.state import CodeSnippet


class VerificationResult(BaseModel):
    is_valid: bool
    errors: list[str] = Field(default_factory=list)


class CodingContractVerifier:
    def detect_language(self, code: str) -> str:
        if re.search(r"\b(interface|const|let|function|import|export)\b", code):
            return "typescript"
        if re.search(r"\b(def|import|class|self|print)\b", code):
            return "python"
        if re.search(r"\b(fn|pub|struct|impl|Result|match)\b", code):
            return "rust"
        if re.search(r"\b(SELECT|FROM|WHERE|INSERT|UPDATE|JOIN)\b", code, re.IGNORECASE):
            return "sql"
        return "typescript"

    def verify(self, snippet: CodeSnippet | None) -> VerificationResult:
        if snippet is None:
            return VerificationResult(is_valid=False, errors=["Missing code snippet"])

        errors: list[str] = []
        if not snippet.code.strip():
            errors.append("Code content is empty")

        if not snippet.technique or len(snippet.technique.strip()) < 3:
            errors.append("Missing or incomplete technique name")

        if not snippet.complexity or len(snippet.complexity.strip()) < 2:
            errors.append("Missing time/space complexity analysis")

        return VerificationResult(is_valid=len(errors) == 0, errors=errors)


def verify_code_snippet_contract(snippet: CodeSnippet | None) -> VerificationResult:
    verifier = CodingContractVerifier()
    return verifier.verify(snippet)
