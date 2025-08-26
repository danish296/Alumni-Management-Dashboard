
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export interface AlumniFormData {
  name: string;
  batch: string;
  department: string;
  email: string;
  company: string;
  position: string;
  profiles: string[];
}

interface AddAlumniFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AlumniFormData) => void;
}

export function AddAlumniForm({ open, onOpenChange, onSubmit }: AddAlumniFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AlumniFormData>({
    name: "",
    batch: "",
    department: "",
    email: "",
    company: "",
    position: "",
    profiles: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: keyof AlumniFormData) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileToggle = (profile: string) => {
    setFormData(prev => {
      const profiles = [...prev.profiles];
      if (profiles.includes(profile)) {
        return { ...prev, profiles: profiles.filter(p => p !== profile) };
      } else {
        return { ...prev, profiles: [...profiles, profile] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.batch || !formData.department) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(formData);
    setFormData({
      name: "",
      batch: "",
      department: "",
      email: "",
      company: "",
      position: "",
      profiles: []
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Alumni</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.smith@example.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch">Batch Year *</Label>
              <Input
                id="batch"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                placeholder="2018"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleSelectChange(value, "department")}
              >
                <SelectTrigger id="department">
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Current Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Google"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Current Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Software Engineer"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Social Profiles</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.profiles.includes("linkedin") ? "default" : "outline"}
                size="sm"
                onClick={() => handleProfileToggle("linkedin")}
              >
                LinkedIn
              </Button>
              <Button
                type="button"
                variant={formData.profiles.includes("facebook") ? "default" : "outline"}
                size="sm"
                onClick={() => handleProfileToggle("facebook")}
              >
                Facebook
              </Button>
              <Button
                type="button"
                variant={formData.profiles.includes("instagram") ? "default" : "outline"}
                size="sm"
                onClick={() => handleProfileToggle("instagram")}
              >
                Instagram
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save Alumni</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
