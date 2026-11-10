import pytest
import httpx
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_top_repositories_endpoint_success(monkeypatch):
    mock_repos = [
        {"name": "repo1", "stargazers_count": 120, "fork": False, "language": "Python", "updated_at": "2026-03-01T00:00:00Z", "html_url": "https://github.com/octocat/repo1"},
        {"name": "repo2", "stargazers_count": 500, "fork": False, "language": "TypeScript", "updated_at": "2026-01-01T00:00:00Z", "html_url": "https://github.com/octocat/repo2"},
        {"name": "repo3", "stargazers_count": 10, "fork": False, "language": "Go", "updated_at": "2026-04-01T00:00:00Z", "html_url": "https://github.com/octocat/repo3"},
        {"name": "forked_repo", "stargazers_count": 1000, "fork": True, "language": "Rust", "updated_at": "2026-05-01T00:00:00Z", "html_url": "https://github.com/octocat/forked"},
        {"name": "repo4", "stargazers_count": 45, "fork": False, "language": "Python", "updated_at": "2026-02-01T00:00:00Z", "html_url": "https://github.com/octocat/repo4"},
        {"name": "repo5", "stargazers_count": 80, "fork": False, "language": "JavaScript", "updated_at": "2026-03-15T00:00:00Z", "html_url": "https://github.com/octocat/repo5"},
        {"name": "repo6", "stargazers_count": 5, "fork": False, "language": "Shell", "updated_at": "2026-01-10T00:00:00Z", "html_url": "https://github.com/octocat/repo6"},
    ]

    async def fake_get_repos(username: str, refresh: bool = False):
        return mock_repos

    monkeypatch.setattr("app.api.routes.github.get_user_repositories", fake_get_repos)

    # 1. Test with exclude_forks=true (default)
    res = client.get("/api/v1/github/users/octocat/top-repositories")
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "octocat"
    assert data["exclude_forks"] is True

    # Top by stars (excluding forked_repo which had 1000)
    top_stars = data["top_by_stars"]
    assert len(top_stars) == 5
    assert top_stars[0]["name"] == "repo2"
    assert top_stars[0]["stars"] == 500
    assert top_stars[1]["name"] == "repo1"
    assert top_stars[1]["stars"] == 120

    # Most recent (excluding forked_repo which was in May)
    recent = data["most_recent"]
    assert len(recent) == 5
    assert recent[0]["name"] == "repo3"  # April
    assert recent[1]["name"] == "repo5"  # March 15

    # 2. Test including forks
    res_forks = client.get("/api/v1/github/users/octocat/top-repositories?exclude_forks=false")
    assert res_forks.status_code == 200
    data_forks = res_forks.json()
    assert data_forks["top_by_stars"][0]["name"] == "forked_repo"
    assert data_forks["top_by_stars"][0]["stars"] == 1000
    assert data_forks["most_recent"][0]["name"] == "forked_repo"


def test_top_repositories_404_when_user_not_found(monkeypatch):
    async def fake_none(username: str, refresh: bool = False):
        return None

    monkeypatch.setattr("app.api.routes.github.get_user_repositories", fake_none)
    res = client.get("/api/v1/github/users/validusername/top-repositories")
    assert res.status_code == 404
