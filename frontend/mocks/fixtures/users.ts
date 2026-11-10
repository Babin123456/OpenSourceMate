import type { GitHubUserProfile } from "../../types/api";
import userStandardJson from "../../../fixtures/users/user_standard.json";
import userNoBioJson from "../../../fixtures/users/user_no_bio.json";
import userNoReposJson from "../../../fixtures/users/user_no_repos.json";
import userManyReposJson from "../../../fixtures/users/user_many_repos.json";
import reposForksOnlyJson from "../../../fixtures/repositories/repos_forks_only.json";

export interface RawGitHubUserFixture {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Adapts a raw sanitized GitHub REST API user fixture into the frontend profile contract.
 */
export function adaptRawUserFixture(raw: RawGitHubUserFixture): GitHubUserProfile {
  return {
    username: raw.login,
    name: raw.name,
    bio: raw.bio,
    avatar_url: raw.avatar_url,
    public_repositories: raw.public_repos,
    followers: raw.followers,
    following: raw.following,
    profile_url: raw.html_url,
    company: raw.company,
    location: raw.location,
    blog: raw.blog,
    twitter_username: raw.twitter_username,
    public_gists: raw.public_gists,
    created_at: raw.created_at,
  };
}

export const SHARED_USER_FIXTURES = {
  standard: adaptRawUserFixture(userStandardJson),
  noBio: adaptRawUserFixture(userNoBioJson),
  noRepos: adaptRawUserFixture(userNoReposJson),
  manyRepos: adaptRawUserFixture(userManyReposJson),
};

const forksOnlyOwner = reposForksOnlyJson[0]?.owner;
const forksOnlyLogin = forksOnlyOwner?.login ?? "forks-only-dev";
const forksOnlyId = forksOnlyOwner?.id ?? 90000002;
const forksOnlyUrl = forksOnlyOwner?.html_url ?? `https://github.com/${forksOnlyLogin}`;

const LEGACY_OCTOCAT_USER: GitHubUserProfile = {
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
};

export const MOCK_USERS: Record<string, GitHubUserProfile> = {
  // Legacy preset preserved for existing mockApi.test.ts expectations
  octocat: LEGACY_OCTOCAT_USER,
  "octocat-real": {
    ...LEGACY_OCTOCAT_USER,
    username: "octocat-real",
  },
  tiangolo: SHARED_USER_FIXTURES.standard,
  torvalds: SHARED_USER_FIXTURES.noBio,
  gaearon: SHARED_USER_FIXTURES.manyRepos,
  "newbie-contributor": SHARED_USER_FIXTURES.noRepos,
  [forksOnlyLogin]: {
    username: forksOnlyLogin,
    name: "Fork Contributor",
    bio: null,
    avatar_url: `https://avatars.githubusercontent.com/u/${forksOnlyId}?v=4`,
    public_repositories: reposForksOnlyJson.length,
    followers: 3,
    following: 5,
    profile_url: forksOnlyUrl,
    company: null,
    location: null,
    blog: null,
    twitter_username: null,
    public_gists: 0,
    created_at: reposForksOnlyJson[0]?.created_at ?? "2024-06-01T12:00:00Z",
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
  const matched = MOCK_USERS[normalized];
  if (matched) {
    return matched;
  }

  return {
    username,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    bio: `Open-source developer working on ${username}'s favorite technologies.`,
    avatar_url: `https://avatars.githubusercontent.com/u/${Math.abs(hashCode(username))}?v=4`,
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
