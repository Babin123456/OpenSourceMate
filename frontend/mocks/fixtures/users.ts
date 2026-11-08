import type { GitHubUserProfile } from "../../types/api";

export const MOCK_USERS: Record<string, GitHubUserProfile> = {
  octocat: {
    username: "octocat",
    name: "The Octocat",
    bio: "Building the future of open source collaboration.",
    avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
    public_repositories: 8,
    followers: 12500,
    following: 9,
    profile_url: "https://github.com/octocat",
    company: "@github",
    location: "San Francisco, CA",
    blog: "https://github.blog",
    twitter_username: "github",
    public_gists: 4,
    created_at: "2011-01-25T18:44:36Z",
  },
  torvalds: {
    username: "torvalds",
    name: "Linus Torvalds",
    bio: "Creator of Linux and Git.",
    avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
    public_repositories: 7,
    followers: 215000,
    following: 0,
    profile_url: "https://github.com/torvalds",
    company: "Linux Foundation",
    location: "Portland, OR",
    blog: null,
    twitter_username: null,
    public_gists: 0,
    created_at: "2011-09-03T15:26:22Z",
  },
  gaearon: {
    username: "gaearon",
    name: "Dan Abramov",
    bio: "Co-author of Redux and Create React App.",
    avatar_url: "https://avatars.githubusercontent.com/u/810438?v=4",
    public_repositories: 260,
    followers: 86000,
    following: 172,
    profile_url: "https://github.com/gaearon",
    company: "@bluesky",
    location: "London, UK",
    blog: "https://overreacted.io",
    twitter_username: "dan_abramov",
    public_gists: 78,
    created_at: "2011-05-25T18:18:31Z",
  },
  alice: {
    username: "alice",
    name: "Alice Developer",
    bio: "Full stack TypeScript & Python engineer. Open source contributor.",
    avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    public_repositories: 32,
    followers: 450,
    following: 80,
    profile_url: "https://github.com/alice",
    company: "Independent",
    location: "Berlin, Germany",
    blog: "https://example.dev",
    twitter_username: "alice_codes",
    public_gists: 12,
    created_at: "2015-03-10T11:00:00Z",
  },
};

/**
 * Generates a realistic mock profile for any requested username.
 */
export function generateMockUserProfile(username: string): GitHubUserProfile {
  const normalized = username.toLowerCase().trim();
  if (MOCK_USERS[normalized]) {
    return MOCK_USERS[normalized];
  }

  return {
    username,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    bio: `Open-source developer working on ${username}'s favorite technologies.`,
    avatar_url: `https://avatars.githubusercontent.com/u/${Math.abs(
      hashCode(username)
    )}?v=4`,
    public_repositories: 15,
    followers: 42,
    following: 18,
    profile_url: `https://github.com/${username}`,
    company: "Community Contributor",
    location: "Everywhere",
    blog: `https://${username}.github.io`,
    twitter_username: username,
    public_gists: 2,
    created_at: "2020-01-01T00:00:00Z",
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

