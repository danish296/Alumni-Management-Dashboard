
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlumniService } from "@/utils/api-service";

export function ExportAlumniButton() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await AlumniService.getAll();
      
      if (error) {
        throw new Error(error);
      }
      
      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no alumni records to export",
          variant: "destructive",
        });
        return;
      }
      
      // Format the data for CSV
      const headers = [
        "Name", 
        "Email", 
        "Batch", 
        "Department", 
        "Company", 
        "Position", 
        "LinkedIn", 
        "Facebook", 
        "Instagram"
      ];
      
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      for (const alumni of data) {
        const hasLinkedIn = alumni.profiles?.includes('linkedin') ? 'Yes' : 'No';
        const hasFacebook = alumni.profiles?.includes('facebook') ? 'Yes' : 'No';
        const hasInstagram = alumni.profiles?.includes('instagram') ? 'Yes' : 'No';
        
        const values = [
          `"${alumni.name || ''}"`,
          `"${alumni.email || ''}"`,
          `"${alumni.batch || ''}"`,
          `"${alumni.department || ''}"`,
          `"${alumni.company || ''}"`,
          `"${alumni.position || ''}"`,
          hasLinkedIn,
          hasFacebook,
          hasInstagram
        ];
        
        csvRows.push(values.join(','));
      }
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and click it to download the file
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `alumni_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Exported ${data.length} alumni records to CSV`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export alumni data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport} 
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}
