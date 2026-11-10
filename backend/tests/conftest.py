import os

os.environ["ENVIRONMENT"] = "test"

import httpx
import pytest

from app.config import Settings
from app.services import github_service
from tests.fixture_loader import FIXTURES_DIR, load_fixture

__all__ = ["FIXTURES_DIR", "load_fixture"]


@pytest.fixture(scope="session")
def fixture_loader():
    """Return the shared load_fixture helper for pytest test functions."""
    return load_fixture


@pytest.fixture
def github_mock(monkeypatch):
    """Replace the shared GitHub client with one backed by a handler.

    Usage: `calls = github_mock(handler)`. Every request that reaches the
    fake GitHub is appended to `calls`.
    """

    def install(handler):
        calls = []

        def recording(request: httpx.Request) -> httpx.Response:
            calls.append(request)
            return handler(request)

        client = httpx.AsyncClient(transport=httpx.MockTransport(recording))
        monkeypatch.setattr(github_service, "_client", client)
        return calls

    github_service.cache.clear()
    monkeypatch.setattr(
        github_service,
        "get_settings",
        lambda: Settings(
            _env_file=None,
            github_token=None,
            github_cache_ttl=300,
            api_rate_limit_enabled=False,
        ),
    )

    yield install

    github_service.cache.clear()
