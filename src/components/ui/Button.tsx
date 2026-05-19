import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-leaf-600 text-white hover:bg-leaf-700 focus-visible:ring-leaf-500",
  secondary:
    "bg-earth-100 text-earth-900 hover:bg-earth-200 focus-visible:ring-earth-300",
  outline:
    "border border-leaf-300 bg-white text-leaf-700 hover:bg-leaf-50 focus-visible:ring-leaf-400",
  ghost: "text-leaf-700 hover:bg-leaf-50 focus-visible:ring-leaf-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
