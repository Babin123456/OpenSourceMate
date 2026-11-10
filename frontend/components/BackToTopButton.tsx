"use client";

import React, { useState, useEffect } from "react";

export interface BackToTopButtonProps {
  /** Scroll position threshold in pixels before the button appears (default: 300) */
  threshold?: number;
  /** Optional custom CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

/**
 * An accessible BackToTopButton component.
 *
 * Implements WCAG 2.1 AA navigation requirements:
 * - Appears smoothly when scrolling past a configurable threshold (default 300px)
 * - Automatically respects `prefers-reduced-motion` media queries (instant vs smooth scroll)
 * - Fully keyboard accessible with standard Tab focus and Enter/Space activation
 * - Explicit `aria-label` stating "Scroll back to top of page"
 * - High-contrast focus rings and z-index positioning
 */
export default function BackToTopButton({
  threshold = 300,
  className = "",
  label = "Scroll back to top of page",
}: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setIsVisible(window.scrollY > threshold);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    if (typeof window === "undefined") return;

    // Detect if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToTop();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      aria-label={label}
      title={label}
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full border shadow-2xl transition-all duration-300
        outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
        focus-visible:ring-offset-slate-950 border-slate-700/80 bg-slate-900/90 hover:bg-slate-800
        text-slate-300 hover:text-white backdrop-blur-md hover:scale-105 active:scale-95 ${className}`}
    >
      <svg
        aria-hidden="true"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </button>
  );
}
