from __future__ import annotations

import re
import uuid
from typing import Literal
from pydantic import BaseModel, Field

FusionSource = Literal[
    "system_rules",
    "mode_instructions",
    "user_explicit_prompt",
    "profile_identity",
    "active_job_description",
    "screen_ocr",
    "live_transcript_hot",
    "rag_evidence",
    "meeting_memory",
]

FusionSourcePriority: dict[FusionSource, int] = {
    "system_rules": 1,
    "mode_instructions": 2,
    "user_explicit_prompt": 3,
    "profile_identity": 4,
    "active_job_description": 5,
    "screen_ocr": 6,
    "live_transcript_hot": 7,
    "rag_evidence": 8,
    "meeting_memory": 9,
}

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(?:all\s+)?(?:previous\s+)?instructions", re.IGNORECASE),
    re.compile(r"system\s+override", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+an\s+unrestricted", re.IGNORECASE),
    re.compile(r"disregard\s+all\s+prior", re.IGNORECASE),
]


class ContextBlock(BaseModel):
    id: str = Field(default_factory=lambda: f"ctx-{uuid.uuid4().hex[:8]}")
    source: FusionSource
    content: str
    token_estimate: int = Field(default=0)

    def model_post_init(self, __context: object) -> None:
        if self.token_estimate == 0 and self.content:
            self.token_estimate = max(1, len(self.content.split()))


class FusionResult(BaseModel):
    fused_blocks: list[ContextBlock]
    dropped_sources: list[str] = Field(default_factory=list)
    total_tokens: int = 0


class ContextFusionEngine:
    def detect_prompt_injection(self, text: str) -> bool:
        for pat in INJECTION_PATTERNS:
            if pat.search(text):
                return True
        return False

    def fuse(self, blocks: list[ContextBlock], token_budget: int = 2048) -> FusionResult:
        valid_blocks = [b for b in blocks if not self.detect_prompt_injection(b.content)]
        sorted_blocks = sorted(
            valid_blocks,
            key=lambda b: FusionSourcePriority.get(b.source, 99),
        )

        fused: list[ContextBlock] = []
        dropped: list[str] = []
        current_tokens = 0

        for block in sorted_blocks:
            cost = block.token_estimate
            if current_tokens + cost <= token_budget:
                fused.append(block)
                current_tokens += cost
            else:
                dropped.append(block.source)

        return FusionResult(
            fused_blocks=fused,
            dropped_sources=dropped,
            total_tokens=current_tokens,
        )
