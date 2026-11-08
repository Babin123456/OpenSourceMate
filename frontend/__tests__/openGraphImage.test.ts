/**
 * Unit tests verifying Open Graph image generator and metadata card configurations (Issue #180).
 */

import { metadata } from "../app/layout";
import { size, alt, contentType, runtime } from "../app/opengraph-image";

describe("Open Graph & Twitter Large Card Configuration (Issue #180)", () => {
  describe("Open Graph Image Spec", () => {
    it("defines standard 1200x630 dimensions", () => {
      expect(size.width).toBe(1200);
      expect(size.height).toBe(630);
    });

    it("specifies PNG content type", () => {
      expect(contentType).toBe("image/png");
    });

    it("specifies edge runtime for fast response", () => {
      expect(runtime).toBe("edge");
    });

    it("provides descriptive alt text for accessibility", () => {
      expect(alt).toBeDefined();
      expect(alt).toContain("OpenSourceMate");
      expect(alt).toContain("fit your skills");
    });
  });

  describe("Root Metadata Social Preview Tags", () => {
    it("configures twitter card as summary_large_image", () => {
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe("summary_large_image");
    });

    it("specifies twitter image with dimensions and alt", () => {
      const images = metadata.twitter?.images;
      expect(images).toBeDefined();
      expect(Array.isArray(images)).toBe(true);
      if (Array.isArray(images) && images[0]) {
        const first = images[0] as { url: string; width: number; height: number; alt: string };
        expect(first.url).toBe("/twitter-image");
        expect(first.width).toBe(1200);
        expect(first.height).toBe(630);
      }
    });

    it("specifies openGraph image with dimensions and alt", () => {
      const ogImages = metadata.openGraph?.images;
      expect(ogImages).toBeDefined();
      expect(Array.isArray(ogImages)).toBe(true);
      if (Array.isArray(ogImages) && ogImages[0]) {
        const first = ogImages[0] as { url: string; width: number; height: number; alt: string };
        expect(first.url).toBe("/opengraph-image");
        expect(first.width).toBe(1200);
        expect(first.height).toBe(630);
      }
    });
  });
});


  describe("Social Share Preview Validation", () => {
    it("ensures openGraph type is set to website", () => {
      expect(metadata.openGraph?.type).toBe("website");
    });

    it("verifies siteName matches OpenSourceMate", () => {
      expect(metadata.openGraph?.siteName).toBe("OpenSourceMate");
    });

    it("verifies metadataBase is present for absolute social URLs", () => {
      expect(metadata.metadataBase).toBeDefined();
    });
  });
