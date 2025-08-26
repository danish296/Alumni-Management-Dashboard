import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  permissions?: {
    canCreateUsers: boolean;
    canDeleteAlumni: boolean;
    canModifySettings: boolean;
    canExportData: boolean;
    canImportData: boolean;
  };
}

interface NewUserFormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff";
  permissions: {
    canCreateUsers: boolean;
    canDeleteAlumni: boolean;
    canModifySettings: boolean;
    canExportData: boolean;
    canImportData: boolean;
  };
}

export function UserManagement() {
  const { user, getAllUsers, addUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newUser, setNewUser] = useState<NewUserFormData>({
    name: "",
    email: "",
    password: "",
    role: "staff",
    permissions: {
      canCreateUsers: false,
      canDeleteAlumni: false,
      canModifySettings: false,
      canExportData: true,
      canImportData: true
    }
  });
  
  // In the useEffect, change:
useEffect(() => {
  const loadUsers = async () => {
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    }
  };  
  loadUsers();
  }, [getAllUsers]);
  
  const handleAddUser = async () => {
    try {
      // Validate form
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast({
          title: "Validation Error",
          description: "All fields are required",
          variant: "destructive"
        });
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }
      
      // Password validation
      if (newUser.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters",
          variant: "destructive"
        });
        return;
      }
      
      // Check if email already exists
      if (users.some(u => u.email === newUser.email)) {
        toast({
          title: "Email Already Exists",
          description: "This email is already registered",
          variant: "destructive"
        });
        return;
      }
      
      await addUser(newUser);
      
      // Refresh user list
      setUsers(getAllUsers());
      
      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "staff",
        permissions: {
          canCreateUsers: false,
          canDeleteAlumni: false,
          canModifySettings: false,
          canExportData: true,
          canImportData: true
        }
      });
      
      setDialogOpen(false);
      
      toast({
        title: "User Added",
        description: `${newUser.name} has been added as ${newUser.role}`,
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      await deleteUser(userId);
      
      // Refresh user list
      setUsers(getAllUsers());
      
      toast({
        title: "User Deleted",
        description: `${userName} has been removed`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      });
    }
  };
  
  const handleRoleChange = (value: "admin" | "staff") => {
    setNewUser(prev => {
      // If changing to admin, set all permissions to true
      if (value === "admin") {
        return {
          ...prev,
          role: value,
          permissions: {
            canCreateUsers: true,
            canDeleteAlumni: true,
            canModifySettings: true,
            canExportData: true,
            canImportData: true
          }
        };
      }
      // If changing to staff, keep permissions but update role
      return {
        ...prev,
        role: value
      };
    });
  };
  
  const handlePermissionChange = (permission: keyof NewUserFormData["permissions"], checked: boolean) => {
    setNewUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));
  };
  
  // Check if current user has permission to manage users
  const canManageUsers = user?.role === "admin" || user?.permissions?.canCreateUsers;
  
  if (!canManageUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            You don't have permission to manage users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Contact an administrator to request access to this feature.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Add and manage users with different access levels
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input 
                  id="name" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input 
                  id="email" 
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input 
                  id="password" 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: "admin" | "staff") => handleRoleChange(value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-medium">
                  Permissions
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="create-users"
                      checked={newUser.permissions.canCreateUsers}
                      onCheckedChange={(checked) => 
                        handlePermissionChange('canCreateUsers', checked as boolean)
                      }
                    />
                    <label htmlFor="create-users" className="text-sm font-medium">
                      Create Users
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="delete-alumni"
                      checked={newUser.permissions.canDeleteAlumni}
                      onCheckedChange={(checked) => 
                        handlePermissionChange('canDeleteAlumni', checked as boolean)
                      }
                    />
                    <label htmlFor="delete-alumni" className="text-sm font-medium">
                      Delete Alumni Profiles
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="modify-settings"
                      checked={newUser.permissions.canModifySettings}
                      onCheckedChange={(checked) => 
                        handlePermissionChange('canModifySettings', checked as boolean)
                      }
                    />
                    <label htmlFor="modify-settings" className="text-sm font-medium">
                      Modify System Settings
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="export-data"
                      checked={newUser.permissions.canExportData}
                      onCheckedChange={(checked) => 
                        handlePermissionChange('canExportData', checked as boolean)
                      }
                    />
                    <label htmlFor="export-data" className="text-sm font-medium">
                      Export Data
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="import-data"
                      checked={newUser.permissions.canImportData}
                      onCheckedChange={(checked) => 
                        handlePermissionChange('canImportData', checked as boolean)
                      }
                    />
                    <label htmlFor="import-data" className="text-sm font-medium">
                      Import Data
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {user.role === "admin" ? (
                        <>
                          <ShieldAlert className="mr-1 h-4 w-4 text-destructive" />
                          <span>Admin</span>
                        </>
                      ) : (
                        <>
                          <Shield className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>Staff</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        {user.permissions?.canCreateUsers && (
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <UserPlus className="h-3 w-3 text-white" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Can create users</TooltipContent>
                          </Tooltip>
                        )}
                        {user.permissions?.canDeleteAlumni && (
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                                <Trash2 className="h-3 w-3 text-white" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Can delete alumni</TooltipContent>
                          </Tooltip>
                        )}
                        {user.permissions?.canModifySettings && (
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                                <ShieldCheck className="h-3 w-3 text-white" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Can modify settings</TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={user.id === "1" || user.id === (localStorage.getItem("almadatum_user") ? JSON.parse(localStorage.getItem("almadatum_user")!).id : "")}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
