import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Generic API request function with error handling
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  body: any = null
): Promise<ApiResponse<T>> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return { data, error: null };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Show toast for API errors
    toast({
      title: "API Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { data: null, error: errorMessage };
  }
}

export interface Alumni {
  _id: string;
  name: string;
  batch: string;
  department: string;
  email: string;
  company: string;
  position: string;
  profiles: string[];
  lastUpdated: string;
}

export interface ImportResult {
  message: string;
  results: {
    added: number;
    duplicates: number;
    errors: number;
  }
}

export interface CrawlResult {
  success: boolean;
  message: string;
  profiles?: number;
  results?: {
    added: number;
    duplicates: number;
    errors: number;
  };
  data?: any;
}

export const AlumniService = {
  // Get all alumni
  getAll: async (): Promise<ApiResponse<Alumni[]>> => {
    return apiRequest<Alumni[]>('/alumni');
  },
  
  // Get alumni by ID
  getById: async (id: string): Promise<ApiResponse<Alumni>> => {
    return apiRequest<Alumni>(`/alumni/${id}`);
  },
  
  // Create new alumni
  create: async (alumni: Omit<Alumni, '_id' | 'lastUpdated'>): Promise<ApiResponse<Alumni>> => {
    return apiRequest<Alumni>('/alumni', 'POST', alumni);
  },
  
  // Update alumni
  update: async (id: string, alumni: Partial<Alumni>): Promise<ApiResponse<Alumni>> => {
    return apiRequest<Alumni>(`/alumni/${id}`, 'PATCH', alumni);
  },
  
  // Delete alumni
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>(`/alumni/${id}`, 'DELETE');
  },
  
  // Import multiple alumni
  importBulk: async (alumni: Omit<Alumni, '_id' | 'lastUpdated'>[]): Promise<ApiResponse<ImportResult>> => {
    return apiRequest<ImportResult>('/alumni/import', 'POST', alumni);
  }
};

export const CrawlerService = {
  // Crawl website with login credentials
  crawlWithLogin: async (url: string, username: string, password: string, keywords?: string[]): Promise<ApiResponse<CrawlResult>> => {
    return apiRequest<CrawlResult>('/crawler/crawl-with-login', 'POST', { 
      url, 
      username, 
      password,
      keywords: keywords || [] 
    });
  }
};