import { handleMockApiRequest } from "../mocks/handlers";
import {
  fetchUserProfile,
  fetchUserSkills,
  fetchMatchedIssues,
  checkApiHealth,
  ApiClientError,
} from "../utils/apiClient";
import { enableMockApi, disableMockApi } from "../mocks/mockClient";

describe("Mock API Infrastructure", () => {
  describe("handleMockApiRequest handler directly", () => {
    it("returns health response for /api/health and /health", () => {
      const res = handleMockApiRequest("/api/health");
      expect(res).not.toBeNull();
      expect(res?.status).toBe(200);
      expect((res?.body as { mode: string }).mode).toBe("mock");

      const resRoot = handleMockApiRequest("/health");
      expect(resRoot?.status).toBe(200);
    });

    it("returns profile for registered mock user @octocat", () => {
      const res = handleMockApiRequest("/api/github/users/octocat");
      expect(res?.status).toBe(200);
      const user = res?.body as { username: string; name: string };
      expect(user.username).toBe("octocat");
      expect(user.name).toBe("The Octocat");
    });

    it("generates realistic mock profile for any valid unregistered user", () => {
      const res = handleMockApiRequest("/api/github/users/custom-developer");
      expect(res?.status).toBe(200);
      const user = res?.body as { username: string; followers: number };
      expect(user.username).toBe("custom-developer");
      expect(user.followers).toBeGreaterThan(0);
    });

    it("returns technical skills breakdown for /api/github/users/:username/skills", () => {
      const res = handleMockApiRequest("/api/github/users/octocat/skills");
      expect(res?.status).toBe(200);
      const data = res?.body as {
        skills: Array<{ name: string; repository_count: number }>;
      };
      expect(data.skills.length).toBeGreaterThan(0);
      expect(data.skills[0].name).toBeDefined();
    });

    it("returns repositories list for /api/github/users/:username/repositories", () => {
      const res = handleMockApiRequest("/api/github/users/octocat/repositories");
      expect(res?.status).toBe(200);
      const data = res?.body as {
        count: number;
        repositories: Array<{ name: string }>;
      };
      expect(data.count).toBeGreaterThan(0);
      expect(data.repositories[0].name).toBe("Spoon-Knife");
    });

    it("returns matched issues recommendations for /api/matching/users/:username/issues", () => {
      const res = handleMockApiRequest("/api/matching/users/octocat/issues");
      expect(res?.status).toBe(200);
      const data = res?.body as {
        recommendations: Array<{ title: string; match_score: number }>;
      };
      expect(data.recommendations.length).toBeGreaterThan(0);
      expect(data.recommendations[0].match_score).toBeGreaterThan(0);
    });

    it("handles 404 test user fixture", () => {
      const res = handleMockApiRequest("/api/github/users/not-found");
      expect(res?.status).toBe(404);
      const err = res?.body as { error: { code: string } };
      expect(err.error.code).toBe("NOT_FOUND");
    });

    it("handles 403 rate limit test user fixture with X-RateLimit-Reset", () => {
      const res = handleMockApiRequest("/api/github/users/rate-limited");
      expect(res?.status).toBe(403);
      expect(res?.headers["X-RateLimit-Reset"]).toBeDefined();
    });

    it("handles 500 server error test user fixture", () => {
      const res = handleMockApiRequest("/api/github/users/server-error");
      expect(res?.status).toBe(500);
    });

    it("returns null for unrecognized paths", () => {
      const res = handleMockApiRequest("/unrecognized/path");
      expect(res).toBeNull();
    });
  });

  describe("End-to-End API Client with NEXT_PUBLIC_USE_MOCKS=true", () => {
    const originalEnv = process.env.NEXT_PUBLIC_USE_MOCKS;

    beforeAll(() => {
      process.env.NEXT_PUBLIC_USE_MOCKS = "true";
      enableMockApi(0);
    });

    afterAll(() => {
      process.env.NEXT_PUBLIC_USE_MOCKS = originalEnv;
      disableMockApi();
    });

    it("successfully fetches profile end-to-end without a backend", async () => {
      const profile = await fetchUserProfile("octocat");
      expect(profile.username).toBe("octocat");
      expect(profile.public_repositories).toBe(8);
      expect(profile.followers).toBe(12500);
    });

    it("successfully fetches skills analysis end-to-end without a backend", async () => {
      const skills = await fetchUserSkills("octocat");
      expect(skills.username).toBe("octocat");
      expect(skills.skills.length).toBeGreaterThan(0);
      expect(skills.total_repositories_analyzed).toBe(8);
    });

    it("successfully fetches matched issues end-to-end without a backend", async () => {
      const matched = await fetchMatchedIssues("octocat");
      expect(matched.username).toBe("octocat");
      expect(matched.recommendations.length).toBeGreaterThan(0);
      expect(matched.recommendations[0].repository).toBeDefined();
    });

    it("successfully checks health status in mock mode", async () => {
      const health = await checkApiHealth();
      expect(health.status).toBe("ok");
    });

    it("throws ApiClientError 404 when requested user is not found fixture", async () => {
      await expect(fetchUserProfile("not-found")).rejects.toThrow(
        ApiClientError
      );

      try {
        await fetchUserProfile("not-found");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ApiClientError);
        expect((err as ApiClientError).status).toBe(404);
      }
    });

    it("throws ApiClientError 403 with reset header for rate-limited fixture", async () => {
      try {
        await fetchUserProfile("rate-limited");
        fail("Should have thrown rate limit error");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ApiClientError);
        expect((err as ApiClientError).status).toBe(403);
        expect((err as ApiClientError).resetAt).toBeDefined();
      }
    });
  });
});

