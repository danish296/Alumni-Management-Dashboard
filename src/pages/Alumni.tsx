import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Download, Plus, Facebook, Linkedin, Instagram, FileInput, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlumniFilter } from "@/components/alumni/alumni-filter";
import { AddAlumniForm, AlumniFormData } from "@/components/alumni/add-alumni-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlumniService } from "@/utils/api-service";
import { WebsiteLoginImport } from "@/components/website-login-import";
import { ManualImportForm } from "@/components/alumni/manual-import-form";

interface Alumni {
  id: number | string;
  name: string;
  batch: string;
  department: string;
  email: string;
  company: string;
  position: string;
  lastUpdated: string;
  profiles: string[];
}

const SocialIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "linkedin":
      return <Linkedin className="h-4 w-4 text-blue-600" />;
    case "facebook":
      return <Facebook className="h-4 w-4 text-blue-500" />;
    case "instagram":
      return <Instagram className="h-4 w-4 text-pink-500" />;
    default:
      return null;
  }
};

const Alumni = () => {
  const [alumniData, setAlumniData] = useState<Alumni[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredData, setFilteredData] = useState<Alumni[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    fetchAlumniData();
  }, []);
  
  const fetchAlumniData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await AlumniService.getAll();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch alumni data",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        const formattedData = data.map(alumni => ({
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
        
        setAlumniData(formattedData);
        setFilteredData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching alumni data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch alumni data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const handleNewAlumniDiscovered = (event: CustomEvent<Alumni>) => {
      const newAlumni = event.detail;
      console.log("New alumni discovered event received:", newAlumni);
      
      const exists = alumniData.some(alumni => alumni.email === newAlumni.email);
      
      if (!exists) {
        console.log("Adding new alumni to list:", newAlumni);
        const updatedData = [newAlumni, ...alumniData];
        setAlumniData(updatedData);
        
        applyFilters(searchTerm, updatedData);
        
        toast({
          title: "New Alumni Discovered",
          description: `${newAlumni.name} has been added to the database automatically`,
        });
      } else {
        console.log("Alumni already exists in list:", newAlumni.email);
      }
    };
    
    document.addEventListener('newAlumniDiscovered', handleNewAlumniDiscovered as EventListener);
    console.log("Event listener for newAlumniDiscovered added");
    
    return () => {
      document.removeEventListener('newAlumniDiscovered', handleNewAlumniDiscovered as EventListener);
      console.log("Event listener for newAlumniDiscovered removed");
    };
  }, [alumniData, searchTerm, toast]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, alumniData);
  };
  
  const applyFilters = (term = searchTerm, data = alumniData, filters = {}) => {
    let result = data;
    
    if (term) {
      result = result.filter((alumni) => 
        alumni.name.toLowerCase().includes(term.toLowerCase()) ||
        alumni.email.toLowerCase().includes(term.toLowerCase()) ||
        alumni.company.toLowerCase().includes(term.toLowerCase()) ||
        alumni.department.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((alumni) => 
          alumni[key as keyof Alumni]?.toString().toLowerCase().includes(value.toString().toLowerCase())
        );
      }
    });
    
    setFilteredData(result);
  };
  
  const handleFilterChange = (filters: Record<string, any>) => {
    applyFilters(searchTerm, alumniData, filters);
  };

  const handleAddAlumni = async (formData: AlumniFormData) => {
    try {
      const { data, error } = await AlumniService.create({
        name: formData.name,
        batch: formData.batch,
        department: formData.department,
        email: formData.email,
        company: formData.company,
        position: formData.position,
        profiles: ["linkedin"]
      });
      
      if (error) throw new Error(error);
      
      if (data) {
        const newAlumni = {
          id: data._id,
          name: data.name,
          batch: data.batch,
          department: data.department,
          email: data.email,
          company: data.company,
          position: data.position,
          lastUpdated: "Just now",
          profiles: data.profiles
        };
        
        const updatedData = [newAlumni, ...alumniData];
        setAlumniData(updatedData);
        setFilteredData(updatedData);
        
        toast({
          title: "Alumni Added",
          description: `${formData.name} has been added successfully`,
        });
      }
    } catch (error) {
      console.error("Error adding alumni:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add alumni",
        variant: "destructive",
      });
    }
  };
  
  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    if (format === 'csv') {
      const headers = ['Name', 'Batch', 'Department', 'Email', 'Company', 'Position'];
      const csvContent = [
        headers.join(','),
        ...filteredData.map(alumni => 
          [alumni.name, alumni.batch, alumni.department, alumni.email, alumni.company, alumni.position].join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'alumni_data.csv');
      link.click();
      
      toast({
        title: `Export as ${format.toUpperCase()} successful`,
        description: `${filteredData.length} alumni records exported`,
      });
    }
  };

  const handleImportComplete = (importedData: Alumni[]) => {
    fetchAlumniData();
  };

  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredData.map((alumni) => (
        <Card key={alumni.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-base">{alumni.name}</h3>
                <p className="text-sm text-muted-foreground">{alumni.position} at {alumni.company}</p>
              </div>
              <div className="flex space-x-1">
                {alumni.profiles.map((platform) => (
                  <SocialIcon key={platform} platform={platform} />
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Batch:</span>
                <p>{alumni.batch}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Department:</span>
                <p>{alumni.department}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs">Email:</span>
                <p className="truncate">{alumni.email}</p>
              </div>
              <div className="col-span-2 text-right text-xs text-muted-foreground">
                Updated {alumni.lastUpdated}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {filteredData.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">
          No alumni matching your search criteria
        </div>
      )}
    </div>
  );

  const renderDesktopView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Profiles</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No alumni matching your search criteria
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((alumni) => (
              <TableRow key={alumni.id}>
                <TableCell className="font-medium">{alumni.name}</TableCell>
                <TableCell>{alumni.batch}</TableCell>
                <TableCell>{alumni.department}</TableCell>
                <TableCell>{alumni.company}</TableCell>
                <TableCell>{alumni.position}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {alumni.profiles.map((platform) => (
                      <SocialIcon key={platform} platform={platform} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>{alumni.lastUpdated}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alumni Database</h1>
        <p className="text-muted-foreground">
          View and manage alumni profiles
        </p>
      </div>
      
      <Tabs defaultValue="browse">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse Alumni</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle>Alumni Profiles</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "default"}
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    size={isMobile ? "sm" : "default"} 
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Alumni
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4 items-start flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search alumni by name, email, company..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <AlumniFilter onFilterChange={handleFilterChange} />
              </div>
              
              {isLoading ? (
                <div className="py-10 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-muted-foreground">Loading alumni data...</p>
                </div>
              ) : (
                isMobile ? renderMobileView() : renderDesktopView()
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="import">
          <div className="grid gap-6 md:grid-cols-2">
            <WebsiteLoginImport onImportComplete={handleImportComplete} />
            <ManualImportForm onImportComplete={handleImportComplete} />
          </div>
        </TabsContent>
      </Tabs>
      
      <AddAlumniForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm} 
        onSubmit={handleAddAlumni} 
      />
    </div>
  );
};

export default Alumni;
