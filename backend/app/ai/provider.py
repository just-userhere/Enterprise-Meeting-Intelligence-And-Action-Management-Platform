"""AI provider abstraction.

- BaseProvider: interface all providers implement.
- RuleBasedProvider (default): deterministic, offline extraction. Always
  available, used in tests and when no LLM key is configured.
- OpenAICompatibleProvider: talks to any OpenAI-compatible chat-completions
  endpoint (OpenAI, OpenRouter, etc.) via httpx. Returns raw JSON string.
"""

from __future__ import annotations

import json
import re
from abc import ABC, abstractmethod

import httpx

from app.ai.prompts import SYSTEM_PROMPT, build_user_prompt
from app.core.config import get_settings

_STOPWORDS = {
    "the", "and", "that", "this", "with", "from", "have", "will", "would",
    "about", "into", "they", "them", "then", "than", "when", "what", "also",
    "discussed", "discuss", "meeting", "team", "agreed", "decided", "need",
    "should", "could", "there", "here", "were", "been", "very", "just",
}


class BaseProvider(ABC):
    name: str = "base"

    @abstractmethod
    def analyze(self, transcript: str, title: str = "") -> str:
        """Return a raw JSON string matching AIAnalysisResult."""
        raise NotImplementedError


class RuleBasedProvider(BaseProvider):
    """Transparent offline fallback. Extracts sentences with decision/action
    cue words; never hallucinates names or dates it cannot find."""

    name = "rules"

    DECISION_CUES = ("decided", "agreed", "approved", "concluded", "resolved", "decision")
    ACTION_CUES = ("will ", "action", "todo", "task", "assign", "follow up", "follow-up", "deadline", "by friday", "by monday", "needs to", "should ")
    TOPIC_CUES = ("regarding", "about", "concerning", "topic", "update on", "review of")

    def _sentences(self, text: str) -> list[str]:
        parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
        return [p.strip(" -•\t") for p in parts if len(p.strip()) > 12][:60]

    def analyze(self, transcript: str, title: str = "") -> str:
        sents = self._sentences(transcript)
        decisions = [s[:280] for s in sents if any(c in s.lower() for c in self.DECISION_CUES)][:8]
        actions = []
        for s in sents:
            low = s.lower()
            if any(c in low for c in self.ACTION_CUES):
                priority = "HIGH" if any(w in low for w in ("urgent", "asap", "critical", "tomorrow")) else "MEDIUM"
                m = re.search(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+will\b", s)
                actions.append({
                    "title": s[:140],
                    "description": s[:500],
                    "assignee_name": m.group(1) if m else None,
                    "deadline_text": None,
                    "priority": priority,
                })
                if len(actions) >= 8:
                    break
        words: dict[str, int] = {}
        for s in sents:
            for w in re.findall(r"[A-Za-z]{5,}", s.lower()):
                if w not in _STOPWORDS:
                    words[w] = words.get(w, 0) + 1
        topics = sorted(words, key=words.get, reverse=True)[:6]
        summary_bits = sents[:3]
        summary = " ".join(summary_bits)[:1200] or "Meeting notes processed. Review the transcript for details."
        if title:
            summary = f"{title}: {summary}"
        return json.dumps({
            "summary": summary,
            "decisions": decisions,
            "action_items": actions,
            "topics": [t.capitalize() for t in topics],
            "follow_ups": [],
        })


class OpenAICompatibleProvider(BaseProvider):
    name = "openai-compatible"

    def analyze(self, transcript: str, title: str = "") -> str:
        settings = get_settings()
        if not settings.LLM_API_KEY:
            raise RuntimeError("LLM_API_KEY is not configured.")
        resp = httpx.post(
            f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
            json={
                "model": settings.LLM_MODEL,
                "temperature": 0.2,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": build_user_prompt(transcript, title)},
                ],
            },
            timeout=60,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return content


def get_provider() -> BaseProvider:
    settings = get_settings()
    if settings.AI_PROVIDER == "openai-compatible" and settings.LLM_API_KEY:
        return OpenAICompatibleProvider()
    return RuleBasedProvider()
