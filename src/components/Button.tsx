"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { Theme } from "@/types";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  theme: Theme;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  theme,
  icon,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = clsx(
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    {
      "w-full": fullWidth,
      // Size variants
      "px-3 py-1.5 text-sm": size === "sm",
      "px-4 py-2 text-base": size === "md",
      "px-6 py-3 text-lg": size === "lg",
    }
  );

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}dd)`,
          color: "#ffffff",
          border: "1px solid transparent",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        };
      case "secondary":
        return {
          backgroundColor: theme.secondary,
          color: theme.text,
          border: `1px solid ${theme.secondary}`,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: theme.primary,
          border: `1px solid ${theme.primary}`,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: theme.text,
          border: "1px solid transparent",
        };
      default:
        return {};
    }
  };

  const getHoverStyles = () => {
    switch (variant) {
      case "primary":
        return {
          transform: "translateY(-1px)",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
        };
      case "secondary":
        return {
          backgroundColor: `${theme.secondary}dd`,
        };
      case "outline":
        return {
          backgroundColor: `${theme.primary}10`,
        };
      case "ghost":
        return {
          backgroundColor: `${theme.secondary}40`,
        };
      default:
        return {};
    }
  };

  return (
    <button
      className={clsx(baseClasses, className)}
      style={{
        ...getVariantStyles(),
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, getHoverStyles());
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, getVariantStyles());
        }
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
