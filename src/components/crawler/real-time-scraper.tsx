import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code, ExternalLink, FileText, Link2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlumniService } from "@/utils/api-service";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScrapedPage {
  url: string;
  title: string;
  type: "html" | "text" | "link";
  timestamp: string;
  size: string;
}

export function RealTimeScraper() {
  const [scrapedPages, setScrapedPages] = useState<ScrapedPage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [activeCrawler, setActiveCrawler] = useState("Not Active");
  const [stats, setStats] = useState({
    pagesScraped: 0,
    totalPages: 100,
    elapsedTime: "00:00:00",
    dataCollected: "0.0 MB",
    profilesFound: 0
  });
  
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const { data, error } = await AlumniService.getAll();
      
      if (error) {
        console.error("Error loading alumni data:", error);
        return;
      }
      
      if (data && data.length > 0) {
        // Update stats based on actual data
        const profilesFound = data.length;
        
        // Simulate some activity if we have alumni data
        setStats(prev => ({
          ...prev,
          profilesFound,
          pagesScraped: profilesFound * 3, // Assuming multiple pages per profile
          dataCollected: `${(profilesFound * 0.05).toFixed(1)} MB`, // Simulate data size
        }));
        
        setScrapingProgress(Math.min(Math.round((profilesFound * 3) / stats.totalPages * 100), 100));
        
        // Generate some sample scraped pages based on real data
        const newPages: ScrapedPage[] = data.slice(0, 3).map(alumni => ({
          url: `https://university.edu/alumni/${alumni.name.toLowerCase().replace(/\s+/g, '-')}`,
          title: `Alumni Profile: ${alumni.name}`,
          type: "html",
          timestamp: "Generated from database",
          size: `${Math.floor(Math.random() * 30) + 10} KB`
        }));
        
        setScrapedPages(newPages);
      }
    } catch (error) {
      console.error("Error in initial data load:", error);
    }
  };

  useEffect(() => {
    if (!isActive) return;
    
    // Start time counter
    const startTime = new Date();
    
    // Simulate real-time scraping with new pages every few seconds
    const interval = setInterval(async () => {
      try {
        // Get current alumni count
        const { data } = await AlumniService.getAll();
        const alumniCount = data?.length || 0;
        
        // Generate a realistic URL and title
        const newPage: ScrapedPage = {
          url: `https://university.edu/alumni/page-${Math.floor(Math.random() * 1000)}`,
          title: `Alumni Directory Page ${Math.floor(Math.random() * 50) + 1}`,
          type: Math.random() > 0.7 ? "link" : "html",
          timestamp: "Demonstration data",
          size: `${Math.floor(Math.random() * 50) + 10} KB`
        };
        
        setScrapedPages(prev => [newPage, ...prev.slice(0, 9)]);
        
        // Update elapsed time
        const elapsedMs = new Date().getTime() - startTime.getTime();
        const hours = Math.floor(elapsedMs / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedMs % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0');
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pagesScraped: prev.pagesScraped + 1,
          elapsedTime: `${hours}:${minutes}:${seconds}`,
          dataCollected: `${(parseFloat(prev.dataCollected) + 0.1).toFixed(1)} MB`,
          profilesFound: alumniCount
        }));
        
        // Update progress
        const newProgress = Math.min(Math.round((stats.pagesScraped / stats.totalPages) * 100), 100);
        setScrapingProgress(newProgress);
        
        // Auto-stop at 100%
        if (newProgress >= 100) {
          setIsActive(false);
          clearInterval(interval);
          toast({
            title: "Crawling Complete",
            description: "The crawler has completed its scraping task",
          });
        }
      } catch (error) {
        console.error("Error during simulated scraping:", error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isActive, stats.pagesScraped, stats.totalPages, toast]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'text':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'link':
        return <Link2 className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleToggleCrawler = () => {
    if (isActive) {
      setIsActive(false);
      setActiveCrawler("Not Active");
      toast({
        title: "Demonstration Paused",
        description: "Real-time demonstration has been paused",
      });
    } else {
      setIsActive(true);
      setActiveCrawler("Demo Mode");
      toast({
        title: "Demonstration Started",
        description: "This is showing simulated data for demonstration purposes",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Real-time Scraping</CardTitle>
          <Badge 
            variant={isActive ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={handleToggleCrawler}
          >
            {isActive ? "Demo Active" : "Demo Paused"}
          </Badge>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-muted-foreground">Current mode:</span>
          <span className="font-medium capitalize">{activeCrawler}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This component is currently showing demonstration data, not real crawling results. To see actual crawled data, use the Website Crawler tab.
          </AlertDescription>
        </Alert>
        
        <div className="mb-6 space-y-1">
          <div className="flex justify-between text-sm mb-1">
            <span>Demo Progress: {scrapingProgress}%</span>
            <span>{stats.pagesScraped} of {stats.totalPages} pages</span>
          </div>
          <Progress value={scrapingProgress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Elapsed Time</div>
            <div className="font-medium">{stats.elapsedTime}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Data Collected</div>
            <div className="font-medium">{stats.dataCollected}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Profiles Found</div>
            <div className="font-medium">{stats.profilesFound}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Pages/Minute</div>
            <div className="font-medium">
              {stats.elapsedTime === "00:00:00" ? "0" : 
                Math.floor(stats.pagesScraped / (
                  parseInt(stats.elapsedTime.split(':')[0]) * 60 + 
                  parseInt(stats.elapsedTime.split(':')[1]) || 1
                ))
              }
            </div>
          </div>
        </div>
        
        <h3 className="font-medium mb-2">Demo Scraped Pages</h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {scrapedPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pages scraped yet. Click "Demo Active" to start the demonstration.
            </div>
          ) : (
            scrapedPages.map((page, index) => (
              <div key={index} className="flex items-start text-sm border-b pb-2">
                <div className="mr-2 mt-0.5">{getTypeIcon(page.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{page.title} <span className="text-xs text-muted-foreground">(demo)</span></div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    <span className="truncate">{page.url}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{page.timestamp}</span>
                    <span>{page.size}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}