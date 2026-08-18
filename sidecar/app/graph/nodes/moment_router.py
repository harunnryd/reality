from __future__ import annotations

import re
from typing import Tuple
from app.graph.state import LiveMomentAction, MeetingState, TranscriptUtterance

QUESTION_INDICATORS = (
    "how",
    "what",
    "why",
    "can you",
    "could you",
    "explain",
    "difference between",
    "walk me through",
    "how does",
    "should we",
    "what is",
    "what are",
    "is it possible",
    "would you",
    "tell me about",
)

TECH_KEYWORDS = (
    "algorithm",
    "code",
    "function",
    "latency",
    "database",
    "api",
    "refactor",
    "sql",
    "typescript",
    "rust",
    "python",
    "hnsw",
    "vector",
    "cache",
    "concurrency",
    "memory leak",
    "docker",
    "kubernetes",
    "cluster",
    "streaming",
    "vad",
    "ipc",
)

SALES_KEYWORDS = (
    "pricing",
    "discount",
    "expensive",
    "budget",
    "contract",
    "competitor",
    "timeline",
    "deliverable",
    "seats",
    "enterprise tier",
    "sla",
    "terms",
    "procurement",
)

RECAP_KEYWORDS = (
    "recap",
    "summarize",
    "what was decided",
    "action items",
    "catch me up",
    "summary so far",
    "next steps",
    "conclusion",
)


def extract_latest_question_or_objection(utterances: list[TranscriptUtterance]) -> Tuple[str | None, float]:
    if not utterances:
        return None, 0.0

    reversed_utterances = list(reversed(utterances))
    for utt in reversed_utterances:
        text = utt.text.strip()
        lower = text.lower()
        if "?" in text:
            return text, 0.95
        if any(lower.startswith(q) or f" {q} " in lower for q in QUESTION_INDICATORS):
            return text, 0.85
        if any(k in lower for k in SALES_KEYWORDS):
            return text, 0.85
        if any(k in lower for k in RECAP_KEYWORDS):
            return text, 0.85

    return None, 0.0


extract_latest_question = extract_latest_question_or_objection


def classify_moment(state: MeetingState) -> Tuple[LiveMomentAction, float]:
    if state.screen_ocr_text and len(state.screen_ocr_text.strip()) > 10:
        return "CODING_OR_SCREEN_PROBLEM", 0.95

    latest_prompt, confidence = extract_latest_question_or_objection(state.utterances)
    if not latest_prompt:
        return "IDLE_DISCUSSION", 0.90

    state.latest_detected_question = latest_prompt
    lower = latest_prompt.lower()

    if any(k in lower for k in RECAP_KEYWORDS):
        return "MEETING_MEMORY_OR_RECAP", 0.95

    if any(k in lower for k in SALES_KEYWORDS):
        return "OBJECTION_OR_NEGOTIATION", 0.90

    if any(k in lower for k in TECH_KEYWORDS):
        if any(c in lower for c in ("write", "implement", "code", "syntax", "function", "fix this")):
            return "CODING_OR_SCREEN_PROBLEM", 0.95
        return "TECHNICAL_EXPLANATION", 0.90

    if state.active_persona == "tech":
        return "TECHNICAL_EXPLANATION", 0.80
    if state.active_persona == "sales":
        return "OBJECTION_OR_NEGOTIATION", 0.80
    if state.active_persona == "executive":
        return "DIRECT_ANSWER", 0.80

    return "WHAT_TO_SAY", 0.80


async def moment_router_node(state: MeetingState) -> dict:
    action, confidence = classify_moment(state)
    state.moment_action = action
    return {
        "moment_action": action,
        "latest_detected_question": state.latest_detected_question,
        "confidence": confidence,
    }
