
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  time: string;
  message: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
  isMobile: boolean;
}

export function RecentActivityCard({ activities, isMobile }: RecentActivityCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:border-primary/50">
      <CardHeader className={isMobile ? "p-4" : ""}>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest crawler activities</CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 pb-4 pt-0" : ""}>
        <div className="space-y-3 md:space-y-4">
          {activities.map((activity, i) => (
            <div 
              key={i} 
              className="flex items-start gap-2 transition-all duration-200 hover:bg-accent/20 p-2 rounded-md"
            >
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
