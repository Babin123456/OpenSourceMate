"use client";

import React, { useState } from "react";

export interface PrintReportButtonProps {
  className?: string;
  reportTitle?: string;
  targetSelector?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

/**
 * PrintReportButton component.
 *
 * Allows users to trigger native browser print/PDF export for analysis results,
 * with accessible labeling, keyboard activation, and status feedback.
 */
export default function PrintReportButton({
  className = "",
  reportTitle = "OpenSourceMate Analysis Report",
  targetSelector,
  onBeforePrint,
  onAfterPrint,
}: PrintReportButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    onBeforePrint?.();

    // Set page title temporarily if needed for PDF filename
    const originalTitle = typeof document !== "undefined" ? document.title : "";
    if (reportTitle && typeof document !== "undefined") {
      document.title = reportTitle;
    }

    setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          window.print();
        }
      } finally {
        setIsPrinting(false);
        onAfterPrint?.();
        if (originalTitle && typeof document !== "undefined") {
          document.title = originalTitle;
        }
      }
    }, 100);
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={isPrinting}
      aria-label="Print or save analysis results as PDF"
      title="Print or export as PDF"
      className={`no-print inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors
        focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
        border-slate-700/60 bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-700/60
        ${className}`}
    >
      <svg
        aria-hidden="true"
        className="w-4 h-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      <span>{isPrinting ? "Preparing..." : "Print / PDF"}</span>
    </button>
  );
}
