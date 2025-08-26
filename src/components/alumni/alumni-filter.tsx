
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterValues {
  batch?: string;
  department?: string;
  company?: string;
}

interface AlumniFilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export function AlumniFilter({ onFilterChange }: AlumniFilterProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    const newActiveFilters: string[] = [];
    
    if (filters.batch) newActiveFilters.push(`Batch: ${filters.batch}`);
    if (filters.department) newActiveFilters.push(`Department: ${filters.department}`);
    if (filters.company) newActiveFilters.push(`Company: ${filters.company}`);
    
    setActiveFilters(newActiveFilters);
    onFilterChange(filters);
    setOpen(false);
  };

  const clearFilters = () => {
    setFilters({});
    setActiveFilters([]);
    onFilterChange({});
  };

  const removeFilter = (filter: string) => {
    const key = filter.split(':')[0].trim().toLowerCase() as keyof FilterValues;
    const newFilters = { ...filters };
    delete newFilters[key];
    
    setFilters(newFilters);
    setActiveFilters(activeFilters.filter(f => !f.startsWith(filter.split(':')[0])));
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="grid gap-4">
              <h3 className="font-medium">Filter Alumni</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch Year</label>
                <Select 
                  value={filters.batch} 
                  onValueChange={(value) => handleFilterChange("batch", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2016">2016</SelectItem>
                    <SelectItem value="2017">2017</SelectItem>
                    <SelectItem value="2018">2018</SelectItem>
                    <SelectItem value="2019">2019</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select 
                  value={filters.department}
                  onValueChange={(value) => handleFilterChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input 
                  placeholder="Company name" 
                  value={filters.company || ''} 
                  onChange={(e) => handleFilterChange("company", e.target.value)}
                />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter}
              <button onClick={() => removeFilter(filter)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {activeFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
