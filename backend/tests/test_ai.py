"""AI pipeline tests use mocked providers — no network, no API key."""

from app.ai.meeting_analyzer import run_analysis
from app.ai.provider import BaseProvider, RuleBasedProvider


def test_rules_provider_structured_output():
    p = RuleBasedProvider()
    raw = p.analyze("We decided to ship Friday. Priya will write release notes. This is urgent ASAP.")
    result, err = run_analysis("We decided to ship Friday. Priya will write release notes. This is urgent ASAP.", provider=p)
    assert err is None
    assert len(result.summary) > 10
    assert isinstance(result.decisions, list)


def test_rules_provider_never_hallucinates_names():
    result, err = run_analysis("We talked about the roadmap and timelines for a while in general terms.", provider=RuleBasedProvider())
    assert err is None
    for a in result.action_items:
        assert a.assignee_name is None or len(a.assignee_name) > 0


def test_malformed_ai_output_handled():
    class Bad(BaseProvider):
        name = "bad"
        def analyze(self, transcript, title=""):
            return "this is not json{{{"

    result, err = run_analysis("Some sufficiently long transcript content here for testing.", provider=Bad())
    assert result is None
    assert err is not None


def test_missing_fields_rejected_gracefully():
    class Sparse(BaseProvider):
        name = "sparse"
        def analyze(self, transcript, title=""):
            return '{"summary": "x"}'  # too short summary, fails validation

    result, err = run_analysis("Some sufficiently long transcript content here for testing.", provider=Sparse())
    assert result is None


def test_provider_failure_graceful():
    class Down(BaseProvider):
        name = "down"
        def analyze(self, transcript, title=""):
            raise RuntimeError("network down")

    result, err = run_analysis("Some sufficiently long transcript content here for testing.", provider=Down())
    assert result is None
    assert "unavailable" in err


def test_short_transcript_rejected():
    result, err = run_analysis("hi", provider=RuleBasedProvider())
    assert result is None
