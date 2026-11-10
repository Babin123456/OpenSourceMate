import type { RepositoryItem } from "../../types/api";
import reposStandardJson from "../../../fixtures/repositories/repos_standard.json";
import reposEmptyJson from "../../../fixtures/repositories/repos_empty.json";
import reposForksOnlyJson from "../../../fixtures/repositories/repos_forks_only.json";
import reposLargeJson from "../../../fixtures/repositories/repos_large.json";
import reposPage1Json from "../../../fixtures/repositories/repos_paginated_page1.json";
import reposPage2Json from "../../../fixtures/repositories/repos_paginated_page2.json";

export interface RawGitHubRepoFixture {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string | null;
}

/**
 * Adapts a raw sanitized GitHub REST API repository fixture into RepositoryItem.
 */
export function adaptRawRepositoryFixture(raw: RawGitHubRepoFixture): RepositoryItem {
  return {
    name: raw.name,
    description: raw.description,
    language: raw.language,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    is_fork: raw.fork,
    url: raw.html_url,
    updated_at: raw.updated_at ?? "2026-01-01T00:00:00Z",
  };
}

export const SHARED_REPOSITORY_FIXTURES = {
  standard: (reposStandardJson as RawGitHubRepoFixture[]).map(adaptRawRepositoryFixture),
  empty: (reposEmptyJson as RawGitHubRepoFixture[]).map(adaptRawRepositoryFixture),
  forksOnly: (reposForksOnlyJson as RawGitHubRepoFixture[]).map(adaptRawRepositoryFixture),
  large: (reposLargeJson as RawGitHubRepoFixture[]).map(adaptRawRepositoryFixture),
  paginatedPage1: (reposPage1Json as RawGitHubRepoFixture[]).map(adaptRawRepositoryFixture),
  paginatedPage2: (reposPage2Json as RawGitHubRepoFixture[]).map(adaptRawRepositoryFixture),
};

export const MOCK_REPOSITORIES: Record<string, RepositoryItem[]> = {
  // Legacy preset preserved for existing mockApi.test.ts expectations
  octocat: [
    {
      name: "Spoon-Knife",
      description: "This repo is for demonstration purposes only.",
      url: "https://github.com/octocat/Spoon-Knife",
      language: "HTML",
      stars: 14200,
      forks: 145000,
      is_fork: false,
      updated_at: "2026-10-25T14:00:00Z",
    },
    {
      name: "Hello-World",
      description: "My first repository on GitHub!",
      url: "https://github.com/octocat/Hello-World",
      language: "Ruby",
      stars: 2500,
      forks: 2200,
      is_fork: false,
      updated_at: "2026-10-20T10:30:00Z",
    },
    {
      name: "octocat.github.io",
      description: "The Octocat personal blog and documentation.",
      url: "https://github.com/octocat/octocat.github.io",
      language: "CSS",
      stars: 890,
      forks: 430,
      is_fork: false,
      updated_at: "2026-10-18T09:15:00Z",
    },
  ],
  "octocat-real": SHARED_REPOSITORY_FIXTURES.standard,
  torvalds: [
    ...SHARED_REPOSITORY_FIXTURES.paginatedPage1,
    ...SHARED_REPOSITORY_FIXTURES.paginatedPage2,
  ],
  gaearon: SHARED_REPOSITORY_FIXTURES.large,
  "newbie-contributor": SHARED_REPOSITORY_FIXTURES.empty,
  "forks-only-dev": SHARED_REPOSITORY_FIXTURES.forksOnly,
};

export function generateMockRepositories(username: string): RepositoryItem[] {
  const normalized = username.toLowerCase().trim();
  const matched = MOCK_REPOSITORIES[normalized];
  if (matched) {
    return matched;
  }

  return [
    {
      name: `${username}-web-app`,
      description: `Modern web application authored by ${username}`,
      url: `https://github.com/${username}/${username}-web-app`,
      language: "TypeScript",
      stars: 28,
      forks: 6,
      is_fork: false,
      updated_at: "2026-10-28T16:00:00Z",
    },
    {
      name: "api-service",
      description: "High-performance REST & WebSocket API backend",
      url: `https://github.com/${username}/api-service`,
      language: "Python",
      stars: 15,
      forks: 2,
      is_fork: false,
      updated_at: "2026-10-24T11:45:00Z",
    },
    {
      name: "dotfiles",
      description: "Developer environment configurations and shell scripts",
      url: `https://github.com/${username}/dotfiles`,
      language: "Shell",
      stars: 4,
      forks: 1,
      is_fork: false,
      updated_at: "2026-10-10T08:00:00Z",
    },
  ];
}
