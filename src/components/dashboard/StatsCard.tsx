
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export function StatsCard({ title, value, description, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-y-[-3px] border-l-4 border-l-primary/70">
      <CardContent className="p-4 md:p-6 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-xl md:text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={cn(`rounded-full p-2 ${color}`, "transition-transform duration-200 hover:scale-105")}>
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
