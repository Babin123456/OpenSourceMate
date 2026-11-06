/**
 * Unit tests verifying root title template and route-specific metadata for /compare (Issue #178).
 */

import { metadata as rootMetadata } from "../app/layout";
import { metadata as compareMetadata } from "../app/compare/layout";

describe("Metadata & Title Template Configuration (Issue #178)", () => {
  describe("Root Layout Metadata", () => {
    it("defines a reusable title template string '%s | OpenSourceMate'", () => {
      expect(rootMetadata.title).toBeDefined();
      if (typeof rootMetadata.title === "object" && rootMetadata.title !== null) {
        expect(rootMetadata.title).toHaveProperty("template", "%s | OpenSourceMate");
        expect(rootMetadata.title).toHaveProperty("default");
      } else {
        throw new Error("Expected rootMetadata.title to be an object with template and default");
      }
    });

    it("has a valid metadataBase URL configured", () => {
      expect(rootMetadata.metadataBase).toBeDefined();
      expect(rootMetadata.metadataBase?.toString()).toContain("http");
    });
  });

  describe("Compare Route Metadata (app/compare/layout.tsx)", () => {
    it("exports distinct page title for Compare page", () => {
      expect(compareMetadata.title).toBe("Compare GitHub Profiles");
    });

    it("exports descriptive, unique page description for Compare page", () => {
      expect(compareMetadata.description).toBeDefined();
      expect(compareMetadata.description).toContain("Compare two GitHub developer profiles side by side");
    });

    it("configures canonical URL pointing to /compare", () => {
      expect(compareMetadata.alternates?.canonical).toBe("/compare");
    });

    it("configures Open Graph tags specific to comparison", () => {
      expect(compareMetadata.openGraph).toBeDefined();
      expect(compareMetadata.openGraph?.title).toBe("Compare GitHub Profiles | OpenSourceMate");
      expect(compareMetadata.openGraph?.url).toBe("/compare");
    });

    it("configures large Twitter summary card for social sharing", () => {
      expect(compareMetadata.twitter).toBeDefined();
      expect(compareMetadata.twitter?.card).toBe("summary_large_image");
      expect(compareMetadata.twitter?.title).toBe("Compare GitHub Profiles | OpenSourceMate");
    });
  });

  describe("Title Resolution Emulation", () => {
    it("resolves route titles using template '%s | OpenSourceMate'", () => {
      const template = "%s | OpenSourceMate";
      const pageTitle = "Compare GitHub Profiles";
      const resolved = template.replace("%s", pageTitle);
      expect(resolved).toBe("Compare GitHub Profiles | OpenSourceMate");
    });
  });
});


import { buildPageMetadata, formatDocumentTitle } from "../utils/seo";

describe("SEO Utility Functions (Issue #178)", () => {
  describe("formatDocumentTitle", () => {
    it("formats titles using the standard OpenSourceMate branding suffix", () => {
      expect(formatDocumentTitle("Compare GitHub Profiles")).toBe("Compare GitHub Profiles | OpenSourceMate");
      expect(formatDocumentTitle("Explore Issues")).toBe("Explore Issues | OpenSourceMate");
    });

    it("falls back to default site title on empty or missing values", () => {
      expect(formatDocumentTitle("")).toContain("OpenSourceMate – Find open-source issues");
      expect(formatDocumentTitle(null)).toContain("OpenSourceMate – Find open-source issues");
      expect(formatDocumentTitle(undefined)).toContain("OpenSourceMate – Find open-source issues");
      expect(formatDocumentTitle("   ")).toContain("OpenSourceMate – Find open-source issues");
    });
  });

  describe("buildPageMetadata", () => {
    it("generates complete metadata object with openGraph and twitter cards", () => {
      const meta = buildPageMetadata({
        title: "Repository Explorer",
        description: "Browse popular repositories categorized by technology stack.",
        path: "/explore",
        image: "/og-explore.png",
      });

      expect(meta.title).toBe("Repository Explorer");
      expect(meta.description).toBe("Browse popular repositories categorized by technology stack.");
      expect(meta.alternates?.canonical).toBe("/explore");
      expect(meta.openGraph?.title).toBe("Repository Explorer | OpenSourceMate");
      expect(meta.openGraph?.type).toBe("website");
      expect(meta.twitter?.card).toBe("summary_large_image");
    });

    it("handles robots noIndex flags correctly", () => {
      const metaNoIndex = buildPageMetadata({
        title: "Private Draft",
        description: "Internal testing page",
        path: "/draft",
        noIndex: true,
      });

      if (typeof metaNoIndex.robots === "object" && metaNoIndex.robots !== null) {
        expect(metaNoIndex.robots).toHaveProperty("index", false);
        expect(metaNoIndex.robots).toHaveProperty("follow", false);
      } else {
        throw new Error("Expected robots object");
      }
    });

    it("normalizes path with leading slash", () => {
      const meta = buildPageMetadata({
        title: "Test",
        description: "Desc",
        path: "relative-path",
      });
      expect(meta.alternates?.canonical).toBe("/relative-path");
    });
  });
});


  it("handles complex path query parameters by maintaining clean canonical URLs", () => {
    const meta = buildPageMetadata({
      title: "Query Test",
      description: "Path testing",
      path: "/compare?user1=octocat&user2=torvalds",
    });
    expect(meta.alternates?.canonical).toBe("/compare?user1=octocat&user2=torvalds");
  });

  it("omits images property from openGraph when no image is specified", () => {
    const metaWithoutImage = buildPageMetadata({
      title: "No Image",
      description: "Desc",
      path: "/no-image",
    });
    expect(metaWithoutImage.openGraph).toBeDefined();
    expect(metaWithoutImage.openGraph).not.toHaveProperty("images");
  });
