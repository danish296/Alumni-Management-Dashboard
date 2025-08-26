import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Linkedin, Instagram, User, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileData {
  position?: string;
  company?: string;
  location?: string;
  education?: string;
  previousCompany?: string;
  followers?: number;
  bio?: string;
  keywords?: string[];
}

interface Profile {
  id: number;
  name: string;
  platform: "linkedin" | "facebook" | "instagram" | "website";
  timestamp: string;
  newlyDiscovered: boolean;
  data: ProfileData;
}

const initialProfiles: Profile[] = [
  {
    id: 1,
    name: "Alex Johnson",
    platform: "linkedin",
    timestamp: "Just now",
    newlyDiscovered: true,
    data: {
      position: "Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      education: "Computer Science, Stanford University",
      keywords: ["engineer", "computer science"]
    }
  },
  {
    id: 2,
    name: "Sarah Williams",
    platform: "facebook",
    timestamp: "2 minutes ago",
    newlyDiscovered: false,
    data: {
      location: "Boston, MA",
      education: "MBA, Harvard Business School",
      previousCompany: "McKinsey & Co.",
      keywords: ["business", "marketing"]
    }
  },
  {
    id: 3,
    name: "Michael Chen",
    platform: "linkedin",
    timestamp: "5 minutes ago",
    newlyDiscovered: true,
    data: {
      position: "Product Manager",
      company: "Apple",
      location: "Cupertino, CA",
      education: "Engineering, MIT",
      keywords: ["product", "engineering"]
    }
  },
  {
    id: 4,
    name: "Emma Rodriguez",
    platform: "website",
    timestamp: "10 minutes ago",
    newlyDiscovered: false,
    data: {
      followers: 2500,
      bio: "Class of 2020 | Marketing Professional",
      location: "New York, NY",
      keywords: ["marketing", "2020"]
    }
  }
];

// Function to generate a new demo profile (for demonstration purposes only)
const generateNewProfile = (): Profile => {
  const randomId = Math.floor(Math.random() * 10000);
  const platforms = ["linkedin", "facebook", "instagram", "website"] as const;
  const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
  
  const names = [
    "David Smith", "Jessica Brown", "Thomas Wilson", 
    "Jennifer Davis", "Robert Miller", "Patricia Moore",
    "Emily Taylor", "James Anderson", "Lisa White"
  ];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  const companies = ["Microsoft", "Amazon", "Netflix", "Adobe", "Salesforce", "IBM", "Oracle"];
  const positions = ["Software Developer", "Data Scientist", "Product Manager", "UX Designer", "Marketing Specialist"];
  const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Boston, MA", "Austin, TX"];
  const educations = [
    "Computer Science, MIT", 
    "Business Administration, Harvard", 
    "Engineering, Stanford",
    "Data Science, UC Berkeley",
    "Design, Rhode Island School of Design"
  ];

  const keywordsList = [
    ["developer", "coding", "tech"],
    ["data", "analytics", "machine learning"],
    ["product", "management", "strategy"],
    ["design", "user experience", "creative"],
    ["marketing", "social media", "content"]
  ];
  
  const data: ProfileData = {
    keywords: keywordsList[Math.floor(Math.random() * keywordsList.length)]
  };
  
  if (randomPlatform === "linkedin") {
    data.position = positions[Math.floor(Math.random() * positions.length)];
    data.company = companies[Math.floor(Math.random() * companies.length)];
    data.location = locations[Math.floor(Math.random() * locations.length)];
    data.education = educations[Math.floor(Math.random() * educations.length)];
  } else if (randomPlatform === "facebook") {
    data.location = locations[Math.floor(Math.random() * locations.length)];
    data.education = educations[Math.floor(Math.random() * educations.length)];
    data.previousCompany = companies[Math.floor(Math.random() * companies.length)];
  } else if (randomPlatform === "website") {
    data.position = positions[Math.floor(Math.random() * positions.length)];
    data.company = companies[Math.floor(Math.random() * companies.length)];
    data.education = educations[Math.floor(Math.random() * educations.length)];
  } else {
    data.followers = Math.floor(Math.random() * 5000) + 500;
    data.bio = `Class of ${2010 + Math.floor(Math.random() * 13)} | ${positions[Math.floor(Math.random() * positions.length)]}`;
    data.location = locations[Math.floor(Math.random() * locations.length)];
  }
  
  return {
    id: randomId,
    name: randomName,
    platform: randomPlatform,
    timestamp: "Just now",
    newlyDiscovered: true,
    data
  };
};

interface PlatformIconProps {
  platform: "linkedin" | "facebook" | "instagram" | "website";
}

const PlatformIcon = ({ platform }: PlatformIconProps) => {
  switch (platform) {
    case "linkedin":
      return <Linkedin className="h-4 w-4 text-blue-600" />;
    case "facebook":
      return <Facebook className="h-4 w-4 text-blue-500" />;
    case "instagram":
      return <Instagram className="h-4 w-4 text-pink-500" />;
    case "website":
      return <User className="h-4 w-4 text-gray-500" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

export function CrawlerDataPreview() {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isDemoMode, setIsDemoMode] = useState(true);

  const addNewProfile = () => {
    const newProfile = generateNewProfile();
    setProfiles(prev => {
      const updated = [newProfile, ...prev];
      if (updated.length > 10) {
        return updated.slice(0, 10);
      }
      return updated;
    });
    
    const alumniData = {
      id: newProfile.id,
      name: newProfile.name,
      batch: `20${Math.floor(Math.random() * 10) + 10}`,
      department: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Information Technology"][Math.floor(Math.random() * 4)],
      email: `${newProfile.name.toLowerCase().replace(' ', '.')}@example.com`,
      company: newProfile.data.company || "Unknown",
      position: newProfile.data.position || "Professional",
      lastUpdated: "Just now",
      profiles: [newProfile.platform],
      keywords: newProfile.data.keywords
    };
    
    const event = new CustomEvent('newAlumniDiscovered', { 
      detail: alumniData 
    });
    document.dispatchEvent(event);
    
    console.log("Dispatched newAlumniDiscovered event with data:", alumniData);
    
    toast({
      title: "New Profile Discovered",
      description: `${newProfile.name} was found on ${newProfile.platform.charAt(0).toUpperCase() + newProfile.platform.slice(1)}`,
    });
  };

  useEffect(() => {
    let intervalId: number | undefined;
    
    if (isAutoRefreshing) {
      intervalId = window.setInterval(() => {
        addNewProfile();
      }, 8000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRefreshing]);

  const toggleAutoRefresh = () => {
    setIsAutoRefreshing(prev => !prev);
    
    if (!isAutoRefreshing) {
      toast({
        title: "Auto-discovery Enabled",
        description: "New profiles will be discovered automatically",
      });
    } else {
      toast({
        title: "Auto-discovery Disabled",
        description: "Profile discovery has been paused",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className={`text-lg ${isMobile ? 'w-full' : ''}`}>Real-time Crawler Data</CardTitle>
          <div>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={toggleAutoRefresh}
              className={isAutoRefreshing ? "bg-green-50 text-green-700 border-green-200" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isAutoRefreshing ? "animate-spin" : ""}`} />
              {isMobile ? (isAutoRefreshing ? "Auto" : "Start") : (isAutoRefreshing ? "Auto-discovering" : "Start Auto-discovery")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Currently showing demonstration data. To see actual crawled profiles, use the Website Crawler tab with keywords to filter results.
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground mb-2 flex justify-between items-center">
          <span className={isMobile ? "text-xs" : ""}>
            <Badge variant="outline" className="mr-2 bg-yellow-50 text-yellow-800 border-yellow-200">
              DEMO MODE
            </Badge>
            Showing simulated profile data with keywords
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={addNewProfile} 
            className="h-8 px-2"
            title="Add a sample profile"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className={`p-3 rounded-md border ${profile.newlyDiscovered ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/20' : 'bg-background'}`}
            >
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${
                    profile.platform === 'linkedin' ? 'bg-blue-100 text-blue-600' :
                    profile.platform === 'facebook' ? 'bg-blue-100 text-blue-500' :
                    profile.platform === 'instagram' ? 'bg-pink-100 text-pink-500' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <PlatformIcon platform={profile.platform} />
                  </div>
                  <div>
                    <div className="font-medium">{profile.name} <span className="text-xs text-muted-foreground">(demo)</span></div>
                    <div className="text-xs text-muted-foreground">
                      Generated {profile.timestamp}
                    </div>
                  </div>
                </div>
                {profile.newlyDiscovered && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Demo Profile
                  </Badge>
                )}
              </div>
              
              <div className="mt-2 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(profile.data).map(([key, value]) => {
                    if (key === 'keywords' && Array.isArray(value)) {
                      return (
                        <div key={key} className="col-span-2 mt-1">
                          <span className="text-xs font-medium text-muted-foreground capitalize mr-1">
                            Keywords:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {value.map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={key} className={`flex items-start ${isMobile ? 'col-span-2' : ''}`}>
                        <span className="text-xs font-medium text-muted-foreground capitalize mr-1">
                          {key}:
                        </span>
                        <span className="text-xs">{value as string}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
