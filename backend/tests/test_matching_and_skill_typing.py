from typing import Any
import pytest
from app.services.issue_service import search_github_issues
from app.services.skill_service import calculate_proficiency, resolve_group_for_skill, is_noise_language
from app.services.matching_service import calculate_issue_score, build_idf


def test_calculate_proficiency_types():
    level, score, reason = calculate_proficiency(5, 45.0, "2026-05-01T00:00:00Z", "Python")
    assert isinstance(level, str)
    assert isinstance(score, (int, float))
    assert isinstance(reason, str)
    assert level in {"Learning", "Comfortable", "Strong"}


def test_skill_resolution_types():
    assert resolve_group_for_skill("HTML") == "Web"
    assert resolve_group_for_skill("CSS") == "Web"
    assert resolve_group_for_skill("nonexistent_unknown_tech") is None


def test_is_noise_language_types():
    assert is_noise_language("Dockerfile") is True
    assert is_noise_language("Makefile") is True
    assert is_noise_language("Jupyter Notebook") is True
    assert is_noise_language("Python") is False


def test_build_idf_types():
    issues: list[dict[str, Any]] = [
        {"title": "Fix bug in Python", "repository": "owner/repo", "labels": ["python"], "body": "details"},
        {"title": "TypeScript refactor", "repository": "owner/repo2", "labels": ["typescript"], "body": "details"},
    ]
    user_skills = ["Python", "TypeScript", "Docker"]
    idf = build_idf(issues, user_skills)
    assert isinstance(idf, dict)
    assert "python" in idf
    assert isinstance(idf["python"], float)


def test_calculate_issue_score_types():
    issue: dict[str, Any] = {
        "title": "Add FastAPI endpoint",
        "repository": "owner/fastapi-app",
        "labels": ["fastapi", "good first issue"],
        "body": "Help wanted on this issue",
        "created_at": "2026-10-01T00:00:00Z",
    }
    user_skills = ["FastAPI", "Python"]
    idf = {"fastapi": 1.5, "python": 1.2}
    result = calculate_issue_score(issue, user_skills, idf)
    assert isinstance(result, dict)
    assert "score" in result
    assert isinstance(result["score"], (int, float))
    assert "matched_skills" in result
    assert isinstance(result["matched_skills"], list)
    assert "reasons" in result
    assert isinstance(result["reasons"], list)
