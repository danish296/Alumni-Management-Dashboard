
import { useState, useEffect } from "react";
import { Facebook, Linkedin, Instagram, Users } from "lucide-react";
import { AlumniService } from "@/utils/api-service";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { StatsList } from "@/components/dashboard/StatsList";
import { CrawlerStatusCard } from "@/components/dashboard/CrawlerStatusCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";

const Dashboard = () => {
  const [stats, setStats] = useState([
    { 
      title: "Total Alumni", 
      value: "0", 
      description: "Last updated today", 
      icon: Users,
      color: "bg-primary/10 text-primary"
    },
    { 
      title: "LinkedIn Profiles", 
      value: "0", 
      description: "0% of total alumni", 
      icon: Linkedin,
      color: "bg-blue-600/10 text-blue-600"
    },
    { 
      title: "Facebook Profiles", 
      value: "0", 
      description: "0% of total alumni", 
      icon: Facebook,
      color: "bg-blue-500/10 text-blue-500"
    },
    { 
      title: "Instagram Profiles", 
      value: "0", 
      description: "0% of total alumni", 
      icon: Instagram,
      color: "bg-pink-500/10 text-pink-500"
    },
  ]);

  const [crawlerStatus, setCrawlerStatus] = useState([
    { name: "LinkedIn Crawler", progress: 0, status: "Idle" },
    { name: "Facebook Crawler", progress: 0, status: "Idle" },
    { name: "Instagram Crawler", progress: 0, status: "Idle" },
  ]);

  const [recentActivities] = useState([
    { time: "Today", message: "Dashboard data refreshed" },
    { time: "Today", message: "System statistics updated" },
    { time: "Yesterday", message: "System maintenance completed" },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up event listener for real-time updates
    const handleNewAlumni = () => {
      fetchDashboardData();
    };
    
    document.addEventListener('newAlumniDiscovered', handleNewAlumni);
    
    // Set up periodic refresh every 60 seconds
    const intervalId = setInterval(fetchDashboardData, 60000);
    
    return () => {
      document.removeEventListener('newAlumniDiscovered', handleNewAlumni);
      clearInterval(intervalId);
    };
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch alumni data from API
      const { data, error } = await AlumniService.getAll();
      
      if (error) {
        console.error("Error fetching alumni data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch alumni data",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (data) {
        // Calculate stats based on actual data
        const totalAlumni = data.length;
        
        // Count profiles by platform
        const profileCounts = {
          linkedin: 0,
          facebook: 0,
          instagram: 0
        };
        
        data.forEach(alumni => {
          if (alumni.profiles) {
            alumni.profiles.forEach(profile => {
              if (profileCounts[profile] !== undefined) {
                profileCounts[profile]++;
              }
            });
          }
        });
        
        // Calculate percentages
        const linkedinPercentage = totalAlumni > 0 ? Math.round((profileCounts.linkedin / totalAlumni) * 100) : 0;
        const facebookPercentage = totalAlumni > 0 ? Math.round((profileCounts.facebook / totalAlumni) * 100) : 0;
        const instagramPercentage = totalAlumni > 0 ? Math.round((profileCounts.instagram / totalAlumni) * 100) : 0;
        
        // Update stats
        setStats([
          { 
            title: "Total Alumni", 
            value: totalAlumni.toString(), 
            description: "Last updated today", 
            icon: Users,
            color: "bg-primary/10 text-primary"
          },
          { 
            title: "LinkedIn Profiles", 
            value: profileCounts.linkedin.toString(), 
            description: `${linkedinPercentage}% of total alumni`, 
            icon: Linkedin,
            color: "bg-blue-600/10 text-blue-600"
          },
          { 
            title: "Facebook Profiles", 
            value: profileCounts.facebook.toString(), 
            description: `${facebookPercentage}% of total alumni`, 
            icon: Facebook,
            color: "bg-blue-500/10 text-blue-500"
          },
          { 
            title: "Instagram Profiles", 
            value: profileCounts.instagram.toString(), 
            description: `${instagramPercentage}% of total alumni`, 
            icon: Instagram,
            color: "bg-pink-500/10 text-pink-500"
          },
        ]);
        
        // Update crawler status based on profile counts
        setCrawlerStatus([
          { 
            name: "LinkedIn Crawler", 
            progress: linkedinPercentage, 
            status: profileCounts.linkedin > 0 ? "Active" : "Idle" 
          },
          { 
            name: "Facebook Crawler", 
            progress: facebookPercentage, 
            status: profileCounts.facebook > 0 ? "Active" : "Idle" 
          },
          { 
            name: "Instagram Crawler", 
            progress: instagramPercentage, 
            status: profileCounts.instagram > 0 ? "Active" : "Idle" 
          },
        ]);
      }
    } catch (error) {
      console.error("Error in dashboard data fetch:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to AlmaDatum portal. Monitor your alumni data collection.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <StatsList stats={stats} />
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <CrawlerStatusCard crawlerStatus={crawlerStatus} isMobile={isMobile} />
            <RecentActivityCard activities={recentActivities} isMobile={isMobile} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
