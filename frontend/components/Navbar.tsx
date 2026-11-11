import React from "react";
import Link from "next/link";
import GitHubLink from "./GitHubLink";
import ThemeToggle from "./ThemeToggle";
import BuildVersionBadge from "./BuildVersionBadge";

export interface NavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onNavigateSection?: (sectionId: string) => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  mobileMenuOpen,
  onToggleMobileMenu,
  onNavigateSection,
  activeSection,
}) => {
  const isDark = theme === "dark";

  return (
    <nav
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 ${
        isDark
          ? "bg-slate-950/80 border-slate-800"
          : "bg-white/80 border-slate-200"
      }`}
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group font-bold text-lg tracking-tight"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                OS
              </div>
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                OpenSourceMate
              </span>
            </Link>
            <BuildVersionBadge />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a
              href="#analyzer"
              onClick={(e) => {
                e.preventDefault();
                onNavigateSection?.("analyzer");
              }}
              className={`transition-colors ${
                activeSection === "analyzer"
                  ? isDark
                    ? "text-emerald-400"
                    : "text-emerald-600"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Profile Analyzer
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                onNavigateSection?.("how-it-works");
              }}
              className={`transition-colors ${
                activeSection === "how-it-works"
                  ? isDark
                    ? "text-emerald-400"
                    : "text-emerald-600"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              How It Works
            </a>
            <Link
              href="/compare"
              className={`transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Compare
            </Link>
            <Link
              href="/contribute"
              className={`transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Contribute
            </Link>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                onNavigateSection?.("faq");
              }}
              className={`transition-colors ${
                activeSection === "faq"
                  ? isDark
                    ? "text-emerald-400"
                    : "text-emerald-600"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              FAQ
            </a>
          </div>

          {/* Right actions: Theme toggle and GitHub Link */}
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

            <GitHubLink theme={theme} />

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={onToggleMobileMenu}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                className={`p-2 rounded-xl border ${
                  isDark
                    ? "border-slate-800 text-slate-400 hover:text-slate-200"
                    : "border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 pt-2 pb-4 space-y-2 ${
            isDark
              ? "bg-slate-950 border-slate-800 text-slate-300"
              : "bg-white border-slate-200 text-slate-700"
          }`}
        >
          <a
            href="#analyzer"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.("analyzer");
              onToggleMobileMenu();
            }}
            className="block py-2 text-sm font-medium hover:text-emerald-400"
          >
            Profile Analyzer
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.("how-it-works");
              onToggleMobileMenu();
            }}
            className="block py-2 text-sm font-medium hover:text-emerald-400"
          >
            How It Works
          </a>
          <Link
            href="/compare"
            onClick={onToggleMobileMenu}
            className="block py-2 text-sm font-medium hover:text-emerald-400"
          >
            Compare Profiles
          </Link>
          <Link
            href="/contribute"
            onClick={onToggleMobileMenu}
            className="block py-2 text-sm font-medium hover:text-emerald-400"
          >
            Contribute
          </Link>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.("faq");
              onToggleMobileMenu();
            }}
            className="block py-2 text-sm font-medium hover:text-emerald-400"
          >
            FAQ
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
