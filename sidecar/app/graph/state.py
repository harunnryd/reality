from __future__ import annotations

import time
import uuid
from typing import Any, Literal
from pydantic import BaseModel, Field

PersonaMode = Literal["general", "tech", "sales", "executive"]

LiveMomentAction = Literal[
    "DIRECT_ANSWER",
    "WHAT_TO_SAY",
    "CODING_OR_SCREEN_PROBLEM",
    "TECHNICAL_EXPLANATION",
    "OBJECTION_OR_NEGOTIATION",
    "MEETING_MEMORY_OR_RECAP",
    "IDLE_DISCUSSION",
]


class TranscriptUtterance(BaseModel):
    id: str = Field(default_factory=lambda: f"utt-{uuid.uuid4().hex[:8]}")
    speaker: str
    text: str
    timestamp: float = Field(default_factory=time.time)
    is_interim: bool = False
    channel: Literal["mic", "speaker"] = "speaker"


class CodeSnippet(BaseModel):
    lang: str = "typescript"
    code: str
    technique: str | None = None
    complexity: str | None = None


class LiveSuggestion(BaseModel):
    id: str = Field(default_factory=lambda: f"sug-{uuid.uuid4().hex[:8]}")
    title: str
    summary: str
    confidence: float = 0.95
    code_snippet: CodeSnippet | None = None
    key_takeaways: list[str] = Field(default_factory=list)


class ActionItem(BaseModel):
    id: str = Field(default_factory=lambda: f"act-{uuid.uuid4().hex[:8]}")
    text: str
    assignee: str | None = None
    completed: bool = False
    priority: Literal["high", "medium", "low"] = "medium"


class KeyDecision(BaseModel):
    id: str = Field(default_factory=lambda: f"dec-{uuid.uuid4().hex[:8]}")
    decision: str
    rationale: str | None = None
    timestamp: float = 0.0


class MeetingState(BaseModel):
    session_id: str = Field(default_factory=lambda: f"sess-{uuid.uuid4().hex[:8]}")
    title: str = "Meeting Session"
    active_persona: PersonaMode = "tech"
    is_stealth: bool = False
    utterances: list[TranscriptUtterance] = Field(default_factory=list)
    screen_ocr_text: str | None = None
    profile_context: dict[str, Any] = Field(default_factory=dict)
    latest_detected_question: str | None = None
    moment_action: LiveMomentAction = "IDLE_DISCUSSION"
    current_suggestion: LiveSuggestion | None = None
    action_items: list[ActionItem] = Field(default_factory=list)
    key_decisions: list[KeyDecision] = Field(default_factory=list)
    executive_summary: str = ""

    def add_utterance(
        self,
        speaker: str,
        text: str,
        channel: Literal["mic", "speaker"] = "speaker",
        is_interim: bool = False,
    ) -> TranscriptUtterance:
        utterance = TranscriptUtterance(
            speaker=speaker,
            text=text,
            timestamp=time.time(),
            channel=channel,
            is_interim=is_interim,
        )
        self.utterances.append(utterance)
        return utterance

    def get_hot_window(self, window_seconds: float = 180.0) -> list[TranscriptUtterance]:
        if not self.utterances:
            return []
        cutoff = time.time() - window_seconds
        hot = [u for u in self.utterances if u.timestamp >= cutoff and not u.is_interim]
        return hot if hot else self.utterances[-6:]

    def get_hot_transcript_text(self, window_seconds: float = 180.0) -> str:
        hot = self.get_hot_window(window_seconds)
        return "\n".join(f"{u.speaker}: {u.text}" for u in hot)

    def get_durable_transcript_text(self) -> str:
        finals = [u for u in self.utterances if not u.is_interim]
        return "\n".join(f"{u.speaker}: {u.text}" for u in finals)
