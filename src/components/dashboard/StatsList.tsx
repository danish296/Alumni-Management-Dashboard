
import { StatsCard } from "./StatsCard";
import { LucideIcon } from "lucide-react";

interface Stat {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface StatsListProps {
  stats: Stat[];
}

export function StatsList({ stats }: StatsListProps) {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="transition-all duration-300">
          <StatsCard
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
          />
        </div>
      ))}
    </div>
  );
}
