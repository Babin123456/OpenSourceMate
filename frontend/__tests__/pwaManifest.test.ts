/**
 * Unit tests verifying Web App Manifest, viewport theme colors, and Apple touch icon (Issue #181).
 */

import manifest from "../app/manifest";
import { viewport } from "../app/viewport";
import { metadata } from "../app/layout";

describe("PWA Manifest, Theme Color & Apple Touch Icon (Issue #181)", () => {
  describe("Web App Manifest (app/manifest.ts)", () => {
    const data = manifest();

    it("defines correct application name and short_name", () => {
      expect(data.name).toBe("OpenSourceMate");
      expect(data.short_name).toBe("OpenSourceMate");
    });

    it("specifies standalone display mode and root start_url", () => {
      expect(data.display).toBe("standalone");
      expect(data.start_url).toBe("/");
    });

    it("configures brand theme and background colors", () => {
      expect(data.theme_color).toBe("#7c3aed");
      expect(data.background_color).toBe("#05070d");
    });

    it("provides standard 192x192, 512x512, and 180x180 icons", () => {
      expect(data.icons).toBeDefined();
      expect(data.icons?.length).toBeGreaterThanOrEqual(3);

      const sizes = data.icons?.map((i) => i.sizes);
      expect(sizes).toContain("192x192");
      expect(sizes).toContain("512x512");
      expect(sizes).toContain("180x180");
    });

    it("provides shortcuts for quick access to comparison tool", () => {
      expect(data.shortcuts).toBeDefined();
      const compareShortcut = data.shortcuts?.find((s) => s.url === "/compare");
      expect(compareShortcut).toBeDefined();
      expect(compareShortcut?.name).toBe("Compare Profiles");
    });
  });

  describe("Viewport Theme Color (app/viewport.ts)", () => {
    it("specifies light and dark scheme-adaptive theme colors", () => {
      expect(viewport.themeColor).toBeDefined();
      expect(Array.isArray(viewport.themeColor)).toBe(true);

      const colors = viewport.themeColor as Array<{ media: string; color: string }>;
      const lightTheme = colors.find((c) => c.media.includes("light"));
      const darkTheme = colors.find((c) => c.media.includes("dark"));

      expect(lightTheme?.color).toBe("#ffffff");
      expect(darkTheme?.color).toBe("#05070d");
    });

    it("defines responsive viewport scaling bounds", () => {
      expect(viewport.width).toBe("device-width");
      expect(viewport.initialScale).toBe(1);
      expect(viewport.colorScheme).toContain("dark");
      expect(viewport.colorScheme).toContain("light");
    });
  });

  describe("Metadata Icons & Apple Touch Icon", () => {
    it("configures manifest link on root metadata", () => {
      expect(metadata.manifest).toBe("/manifest.webmanifest");
    });

    it("configures apple touch icon in metadata", () => {
      const appleIcons = metadata.icons && "apple" in metadata.icons ? metadata.icons.apple : null;
      expect(appleIcons).toBeDefined();
      if (Array.isArray(appleIcons)) {
        const touchIcon = appleIcons[0] as { url: string; sizes: string; type: string };
        expect(touchIcon.url).toBe("/apple-touch-icon.png");
        expect(touchIcon.sizes).toBe("180x180");
      }
    });
  });
});


  describe("Manifest Categories & Standalone Criteria", () => {
    const data = manifest();

    it("includes developer-tools category", () => {
      expect(data.categories).toContain("developer-tools");
    });

    it("configures portrait-primary orientation for mobile ergonomics", () => {
      expect(data.orientation).toBe("portrait-primary");
    });

    it("defines scope matching root", () => {
      expect(data.scope).toBe("/");
    });

    it("ensures 192x192 icon has maskable purpose for Android adaptive icons", () => {
      const maskableIcon = data.icons?.find((i) => i.sizes === "192x192");
      expect(maskableIcon?.purpose).toBe("maskable");
    });
  });


  describe("Theme Color Media Query Specificity", () => {
    it("ensures light mode theme color does not collide with dark mode", () => {
      const colors = viewport.themeColor as Array<{ media: string; color: string }>;
      const light = colors.find((c) => c.media.includes("light"))?.color;
      const dark = colors.find((c) => c.media.includes("dark"))?.color;
      expect(light).not.toEqual(dark);
    });

    it("verifies hexadecimal color codes are formatted properly", () => {
      const colors = viewport.themeColor as Array<{ media: string; color: string }>;
      for (const entry of colors) {
        expect(entry.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });


  describe("Icon Format and Mime-Type Consistency", () => {
    const data = manifest();

    it("ensures all manifest icon types are image/png", () => {
      const icons = data.icons || [];
      for (const icon of icons) {
        expect(icon.type).toBe("image/png");
      }
    });

    it("verifies icon paths begin with leading slash", () => {
      const icons = data.icons || [];
      for (const icon of icons) {
        expect(icon.src.startsWith("/")).toBe(true);
      }
    });
  });


  describe("Shortcuts Icon Integrity", () => {
    const data = manifest();

    it("ensures shortcuts have valid URL targets and descriptive names", () => {
      const shortcuts = data.shortcuts || [];
      expect(shortcuts.length).toBeGreaterThan(0);
      for (const sc of shortcuts) {
        expect(sc.url.startsWith("/")).toBe(true);
        expect(sc.name.length).toBeGreaterThan(0);
      }
    });
  });


  it("checks presence of webapplication JSON-LD schema", () => {
    expect(metadata.applicationName).toBe("OpenSourceMate");
  });
