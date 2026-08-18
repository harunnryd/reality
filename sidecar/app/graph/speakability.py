from __future__ import annotations

import re

CONVERSATIONAL_OPENERS: dict[str, str] = {
    "tech": "In our architecture, we solve this by",
    "sales": "From an ROI perspective, we deliver",
    "executive": "At a high level, the strategic roadmap ensures",
    "general": "To summarize the consensus,",
}


class SpeakabilityEngine:
    def to_spoken_phrasing(self, text: str, persona: str = "tech") -> str:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        cleaned_points: list[str] = []

        for line in lines:
            cleaned = re.sub(r"^[•\-\*\d\.\:\s]+", "", line).strip()
            if cleaned:
                cleaned_points.append(cleaned)

        opener = CONVERSATIONAL_OPENERS.get(persona, "In practice,")
        body = ". ".join(cleaned_points)
        return f"{opener} {body}."

    def clamp_spoken_cadence(self, text: str, max_sentences: int = 2) -> str:
        raw_sentences = [s.strip() for s in text.split(".") if s.strip()]
        selected = raw_sentences[:max_sentences]
        return ". ".join(selected) + "."


def format_human_spoken_answer(raw_text: str, persona: str = "tech", max_sentences: int = 2) -> str:
    engine = SpeakabilityEngine()
    spoken = engine.to_spoken_phrasing(raw_text, persona=persona)
    return engine.clamp_spoken_cadence(spoken, max_sentences=max_sentences)
