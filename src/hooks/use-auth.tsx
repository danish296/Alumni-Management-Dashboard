import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addUser: (userData: Omit<User, "id"> & { password: string }) => Promise<void>;
  getAllUsers: () => User[];
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<(User & { password: string })[]>([]);

  // Initialize default admin user
  const initialAdmin = {
    id: "1",
    name: "Admin User",
    email: "admin@college.edu",
    password: "password",
    role: "admin" as const,
    permissions: {
      canCreateUsers: true,
      canDeleteAlumni: true,
      canModifySettings: true,
      canExportData: true,
      canImportData: true
    }
  };

  // Check for saved auth and users list on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("almadatum_user");
      const savedUsersList = localStorage.getItem("almadatum_users");
      
      // Initialize users list if it doesn't exist
      if (!savedUsersList) {
        console.log("Initializing users list with default admin");
        setUsersList([initialAdmin]);
        localStorage.setItem("almadatum_users", JSON.stringify([initialAdmin]));
      } else {
        try {
          const usersData = JSON.parse(savedUsersList);
          // Validate that the parsed data is an array
          if (Array.isArray(usersData)) {
            setUsersList(usersData);
            console.log("Loaded users list from localStorage:", usersData.length, "users");
          } else {
            console.warn("Invalid users data format, reinitializing");
            setUsersList([initialAdmin]);
            localStorage.setItem("almadatum_users", JSON.stringify([initialAdmin]));
          }
        } catch (error) {
          console.error("Error parsing saved users data:", error);
          setUsersList([initialAdmin]);
          localStorage.setItem("almadatum_users", JSON.stringify([initialAdmin]));
        }
      }
      
      // Load saved user if exists
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Validate user data structure
          if (userData && userData.id && userData.email && userData.name) {
            console.log("Found saved user data:", userData);
            setUser(userData);
          } else {
            console.warn("Invalid saved user data, clearing");
            localStorage.removeItem("almadatum_user");
          }
        } catch (error) {
          console.error("Error parsing saved user data:", error);
          localStorage.removeItem("almadatum_user");
        }
      } else {
        console.log("No saved user data found");
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      // Fallback to default state
      setUsersList([initialAdmin]);
      localStorage.setItem("almadatum_users", JSON.stringify([initialAdmin]));
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    setLoading(true);
    try {
      console.log("Attempting login with:", email);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials against the users list
      const foundUser = usersList.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        // Create a copy without the password for security
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          permissions: foundUser.permissions
        };
        
        console.log("Login successful, setting user data:", userData);
        setUser(userData);
        
        try {
          localStorage.setItem("almadatum_user", JSON.stringify(userData));
        } catch (error) {
          console.error("Error saving user to localStorage:", error);
          // Continue with login even if localStorage fails
        }
      } else {
        console.error("Invalid credentials for email:", email);
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out");
    setUser(null);
    try {
      localStorage.removeItem("almadatum_user");
    } catch (error) {
      console.error("Error clearing user from localStorage:", error);
    }
  };

  const addUser = async (userData: Omit<User, "id"> & { password: string }) => {
    // Validation
    if (!userData.name || !userData.email || !userData.password) {
      throw new Error("Name, email, and password are required");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error("Invalid email format");
    }

    // Password length validation
    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Check for duplicate email
    const existingUser = usersList.find(u => 
      u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a unique ID
      const existingIds = usersList.map(u => parseInt(u.id)).filter(id => !isNaN(id));
      const newId = (Math.max(0, ...existingIds) + 1).toString();
      
      const newUser = {
        ...userData,
        id: newId,
        email: userData.email.toLowerCase(), // Normalize email to lowercase
      };
      
      const updatedUsers = [...usersList, newUser];
      setUsersList(updatedUsers);
      
      try {
        localStorage.setItem("almadatum_users", JSON.stringify(updatedUsers));
        console.log("User added successfully:", newUser.name, newUser.email);
      } catch (error) {
        console.error("Error saving users to localStorage:", error);
        throw new Error("Failed to save user data");
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  };

  const getAllUsers = () => {
    try {
      // Return users without passwords for security
      return usersList.map(({ password, ...user }) => user);
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  };

  const deleteUser = async (id: string) => {
    if (!id) {
      throw new Error("User ID is required");
    }

    // Prevent deleting your own account
    if (user?.id === id) {
      throw new Error("You cannot delete your own account");
    }
    
    // Prevent deleting the initial admin
    if (id === "1") {
      throw new Error("Cannot delete the primary administrator account");
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userToDelete = usersList.find(u => u.id === id);
      if (!userToDelete) {
        throw new Error("User not found");
      }
      
      const updatedUsers = usersList.filter(u => u.id !== id);
      setUsersList(updatedUsers);
      
      try {
        localStorage.setItem("almadatum_users", JSON.stringify(updatedUsers));
        console.log("User deleted successfully:", userToDelete.name);
      } catch (error) {
        console.error("Error saving users after deletion:", error);
        throw new Error("Failed to save user data after deletion");
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user, 
    loading, 
    login, 
    logout,
    addUser,
    getAllUsers,
    deleteUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the User interface for use in other components
export type { User };