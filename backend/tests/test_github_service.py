from datetime import UTC, datetime

import httpx
import pytest

from app.config import Settings
from app.services import github_service
from app.services.github_service import (
    MAX_DETAIL_REPOSITORIES,
    GitHubRateLimitError,
    get_github_user,
    get_repository_details,
    get_user_repositories,
)
from app.services.issue_service import search_github_issues
from tests.fixture_loader import load_fixture

RESET = 1893456000  # 2030-01-01T00:00:00Z


def ok(request):
    return httpx.Response(200, json=load_fixture("users/user_standard.json"))


async def test_user_is_cached_between_calls(github_mock, fixture_loader):
    expected_user = fixture_loader("users/user_standard.json")
    calls = github_mock(ok)

    first = await get_github_user(expected_user["login"])
    second = await get_github_user(expected_user["login"].upper())

    assert first == second == expected_user
    assert len(calls) == 1


async def test_repositories_are_cached_between_calls(github_mock, fixture_loader):
    expected_repos = fixture_loader("repositories/repos_standard.json")
    calls = github_mock(lambda r: httpx.Response(200, json=expected_repos))

    first = await get_user_repositories("octocat")
    second = await get_user_repositories("octocat")

    assert first == second == expected_repos
    assert len(calls) == 1


async def test_cache_is_skipped_when_ttl_is_zero(github_mock, monkeypatch):
    calls = github_mock(ok)
    monkeypatch.setattr(
        github_service,
        "get_settings",
        lambda: Settings(_env_file=None, github_cache_ttl=0),
    )

    await get_github_user("octocat")
    await get_github_user("octocat")

    assert len(calls) == 2


async def test_missing_user_returns_none_and_is_not_cached(github_mock):
    calls = github_mock(lambda r: httpx.Response(404, json={}))

    assert await get_github_user("ghost") is None
    assert await get_github_user("ghost") is None
    assert len(calls) == 2


async def test_429_raises_rate_limit_error(github_mock):
    github_mock(
        lambda r: httpx.Response(429, headers={"X-RateLimit-Reset": str(RESET)})
    )

    with pytest.raises(GitHubRateLimitError) as exc_info:
        await get_github_user("octocat")

    assert exc_info.value.reset_at == datetime.fromtimestamp(RESET, tz=UTC)


async def test_403_with_no_remaining_requests_is_a_rate_limit(github_mock):
    github_mock(
        lambda r: httpx.Response(
            403,
            headers={
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(RESET),
            },
        )
    )

    with pytest.raises(GitHubRateLimitError):
        await get_user_repositories("octocat")


async def test_plain_403_is_not_a_rate_limit(github_mock):
    github_mock(lambda r: httpx.Response(403, headers={"X-RateLimit-Remaining": "42"}))

    with pytest.raises(httpx.HTTPStatusError):
        await get_github_user("octocat")


async def test_rate_limit_without_reset_header(github_mock):
    github_mock(lambda r: httpx.Response(429))

    with pytest.raises(GitHubRateLimitError) as exc_info:
        await get_github_user("octocat")

    assert exc_info.value.reset_at is None


async def test_rate_limited_response_is_not_cached(github_mock, fixture_loader):
    expected_user = fixture_loader("users/user_standard.json")
    state = {"limited": True}

    def handler(request):
        if state["limited"]:
            return httpx.Response(429)
        return httpx.Response(200, json=expected_user)

    github_mock(handler)

    with pytest.raises(GitHubRateLimitError):
        await get_github_user(expected_user["login"])

    state["limited"] = False
    assert await get_github_user(expected_user["login"]) == expected_user


async def test_issue_search_uses_the_same_rate_limit_handling(github_mock):
    github_mock(lambda r: httpx.Response(429))

    with pytest.raises(GitHubRateLimitError):
        await search_github_issues(language="python")


def test_token_is_sent_when_configured(monkeypatch):
    monkeypatch.setattr(github_service, "_client", None)
    monkeypatch.setattr(
        github_service,
        "get_settings",
        lambda: Settings(_env_file=None, github_token="abc123"),
    )

    client = github_service.get_client()

    assert client.headers["Authorization"] == "Bearer abc123"


def test_no_auth_header_without_token(monkeypatch):
    monkeypatch.setattr(github_service, "_client", None)
    monkeypatch.setattr(
        github_service,
        "get_settings",
        lambda: Settings(_env_file=None, github_token=None),
    )

    client = github_service.get_client()

    assert "Authorization" not in client.headers


async def test_get_user_repositories_paginates_beyond_first_page(
    github_mock, fixture_loader
):
    page1 = fixture_loader("repositories/repos_large.json")
    page2 = fixture_loader("repositories/repos_paginated_page2.json")
    calls = []

    def handler(request):
        page = request.url.params.get("page", "1")
        calls.append(page)
        if page == "1":
            return httpx.Response(200, json=page1)
        if page == "2":
            return httpx.Response(200, json=page2)
        return httpx.Response(200, json=[])

    github_mock(handler)
    repos = await get_user_repositories("gaearon")

    assert repos is not None
    assert len(repos) == len(page1) + len(page2)
    assert calls == ["1", "2"]


async def test_get_github_user_no_bio_sanitized(github_mock, fixture_loader):
    user_no_bio = fixture_loader("users/user_no_bio.json")
    github_mock(lambda r: httpx.Response(200, json=user_no_bio))

    result = await get_github_user(user_no_bio["login"])

    assert result is not None
    assert result["login"] == user_no_bio["login"]
    assert result["bio"] is None
    assert result["email"] is None


async def test_get_user_repositories_empty_collection(github_mock, fixture_loader):
    empty_repos = fixture_loader("repositories/repos_empty.json")
    calls = github_mock(lambda r: httpx.Response(200, json=empty_repos))

    repos = await get_user_repositories("newbie-contributor")

    assert repos == []
    assert len(calls) == 1


async def test_get_repository_details_uses_language_fixtures_and_caps_large_collections(
    github_mock, fixture_loader
):
    repos = fixture_loader("repositories/repos_large.json")
    lang_multi = fixture_loader("languages/languages_multi.json")
    lang_single = fixture_loader("languages/languages_single.json")
    lang_empty = fixture_loader("languages/languages_empty.json")

    def handler(request):
        path = request.url.path
        if path == "/repos/gaearon/subliminal/languages":
            return httpx.Response(200, json=lang_empty)
        if path == "/repos/gaearon/overreacted.io/languages":
            return httpx.Response(200, json=lang_multi)
        if path.endswith("/languages"):
            return httpx.Response(200, json=lang_single)
        return httpx.Response(404, json={})

    calls = github_mock(handler)
    details = await get_repository_details(repos)

    assert len(details) == MAX_DETAIL_REPOSITORIES
    language_calls = [c for c in calls if c.url.path.endswith("/languages")]
    assert len(language_calls) == MAX_DETAIL_REPOSITORIES
    assert "/repos/gaearon/subliminal/languages" in {c.url.path for c in language_calls}
    assert details["gaearon/subliminal"]["languages"] == {}
    assert details["gaearon/overreacted.io"]["languages"] == lang_multi
    assert details["gaearon/react-hot-boilerplate"]["languages"] == lang_single
    assert any(entry["languages"] == lang_empty for entry in details.values())
    assert any(entry["languages"] == lang_multi for entry in details.values())
    assert any(entry["languages"] == lang_single for entry in details.values())
