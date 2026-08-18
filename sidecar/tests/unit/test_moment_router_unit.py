from __future__ import annotations

import pytest
from app.graph.nodes.moment_router import classify_moment, extract_latest_question
from app.graph.state import MeetingState


@pytest.mark.parametrize(
    ("speaker", "text", "persona", "expected_action", "min_confidence"),
    [
        (
            "Interviewer",
            "How does HNSW quantization reduce p99 search latency across 10M vectors?",
            "tech",
            "TECHNICAL_EXPLANATION",
            0.80,
        ),
        (
            "Interviewer",
            "Can you write a ring buffer implementation in TypeScript?",
            "tech",
            "CODING_OR_SCREEN_PROBLEM",
            0.85,
        ),
        (
            "Interviewer",
            "What is the time complexity of B-Tree indexing in PostgreSQL?",
            "tech",
            "TECHNICAL_EXPLANATION",
            0.80,
        ),
        (
            "Client",
            "Your annual pricing is way too expensive for our engineering team size.",
            "sales",
            "OBJECTION_OR_NEGOTIATION",
            0.80,
        ),
        (
            "Client",
            "Do you offer any discount for multi-year enterprise contracts?",
            "sales",
            "OBJECTION_OR_NEGOTIATION",
            0.80,
        ),
        (
            "Lead",
            "Can someone summarize what we have decided so far?",
            "general",
            "MEETING_MEMORY_OR_RECAP",
            0.85,
        ),
        (
            "Lead",
            "What are the action items from this sprint sync?",
            "general",
            "MEETING_MEMORY_OR_RECAP",
            0.85,
        ),
        (
            "Sarah",
            "Good morning everyone, hope you had a great weekend.",
            "tech",
            "IDLE_DISCUSSION",
            0.85,
        ),
        (
            "Dimas",
            "Let me quickly share my screen and open the slides.",
            "tech",
            "IDLE_DISCUSSION",
            0.85,
        ),
        (
            "Alex",
            "Yeah, I agree with that point.",
            "general",
            "IDLE_DISCUSSION",
            0.85,
        ),
    ],
)
def test_moment_router_classification_table(
    speaker: str,
    text: str,
    persona: str,
    expected_action: str,
    min_confidence: float,
) -> None:
    state = MeetingState(session_id="test-router", active_persona=persona)  # type: ignore[arg-type]
    state.add_utterance(speaker=speaker, text=text)

    action, conf = classify_moment(state)
    assert action == expected_action
    assert conf >= min_confidence


@pytest.mark.parametrize(
    ("ocr_text", "expected_action"),
    [
        ("const stream = new AudioStreamBuffer({ sampleRate: 16000 });", "CODING_OR_SCREEN_PROBLEM"),
        ("SELECT * FROM embeddings WHERE cosine_similarity > 0.85;", "CODING_OR_SCREEN_PROBLEM"),
    ],
)
def test_moment_router_screen_ocr_override_table(ocr_text: str, expected_action: str) -> None:
    state = MeetingState(session_id="ocr-test", active_persona="tech")
    state.screen_ocr_text = ocr_text

    action, conf = classify_moment(state)
    assert action == expected_action
    assert conf >= 0.90
