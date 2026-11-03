import type { RepositoryItem } from "../../types/api";

export const MOCK_REPOSITORIES: Record<string, RepositoryItem[]> = {
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
  torvalds: [
    {
      name: "linux",
      description: "Linux kernel source tree",
      url: "https://github.com/torvalds/linux",
      language: "C",
      stars: 195000,
      forks: 54000,
      is_fork: false,
      updated_at: "2026-10-31T20:00:00Z",
    },
    {
      name: "subsurface-for-dirk",
      description: "Subsurface divelog source repository for Dirk",
      url: "https://github.com/torvalds/subsurface-for-dirk",
      language: "C",
      stars: 450,
      forks: 95,
      is_fork: false,
      updated_at: "2026-10-15T12:00:00Z",
    },
  ],
};

export function generateMockRepositories(username: string): RepositoryItem[] {
  const normalized = username.toLowerCase().trim();
  if (MOCK_REPOSITORIES[normalized]) {
    return MOCK_REPOSITORIES[normalized];
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
