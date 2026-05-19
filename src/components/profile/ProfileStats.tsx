import { formatJoinDate } from "@/lib/constants";

interface ProfileStatsProps {
  activeCount: number;
  soldCount: number;
  joinDate: string;
}

export function ProfileStats({
  activeCount,
  soldCount,
  joinDate,
}: ProfileStatsProps) {
  const stats = [
    { label: "Active listings", value: activeCount },
    { label: "Sold", value: soldCount },
    { label: "Member since", value: formatJoinDate(joinDate), isText: true },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-earth-200/80 bg-white px-3 py-4 text-center shadow-sm sm:px-4"
        >
          <p
            className={`font-bold text-leaf-700 ${stat.isText ? "text-sm sm:text-base" : "text-2xl sm:text-3xl"}`}
          >
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-earth-800/60 sm:text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
