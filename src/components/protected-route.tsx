
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader } from "@/components/ui/loader";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      console.log("User authenticated in protected route:", user);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login from protected route");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
