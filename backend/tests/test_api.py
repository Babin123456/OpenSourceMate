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


def _repo(name, **extra):
    base = {
        "name": name,
        "full_name": f"octocat/{name}",
        "description": None,
        "language": "JavaScript",
        "stargazers_count": 0,
        "forks_count": 0,
        "fork": False,
        "html_url": f"https://github.com/octocat/{name}",
        "updated_at": "2026-01-01T00:00:00Z",
        "topics": [],
    }
    base.update(extra)
    return base


def _skills_handler(request: httpx.Request) -> httpx.Response:
    import base64
    import json

    path = request.url.path

    if path == "/users/octocat/repos":
        return httpx.Response(
            200,
            json=[_repo("web"), _repo("forked", fork=True, language="Go")],
        )

    if path == "/repos/octocat/web/languages":
        return httpx.Response(200, json={"JavaScript": 100, "CSS": 20})

    if path == "/repos/octocat/web/contents/package.json":
        manifest = json.dumps({"dependencies": {"react": "^18"}})
        return httpx.Response(
            200, json={"content": base64.b64encode(manifest.encode()).decode()}
        )

    return httpx.Response(404)


async def test_skills_detect_frameworks_and_skip_forks(api, github_mock):
    github_mock(_skills_handler)

    body = (await api.get("/api/github/users/octocat/skills")).json()
    names = {s["name"] for s in body["skills"]}

    assert {"JavaScript", "CSS", "React"} <= names
    assert "Go" not in names
    assert body["total_repositories_analyzed"] == 1


async def test_skills_include_forks_query_param(api, github_mock):
    github_mock(_skills_handler)

    body = (
        await api.get("/api/github/users/octocat/skills?include_forks=true")
    ).json()

    assert "Go" in {s["name"] for s in body["skills"]}


async def test_skills_survive_missing_dependency_files(api, github_mock):
    def handler(request):
        if request.url.path == "/users/octocat/repos":
            return httpx.Response(200, json=[_repo("web")])
        return httpx.Response(500)

    github_mock(handler)

    response = await api.get("/api/github/users/octocat/skills")

    assert response.status_code == 200
    assert response.json()["skills"][0]["name"] == "JavaScript"
