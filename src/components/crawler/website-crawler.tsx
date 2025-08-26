import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Globe, Loader2, Info, Search, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { CrawlService, CrawlResult } from "@/utils/crawl-service";
import { Badge } from "@/components/ui/badge";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form schema with validation
const formSchema = z.object({
  url: z.string().min(3, "URL must be at least 3 characters").refine(
    (value) => {
      try {
        // Add https:// if not present for URL validation
        const urlToCheck = value.startsWith('http') ? value : `https://${value}`;
        new URL(urlToCheck);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Please enter a valid URL" }
  ),
  username: z.string().optional(),
  password: z.string().optional(),
  keyword: z.string().optional(),
});

export function WebsiteCrawler() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [tab, setTab] = useState("public");
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      username: "",
      password: "",
      keyword: "",
    },
  });
  
  const addKeyword = () => {
    if (currentKeyword && !keywords.includes(currentKeyword)) {
      setKeywords([...keywords, currentKeyword]);
      setCurrentKeyword("");
    }
  };
  
  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };
  
  const startCrawl = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setProgress(10);
    setResult(null);
    setError(null);

    try {
      // Validate URL format
      let processedUrl = values.url;
      if (!/^https?:\/\//i.test(values.url)) {
        processedUrl = "https://" + values.url;
      }      

      const crawlOptions = {
        url: processedUrl,
        keywords: keywords,
        ...(tab === "protected" && {
          credentials: {
            username: values.username || "",
            password: values.password || ""
          }
        })
      };

      // Show a toast to indicate crawling has started
      toast({
        title: "Crawling Started",
        description: `Crawling ${processedUrl} with ${keywords.length} keywords. This might take a few moments.`,
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      console.log("Starting crawl with options:", crawlOptions);
      const crawlResult = await CrawlService.crawlWebsite(crawlOptions);
      setProgress(100);
      clearInterval(progressInterval);

      console.log("Crawl result:", crawlResult);

      if (crawlResult.success) {
        setResult(crawlResult);
        toast({
          title: "Crawl Completed",
          description: crawlResult.message || "Website crawled successfully",
        });
      } else {
        setError(crawlResult.message || "Failed to crawl website");
        toast({
          title: "Crawl Failed",
          description: crawlResult.message || "Failed to crawl website",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Crawl error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Crawler</CardTitle>
        <CardDescription>
          Crawl any website to find alumni information. Enter a URL to start.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            The crawler will search for alumni data based on your keywords. Add keywords like "alumni", "graduates", or specific class years to improve search results.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="public" value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="public">Public Website</TabsTrigger>
            <TabsTrigger value="protected">Protected Website</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <TabsContent value="public">
              <form onSubmit={form.handleSubmit(startCrawl)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <div className="flex gap-2">
                        <Globe className="h-4 w-4 mt-2.5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="university.edu/alumni"
                            disabled={isLoading}
                            className="flex-1"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Enter the URL of the alumni directory or page containing alumni information.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="keywords">Search Keywords (Optional)</Label>
                  <div className="flex gap-2">
                    <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
                    <Input
                      id="keywords"
                      placeholder="Add keywords like 'alumni', 'class of 2020', etc."
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addKeyword}
                      disabled={!currentKeyword || isLoading}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keywords help filter pages that might contain alumni profiles. Press Enter to add.
                  </p>
                  
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Crawling in progress...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Crawling Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Crawling...
                    </>
                  ) : (
                    "Start Crawling"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="protected">
              <form onSubmit={form.handleSubmit(startCrawl)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <div className="flex gap-2">
                        <Globe className="h-4 w-4 mt-2.5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="alumni.university.edu/login"
                            disabled={isLoading}
                            className="flex-1"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username / Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter username or email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Credentials are used only for this session and never stored.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="protected-keywords">Search Keywords (Optional)</Label>
                  <div className="flex gap-2">
                    <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
                    <Input
                      id="protected-keywords"
                      placeholder="Add keywords like 'alumni', 'class of 2020', etc."
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addKeyword}
                      disabled={!currentKeyword || isLoading}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Crawling in progress...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Crawling Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in & Crawling...
                    </>
                  ) : (
                    "Login & Crawl"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Form>
        </Tabs>

        {/* Show crawl results */}
        {result && (
          <div className="mt-6 border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Crawl Results</h3>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {result.metadata?.pagesScraped} Pages Scraped
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Start Time:</span>
                <p>{new Date(result.metadata?.startTime || "").toLocaleTimeString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">End Time:</span>
                <p>{new Date(result.metadata?.endTime || "").toLocaleTimeString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Data Collected:</span>
                <p>{result.metadata?.dataCollected}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Profiles Found:</span>
                <p>{result.metadata?.profilesFound || 0}</p>
              </div>
            </div>
            
            {result.pages && result.pages.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium mb-2">Pages Crawled:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {result.pages.map((page, index) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded-md">
                      <div className="font-medium">{page.title}</div>
                      <div className="text-muted-foreground truncate">{page.url}</div>
                      <div className="flex justify-between mt-1">
                        <span>{page.type}</span>
                        <span>{page.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No detailed page data available</AlertTitle>
                <AlertDescription>
                  {result.profiles && result.profiles.length > 0 
                    ? `${result.profiles.length} alumni profiles were found and added to your database.` 
                    : "No alumni profiles were found on this website."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
        <div className="text-xs text-muted-foreground">
          <strong>Note:</strong> The crawler respects robots.txt and crawl delays to prevent overloading websites.
        </div>
      </CardFooter>
    </Card>
  );
}