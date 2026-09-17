"""Strict Pydantic contracts for structured AI output.

The LLM must return JSON matching AIAnalysisResult. Anything else is rejected
and handled gracefully (never saved malformed, never crashes the request).
"""

from pydantic import BaseModel, Field, ValidationError


class AIActionItem(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(default="", max_length=2000)
    assignee_name: str | None = Field(default=None, max_length=120)
    deadline_text: str | None = Field(default=None, max_length=120)
    priority: str = Field(default="MEDIUM")


class AIAnalysisResult(BaseModel):
    summary: str = Field(min_length=10, max_length=20000)
    decisions: list[str] = Field(default_factory=list, max_length=50)
    action_items: list[AIActionItem] = Field(default_factory=list, max_length=100)
    topics: list[str] = Field(default_factory=list, max_length=50)
    follow_ups: list[str] = Field(default_factory=list, max_length=50)


def parse_analysis(data: object) -> AIAnalysisResult:
    if isinstance(data, str):
        import json

        data = json.loads(data)
    return AIAnalysisResult.model_validate(data)


__all__ = ["AIActionItem", "AIAnalysisResult", "ValidationError", "parse_analysis"]
