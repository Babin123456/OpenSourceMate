from typing import Any
import pytest
from app.services.github_service import (
    GitHubRateLimitError,
    GitHubTimeoutError,
    GitHubUpstreamError,
    _rate_limit_reset,
    _is_rate_limited,
)
import httpx


def test_exception_type_hierarchy():
    rl_err = GitHubRateLimitError()
    assert isinstance(rl_err, Exception)

    timeout_err = GitHubTimeoutError("https://api.github.com/test", 10.0)
    assert isinstance(timeout_err, Exception)
    assert timeout_err.url == "https://api.github.com/test"
    assert timeout_err.timeout_seconds == 10.0

    upstream_err = GitHubUpstreamError("https://api.github.com/test", 502, "Bad Gateway")
    assert isinstance(upstream_err, Exception)
    assert upstream_err.status_code == 502


def test_rate_limit_helpers_typing():
    res_429 = httpx.Response(429, headers={"Retry-After": "30"})
    assert _is_rate_limited(res_429) is True

    reset_dt = _rate_limit_reset(res_429)
    assert reset_dt is not None

    res_200 = httpx.Response(200)
    assert _is_rate_limited(res_200) is False
    assert _rate_limit_reset(res_200) is None
