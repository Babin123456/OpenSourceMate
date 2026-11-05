"""
Unit and validation tests for GitHub PR auto-labeler configuration (Issue #175).
Verifies:
1. Syntax and structure of .github/labeler.yml and .github/workflows/labeler.yml.
2. Accurate path matching for frontend, backend, documentation, and devops labels.
3. Edge cases and exclusivity rules.
"""

from pathlib import Path
import re
import pytest
import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
LABELER_CONFIG = REPO_ROOT / ".github" / "labeler.yml"
WORKFLOW_CONFIG = REPO_ROOT / ".github" / "workflows" / "labeler.yml"


def load_yaml(path: Path):
    assert path.exists(), f"Expected config file does not exist: {path}"
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def glob_to_regex(pattern: str) -> re.Pattern:
    """Translates simplified glob patterns into compiled regex for path testing."""
    escaped = re.escape(pattern)
    escaped = escaped.replace(r"\*\*", ".*")
    escaped = escaped.replace(r"\*", "[^/]*")
    return re.compile(f"^{escaped}$")


class TestLabelerConfiguration:
    def test_labeler_yaml_exists_and_is_valid(self):
        data = load_yaml(LABELER_CONFIG)
        assert isinstance(data, dict), "labeler.yml must be a valid mapping dictionary"

        expected_labels = {"frontend", "backend", "documentation", "devops"}
        assert set(data.keys()) >= expected_labels, (
            f"labeler.yml missing one of required labels: {expected_labels}"
        )

    def test_workflow_yaml_exists_and_is_valid(self):
        wf = load_yaml(WORKFLOW_CONFIG)
        assert wf.get("name") == "Pull Request Auto-Labeler"
        assert "pull_request_target" in wf.get("on", {})
        permissions = wf.get("permissions", {})
        assert permissions.get("pull-requests") == "write"
        assert permissions.get("contents") == "read"

        jobs = wf.get("jobs", {})
        assert "labeler" in jobs
        steps = jobs["labeler"].get("steps", [])
        assert any("actions/labeler" in step.get("uses", "") for step in steps)

    def _matches_label(self, label_rules: list, path: str) -> bool:
        for rule in label_rules:
            changed_files = rule.get("changed-files", [])
            for cf in changed_files:
                patterns = cf.get("any-glob-to-any-file", [])
                for pat in patterns:
                    regex = glob_to_regex(pat)
                    if regex.match(path):
                        return True
        return False

    @pytest.mark.parametrize(
        "file_path,expected_label",
        [
            ("frontend/app/page.tsx", "frontend"),
            ("frontend/components/SkillChart.tsx", "frontend"),
            ("frontend/package.json", "frontend"),
            ("frontend/utils/apiClient.ts", "frontend"),
            ("frontend/__tests__/Home.test.tsx", "frontend"),
            ("frontend/public/favicon.ico", "frontend"),
            ("backend/app/main.py", "backend"),
            ("backend/app/api/routes/github.py", "backend"),
            ("backend/app/services/matching_service.py", "backend"),
            ("backend/tests/test_health.py", "backend"),
            ("backend/requirements.txt", "backend"),
            ("backend/Dockerfile", "backend"),
            ("docs/LABELS.md", "documentation"),
            ("README.md", "documentation"),
            ("CONTRIBUTING.md", "documentation"),
            ("ARCHITECTURE.md", "documentation"),
            ("ROADMAP.md", "documentation"),
            (".github/workflows/ci.yml", "devops"),
            (".github/labeler.yml", "devops"),
            (".github/dependabot.yml", "devops"),
            ("Dockerfile", "devops"),
            (".gitignore", "devops"),
        ],
    )
    def test_path_matching(self, file_path: str, expected_label: str):
        data = load_yaml(LABELER_CONFIG)
        assert expected_label in data, f"Missing label {expected_label} in config"
        label_rules = data[expected_label]
        assert self._matches_label(label_rules, file_path), (
            f"Path '{file_path}' did not match expected label '{expected_label}'"
        )

    def test_frontend_does_not_label_pure_backend(self):
        data = load_yaml(LABELER_CONFIG)
        backend_file = "backend/app/main.py"
        assert not self._matches_label(data["frontend"], backend_file)

    def test_backend_does_not_label_pure_frontend(self):
        data = load_yaml(LABELER_CONFIG)
        frontend_file = "frontend/app/page.tsx"
        assert not self._matches_label(data["backend"], frontend_file)

    def test_devops_does_not_label_source_code(self):
        data = load_yaml(LABELER_CONFIG)
        assert not self._matches_label(data["devops"], "frontend/app/page.tsx")
        assert not self._matches_label(data["devops"], "backend/app/main.py")


    def test_markdown_documentation_paths_match_documentation_label(self):
        data = load_yaml(LABELER_CONFIG)
        doc_paths = [
            "docs/auto-labeler.md",
            "docs/mock-api.md",
            "docs/profile-comparison.md",
            "docs/recent-searches.md",
            "docs/recommended-issues-ui.md",
            "docs/refresh-analysis-and-timestamp.md",
            "docs/service-unavailable-banner.md",
            "docs/skill-chart-component.md",
            "docs/skill-proficiency-indicator.md",
            "docs/skills-to-learn.md",
            "docs/typed-api-client.md",
            "docs/typescript-strict-mode.md",
            "SECURITY.md",
            "FIRST_CONTRIBUTION.md",
            "CODE_OF_CONDUCT.md",
            ".github/PULL_REQUEST_TEMPLATE.md",
        ]
        for path in doc_paths:
            assert self._matches_label(data["documentation"], path), (
                f"Expected documentation label for {path}"
            )

    def test_subfolder_component_paths_match_frontend_label(self):
        data = load_yaml(LABELER_CONFIG)
        frontend_paths = [
            "frontend/app/compare/page.tsx",
            "frontend/components/ComparisonCard.tsx",
            "frontend/components/ExportMenu.tsx",
            "frontend/components/ProfileCard.tsx",
            "frontend/components/RecentSearches.tsx",
            "frontend/components/RecommendedIssues.tsx",
            "frontend/components/SkillChart.tsx",
            "frontend/components/SkillProficiencyBadge.tsx",
            "frontend/data/mockIssues.ts",
            "frontend/mocks/browser.ts",
            "frontend/mocks/server.ts",
            "frontend/utils/comparisonEngine.ts",
        ]
        for path in frontend_paths:
            assert self._matches_label(data["frontend"], path), (
                f"Expected frontend label for {path}"
            )
