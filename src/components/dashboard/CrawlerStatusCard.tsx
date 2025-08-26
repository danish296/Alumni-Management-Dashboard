
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CrawlerStatus {
  name: string;
  progress: number;
  status: string;
}

interface CrawlerStatusCardProps {
  crawlerStatus: CrawlerStatus[];
  isMobile: boolean;
}

export function CrawlerStatusCard({ crawlerStatus, isMobile }: CrawlerStatusCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:border-primary/50">
      <CardHeader className={isMobile ? "p-4" : ""}>
        <CardTitle>Crawler Status</CardTitle>
        <CardDescription>Real-time status of data collection</CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 pb-4 pt-0" : ""}>
        <div className="space-y-4 md:space-y-6">
          {crawlerStatus.map((crawler, i) => (
            <div key={i} className="space-y-2 transition-all duration-200 hover:bg-accent/10 p-2 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{crawler.name}</span>
                <span className={`text-xs ${crawler.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'} px-2 py-1 rounded-full`}>
                  {crawler.status}
                </span>
              </div>
              <Progress value={crawler.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {crawler.progress}% complete
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
