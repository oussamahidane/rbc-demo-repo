"""Earnings-Call Analyzer (eca).

A minimal, reliability-first pipeline that turns an earnings-call transcript into
an institutional-grade, self-citing report — with an evaluation harness.

Design principle: the whole pipeline runs deterministically in --mock mode with no
API key, so it can be tested and demoed offline; real analysis uses Claude when
ANTHROPIC_API_KEY is set.
"""

__version__ = "0.1.0"
