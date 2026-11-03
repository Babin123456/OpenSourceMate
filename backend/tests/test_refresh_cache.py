import httpx
import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services import github_service
from app.services.github_service import (
    get_github_user,
    get_repository_details,
    get_user_repositories,
)

client = TestClient(app)


async def test_get_github_user_cache_hit_and_refresh_bypass(github_mock):
    username = "testuser"
    key = f"github:user:{username}"

    # Pre-populate cache with cached payload
    cached_payload = {
        "login": "testuser",
        "name": "Cached User",
        "bio": "Old Bio",
        "avatar_url": "https://example.com/old.png",
        "public_repos": 5,
        "followers": 10,
        "following": 2,
        "html_url": "https://github.com/testuser",
    }
    github_service.cache.set(key, cached_payload, ttl=300)

    # 1. When refresh=False, should return cached data without HTTP call
    calls = github_mock(lambda r: httpx.Response(200, json={}))
    result = await get_github_user(username, refresh=False)
    assert result["name"] == "Cached User"
    assert len(calls) == 0

    # 2. When refresh=True, should bypass cache, call API, and update cache
    fresh_payload = {
        "login": "testuser",
        "name": "Fresh User",
        "bio": "New Bio",
        "avatar_url": "https://example.com/fresh.png",
        "public_repos": 8,
        "followers": 15,
        "following": 3,
        "html_url": "https://github.com/testuser",
    }
    calls = github_mock(lambda r: httpx.Response(200, json=fresh_payload))
    result = await get_github_user(username, refresh=True)
    assert result["name"] == "Fresh User"
    assert len(calls) == 1
    # Verify cache was updated
    assert github_service.cache.get(key)["name"] == "Fresh User"


async def test_get_user_repositories_cache_hit_and_refresh_bypass(github_mock):
    username = "testuser"
    key = f"github:repos:{username}"

    cached_repos = [{"name": "repo1", "fork": False, "language": "Python"}]
    github_service.cache.set(key, cached_repos, ttl=300)

    # 1. When refresh=False, should hit cache
    calls = github_mock(lambda r: httpx.Response(200, json=[]))
    result = await get_user_repositories(username, refresh=False)
    assert len(result) == 1
    assert result[0]["name"] == "repo1"
    assert len(calls) == 0

    # 2. When refresh=True, should bypass cache and fetch fresh
    fresh_repos = [
        {"name": "repo1", "fork": False, "language": "Python"},
        {"name": "repo2", "fork": False, "language": "TypeScript"},
    ]
    calls = github_mock(lambda r: httpx.Response(200, json=fresh_repos, headers={}))
    result = await get_user_repositories(username, refresh=True)
    assert len(result) == 2
    assert len(calls) == 1
    assert len(github_service.cache.get(key)) == 2


async def test_get_repository_details_refresh_flag(github_mock):
    repos = [
        {
            "name": "project",
            "full_name": "testuser/project",
            "fork": False,
            "updated_at": "2026-11-01T10:00:00Z",
        }
    ]
    key = "github:repo-details:testuser/project"
    cached_details = {"languages": {"Python": 500}, "dependencies": ["fastapi"]}
    github_service.cache.set(key, cached_details, ttl=300)

    # Refresh=False -> hits cache
    calls = github_mock(lambda r: httpx.Response(200, json={}))
    details = await get_repository_details(repos, refresh=False)
    assert details["testuser/project"]["languages"] == {"Python": 500}
    assert len(calls) == 0

    # Refresh=True -> refreshes
    fresh_lang = {"Python": 1000, "Rust": 200}
    calls = github_mock(lambda r: httpx.Response(200, json=fresh_lang))
    details = await get_repository_details(repos, refresh=True)
    assert details["testuser/project"]["languages"] == fresh_lang
    assert len(calls) >= 1


def test_api_user_endpoint_returns_fetched_at_and_supports_refresh(monkeypatch):
    calls = []

    async def fake_get_user(username: str, refresh: bool = False):
        calls.append((username, refresh))
        return {
            "login": "octocat",
            "name": "The Octocat",
            "bio": "GitHub Mascot",
            "avatar_url": "https://example.com/avatar.png",
            "public_repos": 10,
            "followers": 100,
            "following": 5,
            "html_url": "https://github.com/octocat",
        }

    monkeypatch.setattr("app.api.routes.github.get_github_user", fake_get_user)

    # Regular request
    res1 = client.get("/api/github/users/octocat")
    assert res1.status_code == 200
    data1 = res1.json()
    assert "fetched_at" in data1
    assert data1["fetched_at"] is not None
    assert calls[-1] == ("octocat", False)

    # Refresh request
    res2 = client.get("/api/github/users/octocat?refresh=true")
    assert res2.status_code == 200
    data2 = res2.json()
    assert "fetched_at" in data2
    assert calls[-1] == ("octocat", True)


def test_api_skills_endpoint_returns_analyzed_at_and_supports_refresh(monkeypatch):
    repo_calls = []
    details_calls = []

    async def fake_get_repos(username: str, refresh: bool = False):
        repo_calls.append((username, refresh))
        return [{"name": "demo", "fork": False, "language": "TypeScript"}]

    async def fake_get_details(repositories, refresh: bool = False):
        details_calls.append(refresh)
        return {}

    monkeypatch.setattr("app.api.routes.github.get_user_repositories", fake_get_repos)
    monkeypatch.setattr("app.api.routes.github.get_repository_details", fake_get_details)

    # Regular call
    res1 = client.get("/api/github/users/octocat/skills")
    assert res1.status_code == 200
    data1 = res1.json()
    assert "analyzed_at" in data1
    assert data1["analyzed_at"] is not None
    assert repo_calls[-1] == ("octocat", False)
    assert details_calls[-1] is False

    # Refresh call
    res2 = client.get("/api/github/users/octocat/skills?refresh=true")
    assert res2.status_code == 200
    data2 = res2.json()
    assert "analyzed_at" in data2
    assert repo_calls[-1] == ("octocat", True)
    assert details_calls[-1] is True


def test_api_repositories_endpoint_returns_fetched_at_and_supports_refresh(monkeypatch):
    calls = []

    async def fake_get_repos(username: str, refresh: bool = False):
        calls.append((username, refresh))
        return [
            {
                "name": "sample",
                "description": "sample repo",
                "language": "Python",
                "stargazers_count": 5,
                "forks_count": 1,
                "fork": False,
                "html_url": "https://github.com/octocat/sample",
                "updated_at": "2026-11-01T00:00:00Z",
            }
        ]

    monkeypatch.setattr("app.api.routes.github.get_user_repositories", fake_get_repos)

    # Regular call
    res1 = client.get("/api/github/users/octocat/repositories")
    assert res1.status_code == 200
    data1 = res1.json()
    assert "fetched_at" in data1
    assert calls[-1] == ("octocat", False)

    # Refresh call
    res2 = client.get("/api/github/users/octocat/repositories?refresh=true")
    assert res2.status_code == 200
    data2 = res2.json()
    assert "fetched_at" in data2
    assert calls[-1] == ("octocat", True)
