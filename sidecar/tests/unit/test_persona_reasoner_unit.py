from __future__ import annotations

import pytest
from app.graph.nodes.persona_reasoner import build_system_prompt_for_persona, synthesize_deterministic_suggestion
from app.graph.state import MeetingState


@pytest.mark.parametrize(
    ("persona", "question", "requires_code", "expected_title_fragment"),
    [
        ("tech", "How to configure audio ring buffer for sub-350ms latency?", True, "Audio"),
        ("tech", "What is the optimal caching architecture for vector search?", True, "Architecture"),
        ("sales", "Your software is significantly more expensive than competitor X.", False, "Value Framing"),
        ("executive", "What is the strategic roadmap risk for Q4 delivery?", False, "Strategic Alignment"),
        ("general", "Can you explain the consensus on deployment timeline?", False, "Discussion Point"),
    ],
)
def test_persona_reasoner_synthesis_table(
    persona: str,
    question: str,
    requires_code: bool,
    expected_title_fragment: str,
) -> None:
    state = MeetingState(session_id="persona-test", active_persona=persona)  # type: ignore[arg-type]
    state.latest_detected_question = question

    suggestion = synthesize_deterministic_suggestion(state)
    assert suggestion.confidence >= 0.90
    assert expected_title_fragment.lower() in suggestion.title.lower()

    if requires_code:
        assert suggestion.code_snippet is not None
        assert len(suggestion.code_snippet.code) > 10
        assert suggestion.code_snippet.technique is not None
        assert suggestion.code_snippet.complexity is not None
    else:
        assert len(suggestion.key_takeaways) >= 1


@pytest.mark.parametrize(
    ("persona", "profile_name", "profile_role", "expected_prompt_keywords"),
    [
        ("tech", "Sarah", "Staff Engineer", ["TECH & ARCHITECTURE", "complexity", "Sarah"]),
        ("sales", "David", "AE", ["SALES & NEGOTIATION", "ROI", "David"]),
        ("executive", "Elena", "VP Engineering", ["EXECUTIVE BRIEFING", "risk", "Elena"]),
    ],
)
def test_system_prompt_builder_table(
    persona: str,
    profile_name: str,
    profile_role: str,
    expected_prompt_keywords: list[str],
) -> None:
    context = {"name": profile_name, "target_role": profile_role}
    prompt = build_system_prompt_for_persona(persona, context)

    for keyword in expected_prompt_keywords:
        assert keyword in prompt
