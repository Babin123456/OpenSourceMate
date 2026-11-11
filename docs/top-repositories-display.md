# Top Repositories Display and Signal Extraction

## Overview
This document specifies the architecture and implementation for surfacing a developer's top repositories by stars and recent activity (Issue #85).

While skill aggregation evaluates languages and framework frequencies across a profile, deeper matching signals require identifying:
1. **Showcase Projects**: High-impact repositories with developer adoption (measured by stargazers and forks).
2. **Current Focus**: Recently pushed/updated repositories indicating current active technical interests.

## Backend Endpoint: `GET /api/v1/github/users/{username}/top-repositories`

### Query Parameters
- `exclude_forks: bool` (default: `true`): Excludes forked repositories from top lists.
- `refresh: bool` (default: `false`): Bypasses local TTL cache and queries upstream GitHub API.

### Response Shape
```json
{
  "username": "octocat",
  "exclude_forks": true,
  "top_by_stars": [
    {
      "name": "Spoon-Knife",
      "description": "This repo's purpose is to be forked.",
      "language": "HTML",
      "stars": 12400,
      "forks": 14100,
      "is_fork": false,
      "url": "https://github.com/octocat/Spoon-Knife",
      "updated_at": "2026-03-01T12:00:00Z"
    }
  ],
  "most_recent": [
    {
      "name": "Hello-World",
      "description": "My first repository on GitHub!",
      "language": "TypeScript",
      "stars": 2400,
      "forks": 1800,
      "is_fork": false,
      "url": "https://github.com/octocat/Hello-World",
      "updated_at": "2026-11-01T08:30:00Z"
    }
  ]
}
```

## Frontend Component: `TopRepositoriesDisplay`
Located at `frontend/components/TopRepositoriesDisplay.tsx`:
- Provides tab navigation between **Top Starred** and **Recently Active**.
- Offers an interactive checkbox to include/exclude forked repositories in real time.
- Renders responsive cards highlighting repository name, description, primary language badge, star count, and formatted last-updated date.
- Fully compatible with light and dark themes.

## Test Verification
- **Backend Tests**: `backend/tests/test_top_repositories.py` (sorting by stars, sorting by recency, fork exclusion, and 404 handling).
- **Frontend Tests**: `frontend/__tests__/TopRepositoriesDisplay.test.tsx` (rendering, tab switching, and fork toggling).
