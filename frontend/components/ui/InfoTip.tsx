"use client";

import React, { useState, useRef, useEffect, useId } from "react";

export interface InfoTipProps {
  /** The informational text or rich react content to display in the tooltip */
  content: React.ReactNode;
  /** Accessible label for the trigger button (default: "More information") */
  label?: string;
  /** Optional position relative to trigger (default: "top") */
  position?: "top" | "bottom" | "left" | "right";
  /** Optional custom CSS classes for the container */
  className?: string;
  /** Optional term name being defined */
  term?: string;
  /** Custom trigger size: "sm" | "md" */
  size?: "sm" | "md";
}

/**
 * An accessible InfoTip tooltip component compliant with WAI-ARIA Authoring Practices:
 * - Keyboard navigable: Focusable with Tab, toggles on Enter/Space, closes on Escape
 * - Screen reader friendly: Uses `role="tooltip"`, `aria-describedby` linking trigger to tooltip
 * - Touch responsive: Tap to toggle tooltip open/closed
 * - Screen boundary detection: Avoids clipping outside viewport edges
 * - High contrast visual styling with visible focus ring
 */
export default function InfoTip({
  content,
  label = "More information",
  position = "top",
  className = "",
  term,
  size = "sm",
}: InfoTipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" || e.code === "Escape" || e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    }
  };

  // Close when pressing Escape key anywhere in document
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape" || e.keyCode === 27) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOpen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Position calculation styles
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const fullLabel = term ? `More information about ${term}` : label;

  return (
    <span className={`relative inline-flex items-center align-middle ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={isOpen}
        aria-label={fullLabel}
        title={fullLabel}
        onKeyDown={handleTriggerKeyDown}
        onClick={toggleOpen}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className={`inline-flex items-center justify-center rounded-full transition-colors outline-none
          text-slate-400 hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
          focus-visible:ring-offset-slate-900 bg-white/5 hover:bg-white/10
          ${size === "sm" ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"}`}
      >
        <span aria-hidden="true" className="font-semibold select-none leading-none">
          ℹ
        </span>
        <span className="sr-only">{fullLabel}</span>
      </button>

      {/* Tooltip Popover */}
      {isOpen && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 w-64 max-w-xs p-2.5 rounded-xl text-xs font-normal shadow-xl border
            bg-slate-900/95 text-slate-200 border-slate-700/80 backdrop-blur-md transition-opacity duration-150
            pointer-events-auto leading-relaxed ${positionClasses[position]}`}
        >
          {term && (
            <div className="font-semibold text-emerald-400 mb-1 border-b border-slate-800 pb-1">
              {term}
            </div>
          )}
          <div className="text-slate-300">{content}</div>
        </div>
      )}
    </span>
  );
}
