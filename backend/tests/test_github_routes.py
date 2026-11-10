from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app
from tests.fixture_loader import load_fixture

client = TestClient(app)

USER = load_fixture("users/user_standard.json")


def patch_user(value):
    return patch("app.api.routes.github.get_github_user", AsyncMock(return_value=value))


def patch_repos(value):
    return patch(
        "app.api.routes.github.get_user_repositories",
        AsyncMock(return_value=value),
    )


def patch_repo_details(value):
    return patch(
        "app.api.routes.github.get_repository_details",
        AsyncMock(return_value=value),
    )


def test_health():
    assert client.get("/api/health").json()["status"] == "healthy"


def test_get_user_valid():
    with patch_user(USER):
        response = client.get(f"/api/github/users/{USER['login']}")
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == USER["login"]
    assert body["name"] == USER["name"]
    assert body["bio"] == USER["bio"]
    assert body["avatar_url"] == USER["avatar_url"]
    assert body["public_repositories"] == USER["public_repos"]
    assert body["followers"] == USER["followers"]
    assert body["following"] == USER["following"]
    assert body["profile_url"] == USER["html_url"]
    assert body["location"] == USER["location"]
    assert body["company"] == USER["company"]
    assert body["blog"] == USER["blog"]
    assert body["twitter_username"] == USER["twitter_username"]
    assert body["created_at"] == USER["created_at"]
    assert body["public_gists"] == USER["public_gists"]


def test_get_user_sparse_profile():
    user_no_bio = load_fixture("users/user_no_bio.json")
    sparse_user = {
        **user_no_bio,
        "name": None,
        "location": None,
        "company": None,
    }
    with patch_user(sparse_user):
        response = client.get(f"/api/github/users/{sparse_user['login']}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == sparse_user["login"]
    assert data["name"] is None
    assert data["bio"] is None
    assert data["location"] is None
    assert data["company"] is None
    assert data["blog"] is None
    assert data["twitter_username"] is None
    assert data["created_at"] == user_no_bio["created_at"]
    assert data["public_gists"] == user_no_bio["public_gists"]


def test_get_user_no_bio_fixture():
    user_no_bio = load_fixture("users/user_no_bio.json")
    with patch_user(user_no_bio):
        response = client.get(f"/api/github/users/{user_no_bio['login']}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "torvalds"
    assert data["name"] == "Linus Torvalds"
    assert data["bio"] is None
    assert data["location"] == "Portland, OR"
    assert data["company"] == "Linux Foundation"
    assert data["blog"] is None
    assert data["twitter_username"] is None
    assert data["created_at"] == user_no_bio["created_at"]
    assert data["public_gists"] == user_no_bio["public_gists"]


def test_get_user_missing_optional_keys():
    bare_user = {
        "login": "barebones",
        "avatar_url": "https://example.com/b.png",
        "public_repos": 1,
        "followers": 0,
        "following": 0,
        "html_url": "https://github.com/barebones",
    }
    with patch_user(bare_user):
        response = client.get("/api/github/users/barebones")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "barebones"
    assert data["name"] is None
    assert data["bio"] is None
    assert data["location"] is None
    assert data["company"] is None
    assert data["blog"] is None
    assert data["twitter_username"] is None
    assert data["created_at"] is None
    assert data["public_gists"] == 0


def test_get_user_not_found():
    with patch_user(None):
        response = client.get("/api/github/users/ghost")
    assert response.status_code == 404
    assert response.json()["detail"] == "GitHub user not found"


def test_get_repositories_valid_with_fork_and_no_language():
    repos = load_fixture("repositories/repos_standard.json")
    with patch_repos(repos):
        response = client.get("/api/github/users/octocat/repositories")
    body = response.json()
    assert response.status_code == 200
    assert body["repository_count"] == 8
    assert body["repositories"][1]["name"] == "Spoon-Knife"
    assert body["repositories"][1]["language"] == "HTML"
    assert body["repositories"][1]["is_fork"] is False
    assert body["repositories"][5]["name"] == "boysenberry-repo-1"
    assert body["repositories"][5]["is_fork"] is True
    assert body["repositories"][5]["language"] is None


def test_get_repositories_zero():
    empty_repos = load_fixture("repositories/repos_empty.json")
    with patch_repos(empty_repos):
        response = client.get("/api/github/users/octocat/repositories")
    assert response.status_code == 200
    assert response.json()["repository_count"] == 0
    assert response.json()["repositories"] == []


def test_get_repositories_not_found():
    with patch_repos(None):
        response = client.get("/api/github/users/ghost/repositories")
    assert response.status_code == 404


def test_skills_valid():
    template_repo = load_fixture("repositories/repos_standard.json")[1]
    repos = [
        {**template_repo, "name": "a", "language": "Python", "fork": False},
        {**template_repo, "name": "b", "language": "Python", "fork": False},
        {**template_repo, "name": "c", "language": "Go", "fork": False},
    ]
    with patch_repos(repos), patch_repo_details({}):
        response = client.get("/api/github/users/octocat/skills")
    body = response.json()
    assert response.status_code == 200
    assert body["username"] == "octocat"
    assert body["total_repositories_analyzed"] == 3
    # type, weight, and proficiency indicators are additive fields; the original keys are unchanged.
    skill_0 = body["skills"][0]
    assert skill_0["name"] == "Python"
    assert skill_0["repository_count"] == 2
    assert skill_0["percentage"] == 66.67
    assert skill_0["type"] == "language"
    assert skill_0["weight"] == 1.0
    assert skill_0["proficiency"] in ("Learning", "Comfortable", "Strong")
    assert isinstance(skill_0["proficiency_score"], float)
    assert "Estimated as" in skill_0["proficiency_reason"]


def test_skills_valid_with_shared_fixtures():
    repos = load_fixture("repositories/repos_large.json")[:6]
    details = {
        repos[0]["full_name"]: {
            "languages": load_fixture("languages/languages_multi.json"),
            "dependencies": [],
        }
    }
    with patch_repos(repos), patch_repo_details(details):
        response = client.get("/api/github/users/gaearon/skills")
    body = response.json()
    assert response.status_code == 200
    assert body["username"] == "gaearon"
    assert body["total_repositories_analyzed"] == 6

    skills_by_name = {skill["name"]: skill for skill in body["skills"]}
    assert "Makefile" not in skills_by_name

    top_skill = body["skills"][0]
    assert top_skill["name"] == "JavaScript"
    assert top_skill["repository_count"] == 4
    assert top_skill["percentage"] == 40.0
    assert top_skill["type"] == "language"
    assert top_skill["weight"] == 1.0

    assert skills_by_name["TypeScript"]["repository_count"] == 3
    assert skills_by_name["TypeScript"]["percentage"] == 30.0
    assert skills_by_name["Python"]["repository_count"] == 1
    assert skills_by_name["Python"]["percentage"] == 10.0


def test_skills_zero_repos():
    empty_repos = load_fixture("repositories/repos_empty.json")
    with patch_repos(empty_repos), patch_repo_details({}):
        response = client.get("/api/github/users/newbie-contributor/skills")
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "newbie-contributor"
    assert body["skills"] == []
    assert body["total_repositories_analyzed"] == 0


def test_skills_all_languages_none():
    repos = [
        r
        for r in load_fixture("repositories/repos_standard.json")
        if r["language"] is None and not r["fork"]
    ]
    with patch_repos(repos), patch_repo_details({}):
        response = client.get("/api/github/users/octocat/skills")
    assert response.json()["skills"] == []
    assert response.json()["total_repositories_analyzed"] == len(repos)


def test_skills_not_found():
    with patch_repos(None):
        response = client.get("/api/github/users/ghost/skills")
    assert response.status_code == 404


def test_get_user_no_repos_fixture():
    user_no_repos = load_fixture("users/user_no_repos.json")
    with patch_user(user_no_repos):
        response = client.get(f"/api/github/users/{user_no_repos['login']}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newbie-contributor"
    assert data["public_repositories"] == 0


def test_get_user_and_large_repositories_fixture():
    user_many = load_fixture("users/user_many_repos.json")
    repos_large = load_fixture("repositories/repos_large.json")
    with patch_user(user_many):
        user_res = client.get(f"/api/github/users/{user_many['login']}")
    with patch_repos(repos_large):
        repo_res = client.get(f"/api/github/users/{user_many['login']}/repositories")
    assert user_res.status_code == 200
    assert user_res.json()["public_repositories"] == user_many["public_repos"]
    assert repo_res.status_code == 200
    assert repo_res.json()["repository_count"] == len(repos_large)


def test_skills_forks_only_excluded_by_default_and_included_when_requested():
    forks_only = load_fixture("repositories/repos_forks_only.json")
    with patch_repos(forks_only), patch_repo_details({}):
        excluded = client.get("/api/github/users/forks-only-dev/skills")
        included = client.get(
            "/api/github/users/forks-only-dev/skills?include_forks=true"
        )
    assert excluded.status_code == 200
    assert excluded.json()["total_repositories_analyzed"] == 0
    assert excluded.json()["skills"] == []
    assert included.status_code == 200
    assert included.json()["total_repositories_analyzed"] == len(forks_only)
    assert {s["name"] for s in included.json()["skills"]} >= {"Python", "TypeScript"}
