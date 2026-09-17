"""Orchestrates AI analysis: provider call -> strict validation -> sanitized result.

Never raises on bad AI output; returns (result_or_None, error_or_None) so
route handlers can mark meetings FAILED gracefully instead of crashing.
"""

from __future__ import annotations

import json
import logging
import re

from pydantic import ValidationError

from app.ai.provider import BaseProvider, get_provider
from app.ai.schemas import AIAnalysisResult

log = logging.getLogger(__name__)


def _strip_fences(raw: str) -> str:
    raw = raw.strip()
    m = re.match(r"^```(?:json)?\s*(.*?)\s*```$", raw, re.DOTALL)
    return m.group(1) if m else raw


def run_analysis(
    transcript: str, title: str = "", provider: BaseProvider | None = None
) -> tuple[AIAnalysisResult | None, str | None]:
    if not transcript or len(transcript.strip()) < 10:
        return None, "Transcript is too short to analyze."
    provider = provider or get_provider()
    try:
        raw = provider.analyze(transcript, title=title)
    except Exception as exc:  # provider failure (network, auth, timeout)
        log.warning("AI provider %s failed: %s", provider.name, exc)
        return None, f"AI analysis is currently unavailable ({provider.name})."
    try:
        data = json.loads(_strip_fences(raw))
        result = AIAnalysisResult.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as exc:
        log.warning("Invalid AI output from %s: %s", provider.name, exc)
        return None, "AI returned an invalid response. Please retry."
    # Sanitize: drop empties, cap lengths, normalize priorities
    result.decisions = [d.strip()[:500] for d in result.decisions if d.strip()][:10]
    result.topics = [t.strip()[:150] for t in result.topics if t.strip()][:10]
    result.follow_ups = [f.strip()[:500] for f in result.follow_ups if f.strip()][:10]
    clean_actions = []
    for a in result.action_items[:8]:
        p = (a.priority or "MEDIUM").upper()
        a.priority = p if p in {"LOW", "MEDIUM", "HIGH"} else "MEDIUM"
        if a.title.strip():
            clean_actions.append(a)
    result.action_items = clean_actions
    return result, None
