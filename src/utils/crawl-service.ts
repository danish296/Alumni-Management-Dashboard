import { CrawlerService } from './api-service';

// Enhanced crawl service for integration between crawler and alumni components

export interface CrawlOptions {
  url: string;
  depth?: number;
  maxPages?: number;
  filters?: string[];
  credentials?: {
    username?: string;
    password?: string;
  };
}

interface ApiResponseWithData {
  success: boolean;
  message?: string;
  data?: any;
  profiles?: number;
}

export interface CrawlResult {
  success: boolean;
  message: string;
  pages?: {
    url: string;
    title: string;
    type: "html" | "text" | "link";
    timestamp: string;
    size: string;
  }[];
  metadata?: {
    startTime: string;
    endTime: string;
    pagesScraped: number;
    dataCollected: string;
    profilesFound: number;
  };
  profiles?: AlumniProfile[];
  data?: {
    success?: boolean;
    message?: string;
    data?: any[];
    profiles?: number;
    results?: {
      added: number;
      duplicates: number;
      errors: number;
    };
  };
}

export interface AlumniProfile {
  id: number;
  name: string;
  batch?: string;
  department?: string;
  email: string;
  company?: string;
  position?: string;
  profileUrl?: string;
  platform: "linkedin" | "facebook" | "instagram" | "website";
  profiles?: string[];
}

export class CrawlService {
  static async crawlWebsite(options: CrawlOptions): Promise<CrawlResult> {
    console.log("Calling crawl API with options:", options);
    
    try {
      // If credentials are provided, use the login crawler
      if (options.credentials && options.credentials.username && options.credentials.password) {
        console.log("Using authenticated crawler for protected website");
        const response = await CrawlerService.crawlWithLogin(
          options.url, 
          options.credentials.username, 
          options.credentials.password
        );
        
        // Ensure `data` exists on the response object
        const { data, error } = response;

        if (error || !data) {
          console.error("Error from crawlWithLogin:", error);
          return {
            success: false,
            message: error || 'Failed to crawl protected website',
          };
        }

        // If the data contains rows, it's likely from a table
        if (data && data.data && Array.isArray(data.data)) {
          console.log("Received tabular data from protected website crawler:", data);
          
          // Parse alumni profiles from the rows
          const profiles = this.parseAlumniProfilesFromTable(data.data);
          
          return {
            success: true,
            message: `Successfully crawled website and found ${profiles.length} potential alumni profiles`,
            profiles: profiles,
            data: data, // Include the raw data in the response
            metadata: {
              startTime: new Date(Date.now() - 60000).toISOString(),
              endTime: new Date().toISOString(),
              pagesScraped: 1,
              dataCollected: "0.5 MB",
              profilesFound: profiles.length
            }
          };
        }

        return {
          success: data.success,
          message: data.message || "Crawl completed successfully",
          data: data, // Include the raw data
          metadata: {
            startTime: new Date(Date.now() - 60000).toISOString(),
            endTime: new Date().toISOString(),
            pagesScraped: data.profiles || 0,
            dataCollected: "0.5 MB",
            profilesFound: data.profiles || 0
          }
        };
      }
      
      // Otherwise use general crawl (no login required)
      console.log("Using general crawler for public website");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/crawler/general-crawl`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: options.url })
        });
        
        if (!response.ok) {
          console.error("Error response from general-crawl:", response.statusText);
          return {
            success: false,
            message: `Failed to crawl website: ${response.statusText}`,
          };
        }
        
        const data = await response.json();
        console.log("Response from general-crawl:", data);
        
        // Extract potential alumni-related links from the response
        const alumniLinks = (data.links || []).filter((link: string) => 
          link.toLowerCase().includes('alumni') || 
          link.toLowerCase().includes('graduate') || 
          link.toLowerCase().includes('directory')
        );
        
        // Create pages array from links
        const pages = alumniLinks.map((link: string, index: number) => ({
          url: link,
          title: `Alumni Link ${index + 1}`,
          type: "link" as "html" | "text" | "link",
          timestamp: new Date().toISOString(),
          size: "N/A"
        }));
        
        return {
          success: data.success,
          message: data.success 
            ? `Crawl completed successfully. Found ${alumniLinks.length} potential alumni-related links.` 
            : data.message,
          pages: pages.length > 0 ? pages : data.pages,
          data: data, // Include the raw data
          metadata: {
            startTime: new Date(Date.now() - 60000).toISOString(),
            endTime: new Date().toISOString(),
            pagesScraped: pages.length || 1,
            dataCollected: "0.1 MB",
            profilesFound: 0
          }
        };
      } catch (fetchError) {
        console.error("Fetch error in general-crawl:", fetchError);
        return {
          success: false,
          message: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to connect to crawler API'}`,
        };
      }
    } catch (error) {
      console.error("Error in crawlWebsite:", error);
      return {
        success: false,
        message: `Error during crawl: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      };
    }
  }
  
  static parseAlumniProfilesFromTable(rows: string[][]): AlumniProfile[] {
    console.log("Parsing alumni profiles from table data:", rows);
    
    // Skip header row if it exists
    const dataRows = rows.length > 0 && this.isLikelyHeaderRow(rows[0]) ? rows.slice(1) : rows;
    
    return dataRows.map((row, index) => {
      // Try to identify columns based on content
      const nameIndex = this.findColumnIndex(row, ['name', 'student', 'alumni', 'person']);
      const emailIndex = this.findColumnIndex(row, ['email', 'mail', '@']);
      const batchIndex = this.findColumnIndex(row, ['batch', 'year', 'class', 'graduation']);
      const departmentIndex = this.findColumnIndex(row, ['department', 'dept', 'major', 'discipline', 'subject']);
      const companyIndex = this.findColumnIndex(row, ['company', 'employer', 'organization', 'workplace']);
      const positionIndex = this.findColumnIndex(row, ['position', 'job', 'role', 'title', 'designation']);
      
      // Get the values if indices were found
      const name = nameIndex >= 0 ? row[nameIndex] : `Alumni ${index + 1}`;
      const email = emailIndex >= 0 ? row[emailIndex] : '';
      
      return {
        id: index + 1000,
        name,
        batch: batchIndex >= 0 ? row[batchIndex] : undefined,
        department: departmentIndex >= 0 ? row[departmentIndex] : undefined,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        company: companyIndex >= 0 ? row[companyIndex] : undefined,
        position: positionIndex >= 0 ? row[positionIndex] : undefined,
        platform: "website",
        profiles: ["website"]
      };
    });
  }
  
  static isLikelyHeaderRow(row: string[]): boolean {
    const headerKeywords = ['name', 'email', 'batch', 'year', 'department', 'company', 'position'];
    return row.some(cell => 
      headerKeywords.some(keyword => 
        cell.toLowerCase().includes(keyword)
      )
    );
  }
  
  static findColumnIndex(row: string[], keywords: string[]): number {
    for (let i = 0; i < row.length; i++) {
      if (row[i] && keywords.some(keyword => 
        row[i].toLowerCase().includes(keyword.toLowerCase())
      )) {
        return i;
      }
    }
    return -1;
  }
  
  static async importFromWebsiteCredentials(url: string, username: string, password: string): Promise<AlumniProfile[]> {
    console.log(`Calling API to import from website ${url} with credentials`);
    
    const response = await CrawlerService.crawlWithLogin(
      url, 
      username, 
      password
    );
    
    // Ensure `data` exists on the response object
    const { data, error } = response;
    
    if (error || !data || !data.success) {
      throw new Error(error || 'Failed to import from website');
    }
    
    // If the API returned table data
    if (data && data.data && Array.isArray(data.data)) {
      return this.parseAlumniProfilesFromTable(data.data);
    }
    
    // Return empty array if no data could be parsed
    return [];
  }
  
  static async startAutomatedCrawl(
    platform: "linkedin" | "facebook" | "instagram", 
    searchTerms: string,
    maxProfiles: number
  ): Promise<boolean> {
    console.log(`Starting automated crawl for ${platform} with search terms: ${searchTerms}`);
    
    try {
      // Log the attempt to the console
      console.log(`[CRAWLER] Starting automated crawl on ${platform}. This would connect to real ${platform} API with the following parameters:`);
      console.log(`[CRAWLER] - Platform: ${platform}`);
      console.log(`[CRAWLER] - Search Terms: ${searchTerms}`);
      console.log(`[CRAWLER] - Max Profiles: ${maxProfiles}`);
      console.log(`[CRAWLER] Note: This is a demonstration. In a production environment, this would initiate real API calls.`);
      
      // Simulate starting a background crawl process
      setTimeout(() => {
        // Generate a few mock profiles and dispatch events
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.dispatchMockProfileFound(platform);
          }, (i + 1) * 3000); // Dispatch every 3 seconds
        }
      }, 1000);
      
      return Promise.resolve(true);
    } catch (error) {
      console.error(`[CRAWLER] Error starting ${platform} crawler:`, error);
      return Promise.resolve(false);
    }
  }
  
  private static dispatchMockProfileFound(platform: "linkedin" | "facebook" | "instagram") {
    const firstNames = ["Alex", "Emma", "James", "Olivia", "Noah", "Sophia", "Lucas", "Isabella", "Mason", "Ava"];
    const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    
    const alumniData = {
      id: Math.floor(Math.random() * 10000),
      name,
      batch: `20${Math.floor(Math.random() * 10) + 10}`,
      department: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Information Technology"][Math.floor(Math.random() * 4)],
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      company: ["Google", "Microsoft", "Apple", "Amazon", "Facebook"][Math.floor(Math.random() * 5)],
      position: ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "Systems Architect"][Math.floor(Math.random() * 5)],
      lastUpdated: "Just now",
      profiles: [platform]
    };
    
    const event = new CustomEvent('newAlumniDiscovered', { detail: alumniData });
    document.dispatchEvent(event);
    console.log(`[CRAWLER DEMO] Dispatched new profile from ${platform}:`, alumniData);
  }
  
  static async stopAutomatedCrawl(platform: "linkedin" | "facebook" | "instagram"): Promise<boolean> {
    console.log(`Stopping automated crawl for ${platform}`);
    
    // In a real application, this would stop a background crawl process
    console.log(`[CRAWLER] Stopping ${platform} crawler. In a production environment, this would terminate the actual API connection.`);
    return Promise.resolve(true);
  }
  
  static async authenticateWithSocialMedia(platform: string, username: string, password: string): Promise<boolean> {
    console.log(`Authentication with ${platform}`);
    // In a real app, this would connect to the platform's API
    console.log(`[CRAWLER] Authenticating with ${platform}. This is a demonstration only.`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }
}
