import httpx
import pytest

from app.main import app

RESET = 1893456000


@pytest.fixture
async def api():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


async def test_rate_limit_returns_429_with_reset_at(api, github_mock):
    github_mock(
        lambda r: httpx.Response(429, headers={"X-RateLimit-Reset": str(RESET)})
    )

    response = await api.get("/api/github/users/octocat")

    assert response.status_code == 429
    body = response.json()
    assert "rate limit" in body["detail"].lower()
    assert body["reset_at"] == "2030-01-01T00:00:00+00:00"


async def test_rate_limit_without_reset_header_gives_null_reset_at(api, github_mock):
    github_mock(lambda r: httpx.Response(429))

    response = await api.get("/api/github/users/octocat/skills")

    assert response.status_code == 429
    assert response.json()["reset_at"] is None


async def test_issue_search_rate_limit_is_429_not_500(api, github_mock):
    github_mock(lambda r: httpx.Response(429))

    response = await api.get("/api/issues/search", params={"language": "python"})

    assert response.status_code == 429


async def test_skills_reuses_repositories_cached_by_repositories_route(api, github_mock):
    repo = {
        "name": "r",
        "description": None,
        "language": "Python",
        "stargazers_count": 1,
        "forks_count": 0,
        "fork": False,
        "html_url": "https://github.com/octocat/r",
        "updated_at": "2026-01-01T00:00:00Z",
    }
    calls = github_mock(lambda r: httpx.Response(200, json=[repo]))

    first = await api.get("/api/github/users/octocat/repositories")
    second = await api.get("/api/github/users/octocat/skills")

    assert first.status_code == second.status_code == 200
    assert len(calls) == 1


async def test_unknown_user_still_404(api, github_mock):
    github_mock(lambda r: httpx.Response(404, json={}))

    response = await api.get("/api/github/users/ghost")

    assert response.status_code == 404


async def test_matching_ranks_issue_that_mentions_a_skill_first(api, github_mock):
    def item(issue_id, title, body):
        return {
            "id": issue_id,
            "title": title,
            "body": body,
            "repository_url": "https://api.github.com/repos/acme/project",
            "html_url": f"https://github.com/acme/project/issues/{issue_id}",
            "state": "open",
            "labels": [{"name": "good first issue"}],
            "comments": 1,
            "created_at": "2026-10-01T00:00:00Z",
            "updated_at": "2026-10-20T00:00:00Z",
            "user": {"login": "someone"},
        }

    def handler(request):
        if request.url.path == "/users/octocat/repos":
            return httpx.Response(
                200,
                json=[
                    {
                        "name": "api",
                        "full_name": "octocat/api",
                        "description": None,
                        "language": "Python",
                        "stargazers_count": 0,
                        "forks_count": 0,
                        "fork": False,
                        "html_url": "https://github.com/octocat/api",
                        "updated_at": "2026-01-01T00:00:00Z",
                    }
                ],
            )

        if request.url.path == "/search/issues":
            return httpx.Response(
                200,
                json={
                    "total_count": 2,
                    "items": [
                        item(1, "Fix typo in docs", ""),
                        item(2, "Handle empty input", "The Python parser crashes on empty input"),
                    ],
                },
            )

        return httpx.Response(404)

    github_mock(handler)

    body = (await api.get("/api/matching/users/octocat/issues")).json()
    first = body["recommendations"][0]

    assert first["id"] == 2
    assert first["matched_skills"] == ["python"]
    assert first["score_method"] == "keyword-tfidf"
    assert "_raw_score" not in first
