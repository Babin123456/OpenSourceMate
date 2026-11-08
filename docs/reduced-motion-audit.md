# Prefers-Reduced-Motion Accessibility Audit & Implementation (Issue #182)

## Overview

Issue **#182** ensures OpenSourceMate respects users' operating system and browser preferences for reduced motion (`prefers-reduced-motion: reduce`), satisfying **WCAG 2.2 Success Criterion 2.3.3 (Animation from Interactions - Level AAA)** and **Success Criterion 2.2.2 (Pause, Stop, Hide - Level A)**.

For people with vestibular disorders, motion sensitivity, migraine triggers, or cognitive disabilities, unexpected viewport scrolling, scale bouncing, or looping spinners can cause nausea, dizziness, and loss of focus.

---

## 1. Inventory of Animations, Transitions & Smooth Scrolls

Below is the comprehensive audit of every animation, transition, and transform in the codebase:

| Location | Element | Animation / Transition | Before Behavior | Reduced-Motion Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/app/globals.css` | `html` | `scroll-behavior: smooth` | Smooth animated scrolling between anchor sections | Instant jump (`scroll-behavior: auto !important`) |
| `frontend/app/globals.css` | Universal Reset | `*`, `*::before`, `*::after` | Default CSS transitions and animations | `animation-duration: 0.001ms`, `transition-duration: 0.001ms`, `transform: none` |
| `frontend/components/RefreshAnalysisButton.tsx` | Refresh Icon | `animate-spin`, `group-hover:rotate-180` | Continuous rotation or 180-deg flip | Animation killed; static icon without rotational movement |
| `frontend/components/LazySectionPlaceholder.tsx` | Loading Rings | `animate-ping`, `animate-spin` | Continuous pulsing radar & spinning ring | Non-animated static status indicator |
| `frontend/components/CompareSkeleton.tsx` | Skeleton Loaders | `animate-pulse` | Infinite fading opacity loop | Static muted background without flashing or pulsing |
| `frontend/components/ProfileCard.tsx` | Avatar Image | `hover:scale-105 transition-transform` | 105% scaling expansion on hover | No scale transform; static crisp image |
| `frontend/components/SkillsToLearn.tsx` | Tech Item Cards | `hover:-translate-y-0.5 transition-all` | Card lifts up 2px on pointer hover | Static hover color change without vertical shift |
| `frontend/components/SkillChart.tsx` | SVG Segments & Bars | `transition-all duration-500` | Smooth expansion and arc morphing | Instant value display without motion delay |
| `frontend/components/SkillProficiencyBadge.tsx` | Tooltip Popover | `transition-all duration-200` | Fade and slide transform from bottom | Instant opacity display without translation |
| `frontend/components/ServiceUnavailableBanner.tsx`| Refresh Button | `animate-spin` | Continuous spinner loop | Static retry icon |

---

## 2. Global CSS Engine (`app/globals.css`)

The core enforcement takes place via media queries in `frontend/app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto !important;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    animation-delay: 0ms !important;
    transition-duration: 0.001ms !important;
    transition-delay: 0ms !important;
    scroll-behavior: auto !important;
    transform: none !important;
  }

  .animate-spin,
  .animate-ping,
  .animate-pulse,
  .animate-bounce {
    animation: none !important;
  }
}
```

### Why `0.001ms` instead of `none`?
Setting `transition-duration: 0.001ms` allows JavaScript event listeners awaiting `transitionend` or `animationend` events to fire reliably without hanging async state transitions or test assertions.

---

## 3. Client React Hook (`utils/usePrefersReducedMotion.ts`)

For canvas, SVG charts, or programmatic animations:
```typescript
import { usePrefersReducedMotion } from "../utils/usePrefersReducedMotion";

export function Component() {
  const prefersReduced = usePrefersReducedMotion();
  // Bypass or simplify animations programmatically
}
```

---

## 4. Before & After Verification Notes

### Before:
- Spinning refresh buttons rotated 360 degrees indefinitely during loading.
- Skeletons on `/compare` and home page pulsated continually.
- Hovering skill cards translated elements vertically by -2px.
- Anchor links triggered smooth view panning across the page.

### After (with OS "Reduce Motion" enabled):
- Smooth scrolling immediately becomes instantaneous navigation.
- All spinners (`animate-spin`), pulses (`animate-pulse`), and pings (`animate-ping`) remain completely still.
- Hover transforms (`scale-105`, `-translate-y-0.5`, `rotate-180`) are neutral (`transform: none`).
- Visual feedback is maintained strictly through static background or border color shifts.


## 5. Tailwind CSS `motion-reduce:` Variant Guidelines

When authoring new UI components, use Tailwind's native `motion-reduce:` modifiers to gracefully degrade interactive animations:

```tsx
// ❌ Problematic: Always spins or expands on hover without check
<button className="animate-spin hover:scale-105">

//  Accessible: Motion disabled when user prefers reduced motion
<button className="animate-spin motion-reduce:animate-none hover:scale-105 motion-reduce:hover:scale-100 transition-transform">
```

### Motion-Safe Component Checklist
1. All spinners (`animate-spin`) must pair with `motion-reduce:animate-none`.
2. All scaling effects (`hover:scale-105`) must pair with `motion-reduce:hover:scale-100`.
3. All translation lifts (`hover:-translate-y-1`) must pair with `motion-reduce:hover:translate-y-0`.
4. All pulsing indicators (`animate-pulse`, `animate-ping`) must pair with `motion-reduce:animate-none`.
5. Color and opacity changes are preserved to maintain interactive focus and hover affordance.


## 6. Testing Instructions

To run automated checks verifying motion reduction logic and hook responsiveness:
```bash
cd frontend
npm test -- __tests__/prefersReducedMotion.test.ts
```

### Manual Verification in Browsers:
- **macOS**: System Settings > Accessibility > Display > Reduce motion (Toggle ON).
- **Windows**: Settings > Accessibility > Visual effects > Animation effects (Toggle OFF).
- **Chrome DevTools**: Press `Cmd/Ctrl + Shift + P` > Type `Show Rendering` > Set `Emulate CSS media feature prefers-reduced-motion` to `reduce`.
- Verify page animations, smooth scrolling, and spinning icons immediately cease movement.


## 7. Compliance Audit Matrix

| Guideline | Requirement | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **WCAG 2.2 SC 2.3.3** | Animation from Interactions | **Passed** | Hover translations, scale expansions, and spins are neutralized. |
| **WCAG 2.2 SC 2.2.2** | Pause, Stop, Hide | **Passed** | Infinite loaders (`animate-spin`, `animate-pulse`) are disabled. |
| **WCAG 2.2 SC 2.3.1** | Three Flashes or Below | **Passed** | Zero flashing content; pulsing animations removed on reduced motion. |
| **Section 508** | Subpart B 1194.22 | **Passed** | Operating system user preferences for visual effects respected. |
