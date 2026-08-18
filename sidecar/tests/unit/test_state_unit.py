from __future__ import annotations

import pytest
from app.graph.state import ActionItem, CodeSnippet, KeyDecision, LiveSuggestion, MeetingState, TranscriptUtterance


@pytest.mark.parametrize(
    ("speaker", "text", "channel", "is_interim"),
    [
        ("Sarah Lin", "Let's review the HNSW quantization benchmarks.", "speaker", False),
        ("Dimas Prasetyo", "How does FP16 scalar quantization affect query latency?", "mic", False),
        ("Alex Chen", "Streaming partial interim text", "speaker", True),
    ],
)
def test_transcript_utterance_model_table(speaker: str, text: str, channel: str, is_interim: bool) -> None:
    utt = TranscriptUtterance(speaker=speaker, text=text, channel=channel, is_interim=is_interim)  # type: ignore[arg-type]
    assert utt.id.startswith("utt-")
    assert utt.speaker == speaker
    assert utt.text == text
    assert utt.channel == channel
    assert utt.is_interim == is_interim
    assert utt.timestamp > 0


@pytest.mark.parametrize(
    ("utterances_count", "interim_indices", "expected_final_count"),
    [
        (5, [1, 3], 3),
        (3, [], 3),
        (4, [0, 1, 2, 3], 0),
    ],
)
def test_meeting_state_window_slicing_table(
    utterances_count: int, interim_indices: list[int], expected_final_count: int
) -> None:
    state = MeetingState(session_id="test-session", title="Architecture Review")
    for i in range(utterances_count):
        state.add_utterance(
            speaker=f"Speaker {i}",
            text=f"Utterance content turn {i}",
            is_interim=i in interim_indices,
        )

    durable = state.get_durable_transcript_text()
    if expected_final_count == 0:
        assert durable == ""
    else:
        assert len(durable.splitlines()) == expected_final_count


@pytest.mark.parametrize(
    ("title", "summary", "confidence", "has_code"),
    [
        ("Audio Streaming Pipeline", "150ms buffer interval", 0.98, True),
        ("Objection Handling", "Emphasize ROI savings", 0.92, False),
    ],
)
def test_live_suggestion_model_table(title: str, summary: str, confidence: float, has_code: bool) -> None:
    code = (
        CodeSnippet(lang="typescript", code="const buf = 150;", technique="RingBuffer", complexity="O(1)")
        if has_code
        else None
    )
    sug = LiveSuggestion(title=title, summary=summary, confidence=confidence, code_snippet=code)
    assert sug.id.startswith("sug-")
    assert sug.title == title
    assert sug.confidence == confidence
    if has_code:
        assert sug.code_snippet is not None
        assert sug.code_snippet.lang == "typescript"
    else:
        assert sug.code_snippet is None
