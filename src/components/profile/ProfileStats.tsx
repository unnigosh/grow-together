import { formatJoinDate } from "@/lib/constants";

interface ProfileStatsProps {
  postCount: number;
  questionCount: number;
  listingCount: number;
  plantCount: number | null; // null = not shown (other user's profile)
  joinDate: string;
}

export function ProfileStats({
  postCount,
  questionCount,
  listingCount,
  plantCount,
  joinDate,
}: ProfileStatsProps) {
  const stats = [
    { label: "Posts",     value: postCount     },
    { label: "Questions", value: questionCount  },
    { label: "Listings",  value: listingCount   },
    ...(plantCount !== null
      ? [{ label: "Plants", value: plantCount }]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 sm:gap-4 ${plantCount !== null ? "grid-cols-4" : "grid-cols-3"}`}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-earth-200/80 bg-white px-2 py-4 text-center shadow-sm sm:px-4"
          >
            <p className="text-2xl font-bold text-leaf-700 sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-earth-800/60 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-earth-800/40 sm:text-left">
        Member since {formatJoinDate(joinDate)}
      </p>
    </div>
  );
}
