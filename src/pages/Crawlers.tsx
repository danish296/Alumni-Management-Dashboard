import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { CrawlerDataPreview } from "@/components/crawler/crawler-data-preview";
import { WebsiteCrawler } from "@/components/crawler/website-crawler";
import { useIsMobile } from "@/hooks/use-mobile";

const Crawlers = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Web Crawler</h1>
        <p className="text-muted-foreground">
          Scan websites for alumni data using keywords and import it into your database
        </p>
      </div>

      {isMobile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                For better experience with the crawler configuration, please use a desktop device.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <div className={isMobile ? "" : "md:col-span-2"}>
          <Card>
            <CardHeader>
              <CardTitle>Website Crawler</CardTitle>
              <CardDescription>
                Enter a URL and keywords to scan for alumni information from public or password-protected pages. 
                Use keywords to filter results to specific alumni matching your criteria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebsiteCrawler />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <CrawlerDataPreview />
        </div>
      </div>
    </div>
  );
};

export default Crawlers;
