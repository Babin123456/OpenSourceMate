import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "blue" | "purple" | "amber" | "rose" | "slate";
  size?: "sm" | "md";
  theme?: "dark" | "light";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "emerald",
  size = "sm",
  theme = "dark",
  className = "",
  ...props
}) => {
  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-medium",
    md: "px-3 py-1 text-sm font-semibold",
  }[size];

  const variantClasses = {
    emerald: isDark
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blue: isDark
      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      : "bg-blue-50 text-blue-700 border border-blue-200",
    purple: isDark
      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
      : "bg-purple-50 text-purple-700 border border-purple-200",
    amber: isDark
      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      : "bg-amber-50 text-amber-700 border border-amber-200",
    rose: isDark
      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
      : "bg-rose-50 text-rose-700 border border-rose-200",
    slate: isDark
      ? "bg-slate-800 text-slate-300 border border-slate-700"
      : "bg-slate-100 text-slate-700 border border-slate-200",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
