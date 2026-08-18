from __future__ import annotations

import re
from app.graph.state import ActionItem, KeyDecision, MeetingState

ACTION_PATTERNS = [
    re.compile(r"(?:i will|we will|let\'s|please|needs to|action item:?)\s+([^.\n]+)", re.IGNORECASE),
    re.compile(r"([A-Z][a-z]+)\s+(?:will|to|should)\s+([^.\n]+)", re.IGNORECASE),
]

DECISION_PATTERNS = [
    re.compile(
        r"(?:we decided to|decided to|agreed on|we agreed to|agreed to|consensus is|let\'s go with|approved)\s+([^.\n]+)",
        re.IGNORECASE,
    ),
]

NON_ASSIGNEE_WORDS = {"agreed", "decided", "scheduled", "approved", "we", "they", "it", "that", "this"}


def extract_action_items(transcript_text: str) -> list[ActionItem]:
    items: list[ActionItem] = []
    seen: set[str] = set()

    for raw_line in transcript_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        speaker_name: str | None = None
        line_body = line
        if ":" in line:
            parts = line.split(":", 1)
            speaker_name = parts[0].strip()
            line_body = parts[1].strip()

        if re.search(r"\b(we decided to|decided to|agreed on|we agreed to|agreed to|consensus is|approved)\b", line_body, re.IGNORECASE):
            continue

        i_will_match = re.search(r"\bi will\s+([^.\n]+)", line_body, re.IGNORECASE)
        if i_will_match:
            task = i_will_match.group(1).strip()
            if len(task) > 8 and task.lower() not in seen:
                seen.add(task.lower())
                is_high = any(w in task.lower() for w in ("urgent", "today", "tomorrow", "asap"))
                items.append(
                    ActionItem(
                        text=task,
                        assignee=speaker_name,
                        completed=False,
                        priority="high" if is_high else "medium",
                    )
                )
            continue

        third_person_match = re.search(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:to|will|should)\s+([^.\n]+)", line_body)
        if third_person_match:
            assignee_cand = third_person_match.group(1).strip()
            task = third_person_match.group(2).strip()
            if assignee_cand.lower() not in NON_ASSIGNEE_WORDS and len(task) > 8 and task.lower() not in seen:
                seen.add(task.lower())
                is_high = any(w in task.lower() for w in ("urgent", "today", "tomorrow", "asap"))
                items.append(
                    ActionItem(
                        text=task,
                        assignee=assignee_cand,
                        completed=False,
                        priority="high" if is_high else "medium",
                    )
                )
            continue

        generic_match = re.search(r"\b(?:let\'s|please|needs to|action item:?)\s+([^.\n]+)", line_body, re.IGNORECASE)
        if generic_match:
            task = generic_match.group(1).strip()
            if len(task) > 8 and task.lower() not in seen:
                seen.add(task.lower())
                is_high = any(w in task.lower() for w in ("urgent", "today", "tomorrow", "asap"))
                items.append(
                    ActionItem(
                        text=task,
                        assignee=None,
                        completed=False,
                        priority="high" if is_high else "medium",
                    )
                )

    return items


def extract_key_decisions(transcript_text: str) -> list[KeyDecision]:
    decisions: list[KeyDecision] = []
    seen: set[str] = set()

    for line in transcript_text.splitlines():
        for pat in DECISION_PATTERNS:
            matches = pat.findall(line)
            for match in matches:
                text = match.strip() if isinstance(match, str) else str(match).strip()
                if len(text) > 8 and text.lower() not in seen:
                    seen.add(text.lower())
                    decisions.append(
                        KeyDecision(
                            decision=text,
                            rationale="Agreed upon by participants during technical consensus discussion.",
                        )
                    )

    return decisions


def generate_executive_summary(state: MeetingState) -> str:
    transcript = state.get_durable_transcript_text()
    if not transcript:
        return f"Executive summary for {state.title}. No utterances recorded."

    num_turns = len(state.utterances)
    persona_label = state.active_persona.capitalize()
    return (
        f"Meeting '{state.title}' concluded with {num_turns} discussion turns under {persona_label} persona. "
        f"Consensus established across key technical architecture decisions and actionable next steps were assigned."
    )


async def meeting_memory_node(state: MeetingState) -> dict:
    durable_text = state.get_durable_transcript_text()
    actions = extract_action_items(durable_text)
    decisions = extract_key_decisions(durable_text)
    summary = generate_executive_summary(state)

    state.action_items = actions
    state.key_decisions = decisions
    state.executive_summary = summary

    return {
        "action_items": [a.model_dump() for a in actions],
        "key_decisions": [d.model_dump() for d in decisions],
        "executive_summary": summary,
    }
