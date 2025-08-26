import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Check, X, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlumniService } from "@/utils/api-service";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ManualImportFormProps {
  onImportComplete: (data: any[]) => void;
}

export function ManualImportForm({ onImportComplete }: ManualImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{ valid: boolean; message: string; count?: number }>({ valid: false, message: "" });
  const [keywordFilter, setKeywordFilter] = useState<string>("");
  const [useKeywordFilter, setUseKeywordFilter] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["name", "email", "batch", "department", "company", "position"]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Reset validation
      setValidationResults({ valid: false, message: "" });
      
      // Validate file type
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      setFile(selectedFile);
      validateFile(selectedFile);
    }
  };

  const validateFile = async (file: File) => {
    setIsValidating(true);
    
    try {
      // Read file
      const text = await file.text();
      const lines = text.split('\n');
      
      if (lines.length <= 1) {
        setValidationResults({
          valid: false,
          message: "The file appears to be empty or contains only headers",
        });
        return;
      }
      
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      setAvailableColumns(headers);
      
      // Check for required columns
      const requiredColumns = ['name', 'email'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        setValidationResults({
          valid: false,
          message: `Missing required columns: ${missingColumns.join(', ')}`,
        });
        return;
      }
      
      // Count valid records
      let validRecords = 0;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) validRecords++;
      }
      
      setValidationResults({
        valid: true,
        message: "File validated successfully",
        count: validRecords,
      });
      
    } catch (error) {
      console.error("Validation error:", error);
      setValidationResults({
        valid: false,
        message: "Error validating file",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleImport = async () => {
    if (!file || !validationResults.valid) return;
    
    setIsLoading(true);
    
    try {
      // Read file
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      // Map indices for fields
      const nameIndex = headers.indexOf('name');
      const emailIndex = headers.indexOf('email');
      const batchIndex = headers.indexOf('batch') !== -1 ? headers.indexOf('batch') : headers.indexOf('year');
      const deptIndex = headers.indexOf('department') !== -1 ? headers.indexOf('department') : headers.indexOf('dept');
      const companyIndex = headers.indexOf('company') !== -1 ? headers.indexOf('company') : headers.indexOf('organization');
      const positionIndex = headers.indexOf('position') !== -1 ? headers.indexOf('position') : headers.indexOf('job title');
      const profilesIndex = headers.indexOf('profiles');
      
      // Get keywords for filtering (if enabled)
      const keywords = useKeywordFilter && keywordFilter ? 
        keywordFilter.toLowerCase().split(',').map(k => k.trim()).filter(k => k !== '') : 
        [];
      
      // Parse data
      const parsedData = [];
      let filteredOutCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        
        // Skip if name or email is missing
        if (!values[nameIndex]?.trim() || !values[emailIndex]?.trim()) continue;
        
        // Apply keyword filtering if enabled
        if (keywords.length > 0) {
          // Check if any of the keywords is found in any of the selected columns
          const rowText = selectedColumns
            .map(col => {
              const colIndex = headers.indexOf(col);
              return colIndex !== -1 && values[colIndex] ? values[colIndex].toLowerCase() : '';
            })
            .join(' ');
            
          // Skip this row if none of the keywords are found
          if (!keywords.some(keyword => rowText.includes(keyword))) {
            filteredOutCount++;
            continue;
          }
        }
        
        const profiles = profilesIndex !== -1 && values[profilesIndex] 
          ? values[profilesIndex].split(';').map(p => p.trim().toLowerCase())
          : [];
          
        // Only include valid social platforms
        const validProfiles = profiles.filter(p => 
          ['linkedin', 'facebook', 'instagram'].includes(p)
        );
        
        const record = {
          name: nameIndex !== -1 ? values[nameIndex]?.trim() : "Unknown",
          email: emailIndex !== -1 ? values[emailIndex]?.trim() : `unknown${i}@example.com`,
          batch: batchIndex !== -1 && values[batchIndex] ? values[batchIndex]?.trim() : "Unknown",
          department: deptIndex !== -1 && values[deptIndex] ? values[deptIndex]?.trim() : "Unknown",
          company: companyIndex !== -1 && values[companyIndex] ? values[companyIndex]?.trim() : "Unknown",
          position: positionIndex !== -1 && values[positionIndex] ? values[positionIndex]?.trim() : "Unknown",
          profiles: validProfiles
        };
        
        parsedData.push(record);
      }
      
      // Send to API
      const { data, error } = await AlumniService.importBulk(parsedData);
      
      if (error) throw new Error(error);
      
      if (data) {
        const filterMessage = useKeywordFilter && keywordFilter ? 
          `(${filteredOutCount} filtered out by keyword)` : '';
          
        toast({
          title: "Import successful",
          description: `${data.results.added} alumni records imported ${filterMessage} (${data.results.duplicates} duplicates, ${data.results.errors} errors)`,
        });
        
        // Refresh alumni data
        const { data: alumniData } = await AlumniService.getAll();
        if (alumniData) {
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
        }
        
        // Reset form
        setFile(null);
        setValidationResults({ valid: false, message: "" });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import alumni data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Alumni Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Import alumni data from a CSV file. The file must include at least 'name' and 'email' columns.
        </p>
        
        <div className="grid gap-4">
          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <Input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label 
              htmlFor="csv-file-input"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm font-medium mb-1">
                {file ? file.name : "Click to select a CSV file"}
              </span>
              <span className="text-xs text-muted-foreground">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "or drag and drop file here"}
              </span>
            </label>
          </div>
          
          {isValidating && (
            <div className="flex items-center justify-center py-2">
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
              <span className="text-sm">Validating file...</span>
            </div>
          )}
          
          {validationResults.message && (
            <div className={`flex items-start p-3 rounded-md ${validationResults.valid ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
              {validationResults.valid ? (
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">{validationResults.message}</p>
                {validationResults.valid && validationResults.count !== undefined && (
                  <p className="text-xs mt-1">Found {validationResults.count} records to import</p>
                )}
              </div>
            </div>
          )}
          
          {validationResults.valid && (
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="use-keyword-filter" 
                  checked={useKeywordFilter}
                  onCheckedChange={(checked) => setUseKeywordFilter(checked === true)}
                />
                <Label htmlFor="use-keyword-filter" className="font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter by keyword
                </Label>
              </div>
              
              {useKeywordFilter && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyword-input">Enter keywords (comma separated)</Label>
                    <Input
                      id="keyword-input"
                      placeholder="e.g. engineering, 2022, Microsoft"
                      value={keywordFilter}
                      onChange={(e) => setKeywordFilter(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only records containing any of these keywords will be imported
                    </p>
                  </div>
                  
                  <div>
                    <Label className="block mb-2">Search in columns:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableColumns.map(column => (
                        <div key={column} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`col-${column}`}
                            checked={selectedColumns.includes(column)}
                            onCheckedChange={() => handleColumnToggle(column)}
                            disabled={['name', 'email'].includes(column)} // Required columns
                          />
                          <Label htmlFor={`col-${column}`} className="text-sm">
                            {column}
                            {['name', 'email'].includes(column) && " (required)"}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <Button 
            onClick={handleImport} 
            disabled={!file || !validationResults.valid || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
                Importing...
              </>
            ) : (
              <>Import Alumni Data</>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">CSV Format Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>First row must contain column headers</li>
            <li>Required columns: name, email</li>
            <li>Optional columns: batch/year, department/dept, company/organization, position/job title</li>
            <li>For social profiles use 'profiles' column with values separated by semicolons (e.g., "linkedin;facebook")</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}