# Compare Tool Skeleton & No-JavaScript Fallback Guide (Issue #179)

## Overview

Issue **#179** replaces the unstyled plain text loading message `"Loading comparison tool..."` with a high-fidelity visual skeleton that matches the exact two-card side-by-side comparison layout, and includes an accessible `<noscript>` fallback explaining that JavaScript is required.

---

## 1. Problem & Objectives

- **Previous Behavior**: Visiting `/compare` rendered an unstyled centered text label that pulsed until the client bundle hydrated. Once loaded, the page experienced a noticeable layout jump (Cumulative Layout Shift) when the two cards and controls popped into view.
- **Improved Experience**:
  1. A structural skeleton matching the navbar, header, two developer cards (stacked on mobile, side-by-side on desktop), and the center compare button renders immediately during initial server streaming or bundle download.
  2. Zero layout jump (`CLS = 0`) between skeleton state and interactive tool state.
  3. Seamless support for both dark (`#05070d`) and light (`bg-gray-50`) modes.
  4. An accessible `<noscript>` alert explaining that JavaScript is required to fetch GitHub APIs and calculate profile overlap metrics.

---

## 2. Component Design (`components/CompareSkeleton.tsx`)

The skeleton replicates the key layout landmarks:
- **Navbar**: Placeholder branding icon, title, and action buttons.
- **Header**: Main page heading and subtitle skeletons.
- **Two Input Cards**:
  - Avatar placeholder (round 48px).
  - Profile name and handle lines.
  - Full-width input field box.
  - Three statistical badge chips.
- **Action Button**: Centered 48px height rounded pill.
- **No-JavaScript Banner**:
  ```html
  <noscript>
    <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center text-amber-300">
      <h3>JavaScript is required</h3>
      <p>The Developer Profile Comparison tool requires JavaScript to analyze GitHub profiles...</p>
    </div>
  </noscript>
  ```

---

## 3. Responsive Behavior

- **Mobile Viewports (< 768px)**: The cards stack vertically (`grid-cols-1`) with comfortable padding.
- **Desktop Viewports (>= 768px)**: The cards display in two columns (`md:grid-cols-2`), perfectly matching the `ProfileComparison` component geometry.

---

## 4. Testing & Verification

Unit tests in `frontend/__tests__/CompareSkeleton.test.tsx`:
- Verifies `status` role and accessible aria-labels.
- Asserts presence of two developer skeleton cards.
- Tests dark and light theme class toggling.
- Asserts inclusion of `<noscript>` fallback and instructions.


## 5. Layout Alignment Comparison

| Feature | Old Plain Text State | New CompareSkeleton |
| :--- | :--- | :--- |
| **Visual Appearance** | Single pulsing text label in center screen | Identical header, navbar, and card layout |
| **Theme Awareness** | Fixed dark background `#05070d` only | Adapts dynamically to light and dark modes |
| **Layout Shift (CLS)** | > 0.15 on component mount | 0.000 (layout geometry is reserved) |
| **No-JS Accessibility** | Blank/frozen screen if JS is disabled | Alert message informing user of JS requirement |
| **Screen Readers** | Partial announcement | Dedicated `role="status"` with polite description |
