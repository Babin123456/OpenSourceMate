import pytest
from app.services.github_service import parse_github_link_header, _dependencies_from_manifest
from app.services.matching_service import _tokens, _skill_entries
from app.services.skill_service import resolve_group_for_skill, is_noise_language


def test_type_contract_tokens_handles_optional_strings():
    assert _tokens(None) == []
    assert _tokens("React, TypeScript & Python!") == ["react", "typescript", "python"]


def test_type_contract_skill_entries_dicts_and_primitives():
    mixed_input = [
        {"name": "Python", "weight": 2.5},
        "TypeScript",
        {"name": "Docker"},
    ]
    entries = _skill_entries(mixed_input)
    assert entries["python"] == 2.5
    assert entries["typescript"] == 1.0
    assert entries["docker"] == 1.0


def test_type_contract_parse_link_header():
    assert parse_github_link_header(None) == {}
    sample_header = (
        '<https://api.github.com/users/octocat/repos?page=2>; rel="next", '
        '<https://api.github.com/users/octocat/repos?page=5>; rel="last"'
    )
    links = parse_github_link_header(sample_header)
    assert links.get("next") == "https://api.github.com/users/octocat/repos?page=2"
    assert links.get("last") == "https://api.github.com/users/octocat/repos?page=5"


def test_type_contract_manifest_dependencies_parser():
    package_json = '{"dependencies": {"react": "^18.0", "next": "^14.0"}, "devDependencies": {"typescript": "^5.0"}}'
    deps = _dependencies_from_manifest("package.json", package_json)
    assert "react" in deps
    assert "next" in deps
    assert "typescript" in deps

    reqs = "fastapi>=0.100.0\nuvicorn\n# comment\npydantic==2.0\n"
    py_deps = _dependencies_from_manifest("requirements.txt", reqs)
    assert "fastapi" in py_deps
    assert "uvicorn" in py_deps
    assert "pydantic" in py_deps
