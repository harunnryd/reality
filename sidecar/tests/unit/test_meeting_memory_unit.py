from __future__ import annotations

import pytest
from app.graph.nodes.meeting_memory import extract_action_items, extract_key_decisions, generate_executive_summary
from app.graph.state import MeetingState


@pytest.mark.parametrize(
    ("utterance", "expected_has_action", "expected_assignee", "expected_priority"),
    [
        ("Sarah Lin: I will update the Kafka broker config before tomorrow.", True, "Sarah Lin", "high"),
        ("Dimas: Alex to review the SOC2 audit report next week.", True, "Alex", "medium"),
        ("Lead: Please send the updated slide deck to the client today.", True, None, "high"),
        ("Alex: We agreed to finalize the design.", False, None, None),
    ],
)
def test_action_item_extraction_table(
    utterance: str,
    expected_has_action: bool,
    expected_assignee: str | None,
    expected_priority: str | None,
) -> None:
    items = extract_action_items(utterance)
    if expected_has_action:
        assert len(items) >= 1
        assert items[0].assignee == expected_assignee
        assert items[0].priority == expected_priority
    else:
        assert len(items) == 0


@pytest.mark.parametrize(
    ("utterance", "expected_has_decision", "expected_decision_keyword"),
    [
        ("Lead: We decided to use 150ms audio chunk size.", True, "150ms"),
        ("Sarah: Agreed on moving the persona selector to header bar.", True, "persona selector"),
        ("Dimas: Consensus is established on SQLite-vec for local storage.", True, "SQLite-vec"),
        ("Alex: I will write the unit tests tomorrow morning.", False, None),
    ],
)
def test_key_decision_extraction_table(
    utterance: str,
    expected_has_decision: bool,
    expected_decision_keyword: str | None,
) -> None:
    decisions = extract_key_decisions(utterance)
    if expected_has_decision:
        assert len(decisions) >= 1
        assert expected_decision_keyword is not None
        assert expected_decision_keyword.lower() in decisions[0].decision.lower()
    else:
        assert len(decisions) == 0


def test_executive_summary_generation() -> None:
    state = MeetingState(session_id="sum-test", title="SOC2 Security Review", active_persona="executive")
    state.add_utterance("Auditor", "Can you explain your memory zeroization guarantees?")
    state.add_utterance("CTO", "All RAM buffers are wiped immediately on session termination.")

    summary = generate_executive_summary(state)
    assert "SOC2 Security Review" in summary
    assert "Executive" in summary
    assert "2 discussion turns" in summary
