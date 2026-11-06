# Route-Level Page Metadata & Title Template Guide (Issue #178)

## Overview

Issue **#178** solves the issue where `/compare` and other sub-routes displayed the home page's title and description in browser tabs and search engine results.

This document details the reusable Next.js metadata architecture, title templates, Open Graph tags, canonical URLs, and how to define metadata for future pages.

---

## 1. Reusable Title Template in Root Layout (`app/layout.tsx`)

By configuring `title.template` in `app/layout.tsx`, all nested route layouts automatically inherit the standardized suffix:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OpenSourceMate – Find open-source issues that fit your skills",
    template: "%s | OpenSourceMate",
  },
  description: "...",
  // ...
};
```

- When a child route sets `title: "Compare GitHub Profiles"`, Next.js automatically outputs:
  `<title>Compare GitHub Profiles | OpenSourceMate</title>`
- When the root page renders without child title overrides, it uses `title.default`.

---

## 2. Route-Specific Metadata for `/compare` (`app/compare/layout.tsx`)

The `/compare` route exports dedicated server-side metadata:

| Field | Value |
| :--- | :--- |
| **Title** | `Compare GitHub Profiles` (Renders: `Compare GitHub Profiles \| OpenSourceMate`) |
| **Description** | `Compare two GitHub developer profiles side by side. Discover shared programming languages, unique competencies, repository distributions, and skill overlap with OpenSourceMate.` |
| **Canonical URL** | `/compare` |
| **Open Graph Title** | `Compare GitHub Profiles \| OpenSourceMate` |
| **Open Graph Type** | `website` |
| **Twitter Card** | `summary_large_image` |

Because `app/compare/page.tsx` is an interactive client component (`"use client"`), exporting `metadata` from `app/compare/layout.tsx` is the idiomatic Next.js App Router pattern for server-rendered HTML `<head>` tags without impacting client hydration.

---

## 3. Guide: Adding Metadata to Future Routes

To add distinct metadata for any new route (e.g. `/issues` or `/explore`):

1. Create `frontend/app/<route>/layout.tsx`:
```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Open Source Issues",
  description: "Browse categorized open source opportunities curated for your developer skills.",
  alternates: {
    canonical: "/issues",
  },
  openGraph: {
    title: "Explore Open Source Issues | OpenSourceMate",
    description: "Browse categorized open source opportunities.",
  },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```
2. The browser tab title will automatically resolve to `Explore Open Source Issues | OpenSourceMate`.


## 4. Reusable Metadata Builder (`frontend/utils/seo.ts`)

To ensure standard SEO attributes across future feature branches, use `buildPageMetadata`:

```typescript
import { buildPageMetadata } from "../../utils/seo";

export const metadata = buildPageMetadata({
  title: "Compare GitHub Profiles",
  description: "Compare two GitHub developer profiles side by side.",
  path: "/compare",
});
```

This enforces:
- Proper canonical pathing (`/compare`).
- Uniform Open Graph title formatting (`<title> | OpenSourceMate`).
- Large image Twitter cards (`summary_large_image`).
- Search engine indexability flags (`robots: { index: true, follow: true }`).

## 5. Verification & Testing

Unit tests for title template formatting, layout route metadata, and the metadata builder reside in:
`frontend/__tests__/compareMetadata.test.ts`.

Run:
```bash
npm test -- __tests__/compareMetadata.test.ts
```
