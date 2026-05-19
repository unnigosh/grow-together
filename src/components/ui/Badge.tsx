interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "sold" | "category";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const styles = {
    default: "bg-leaf-100 text-leaf-800",
    sold: "bg-earth-200 text-earth-800",
    category: "bg-white/90 text-leaf-700 backdrop-blur-sm",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
