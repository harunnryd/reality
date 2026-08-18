from __future__ import annotations

import pytest
from app.graph.speakability import SpeakabilityEngine, format_human_spoken_answer


@pytest.mark.parametrize(
    ("persona", "raw_bullet_points", "expected_opener_fragment"),
    [
        (
            "tech",
            "- Step 1: Use ring buffer\n- Step 2: Set 150ms buffer\n- Step 3: Run over stdio",
            "In our architecture",
        ),
        (
            "sales",
            "- Benefit 1: Save money\n- Benefit 2: Save 12 hours\n- Benefit 3: Annual discount",
            "From an ROI perspective",
        ),
        (
            "executive",
            "- Point 1: Q4 delivery on track\n- Point 2: Risk is mitigated\n- Point 3: SOC2 ready",
            "At a high level",
        ),
    ],
)
def test_speakability_conversational_opener_table(
    persona: str,
    raw_bullet_points: str,
    expected_opener_fragment: str,
) -> None:
    engine = SpeakabilityEngine()
    spoken = engine.to_spoken_phrasing(raw_bullet_points, persona=persona)
    assert len(spoken) > 10
    assert not spoken.startswith("-")
    assert not spoken.startswith("•")
    assert expected_opener_fragment.lower() in spoken.lower()


@pytest.mark.parametrize(
    ("long_verbose_text", "max_sentences", "expected_max_period_count"),
    [
        (
            "First we initialize the buffer. Then we bind the event emitter. After that we resample audio. Finally we stream via stdio. In conclusion it reduces latency.",
            2,
            2,
        ),
        (
            "We evaluated multiple competitors. None offered sub-350ms streaming. Our pricing delivers 3x ROI. We also offer annual payment tiers.",
            2,
            2,
        ),
    ],
)
def test_speakability_sentence_budget_table(
    long_verbose_text: str, max_sentences: int, expected_max_period_count: int
) -> None:
    engine = SpeakabilityEngine()
    concise = engine.clamp_spoken_cadence(long_verbose_text, max_sentences=max_sentences)
    sentences = [s for s in concise.split(".") if s.strip()]
    assert len(sentences) <= expected_max_period_count
