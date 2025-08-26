import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Lock, Globe, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CrawlerService, AlumniService } from "@/utils/api-service";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface WebsiteLoginImportProps {
  onImportComplete: (profiles: any[]) => void;
}

export function WebsiteLoginImport({ onImportComplete }: WebsiteLoginImportProps) {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keyword.trim()) {
      e.preventDefault();
      if (!keywords.includes(keyword.trim())) {
        setKeywords(prev => [...prev, keyword.trim()]);
        setKeyword("");
      }
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(prev => prev.filter(k => k !== keywordToRemove));
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !username || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Add https if not present
    let processedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      processedUrl = "https://" + url;
    }
    
    setIsLoading(true);
    
    try {
      const { data: responseData, error } = await CrawlerService.crawlWithLogin(
        processedUrl, 
        username, 
        password,
        keywords.length > 0 ? keywords : undefined
      );
      
      if (error) throw new Error(error);
      
      if (responseData && responseData.success && responseData.profiles && responseData.profiles > 0) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${responseData.profiles} alumni profiles${keywords.length > 0 ? ' matching keywords' : ''} (${responseData.results?.added} new, ${responseData.results?.duplicates} duplicates)`,
        });
        
        // Refresh alumni data in the parent component
        const { data: alumniData } = await AlumniService.getAll();
        if (alumniData) {
          // Format for the UI
          const formattedData = alumniData.map(alumni => ({
            id: alumni._id,
            name: alumni.name,
            batch: alumni.batch,
            department: alumni.department,
            email: alumni.email,
            company: alumni.company,
            position: alumni.position,
            lastUpdated: new Date(alumni.lastUpdated).toLocaleDateString(),
            profiles: alumni.profiles
          }));
          
          onImportComplete(formattedData);
          
          // Dispatch events for newly added alumni to trigger UI updates
          if (responseData.results?.added > 0) {
            formattedData.slice(0, responseData.results.added).forEach(alumni => {
              const event = new CustomEvent('newAlumniDiscovered', { 
                detail: alumni 
              });
              document.dispatchEvent(event);
              console.log("Dispatched alumni profile to update list:", alumni);
            });
          }
        }
        
        // Reset form
        setUrl("");
        setUsername("");
        setPassword("");
        setKeywords([]);
      } else {
        toast({
          title: responseData && responseData.message ? "Import Notice" : "No Profiles Found",
          description: responseData && responseData.message ? responseData.message : "No alumni profiles were found on this website",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to import alumni data from the website",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Website</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleImport} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="website-url" className="text-sm font-medium">
              Alumni Website URL
            </label>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Input
                id="website-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g., university.edu/alumni"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="website-username" className="text-sm font-medium">
              Username / Email
            </label>
            <Input
              id="website-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your login username"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="website-password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="website-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-9"
                disabled={isLoading}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your credentials are used only for this session and never stored.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="keywords" className="text-sm font-medium">
              Keywords (optional)
            </label>
            <Input
              id="keywords"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleAddKeyword}
              placeholder="Add keywords and press Enter"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Keywords help filter alumni by department, year, company, etc.
            </p>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((kw, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {kw}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveKeyword(kw)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Alumni Profiles"
            )}
          </Button>
        </form>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>This will attempt to log in to the specified website and extract alumni information. Works best with university alumni portals and directories.</p>
        </div>
      </CardContent>
    </Card>
  );
}