/**
 * Verifies shared sanitized GitHub API JSON fixtures consumed by the frontend
 * mock API and activity aggregation utilities (Issue #232).
 */

import { handleMockApiRequest } from "../mocks/handlers";
import { SHARED_USER_FIXTURES } from "../mocks/fixtures/users";
import { SHARED_REPOSITORY_FIXTURES } from "../mocks/fixtures/repositories";
import { buildSkillsFromRepositories, SHARED_LANGUAGE_FIXTURES } from "../mocks/fixtures/skills";
import {
  computeActivityLevel,
  processPublicEvents,
  type RawGitHubEvent,
} from "../utils/activitySummary";
import eventsActiveJson from "../../fixtures/events/events_active.json";
import eventsOccasionalJson from "../../fixtures/events/events_occasional.json";
import eventsEmptyJson from "../../fixtures/events/events_empty.json";
import userStandardJson from "../../fixtures/users/user_standard.json";
import userNoBioJson from "../../fixtures/users/user_no_bio.json";
import userManyReposJson from "../../fixtures/users/user_many_repos.json";

describe("Shared Sanitized GitHub API Fixtures (Issue #232)", () => {
  describe("Sanitization & TypeScript JSON import contracts", () => {
    it("removes personal email addresses from real user fixtures", () => {
      expect(userStandardJson.email).toBeNull();
      expect(userNoBioJson.email).toBeNull();
      expect(userManyReposJson.email).toBeNull();

      const serialized = JSON.stringify([
        userStandardJson,
        userNoBioJson,
        userManyReposJson,
        eventsActiveJson,
      ]);
      expect(serialized).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    });

    it("provides multi-language, single-language, and empty language fixtures", () => {
      expect(Object.keys(SHARED_LANGUAGE_FIXTURES.multi ?? {}).length).toBeGreaterThan(1);
      expect(Object.keys(SHARED_LANGUAGE_FIXTURES.single ?? {}).length).toBe(1);
      expect(SHARED_LANGUAGE_FIXTURES.empty).toEqual({});

      const sampleRepos = SHARED_REPOSITORY_FIXTURES.standard.slice(0, 3);
      const result = buildSkillsFromRepositories("sample-dev", sampleRepos, false, {
        [sampleRepos[0]!.name]: SHARED_LANGUAGE_FIXTURES.multi ?? {},
        [sampleRepos[1]!.name]: SHARED_LANGUAGE_FIXTURES.single ?? {},
        [sampleRepos[2]!.name]: SHARED_LANGUAGE_FIXTURES.empty ?? {},
      });
      const skillNames = result.skills.map((s) => s.name);
      expect(skillNames).toContain("TypeScript");
      expect(skillNames).toContain("Python");
      expect(skillNames).not.toContain("Makefile");
    });
  });

  describe("Mock API fixture integration", () => {
    it("serves standard user profile fixture for @tiangolo", () => {
      const res = handleMockApiRequest("/api/github/users/tiangolo");
      expect(res?.status).toBe(200);
      expect(res?.body).toEqual(SHARED_USER_FIXTURES.standard);
    });

    it("preserves null bio cleanly for @torvalds fixture", () => {
      const res = handleMockApiRequest("/api/github/users/torvalds");
      expect(res?.status).toBe(200);
      const body = res?.body as { username: string; bio: string | null };
      expect(body.username).toBe("torvalds");
      expect(body.bio).toBeNull();
    });

    it("handles empty repository edge case for @newbie-contributor", () => {
      const userRes = handleMockApiRequest("/api/github/users/newbie-contributor");
      const repoRes = handleMockApiRequest("/api/github/users/newbie-contributor/repositories");
      const skillRes = handleMockApiRequest("/api/github/users/newbie-contributor/skills");

      expect(userRes?.status).toBe(200);
      expect((userRes?.body as { public_repositories: number }).public_repositories).toBe(0);
      expect(repoRes?.status).toBe(200);
      const repoBody = repoRes?.body as {
        count: number;
        repository_count: number;
        total_pages_fetched: number;
        has_more: boolean;
        fetched_at: string;
        repositories: unknown[];
      };
      expect(repoBody.count).toBe(0);
      expect(repoBody.repository_count).toBe(0);
      expect(repoBody.total_pages_fetched).toBe(0);
      expect(repoBody.has_more).toBe(false);
      expect(Number.isNaN(Date.parse(repoBody.fetched_at))).toBe(false);
      expect(repoBody.repositories).toEqual([]);
      expect(
        (skillRes?.body as { total_repositories_analyzed: number }).total_repositories_analyzed
      ).toBe(0);
    });

    it("aligns @octocat-real across profile, repositories, and skills", () => {
      const userRes = handleMockApiRequest("/api/github/users/octocat-real");
      const repoRes = handleMockApiRequest("/api/github/users/octocat-real/repositories");
      const skillRes = handleMockApiRequest("/api/github/users/octocat-real/skills");

      expect(userRes?.status).toBe(200);
      expect((userRes?.body as { username: string; public_repositories: number }).username).toBe(
        "octocat-real"
      );
      expect((userRes?.body as { public_repositories: number }).public_repositories).toBe(
        SHARED_REPOSITORY_FIXTURES.standard.length
      );
      expect((repoRes?.body as { repository_count: number }).repository_count).toBe(8);
      const skillsBody = skillRes?.body as {
        username: string;
        total_repositories_analyzed: number;
        skills: Array<{ name: string }>;
      };
      expect(skillsBody.username).toBe("octocat-real");
      expect(skillsBody.total_repositories_analyzed).toBe(6);
      expect(skillsBody.skills.map((s) => s.name)).toEqual(["CSS", "HTML"]);
    });

    it("handles forks-only repository fixture and include_forks toggle", () => {
      const userRes = handleMockApiRequest("/api/github/users/forks-only-dev");
      const repoRes = handleMockApiRequest("/api/github/users/forks-only-dev/repositories");
      const excludedSkills = handleMockApiRequest("/api/github/users/forks-only-dev/skills");
      const includedSkills = handleMockApiRequest(
        "/api/github/users/forks-only-dev/skills?include_forks=true"
      );

      expect(userRes?.status).toBe(200);
      expect((userRes?.body as { public_repositories: number }).public_repositories).toBe(
        SHARED_REPOSITORY_FIXTURES.forksOnly.length
      );
      expect(repoRes?.status).toBe(200);
      const repos = (repoRes?.body as { repositories: Array<{ is_fork: boolean }> }).repositories;
      expect(repos.length).toBeGreaterThan(0);
      expect(repos.every((r) => r.is_fork)).toBe(true);
      expect(
        (excludedSkills?.body as { total_repositories_analyzed: number })
          .total_repositories_analyzed
      ).toBe(0);
      expect(
        (includedSkills?.body as { total_repositories_analyzed: number })
          .total_repositories_analyzed
      ).toBe(SHARED_REPOSITORY_FIXTURES.forksOnly.length);
    });

    it("serves large 100-repo fixture and supports query pagination matching backend metadata", () => {
      const fullRes = handleMockApiRequest("/api/github/users/gaearon/repositories");
      const page1Res = handleMockApiRequest(
        "/api/github/users/gaearon/repositories?page=1&per_page=30"
      );
      const page4Res = handleMockApiRequest(
        "/api/github/users/gaearon/repositories?page=4&per_page=30"
      );

      expect(fullRes?.status).toBe(200);
      const fullBody = fullRes?.body as {
        count: number;
        repository_count: number;
        total_pages_fetched: number;
        has_more: boolean;
        fetched_at: string;
      };
      expect(fullBody.count).toBe(100);
      expect(fullBody.repository_count).toBe(100);
      expect(fullBody.total_pages_fetched).toBe(1);
      expect(fullBody.has_more).toBe(false);
      expect(Number.isNaN(Date.parse(fullBody.fetched_at))).toBe(false);

      const page1Body = page1Res?.body as typeof fullBody;
      expect(page1Body.count).toBe(30);
      expect(page1Body.repository_count).toBe(30);
      expect(page1Body.total_pages_fetched).toBe(1);
      expect(page1Body.has_more).toBe(true);

      const page4Body = page4Res?.body as typeof fullBody;
      expect(page4Body.count).toBe(10);
      expect(page4Body.repository_count).toBe(10);
      expect(page4Body.total_pages_fetched).toBe(1);
      expect(page4Body.has_more).toBe(false);
    });
  });

  describe("Activity summary handling with shared event fixtures", () => {
    const fixedNow = new Date("2026-11-10T12:00:00Z");

    it("classifies events_active.json as Active with push, PR, and issue counts", () => {
      const activeEvents = eventsActiveJson as RawGitHubEvent[];
      const summary = processPublicEvents("sindresorhus", activeEvents, fixedNow);

      expect(summary.totalEvents90d).toBeGreaterThanOrEqual(15);
      expect(summary.level).toBe(computeActivityLevel(summary.totalEvents90d));
      expect(summary.level).toBe("Active");
      expect(summary.pushesCount).toBeGreaterThan(0);
      expect(summary.pullRequestsCount).toBeGreaterThan(0);
      expect(summary.issuesCount).toBeGreaterThan(0);
    });

    it("classifies events_occasional.json as Occasional", () => {
      const occasionalEvents = eventsOccasionalJson as RawGitHubEvent[];
      const summary = processPublicEvents("sindresorhus", occasionalEvents, fixedNow);

      expect(summary.totalEvents90d).toBeGreaterThanOrEqual(1);
      expect(summary.totalEvents90d).toBeLessThan(15);
      expect(summary.level).toBe("Occasional");
    });

    it("classifies events_empty.json as Inactive", () => {
      const emptyEvents = eventsEmptyJson as RawGitHubEvent[];
      const summary = processPublicEvents("octocat", emptyEvents, fixedNow);

      expect(summary.totalEvents90d).toBe(0);
      expect(summary.level).toBe("Inactive");
    });
  });
});
