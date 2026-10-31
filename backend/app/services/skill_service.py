import json
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path

SKILL_MAPPINGS_FILE = (
    Path(__file__).resolve().parent.parent / "data" / "skill_mappings.json"
)

# Topic -> skill name. Topics come back with the repo list, so they cost no extra request.
TOPIC_SKILLS = {
    "react": "React",
    "reactjs": "React",
    "nextjs": "Next.js",
    "next-js": "Next.js",
    "vue": "Vue",
    "vuejs": "Vue",
    "angular": "Angular",
    "svelte": "Svelte",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "express": "Express",
    "nodejs": "Node.js",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "machine-learning": "Machine Learning",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "flutter": "Flutter",
    "react-native": "React Native",
    "tailwindcss": "Tailwind CSS",
    "graphql": "GraphQL",
}

# Dependency (lower case package name) -> skill name, for package.json and Python manifests.
DEPENDENCY_SKILLS = {
    "react": "React",
    "next": "Next.js",
    "vue": "Vue",
    "@angular/core": "Angular",
    "svelte": "Svelte",
    "express": "Express",
    "tailwindcss": "Tailwind CSS",
    "react-native": "React Native",
    "graphql": "GraphQL",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "torch": "PyTorch",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "scikit-learn": "scikit-learn",
    "pandas": "pandas",
    "numpy": "NumPy",
}


@lru_cache(maxsize=1)
def load_skill_mappings() -> dict:
    """Load configurable technology groups and noise language ignore list from JSON data file (Issue #130).

    Contributors can modify or extend `app/data/skill_mappings.json` without modifying Python code.
    """
    if SKILL_MAPPINGS_FILE.exists():
        try:
            with open(SKILL_MAPPINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    return {
        "ignore_languages": [
            "Jupyter Notebook",
            "Dockerfile",
            "Makefile",
            "CMake",
            "TeX",
            "Roff",
            "PostScript",
            "Rich Text Format",
            "Gettext Catalog",
            "Vim Script",
            "Batchfile",
        ],
        "groups": {
            "Web": ["HTML", "CSS", "SCSS", "Sass", "Less"],
            "JavaScript / TypeScript": ["JavaScript", "TypeScript"],
            "C / C++": ["C", "C++"],
            "JVM Ecosystem": ["Java", "Scala", "Groovy", "Clojure"],
            "Mobile Development": ["Swift", "Kotlin", "Dart", "Objective-C"],
            "Systems & Embedded": ["Rust", "Zig"],
            "Cloud & Infrastructure": ["HCL", "Terraform", "Puppet", "Chef"],
        },
        "descriptions": {},
    }


def get_ignore_languages() -> set[str]:
    """Return lowercase set of languages classified as noise, markup documentation, or generated files."""
    mappings = load_skill_mappings()
    return {lang.lower() for lang in mappings.get("ignore_languages", [])}


def is_noise_language(language: str | None) -> bool:
    """Check if a language is in the configured noise ignore list."""
    if not language:
        return False
    return language.strip().lower() in get_ignore_languages()


def get_group_mappings() -> dict[str, str]:
    """Return mapping of lowercase language/skill name to its canonical group name."""
    mappings = load_skill_mappings()
    group_map = {}
    for group_name, members in mappings.get("groups", {}).items():
        for member in members:
            group_map[member.lower()] = group_name
    return group_map


def resolve_group_for_skill(skill_name: str | None) -> str | None:
    """Resolve the technology group or ecosystem for a given skill name, if mapped."""
    if not skill_name:
        return None
    return get_group_mappings().get(skill_name.strip().lower())


def _is_fork(repository: dict) -> bool:
    return bool(repository.get("fork"))


def analyze_skills(
    repositories: list[dict],
    include_forks: bool = False,
    repo_details: dict[str, dict] | None = None,
    ignore_noise: bool = True,
    group_related: bool = False,
) -> dict:
    """Build a skill list from a user's repositories with noise filtering and grouping (Issue #130).

    repo_details maps a repo full_name to optional extra data fetched separately:
    {"languages": {"Python": 1234}, "dependencies": ["react", "next"]}.
    Missing details are fine, the repo then only contributes its main language and topics.

    Parameters:
    - repositories: List of raw repository dictionaries from GitHub API.
    - include_forks: Whether to include forked repositories in skill extraction.
    - repo_details: Extra repository data (languages byte counts, dependencies).
    - ignore_noise: Exclude generated/non-skill languages (e.g. Jupyter Notebook, Dockerfile, Makefile).
    - group_related: If True, consolidates related technologies (e.g. HTML + CSS -> Web) into
      ecosystem skills with constituent subskills list. If False, retains individual skills
      and annotates each with its corresponding group.
    """
    repo_details = repo_details or {}
    analyzed = [r for r in repositories if include_forks or not _is_fork(r)]

    languages = Counter()
    frameworks = Counter()

    # Track distinct repository occurrences per group to avoid double-counting
    group_repo_counts = Counter()
    group_subskills = defaultdict(set)
    active_groups = defaultdict(list)

    for repository in analyzed:
        details = repo_details.get(repository.get("full_name") or "", {})
        repo_languages = details.get("languages") or {}

        # /languages knows about every language in the repo, not just the main one.
        current_repo_languages = set()
        if repo_languages:
            for language in repo_languages:
                if ignore_noise and is_noise_language(language):
                    continue
                languages[language] += 1
                current_repo_languages.add(language)
        elif repository.get("language"):
            lang = repository["language"]
            if not (ignore_noise and is_noise_language(lang)):
                languages[lang] += 1
                current_repo_languages.add(lang)

        repo_skills = set()

        for dependency in details.get("dependencies") or []:
            skill = DEPENDENCY_SKILLS.get(str(dependency).lower())
            if skill:
                repo_skills.add(skill)

        for topic in repository.get("topics") or []:
            skill = TOPIC_SKILLS.get(str(topic).lower())
            if skill:
                repo_skills.add(skill)

        # A repo counts once per skill, even if both a dependency and a topic point at it.
        for skill in repo_skills:
            frameworks[skill] += 1

        # Track groups present in this repository
        repo_groups_seen = set()
        for lang in current_repo_languages:
            grp = resolve_group_for_skill(lang)
            if grp:
                repo_groups_seen.add(grp)
                group_subskills[grp].add(lang)

        for skill in repo_skills:
            grp = resolve_group_for_skill(skill)
            if grp:
                repo_groups_seen.add(grp)
                group_subskills[grp].add(skill)

        for grp in repo_groups_seen:
            group_repo_counts[grp] += 1

    # Build active group dictionary for metadata
    for grp, members in group_subskills.items():
        active_groups[grp] = sorted(list(members))

    language_total = sum(languages.values())
    skills = []

    if group_related:
        # Grouped Mode: Replace constituent member languages with their consolidated group
        consumed_languages = set()
        consumed_frameworks = set()

        for grp, count in group_repo_counts.most_common():
            subskills_list = sorted(list(group_subskills[grp]))
            for sub in subskills_list:
                consumed_languages.add(sub.lower())
                consumed_frameworks.add(sub.lower())

            pct = round((count / len(analyzed)) * 100, 2) if analyzed else 0.0
            skills.append(
                {
                    "name": grp,
                    "type": "ecosystem",
                    "repository_count": count,
                    "percentage": pct,
                    "group": grp,
                    "subskills": subskills_list,
                }
            )

        # Append standalone languages that do not belong to any grouped ecosystem
        for name, count in languages.most_common():
            if name.lower() not in consumed_languages:
                pct = round((count / language_total) * 100, 2) if language_total else 0.0
                skills.append(
                    {
                        "name": name,
                        "type": "language",
                        "repository_count": count,
                        "percentage": pct,
                        "group": None,
                    }
                )

        # Append standalone frameworks that do not belong to any grouped ecosystem
        for name, count in frameworks.most_common():
            if name.lower() not in consumed_frameworks:
                pct = round((count / len(analyzed)) * 100, 2) if analyzed else 0.0
                skills.append(
                    {
                        "name": name,
                        "type": "framework",
                        "repository_count": count,
                        "percentage": pct,
                        "group": None,
                    }
                )
    else:
        # Standard Mode (Default): Retain fine-grained skills and annotate each with group
        for name, count in languages.most_common():
            pct = round((count / language_total) * 100, 2) if language_total else 0.0
            skills.append(
                {
                    "name": name,
                    "type": "language",
                    "repository_count": count,
                    "percentage": pct,
                    "group": resolve_group_for_skill(name),
                }
            )

        for name, count in frameworks.most_common():
            pct = round((count / len(analyzed)) * 100, 2) if analyzed else 0.0
            skills.append(
                {
                    "name": name,
                    "type": "framework",
                    "repository_count": count,
                    "percentage": pct,
                    "group": resolve_group_for_skill(name),
                }
            )

    max_count = max((s["repository_count"] for s in skills), default=0)

    for skill in skills:
        skill["weight"] = (
            round(skill["repository_count"] / max_count, 2) if max_count > 0 else 0.0
        )

    return {
        "skills": skills,
        "total_repositories_analyzed": len(analyzed),
        "groups": dict(active_groups) if active_groups else None,
    }
