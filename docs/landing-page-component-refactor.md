# Landing Page Modular Component Refactoring and Shared UI Primitives

## Overview
This document specifies the architecture, UI primitives, and modular component hierarchy implemented for OpenSourceMate's landing page (Issue #174).

The refactoring separates concerns across the main landing experience, replacing repetitive inline HTML elements with accessible, reusable UI primitives, and organizing major page regions into dedicated components without altering the visual appearance or behavior.

## Shared UI Primitives (`frontend/components/ui/`)

### 1. `Button` (`frontend/components/ui/Button.tsx`)
- Supports variants: `primary`, `secondary`, `outline`, `ghost`, and `danger`.
- Supports sizes: `sm`, `md`, and `lg`.
- Built-in `isLoading` state displaying an accessible animated SVG spinner.
- Respects `theme="dark" | "light"` for Tailwind color tokens.

### 2. `Card` (`frontend/components/ui/Card.tsx`)
- Standardized container styling with rounded borders (`rounded-2xl`).
- Supports variants: `default`, `interactive` (hover transitions and elevation), and `glass` (backdrop blur).
- Color and border tokens adapt automatically between dark and light themes.

### 3. `Badge` (`frontend/components/ui/Badge.tsx`)
- Consistent pill badges for statuses, tags, and category labels.
- Supports semantic color tokens: `emerald`, `blue`, `purple`, `amber`, `rose`, and `slate`.
- Compact padding and font sizes ensuring zero layout shift.

## Modular Landing Components (`frontend/components/`)

### 1. `Navbar` (`frontend/components/Navbar.tsx`)
- Top application header with brand logo, desktop navigation anchors, theme toggle button, GitHub repository link, and responsive mobile hamburger dropdown.
- Includes smooth navigation callbacks and keyboard accessibility.

### 2. `Hero` (`frontend/components/Hero.tsx`)
- High-impact header section featuring animated background glows, value proposition headlines, descriptive copy, and primary/secondary call-to-action buttons.

### 3. `HowItWorks` (`frontend/components/HowItWorks.tsx`)
- Visual 3-stage breakdown of the analysis pipeline: Ingestion, Inference, and Recommendation, using `Card` and `Badge` primitives with custom iconography.

### 4. `Footer` (`frontend/components/Footer.tsx`)
- Site footer with MIT license attribution, navigation links, and external GitHub links.

## Quality Assurance & Verification
Automated test suites verify complete functional integrity:
- `frontend/__tests__/UiPrimitives.test.tsx` (Button, Card, Badge interactions, loading states, variants)
- `frontend/__tests__/LandingComponents.test.tsx` (Navbar, Hero, HowItWorks, Footer rendering)
