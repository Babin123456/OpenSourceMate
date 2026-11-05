import { generateMockUserProfile } from "./fixtures/users";
import { generateMockSkills } from "./fixtures/skills";
import { generateMockRepositories } from "./fixtures/repositories";
import { generateMockMatchedIssues } from "./fixtures/issues";

export interface MockRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
}

export interface MockResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * Dispatches simulated API requests to appropriate mock route handlers.
 * Matches endpoints against standard OpenSourceMate backend paths.
 */
export function handleMockApiRequest(url: string, method?: string): MockResponse | null {
  const _reqMethod = method || "GET";
  void _reqMethod;
  const urlObj = new URL(url, "http://localhost:8000");
  const pathname = urlObj.pathname;

  // 1. Health Endpoint: /api/health or /health
  if (pathname === "/api/health" || pathname === "/health") {
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        status: "ok",
        service: "opensourcemate-api",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
        mode: "mock",
        environment: "development",
      },
    };
  }

  // 2. User Repositories: /api/github/users/:username/repositories
  const repoMatch = pathname.match(/^\/api\/github\/users\/([^/]+)\/repositories\/?$/);
  if (repoMatch) {
    const rawUsername = decodeURIComponent(repoMatch[1]);
    const mockCheck = checkSpecialMockConditions(rawUsername);
    if (mockCheck) return mockCheck;

    const repositories = generateMockRepositories(rawUsername);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        username: rawUsername,
        count: repositories.length,
        repositories,
      },
    };
  }

  // 3. User Skills: /api/github/users/:username/skills
  const skillsMatch = pathname.match(/^\/api\/github\/users\/([^/]+)\/skills\/?$/);
  if (skillsMatch) {
    const rawUsername = decodeURIComponent(skillsMatch[1]);
    const mockCheck = checkSpecialMockConditions(rawUsername);
    if (mockCheck) return mockCheck;

    const skills = generateMockSkills(rawUsername);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: skills,
    };
  }

  // 4. User Profile: /api/github/users/:username
  const userMatch = pathname.match(/^\/api\/github\/users\/([^/]+)\/?$/);
  if (userMatch) {
    const rawUsername = decodeURIComponent(userMatch[1]);
    const mockCheck = checkSpecialMockConditions(rawUsername);
    if (mockCheck) return mockCheck;

    const profile = generateMockUserProfile(rawUsername);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: profile,
    };
  }

  // 5. Matched Issues: /api/matching/users/:username/issues
  const matchingMatch = pathname.match(/^\/api\/matching\/users\/([^/]+)\/issues\/?$/);
  if (matchingMatch) {
    const rawUsername = decodeURIComponent(matchingMatch[1]);
    const mockCheck = checkSpecialMockConditions(rawUsername);
    if (mockCheck) return mockCheck;

    const issues = generateMockMatchedIssues(rawUsername);
    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: issues,
    };
  }

  // Not matched by mock handler
  return null;
}

/**
 * Handles test fixture triggers such as 404, 403 rate limit, and 500 error scenarios.
 */
function checkSpecialMockConditions(username: string): MockResponse | null {
  const norm = username.toLowerCase().trim();

  if (norm === "not-found" || norm === "404" || norm === "invalid-user") {
    return {
      status: 404,
      headers: { "Content-Type": "application/json" },
      body: {
        error: {
          code: "NOT_FOUND",
          message: `GitHub user '${username}' not found.`,
          details: null,
        },
      },
    };
  }

  if (norm === "rate-limited" || norm === "403") {
    const resetTimestamp = Math.floor(Date.now() / 1000) + 3600;
    return {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Reset": resetTimestamp.toString(),
      },
      body: {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "GitHub API rate limit exceeded.",
          reset_at: new Date(resetTimestamp * 1000).toISOString(),
        },
      },
    };
  }

  if (norm === "server-error" || norm === "500") {
    return {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Simulated internal server failure in mock backend.",
          details: null,
        },
      },
    };
  }

  return null;
}
