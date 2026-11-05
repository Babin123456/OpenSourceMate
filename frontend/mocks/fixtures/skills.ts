import type { UserSkillsResponse } from "../../types/api";

export const MOCK_SKILLS: Record<string, UserSkillsResponse> = {
  octocat: {
    username: "octocat",
    total_repositories_analyzed: 8,
    skills: [
      {
        name: "Ruby",
        repository_count: 5,
        percentage: 62.5,
        proficiency: "Strong",
        proficiency_score: 85,
        proficiency_reason: "Primary language across multiple core repositories.",
      },
      {
        name: "JavaScript",
        repository_count: 4,
        percentage: 50.0,
        proficiency: "Comfortable",
        proficiency_score: 70,
        proficiency_reason: "Frequent frontend integration scripts.",
      },
      {
        name: "HTML",
        repository_count: 3,
        percentage: 37.5,
        proficiency: "Comfortable",
        proficiency_score: 65,
        proficiency_reason: "Documentation and interface markup.",
      },
      {
        name: "CSS",
        repository_count: 2,
        percentage: 25.0,
        proficiency: "Learning",
        proficiency_score: 45,
        proficiency_reason: "Styling and theme customization.",
      },
    ],
  },
  torvalds: {
    username: "torvalds",
    total_repositories_analyzed: 7,
    skills: [
      {
        name: "C",
        repository_count: 7,
        percentage: 100.0,
        proficiency: "Strong",
        proficiency_score: 99,
        proficiency_reason: "Kernel architecture and system programming.",
      },
      {
        name: "Shell",
        repository_count: 4,
        percentage: 57.1,
        proficiency: "Strong",
        proficiency_score: 90,
        proficiency_reason: "Build automation, toolchains, and scripting.",
      },
      {
        name: "Assembly",
        repository_count: 3,
        percentage: 42.8,
        proficiency: "Strong",
        proficiency_score: 88,
        proficiency_reason: "Hardware interrupt and memory management routines.",
      },
      {
        name: "Makefile",
        repository_count: 5,
        percentage: 71.4,
        proficiency: "Strong",
        proficiency_score: 92,
        proficiency_reason: "Kernel compilation build rules.",
      },
    ],
  },
  gaearon: {
    username: "gaearon",
    total_repositories_analyzed: 50,
    skills: [
      {
        name: "JavaScript",
        repository_count: 45,
        percentage: 90.0,
        proficiency: "Strong",
        proficiency_score: 98,
        proficiency_reason: "Core React ecosystem and library authoring.",
      },
      {
        name: "TypeScript",
        repository_count: 28,
        percentage: 56.0,
        proficiency: "Strong",
        proficiency_score: 92,
        proficiency_reason: "Typed React libraries and state management.",
      },
      {
        name: "CSS",
        repository_count: 20,
        percentage: 40.0,
        proficiency: "Comfortable",
        proficiency_score: 75,
        proficiency_reason: "Component styling and visual demos.",
      },
      {
        name: "HTML",
        repository_count: 18,
        percentage: 36.0,
        proficiency: "Comfortable",
        proficiency_score: 70,
        proficiency_reason: "DOM templates and playground apps.",
      },
    ],
  },
  alice: {
    username: "alice",
    total_repositories_analyzed: 32,
    skills: [
      {
        name: "TypeScript",
        repository_count: 25,
        percentage: 78.1,
        proficiency: "Strong",
        proficiency_score: 94,
        proficiency_reason: "Extensive full stack applications and libraries.",
      },
      {
        name: "Python",
        repository_count: 18,
        percentage: 56.2,
        proficiency: "Strong",
        proficiency_score: 88,
        proficiency_reason: "FastAPI backends and data automation pipelines.",
      },
      {
        name: "React",
        repository_count: 16,
        percentage: 50.0,
        proficiency: "Strong",
        proficiency_score: 86,
        proficiency_reason: "Frontend web applications and dashboards.",
      },
      {
        name: "Docker",
        repository_count: 10,
        percentage: 31.2,
        proficiency: "Comfortable",
        proficiency_score: 72,
        proficiency_reason: "Containerization and local compose setups.",
      },
      {
        name: "Go",
        repository_count: 6,
        percentage: 18.7,
        proficiency: "Learning",
        proficiency_score: 55,
        proficiency_reason: "Microservice utilities and CLI experiments.",
      },
    ],
  },
};

/**
 * Generates a realistic mock skills breakdown for any username.
 */
export function generateMockSkills(username: string): UserSkillsResponse {
  const normalized = username.toLowerCase().trim();
  if (MOCK_SKILLS[normalized]) {
    return MOCK_SKILLS[normalized];
  }

  return {
    username,
    total_repositories_analyzed: 15,
    skills: [
      {
        name: "TypeScript",
        repository_count: 10,
        percentage: 66.7,
        proficiency: "Strong",
        proficiency_score: 85,
        proficiency_reason: "Identified in majority of analyzed repositories.",
      },
      {
        name: "Python",
        repository_count: 7,
        percentage: 46.7,
        proficiency: "Comfortable",
        proficiency_score: 75,
        proficiency_reason: "Consistent scripting and backend logic.",
      },
      {
        name: "React",
        repository_count: 6,
        percentage: 40.0,
        proficiency: "Comfortable",
        proficiency_score: 70,
        proficiency_reason: "UI component design and state workflows.",
      },
      {
        name: "CSS",
        repository_count: 4,
        percentage: 26.7,
        proficiency: "Learning",
        proficiency_score: 50,
        proficiency_reason: "Responsive layouts and UI styling.",
      },
    ],
  };
}

