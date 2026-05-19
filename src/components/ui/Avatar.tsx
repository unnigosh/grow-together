import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { sm: 32, md: 40, lg: 64, xl: 112 };

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const px = sizes[size];
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "User"}
        width={px}
        height={px}
        className={`rounded-full object-cover ring-2 ring-leaf-100 ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-leaf-200 font-semibold text-leaf-800 ring-2 ring-leaf-100 ${className}`}
      style={{ width: px, height: px, fontSize: px * 0.35 }}
    >
      {initials}
    </div>
  );
}
