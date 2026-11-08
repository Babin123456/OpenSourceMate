# Pull Request Auto-Labeler Guide

## Overview

In accordance with **Issue #175**, OpenSourceMate employs GitHub's official [`actions/labeler@v5`](https://github.com/actions/labeler) action to automatically categorize and label incoming pull requests based on the paths of files changed.

This workflow accelerates PR triage, helps maintainers identify review areas immediately, and provides contributors with clear feedback on which parts of the codebase their PR affects.

---

## 1. Supported Area Labels

The auto-labeler defines rules for four primary domain areas:

| Label | Description | Path Patterns Covered |
| :--- | :--- | :--- |
| `frontend` | User interface, styling, client-side logic, and frontend test suites | `frontend/**`, `frontend/package.json`, `frontend/tsconfig.json`, `frontend/__tests__/**` |
| `backend` | FastAPI server logic, REST routes, services, schemas, and python test suites | `backend/**`, `backend/app/**`, `backend/tests/**`, `backend/requirements.txt`, `backend/Dockerfile` |
| `documentation` | Guides, specifications, architecture documentation, and issue/PR templates | `docs/**`, `*.md`, `README.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `.github/PULL_REQUEST_TEMPLATE.md` |
| `devops` | CI/CD pipelines, container files, configuration files, Git and repository configs | `.github/workflows/**`, `.github/labeler.yml`, `.github/dependabot.yml`, `Dockerfile*`, `.gitignore` |

---

## 2. Configuration Structure

### A. Labeler Configuration (`.github/labeler.yml`)
Uses the modern `actions/labeler@v5` syntax with `changed-files` and `any-glob-to-any-file`:

```yaml
frontend:
  - changed-files:
      - any-glob-to-any-file:
          - 'frontend/**'
          - 'frontend/package.json'

backend:
  - changed-files:
      - any-glob-to-any-file:
          - 'backend/**'
          - 'backend/requirements.txt'

documentation:
  - changed-files:
      - any-glob-to-any-file:
          - 'docs/**'
          - '*.md'
          - '**/*.md'

devops:
  - changed-files:
      - any-glob-to-any-file:
          - '.github/**'
          - 'Dockerfile*'
          - '.gitignore'
```

### B. Workflow Definition (`.github/workflows/labeler.yml`)
Triggers on `pull_request_target` events to safely access labels on PRs from forks:

```yaml
name: "Pull Request Auto-Labeler"

on:
  pull_request_target:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write

jobs:
  labeler:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          configuration-path: ".github/labeler.yml"
          sync-labels: false
```

---

## 3. Best Practices for Contributors

1. **Focused PRs**: Try to keep PRs focused on a single area (e.g., just `frontend` or just `backend`). If your feature spans both, the auto-labeler will correctly attach both labels.
2. **Draft PRs**: Draft PRs are skipped by default until marked "Ready for review" to keep notifications clean for area reviewers.
3. **Manual Labels**: Additional triage labels (like difficulty `beginner`, `intermediate`) can still be manually added by maintainers as detailed in [docs/LABELS.md](LABELS.md).

---

## 4. Automated Testing

The auto-labeler configuration is validated by unit tests in `backend/tests/test_labeler_workflow.py`. Run:

```bash
pytest backend/tests/test_labeler_workflow.py -v
```


## 5. Troubleshooting & FAQ

### Why didn't my PR receive a label?
- **Draft Status**: The workflow skips draft pull requests by default. Convert your PR from a draft to "Ready for review" to trigger the auto-labeler.
- **Root-level files**: If your PR only changes files at the repository root that are not matched by explicit globs (e.g. newly added root script files), please ping a maintainer or add the glob to `.github/labeler.yml`.

### Can I manually add or remove labels?
Yes. Project maintainers and triagers have full write permissions to adjust labels as needed.
The `sync-labels: false` setting ensures that any custom labels added manually are never removed when new commits are pushed.

### Adding New Labels
To add a new label (for example, `ai-ml`):
1. Update `.github/labeler.yml` with the label name and glob rules.
2. Add corresponding test assertions in `backend/tests/test_labeler_workflow.py`.
3. Document the new label in `docs/LABELS.md`.
