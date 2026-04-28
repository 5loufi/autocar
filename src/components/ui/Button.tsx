"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  ghost:     "btn-ghost",
  danger:    "inline-flex items-center gap-2 px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/25 text-rose-400 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40",
};
const sizeClasses = {
  sm: "!px-3 !py-1.5 !text-xs",
  md: "",
  lg: "!px-5 !py-3 !text-base",
};

export function Button({ variant = "primary", size = "md", loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}
