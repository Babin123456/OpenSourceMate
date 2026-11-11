"use client";

import React, { useEffect, useState } from "react";

export interface ThemeToggleProps {
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  className?: string;
  id?: string;
  showTextLabel?: boolean;
}

/**
 * An accessible theme toggle switch component.
 *
 * Implements WCAG 2.1 AA compliant keyboard and screen reader accessibility:
 * - Proper `role="switch"` and `aria-checked={isDark}`
 * - Explicit `aria-label` stating action ("Switch to light mode" / "Switch to dark mode")
 * - Keyboard support: space / enter toggle, plus visible focus ring
 * - Decorative icons marked with `aria-hidden="true"`
 * - Tooltip / live announcement support
 */
export default function ThemeToggle({
  theme = "dark",
  onToggleTheme,
  className = "",
  id = "theme-toggle-switch",
  showTextLabel = false,
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggleTheme?.();
    }
  };

  const actionLabel = isDark ? "Switch to light mode" : "Switch to dark mode";
  const currentModeDescription = isDark ? "Dark theme active" : "Light theme active";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={actionLabel}
        title={actionLabel}
        onClick={onToggleTheme}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 outline-none
          focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
          ${
            isDark
              ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 focus-visible:ring-offset-slate-950"
              : "border-slate-200 bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus-visible:ring-offset-white shadow-sm"
          }`}
      >
        <span className="sr-only">
          {actionLabel}. Currently {currentModeDescription}.
        </span>

        {/* Decorative Icons with aria-hidden="true" */}
        {isDark ? (
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>

      {showTextLabel && (
        <span
          aria-hidden="true"
          className={`text-xs font-medium select-none ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {isDark ? "Dark" : "Light"}
        </span>
      )}

      {/* Screen reader live notification on theme change */}
      <span aria-live="polite" className="sr-only">
        {mounted ? currentModeDescription : ""}
      </span>
    </div>
  );
}
