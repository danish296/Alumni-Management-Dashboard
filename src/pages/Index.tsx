
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (user) {
      console.log("User authenticated in Index page:", user);
    }
  }, [user]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to dashboard if user is logged in
  if (user) {
    console.log("User is logged in, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Redirect to login if user is not logged in
  console.log("No user found, redirecting to login from Index");
  return <Navigate to="/login" replace />;
};

export default Index;
